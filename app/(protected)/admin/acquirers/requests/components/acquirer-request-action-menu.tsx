'use client';

import { CheckCircle, EllipsisVertical, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MerchantAcquirerRequest } from '@/lib/services/admin/acquirers';

interface AcquirerRequestActionMenuProps {
  request: MerchantAcquirerRequest;
  onView: (request: MerchantAcquirerRequest) => void;
  onApprove: (request: MerchantAcquirerRequest) => void;
  onReject: (request: MerchantAcquirerRequest) => void;
}

export function AcquirerRequestActionMenu({
  request,
  onView,
  onApprove,
  onReject,
}: AcquirerRequestActionMenuProps) {
  const isPending = request.status === 'pending';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-7" mode="icon" variant="ghost">
          <EllipsisVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuItem onClick={() => onView(request)}>
          <Eye className="mr-1 size-4" />
          View Details
        </DropdownMenuItem>
        {isPending && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onApprove(request)}>
              <CheckCircle className="mr-1 size-4 text-green-600" />
              Approve Request
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onReject(request)}
            >
              <X className="mr-1 size-4" />
              Reject Request
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
