'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ExternalLink } from 'lucide-react';

export default function PDFViewerPage() {
  const params = useParams();
  const router = useRouter();
  const folderName = decodeURIComponent(params.folderName as string);
  const fileName = decodeURIComponent(params.fileName as string);

  const getPDFUrl = () => {
    const token = localStorage.getItem('accessToken');
    return `http://localhost:5000/api/files/download/${encodeURIComponent(folderName)}/${encodeURIComponent(fileName)}?token=${token}`;
  };

  const handleOpenNewTab = () => {
    window.open(getPDFUrl(), '_blank');
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white dark:bg-slate-950 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/files/${folderName}`)}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Files
          </Button>
          <div className="border-l pl-4">
            <h1 className="font-semibold text-lg truncate max-w-md">{fileName}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">{folderName}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenNewTab}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open in New Tab
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-slate-100 dark:bg-slate-900">
        <iframe
          src={getPDFUrl()}
          className="w-full h-full border-0"
          title={fileName}
        />
      </div>
    </div>
  );
}
