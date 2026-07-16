import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { billingService } from "@/features/billing/services/billing.service";
import { Button } from "@/components/ui/button";
import { InvoiceList } from "@/features/billing/components/InvoiceList";

interface Props {
  patientId: number;
}

export default function InvoiceTab({ patientId }: Props) {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["patient-invoices", patientId],
    queryFn: () => billingService.listInvoices({ patient_id: patientId, limit: 100 }),
    enabled: !!patientId,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold tracking-tight pl-2"></h2>
        <Button onClick={() => navigate(`/main/billing/invoice?patientId=${patientId}`)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Generate Invoice
        </Button>
      </div>

      <InvoiceList
        invoices={data?.invoices || []}
        isLoading={isLoading}
        onViewInvoice={(invoiceId) => navigate(`/main/billing/invoice?invoiceId=${invoiceId}&patientId=${patientId}`)}
      />
    </div>
  );
}
