import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { PatientForm } from './PatientForm';
import type { Patient } from '../types/patient.types';
import type { PatientFormData } from '../schemas/patient.schema';

interface PatientFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
  onSubmit: (data: PatientFormData) => void;
  isLoading?: boolean;
}

export const PatientFormSheet: React.FC<PatientFormSheetProps> = ({ open, onOpenChange, patient, onSubmit, isLoading }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[540px] lg:w-[720px] sm:max-w-none p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>{patient ? 'Edit Patient' : 'Add New Patient'}</SheetTitle>
              <SheetDescription>
                {patient ? 'Update patient information' : 'Fill in the details to create a new patient'}
              </SheetDescription>
            </div>
            {/* <button
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button> */}
          </div>
        </SheetHeader>
        <PatientForm
          patient={patient}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </SheetContent>
    </Sheet>
  );
};
