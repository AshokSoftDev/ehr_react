import type { ColumnDef } from '@tanstack/react-table';
import { format, differenceInYears } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, User, Calendar, Clock, Info } from 'lucide-react';
import type { AppointmentItem } from '../types/appointment.types';

interface AppointmentTableColumnsProps {
  onEdit: (appointment: AppointmentItem) => void;
  onStatusChange: (id: number, status: string) => void;
  navigate: (path: string) => void;
}

export const createAppointmentColumns = ({ onEdit, onStatusChange, navigate }: AppointmentTableColumnsProps): ColumnDef<AppointmentItem>[] => [
  {
    accessorKey: 'appointment_date',
    header: 'Date & Time',
    cell: ({ row }) => {
      const appointment = row.original;
      const date = new Date(appointment.appointment_date);
      const startTime = new Date(appointment.start_time);
      const endTime = new Date(appointment.end_time);
      const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      const isPast = date < new Date();

      return (
        <div className="space-y-1">
          <div className={`flex items-center gap-2 text-xs font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : isPast ? 'text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
            <Calendar className="h-3 w-3 text-blue-500" />
            {format(date, 'dd/MM/yyyy')}
            {isToday && <Badge variant="default" className="text-xs px-1 py-0">Today</Badge>}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 font-mono">
            <Clock className="h-3 w-3 text-blue-500" />
            {format(startTime, 'hh:mm a')} - {format(endTime, 'hh:mm a')}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'patient_name',
    header: 'Patient',
    cell: ({ row }) => {
      const appointment = row.original;

      let age = '';
      if (appointment.patient?.dateOfBirth) {
        age = differenceInYears(new Date(), new Date(appointment.patient.dateOfBirth)).toString() + 'y';
      }

      const gender = appointment.patient?.gender ? appointment.patient.gender[0].toUpperCase() : '';
      const demo = [age, gender].filter(Boolean).join('/');

      return (
        <div className="space-y-1">
          <button
            onClick={() => navigate(`/main/patients/${appointment.patient_id}`)}
            className="group flex items-center gap-2 text-left hover:bg-blue-50 dark:hover:bg-blue-950 p-1 rounded-md transition-colors w-full"
          >
            <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors shrink-0">
              <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:underline">
                {appointment.patient_title} {appointment.patient_firstName} {appointment.patient_lastName}
                <span className="text-muted-foreground font-normal ml-1 text-xs no-underline">
                  ({appointment.patient_mrn})
                </span>
              </div>
              {demo && (
                <div className="text-xs text-muted-foreground">
                  {demo}
                </div>
              )}
            </div>
          </button>
        </div>
      );
    },
  },
  {
    accessorKey: 'doctor_name',
    header: 'Doctor',
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="space-y-1">
          <div className="font-medium">
            {appointment.doctor_title} {appointment.doctor_firstName} {appointment.doctor_lastName}
          </div>
          <div className="text-xs text-muted-foreground">
            {appointment.doctor_specialty}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'appointment_type',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.getValue('appointment_type')}
      </Badge>
    ),
  },
  {
    accessorKey: 'appointment_status',
    header: 'Status',
    cell: ({ row }) => {
      const appointment = row.original;
      const status = (appointment.appointment_status || '').toUpperCase();

      const statusOptions = [
        { value: 'SCHEDULED', label: 'Scheduled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
        { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
        { value: 'CHECKED-IN', label: 'Checked-In', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' },
        { value: 'CHECKED-OUT', label: 'Checked-Out', color: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300' },
        { value: 'RESCHEDULED', label: 'Rescheduled', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300' },
        { value: 'NO-SHOW', label: 'No-Show', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
        { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
        { value: 'WITH DOCTOR', label: 'With Doctor', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' },
        { value: 'WAIT LIST', label: 'Wait List', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
      ];

      const allowedTransitions: Record<string, string[]> = {
        'SCHEDULED': ['CONFIRMED', 'CANCELLED', 'NO-SHOW', 'RESCHEDULED'],
        'CONFIRMED': ['CHECKED-IN', 'NO-SHOW', 'CANCELLED', 'RESCHEDULED'],
        'CHECKED-IN': ['WITH DOCTOR', 'NO-SHOW'],
        'WITH DOCTOR': ['CHECKED-OUT'],
        'RESCHEDULED': ['CONFIRMED', 'CANCELLED', 'NO-SHOW'],
      };

      const validNextStatuses = allowedTransitions[status] || [];
      const filteredOptions = statusOptions.filter(opt => opt.value === status || validNextStatuses.includes(opt.value));

      const currentStatus = statusOptions.find(s => s.value === status);

      const isCompleted = status === 'CHECKED-OUT' || status === 'CANCELLED';

      return (
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onValueChange={(newStatus) => onStatusChange(appointment.appointment_id, newStatus)}
            disabled={isCompleted}
          >
            <SelectTrigger className={`w-[130px] h-7 px-2 text-xs ${isCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <SelectValue>
                <span className={`truncate block w-full text-left font-medium px-1.5 py-0.5 rounded-full ${currentStatus?.color || 'bg-gray-100 text-gray-800'}`}>
                  {currentStatus?.label || status}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {filteredOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
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
      );
    },
  },

  {
    id: 'actions',
    header: 'Actions',
    enableHiding: false,
    cell: ({ row }) => {
      const appointment = row.original;
      const isLocked = appointment.appointment_status?.toUpperCase() === 'CHECKED-OUT' || appointment.appointment_status?.toUpperCase() === 'CANCELLED';

      return (
        <div className="flex items-center gap-3">
          {appointment.token ? (
            <Badge variant="outline" className="font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              #{appointment.token}
            </Badge>
          ) : null}
          {!isLocked && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(appointment);
              }}
              className="h-8 w-8 hover:bg-muted/50 text-primary hover:text-primary shrink-0"
              aria-label="Edit appointment"
              title="Edit appointment"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
