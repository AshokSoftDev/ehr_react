import { format } from "date-fns";
import { Plus, Eye, Printer, FileText, User } from "lucide-react";
import type { BillingVisit, Receipt as ReceiptType, Invoice } from "../types/billing.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BillingVisitListProps {
  visits: BillingVisit[];
  isLoading: boolean;
  onGenerateInvoice: (visit: BillingVisit) => void;
  onViewInvoice: (visit: BillingVisit) => void;
  onViewReceipt: (receipt: ReceiptType) => void;
  onPrintReceipt: (receipt: ReceiptType) => void;
  onPrintInvoice: (invoice: Invoice) => void;
}

export function BillingVisitList({
  visits,
  isLoading,
  onGenerateInvoice,
  onViewInvoice,
  onViewReceipt,
  onPrintReceipt,
  onPrintInvoice,
}: BillingVisitListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 w-full bg-muted animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground border rounded-md border-dashed">
        No active visits available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-card border rounded-md overflow-hidden">
        <div className="divide-y divide-border">
          {visits.map((visit) => (
            <BillingVisitItem
              key={visit.visit_id}
              visit={visit}
              onGenerateInvoice={onGenerateInvoice}
              onViewInvoice={onViewInvoice}
              onViewReceipt={onViewReceipt}
              onPrintReceipt={onPrintReceipt}
              onPrintInvoice={onPrintInvoice}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BillingVisitItem({
  visit,
  onGenerateInvoice,
  onViewInvoice,
  onViewReceipt,
  onPrintReceipt,
  onPrintInvoice,
}: {
  visit: BillingVisit;
  onGenerateInvoice: (visit: BillingVisit) => void;
  onViewInvoice: (visit: BillingVisit) => void;
  onViewReceipt: (receipt: ReceiptType) => void;
  onPrintReceipt: (receipt: ReceiptType) => void;
  onPrintInvoice: (invoice: Invoice) => void;
}) {
  const invoice = visit.invoices?.[0] ?? null;
  const receipt = invoice?.receipts?.[0] ?? null;
  const hasInvoice = !!invoice;
  const isPaid = invoice?.status === "paid";
  const isPartial = invoice?.status === "partial";
  const isDraft = hasInvoice && !isPaid && !isPartial;
  const visitDate = new Date(visit.visit_date);

  return (
    <div className="group/item relative flex flex-col sm:flex-row sm:items-center justify-between p-2 hover:bg-muted/30 transition-colors gap-4">
      <div className="flex-1 flex items-start gap-4">
        {/* Status Indicator Bar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${isPaid ? 'bg-green-500' : isPartial ? 'bg-yellow-500' : isDraft ? 'bg-orange-500' : 'bg-gray-300'
            }`}
        />

        <div className="flex-1 space-y-3 pl-2">
          {/* Top Row: Patient Info & Visit ID */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full shrink-0">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-bold text-base text-foreground">
                {visit.patient?.firstName} {visit.patient?.lastName}
              </span>
              <span className="text-muted-foreground font-medium text-sm">
                (MRN: {visit.patient?.mrn})
              </span>
            </div>

            <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
              Visit #{visit.visit_id}
            </div>
          </div>

          {/* Details Row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm ml-9">
            <div className="flex flex-col">
              <span className="font-medium">
                {format(visitDate, "dd MMM yyyy")}
                <span className="text-muted-foreground ml-1 font-normal">{format(visitDate, "hh:mm a")}</span>
              </span>
            </div>

            <div className="flex flex-col">
              <Badge variant="outline" className="h-5 text-xs font-medium px-1.5 rounded-sm">
                {visit.visit_type}
              </Badge>
            </div>

            <div className="flex flex-col">
              <span className="font-medium text-muted-foreground">
                {visit.doctor?.displayName ? `Dr. ${visit.doctor.displayName}` : "-"}
              </span>
            </div>

            <div className="flex flex-col">
              <div>
                {isPaid ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none text-xs rounded-sm h-5">Paid</Badge>
                ) : isPartial ? (
                  <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none shadow-none text-xs rounded-sm h-5">Partial</Badge>
                ) : isDraft ? (
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none shadow-none text-xs rounded-sm h-5">Draft</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs rounded-sm h-5 shadow-none">No Invoice</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 pl-4 border-l border-border/50 shrink-0 min-w-[120px] justify-end">
        {!hasInvoice && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onGenerateInvoice(visit)}
            className="h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5 shadow-none"
          >
            <Plus className="h-3.5 w-3.5" /> Generate Invoice
          </Button>
        )}

        {(isDraft || isPartial) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewInvoice(visit)}
            className="h-8 text-xs gap-1.5 text-orange-600 border-orange-300 hover:bg-orange-50 shadow-none"
          >
            <FileText className="h-3.5 w-3.5" /> View / Pay
          </Button>
        )}

        {isPaid && receipt && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewReceipt(receipt)}
              className="h-8 w-8 hover:bg-blue-50 text-blue-600 rounded-full"
              title="View Receipt"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPrintReceipt(receipt)}
              className="h-8 w-8 hover:bg-green-50 text-green-600 rounded-full"
              title="Print Receipt"
            >
              <Printer className="h-4 w-4" />
            </Button>
            {invoice && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onPrintInvoice(invoice)}
                className="h-8 w-8 hover:bg-purple-50 text-purple-600 rounded-full"
                title="Print Invoice"
              >
                <FileText className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
