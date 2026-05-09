'use client';

import { EllipsisVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SupportTicket } from '@/lib/services/user/support-ticket';

interface TicketActionMenuProps {
  ticket: SupportTicket;
  onEdit: (ticket: SupportTicket) => void;
  onDelete: (ticket: SupportTicket) => void;
}

export function TicketActionMenu({
  ticket,
  onEdit,
  onDelete,
}: TicketActionMenuProps) {
  const router = useRouter();

  const handleView = () => {
    router.push(`/support/${ticket.id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-7" mode="icon" variant="ghost">
          <EllipsisVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-[180px]">
        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-1 size-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(ticket)}>
          <Pencil className="mr-1 size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(ticket)}
        >
          <Trash2 className="mr-1 size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

