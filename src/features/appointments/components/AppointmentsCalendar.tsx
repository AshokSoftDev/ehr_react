import { useMemo, useState } from 'react';
import { addMonths, addWeeks, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import type { AppointmentItem } from '../types/appointment.types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { X } from 'lucide-react';

interface AppointmentsCalendarProps {
  items: AppointmentItem[];
  onReschedule: (id: number, targetDate: Date) => void;
  onStatusChange?: (id: number, status: string) => void;
}

export function AppointmentsCalendar({ items, onReschedule, onStatusChange }: AppointmentsCalendarProps) {
  const [current, setCurrent] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
  });
  const [mode, setMode] = useState<'month' | 'week'>('month');
  const [pendingDrop, setPendingDrop] = useState<{ id: number; date: Date } | null>(null);
  const [details, setDetails] = useState<AppointmentItem | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [forceRender, setForceRender] = useState(0);
  const [draggedAppointmentId, setDraggedAppointmentId] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [targetMonth, setTargetMonth] = useState<Date | null>(null);

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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg p-4 border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Today button commented out */}
            {/* <Button variant="outline" onClick={() => { 
              const today = new Date();
              const newCurrent = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
              setCurrent(newCurrent);
              setForceRender(prev => prev + 1);
            }}>Today</Button> */}
            <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 rounded-lg p-1">
              <Button 
                variant={mode === 'week' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setMode('week')}
                className={mode === 'week' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-white/80'}
              >
                Week
              </Button>
              <Button 
                variant={mode === 'month' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setMode('month')}
                className={mode === 'month' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-white/80'}
              >
                Month
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {mode === 'month' ? format(current, 'MMMM yyyy') : `Week of ${format(startOfWeek(current, { weekStartsOn: 0 }), 'dd/MM')}`}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {mode === 'month' ? `${format(startOfMonth(current), 'dd/MM')} - ${format(endOfMonth(current), 'dd/MM/yyyy')}` : 
               `${format(startOfWeek(current, { weekStartsOn: 0 }), 'dd/MM')} - ${format(endOfWeek(current, { weekStartsOn: 0 }), 'dd/MM/yyyy')}`}
            </div>
            {draggedAppointmentId && (
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                📅 Drag to Previous/Next to move to other months
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrent(mode === 'month' ? addMonths(current, -1) : addWeeks(current, -1))}
              className="bg-white/60 hover:bg-white border-gray-300 shadow-sm"
              onDragOver={(e) => {
                if (draggedAppointmentId) {
                  e.preventDefault();
                  e.currentTarget.classList.add('bg-blue-100', 'border-blue-400');
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-blue-100', 'border-blue-400');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('bg-blue-100', 'border-blue-400');
                if (draggedAppointmentId) {
                  const prevMonth = mode === 'month' ? addMonths(current, -1) : addWeeks(current, -1);
                  setCurrent(prevMonth);
                  setTargetMonth(prevMonth);
                  setShowDatePicker(true);
                }
              }}
            >
              ← Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrent(mode === 'month' ? addMonths(current, 1) : addWeeks(current, 1))}
              className="bg-white/60 hover:bg-white border-gray-300 shadow-sm"
              onDragOver={(e) => {
                if (draggedAppointmentId) {
                  e.preventDefault();
                  e.currentTarget.classList.add('bg-blue-100', 'border-blue-400');
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-blue-100', 'border-blue-400');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('bg-blue-100', 'border-blue-400');
                if (draggedAppointmentId) {
                  const nextMonth = mode === 'month' ? addMonths(current, 1) : addWeeks(current, 1);
                  setCurrent(nextMonth);
                  setTargetMonth(nextMonth);
                  setShowDatePicker(true);
                }
              }}
            >
              Next →
            </Button>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm overflow-hidden" key={`calendar-${forceRender}`}>
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800 border-b">
          {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((d) => (
            <div key={d} className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r last:border-r-0">
              <div className="hidden sm:block">{d}</div>
              <div className="sm:hidden">{d.slice(0, 3)}</div>
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7">{(mode === 'month' ? monthDays : weekDays).map((day, idx) => {
          const key = day ? day.toDateString() : `empty-${idx}`;
          const todays = day ? (grouped.get(key) ?? []) : [];
          return (
            <div
              key={key}
              className={`min-h-32 border-r border-b last:border-r-0 p-2 ${
                day && (mode === 'month' ? isSameMonth(day, current) : true) 
                  ? isSameDay(day, new Date()) 
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' 
                    : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800' 
                  : 'bg-gray-100 dark:bg-gray-800'
              } transition-colors`}
              onDragOver={(e) => {
                if (day) {
                  e.preventDefault();
                  e.currentTarget.classList.add('bg-blue-50', 'border-blue-300');
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
                if (!day) return;
                const idStr = e.dataTransfer.getData('text/plain');
                const id = Number(idStr);
                if (!Number.isFinite(id)) return;
                setPendingDrop({ id, date: day });
              }}
            >
              <div className={`text-sm font-medium mb-2 ${
                isSameDay(day ?? new Date(0), new Date()) 
                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 rounded-full w-7 h-7 flex items-center justify-center' 
                  : day && (mode === 'month' ? isSameMonth(day, current) : true)
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-400 dark:text-gray-600'
              }`}>
                {day ? format(day, 'd') : ''}
              </div>
              
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {todays.map((it) => (
                  <div
                    key={it.appointment_id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', String(it.appointment_id));
                      setDraggedAppointmentId(it.appointment_id);
                    }}
                    onDragEnd={() => {
                      setDraggedAppointmentId(null);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetails(it);
                      setPopoverAnchor(e.currentTarget as HTMLElement);
                      setPopoverOpen(true);
                    }}
                    id={`appointment-${it.appointment_id}`}
                    className="rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-1 text-xs cursor-move hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                    title={`${it.patient_firstName} ${it.patient_lastName} • ${it.doctor_firstName} ${it.doctor_lastName}`}
                  >
                    <div className="font-medium truncate">{it.patient_firstName} {it.patient_lastName}</div>
                    <div className="text-blue-100 truncate text-xs">{format(new Date(it.start_time), 'HH:mm')} - {format(new Date(it.end_time), 'HH:mm')}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}</div>
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
                return <>Move {who} to {format(pendingDrop.date, 'dd/MM/yyyy')}.</>;
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

      {popoverAnchor && details && (
        <Popover open={popoverOpen} onOpenChange={(open) => {
          setPopoverOpen(open);
          if (!open) {
            setDetails(null);
            setPopoverAnchor(null);
          }
        }}>
          <PopoverTrigger asChild>
            <button 
              style={{ 
                position: 'absolute',
                left: 0,
                top: 0,
                width: 0,
                height: 0,
                border: 'none',
                background: 'none',
                padding: 0,
                pointerEvents: 'none'
              }}
            />
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 p-0 max-w-[90vw] border shadow-lg rounded-lg relative" 
            side="bottom" 
            align="center"
            alignOffset={0}
            sideOffset={8}
            avoidCollisions={true}
            collisionPadding={16}
            style={{
              position: 'fixed',
              left: (() => {
                const rect = popoverAnchor.getBoundingClientRect();
                const popoverWidth = 320; // w-80 = 320px
                const viewportWidth = window.innerWidth;
                const centerPosition = rect.left + rect.width / 2 - popoverWidth / 2;
                
                // Ensure popover doesn't go off the left edge
                if (centerPosition < 16) return 16;
                
                // Ensure popover doesn't go off the right edge
                if (centerPosition + popoverWidth > viewportWidth - 16) {
                  return viewportWidth - popoverWidth - 16;
                }
                
                return centerPosition;
              })(),
              top: (() => {
                const rect = popoverAnchor.getBoundingClientRect();
                const popoverHeight = 255; // adjusted estimated height
                const viewportHeight = window.innerHeight;
                const bottomPosition = rect.bottom + 8;
                
                // Always try to show below first
                if (bottomPosition + popoverHeight <= viewportHeight - 16) {
                  return bottomPosition;
                }
                
                // If there's not enough space below, show above
                const topPosition = rect.top - popoverHeight - 8;
                if (topPosition >= 16) {
                  return topPosition;
                }
                
                // If neither above nor below works well, show below with scroll
                return bottomPosition;
              })(),
              zIndex: 50
            }}
          >
          {/* Popover Arrow - lotus flower design at bottom */}
          <div 
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r border-b rotate-45 rounded-br-sm"
            style={{
              boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.1)'
            }}
          ></div>
          {details && (
            <div className="space-y-3 relative bg-white rounded-lg p-4">
              <div className="border-b pb-2 pr-8">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-6 w-6 p-0 hover:bg-gray-100"
                  onClick={() => {
                    setPopoverOpen(false);
                    setDetails(null);
                    setPopoverAnchor(null);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
                <h4 className="font-semibold text-sm">Appointment Details</h4>
                <p className="text-xs text-muted-foreground">
                  {details.patient_firstName} {details.patient_lastName} ({details.patient_mrn})
                </p>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Doctor:</span>
                  <span className="font-medium">{details.doctor_firstName} {details.doctor_lastName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Specialty:</span>
                  <span>{details.doctor_specialty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{format(new Date(details.appointment_date), 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-mono">{format(new Date(details.start_time), 'HH:mm')} - {format(new Date(details.end_time), 'HH:mm')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{details.appointment_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  {onStatusChange ? (
                    <Select 
                      value={details.appointment_status} 
                      onValueChange={(newStatus) => {
                        onStatusChange(details.appointment_id, newStatus);
                        setDetails({ ...details, appointment_status: newStatus });
                      }}
                      disabled={details.appointment_status === 'Completed'}
                    >
                      <SelectTrigger className={`w-32 h-6 text-xs ${details.appointment_status === 'Completed' ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        <SelectValue>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            details.appointment_status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            details.appointment_status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                            details.appointment_status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {details.appointment_status}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scheduled">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Scheduled
                          </span>
                        </SelectItem>
                        <SelectItem value="Confirmed">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Confirmed
                          </span>
                        </SelectItem>
                        <SelectItem value="Completed">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Completed
                          </span>
                        </SelectItem>
                        <SelectItem value="Cancelled">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Cancelled
                          </span>
                        </SelectItem>
                        <SelectItem value="No-show">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            No-show
                          </span>
                        </SelectItem>
                        <SelectItem value="Rescheduled">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Rescheduled
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      details.appointment_status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      details.appointment_status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      details.appointment_status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {details.appointment_status}
                    </span>
                  )}
                </div>
                {details.notes && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="mt-1 text-xs">{details.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
      )}

      {/* Date Picker Dialog for Cross-Month Drops */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select New Date</DialogTitle>
            <DialogDescription>
              Choose a specific date to move the appointment to.
            </DialogDescription>
          </DialogHeader>
          {draggedAppointmentId && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Moving appointment for: {(() => {
                  const appt = items.find(a => a.appointment_id === draggedAppointmentId);
                  return appt ? `${appt.patient_firstName} ${appt.patient_lastName}` : `ID ${draggedAppointmentId}`;
                })()}
              </div>
              <Calendar
                mode="single"
                month={targetMonth || current}
                onMonthChange={setTargetMonth}
                onSelect={(date) => {
                  if (date && draggedAppointmentId) {
                    onReschedule(draggedAppointmentId, date);
                    setShowDatePicker(false);
                    setDraggedAppointmentId(null);
                    setTargetMonth(null);
                  }
                }}
                className="rounded-md border"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDatePicker(false);
              setDraggedAppointmentId(null);
              setTargetMonth(null);
            }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AppointmentsCalendar;


