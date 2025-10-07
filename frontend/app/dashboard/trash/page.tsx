'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Search, Loader2, AlertCircle, RotateCcw, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TrashFile {
  id: number;
  originalFolder: string;
  originalFileName: string;
  deletedAt: string;
  deletedTimestamp: number;
  trashFileName: string;
  size: number;
}

export default function TrashPage() {
  const [files, setFiles] = useState<TrashFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<TrashFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<TrashFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchTrashFiles();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = files.filter(file =>
        file.originalFileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.originalFolder.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFiles(filtered);
    } else {
      setFilteredFiles(files);
    }
  }, [searchQuery, files]);

  const fetchTrashFiles = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/trash', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch trash files');
      }

      setFiles(data.data);
      setFilteredFiles(data.data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreClick = (file: TrashFile) => {
    setSelectedFile(file);
    setRestoreDialogOpen(true);
  };

  const handleDeleteClick = (file: TrashFile) => {
    setSelectedFile(file);
    setDeleteDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/trash/restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: selectedFile.deletedTimestamp,
          originalFolder: selectedFile.originalFolder,
          originalFileName: selectedFile.originalFileName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to restore file');
      }

      setRestoreDialogOpen(false);
      setSelectedFile(null);
      fetchTrashFiles();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:5000/api/trash/${selectedFile.deletedTimestamp}/${encodeURIComponent(selectedFile.originalFolder)}/${encodeURIComponent(selectedFile.originalFileName)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to permanently delete file');
      }

      setDeleteDialogOpen(false);
      setSelectedFile(null);
      fetchTrashFiles();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
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
        <h1 className="text-3xl font-bold tracking-tight">Trash</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Deleted files can be restored or permanently deleted
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
            placeholder="Search deleted files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchTrashFiles} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Trash File List */}
      <Card>
        <CardContent className="p-0">
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_150px_200px_150px_150px] gap-4 px-4 py-3 border-b bg-slate-50 dark:bg-slate-900 font-medium text-sm">
            <div>File Name</div>
            <div>Original Folder</div>
            <div>Deleted</div>
            <div>Size</div>
            <div>Actions</div>
          </div>

          {/* File Rows */}
          <div className="divide-y">
            {filteredFiles.length === 0 ? (
              <div className="px-4 py-12 text-center text-slate-500">
                {searchQuery ? 'No files found matching your search' : 'Trash is empty'}
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="grid grid-cols-[1fr_150px_200px_150px_150px] gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span className="font-medium truncate">{file.originalFileName}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm flex items-center">
                    {file.originalFolder}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm flex items-center">
                    {formatDate(file.deletedAt)}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm flex items-center">
                    {formatFileSize(file.size)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreClick(file)}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(file)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="text-sm text-slate-600 dark:text-slate-400">
        {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} in trash
        {searchQuery && ` matching &quot;{searchQuery}&quot;`}
      </div>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-950">
                <RotateCcw className="h-6 w-6 text-green-600" />
              </div>
              <AlertDialogTitle>Restore File?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4">
              Are you sure you want to restore <span className="font-semibold text-foreground">{selectedFile?.originalFileName}</span>?
              <br />
              <br />
              The file will be restored to: <span className="font-semibold text-foreground">{selectedFile?.originalFolder}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRestoreConfirm();
              }}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
            >
              {isProcessing ? 'Restoring...' : 'Restore File'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-950">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle>Permanently Delete?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4">
              Are you sure you want to <span className="font-semibold text-red-600">permanently delete</span> <span className="font-semibold text-foreground">{selectedFile?.originalFileName}</span>?
              <br />
              <br />
              <span className="text-red-600 font-semibold">This action cannot be undone!</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isProcessing ? 'Deleting...' : 'Permanently Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
