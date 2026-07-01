import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  Loader2,
} from 'lucide-react';
import { AdvanceDepositDialog } from '@/features/billing/components/AdvanceDepositDialog';
import { billingService } from '@/features/billing/services/billing.service';

type Props = {
  patientId: number;
};

// Payment method icon mapping
const paymentIcons: Record<string, typeof Banknote> = {
  cash: Banknote,
  card: CreditCard,
  upi: Smartphone,
  bank_transfer: Building,
  other: CreditCard,
};

const paymentLabels: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  other: "Other",
};

export function PatientAdvanceTab({ patientId }: Props) {
  const [depositOpen, setDepositOpen] = useState(false);

  // Fetch advance balance
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['advance-balance', patientId],
    queryFn: () => billingService.getAdvanceBalance(patientId),
    enabled: !!patientId,
  });

  // Fetch advance ledger
  const { data: ledgerData, isLoading: ledgerLoading } = useQuery({
    queryKey: ['advance-ledger', patientId],
    queryFn: () => billingService.getAdvanceLedger(patientId, { limit: 50 }),
    enabled: !!patientId,
  });

  const currentBalance = balanceData?.balance || 0;
  const advances = ledgerData?.advances || [];

  if (balanceLoading || ledgerLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Wallet className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-900 mb-1">Available Advance Balance</p>
              <h2 className="text-3xl font-bold text-green-700">₹{currentBalance.toFixed(2)}</h2>
            </div>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
            onClick={() => setDepositOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Advance
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            Advance Ledger History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {advances.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Wallet className="h-10 w-10 opacity-20 mb-3" />
              <p className="text-sm">No advance transactions found for this patient.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {advances.map((tx) => {
                const isDeposit = tx.transaction_type === 'deposit';
                return (
                  <div 
                    key={tx.advance_id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isDeposit ? 'bg-green-100' : 'bg-red-100'}`}>
                        {isDeposit ? (
                          <ArrowDownRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {isDeposit ? 'Deposit' : 'Deduction'}
                          </span>
                          <span className="text-xs text-muted-foreground">|</span>
                          <span className="font-medium text-xs">
                            {format(new Date(tx.createdAt), 'dd/MM/yyyy, hh:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {tx.payment_method && (
                            <Badge variant="outline" className="text-[10px] uppercase font-semibold text-muted-foreground">
                              {(() => {
                                const Icon = paymentIcons[tx.payment_method] || CreditCard;
                                return <Icon className="mr-1 h-3 w-3 inline" />;
                              })()}
                              {paymentLabels[tx.payment_method] || tx.payment_method}
                            </Badge>
                          )}
                          {tx.reference_type && tx.reference_id && (
                            <Badge variant="secondary" className="text-[10px]">
                              {tx.reference_type}: {tx.reference_id}
                            </Badge>
                          )}
                        </div>
                        {tx.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {tx.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:self-start ml-11 sm:ml-0 mt-2 sm:mt-0">
                      <span className={`font-bold text-base ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
                        {isDeposit ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AdvanceDepositDialog
        open={depositOpen}
        onOpenChange={setDepositOpen}
        patientId={patientId}
        currentBalance={currentBalance}
      />
    </div>
  );
}

export default PatientAdvanceTab;
