import { format } from 'date-fns';
import { User, Calendar, Phone, MapPin, Edit, Trash, ArrowRight } from 'lucide-react';
import type { Patient } from '../types/patient.types';
import { Button } from '@/components/ui/button';

interface PatientListProps {
  patients: Patient[];
  isLoading: boolean;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  navigate: (path: string) => void;
}

export function PatientList({ patients, isLoading, onEdit, onDelete, navigate }: PatientListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 w-full bg-muted animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground border rounded-md border-dashed">
        No patients found for the selected filters.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-card border rounded-md overflow-hidden">
        <div className="divide-y divide-border">
          {patients.map((patient) => (
            <PatientListItem
              key={patient.patient_id}
              patient={patient}
              onEdit={onEdit}
              onDelete={onDelete}
              navigate={navigate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PatientListItem({
  patient,
  onEdit,
  onDelete,
  navigate,
}: {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  navigate: (path: string) => void;
}) {
  const parts = [patient.area, patient.city, patient.state].filter(Boolean);
  if (patient.pincode) parts.push(patient.pincode);
  const address = parts.join(', ');

  const handleOpenPatient = () => {
    navigate(`/main/patients/${patient.patient_id}/dashboard`);
  };

  return (
    <div className="group/item relative flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-muted/30 transition-colors gap-4">
      <div className="flex-1 flex items-center gap-4 pl-2 cursor-pointer" onClick={handleOpenPatient}>
        {/* Info Layout */}
        <div className="flex-1 space-y-2">
          {/* Top Row: Patient Info */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <button
              onClick={(e) => { e.stopPropagation(); handleOpenPatient(); }}
              className="font-bold text-base text-foreground group-hover/item:text-blue-600 hover:text-blue-600 dark:group-hover/item:text-blue-400 dark:hover:text-blue-400 hover:underline flex items-center gap-2 transition-colors cursor-pointer"
            >
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full shrink-0">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              {patient.title ? `${patient.title} ` : ''}
              {patient.firstName} {patient.lastName}
            </button>
            <span className="text-muted-foreground font-medium">({patient.mrn})</span>
            <span className="text-xs text-muted-foreground">
              {patient.age} yrs • {patient.gender}
            </span>
          </div>

          {/* Bottom Row: Demographics & Contact */}
          <div className="flex items-center gap-4 text-xs flex-wrap ml-10">
            {patient.dateOfBirth && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-medium">{format(new Date(patient.dateOfBirth), 'dd/MM/yyyy')}</span>
              </div>
            )}

            {patient.dateOfBirth && <span className="text-muted-foreground">|</span>}

            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-indigo-500" />
              <span className="font-mono">{patient.mobileNumber || '-'}</span>
            </div>

            {address && <span className="text-muted-foreground">|</span>}

            {address && (
              <div className="flex items-center gap-1 max-w-[300px]" title={address}>
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate text-muted-foreground">{address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1 pl-4 border-l border-border/50 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted/50 text-primary hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(patient);
          }}
          title="Edit patient"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-muted/50 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(patient);
          }}
          title="Delete patient"
        >
          <Trash className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted/50 text-muted-foreground ml-1"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenPatient();
          }}
          title="Open Dashboard"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
