import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormFloatingInput } from '@/components/form/form-floating-input';
import { FormFloatingSelect } from '@/components/form/FormFloatingSelect';
import { FormFloatingTextarea } from '@/components/form/form-floating-textarea';
import { FormFloatingDatePicker } from '@/components/form/FormFloatingDatePicker';
import { Loader2, Plus } from 'lucide-react';

import { toast } from '@/lib/toast';
import { isAxiosError } from 'axios';

import { visitService } from '../services/visit.service';
import { appointmentService } from '@/features/appointments/services/appointment.service';
import { PatientFormSheet } from '@/features/patients/components/PatientFormSheet';
import { patientService } from '@/features/patients/services/patient.service';
import type { PatientFormData } from '@/features/patients/schemas/patient.schema';
import type { AppointmentPatientLite } from '@/features/appointments/types/appointment.types';

const formSchema = z.object({
  patient_id: z.coerce.number().int().min(1, "Please select a patient"),
  patient_mrn: z.string().optional(),
  doctor_id: z.string().min(1, 'Doctor is required'),
  visit_date: z.union([z.string(), z.date()]),
  visit_time: z.string().min(1, 'Visit time is required'),
  visit_type: z.string().min(1, 'Visit type is required'),
  reason_for_visit: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const visitTypes = [
  { label: 'Consultation', value: 'Consultation' },
  { label: 'Follow-up', value: 'Follow-up' },
  { label: 'Emergency', value: 'Emergency' },
  { label: 'Routine Checkup', value: 'Routine Checkup' },
  { label: 'Treatment', value: 'Treatment' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: number;
}

export function CreateVisitSheet({ open, onOpenChange, patientId }: Props) {
  const queryClient = useQueryClient();

  const { data: doctors = [] } = useQuery({
    queryKey: ['appointment-doctors'],
    queryFn: () => appointmentService.getDoctors(),
    enabled: open,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patient_id: patientId ?? 0,
      patient_mrn: '',
      doctor_id: '',
      visit_date: format(new Date(), 'yyyy-MM-dd'),
      visit_time: format(new Date(), 'HH:mm'),
      visit_type: 'Consultation',
      reason_for_visit: '',
    },
  });

  const [searchText, setSearchText] = useState('');
  const [patients, setPatients] = useState<AppointmentPatientLite[]>([]);
  const [showPatientSheet, setShowPatientSheet] = useState(false);
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  // Auto-fetch patient details if patientId is provided but mrn is empty
  useEffect(() => {
    if (open && patientId && !form.getValues('patient_mrn')) {
      patientService.getPatient(patientId).then((p) => {
        form.setValue('patient_id', p.patient_id);
        form.setValue('patient_mrn', `${p.firstName} ${p.lastName} (${p.mrn})`);
      });
    }
  }, [open, patientId, form]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (isSelecting) return;
      if (!searchText || searchText.length < 2) { setPatients([]); setHasSearched(false); return; }

      if (form.getValues('patient_id') && searchText === form.getValues('patient_mrn')) {
         setPatients([]);
         setHasSearched(false);
         return;
      }
      
      const list = await appointmentService.searchMrn(searchText);
      if (active) {
        setPatients(list);
        setHasSearched(true);
      }
    };
    const t = setTimeout(run, 300);
    return () => { active = false; clearTimeout(t); };
  }, [searchText, isSelecting, form]);

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
      form.reset({
        patient_id: patientId ?? 0,
        patient_mrn: '',
        doctor_id: '',
        visit_date: format(new Date(), 'yyyy-MM-dd'),
        visit_time: format(new Date(), 'HH:mm'),
        visit_type: 'Consultation',
        reason_for_visit: '',
      });
      setSearchText('');
      setPatients([]);
      setHasSearched(false);
    }
  }, [open, patientId, form]);

  const mrnValue = form.watch('patient_mrn');
  useEffect(() => {
    if (!isSelecting) {
      setSearchText(mrnValue ?? '');
    }
  }, [mrnValue, isSelecting]);

  const handleSelectPatient = (p: AppointmentPatientLite) => {
      setIsSelecting(true);
      form.setValue('patient_id', p.patient_id);
      form.setValue('patient_mrn', `${p.firstName} ${p.lastName} (${p.mrn})`, { shouldValidate: true });
      setPatients([]);
      setHasSearched(false);
      setTimeout(() => setIsSelecting(false), 300);
  };

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const datePart = typeof values.visit_date === 'string' ? values.visit_date : format(values.visit_date as Date, 'yyyy-MM-dd');
      const fullDate = new Date(`${datePart}T${values.visit_time}:00`);
      return visitService.create({
        patient_id: values.patient_id,
        doctor_id: values.doctor_id,
        visit_date: fullDate,
        visit_type: values.visit_type,
        reason_for_visit: values.reason_for_visit,
      });
    },
    onSuccess: () => {
      toast.success('Visit created successfully');
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['patient-visits'] });
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const message = isAxiosError(err)
        ? (err.response?.data as any)?.message ?? 'Failed to create visit'
        : 'Failed to create visit';
      toast.error(message);
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!values.patient_id) {
      form.setError('patient_mrn', { message: "Please select a valid patient" });
      return;
    }
    mutation.mutate(values);
  };

  const doctorOptions = doctors.map(d => ({ 
    label: `${d.displayName} ${d.specialty ? `(${d.specialty})` : ''}`, 
    value: d.id 
  }));

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="gap-0 w-full sm:w-[500px] lg:w-[600px] sm:max-w-none p-0 flex flex-col h-full">
        <SheetHeader className="px-4 py-3 border-b shrink-0 flex flex-row items-center justify-between space-y-0">
          <SheetTitle>Create New Visit</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4 px-4 py-6">
                
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
                            disabled={!!patientId}
                          />
                      </div>
                      {!patientId && (
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
                  
                  {patients.length > 0 && !patientId && (
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
                  {hasSearched && patients.length === 0 && searchText.length >= 2 && !isSelecting && !patientId && (
                    <div className="text-xs text-muted-foreground px-1">
                      No patients found. Click + to add.
                    </div>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <FormFloatingDatePicker
                    control={form.control}
                    name="visit_date"
                    label="Visit Date"
                    required
                  />
                  <FormFloatingInput
                    control={form.control}
                    name="visit_time"
                    label="Visit Time"
                    type="time"
                    required
                  />
                </div>

                <FormFloatingSelect
                  control={form.control}
                  name="doctor_id"
                  label="Doctor"
                  options={doctorOptions}
                  placeholder="Select a doctor"
                  required
                />

                <FormFloatingSelect
                  control={form.control}
                  name="visit_type"
                  label="Visit Type"
                  options={visitTypes}
                  placeholder="Select visit type"
                  required
                />

                <FormFloatingTextarea
                  control={form.control}
                  name="reason_for_visit"
                  label="Reason for Visit"
                  className="min-h-[100px]"
                />

              </div>
            </div>

            <div className="flex justify-end gap-3 px-5 py-3 border-t bg-background shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary-gradient hover:opacity-90" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mutation.isPending ? 'Creating...' : 'Create Visit'}
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
