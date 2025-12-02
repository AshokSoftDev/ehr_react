import { useEffect, useState } from 'react';
import { format, addMinutes } from 'date-fns';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { FormFloatingInput } from '@/components/form/form-floating-input';
import { FormFloatingSelect } from '@/components/form/FormFloatingSelect';
import { FormFloatingDatePicker } from '@/components/form/FormFloatingDatePicker';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SheetForm } from '@/components/ui/sheet-form';
import type { AppointmentDoctorLite, AppointmentItem, AppointmentPatientLite } from '../types/appointment.types';
import { appointmentService } from '../services/appointment.service';

const schema = z.object({
  patient_id: z.coerce.number().int().positive(),
  doctor_id: z.string().min(1),
  appointment_date: z.union([z.string(), z.date()]),
  // Time pickers use HH:mm strings; we combine with date on submit
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  duration: z.coerce.number().int().positive().optional(),
  appointment_type: z.string().min(1),
  reason_for_visit: z.string().optional(),
  appointment_status: z.string().min(1),
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
}

export function AppointmentFormSheet({ open, onOpenChange, onSubmit, doctors, initial }: AppointmentFormSheetProps) {
  const form = useForm<AppointmentFormInput, unknown, AppointmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_id: initial?.patient_id ?? 0,
      doctor_id: initial?.doctor_id ?? '',
      appointment_date: initial?.appointment_date ? format(new Date(initial.appointment_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      start_time: initial?.start_time ? format(new Date(initial.start_time), 'HH:mm') : format(new Date(), 'HH:mm'),
      end_time: initial?.end_time ? format(new Date(initial.end_time), 'HH:mm') : format(addMinutes(new Date(), 30), 'HH:mm'),
      duration: initial?.duration ?? undefined,
      appointment_type: initial?.appointment_type ?? '',
      reason_for_visit: initial?.reason_for_visit ?? '',
      appointment_status: (initial?.appointment_status ?? 'SCHEDULED').toUpperCase(),
      notes: initial?.notes ?? '',
      patient_mrn: initial?.patient_mrn ?? '',
    },
  });

  const [searchText, setSearchText] = useState('');
  const [patients, setPatients] = useState<AppointmentPatientLite[]>([]);
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!searchText || searchText.length < 2) { setPatients([]); return; }
      const list = await appointmentService.searchMrn(searchText);
      if (active) setPatients(list);
    };
    const t = setTimeout(run, 300);
    return () => { active = false; clearTimeout(t); };
  }, [searchText]);

  useEffect(() => {
    if (open && initial) {
      const apptDate = initial.appointment_date ? format(new Date(initial.appointment_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      const startT = initial.start_time ? format(new Date(initial.start_time), 'HH:mm') : format(new Date(), 'HH:mm');
      const endT = initial.end_time ? format(new Date(initial.end_time), 'HH:mm') : format(addMinutes(new Date(), 30), 'HH:mm');
      form.reset({
        patient_id: initial.patient_id ?? 0,
        doctor_id: initial.doctor_id ?? '',
        appointment_date: apptDate,
        start_time: startT,
        end_time: endT,
        duration: initial.duration ?? undefined,
        appointment_type: initial.appointment_type ?? '',
        reason_for_visit: initial.reason_for_visit ?? '',
        appointment_status: (initial.appointment_status ?? 'SCHEDULED').toUpperCase(),
        notes: initial.notes ?? '',
        patient_mrn: initial.patient_mrn ?? '',
      });
    }
  }, [open, initial, form]);

  // Auto-calc: when start/end change, update duration; when start or duration change, update end
  useEffect(() => {
    const subscription = form.watch((value, info) => {
      const appt = value.appointment_date;
      const datePart = typeof appt === 'string' ? appt : format((appt ?? new Date()) as Date, 'yyyy-MM-dd');
      const s = value.start_time as string | undefined;
      const e = value.end_time as string | undefined;
      const dRaw = value.duration as number | undefined;
      const toDate = (date: string, time: string) => {
        const [y, m, d] = date.split('-').map(Number);
        const [hh, mm] = time.split(':').map(Number);
        return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
      };
      const fmtTime = (dt: Date) => `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;

      if ((info.name === 'start_time' || info.name === 'end_time') && s && e) {
        const sd = toDate(datePart, s);
        const ed = toDate(datePart, e);
        const mins = Math.max(0, Math.round((ed.getTime() - sd.getTime()) / 60000));
        if (Number.isFinite(mins)) form.setValue('duration', mins, { shouldValidate: false, shouldDirty: true });
      }
      if ((info.name === 'duration' || info.name === 'start_time') && s && dRaw !== undefined) {
        const mins = Number(dRaw);
        if (Number.isFinite(mins) && mins >= 0) {
          const sd = toDate(datePart, s);
          const ed = addMinutes(sd, mins);
          const next = fmtTime(ed);
          if (next !== e) form.setValue('end_time', next, { shouldValidate: false, shouldDirty: true });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Reflect patient_mrn input into search text for MRN lookup without injecting extra onChange into the input
  const mrnValue = form.watch('patient_mrn') as string | undefined;
  useEffect(() => {
    setSearchText(mrnValue ?? '');
  }, [mrnValue]);

  const doctorOptions = doctors.map(d => ({ label: `${d.displayName}`, value: d.id }));
  const appointmentTypeOptions = [
    'Consultation',
    'Follow-up',
    'Procedure',
    'Surgery',
    'Teleconsultation',
    'Checkup',
  ].map(t => ({ label: t, value: t }));
  const appointmentStatusOptions = [
    { label: 'Scheduled', value: 'SCHEDULED' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Checked-In', value: 'CHECKED-IN' },
    { label: 'Checked-Out', value: 'CHECKED-OUT' },
    { label: 'No-Show', value: 'NO-SHOW' },
    { label: 'With Doctor', value: 'WITH DOCTOR' },
    { label: 'Wait List', value: 'WAIT LIST' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <SheetForm open={open} onOpenChange={onOpenChange} title={initial?.appointment_id ? 'Edit Appointment' : 'Add Appointment'}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((vals) => {
            // Combine date + time into ISO strings for backend
            const datePart = typeof vals.appointment_date === 'string' ? vals.appointment_date : format(vals.appointment_date as Date, 'yyyy-MM-dd');
            const toISO = (time: string) => new Date(`${datePart}T${time}:00`).toISOString();
            const payload: AppointmentFormValues = {
              ...vals,
              appointment_date: datePart,
              start_time: toISO(vals.start_time),
              end_time: toISO(vals.end_time),
              duration: vals.duration ? Number(vals.duration) : undefined,
            };
            onSubmit(payload);
          })}
          className="space-y-4 p-2"
        >
          {/* Patient lookup */}
          <div>
            <FormFloatingInput control={form.control} name="patient_mrn" label="Patient (MRN or name)" />
            {patients.length > 0 && (
              <div className="mt-1 rounded-md border bg-card max-h-48 overflow-auto">
                {patients.map(p => (
                  <button type="button" key={p.patient_id} className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50" onClick={() => { form.setValue('patient_id', p.patient_id); form.setValue('patient_mrn', `${p.mrn}`); setPatients([]); }}>
                    <span className="font-medium">{p.mrn}</span> – {p.firstName} {p.lastName}
                  </button>
                ))}
              </div>
            )}
          </div>
          <FormFloatingSelect control={form.control} name="doctor_id" label="Doctor" options={doctorOptions} placeholder="Select a doctor" />
          <div className="grid gap-3 md:grid-cols-3">
            <FormFloatingDatePicker control={form.control} name="appointment_date" label="Appointment Date" />
            <FormFloatingInput control={form.control} name="start_time" label="Start Time" type="time" />
            <FormFloatingInput control={form.control} name="end_time" label="End Time" type="time" />
          </div>
          <FormFloatingInput control={form.control} name="duration" label="Duration (mins)" inputMode="numeric" type="number" />
          <FormFloatingSelect control={form.control} name="appointment_type" label="Appointment Type" options={appointmentTypeOptions} placeholder="Select type" />
          <FormFloatingInput control={form.control} name="reason_for_visit" label="Reason for Visit" />
          <FormFloatingSelect control={form.control} name="appointment_status" label="Status" options={appointmentStatusOptions} placeholder="Select status" />
          <FormFloatingInput control={form.control} name="notes" label="Notes" />
          <Separator />
          <div className="sticky bottom-0 flex items-center justify-end gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-3 -mx-2 -mb-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </SheetForm>
  );
}

export default AppointmentFormSheet;
