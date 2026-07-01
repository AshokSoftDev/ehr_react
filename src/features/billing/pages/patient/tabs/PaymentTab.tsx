import { useState, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Banknote, CreditCard, Loader2, Smartphone, Building, CalendarDays } from "lucide-react";
import { useCreatePayment, usePatientPendingInvoices } from "@/features/billing/hooks/useBilling";

interface Props {
  patientId: number;
  advanceBalance: number;
}

export default function PaymentTab({ patientId, advanceBalance }: Props) {
  const { data: pendingInvoices = [], isLoading } = usePatientPendingInvoices(patientId);
  const createPaymentMutation = useCreatePayment();

  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<number[]>([]);
  const [payFromAdvance, setPayFromAdvance] = useState("");
  const [payNow, setPayNow] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-select all pending invoices initially
  useMemo(() => {
    if (pendingInvoices.length > 0 && selectedInvoiceIds.length === 0 && !isLoading) {
      setSelectedInvoiceIds(pendingInvoices.map(i => i.invoice_id));
    }
  }, [pendingInvoices, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedInvoices = pendingInvoices.filter(i => selectedInvoiceIds.includes(i.invoice_id));

  const totalPayable = selectedInvoices.reduce((sum, inv) => sum + Number(inv.balance_amount || 0), 0);

  // Calculate due after payment based on inputs
  const advanceAmount = parseFloat(payFromAdvance || "0");
  const nowAmount = parseFloat(payNow || "0");
  const totalPayment = advanceAmount + nowAmount;
  const dueAfterPayment = Math.max(0, totalPayable - totalPayment);

  const toggleInvoiceSelection = (id: number) => {
    if (selectedInvoiceIds.includes(id)) {
      setSelectedInvoiceIds(prev => prev.filter(invId => invId !== id));
    } else {
      setSelectedInvoiceIds(prev => [...prev, id]);
    }
  };

  const handlePay = async () => {
    if (selectedInvoices.length === 0) {
      toast.error("Please select at least one invoice to pay");
      return;
    }
    if (totalPayment <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    if (totalPayment > totalPayable) {
      toast.error("Total payment cannot exceed the total payable balance");
      return;
    }

    setIsProcessing(true);
    let remainingAdvancePool = advanceAmount;
    let remainingCashPool = nowAmount;

    try {
      // Sort oldest first
      const sortedInvoices = [...selectedInvoices].sort(
        (a, b) => new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime()
      );

      for (const invoice of sortedInvoices) {
        if (remainingAdvancePool <= 0 && remainingCashPool <= 0) break;

        const balance = Number(invoice.balance_amount || 0);

        const advanceToApply = Math.min(balance, remainingAdvancePool);
        remainingAdvancePool -= advanceToApply;

        const balanceAfterAdvance = balance - advanceToApply;

        const cashToApply = Math.min(balanceAfterAdvance, remainingCashPool);
        remainingCashPool -= cashToApply;

        if (advanceToApply > 0 || cashToApply > 0) {
          await createPaymentMutation.mutateAsync({
            invoice_id: invoice.invoice_id,
            patient_id: patientId,
            amount: cashToApply,
            payment_method: paymentMethod as any,
            from_advance: advanceToApply,
            notes: paymentNotes || undefined,
            payment_date: paymentDate.toISOString(),
          });
        }
      }

      toast.success("Payments processed successfully");
      setPayFromAdvance("");
      setPayNow("");
      setPaymentNotes("");
      setPaymentDate(new Date());
      setSelectedInvoiceIds([]);
    } catch (error) {
      toast.error("Failed to process some payments");
    } finally {
      setIsProcessing(false);
    }
  };

  // Sync logic for inputs
  const handleAdvanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valStr = e.target.value;
    if (valStr === "") {
      setPayFromAdvance("");
      return;
    }

    let val = parseFloat(valStr);
    const maxAdvance = Math.min(advanceBalance, totalPayable);

    if (val > maxAdvance) {
      val = maxAdvance;
      valStr = String(maxAdvance);
    }

    // Ensure sum doesn't exceed totalPayable
    const nowAmount = parseFloat(payNow || "0");
    if (val + nowAmount > totalPayable) {
      val = Math.max(0, totalPayable - nowAmount);
      valStr = String(val);
    }

    setPayFromAdvance(valStr);
  };

  const handleNowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valStr = e.target.value;
    if (valStr === "") {
      setPayNow("");
      return;
    }

    let val = parseFloat(valStr);
    const advanceVal = parseFloat(payFromAdvance || "0");
    const maxPay = Math.max(0, totalPayable - advanceVal);

    if (val > maxPay) {
      val = maxPay;
      valStr = maxPay.toFixed(2);
    }

    setPayNow(valStr);
  };

  const handlePayFullBalance = () => {
    const advanceToUse = Math.min(advanceBalance, totalPayable);
    const remaining = Math.max(0, totalPayable - advanceToUse);
    setPayFromAdvance(advanceToUse > 0 ? String(advanceToUse) : "");
    setPayNow(remaining > 0 ? remaining.toFixed(2) : "");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 border rounded-md overflow-x-auto h-fit">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground border-b">
            <tr>
              <th className="w-12 p-3 text-center">
                <Checkbox
                  checked={selectedInvoiceIds.length === pendingInvoices.length && pendingInvoices.length > 0}
                  onCheckedChange={(c) => {
                    if (c) setSelectedInvoiceIds(pendingInvoices.map(i => i.invoice_id));
                    else setSelectedInvoiceIds([]);
                  }}
                />
              </th>
              <th className="font-medium text-left p-3">Invoice No.</th>
              <th className="font-medium text-left p-3">Date</th>
              <th className="font-medium text-left p-3">Items</th>
              <th className="font-medium text-right p-3">Billed Amount</th>
              <th className="font-medium text-right p-3">Paid Amount</th>
              <th className="font-medium text-right p-3">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">Loading pending invoices...</td>
              </tr>
            ) : pendingInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">No pending invoices found.</td>
              </tr>
            ) : (
              pendingInvoices.map((invoice: any) => (
                <tr key={invoice.invoice_id} className="hover:bg-muted/30">
                  <td className="p-3 text-center">
                    <Checkbox
                      checked={selectedInvoiceIds.includes(invoice.invoice_id)}
                      onCheckedChange={() => toggleInvoiceSelection(invoice.invoice_id)}
                    />
                  </td>
                  <td className="p-3 font-medium">{invoice.invoice_number}</td>
                  <td className="p-3 text-muted-foreground">{format(new Date(invoice.invoice_date), "dd MMM yyyy")}</td>
                  <td className="p-3 text-muted-foreground text-xs truncate max-w-[200px]">
                    {invoice.items?.map((i: any) => i.item_name).join(", ")}
                  </td>
                  <td className="p-3 text-right">₹{Number(invoice.net_total).toFixed(2)}</td>
                  <td className="p-3 text-right text-green-600">₹{Number(invoice.paid_amount || 0).toFixed(2)}</td>
                  <td className="p-3 text-right font-medium text-orange-600">₹{Number(invoice.balance_amount || 0).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="lg:col-span-1 bg-muted/30 p-5 rounded-lg border space-y-4 h-fit">
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="text-sm font-medium text-muted-foreground">Total Payable:</div>
          <div className="text-xl font-bold text-right text-orange-700">₹{totalPayable.toFixed(2)}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="text-sm font-medium text-muted-foreground">Available Advance:</div>
          <div className="text-sm font-bold text-right text-green-700">₹{advanceBalance.toFixed(2)}</div>
        </div>

        <div className="flex justify-end pt-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handlePayFullBalance}
            disabled={totalPayable === 0 || totalPayment === totalPayable}
            className="text-xs h-7"
          >
            Auto-fill Full Balance
          </Button>
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="text-sm font-medium">Payment Date:</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !paymentDate && "text-muted-foreground")}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "dd MMM yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={paymentDate} onSelect={(date) => date && setPaymentDate(date)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="text-sm font-medium">Pay From Advance:</div>
            <Input
              type="number"
              value={payFromAdvance}
              onChange={handleAdvanceChange}
              disabled={totalPayable === 0 || advanceBalance === 0}
              className="text-right font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="text-sm font-medium">Pay Now (Method):</div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={payNow}
                onChange={handleNowChange}
                disabled={totalPayable === 0}
                className="text-right font-medium flex-1"
              />
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash"><div className="flex items-center gap-2"><Banknote className="h-3 w-3" /> Cash</div></SelectItem>
                  <SelectItem value="card"><div className="flex items-center gap-2"><CreditCard className="h-3 w-3" /> Card</div></SelectItem>
                  <SelectItem value="upi"><div className="flex items-center gap-2"><Smartphone className="h-3 w-3" /> UPI</div></SelectItem>
                  <SelectItem value="bank_transfer"><div className="flex items-center gap-2"><Building className="h-3 w-3" /> Bank Tx</div></SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 items-start">
            <div className="text-sm font-medium mt-2">Payment Notes:</div>
            <Textarea
              placeholder="Optional notes..."
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-center pt-2">
            <div className="text-sm font-medium text-muted-foreground">Due After Payment:</div>
            <div className="text-lg font-bold text-right">₹{dueAfterPayment.toFixed(2)}</div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            onClick={handlePay}
            disabled={totalPayable === 0 || isProcessing || totalPayment <= 0}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Make payment
          </Button>
        </div>
      </div>
    </div>
  );
}
