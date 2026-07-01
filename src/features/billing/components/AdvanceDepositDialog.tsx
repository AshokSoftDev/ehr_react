import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Wallet,
  Banknote,
  CreditCard,
  Smartphone,
  Building,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { useDepositAdvance } from "../hooks/useBilling";
import type { CreateAdvanceDto } from "../types/billing.types";

interface AdvanceDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number;
  patientName?: string;
  currentBalance?: number;
}

export function AdvanceDepositDialog({
  open,
  onOpenChange,
  patientId,
  patientName,
  currentBalance = 0,
}: AdvanceDepositDialogProps) {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [notes, setNotes] = useState("");

  const depositMutation = useDepositAdvance();

  const handleDeposit = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const dto: CreateAdvanceDto = {
        patient_id: patientId,
        amount: parsedAmount,
        payment_method: paymentMethod as CreateAdvanceDto["payment_method"],
        notes: notes || undefined,
      };

      await depositMutation.mutateAsync(dto);
      toast.success(`₹${parsedAmount.toFixed(2)} deposited as advance`);

      // Reset and close
      setAmount("");
      setNotes("");
      setPaymentMethod("cash");
      onOpenChange(false);
    } catch {
      toast.error("Failed to deposit advance");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-green-600" />
            </div>
            Add Advance
          </DialogTitle>
          <DialogDescription>
            {patientName && (
              <span className="font-medium text-foreground">{patientName}</span>
            )}
            {" · "}
            Current Balance:{" "}
            <span className="font-semibold text-green-600">
              ₹{currentBalance.toFixed(2)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Amount (INR)
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-lg font-semibold h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min={0}
              step="0.01"
              autoFocus
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Payment Method
            </label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select method" />
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
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Notes (Optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              className="text-xs min-h-[60px] resize-none"
            />
          </div>

          {/* New Balance Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                New Balance After Deposit
              </p>
              <p className="text-xl font-bold text-green-600">
                ₹{(currentBalance + parseFloat(amount || "0")).toFixed(2)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={
                depositMutation.isPending ||
                !amount ||
                parseFloat(amount) <= 0
              }
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              {depositMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Wallet className="h-4 w-4" />
              Deposit ₹{parseFloat(amount || "0").toFixed(2)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
