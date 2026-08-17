
import { format } from 'date-fns';
import { User, Calendar, FileText, ArrowRight } from 'lucide-react';
import type { VisitItem } from '../types/visit.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VisitListProps {
  visits: VisitItem[];
  isLoading: boolean;
  navigate: (path: string) => void;
}

const getTypeColor = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'FOLLOW-UP': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
    case 'CONSULTATION': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    case 'EMERGENCY': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
    case 'ROUTINE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    case 'NEW PATIENT': return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200';
    case 'PROCEDURE': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
  }
};

export function VisitList({ visits, isLoading, navigate }: VisitListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground border rounded-md border-dashed">
        No visits found for the selected filters.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-card border rounded-md overflow-hidden">
        <div className="divide-y divide-border">
          {visits.map((visit) => (
            <VisitListItem
              key={visit.visit_id}
              visit={visit}
              navigate={navigate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function VisitListItem({
  visit,
  navigate,
}: {
  visit: VisitItem;
  navigate: (path: string) => void;
}) {

  // let age = '';
  // if (visit.patient?.age) {
  //   age = visit.patient.age.toString() + 'y';
  // }

  const visitDate = new Date(visit.visit_date);
  const isToday = format(new Date(), 'yyyy-MM-dd') === format(visitDate, 'yyyy-MM-dd');

  const handleOpenVisit = () => {
    if (visit.patient_id && visit.visit_id) {
      const params = new URLSearchParams();
      params.set("tab", "notes");
      params.set("visitId", String(visit.visit_id));
      navigate(`/main/patients/${visit.patient_id}/visit?${params.toString()}`);
    } else if (visit.patient_id) {
      navigate(`/main/patients/${visit.patient_id}/visit`);
    }
  };

  return (
    <div className="group/item relative flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-muted/30 transition-colors gap-4">
      <div className="flex-1 flex items-center gap-4 pl-2 cursor-pointer" onClick={handleOpenVisit}>
        {/* Info Layout */}
        <div className="flex-1 space-y-1.5">
          {/* Top Row: Patient Info */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/main/patients/${visit.patient_id}`); }}
              className="font-bold text-sm text-foreground group-hover/item:text-blue-600 hover:text-blue-600 dark:group-hover/item:text-blue-400 dark:hover:text-blue-400 hover:underline pr-1 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <User className="h-3.5 w-3.5" />
              {visit.patient?.title ? `${visit.patient.title} ` : ''}
              {visit.patient?.firstName} {visit.patient?.lastName}
            </button>
            <span className="text-muted-foreground font-medium">({visit.patient?.mrn})</span>

            {visit.status === 1 ? (
              <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide ml-2">ACTIVE</span>
            ) : (
              <span className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide ml-2">INACTIVE</span>
            )}
          </div>

          {/* Bottom Row: Visit Details & Doctor */}
          <div className="flex items-center gap-2 text-xs flex-wrap mt-1">
            <div className={cn("flex items-center gap-1 font-bold", isToday ? "text-blue-600 dark:text-blue-400" : "text-foreground")}>
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {format(visitDate, 'dd/MM/yyyy')}
              {isToday && <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-[9px] px-1 py-0 h-4 ml-1 border-none">Today</Badge>}
            </div>

            <div className="flex items-center gap-1.5 ml-1">
              {visit.visit_type && (
                <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 h-4 border-none ${getTypeColor(visit.visit_type)}`}>
                  {visit.visit_type}
                </Badge>
              )}
            </div>

            <span className="text-xs text-muted-foreground ml-1 bold">|</span>

            <span className="font-medium text-foreground whitespace-nowrap">
              {visit.doctor?.displayName}
            </span>

            {visit.reason_for_visit && (
              <span className="text-xs text-muted-foreground border-l pl-2 border-border/50 line-clamp-1 max-w-[250px]" title={visit.reason_for_visit}>
                {visit.reason_for_visit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex flex-col sm:items-end justify-center gap-2 pl-2 border-l border-border/50 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenVisit();
          }}
          className="text-primary hover:text-primary hover:bg-primary/10 -mr-2"
        >
          <FileText className="h-4 w-4 mr-2" />
          Notes
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
