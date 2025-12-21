'use client';

import { EllipsisVertical, DollarSign, Ban, ArrowLeftRight, Eye } from 'lucide-react';
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
  onWebhookLogs?: (transaction: Transaction) => void;
  onProviderLogs?: (transaction: Transaction) => void;
  onTransactionLogs?: (transaction: Transaction) => void;
  onChargeback?: (transaction: Transaction) => void;
  onRefund?: (transaction: Transaction) => void;
  onSuspicious?: (transaction: Transaction) => void;
  showDisabledActions?: boolean; // Control visibility of refund, chargeback, suspicious
}

export function TransactionActionMenu({
  transaction,
  onWebhookLogs,
  onProviderLogs,
  onTransactionLogs,
  onChargeback,
  onRefund,
  onSuspicious,
  showDisabledActions = true, // Default to true for production transactions
}: TransactionActionMenuProps) {
  // Check if transaction is successful (status === 1 means Approved)
  const isSuccessful = transaction.status === 1;
  const showActionOptions = showDisabledActions && isSuccessful;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-7" mode="icon" variant="ghost">
          <EllipsisVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-[180px]">
        {/* Action Options - Show active for successful transactions, disabled for others */}
        {showDisabledActions && (
          <>
            {showActionOptions ? (
              <>
                <DropdownMenuItem onClick={() => onRefund?.(transaction)}>
                  <DollarSign className="mr-2 size-4" />
                  Refund
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChargeback?.(transaction)}>
                  <Ban className="mr-2 size-4" />
                  Chargeback
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSuspicious?.(transaction)}>
                  <ArrowLeftRight className="mr-2 size-4" />
                  Suspicious
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                  <DollarSign className="mr-2 size-4" />
                  Refund
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                  <Ban className="mr-2 size-4" />
                  Chargeback
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                  <ArrowLeftRight className="mr-2 size-4" />
                  Suspicious
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
          </>
        )}

        {/* Active Log Actions */}
        <DropdownMenuItem
          onClick={() => onWebhookLogs?.(transaction)}
          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
        >
          <Eye className="mr-2 size-4 text-green-600" />
          Webhook Logs
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onProviderLogs?.(transaction)}
          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
        >
          <Eye className="mr-2 size-4 text-orange-600" />
          Provider Logs
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onTransactionLogs?.(transaction)}
          className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 dark:hover:bg-pink-950"
        >
          <Eye className="mr-2 size-4 text-pink-600" />
          Transaction Logs
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

