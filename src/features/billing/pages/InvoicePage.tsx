import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  FileText,
  CalendarDays,
  User,
  ArrowLeft,
  Search,
  Plus,
  X,
  Loader2,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  CheckCircle,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
const generateId = () => `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Calculate item amounts
const calculateItemAmounts = (item: InvoiceItemRow) => {
  const quantity = item.quantity ?? 1;
  const unitAmount = item.unit_amount ?? 0;
  const premium = item.premium ?? 0;
  const discountType = item.discount_type ?? "percentage";
  const discountValue = item.discount_value ?? 0;

  const baseAmount = unitAmount * quantity + premium;
  let discountAmount = 0;

  if (discountType === "percentage") {
    discountAmount = baseAmount * (discountValue / 100);
  } else {
    discountAmount = discountValue;
  }

  const netAmount = Math.max(0, baseAmount - discountAmount);

  return {
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: drugs, isLoading } = useDrugSearch(query);

  const handleSelect = (drug: Drug) => {
    onDrugSelect(drug);
    setQuery("");
    setOpen(false);
  };

  if (disabled) return null;

  return (
    <tr className="bg-muted/10">
      <td className="p-2">
        <Plus className="h-3 w-3 text-muted-foreground" />
      </td>
      <td colSpan={6} className="p-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative w-full max-w-md cursor-text" onClick={() => setOpen(true)}>
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search and add drug..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-7 text-xs pl-7 w-full"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start" sideOffset={4}>
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Type to search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-8 text-xs pl-7"
                  autoFocus
                />
              </div>
            </div>
            <ScrollArea className="max-h-52">
              {isLoading ? (
                <div className="p-2 space-y-1">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : drugs && drugs.length > 0 ? (
                <div className="p-1">
                  {drugs.map((drug) => (
                    <button
                      key={drug.drug_id}
                      onClick={() => handleSelect(drug)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-accent text-xs flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="font-medium">{drug.drug_name}</div>
                        <div className="text-muted-foreground text-[10px]">
                          {drug.drug_generic} • {drug.drug_type}
                        </div>
                      </div>
                      <span className="text-primary font-semibold">₹{drug.amount}</span>
                    </button>
                  ))}
                </div>
              ) : query ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No drugs found for "{query}"
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Type to search drugs
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </td>
      <td className="p-2" />
    </tr>
  );
}


export function InvoicePage() {
  // URL search params for persistence
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [receiptGenerated, setReceiptGenerated] = useState<{ 
    receipt_number: string; 
    amount: number;
  } | null>(null);

  // Filters for visits
  const visitFilters: VisitFilters = useMemo(() => ({
    status: "1",
    page: 1,
    limit: 50,
    ...(searchQuery && { patient: searchQuery }),
  }), [searchQuery]);

  // Fetch visits
  const { data: visitsData, isLoading: visitsLoading } = useQuery({
    queryKey: ["billing-visits", visitFilters],
    queryFn: () => visitService.list(visitFilters),
  });

  // Fetch all invoices to show status on visit cards
  const { data: allInvoicesData } = useQuery({
    queryKey: ["all-invoices-for-visits"],
    queryFn: () => billingService.listInvoices({ limit: 20 }),
  });


  // Create map of visit_id -> invoice status for quick lookup
  const visitInvoiceStatusMap = useMemo(() => {
    const map = new Map<number, { status: string; invoiceNumber: string }>();
    if (allInvoicesData?.invoices) {
      for (const invoice of allInvoicesData.invoices) {
        map.set(invoice.visit_id, {
          status: invoice.status,
          invoiceNumber: invoice.invoice_number,
        });
      }
    }
    return map;
  }, [allInvoicesData]);

  // Sync selectedVisit with URL param (load from URL or clear when URL changes)
  useEffect(() => {
    if (visitIdFromUrl && visitsData?.visits) {
      // URL has visitId - load the visit if not already selected or different visit
      const visitFromUrl = visitsData.visits.find(
        (v) => v.visit_id === Number(visitIdFromUrl)
      );
      if (visitFromUrl && selectedVisit?.visit_id !== visitFromUrl.visit_id) {
        setSelectedVisit(visitFromUrl);
      }
    } else if (!visitIdFromUrl && selectedVisit) {
      // URL param removed (e.g., browser back) - clear selection
      setSelectedVisit(null);
      setItems([]);
      setSavedInvoice(null);
      setReceiptGenerated(null);
    }
  }, [visitIdFromUrl, visitsData]);

  // Update URL when visit is selected
  const handleSelectVisit = useCallback((visit: VisitItem) => {
    setSelectedVisit(visit);
    setSearchParams({ visitId: String(visit.visit_id) }, { replace: true });
  }, [setSearchParams]);

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

  // Reset form when going back
  const handleBackToVisits = useCallback(() => {
    setSelectedVisit(null);
    setItems([]);
    setSavedInvoice(null);
    setInvoiceDate(new Date());
    setDiscountType("percentage");
    setDiscountValue(0);
    setCouponCode("");
    setDiscountReason("");
    setReceiptGenerated(null);
    // Clear URL param
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

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
      item_name: drug.drug_name,
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

    // Base subtotal (quantity * rate)
    const baseSubtotal = items.reduce((sum, item) => 
      sum + (item.quantity ?? 1) * (item.unit_amount ?? 0), 0);
    
    // Total premium
    const totalPremium = items.reduce((sum, item) => sum + (item.premium ?? 0), 0);
    
    // Total item discounts
    const totalItemDiscount = itemsWithAmounts.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
    
    // Gross total after item-level discounts
    const grossTotal = itemsWithAmounts.reduce((sum, item) => sum + (item.net_amount || 0), 0);

    // Overall invoice discount
    let invoiceDiscountAmount = 0;
    if (discountType === "percentage") {
      invoiceDiscountAmount = grossTotal * (discountValue / 100);
    } else {
      invoiceDiscountAmount = discountValue;
    }

    // Coupon discount (validate and extract amount from coupon code like CC100, CC1500)
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
    } catch{
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
      await billingService.updateInvoice(savedInvoice.invoice_id, { status: "paid" });

      setReceiptGenerated({
        receipt_number: receipt.receipt_number,
        amount: Number(receipt.amount),
      });

      setSavedInvoice((prev) => prev ? { ...prev, status: "paid" } : null);
      toast.success("Payment successful! Receipt generated.");
    } catch{
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const visits = visitsData?.visits ?? [];
  const isPaid = savedInvoice?.status === "paid" || !!receiptGenerated;

  // Visit List View
  if (!selectedVisit) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Create Invoice
            </h2>
            <p className="text-sm text-muted-foreground">
              Select a visit to create an invoice
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-48 text-xs"
            />
          </div>
        </div>

        {/* Visit List */}
        <div className="flex-1 overflow-auto">
          {visitsLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
          ) : visits.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
              <CalendarDays className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">No visits found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery ? "Try a different search term" : "No active visits available"}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visits.map((visit) => {
                const date = new Date(visit.visit_date);
                const invoiceInfo = visitInvoiceStatusMap.get(visit.visit_id);
                const hasInvoice = !!invoiceInfo;
                const isPaid = invoiceInfo?.status === "paid";
                const isDraft = invoiceInfo?.status === "draft";
                
                return (
                  <button
                    key={visit.visit_id}
                    onClick={() => handleSelectVisit(visit)}
                    className={cn(
                      "group relative rounded-lg border p-3 text-left transition-all hover:shadow-md",
                      isPaid 
                        ? "border-green-300 bg-green-50/50 hover:border-green-400"
                        : isDraft
                        ? "border-orange-300 bg-orange-50/50 hover:border-orange-400"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "absolute inset-x-0 top-0 h-0.5 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity",
                      isPaid ? "bg-green-500" : isDraft ? "bg-orange-500" : "bg-primary"
                    )} />
                    
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center",
                          isPaid ? "bg-green-100" : isDraft ? "bg-orange-100" : "bg-primary/10"
                        )}>
                          <User className={cn(
                            "h-4 w-4",
                            isPaid ? "text-green-600" : isDraft ? "text-orange-600" : "text-primary"
                          )} />
                        </div>
                        <div>
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">
                            {visit.patient?.firstName} {visit.patient?.lastName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            MRN: {visit.patient?.mrn}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="text-[9px]">
                          #{visit.visit_id}
                        </Badge>
                        {hasInvoice && (
                          <Badge 
                            className={cn(
                              "text-[9px]",
                              isPaid 
                                ? "bg-green-100 text-green-700 hover:bg-green-100" 
                                : "bg-orange-100 text-orange-700 hover:bg-orange-100"
                            )}
                          >
                            {isPaid ? "Receipt" : "Invoice"}
                          </Badge>
                        )}

                      </div>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        <span>{format(date, "dd MMM yyyy, hh:mm a")}</span>
                      </div>

                      <p className="font-medium">{visit.visit_type}</p>
                      {visit.doctor?.displayName && (
                        <p className="text-muted-foreground">
                          Dr. {visit.doctor.displayName}
                        </p>
                      )}
                      {visit.appointment && (
                        <Badge variant="outline" className="text-[9px] mt-1">
                          {visit.appointment.appointment_type}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Invoice Creation View
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBackToVisits} className="h-8 px-2">
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
                            <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0">
                              {item.item_type}
                            </Badge>
                            <Input
                              value={item.item_name}
                              onChange={(e) => updateItem(item._id, { item_name: e.target.value })}
                              className="h-7 text-xs border-0 bg-transparent p-0 focus-visible:ring-0"
                              placeholder="Item name"
                              disabled={isPaid}
                            />
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

          {/* Action Buttons - Fixed Bottom */}
          {!isPaid && (
            <div className="shrink-0 flex items-center justify-end gap-3 pt-3 border-t mt-auto">
              <Button variant="outline" onClick={handleBackToVisits} disabled={isSaving}>
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
                <Button variant="outline" size="sm" onClick={handleBackToVisits}>
                  New Invoice
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
