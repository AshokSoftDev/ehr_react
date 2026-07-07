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
  isReadOnly?: boolean;
}

export function PatientVitalsList({ vitals, isLoading, onEdit, onDelete, isReadOnly = false }: PatientVitalsListProps) {
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

              const bmiStatus = (() => {
                if (!vital.bmi) return null;
                if (vital.bmi < 18.5) return { label: 'Underweight', color: 'bg-pink-500' };
                if (vital.bmi < 25) return { label: 'Normal weight', color: 'bg-green-500' };
                if (vital.bmi < 30) return { label: 'Overweight', color: 'bg-orange-500' };
                return { label: 'Obese', color: 'bg-red-500' };
              })();

              const bpStatus = (() => {
                if (!vital.bp_systolic || !vital.bp_diastolic) return null;
                const sys = vital.bp_systolic;
                const dia = vital.bp_diastolic;
                if (sys > 180 || dia > 120) return { label: 'Crisis', color: 'bg-red-700' };
                if (sys >= 140 || dia >= 90) return { label: 'Stage 2', color: 'bg-red-500' };
                if (sys >= 130 || dia >= 80) return { label: 'Stage 1', color: 'bg-orange-500' };
                if (sys >= 120 && dia < 80) return { label: 'Elevated', color: 'bg-yellow-500' };
                return { label: 'Normal', color: 'bg-green-500' };
              })();

              // Helper to generate summary
              const summaryItems: any[] = [];
              if (vital.height) summaryItems.push(`Height: ${vital.height} ${vital.height_unit}`);
              if (vital.weight) summaryItems.push(`Weight: ${vital.weight} ${vital.weight_unit}`);
              if (vital.bmi) {
                summaryItems.push(
                  <span className="flex items-center gap-1.5">
                    BMI: {vital.bmi}
                    {bmiStatus && (
                      <Badge variant="outline" className={`${bmiStatus.color} text-white border-0 text-[10px] uppercase whitespace-nowrap px-1.5 py-0 h-4 min-h-0`}>
                        {bmiStatus.label}
                      </Badge>
                    )}
                  </span>
                );
              }
              if (vital.bp_systolic && vital.bp_diastolic) {
                summaryItems.push(
                  <span className="flex items-center gap-1.5">
                    BP: {vital.bp_systolic}/{vital.bp_diastolic} mmHg
                    {bpStatus && (
                      <Badge variant="outline" className={`${bpStatus.color} text-white border-0 text-[10px] uppercase whitespace-nowrap px-1.5 py-0 h-4 min-h-0`}>
                        {bpStatus.label}
                      </Badge>
                    )}
                  </span>
                );
              }
              if (vital.temperature) summaryItems.push(`Temp: ${vital.temperature} °${vital.temperature_unit === 'fahrenheit' ? 'F' : 'C'}`);
              if (vital.pulse) summaryItems.push(`Pulse: ${vital.pulse}`);
              if (vital.rr) summaryItems.push(`RR: ${vital.rr}`);

              return (
                <div
                  key={vital.vital_id}
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-muted/30 transition-colors gap-2 text-left group"
                >
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm transition-colors flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {formattedDate} {vital.vital_time ? `| ${vital.vital_time}` : `| ${format(new Date(vital.createdAt), 'hh:mm a')}`}
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

                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-2 gap-y-1">
                      {summaryItems.length > 0 ? (
                        summaryItems.map((item, idx) => (
                          <span key={idx} className="flex items-center">
                            {idx > 0 && <span className="mx-2 text-border">|</span>}
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="italic">No measurements recorded</span>
                      )}
                    </div>
                  </div>

                  {!isReadOnly && (
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
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
