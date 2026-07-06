import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { toast } from '@/lib/toast';
import { isAxiosError } from 'axios';

import { appointmentService } from '@/features/appointments/services/appointment.service';
import { patientService } from '@/features/patients/services/patient.service';
import { AppointmentFormSheet, type AppointmentFormValues } from '@/features/appointments/components/AppointmentFormSheet';
import type { AppointmentItem } from '@/features/appointments/types/appointment.types';
import type { Patient } from '@/features/patients/types/patient.types';
import { cn } from '@/lib/utils';

type Props = {
  patientId: number;
};

export function PatientAppointmentTab({ patientId }: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentItem | null>(null);

  const { data: patient } = useQuery<Patient>({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getPatient(patientId),
    enabled: Number.isFinite(patientId) && patientId > 0,
  });

  const listQuery = useQuery({
    queryKey: ['patient-appointments', patient?.mrn],
    queryFn: () => appointmentService.list({ mrn: patient?.mrn, limit: 100 }),
    enabled: !!patient?.mrn,
  });

  const doctorsQuery = useQuery({
    queryKey: ['appointment-doctors'],
    queryFn: () => appointmentService.getDoctors(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: AppointmentFormValues) => appointmentService.create(payload as any),
    onSuccess: () => {
      toast.success('Appointment created successfully');
      queryClient.invalidateQueries({ queryKey: ['patient-appointments', patient?.mrn] });
      setOpen(false);
    },
    onError: (err: unknown) => {
      const message = isAxiosError(err) ? ((err.response?.data as any)?.message ?? 'Failed to create appointment') : 'Failed to create appointment';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; data: Partial<AppointmentFormValues> }) =>
      appointmentService.update(payload.id, payload.data as any),
    onSuccess: () => {
      toast.success('Appointment updated successfully');
      queryClient.invalidateQueries({ queryKey: ['patient-appointments', patient?.mrn] });
      setOpen(false);
      setEditing(null);
    },
    onError: (err: unknown) => {
      const message = isAxiosError(err) ? ((err.response?.data as any)?.message ?? 'Failed to update appointment') : 'Failed to update appointment';
      toast.error(message);
    },
  });

  const onSubmit = (values: AppointmentFormValues) => {
    if (editing) {
      updateMutation.mutate({ id: editing.appointment_id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const appointments = listQuery.data?.appointments || [];

  const initialValues: Partial<AppointmentItem> = editing || {
    patient_id: patientId,
    patient_mrn: patient?.mrn,
    patient_firstName: patient?.firstName,
    patient_lastName: patient?.lastName,
    doctor_id: patient?.patientInfo?.primaryDoctorId || undefined,
  };

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'FOLLOW-UP': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      case 'CONSULTATION': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'EMERGENCY': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      case 'ROUTINE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'NEW PATIENT': return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200';
      case 'CONFIRMED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200';
      case 'CHECKED-IN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200';
      case 'CHECKED-OUT': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200';
      case 'NO-SHOW': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200';
      case 'WITH DOCTOR': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200';
      case 'WAIT LIST': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-100';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card className="bg-card h-full flex flex-col">
      <CardHeader className="border-b p-2 [.border-b]:pb-0 flex flex-row items-center justify-between space-y-0 shrink-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          Appointments
          <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
            {appointments.length}
          </Badge>
        </CardTitle>
        <div className='pb-2'>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Appointment
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {listQuery.isLoading ? (
          <div className="flex justify-center p-8 text-sm text-muted-foreground">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <CalendarIcon className="h-10 w-10 opacity-20 mb-3" />
            <p className="text-sm">No appointments found for this patient.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {appointments.map((item: AppointmentItem) => (
              <div
                key={item.appointment_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-muted/30 transition-colors gap-2"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-sm text-foreground pr-1">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(item.appointment_date), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1 font-bold text-foreground">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {format(new Date(item.start_time), 'h:mm a')} - {format(new Date(item.end_time), 'h:mm a')} ({item.duration}m)
                    </div>

                    <div className="flex items-center gap-1.5 ml-1">
                      <Badge variant="secondary" className={cn("text-[9px] px-1.5 py-0 h-4 border-none", getTypeColor(item.appointment_type))}>
                        {item.appointment_type}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 border-none", getStatusColor(item.appointment_status))}>
                        {item.appointment_status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs flex-wrap mt-1">
                    <span className="font-medium text-foreground whitespace-nowrap">
                      {item.doctor_title} {item.doctor_firstName} {item.doctor_lastName}
                    </span>
                    {item.doctor_specialty && (
                      <>
                        <span className="text-xs text-muted-foreground">|</span>
                        <span className="text-muted-foreground whitespace-nowrap">{item.doctor_specialty}</span>
                      </>
                    )}
                    {item.reason_for_visit && (
                      <span className="text-xs text-muted-foreground italic border-l pl-2 border-border/50 line-clamp-1 max-w-[250px]" title={item.reason_for_visit}>
                        <span className="font-medium text-foreground not-italic">Reason:</span> {item.reason_for_visit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AppointmentFormSheet
          open={open}
          onOpenChange={setOpen}
          onSubmit={onSubmit}
          doctors={doctorsQuery.data || []}
          initial={initialValues}
          isLoading={createMutation.isPending || updateMutation.isPending}
          fixedPatient={true}
        />
      </CardContent>
    </Card>
  );
}

export default PatientAppointmentTab;
