'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, Search, Loader2, AlertCircle, ChevronLeft, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DeleteFileDialog } from '@/components/DeleteFileDialog';

interface FileInfo {
  name: string;
  size: number;
  modifiedDate: string;
  type: string;
  path: string;
}

interface PaginatedResponse {
  files: FileInfo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function FolderPage() {
  const params = useParams();
  const router = useRouter();
  const folderName = params.folderName as string;
  
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 25;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileInfo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    if (searchQuery) {
      const filtered = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFiles(filtered);
    } else {
      setFilteredFiles(files);
    }
  }, [searchQuery, files]);

  const fetchFiles = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:5000/api/files/folders/${folderName}?page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch files');
      }

      const result: PaginatedResponse = data.data;
      setFiles(result.files);
      setFilteredFiles(result.files);
      setCurrentPage(result.page);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderName]);

  const handleOpenFile = (file: FileInfo) => {
    // Navigate to PDF viewer page
    router.push(`/dashboard/files/${folderName}/view/${encodeURIComponent(file.name)}`);
  };

  const handleDeleteClick = (file: FileInfo) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:5000/api/files/${folderName}/${encodeURIComponent(fileToDelete.name)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete file');
      }

      // Close dialog and refresh file list
      setDeleteDialogOpen(false);
      setFileToDelete(null);
      fetchFiles(currentPage);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsDeleting(false);
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isAdmin = user && ['SUPER_ADMIN', 'ADMIN'].includes(user.role);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/files')}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Folders
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{folderName}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Assessment files for {folderName}
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
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => fetchFiles(currentPage)} variant="outline">
          Refresh
        </Button>
      </div>

      {/* File List - Windows Explorer Style */}
      <Card>
        <CardContent className="p-0">
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_200px_150px_100px] gap-4 px-4 py-3 border-b bg-slate-50 dark:bg-slate-900 font-medium text-sm">
            <div>Name</div>
            <div>Date Modified</div>
            <div>Type</div>
            <div>Size</div>
          </div>

          {/* File Rows */}
          <div className="divide-y">
            {filteredFiles.length === 0 ? (
              <div className="px-4 py-12 text-center text-slate-500">
                {searchQuery ? 'No files found matching your search' : 'No files in this folder'}
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div
                  key={file.name}
                  className="grid grid-cols-[1fr_200px_150px_100px] gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <button
                      onClick={() => handleOpenFile(file)}
                      className="font-medium text-left hover:text-indigo-600 hover:underline transition-colors cursor-pointer"
                    >
                      {file.name}
                    </button>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm flex items-center">
                    {formatDate(file.modifiedDate)}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm flex items-center">
                    PDF File
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-2">
                    <span>{formatFileSize(file.size)}</span>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(file);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!searchQuery && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total} files
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFiles(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFiles(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Summary */}
      {searchQuery && (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} matching &quot;{searchQuery}&quot;
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteFileDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        fileName={fileToDelete?.name || ''}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
