import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FileText,
  CalendarDays,
  ArrowLeft,
  CreditCard,
  Loader2,
  Plus,
  CheckCircle,
  Save,
  X,
  User,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
// import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { visitService } from "@/features/visits/services/visit.service";
import { patientService } from "@/features/patients/services/patient.service";
import { useDrugSearch } from "@/features/visits/hooks/useDrugs";
import {
  useVisitPrescriptionsForInvoice,
  useCreateInvoice,
  useUpdateInvoice,
  useAdvanceBalance,
} from "../hooks/useBilling";
import type { InvoiceItemRow, CreateInvoiceDto, Invoice } from "../types/billing.types";
import type { Drug } from "@/features/visits/types/drug.types";
import { billingService } from "../services/billing.service";

// Generate unique ID for rows
const generateId = () => Math.random().toString(36).substr(2, 9);

// Calculate item amounts
const calculateItemAmounts = (item: InvoiceItemRow) => {
  const quantity = item.quantity ?? 1;
  const unitAmount = item.unit_amount ?? 0;
  const premium = item.premium ?? 0;
  const baseAmount = quantity * unitAmount;
  const withPremium = baseAmount + premium;

  let discountAmount = 0;
  if (item.discount_type === "percentage") {
    discountAmount = withPremium * ((item.discount_value ?? 0) / 100);
  } else {
    discountAmount = item.discount_value ?? 0;
  }

  const netAmount = Math.max(0, withPremium - discountAmount);

  return {
    base_amount: Math.round(baseAmount * 100) / 100,
    premium_amount: Math.round(premium * 100) / 100,
    discount_amount: Math.round(discountAmount * 100) / 100,
    net_amount: Math.round(netAmount * 100) / 100,
  };
};

// Inline Drug Search Row Component
function InlineDrugSearchRow({
  onDrugSelect,
  disabled
}: {
  onDrugSelect: (drug: Drug) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { data: drugs, isLoading } = useDrugSearch(query);

  const handleSelect = (drug: Drug) => {
    onDrugSelect(drug);
    setQuery("");
    setOpen(false);
  };

  return (
    <tr className="bg-muted/10">
      <td className="p-2 text-muted-foreground">
        <Plus className="h-3 w-3" />
      </td>
      <td className="p-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor asChild>
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.length >= 2) setOpen(true);
                else setOpen(false);
              }}
              onFocus={() => {
                if (query.length >= 2) setOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder="Search drugs to add..."
              className="h-8 text-xs w-full max-w-[250px]"
              disabled={disabled}
            />
          </PopoverAnchor>
          <PopoverContent
            className="w-[300px] p-0"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command shouldFilter={false}>
              <CommandList>
                {isLoading ? (
                  <div className="p-3 text-xs text-muted-foreground text-center">
                    Searching...
                  </div>
                ) : drugs && drugs.length > 0 ? (
                  <CommandGroup>
                    {drugs.map((drug) => (
                      <CommandItem
                        key={drug.drug_id}
                        value={`${drug.drug_generic} ${drug.drug_name}`}
                        onSelect={() => handleSelect(drug)}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="font-medium">
                          {drug.drug_generic} <span className="text-muted-foreground font-normal">({drug.drug_name})</span>
                        </span>
                        <span className="text-muted-foreground">
                          ₹{Number(drug.amount || 0).toFixed(2)}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <CommandEmpty className="py-2 text-xs">No drugs found.</CommandEmpty>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </td>
      <td className="p-2" />
      <td className="p-2" />
      <td className="p-2" />
      <td className="p-2" />
      <td className="p-2" />
      <td className="p-2" />
      <td className="p-2" />
    </tr>
  );
}

export function InvoicePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const visitIdFromUrl = searchParams.get("visitId");
  const patientIdFromUrl = searchParams.get("patientId");
  const invoiceIdFromUrl = searchParams.get("invoiceId");

  // State
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItemRow[]>([]);
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [discountReason, setDiscountReason] = useState("");

  // Payment State
  // const [paymentMethod] = useState<string>("cash");
  // const [payAmount, setPayAmount] = useState<string>("");
  // const [useAdvance, setUseAdvance] = useState(false);
  // const [advanceToUse, setAdvanceToUse] = useState<string>("");

  const [isSaving, setIsSaving] = useState(false);
  const [receiptsGenerated, setReceiptsGenerated] = useState<any[]>([]);

  // 1. Fetch Visit (if visitId provided)
  const { data: visitsData, isLoading: visitsLoading } = useQuery({
    queryKey: ["invoice-visit", visitIdFromUrl],
    queryFn: () => visitService.list({ status: "1", page: 1, limit: 50 }),
    enabled: !!visitIdFromUrl,
  });

  const selectedVisit = useMemo(() => {
    if (visitIdFromUrl && visitsData?.visits) {
      return visitsData.visits.find((v) => v.visit_id === Number(visitIdFromUrl));
    }
    return null;
  }, [visitIdFromUrl, visitsData]);

  // 2. Fetch Patient (if patientId provided directly)
  const { data: directPatient, isLoading: patientLoading } = useQuery({
    queryKey: ["patient", patientIdFromUrl],
    queryFn: () => patientService.getPatient(Number(patientIdFromUrl)),
    enabled: !!patientIdFromUrl && !visitIdFromUrl,
  });

  const resolvedPatientId = selectedVisit?.patient_id || directPatient?.patient_id;
  const resolvedPatient = selectedVisit?.patient || directPatient;

  // 3. Fetch Advance Balance
  const { data: advanceData } = useAdvanceBalance(resolvedPatientId ?? 0);
  const advanceBalance = advanceData?.balance || 0;

  // 4. Fetch Prescriptions (if visit)
  const { data: prescriptionItems, isLoading: prescriptionsLoading } =
    useVisitPrescriptionsForInvoice(selectedVisit?.visit_id ?? 0);

  // 5. Fetch existing invoices (for visit or specific invoice)
  const { data: existingInvoicesData } = useQuery({
    queryKey: ["visit-invoices", selectedVisit?.visit_id, invoiceIdFromUrl],
    queryFn: async () => {
      if (invoiceIdFromUrl) {
        const inv = await billingService.getInvoice(Number(invoiceIdFromUrl));
        return { invoices: [inv], total: 1, page: 1, totalPages: 1 };
      }
      if (selectedVisit?.visit_id) {
        return billingService.listInvoices({ visit_id: selectedVisit.visit_id });
      }
      return { invoices: [], total: 0, page: 1, totalPages: 1 };
    },
    enabled: !!selectedVisit?.visit_id || !!invoiceIdFromUrl,
  });

  // Mutations
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();
  // const createPaymentMutation = useCreatePayment();

  // Load existing invoice or prescriptions
  useEffect(() => {
    if (resolvedPatientId && existingInvoicesData?.invoices && existingInvoicesData.invoices.length > 0) {
      const existingInvoice = existingInvoicesData.invoices[0];
      setSavedInvoice(existingInvoice);

      const existingItems: InvoiceItemRow[] = existingInvoice.items.map((item) => ({
        _id: generateId(),
        item_type: item.item_type,
        item_name: item.item_name,
        reference_id: item.reference_id,
        quantity: Number(item.quantity) || 1,
        unit_amount: Number(item.unit_amount) || 0,
        premium: Number(item.premium) || 0,
        discount_type: item.discount_type,
        discount_value: Number(item.discount_value) || 0,
        tax_applicable: item.tax_applicable,
        notes: item.notes,
        assigned_user: item.assigned_user,
      }));
      setItems(existingItems);
      setDiscountType(existingInvoice.discount_type);
      setDiscountValue(Number(existingInvoice.discount_value) || 0);
      setCouponCode(existingInvoice.coupon_code || "");
      setDiscountReason(existingInvoice.discount_reason || "");
      setInvoiceDate(new Date(existingInvoice.invoice_date));

      // Reset payment amounts
      // setPayAmount(Number(existingInvoice.balance_amount || 0).toFixed(2));

      // Load receipts
      billingService.getInvoicePayments(existingInvoice.invoice_id).then(receipts => {
        setReceiptsGenerated(receipts);
      });

    } else if (selectedVisit && prescriptionItems && prescriptionItems.length > 0 && !existingInvoicesData?.invoices?.length) {
      const initialItems: InvoiceItemRow[] = prescriptionItems.map((p) => ({
        _id: generateId(),
        item_type: p.item_type,
        item_name: p.item_name,
        reference_id: p.reference_id,
        quantity: p.quantity ?? 1,
        unit_amount: p.unit_amount ?? 0,
        premium: 0,
        discount_type: "percentage" as const,
        discount_value: 0,
        tax_applicable: false,
        notes: p.notes,
      }));
      setItems(initialItems);
      setSavedInvoice(null);
    } else if (resolvedPatientId && (!prescriptionItems || prescriptionItems.length === 0) && !existingInvoicesData?.invoices?.length) {
      setItems([]);
      setSavedInvoice(null);
    }
  }, [selectedVisit, resolvedPatientId, prescriptionItems, existingInvoicesData]);

  // When savedInvoice updates, keep payAmount in sync with balance
  // useEffect(() => {
  //   if (savedInvoice) {
  //     setPayAmount(Number(savedInvoice.balance_amount || 0).toFixed(2));
  //   }
  // }, [savedInvoice?.balance_amount]);

  // Navigate back
  const handleBackToBilling = useCallback(() => {
    if (resolvedPatientId) {
      navigate(`/main/billing/patient/${resolvedPatientId}`);
    } else {
      navigate("/main/billing");
    }
  }, [navigate, resolvedPatientId]);

  // Item operations
  const updateItem = useCallback((id: string, updates: Partial<InvoiceItemRow>) => {
    setItems((prev) => prev.map((item) => (item._id === id ? { ...item, ...updates } : item)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item._id !== id));
  }, []);

  const handleAddDrug = useCallback((drug: Drug) => {
    const newItem: InvoiceItemRow = {
      _id: generateId(),
      item_type: "drug",
      item_name: `${drug.drug_generic} (${drug.drug_name})`,
      reference_id: drug.drug_id,
      quantity: 1,
      unit_amount: Number(drug.amount) || 0,
      premium: 0,
      discount_type: "percentage",
      discount_value: 0,
      tax_applicable: false,
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  // Totals
  const totals = useMemo(() => {
    const itemsWithAmounts = items.map((item) => ({ ...item, ...calculateItemAmounts(item) }));
    const baseSubtotal = items.reduce((sum, item) => sum + (item.quantity ?? 1) * (item.unit_amount ?? 0), 0);
    const totalPremium = items.reduce((sum, item) => sum + (item.premium ?? 0), 0);
    const totalItemDiscount = itemsWithAmounts.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
    const grossTotal = itemsWithAmounts.reduce((sum, item) => sum + (item.net_amount || 0), 0);

    let invoiceDiscountAmount = 0;
    if (discountType === "percentage") {
      invoiceDiscountAmount = grossTotal * (discountValue / 100);
    } else {
      invoiceDiscountAmount = discountValue;
    }

    let couponDiscountAmount = 0;
    const trimmedCoupon = couponCode.trim().toUpperCase();
    if (trimmedCoupon.startsWith("CC")) {
      const couponAmount = parseFloat(trimmedCoupon.substring(2));
      if (!isNaN(couponAmount) && couponAmount > 0) {
        couponDiscountAmount = couponAmount;
      }
    }

    const netTotal = Math.max(0, grossTotal - invoiceDiscountAmount - couponDiscountAmount);

    return {
      baseSubtotal: Math.round(baseSubtotal * 100) / 100,
      totalPremium: Math.round(totalPremium * 100) / 100,
      totalItemDiscount: Math.round(totalItemDiscount * 100) / 100,
      grossTotal: Math.round(grossTotal * 100) / 100,
      invoiceDiscount: Math.round(invoiceDiscountAmount * 100) / 100,
      couponDiscount: Math.round(couponDiscountAmount * 100) / 100,
      netTotal: Math.round(netTotal * 100) / 100,
    };
  }, [items, discountType, discountValue, couponCode]);

  // Handle Save
  const handleSave = async () => {
    if (!resolvedPatientId || items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const validItems = items.filter((item) => item.item_name.trim());
    if (validItems.length === 0) {
      toast.error("Please add items with valid names");
      return;
    }

    setIsSaving(true);

    try {
      const invoiceData = {
        items: validItems.map((item) => ({
          item_type: item.item_type,
          item_name: item.item_name,
          reference_id: item.reference_id,
          quantity: item.quantity,
          unit_amount: item.unit_amount,
          premium: item.premium,
          discount_type: item.discount_type,
          discount_value: item.discount_value,
          tax_applicable: item.tax_applicable,
          notes: item.notes,
          assigned_user: item.assigned_user,
        })),
        discount_type: discountType,
        discount_value: discountValue,
        coupon_code: couponCode || undefined,
        discount_reason: discountReason || undefined,
        invoice_date: invoiceDate.toISOString(),
      };

      let invoice: Invoice;

      if (savedInvoice) {
        invoice = await updateInvoiceMutation.mutateAsync({
          id: savedInvoice.invoice_id,
          data: invoiceData,
        });
        toast.success("Invoice updated successfully");
      } else {
        const createDto: CreateInvoiceDto = {
          patient_id: resolvedPatientId,
          visit_id: selectedVisit?.visit_id, // optional
          ...invoiceData,
        };
        invoice = await createInvoiceMutation.mutateAsync(createDto);
        toast.success("Invoice saved successfully");
      }

      setSavedInvoice(invoice);
    } catch {
      toast.error("Failed to save invoice");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Payment
  // const handlePay = async () => {
  //   if (!savedInvoice || !resolvedPatientId) return;

  //   const amountToPay = parseFloat(payAmount || "0");
  //   const advanceAmount = useAdvance ? parseFloat(advanceToUse || "0") : 0;

  //   const totalPayment = amountToPay + advanceAmount;

  //   if (totalPayment <= 0) {
  //     toast.error("Please enter a valid payment amount");
  //     return;
  //   }

  //   if (totalPayment > savedInvoice.balance_amount) {
  //     toast.error("Payment amount cannot exceed the balance amount");
  //     return;
  //   }

  //   try {
  //     const dto: CreatePaymentDto = {
  //       invoice_id: savedInvoice.invoice_id,
  //       patient_id: resolvedPatientId,
  //       amount: amountToPay,
  //       payment_method: paymentMethod as CreatePaymentDto["payment_method"],
  //       from_advance: advanceAmount,
  //     };

  //     const result = await createPaymentMutation.mutateAsync(dto);

  //     setSavedInvoice(result.invoice);

  //     // Add new receipts to the list
  //     setReceiptsGenerated(prev => [...prev, ...result.receipts]);

  //     // Reset payment inputs
  //     setPayAmount(Number(result.invoice.balance_amount).toFixed(2));
  //     setUseAdvance(false);
  //     setAdvanceToUse("");

  //     toast.success("Payment recorded successfully");
  //   } catch (e: any) {
  //     toast.error(e.response?.data?.error || "Payment failed");
  //   }
  // };

  // Auto-fill advance logic
  // useEffect(() => {
  //   if (useAdvance && savedInvoice) {
  //     const balance = savedInvoice.balance_amount || 0;
  //     const amountFromWallet = Math.min(balance, advanceBalance);
  //     setAdvanceToUse(String(amountFromWallet));
  //     setPayAmount(Number(Math.max(0, balance - amountFromWallet)).toFixed(2));
  //   } else if (!useAdvance && savedInvoice) {
  //     setAdvanceToUse("");
  //     setPayAmount(Number(savedInvoice.balance_amount || 0).toFixed(2));
  //   }
  // }, [useAdvance, advanceBalance, savedInvoice?.balance_amount]);

  const isFullyPaid = savedInvoice?.status === "paid";

  if ((visitIdFromUrl && visitsLoading) || (patientIdFromUrl && patientLoading) || !resolvedPatient) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={handleBackToBilling} className="h-8 px-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h2 className="text-base font-semibold">Loading...</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBackToBilling} className="h-8 px-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Invoice - {resolvedPatient?.firstName} {resolvedPatient?.lastName}
            </h2>
            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1"><User className="h-3 w-3" /> MRN: {resolvedPatient?.mrn}</span>
              {selectedVisit && (
                <>
                  <span>•</span>
                  <span>Visit #{selectedVisit.visit_id} ({selectedVisit.visit_type})</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Wallet Balance Display */}
          <div className="flex flex-col items-end mr-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Advance Balance</span>
            <div className="flex items-center gap-1 text-green-600 font-semibold">
              <Wallet className="h-4 w-4" />
              ₹{advanceBalance.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedInvoice && (
              <Badge variant={isFullyPaid ? "default" : "secondary"} className={isFullyPaid ? "bg-green-500" : ""}>
                {isFullyPaid ? "Paid" : savedInvoice.status === "partial" ? "Partial" : "Draft"} - {savedInvoice.invoice_number}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        {prescriptionsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Items Table */}
            <Card className="shrink-0 shadow-sm border-muted">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="w-8 p-3 text-left font-medium text-muted-foreground">#</th>
                      <th className="w-[350px] p-3 text-left font-medium text-muted-foreground">Item / Procedure</th>
                      <th className="w-20 p-3 text-center font-medium text-muted-foreground">Qty</th>
                      <th className="w-24 p-3 text-right font-medium text-muted-foreground">Rate</th>
                      <th className="w-24 p-3 text-right font-medium text-muted-foreground">Premium</th>
                      <th className="w-32 p-3 text-right font-medium text-muted-foreground">Discount</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">Notes</th>
                      <th className="w-28 p-3 text-right font-medium text-muted-foreground">Amount</th>
                      <th className="w-10 p-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item, index) => {
                      const calculated = calculateItemAmounts(item);
                      return (
                        <tr key={item._id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 text-muted-foreground">{index + 1}</td>
                          <td className="p-3">
                            <Input
                              value={item.item_name}
                              onChange={(e) => updateItem(item._id, { item_name: e.target.value })}
                              className={cn("h-8 text-xs font-medium w-full", item.item_type === 'drug' && "bg-muted cursor-not-allowed")}
                              placeholder="Item name"
                              readOnly={item.item_type === "drug"}
                              disabled={isFullyPaid}
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item._id, { quantity: Number(e.target.value) || 1 })}
                              className="h-8 text-xs text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full"
                              min={1}
                              disabled={isFullyPaid}
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.unit_amount}
                              onChange={(e) => updateItem(item._id, { unit_amount: Number(e.target.value) || 0 })}
                              className={cn("h-8 text-xs text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full", item.item_type === 'drug' && "bg-muted cursor-not-allowed")}
                              min={0}
                              step="0.01"
                              readOnly={item.item_type === "drug"}
                              disabled={isFullyPaid || item.item_type === "drug"}
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.premium || ""}
                              onChange={(e) => updateItem(item._id, { premium: e.target.value === "" ? 0 : Number(e.target.value) })}
                              className="h-8 text-xs text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full"
                              min={0}
                              step="0.01"
                              disabled={isFullyPaid}
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 bg-background rounded-md border border-input shadow-sm p-0.5 w-full">
                              <Input
                                type="number"
                                value={item.discount_value || ""}
                                onChange={(e) => updateItem(item._id, { discount_value: e.target.value === "" ? 0 : Number(e.target.value) })}
                                className="h-6 text-xs text-right flex-1 border-0 focus-visible:ring-0 shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                min={0}
                                step="0.01"
                                disabled={isFullyPaid}
                              />
                              <Select
                                value={item.discount_type}
                                onValueChange={(v) => updateItem(item._id, { discount_type: v as "percentage" | "fixed" })}
                                disabled={isFullyPaid}
                              >
                                <SelectTrigger className="h-6 w-10 text-[10px] px-1 border-0 shadow-none bg-muted/50 rounded-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">%</SelectItem>
                                  <SelectItem value="fixed">₹</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </td>
                          <td className="p-3">
                            <Input
                              value={item.notes || ""}
                              onChange={(e) => updateItem(item._id, { notes: e.target.value })}
                              className="h-8 text-xs w-full"
                              placeholder="Notes (opt)"
                              disabled={isFullyPaid}
                            />
                          </td>
                          <td className="p-3 text-right font-medium text-foreground">
                            ₹{calculated.net_amount.toFixed(2)}
                          </td>
                          <td className="p-3 text-right">
                            {!isFullyPaid && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeItem(item._id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {!isFullyPaid && <InlineDrugSearchRow onDrugSelect={handleAddDrug} disabled={isFullyPaid} />}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Totals & Settings Grid */}
            <div className="grid gap-6 lg:grid-cols-12 shrink-0">
              {/* Left Column: Settings & History */}
              <div className="lg:col-span-8 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="p-4 shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Invoice Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn("h-9 w-full justify-start text-left font-normal text-xs", !invoiceDate && "text-muted-foreground")}
                              disabled={isFullyPaid}
                            >
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {invoiceDate ? format(invoiceDate, "dd MMM yyyy") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={invoiceDate} onSelect={(date) => date && setInvoiceDate(date)} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1.5 block">Overall Discount</label>
                          <div className="flex items-center gap-1 border rounded-md p-0.5">
                            <Input
                              type="number"
                              value={discountValue || ""}
                              onChange={(e) => setDiscountValue(e.target.value === "" ? 0 : Number(e.target.value))}
                              className="h-7 text-xs border-0 focus-visible:ring-0 shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              min={0}
                              step="0.01"
                              placeholder="0"
                              disabled={isFullyPaid}
                            />
                            <Select value={discountType} onValueChange={(v) => setDiscountType(v as "percentage" | "fixed")} disabled={isFullyPaid}>
                              <SelectTrigger className="h-7 w-12 text-xs border-0 bg-muted/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">%</SelectItem>
                                <SelectItem value="fixed">₹</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1.5 block">Coupon</label>
                          <Input
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="h-8 text-xs uppercase"
                            placeholder="e.g. CC100"
                            disabled={isFullyPaid}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Notes / Reason</label>
                        <Textarea
                          value={discountReason}
                          onChange={(e) => setDiscountReason(e.target.value)}
                          className="text-xs min-h-[60px] resize-none"
                          placeholder="Optional notes or reason for discount..."
                          disabled={isFullyPaid}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Payment History */}
                  {receiptsGenerated.length > 0 && (
                    <Card className="p-4 shadow-sm flex flex-col">
                      <p className="text-sm font-semibold text-foreground mb-4">Payment History</p>
                      <div className="flex-1 overflow-y-auto space-y-3">
                        {receiptsGenerated.map(receipt => (
                          <div key={receipt.receipt_id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-foreground">{receipt.receipt_number}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {format(new Date(receipt.payment_date), "dd MMM, hh:mm a")} • {receipt.payment_method}
                                  {receipt.receipt_type === "advance_deduction" && " (Wallet)"}
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold text-sm text-green-700">₹{Number(receipt.amount).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              </div>

              {/* Right Column: Summary & Payment Box */}
              <div className="lg:col-span-4 space-y-4">
                <Card className="p-5 bg-gradient-to-br from-orange-50/50 to-orange-100/50 border-orange-200/50 shadow-sm">
                  <h3 className="text-sm font-semibold text-orange-900 mb-4">Invoice Summary</h3>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{totals.baseSubtotal.toFixed(2)}</span>
                    </div>
                    {totals.totalPremium > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Premium</span>
                        <span>₹{totals.totalPremium.toFixed(2)}</span>
                      </div>
                    )}
                    {totals.totalItemDiscount > 0 && (
                      <div className="flex justify-between text-red-600/80">
                        <span>Item Discounts</span>
                        <span>-₹{totals.totalItemDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium border-t border-orange-200/50 pt-2 pb-1 text-foreground">
                      <span>Gross Total</span>
                      <span>₹{totals.grossTotal.toFixed(2)}</span>
                    </div>
                    {totals.invoiceDiscount > 0 && (
                      <div className="flex justify-between text-red-600/80">
                        <span>Overall Discount</span>
                        <span>-₹{totals.invoiceDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {totals.couponDiscount > 0 && (
                      <div className="flex justify-between text-purple-600/80">
                        <span>Coupon ({couponCode})</span>
                        <span>-₹{totals.couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-orange-200/80 pt-3 mt-1 flex justify-between items-center">
                      <span className="font-bold text-base">Net Total</span>
                      <span className="font-bold text-lg">₹{totals.netTotal.toFixed(2)}</span>
                    </div>

                    {/* Paid & Balance (only if saved) */}
                    {savedInvoice && (
                      <>
                        <div className="flex justify-between text-green-600 pt-2">
                          <span>Amount Paid</span>
                          <span>₹{Number(savedInvoice.paid_amount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-orange-700 bg-white/50 p-2 rounded-md mt-2 border border-orange-200/50">
                          <span>Balance Due</span>
                          <span>₹{Number(savedInvoice.balance_amount || 0).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-5">
                    {!savedInvoice && (
                      <Button
                        onClick={handleSave}
                        disabled={isSaving || items.length === 0}
                        className="w-full bg-primary hover:bg-primary/90 gap-2 h-11"
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Invoice
                      </Button>
                    )}
                    {savedInvoice && savedInvoice.balance_amount > 0 && (
                      <Button
                        onClick={() => navigate(`/main/billing/patient/${resolvedPatientId}?tab=payment`)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-11 mt-4"
                      >
                        <CreditCard className="h-4 w-4" />
                        Pay Invoice
                      </Button>
                    )}
                  </div>
                </Card>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoicePage;
