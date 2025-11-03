import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import type { VisitItem } from '../types/visit.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, User } from 'lucide-react';

export const createVisitColumns = (
  onView: (item: VisitItem) => void
): ColumnDef<VisitItem, unknown>[] => [
  {
    accessorKey: 'patient_mrn',
    header: 'MRN',
    cell: ({ row }) => {
      const mrn = row.original.patient?.mrn;
      return mrn ? (
        <Badge variant="secondary" className="font-mono">{mrn}</Badge>
      ) : null;
    },
  },
  {
    accessorKey: 'patient_name',
    header: 'Patient',
    cell: ({ row }) => {
      const p = row.original.patient;
      if (!p) return null;
      return (
        <div className="space-y-2">
          <div className="group flex items-center gap-2 text-left p-2 rounded-md w-full">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full">
              <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-medium text-blue-600 dark:text-blue-400">
                {p.title ? `${p.title} ` : ''}{p.firstName} {p.lastName}
              </div>
              <div className="text-xs text-muted-foreground">
                MRN: {p.mrn}
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'appointment_date',
    header: 'Date & Time',
    cell: ({ row }) => {
      const a = row.original;
      const date = new Date(a.appointment_date);
      const startTime = new Date(a.start_time);
      const endTime = new Date(a.end_time);
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
    header: 'Doctor',
    accessorKey: 'doctor',
    cell: ({ row }) => {
      const d = row.original.doctor;
      if (!d) return null;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{d.displayName}</span>
          <span className="text-xs text-muted-foreground">{d.specialty}</span>
        </div>
      );
    },
  },
  {
    header: 'Status',
    accessorKey: 'appointment_status',
    cell: ({ row }) => {
      const status = row.original.appointment_status;
      const statusColors: Record<string, string> = {
        Scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        Confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        Completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        'No-show': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        Rescheduled: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      };
      const cls = statusColors[status] || 'bg-gray-100 text-gray-800';
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>
          {status}
        </span>
      );
    },
  },
  {
    header: 'Reason',
    accessorKey: 'reason_for_visit',
    cell: ({ row }) => {
      const reason = row.original.reason_for_visit;
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
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-muted/50 text-primary"
        onClick={() => onView(row.original)}
        aria-label="View patient visit"
      >
        <Eye className="h-4 w-4" />
      </Button>
    ),
  },
];
