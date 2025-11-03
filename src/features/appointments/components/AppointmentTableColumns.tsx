import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, User, Calendar } from 'lucide-react';
import type { AppointmentItem } from '../types/appointment.types';

interface AppointmentTableColumnsProps {
  onEdit: (appointment: AppointmentItem) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  navigate: (path: string) => void;
}

export const createAppointmentColumns = ({ onEdit, onDelete, onStatusChange, navigate }: AppointmentTableColumnsProps): ColumnDef<AppointmentItem>[] => [
  {
    accessorKey: 'patient_mrn',
    header: 'MRN',
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-mono">
        {row.getValue('patient_mrn')}
      </Badge>
    ),
  },
  {
    accessorKey: 'patient_name',
    header: 'Patient',
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="space-y-2">
          <button
            onClick={() => navigate(`/main/patients/${appointment.patient_id}`)}
            className="group flex items-center gap-2 text-left hover:bg-blue-50 dark:hover:bg-blue-950 p-2 rounded-md transition-colors w-full"
          >
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
              <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:underline">
                {appointment.patient_title} {appointment.patient_firstName} {appointment.patient_lastName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Click to view patient details
              </div>
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
          <div className={`flex items-center gap-2 text-sm font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : isPast ? 'text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
            <Calendar className="h-3 w-3" />
            {format(date, 'dd/MM/yyyy')}
            {isToday && <Badge variant="default" className="text-xs px-1 py-0">Today</Badge>}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
            {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
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
      const status = appointment.appointment_status;
      
      const statusOptions = [
        { value: 'Scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
        { value: 'Confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
        { value: 'Completed', label: 'Completed', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
        { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
        { value: 'No-show', label: 'No-show', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
        { value: 'Rescheduled', label: 'Rescheduled', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
      ];
      
      const currentStatus = statusOptions.find(s => s.value === status);
      
      const isCompleted = status === 'Completed';
      
      return (
        <Select 
          value={status} 
          onValueChange={(newStatus) => onStatusChange(appointment.appointment_id, newStatus)}
          disabled={isCompleted}
        >
          <SelectTrigger className={`w-32 h-8 ${isCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <SelectValue>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentStatus?.color || 'bg-gray-100 text-gray-800'}`}>
                {status}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
                  {option.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: 'reason_for_visit',
    header: 'Reason',
    cell: ({ row }) => {
      const reason = row.getValue('reason_for_visit') as string;
      return reason ? (
        <div className="max-w-[200px] truncate text-sm" title={reason}>
          {reason}
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    enableHiding: false,
    cell: ({ row }) => {
      const appointment = row.original;

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(appointment)}
            className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
            title="Edit appointment"
          >
            <Pencil className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(appointment.appointment_id)}
            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            title="Delete appointment"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      );
    },
  },
];