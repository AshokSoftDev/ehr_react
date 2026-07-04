import { useDentalHpiList } from "@/features/visits/hooks/useDentalHpi";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Calendar } from "lucide-react";
import { format } from "date-fns";

export function HPIOverviewCardView({ visitId }: { visitId?: number }) {
  const { data: hpiList, isLoading } = useDentalHpiList(visitId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
    );
  }

  if (!hpiList || hpiList.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-muted-foreground text-sm">
        No HPI records found for this visit.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {hpiList.map((record) => {
        const teethAffected = Object.keys(record.teeth_surfaces || {});
        return (
          <div 
            key={record.hpi_id} 
            className="flex flex-col p-4 hover:bg-muted/30 transition-colors gap-2"
          >
            <div className="flex flex-col gap-1">
              {/* Line 1: Title, Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm flex items-center gap-1.5 text-foreground">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    {record.dentition_type.toUpperCase()} DENTITION
                  </h4>
                  {record.severity && (
                    <Badge variant="outline" className={`text-[9px] h-4 px-1.5 py-0 border-none ${
                      record.severity === 'severe' ? 'bg-red-100 text-red-800' :
                      record.severity === 'moderate' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {record.severity}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 font-medium text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(record.createdAt), "MMM d, yyyy")}
                </div>
              </div>

              {/* Line 2: Details inline */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                {record.chief_complaints?.length > 0 && (
                  <>
                    <span className="truncate max-w-[250px]" title={record.chief_complaints.join(', ')}>
                      <strong className="text-foreground font-medium">Complaints:</strong> {record.chief_complaints.join(', ')}
                    </span>
                  </>
                )}

                {/* Duration */}
                {(record.duration_years || record.duration_months || record.duration_weeks || record.duration_days) && (
                  <>
                    {record.chief_complaints?.length > 0 && <span className="text-muted-foreground/40">|</span>}
                    <span className="whitespace-nowrap">
                      <strong className="text-foreground font-medium">Duration:</strong>{' '}
                      {[
                        record.duration_years ? `${record.duration_years}y` : null,
                        record.duration_months ? `${record.duration_months}m` : null,
                        record.duration_weeks ? `${record.duration_weeks}w` : null,
                        record.duration_days ? `${record.duration_days}d` : null,
                      ].filter(Boolean).join(' ')}
                    </span>
                  </>
                )}

                {/* Teeth */}
                {teethAffected.length > 0 && (
                  <>
                    {((record.duration_years || record.duration_months || record.duration_weeks || record.duration_days) || record.chief_complaints?.length > 0) && (
                      <span className="text-muted-foreground/40">|</span>
                    )}
                    <span className="truncate max-w-[200px]" title={teethAffected.join(', ')}>
                      <strong className="text-foreground font-medium">Teeth:</strong> {teethAffected.join(', ')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
