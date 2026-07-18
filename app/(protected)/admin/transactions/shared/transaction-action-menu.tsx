'use client';

import { EllipsisVertical, DollarSign, Ban, ArrowLeftRight, Webhook, Logs } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Transaction } from '@/lib/services/admin/transaction';

interface TransactionActionMenuProps {
  transaction: Transaction;
  onChargeback?: (transaction: Transaction) => void;
  onRefund?: (transaction: Transaction) => void;
  onSuspicious?: (transaction: Transaction) => void;
  /** Production admin only: POST /admin/transaction/:transactionId/resend-webhook */
  onResendWebhook?: (transaction: Transaction) => void;
  onViewLogs?: (transaction: Transaction) => void;
  resendingWebhookTransactionId?: string | null;
  showDisabledActions?: boolean; // Control visibility of refund, chargeback, suspicious
}

export function TransactionActionMenu({
  transaction,
  onChargeback,
  onRefund,
  onSuspicious,
  onResendWebhook,
  onViewLogs,
  resendingWebhookTransactionId = null,
  showDisabledActions = true, // Default to true for production transactions
}: TransactionActionMenuProps) {
  // Status 1 = Success; chargebackDate means already charged back (status stays 1)
  const canTakeStatusActions =
    transaction.status === 1 && !transaction.chargebackDate;
  const showActionOptions = showDisabledActions && canTakeStatusActions;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-7" mode="icon" variant="ghost">
          <EllipsisVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-[200px]">
        {/* Action Options - Show active for successful transactions, disabled for others */}
        {showDisabledActions && (
          <>
            {showActionOptions ? (
              <>
                <DropdownMenuItem onClick={() => onRefund?.(transaction)}>
                  <DollarSign className="mr-1 size-4" />
                  Refund
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChargeback?.(transaction)}>
                  <Ban className="mr-1 size-4" />
                  Chargeback
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSuspicious?.(transaction)}>
                  <ArrowLeftRight className="mr-1 size-4" />
                  Suspicious
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                  <DollarSign className="mr-1 size-4" />
                  Refund
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                  <Ban className="mr-1 size-4" />
                  Chargeback
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                  <ArrowLeftRight className="mr-1 size-4" />
                  Suspicious
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
        {onResendWebhook && (
          <>
            {showDisabledActions && <DropdownMenuSeparator />}
            <DropdownMenuItem
              disabled={
                !transaction.transactionId ||
                resendingWebhookTransactionId === transaction.transactionId
              }
              onClick={() => onResendWebhook(transaction)}
            >
              <Webhook className="mr-1 size-4" />
              Resend webhook
            </DropdownMenuItem>
          </>
        )}
        {onViewLogs && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewLogs(transaction)}>
              <Logs className="mr-1 size-4" />
              Logs
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

