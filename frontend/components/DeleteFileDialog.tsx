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
import { Trash2 } from 'lucide-react';

interface DeleteFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteFileDialog({
  open,
  onOpenChange,
  fileName,
  onConfirm,
  isDeleting = false,
}: DeleteFileDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-950">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-4">
            Are you sure you want to move <span className="font-semibold text-foreground">{fileName}</span> to trash?
            <br />
            <br />
            The file will be safely stored in the trash folder and can be recovered if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? 'Moving to Trash...' : 'Move to Trash'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
