'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Folder, Search, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FolderInfo {
  name: string;
  modifiedDate: string;
  fileCount: number;
}

export default function FilesPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [filteredFolders, setFilteredFolders] = useState<FolderInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = folders.filter(folder =>
        folder.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFolders(filtered);
    } else {
      setFilteredFolders(folders);
    }
  }, [searchQuery, folders]);

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/files/folders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch folders');
      }

      setFolders(data.data);
      setFilteredFolders(data.data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatFileSize = (count: number) => {
    return `${count} file${count !== 1 ? 's' : ''}`;
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Client Assessments</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Browse assessment folders by date
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchFolders} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Folder List - Windows Explorer Style */}
      <Card>
        <CardContent className="p-0">
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_200px_150px] gap-4 px-4 py-3 border-b bg-slate-50 dark:bg-slate-900 font-medium text-sm">
            <div>Name</div>
            <div>Date Modified</div>
            <div>Type</div>
          </div>

          {/* Folder Rows */}
          <div className="divide-y">
            {filteredFolders.length === 0 ? (
              <div className="px-4 py-12 text-center text-slate-500">
                {searchQuery ? 'No folders found matching your search' : 'No folders available'}
              </div>
            ) : (
              filteredFolders.map((folder) => (
                <div
                  key={folder.name}
                  onClick={() => router.push(`/dashboard/files/${folder.name}`)}
                  className="grid grid-cols-[1fr_200px_150px] gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Folder className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    <span className="font-medium">{folder.name}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm">
                    {formatDate(folder.modifiedDate)}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm">
                    {formatFileSize(folder.fileCount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="text-sm text-slate-600 dark:text-slate-400">
        {filteredFolders.length} folder{filteredFolders.length !== 1 ? 's' : ''}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>
    </div>
  );
}
