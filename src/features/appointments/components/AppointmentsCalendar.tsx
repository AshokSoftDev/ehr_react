import { useMemo, useState } from 'react';
import { addMonths, addWeeks, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import type { AppointmentItem } from '../types/appointment.types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AppointmentsCalendarProps {
  items: AppointmentItem[];
  onReschedule: (id: number, targetDate: Date) => void;
}

export function AppointmentsCalendar({ items, onReschedule }: AppointmentsCalendarProps) {
  const [current, setCurrent] = useState(new Date());
  const [mode, setMode] = useState<'month' | 'week'>('month');
  const [pendingDrop, setPendingDrop] = useState<{ id: number; date: Date } | null>(null);
  const [details, setDetails] = useState<AppointmentItem | null>(null);

  const monthDays = useMemo(() => {
    const start = startOfMonth(current);
    const end = endOfMonth(current);
    const startWeekday = start.getDay();
    const totalDays = end.getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(new Date(current.getFullYear(), current.getMonth(), d, 12, 0, 0));
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [current]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(current, { weekStartsOn: 0 });
    const end = endOfWeek(current, { weekStartsOn: 0 });
    const days: Date[] = [];
    let d = start;
    while (d <= end) {
      days.push(new Date(d));
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 12, 0, 0);
    }
    return days;
  }, [current]);

  const grouped = useMemo(() => {
    const map = new Map<string, AppointmentItem[]>();
    items.forEach((it) => {
      const key = new Date(it.appointment_date).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    });
    return map;
  }, [items]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { setCurrent(new Date()); }}>Today</Button>
          <Button variant={mode === 'week' ? 'default' : 'outline'} onClick={() => setMode('week')}>Week</Button>
          <Button variant={mode === 'month' ? 'default' : 'outline'} onClick={() => setMode('month')}>Month</Button>
        </div>
        <div className="text-sm font-medium">
          {mode === 'month' ? format(current, 'MMMM yyyy') : `Week of ${format(startOfWeek(current, { weekStartsOn: 0 }), 'PP')}`}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCurrent(mode === 'month' ? addMonths(current, -1) : addWeeks(current, -1))}>Prev</Button>
          <Button variant="outline" onClick={() => setCurrent(mode === 'month' ? addMonths(current, 1) : addWeeks(current, 1))}>Next</Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={d} className="text-center text-xs text-muted-foreground">{d}</div>
        ))}
        {(mode === 'month' ? monthDays : weekDays).map((day, idx) => {
          const key = day ? day.toDateString() : `empty-${idx}`;
          const todays = day ? (grouped.get(key) ?? []) : [];
          return (
            <div
              key={key}
              className={`min-h-28 rounded-md border p-2 ${day && (mode === 'month' ? isSameMonth(day, current) : true) ? 'bg-card' : 'bg-muted/20'}`}
              onDragOver={(e) => day && e.preventDefault()}
              onDrop={(e) => {
                if (!day) return;
                const idStr = e.dataTransfer.getData('text/plain');
                const id = Number(idStr);
                if (!Number.isFinite(id)) return;
                setPendingDrop({ id, date: day });
              }}
            >
              <div className={`text-xs ${isSameDay(day ?? new Date(0), new Date()) ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{day ? format(day, 'd') : ''}</div>
              <div className="mt-1 space-y-1">
                {todays.map((it) => (
                  <div
                    key={it.appointment_id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', String(it.appointment_id));
                    }}
                    onClick={() => setDetails(it)}
                    className="rounded-md border bg-background px-2 py-1 text-xs cursor-move hover:bg-accent/40"
                    title={`${it.patient_firstName} ${it.patient_lastName} • ${it.doctor_firstName} ${it.doctor_lastName}`}
                  >
                    <div className="font-medium truncate">{it.patient_firstName} {it.patient_lastName}</div>
                    <div className="text-muted-foreground truncate">{format(new Date(it.start_time), 'HH:mm')} - {format(new Date(it.end_time), 'HH:mm')}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!pendingDrop} onOpenChange={(o) => !o && setPendingDrop(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reschedule appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                if (!pendingDrop) return null;
                const appt = items.find((a) => a.appointment_id === pendingDrop.id);
                const who = appt ? `${appt.patient_firstName} ${appt.patient_lastName} (${appt.patient_mrn})` : `ID ${pendingDrop.id}`;
                return <>Move {who} to {format(pendingDrop.date, 'PPP')}.</>;
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDrop(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (pendingDrop) onReschedule(pendingDrop.id, pendingDrop.date);
              setPendingDrop(null);
            }}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!details} onOpenChange={(o) => !o && setDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {details ? (
                <span>
                  {details.patient_firstName} {details.patient_lastName} ({details.patient_mrn})
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          {details && (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Doctor: </span>
                {details.doctor_firstName} {details.doctor_lastName} ({details.doctor_specialty})
              </div>
              <div>
                <span className="text-muted-foreground">Date: </span>
                {format(new Date(details.appointment_date), 'PPP')}
              </div>
              <div>
                <span className="text-muted-foreground">Time: </span>
                {format(new Date(details.start_time), 'HH:mm')} - {format(new Date(details.end_time), 'HH:mm')}
              </div>
              <div>
                <span className="text-muted-foreground">Type/Status: </span>
                {details.appointment_type} • {details.appointment_status}
              </div>
              {details.notes && (
                <div>
                  <span className="text-muted-foreground">Notes: </span>
                  {details.notes}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 border" onClick={() => setDetails(null)}>Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AppointmentsCalendar;


