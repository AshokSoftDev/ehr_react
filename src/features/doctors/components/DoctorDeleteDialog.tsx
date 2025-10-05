import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import type { Doctor } from '../types/doctor.types';

interface DoctorDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DoctorDeleteDialog: React.FC<DoctorDeleteDialogProps> = ({
  open,
  onOpenChange,
  doctor,
  onConfirm,
  isDeleting,
}) => {
  if (!doctor) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                Are you sure you want to delete this doctor?
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="my-4 p-4 bg-muted rounded-lg">
          <p className="font-medium">{doctor.displayName}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {doctor.email} • {doctor.specialty}
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Doctor'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
