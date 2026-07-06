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

const paymentColors: Record<string, string> = {
  cash: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-800",
  card: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800",
  upi: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-400 dark:border-purple-800",
  bank_transfer: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-800",
  other: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
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
        <CardContent className="p-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-xs font-semibold text-green-900 mb-0.5">Available Advance Balance</p>
              <h2 className="text-2xl font-bold text-green-700">₹{currentBalance.toFixed(2)}</h2>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
            onClick={() => setDepositOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Advance
          </Button>
        </CardContent>
      </Card>

      <Card className='pt-0'>
        <CardHeader className="border-b [.border-b]:pb-0">
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
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-muted/30 transition-colors gap-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isDeposit ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        {isDeposit ? (
                          <ArrowDownRight className="h-4 w-4 text-green-600 dark:text-green-500" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-500" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {isDeposit ? 'Deposit' : 'Deduction'}
                          </span>
                          <span className="text-xs text-muted-foreground">|</span>
                          <span className="font-semibold text-xs">
                            {format(new Date(tx.createdAt), 'dd/MM/yyyy, hh:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {tx.payment_method && (
                            <Badge variant="outline" className={`text-[10px] uppercase font-semibold ${paymentColors[tx.payment_method] || paymentColors.other}`}>
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
                          {tx.notes && (
                            <span className="text-xs text-muted-foreground italic border-l pl-2 border-border/50">
                              Note: {tx.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:self-start ml-11 sm:ml-0 mt-2 sm:mt-0">
                      <span className={`font-bold text-base ${isDeposit ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
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
