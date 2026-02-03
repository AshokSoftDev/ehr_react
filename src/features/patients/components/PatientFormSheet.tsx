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
      <SheetContent side="right" preventClose className="gap-0 w-full sm:w-[500px] lg:w-[600px] sm:max-w-none p-0 flex flex-col h-full">
        <SheetHeader className="px-2 border-b shrink-0">
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
        <div className="flex-1 flex flex-col overflow-hidden">
          <PatientForm
            patient={patient}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
