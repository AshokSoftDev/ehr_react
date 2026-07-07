import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Activity, Edit, Trash2 } from 'lucide-react';
import type { PatientVital } from '../../types/vital.types';
import { format } from 'date-fns';

interface PatientVitalsListProps {
  vitals: PatientVital[];
  isLoading: boolean;
  onEdit: (vital: PatientVital) => void;
  onDelete: (vital: PatientVital) => void;
}

export function PatientVitalsList({ vitals, isLoading, onEdit, onDelete }: PatientVitalsListProps) {
  if (isLoading) {
    return (
      <Card className="border-border shadow-sm overflow-hidden p-0">
        <CardContent className="p-0">
          <div className="space-y-2 p-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (vitals.length === 0) {
    return (
      <Card className="border-border shadow-sm overflow-hidden p-0">
        <CardContent className="p-0">
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 m-3 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm font-medium">No vitals found</p>
            <p className="text-xs text-muted-foreground mb-3">Record vitals to see them here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm overflow-hidden p-0">
      <CardContent className="p-0">
        <ScrollArea className="max-h-[500px]">
          <div className="divide-y divide-border rounded-lg bg-card overflow-hidden">
            {vitals.map((vital) => {
              const dateObj = new Date(vital.vital_date);
              const formattedDate = format(dateObj, 'MMM dd, yyyy');
              
              // Helper to generate summary
              const summaryItems = [];
              if (vital.bp_systolic && vital.bp_diastolic) summaryItems.push(`BP: ${vital.bp_systolic}/${vital.bp_diastolic} mmHg`);
              if (vital.pulse) summaryItems.push(`Pulse: ${vital.pulse}`);
              if (vital.temperature) summaryItems.push(`Temp: ${vital.temperature} °${vital.temperature_unit === 'fahrenheit' ? 'F' : 'C'}`);
              if (vital.weight) summaryItems.push(`Weight: ${vital.weight} ${vital.weight_unit}`);
              if (vital.bmi) summaryItems.push(`BMI: ${vital.bmi}`);

              return (
                <div
                  key={vital.vital_id}
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-muted/30 transition-colors gap-2 text-left group"
                >
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                        Vitals Record
                      </span>
                      {vital.visit && (
                        <>
                          <span className="text-xs text-muted-foreground">|</span>
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold bg-primary/10 text-primary border-primary/20">
                            Visit #{vital.visit.visit_id}
                          </Badge>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formattedDate} {vital.vital_time ? `at ${vital.vital_time}` : ''}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      {summaryItems.length > 0 ? (
                        summaryItems.map((item, idx) => (
                          <span key={idx} className="flex items-center">
                            {idx > 0 && <span className="mr-4 text-border">•</span>}
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="italic">No measurements recorded</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-start border-l pl-3 border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(vital)}
                      className="h-8 w-8 p-0 hover:bg-blue-50"
                      title="Edit Vitals"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(vital)}
                      className="h-8 w-8 p-0 hover:bg-red-50"
                      title="Delete Vitals"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
