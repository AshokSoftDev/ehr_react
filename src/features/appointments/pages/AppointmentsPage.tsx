import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FormFloatingInput } from '@/components/form/form-floating-input';
import { FormFloatingDatePicker } from '@/components/form/FormFloatingDatePicker';
import { appointmentService } from '../services/appointment.service';
import type { AppointmentItem, AppointmentFilters } from '../types/appointment.types';
import AppointmentFormSheet, { AppointmentFormValues } from '../components/AppointmentFormSheet';
import AppointmentsCalendar from '../components/AppointmentsCalendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, LayoutGrid, Pencil, Trash2 } from 'lucide-react';

const filterSchema = z.object({
  search: z.string().optional(),
  dateFrom: z.union([z.string(), z.date()]).optional(),
  dateTo: z.union([z.string(), z.date()]).optional(),
});
type FilterValues = z.infer<typeof filterSchema>;

export function AppointmentsPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'cards' | 'calendar'>('cards');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filterForm = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search: '', dateFrom: undefined, dateTo: undefined },
  });
  const _watch = filterForm.watch();

  const filters: AppointmentFilters = useMemo(() => {
    const vals = filterForm.getValues();
    return {
      search: vals.search || undefined,
      dateFrom: vals.dateFrom ? new Date(vals.dateFrom as any).toISOString() : undefined,
      dateTo: vals.dateTo ? new Date(vals.dateTo as any).toISOString() : undefined,
      page,
      limit,
    };
  }, [filterForm, _watch, page, limit]);

  const listQuery = useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => appointmentService.list(filters),
  });

  const doctorsQuery = useQuery({
    queryKey: ['appointment-doctors'],
    queryFn: () => appointmentService.getDoctors(),
  });

  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<AppointmentItem | null>(null);

  const createMutation = useMutation({
    mutationFn: (payload: AppointmentFormValues) => appointmentService.create({
      patient_id: payload.patient_id,
      doctor_id: payload.doctor_id,
      appointment_date: payload.appointment_date,
      start_time: payload.start_time,
      end_time: payload.end_time,
      duration: payload.duration,
      appointment_type: payload.appointment_type,
      reason_for_visit: payload.reason_for_visit,
      appointment_status: payload.appointment_status,
      notes: payload.notes,
    }),
    onSuccess: () => {
      setOpenForm(false);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; payload: AppointmentFormValues }) => appointmentService.update(input.id, {
      patient_id: input.payload.patient_id,
      doctor_id: input.payload.doctor_id,
      appointment_date: input.payload.appointment_date,
      start_time: input.payload.start_time,
      end_time: input.payload.end_time,
      duration: input.payload.duration,
      appointment_type: input.payload.appointment_type,
      reason_for_visit: input.payload.reason_for_visit,
      appointment_status: input.payload.appointment_status,
      notes: input.payload.notes,
    }),
    onSuccess: () => {
      setOpenForm(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => appointmentService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const onReschedule = (id: number, targetDate: Date) => {
    const appt = listQuery.data?.appointments.find(a => a.appointment_id === id);
    if (!appt) return;
    const newStart = new Date(appt.start_time);
    newStart.setFullYear(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const newEnd = new Date(appt.end_time);
    newEnd.setFullYear(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    appointmentService.update(id, { appointment_date: targetDate.toISOString(), start_time: newStart.toISOString(), end_time: newEnd.toISOString() })
      .then(() => queryClient.invalidateQueries({ queryKey: ['appointments'] }));
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Appointments</div>
        <div className="flex items-center gap-2">
          <Button variant={view === 'cards' ? 'default' : 'ghost'} size="icon" onClick={() => setView('cards')} title="Card view">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={view === 'calendar' ? 'default' : 'ghost'} size="icon" onClick={() => setView('calendar')} title="Calendar view">
            <CalendarDays className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setEditItem(null); setOpenForm(true); }}>Add</Button>
        </div>
      </div>

      <Form {...filterForm}>
        <form className="grid gap-3 md:grid-cols-5">
          <FormFloatingInput control={filterForm.control} name="search" label="Search (MRN, patient, doctor)" onChange={(e) => { filterForm.setValue('search', e.target.value); setPage(1); }} />
          <FormFloatingDatePicker control={filterForm.control} name="dateFrom" label="From" />
          <FormFloatingDatePicker control={filterForm.control} name="dateTo" label="To" />
        </form>
      </Form>

      <Separator />

      {view === 'cards' ? (
        <>
          {listQuery.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (listQuery.data?.appointments ?? []).length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">No appointments found.</div>
          ) : null}
          {(listQuery.data?.appointments ?? []).length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {(listQuery.data?.appointments ?? []).map((it) => (
              <Card key={it.appointment_id} className="bg-card cursor-pointer" onClick={() => { setEditItem(it); setOpenForm(true); }}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">MRN</div>
                    <Badge variant="secondary">{it.patient_mrn}</Badge>
                  </div>
                  <div className="text-sm font-medium">{it.patient_firstName} {it.patient_lastName}</div>
                  <div className="text-xs text-muted-foreground">{it.doctor_firstName} {it.doctor_lastName} ({it.doctor_specialty})</div>
                  <div className="text-xs">{format(new Date(it.appointment_date), 'PP')} • {format(new Date(it.start_time), 'HH:mm')} - {format(new Date(it.end_time), 'HH:mm')}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs">{it.appointment_type}</div>
                    <Badge>{it.appointment_status}</Badge>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="icon" onClick={() => { setEditItem(it); setOpenForm(true); }} title="Edit"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => deleteMutation.mutate(it.appointment_id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={(listQuery.data?.page ?? page) <= 1}>Prev Page</Button>
            <div className="text-xs text-muted-foreground">Page {(listQuery.data?.page ?? page)} of {listQuery.data?.totalPages ?? Math.max(1, Math.ceil((listQuery.data?.total ?? 0) / limit))}</div>
            <Button variant="outline" onClick={() => setPage((listQuery.data?.page ?? page) + 1)} disabled={(listQuery.data?.page ?? page) >= (listQuery.data?.totalPages ?? 1)}>Next Page</Button>
          </div>
        </>
      ) : (
        <AppointmentsCalendar items={listQuery.data?.appointments ?? []} onReschedule={onReschedule} />
      )}

      <AppointmentFormSheet
        open={openForm}
        onOpenChange={setOpenForm}
        onSubmit={(vals) => {
          if (editItem) updateMutation.mutate({ id: editItem.appointment_id, payload: vals });
          else createMutation.mutate(vals);
        }}
        doctors={doctorsQuery.data ?? []}
        initial={editItem ?? undefined}
      />
    </div>
  );
}

export default AppointmentsPage;


