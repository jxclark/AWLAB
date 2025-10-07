'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, AlertCircle, Plus, Edit, Trash2, User as UserIcon, RotateCcw, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'USER',
  });


  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      // Fetch active or all users based on toggle
      const url = showInactive 
        ? 'http://localhost:5000/api/users' 
        : 'http://localhost:5000/api/users?isActive=true';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      // Backend returns { users: [], total, page, limit, totalPages }
      const usersData = Array.isArray(data.data.users) ? data.data.users : [];
      console.log('Fetched users:', usersData.length);
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (err: unknown) {
      setError((err as Error).message);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    fetchUsers();
  }, [showInactive, fetchUsers]);

  const generatePassword = () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleCreateClick = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'USER',
    });
    setCreateDialogOpen(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }

      setCreateDialogOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('accessToken');
      const updateData: Partial<UserFormData> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user');
      }

      setEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('accessToken');
      console.log('Deleting user:', selectedUser.id);
      
      const response = await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('Delete response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: unknown) {
      console.error('Delete error:', err);
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreUser = async (user: User) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to restore user');
      }

      fetchUsers();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const handlePermanentDeleteClick = (user: User) => {
    setSelectedUser(user);
    setPermanentDeleteDialogOpen(true);
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!selectedUser) return;

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/users/${selectedUser.id}/permanent`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to permanently delete user');
      }

      setPermanentDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
      ADMIN: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      USER: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role as keyof typeof styles]}`}>
        {role.replace('_', ' ')}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={handleCreateClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Create User
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Bar and Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={() => setShowInactive(!showInactive)} 
          variant={showInactive ? "default" : "outline"}
        >
          {showInactive ? 'Show Active Only' : 'Show All Users'}
        </Button>
        <Button onClick={fetchUsers} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Users List */}
      <Card>
        <CardContent className="p-0">
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_200px_150px_150px_150px] gap-4 px-4 py-3 border-b bg-slate-50 dark:bg-slate-900 font-medium text-sm">
            <div>User</div>
            <div>Email</div>
            <div>Role</div>
            <div>Created</div>
            <div>Actions</div>
          </div>

          {/* User Rows */}
          <div className="divide-y">
            {filteredUsers.length === 0 ? (
              <div className="px-4 py-12 text-center text-slate-500">
                {searchQuery ? 'No users found matching your search' : 'No users found'}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`grid grid-cols-[1fr_200px_150px_150px_150px] gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${!user.isActive ? 'opacity-50 bg-slate-50 dark:bg-slate-900' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${user.isActive ? 'bg-indigo-100 dark:bg-indigo-950' : 'bg-slate-200 dark:bg-slate-800'}`}>
                      <UserIcon className={`h-4 w-4 ${user.isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {user.firstName} {user.lastName}
                        {!user.isActive && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">ID: {user.id}</div>
                    </div>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm flex items-center truncate">
                    {user.email}
                  </div>
                  <div className="flex items-center">
                    {getRoleBadge(user.role)}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm flex items-center">
                    {formatDate(user.createdAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    {user.isActive ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(user);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(user);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreUser(user);
                          }}
                          className="gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Restore
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePermanentDeleteClick(user);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="text-sm text-slate-600 dark:text-slate-400">
        {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        {searchQuery && ` matching &quot;{searchQuery}&quot;`}
      </div>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. They will receive their login credentials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const newPassword = generatePassword();
                      setFormData({ ...formData, password: newPassword });
                      // Show password temporarily
                      const input = document.getElementById('password') as HTMLInputElement;
                      if (input) {
                        input.type = 'text';
                        setTimeout(() => { input.type = 'password'; }, 3000);
                      }
                    }}
                    className="whitespace-nowrap gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Click Generate for a strong random password</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Leave password blank to keep current password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (optional)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-950">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle>Deactivate User?</DialogTitle>
            </div>
            <DialogDescription className="pt-4">
              Are you sure you want to deactivate <span className="font-semibold text-foreground">{selectedUser?.firstName} {selectedUser?.lastName}</span>?
              <br />
              <br />
              The user will be marked as inactive and won&apos;t be able to log in. You can restore this user later from the &quot;Show All Users&quot; view.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? 'Deactivating...' : 'Deactivate User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog open={permanentDeleteDialogOpen} onOpenChange={setPermanentDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-950">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle>Permanently Delete User?</DialogTitle>
            </div>
            <DialogDescription className="pt-4">
              Are you sure you want to <span className="font-semibold text-red-600">permanently delete</span> <span className="font-semibold text-foreground">{selectedUser?.firstName} {selectedUser?.lastName}</span>?
              <br />
              <br />
              <span className="text-red-600 font-semibold">⚠️ WARNING: This action cannot be undone!</span>
              <br />
              <br />
              All user data including login history, sessions, and account information will be permanently removed from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermanentDeleteDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handlePermanentDeleteConfirm}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? 'Permanently Deleting...' : 'Permanently Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
