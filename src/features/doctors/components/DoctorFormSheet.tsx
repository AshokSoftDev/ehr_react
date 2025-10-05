import React from 'react';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../../components/ui/sheet';
import { DoctorForm } from './DoctorForm';
import type { Doctor } from '../types/doctor.types';
import type { DoctorFormData } from '../schemas/doctor.schema';

interface DoctorFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: Doctor | null;
  onSubmit: (data: DoctorFormData) => void;
  isLoading?: boolean;
}

export const DoctorFormSheet: React.FC<DoctorFormSheetProps> = ({
  open,
  onOpenChange,
  doctor,
  onSubmit,
  isLoading,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[540px] lg:w-[720px] sm:max-w-none p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>{doctor ? 'Edit Doctor' : 'Add New Doctor'}</SheetTitle>
              <SheetDescription>
                {doctor ? 'Update doctor information' : 'Fill in the details to create a new doctor'}
              </SheetDescription>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>
        <DoctorForm
          doctor={doctor}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </SheetContent>
    </Sheet>
  );
};
