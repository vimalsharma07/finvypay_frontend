'use client';

import { EllipsisVertical, DollarSign, Ban, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Transaction } from '@/lib/services/admin/transaction';

interface TransactionActionMenuProps {
  transaction: Transaction;
  onChargeback?: (transaction: Transaction) => void;
  onRefund?: (transaction: Transaction) => void;
  onSuspicious?: (transaction: Transaction) => void;
  showDisabledActions?: boolean; // Control visibility of refund, chargeback, suspicious
}

export function TransactionActionMenu({
  transaction,
  onChargeback,
  onRefund,
  onSuspicious,
  showDisabledActions = true, // Default to true for production transactions
}: TransactionActionMenuProps) {
  // Check if transaction is successful (status === 1 means Success)
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

