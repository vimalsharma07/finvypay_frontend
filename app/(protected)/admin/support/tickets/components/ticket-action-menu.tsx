'use client';

import { EllipsisVertical, Eye, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SupportTicket } from '@/lib/services/admin/support-ticket';

interface TicketActionMenuProps {
  ticket: SupportTicket;
  onView: (ticket: SupportTicket) => void;
  onReopen: (ticket: SupportTicket) => void;
  onClose: (ticket: SupportTicket) => void;
}

export function TicketActionMenu({
  ticket,
  onView,
  onReopen,
  onClose,
}: TicketActionMenuProps) {
  const isClosed = ticket.status === 'CLOSED';
  const isOpen = ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-7" mode="icon" variant="ghost">
          <EllipsisVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuItem onClick={() => onView(ticket)}>
          <Eye className="mr-1 size-4" />
          View
        </DropdownMenuItem>
        {isClosed && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onReopen(ticket)}>
              <RotateCcw className="mr-1 size-4" />
              Reopen
            </DropdownMenuItem>
          </>
        )}
        {isOpen && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onClose(ticket)}
            >
              <X className="mr-1 size-4" />
              Close
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

