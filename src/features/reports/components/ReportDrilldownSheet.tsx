import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Calendar, User, DollarSign, Activity, Tag, Layers } from 'lucide-react';

interface ReportDrilldownSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  data?: Record<string, any> | null;
  onExport?: (item: any) => void;
}

export const ReportDrilldownSheet: React.FC<ReportDrilldownSheetProps> = ({
  open,
  onOpenChange,
  title = 'Analytical Record Detail',
  data,
  onExport,
}) => {
  if (!data) return null;

  const renderIcon = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes('date') || k.includes('time') || k.includes('year') || k.includes('month')) {
      return <Calendar className="h-4 w-4" />;
    }
    if (k.includes('patient') || k.includes('doctor') || k.includes('name') || k.includes('mrn')) {
      return <User className="h-4 w-4" />;
    }
    if (k.includes('amount') || k.includes('total') || k.includes('revenue') || k.includes('price') || k.includes('balance')) {
      return <DollarSign className="h-4 w-4" />;
    }
    if (k.includes('vital') || k.includes('pulse') || k.includes('bp') || k.includes('bmi')) {
      return <Activity className="h-4 w-4" />;
    }
    if (k.includes('status') || k.includes('type')) {
      return <Tag className="h-4 w-4" />;
    }
    return <Layers className="h-4 w-4" />;
  };

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (val instanceof Date) return val.toLocaleString();
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[600px] lg:w-[800px] sm:max-w-none p-0 flex flex-col h-full bg-background"
      >
        <SheetHeader className="px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="section-icon text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-lg font-semibold text-foreground">{title}</SheetTitle>
              <p className="text-xs text-muted-foreground">Comprehensive drilldown log and data properties</p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 px-5 py-4 space-y-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <div className="section-icon text-primary">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Record Attributes</h3>
                  <p className="text-xs text-muted-foreground">Key metrics and transactional breakdown</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {Object.entries(data).map(([key, value]) => {
                  if (key === 'id' || key === '_id') return null;
                  return (
                    <div key={key} className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                        {renderIcon(key)}
                        <span className="text-xs font-medium uppercase tracking-wider">
                          {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-foreground truncate break-words">
                        {formatValue(value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-3 px-5 py-3 border-t border-border bg-background shrink-0">
          <Button
            type="button"
            className="btn-cancel"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {onExport && (
            <Button
              type="button"
              className="btn-primary"
              onClick={() => onExport(data)}
            >
              Export Summary
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
