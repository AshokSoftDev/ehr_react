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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 shrink-0 border-b">
        <CardTitle className="flex items-center gap-2">
          Appointments
          <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
            {appointments.length}
          </Badge>
        </CardTitle>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Appointment
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        {listQuery.isLoading ? (
          <div className="flex justify-center p-8 text-sm text-muted-foreground">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            No appointments found for this patient.
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((item: AppointmentItem) => (
              <div key={item.appointment_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-foreground">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(item.appointment_date), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(item.start_time), 'h:mm a')} - {format(new Date(item.end_time), 'h:mm a')} ({item.duration}m)
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {item.appointment_type}
                    </span>
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", getStatusColor(item.appointment_status))}>
                      {item.appointment_status}
                    </Badge>
                  </div>

                  <div className="text-sm">
                    {item.doctor_title} {item.doctor_firstName} {item.doctor_lastName}
                    {item.doctor_specialty && <span className="text-muted-foreground"> | {item.doctor_specialty}</span>}
                  </div>

                  {item.reason_for_visit && (
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      <span className="font-medium text-foreground">Reason:</span> {item.reason_for_visit}
                    </div>
                  )}
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
