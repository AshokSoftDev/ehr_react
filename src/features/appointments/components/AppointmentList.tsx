import { useState, useEffect } from 'react';
import { format, differenceInYears } from 'date-fns';
import { User, Clock, Info, Phone, Edit, IndianRupee } from 'lucide-react';
import type { AppointmentItem } from '../types/appointment.types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AppointmentListProps {
  appointments: AppointmentItem[];
  isLoading: boolean;
  onEdit: (appointment: AppointmentItem) => void;
  onStatusChange: (id: number, status: string) => void;
  navigate: (path: string) => void;
}

const statusOptions = [
  { value: 'SCHEDULED', label: 'Scheduled', color: 'bg-blue-100 text-blue-800 border-blue-400 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-600', hex: '#60a5fa' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-green-100 text-green-800 border-green-400 dark:bg-green-900 dark:text-green-300 dark:border-green-600', hex: '#4ade80' },
  { value: 'CHECKED-IN', label: 'Checked-In', color: 'bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-600', hex: '#34d399' },
  { value: 'CHECKED-OUT', label: 'Checked-Out', color: 'bg-slate-100 text-slate-800 border-slate-400 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-600', hex: '#94a3b8' },
  { value: 'RESCHEDULED', label: 'Rescheduled', color: 'bg-sky-100 text-sky-800 border-sky-400 dark:bg-sky-900 dark:text-sky-300 dark:border-sky-600', hex: '#38bdf8' },
  { value: 'NO-SHOW', label: 'No-Show', color: 'bg-orange-100 text-orange-800 border-orange-400 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-600', hex: '#fb923c' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-400 dark:bg-red-900 dark:text-red-300 dark:border-red-600', hex: '#f87171' },
  { value: 'WITH DOCTOR', label: 'With Doctor', color: 'bg-indigo-100 text-indigo-800 border-indigo-400 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-600', hex: '#818cf8' },
  { value: 'WAIT LIST', label: 'Wait List', color: 'bg-purple-100 text-purple-800 border-purple-400 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-600', hex: '#c084fc' },
];

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

export function AppointmentList({ appointments, isLoading, onEdit, onStatusChange, navigate }: AppointmentListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground border rounded-md border-dashed">
        No appointments found for the selected filters.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-card border rounded-md overflow-hidden">
        <div className="divide-y divide-border">
          {appointments.map((appointment) => (
            <AppointmentListItem
              key={appointment.appointment_id}
              appointment={appointment}
              onEdit={onEdit}
              onStatusChange={onStatusChange}
              navigate={navigate}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      {/* <div className="mt-6 flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg border">
        {statusOptions.map((opt) => (
          <div key={opt.value} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: opt.hex }}></div>
            <span className="text-[10px] font-semibold uppercase text-muted-foreground">{opt.label}</span>
          </div>
        ))}
      </div> */}
    </div>
  );
}

function AppointmentListItem({
  appointment,
  onEdit,
  onStatusChange,
  navigate,
}: {
  appointment: AppointmentItem;
  onEdit: (appointment: AppointmentItem) => void;
  onStatusChange: (id: number, status: string) => void;
  navigate: (path: string) => void;
}) {
  const status = (appointment.appointment_status || 'SCHEDULED').toUpperCase();
  const currentStatus = statusOptions.find(s => s.value === status) || statusOptions[0];

  let age = '';
  if (appointment.patient?.dateOfBirth) {
    age = differenceInYears(new Date(), new Date(appointment.patient.dateOfBirth)).toString() + 'y';
  }
  const gender = appointment.patient?.gender ? appointment.patient.gender[0].toUpperCase() : '';
  const demo = [age, gender].filter(Boolean).join(' / ');

  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);

  const allowedTransitions: Record<string, string[]> = {
    'SCHEDULED': ['CONFIRMED', 'CANCELLED', 'NO-SHOW', 'RESCHEDULED'],
    'CONFIRMED': ['CHECKED-IN', 'NO-SHOW', 'CANCELLED', 'RESCHEDULED'],
    'CHECKED-IN': ['WITH DOCTOR', 'NO-SHOW'],
    'WITH DOCTOR': ['CHECKED-OUT'],
    'RESCHEDULED': ['CONFIRMED', 'CANCELLED', 'NO-SHOW'],
  };
  const validNextStatuses = allowedTransitions[status] || [];
  const filteredOptions = statusOptions.filter(opt => opt.value === status || validNextStatuses.includes(opt.value));
  const isCompleted = status === 'CHECKED-OUT' || status === 'CANCELLED';

  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTooltipOpen) {
      timer = setTimeout(() => {
        setIsTooltipOpen(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isTooltipOpen]);

  return (
    <div className="group/item relative flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-muted/30 transition-colors gap-4">
      {/* Left color bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 z-10"></div>

      <TooltipProvider delayDuration={200}>
        <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
          <TooltipTrigger asChild>
            <div className="flex-1 flex items-center gap-4">
              {/* Info Layout */}
              <div className="flex-1 space-y-1.5 pl-2 cursor-pointer">
                {/* Top Row: Patient Info */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/main/patients/${appointment.patient_id}`); }}
                    className="font-bold text-sm text-foreground group-hover/item:text-blue-600 hover:text-blue-600 dark:group-hover/item:text-blue-400 dark:hover:text-blue-400 hover:underline pr-1 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <User className="h-3.5 w-3.5" />
                    {appointment.patient_title} {appointment.patient_firstName} {appointment.patient_lastName}
                  </button>
                  <span className="text-muted-foreground font-medium">({appointment.patient_mrn})</span>
                </div>

                {/* Bottom Row: Appointment Details & Doctor */}
                <div className="flex items-center gap-2 text-xs flex-wrap mt-1">
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {format(startTime, 'h:mm a')}
                  </div>

                  <div className="flex items-center gap-1.5 ml-1">
                    {appointment.appointment_type && (
                      <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 h-4 border-none ${getTypeColor(appointment.appointment_type)}`}>
                        {appointment.appointment_type}
                      </Badge>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground ml-1 bold">|</span>

                  <span className="font-medium text-foreground whitespace-nowrap">
                    {appointment.doctor_title} {appointment.doctor_firstName} {appointment.doctor_lastName}
                  </span>

                  {appointment.reason_for_visit && (
                    <span className="text-xs text-muted-foreground border-l pl-2 border-border/50 line-clamp-1 max-w-[250px]" title={appointment.reason_for_visit}>
                      {appointment.reason_for_visit}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </TooltipTrigger>

          <TooltipContent side="bottom" sideOffset={10} className="w-[400px] p-0 shadow-xl border-primary/20" align="start">
            <div className="bg-primary p-4 text-primary-foreground rounded-t-md">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">{appointment.patient_title} {appointment.patient_firstName} {appointment.patient_lastName}</h4>
                  <p className="text-sm opacity-90">{demo} | {appointment.patient_mrn}</p>
                  <p className="text-sm opacity-90 flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {appointment.patient?.mobileNumber || 'No Phone'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3 bg-card text-sm text-foreground">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-muted-foreground font-medium">Date & Time:</span>
                <span>{format(new Date(appointment.appointment_date), 'dd/MM/yyyy')} - {format(startTime, 'hh:mm a')} to {format(endTime, 'hh:mm a')}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-muted-foreground font-medium">Reason:</span>
                <span>{appointment.reason_for_visit || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-muted-foreground font-medium">Examiner:</span>
                <span>{appointment.doctor_title} {appointment.doctor_firstName} {appointment.doctor_lastName}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-muted-foreground font-medium">Creator:</span>
                <span>System</span>
              </div>
              {appointment.notes && (
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="text-muted-foreground font-medium">Notes:</span>
                  <span className="whitespace-pre-wrap">{appointment.notes}</span>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex items-center justify-end gap-3 shrink-0">
        {appointment.token ? (
          <div 
            className="flex items-center justify-center min-w-[32px] h-8 px-2.5 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-bold text-sm border border-primary/20 shadow-sm shadow-primary/5"
            title="Token Number"
          >
            {appointment.token}
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); navigate(`/main/billing/patient/${appointment.patient_id}`); }}
            className="h-8 w-8 text-primary hover:bg-primary/10"
            title="Billing / Invoice"
          >
            <IndianRupee className="h-4 w-4" />
          </Button>

          {!isCompleted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onEdit(appointment); }}
              className="h-8 w-8 text-primary hover:bg-primary/10"
              title="Edit appointment"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onValueChange={(newStatus) => onStatusChange(appointment.appointment_id, newStatus)}
            disabled={isCompleted}
          >
            <SelectTrigger className={`w-[130px] h-8 px-2 text-xs border ${isCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <SelectValue>
                <span className={`block w-full text-left font-semibold`}>
                  {currentStatus.label}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {filteredOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${option.color}`}>
                    {option.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {status === 'CANCELLED' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold text-sm mb-1">
                    Cancelled By {appointment.cancelled_by === 'PATIENT' ? 'Patient' : (appointment.cancelled_by === 'DOCTOR' ? 'Doctor/Clinic' : '')}
                  </p>
                  <p className="text-xs max-w-[200px] break-words">{appointment.cancellation_reason}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}
