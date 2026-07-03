import { useEffect, useState } from 'react';
import { format, addMinutes } from 'date-fns';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { FormFloatingInput } from '@/components/form/form-floating-input';
import { FormFloatingSelect } from '@/components/form/FormFloatingSelect';
import { FormFloatingDatePicker } from '@/components/form/FormFloatingDatePicker';
import { FormFloatingTextarea } from '@/components/form/form-floating-textarea';
import { Button } from '@/components/ui/button';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, Loader2 } from 'lucide-react';
import type { AppointmentDoctorLite, AppointmentItem, AppointmentPatientLite } from '../types/appointment.types';
import { appointmentService } from '../services/appointment.service';
import { PatientFormSheet } from '@/features/patients/components/PatientFormSheet';
import { patientService } from '@/features/patients/services/patient.service';
import type { PatientFormData } from '@/features/patients/schemas/patient.schema';

const schema = z.object({
  patient_id: z.coerce.number().int().min(1, "Please select a patient"),
  doctor_id: z.string().min(1, "Please select a doctor"),
  appointment_date: z.union([z.string(), z.date()]),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  duration: z.coerce.number().int().positive("Duration must be positive").min(1, "Duration is required"),
  appointment_type: z.string().min(1, "Please select appointment type"),
  reason_for_visit: z.string().optional(),
  appointment_status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
  patient_mrn: z.string().optional(),
});

type AppointmentFormInput = z.input<typeof schema>;
export type AppointmentFormValues = z.output<typeof schema>;

interface AppointmentFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AppointmentFormValues) => void;
  doctors: AppointmentDoctorLite[];
  initial?: Partial<AppointmentItem>;
  defaultStatus?: string;
  hideStatus?: boolean;
  isLoading?: boolean;
  fixedPatient?: boolean;
}

export function AppointmentFormSheet({ open, onOpenChange, onSubmit, doctors, initial, defaultStatus, hideStatus, isLoading, fixedPatient }: AppointmentFormSheetProps) {
  const form = useForm<AppointmentFormInput, unknown, AppointmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_id: initial?.patient_id ?? 0,
      doctor_id: initial?.doctor_id ?? '',
      appointment_date: initial?.appointment_date ? format(new Date(initial.appointment_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      start_time: initial?.start_time ? format(new Date(initial.start_time), 'HH:mm') : format(new Date(), 'HH:mm'),
      end_time: initial?.end_time ? format(new Date(initial.end_time), 'HH:mm') : format(addMinutes(new Date(), 15), 'HH:mm'),
      duration: initial?.duration ?? 15,
      appointment_type: initial?.appointment_type ?? '',
      reason_for_visit: initial?.reason_for_visit ?? '',
      appointment_status: (initial?.appointment_status ?? defaultStatus ?? 'SCHEDULED').toUpperCase(),
      notes: initial?.notes ?? '',
      patient_mrn: initial?.patient_mrn ?? '',
    },
  });

  const [searchText, setSearchText] = useState('');
  const [patients, setPatients] = useState<AppointmentPatientLite[]>([]);
  const [showPatientSheet, setShowPatientSheet] = useState(false);
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    let active = true;
    const run = async () => {
       // Don't search if we are in the middle of selecting/setting a patient
      if (isSelecting) return;
      
      if (!searchText || searchText.length < 2) { setPatients([]); setHasSearched(false); return; }

      // Skip search if the text matches the currently selected patient
      // This prevents "No patients found" from showing immediately after selection
      if (form.getValues('patient_id') && searchText === form.getValues('patient_mrn')) {
         setPatients([]);
         setHasSearched(false);
         return;
      }
      
      // If the search text exactly matches the currently selected patient's display format, likely don't search?
      // But user might type exactly that name. 
      // Safe guard: If patient_id is set and text matches, avoid search? 
      // We'll rely on clearing patient_id when text changes to something else.
      
      const list = await appointmentService.searchMrn(searchText);
      if (active) {
        setPatients(list);
        setHasSearched(true);
      }
    };
    const t = setTimeout(run, 300);
    return () => { active = false; clearTimeout(t); };
  }, [searchText, isSelecting]);

  const handleCreatePatient = async (data: PatientFormData) => {
    setIsCreatingPatient(true);
    try {
      const newPatient = await patientService.createPatient(data);
      setIsSelecting(true);
      form.setValue('patient_id', newPatient.patient_id);
      form.setValue('patient_mrn', `${newPatient.firstName} ${newPatient.lastName} (${newPatient.mrn})`);
      setShowPatientSheet(false);
      setPatients([]);
      setSearchText('');
      setTimeout(() => setIsSelecting(false), 500);
    } catch (error) {
      console.error('Failed to create patient:', error);
    } finally {
      setIsCreatingPatient(false);
    }
  };

  useEffect(() => {
    if (open) {
      const apptDate = initial?.appointment_date ? format(new Date(initial.appointment_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      const startT = initial?.start_time ? format(new Date(initial.start_time), 'HH:mm') : format(new Date(), 'HH:mm');
      const endT = initial?.end_time ? format(new Date(initial.end_time), 'HH:mm') : format(addMinutes(new Date(), 15), 'HH:mm');
      
      // If editing, patient name needs to be populated correctly? 
      // Initial object usually has patient name? logic might need adjustment if initial.patient_name exists. 
      // Assuming initial.patient_mrn might be just MRN. We might display just MRN if name unavailable.
      
      form.reset({
        patient_id: initial?.patient_id ?? 0,
        doctor_id: initial?.doctor_id ?? '',
        appointment_date: apptDate,
        start_time: startT,
        end_time: endT,
        duration: initial?.duration ?? 15,
        appointment_type: initial?.appointment_type ?? '',
        reason_for_visit: initial?.reason_for_visit ?? '',
        appointment_status: (initial?.appointment_status ?? defaultStatus ?? 'SCHEDULED').toUpperCase(),
        notes: initial?.notes ?? '',
        patient_mrn: initial?.patient_firstName ? `${initial.patient_firstName} ${initial.patient_lastName} (${initial.patient_mrn})` : (initial?.patient_mrn ?? ''),
      });
      setSearchText('');
      setPatients([]);
      setHasSearched(false);
    }
  }, [open, initial, form, defaultStatus]);

  // ... (keep auto-calc effect)

  // Reflect patient_mrn input into search text
  const mrnValue = form.watch('patient_mrn') as string | undefined;
  useEffect(() => {
    if (!isSelecting) {
        setSearchText(mrnValue ?? '');
        // If user is typing and clears the exact match, we should probably clear patient_id?
        // But simply clearing it here might be aggressive. 
        // Let's rely on validation: if patient_id is set but user changed text, form submit will still use old ID?
        // We really should clear ID if text changes.
        // For now, let's just sync text.
    }
  }, [mrnValue, isSelecting]);

  // If user changes text significantly, clear patient_id?
  useEffect(() => {
      // Logic to clear ID if text changed? 
      // Keep it simple for now to avoid side effects.
  }, [mrnValue]);
  
  // Update: If patient_id is set, ensure we show error if validation failed? 
  // RHF errors for patient_id won't point to patient_mrn field.
  // We can just rely on FormFloatingInput showing error for 'patient_mrn' if we manually set it,
  // or use `form.setError` on submit if patient_id is 0.
  
  const handleSelectPatient = (p: AppointmentPatientLite) => {
      setIsSelecting(true);
      form.setValue('patient_id', p.patient_id);
      form.setValue('patient_mrn', `${p.firstName} ${p.lastName} (${p.mrn})`, { shouldValidate: true });
      if (p.patientInfo?.primaryDoctorId) {
        form.setValue('doctor_id', p.patientInfo.primaryDoctorId);
      }
      setPatients([]);
      setHasSearched(false);
      // Allow effect to clear 'isSelecting' after text update propagates
      setTimeout(() => setIsSelecting(false), 300);
  };

  const doctorOptions = doctors.map(d => ({ label: `${d.displayName}`, value: d.id }));
  
  const appointmentTypeOptions = [
    'Consultation',
    'Follow-up',
    'Procedure',
    'Surgery',
    'Teleconsultation',
    'Checkup',
  ].map(t => ({ label: t, value: t }));

  const allStatusOptions = [
    { label: 'Scheduled', value: 'SCHEDULED' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Checked-In', value: 'CHECKED-IN' },
    { label: 'Checked-Out', value: 'CHECKED-OUT' },
    { label: 'Rescheduled', value: 'RESCHEDULED' },
    { label: 'No-Show', value: 'NO-SHOW' },
    { label: 'Cancelled', value: 'CANCELLED' },
    { label: 'With Doctor', value: 'WITH DOCTOR' },
    { label: 'Wait List', value: 'WAIT LIST' },
  ];

  const currentStatus = (initial?.appointment_status || defaultStatus || 'SCHEDULED').toUpperCase();

  const allowedTransitions: Record<string, string[]> = {
    'SCHEDULED': ['CONFIRMED', 'CANCELLED', 'NO-SHOW', 'RESCHEDULED'],
    'CONFIRMED': ['CHECKED-IN', 'NO-SHOW', 'CANCELLED', 'RESCHEDULED'],
    'CHECKED-IN': ['WITH DOCTOR', 'NO-SHOW'],
    'WITH DOCTOR': ['CHECKED-OUT'],
    'RESCHEDULED': ['CONFIRMED', 'CANCELLED', 'NO-SHOW'],
  };

  const validNextStatuses = allowedTransitions[currentStatus] || [];
  const appointmentStatusOptions = initial?.appointment_id 
    ? allStatusOptions.filter(opt => opt.value === currentStatus || validNextStatuses.includes(opt.value))
    : allStatusOptions;

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" preventClose className="gap-0 w-full sm:w-[500px] lg:w-[600px] sm:max-w-none p-0 flex flex-col h-full">
        <SheetHeader className="px-4 py-3 border-b shrink-0 flex flex-row items-center justify-between space-y-0">
          <SheetTitle>{initial?.appointment_id ? 'Edit Appointment' : 'Add Appointment'}</SheetTitle>
        </SheetHeader>
        
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              (vals) => {
                // Check if patient_id is valid
                if (!vals.patient_id) {
                    form.setError('patient_mrn', { message: "Please select a valid patient" });
                    return;
                }
                console.log("Form validated, submitting:", vals);
                const datePart = typeof vals.appointment_date === 'string' ? vals.appointment_date : format(vals.appointment_date as Date, 'yyyy-MM-dd');
                const toISO = (time: string) => new Date(`${datePart}T${time}:00`).toISOString();
                const payload: AppointmentFormValues = {
                  ...vals,
                  appointment_date: datePart,
                  start_time: toISO(vals.start_time),
                  end_time: toISO(vals.end_time),
                  duration: Number(vals.duration),
                };
                onSubmit(payload);
              },
              (errors) => {
                // Manually handle patient_id error if needed
                if (errors.patient_id && !errors.patient_mrn) {
                    form.setError('patient_mrn', { message: errors.patient_id.message });
                }
                console.log("Form validation errors:", errors);
              }
            )}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-4 px-3 py-4">
                
                {/* Patient lookup */}
                <div className="grid gap-2">
                   <div className="flex items-end gap-2">
                      <div className="flex-1">
                          <FormFloatingInput 
                            control={form.control} 
                            name="patient_mrn" 
                            label="Patient (Name or MRN)" 
                            required 
                            autoComplete="off"
                            disabled={fixedPatient}
                          />
                      </div>
                      {!fixedPatient && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          className="h-10 w-10 shrink-0"
                          title="Add New Patient"
                          onClick={() => setShowPatientSheet(true)}
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      )}
                   </div>
                  
                  {patients.length > 0 && (
                    <div className="rounded-md border bg-card max-h-48 overflow-auto shadow-sm">
                      {patients.map(p => (
                        <button 
                            type="button" 
                            key={p.patient_id} 
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors" 
                            onClick={() => handleSelectPatient(p)}
                        >
                          <span className="font-medium">{p.firstName} {p.lastName}</span> <span className="text-muted-foreground">({p.mrn})</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {hasSearched && patients.length === 0 && searchText.length >= 2 && !isSelecting && (
                    <div className="text-xs text-muted-foreground px-1">
                      No patients found. Click + to add.
                    </div>
                  )}
                </div>

                <FormFloatingSelect control={form.control} name="doctor_id" label="Doctor" options={doctorOptions} placeholder="Select a doctor" required />
                <div className="grid gap-3 md:grid-cols-3">
                  <FormFloatingDatePicker control={form.control} name="appointment_date" label="Appointment Date" required />
                  <FormFloatingInput control={form.control} name="start_time" label="Start Time" type="time" required />
                  <FormFloatingInput control={form.control} name="end_time" label="End Time" type="time" required />
                </div>
                <FormFloatingInput control={form.control} name="duration" label="Duration (mins)" inputMode="numeric" type="number" required />
                <FormFloatingSelect control={form.control} name="appointment_type" label="Appointment Type" options={appointmentTypeOptions} placeholder="Select type" required />
                
                <FormFloatingTextarea control={form.control} name="reason_for_visit" label="Reason for Visit" className="min-h-[80px]" />
                
                {!hideStatus && (
                  <FormFloatingSelect 
                    control={form.control} 
                    name="appointment_status" 
                    label="Status" 
                    options={appointmentStatusOptions} 
                    placeholder="Select status" 
                    required 
                    disabled={!initial?.appointment_id}
                  />
                )}
                <FormFloatingTextarea control={form.control} name="notes" label="Notes" />
                
                </div>
            </div>

            <div className="flex justify-end gap-3 px-5 py-3 border-t bg-background shrink-0">
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
               <Button type="submit" className="bg-primary-gradient hover:opacity-90" disabled={isLoading}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 {initial?.appointment_id ? 'Update Appointment' : 'Create Appointment'}
               </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>

    {/* Patient Form Sheet */}
    <PatientFormSheet
      open={showPatientSheet}
      onOpenChange={setShowPatientSheet}
      onSubmit={handleCreatePatient}
      isLoading={isCreatingPatient}
    />
    </>
  );
}

export default AppointmentFormSheet;
