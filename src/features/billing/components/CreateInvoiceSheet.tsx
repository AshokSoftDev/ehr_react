import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  X,
  Plus,
  Search,
  CalendarIcon,
  FileText,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useVisitPrescriptionsForInvoice, useCreateInvoice } from '../hooks/useBilling';
import { useDrugSearch } from '@/features/visits/hooks/useDrugs';
import type { InvoiceItemRow, CreateInvoiceDto } from '../types/billing.types';
import type { DrugItem } from '@/features/drug/types/drug.types';
import { toast } from '@/lib/toast';

interface CreateInvoiceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitId: number | null;
  patientId: number;
}

// Generate unique ID for rows
const generateId = () => `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Empty row template
const createEmptyRow = (): InvoiceItemRow => ({
  _id: generateId(),
  item_type: 'custom',
  item_name: '',
  quantity: 1,
  unit_amount: 0,
  premium: 0,
  discount_type: 'percentage',
  discount_value: 0,
  tax_applicable: false,
  notes: '',
});

// Calculate item amounts
const calculateItemAmounts = (item: InvoiceItemRow) => {
  const quantity = item.quantity ?? 1;
  const unitAmount = item.unit_amount ?? 0;
  const premium = item.premium ?? 0;
  const discountType = item.discount_type ?? 'percentage';
  const discountValue = item.discount_value ?? 0;

  const baseAmount = unitAmount * quantity + premium;
  let discountAmount = 0;

  if (discountType === 'percentage') {
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

// Drug Search Cell Component
function DrugSearchCell({ onDrugSelect }: { onDrugSelect: (drug: DrugItem) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { data: drugs, isLoading } = useDrugSearch(query);

  const handleSelect = (drug: DrugItem) => {
    onDrugSelect(drug);
    setQuery('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
          <Search className="h-3 w-3" />
          <span className="text-xs">Search Drug...</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="Search by drug name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 text-xs"
            autoFocus
          />
        </div>
        <ScrollArea className="h-48">
          {isLoading ? (
            <div className="p-2 space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : drugs && drugs.length > 0 ? (
            <div className="p-1">
              {(drugs as DrugItem[]).map((drug) => (
                <button
                  key={drug.drug_id}
                  onClick={() => handleSelect(drug)}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-accent text-xs"
                >
                  <div className="font-medium">{drug.drug_name}</div>
                  <div className="text-muted-foreground text-[10px]">
                    {drug.drug_generic} • {drug.drug_type} • ₹{drug.amount}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-muted-foreground">
              {query ? 'No drugs found' : 'Type to search drugs'}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function CreateInvoiceSheet({
  open,
  onOpenChange,
  visitId,
  patientId,
}: CreateInvoiceSheetProps) {
  const [items, setItems] = useState<InvoiceItemRow[]>([]);
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [discountReason, setDiscountReason] = useState('');

  const { data: prescriptionItems, isLoading: prescriptionsLoading } =
    useVisitPrescriptionsForInvoice(visitId ?? 0);
  const createInvoiceMutation = useCreateInvoice();

  // Load prescriptions when sheet opens
  useEffect(() => {
    if (open && prescriptionItems && prescriptionItems.length > 0) {
      const initialItems: InvoiceItemRow[] = prescriptionItems.map((p) => ({
        _id: generateId(),
        item_type: p.item_type,
        item_name: p.item_name,
        reference_id: p.reference_id,
        quantity: p.quantity ?? 1,
        unit_amount: p.unit_amount ?? 0,
        premium: 0,
        discount_type: 'percentage' as const,
        discount_value: 0,
        tax_applicable: false,
        notes: p.notes,
      }));
      setItems(initialItems);
    } else if (open && (!prescriptionItems || prescriptionItems.length === 0)) {
      setItems([createEmptyRow()]);
    }
  }, [open, prescriptionItems]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setItems([]);
      setInvoiceDate(new Date());
      setDiscountType('percentage');
      setDiscountValue(0);
      setCouponCode('');
      setDiscountReason('');
    }
  }, [open]);

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
  const handleAddDrug = useCallback((drug: DrugItem) => {
    const newItem: InvoiceItemRow = {
      _id: generateId(),
      item_type: 'drug',
      item_name: drug.drug_name,
      reference_id: drug.drug_id,
      quantity: 1,
      unit_amount: Number(drug.amount) || 0,
      premium: 0,
      discount_type: 'percentage',
      discount_value: 0,
      tax_applicable: false,
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  // Add custom row
  const handleAddRow = useCallback(() => {
    setItems((prev) => [...prev, createEmptyRow()]);
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    const itemsWithAmounts = items.map((item) => ({
      ...item,
      ...calculateItemAmounts(item),
    }));

    const grossTotal = itemsWithAmounts.reduce((sum, item) => sum + (item.net_amount || 0), 0);

    let invoiceDiscountAmount = 0;
    if (discountType === 'percentage') {
      invoiceDiscountAmount = grossTotal * (discountValue / 100);
    } else {
      invoiceDiscountAmount = discountValue;
    }

    // Tax only on applicable items (18% GST)
    const taxableAmount = itemsWithAmounts
      .filter((item) => item.tax_applicable)
      .reduce((sum, item) => sum + (item.net_amount || 0), 0);
    const taxAmount = taxableAmount * 0.18;

    const netTotal = Math.max(0, grossTotal - invoiceDiscountAmount + taxAmount);

    return {
      grossTotal: Math.round(grossTotal * 100) / 100,
      discountAmount: Math.round(invoiceDiscountAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      netTotal: Math.round(netTotal * 100) / 100,
    };
  }, [items, discountType, discountValue]);

  // Handle save
  const handleSave = async () => {
    if (!visitId || items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const validItems = items.filter((item) => item.item_name.trim());
    if (validItems.length === 0) {
      toast.error('Please add items with valid names');
      return;
    }

    const dto: CreateInvoiceDto = {
      patient_id: patientId,
      visit_id: visitId,
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

    try {
      await createInvoiceMutation.mutateAsync(dto);
      toast.success('Invoice created successfully');
      onOpenChange(false);
    } catch (_error) {
      toast.error('Failed to create invoice');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" preventClose className="w-full sm:max-w-4xl p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Create Invoice
          </SheetTitle>
          <SheetDescription className="text-xs">
            Create invoice for visit #{visitId}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          {prescriptionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Items Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="w-8 p-2 text-left text-destructive">Remove</th>
                        <th className="p-2 text-left min-w-[180px]">Procedures/Packages</th>
                        <th className="w-10 p-2 text-center">Tax</th>
                        <th className="w-16 p-2 text-left">Notes</th>
                        <th className="w-16 p-2 text-left">User</th>
                        <th className="w-16 p-2 text-right">Quantity</th>
                        <th className="w-24 p-2 text-right">Unit Amount</th>
                        <th className="w-20 p-2 text-right">Premium</th>
                        <th className="w-28 p-2 text-right">Discount</th>
                        <th className="w-24 p-2 text-right text-primary">Net Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {items.map((item) => {
                        const calculated = calculateItemAmounts(item);
                        return (
                          <tr key={item._id} className="hover:bg-muted/20">
                            <td className="p-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                onClick={() => removeItem(item._id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1 py-0 shrink-0"
                                >
                                  {item.item_type}
                                </Badge>
                                <Input
                                  value={item.item_name}
                                  onChange={(e) =>
                                    updateItem(item._id, { item_name: e.target.value })
                                  }
                                  className="h-7 text-xs"
                                  placeholder="Item name"
                                />
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              <Checkbox
                                checked={item.tax_applicable}
                                onCheckedChange={(checked) =>
                                  updateItem(item._id, { tax_applicable: !!checked })
                                }
                              />
                            </td>
                            <td className="p-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="link" size="sm" className="h-6 px-1 text-xs">
                                    {item.notes ? 'View' : 'None'}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-2">
                                  <Textarea
                                    value={item.notes || ''}
                                    onChange={(e) =>
                                      updateItem(item._id, { notes: e.target.value })
                                    }
                                    placeholder="Add notes..."
                                    className="text-xs"
                                    rows={3}
                                  />
                                </PopoverContent>
                              </Popover>
                            </td>
                            <td className="p-2">
                              <Input
                                value={item.assigned_user || ''}
                                onChange={(e) =>
                                  updateItem(item._id, { assigned_user: e.target.value })
                                }
                                className="h-7 text-xs w-16"
                                placeholder="None"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(item._id, { quantity: Number(e.target.value) || 1 })
                                }
                                className="h-7 text-xs text-right w-14"
                                min={1}
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={item.unit_amount}
                                onChange={(e) =>
                                  updateItem(item._id, { unit_amount: Number(e.target.value) || 0 })
                                }
                                className="h-7 text-xs text-right w-20"
                                min={0}
                                step="0.01"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={item.premium}
                                onChange={(e) =>
                                  updateItem(item._id, { premium: Number(e.target.value) || 0 })
                                }
                                className="h-7 text-xs text-right w-16"
                                min={0}
                                step="0.01"
                              />
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={item.discount_value}
                                  onChange={(e) =>
                                    updateItem(item._id, {
                                      discount_value: Number(e.target.value) || 0,
                                    })
                                  }
                                  className="h-7 text-xs text-right w-14"
                                  min={0}
                                  step="0.01"
                                />
                                <Select
                                  value={item.discount_type}
                                  onValueChange={(v) =>
                                    updateItem(item._id, {
                                      discount_type: v as 'percentage' | 'fixed',
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-7 w-12 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="percentage">%</SelectItem>
                                    <SelectItem value="fixed">₹</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="p-2 text-right font-medium text-primary">
                              ₹{calculated.net_amount.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add Item Row */}
                <div className="p-2 border-t bg-muted/20 flex gap-2">
                  <DrugSearchCell onDrugSelect={handleAddDrug} />
                  <Button variant="outline" size="sm" onClick={handleAddRow} className="gap-1">
                    <Plus className="h-3 w-3" />
                    Add Custom
                  </Button>
                </div>
              </div>

              {/* Totals Section */}
              <div className="grid gap-3 md:grid-cols-2 border rounded-lg p-4 bg-muted/20">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs w-28">Gross Total (INR)</Label>
                    <Input
                      value={totals.grossTotal.toFixed(2)}
                      readOnly
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs w-28">Discount (INR)</Label>
                    <Input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                      className="h-8 text-xs w-20"
                      min={0}
                      step="0.01"
                    />
                    <span className="text-muted-foreground">+</span>
                    <Select
                      value={discountType}
                      onValueChange={(v) => setDiscountType(v as 'percentage' | 'fixed')}
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
                  <div className="flex items-center gap-2">
                    <Label className="text-xs w-28">Coupon Code</Label>
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="h-8 text-xs"
                      placeholder="Enter coupon"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs w-28">Discount Reason</Label>
                    <Input
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      className="h-8 text-xs"
                      placeholder="Reason"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs w-28">Net Total (INR)</Label>
                    <Input
                      value={totals.netTotal.toFixed(2)}
                      readOnly
                      className="h-8 text-xs bg-background font-semibold"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs w-28">Tax (INR)</Label>
                    <Input
                      value={totals.taxAmount.toFixed(2)}
                      readOnly
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs w-28">Invoice Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'h-8 justify-start text-left font-normal text-xs flex-1',
                            !invoiceDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {invoiceDate ? format(invoiceDate, 'dd/MM/yyyy') : 'Pick a date'}
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
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t bg-background shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={createInvoiceMutation.isPending || items.length === 0}
            className="bg-primary-gradient hover:opacity-90"
          >
            {createInvoiceMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
