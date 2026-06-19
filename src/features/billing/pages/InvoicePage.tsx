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
  Smartphone,
  Banknote,
  Building,
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { visitService } from "@/features/visits/services/visit.service";
import { useDrugSearch } from "@/features/visits/hooks/useDrugs";
import {
  useVisitPrescriptionsForInvoice,
  useCreateInvoice,
  useUpdateInvoice,
} from "../hooks/useBilling";
import type { VisitItem, VisitFilters } from "@/features/visits/types/visit.types";
import type { InvoiceItemRow, CreateInvoiceDto, CreateReceiptDto, Invoice } from "../types/billing.types";
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
              className="h-7 text-xs w-full min-w-[200px]"
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
    </tr>
  );
}

export function InvoicePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const visitIdFromUrl = searchParams.get("visitId");

  // State
  const [selectedVisit, setSelectedVisit] = useState<VisitItem | null>(null);
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItemRow[]>([]);
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [receiptGenerated, setReceiptGenerated] = useState<{
    receipt_number: string;
    amount: number;
  } | null>(null);

  // Fetch the specific visit by ID
  const visitFilters: VisitFilters = useMemo(() => ({
    status: "1",
    page: 1,
    limit: 50,
  }), []);

  const { data: visitsData, isLoading: visitsLoading } = useQuery({
    queryKey: ["invoice-visit", visitIdFromUrl],
    queryFn: () => visitService.list(visitFilters),
    enabled: !!visitIdFromUrl,
  });

  // Auto-select visit from URL param
  useEffect(() => {
    if (visitIdFromUrl && visitsData?.visits) {
      const visitFromUrl = visitsData.visits.find(
        (v) => v.visit_id === Number(visitIdFromUrl)
      );
      if (visitFromUrl && selectedVisit?.visit_id !== visitFromUrl.visit_id) {
        setSelectedVisit(visitFromUrl);
      }
    }
  }, [visitIdFromUrl, visitsData]);

  // Fetch prescriptions for selected visit
  const { data: prescriptionItems, isLoading: prescriptionsLoading } =
    useVisitPrescriptionsForInvoice(selectedVisit?.visit_id ?? 0);

  // Fetch existing invoice for visit
  const { data: existingInvoicesData } = useQuery({
    queryKey: ["visit-invoices", selectedVisit?.visit_id],
    queryFn: () => billingService.listInvoices({ visit_id: selectedVisit?.visit_id }),
    enabled: !!selectedVisit?.visit_id,
  });

  // Create/Update invoice mutations
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();

  // Load existing invoice or prescriptions when visit is selected
  useEffect(() => {
    if (selectedVisit && existingInvoicesData?.invoices && existingInvoicesData.invoices.length > 0) {
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

      if (existingInvoice.status === "paid") {
        billingService.listReceipts({ invoice_id: existingInvoice.invoice_id }).then((res) => {
          if (res.receipts.length > 0) {
            setReceiptGenerated({
              receipt_number: res.receipts[0].receipt_number,
              amount: Number(res.receipts[0].amount),
            });
          }
        });
      }
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
    } else if (selectedVisit && (!prescriptionItems || prescriptionItems.length === 0) && !existingInvoicesData?.invoices?.length) {
      setItems([]);
      setSavedInvoice(null);
    }
  }, [selectedVisit, prescriptionItems, existingInvoicesData]);

  // Navigate back to billing list
  const handleBackToBilling = useCallback(() => {
    navigate("/main/billing");
  }, [navigate]);

  // Update item
  const updateItem = useCallback((id: string, updates: Partial<InvoiceItemRow>) => {
    setItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, ...updates } : item))
    );
  }, []);

  // Remove item
  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item._id !== id));
  }, []);

  // Add drug from search
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

  // Calculate totals
  const totals = useMemo(() => {
    const itemsWithAmounts = items.map((item) => ({
      ...item,
      ...calculateItemAmounts(item),
    }));

    const baseSubtotal = items.reduce((sum, item) =>
      sum + (item.quantity ?? 1) * (item.unit_amount ?? 0), 0);

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

  // Handle Save Invoice
  const handleSave = async () => {
    if (!selectedVisit || items.length === 0) {
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
          patient_id: selectedVisit.patient_id,
          visit_id: selectedVisit.visit_id,
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

  // Handle payment
  const handlePay = async () => {
    if (!savedInvoice) {
      toast.error("Please save the invoice first");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const receiptDto: CreateReceiptDto = {
        invoice_id: savedInvoice.invoice_id,
        patient_id: selectedVisit!.patient_id,
        amount: totals.netTotal,
        payment_method: paymentMethod as CreateReceiptDto["payment_method"],
      };

      const receipt = await billingService.createReceipt(receiptDto);

      setReceiptGenerated({
        receipt_number: receipt.receipt_number,
        amount: Number(receipt.amount),
      });

      setSavedInvoice((prev) => prev ? { ...prev, status: "paid" } : null);
      toast.success("Payment successful! Receipt generated.");
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const isPaid = savedInvoice?.status === "paid" || !!receiptGenerated;

  // Loading state
  if (visitsLoading || !selectedVisit) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={handleBackToBilling} className="h-8 px-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h2 className="text-base font-semibold">Loading Invoice...</h2>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Invoice Creation / View
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBackToBilling} className="h-8 px-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Invoice - {selectedVisit.patient?.firstName} {selectedVisit.patient?.lastName}
            </h2>
            <p className="text-xs text-muted-foreground">
              Visit #{selectedVisit.visit_id} • {selectedVisit.visit_type} • {format(new Date(selectedVisit.visit_date), "dd MMM yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savedInvoice && (
            <Badge variant={isPaid ? "default" : "secondary"} className={isPaid ? "bg-green-500" : ""}>
              {isPaid ? "Paid" : savedInvoice.invoice_number}
            </Badge>
          )}
          {receiptGenerated && (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              {receiptGenerated.receipt_number}
            </Badge>
          )}
        </div>
      </div>

      {/* Invoice Content */}
      {prescriptionsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-auto">
          {/* Items Table */}
          <Card className="shrink-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="w-8 p-2 text-left text-orange-500">#</th>
                    <th className="w-48 p-2 text-left">Item / Procedure</th>
                    <th className="w-16 p-2 text-center">Qty</th>
                    <th className="w-20 p-2 text-right">Rate</th>
                    <th className="w-20 p-2 text-right">Premium</th>
                    <th className="w-28 p-2 text-right">Discount</th>
                    <th className="w-24 p-2 text-right text-green-600">Amount</th>
                    <th className="w-8 p-2" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item, index) => {
                    const calculated = calculateItemAmounts(item);
                    return (
                      <tr key={item._id} className="hover:bg-muted/20">
                        <td className="p-2 text-muted-foreground">{index + 1}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={item.item_name}
                              onChange={(e) => updateItem(item._id, { item_name: e.target.value })}
                              className="h-7 text-xs border-0 bg-transparent p-0 focus-visible:ring-0"
                              placeholder="Item name"
                              disabled={isPaid}
                            />
                            {/* <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0">
                              {item.item_type}
                            </Badge> */}
                          </div>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(item._id, { quantity: Number(e.target.value) || 1 })
                            }
                            className="h-7 text-xs text-center w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min={1}
                            disabled={isPaid}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.unit_amount}
                            onChange={(e) =>
                              updateItem(item._id, { unit_amount: Number(e.target.value) || 0 })
                            }
                            className="h-7 text-xs text-right w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min={0}
                            step="0.01"
                            disabled={isPaid}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.premium || ""}
                            onChange={(e) =>
                              updateItem(item._id, { premium: e.target.value === "" ? 0 : Number(e.target.value) })
                            }
                            className="h-7 text-xs text-right w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min={0}
                            step="0.01"
                            disabled={isPaid}
                          />
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={item.discount_value || ""}
                              onChange={(e) =>
                                updateItem(item._id, {
                                  discount_value: e.target.value === "" ? 0 : Number(e.target.value),
                                })
                              }
                              className="h-7 text-xs text-right flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              min={0}
                              step="0.01"
                              disabled={isPaid}
                            />
                            <Select
                              value={item.discount_type}
                              onValueChange={(v) =>
                                updateItem(item._id, {
                                  discount_type: v as "percentage" | "fixed",
                                })
                              }
                              disabled={isPaid}
                            >
                              <SelectTrigger className="h-7 w-12 text-xs px-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">%</SelectItem>
                                <SelectItem value="fixed">₹</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        <td className="p-2 text-right font-semibold text-green-600">
                          ₹{calculated.net_amount.toFixed(2)}
                        </td>
                        <td className="p-2">
                          {!isPaid && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:bg-destructive/10"
                              onClick={() => removeItem(item._id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Inline Drug Search Row */}
                  <InlineDrugSearchRow onDrugSelect={handleAddDrug} disabled={isPaid} />
                </tbody>
              </table>
            </div>
          </Card>

          {/* Totals & Settings Grid */}
          <div className="grid gap-4 lg:grid-cols-3 shrink-0">
            {/* Left: Discount Settings */}
            <Card className="p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Discount</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={discountValue || ""}
                    onChange={(e) => setDiscountValue(e.target.value === "" ? 0 : Number(e.target.value))}
                    className="h-8 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={0}
                    step="0.01"
                    placeholder="Value"
                    disabled={isPaid}
                  />
                  <Select
                    value={discountType}
                    onValueChange={(v) => setDiscountType(v as "percentage" | "fixed")}
                    disabled={isPaid}
                  >
                    <SelectTrigger className="h-8 w-16 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="fixed">₹</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="h-8 text-xs uppercase"
                  placeholder="Coupon Code (e.g., CC100)"
                  disabled={isPaid}
                />

                <Textarea
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  className="text-xs min-h-[60px] resize-none"
                  placeholder="Discount Reason"
                  disabled={isPaid}
                />
              </div>
            </Card>

            {/* Center: Date */}
            <Card className="p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Invoice Date</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-8 w-full justify-start text-left font-normal text-xs",
                      !invoiceDate && "text-muted-foreground"
                    )}
                    disabled={isPaid}
                  >
                    <CalendarDays className="mr-2 h-3 w-3" />
                    {invoiceDate ? format(invoiceDate, "dd MMM yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={invoiceDate}
                    onSelect={(date) => date && setInvoiceDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </Card>

            {/* Right: Totals */}
            <Card className="p-3 bg-orange-50 border-orange-200">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totals.baseSubtotal.toFixed(2)}</span>
                </div>
                {totals.totalPremium > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>+ Premium</span>
                    <span>₹{totals.totalPremium.toFixed(2)}</span>
                  </div>
                )}
                {totals.totalItemDiscount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>- Item Discounts</span>
                    <span>-₹{totals.totalItemDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium border-t border-orange-200 pt-1.5 mt-1.5">
                  <span>Gross Total</span>
                  <span>₹{totals.grossTotal.toFixed(2)}</span>
                </div>
                {totals.invoiceDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>- Overall Discount</span>
                    <span>-₹{totals.invoiceDiscount.toFixed(2)}</span>
                  </div>
                )}
                {totals.couponDiscount > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>- Coupon ({couponCode.toUpperCase()})</span>
                    <span>-₹{totals.couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-orange-300 pt-2 mt-2 flex justify-between font-bold text-base">
                  <span>Net Total</span>
                  <span className="text-green-600">₹{totals.netTotal.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          {!isPaid && (
            <div className="shrink-0 flex items-center justify-end gap-3 pt-3 border-t mt-auto">
              <Button variant="outline" onClick={handleBackToBilling} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleSave}
                disabled={isSaving || items.length === 0}
                className="gap-2"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                {savedInvoice ? "Update" : "Save"}
              </Button>
              {savedInvoice && (
                <div className="flex items-center gap-2">
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="w-36 h-10">
                      <SelectValue placeholder="Payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          Cash
                        </div>
                      </SelectItem>
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Card
                        </div>
                      </SelectItem>
                      <SelectItem value="upi">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          UPI
                        </div>
                      </SelectItem>
                      <SelectItem value="bank_transfer">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Bank Transfer
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handlePay}
                    disabled={totals.netTotal <= 0 || isProcessingPayment || isSaving}
                    className="bg-green-600 hover:bg-green-700 gap-2"
                  >
                    {isProcessingPayment && <Loader2 className="h-4 w-4 animate-spin" />}
                    <CreditCard className="h-4 w-4" />
                    Pay ₹{totals.netTotal.toFixed(2)}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Receipt Generated Success */}
          {receiptGenerated && (
            <Card className="p-4 bg-green-50 border-green-200 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Payment Successful!</p>
                    <p className="text-sm text-green-600">
                      Receipt {receiptGenerated.receipt_number} • ₹{receiptGenerated.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleBackToBilling}>
                  Back to Billing
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default InvoicePage;
