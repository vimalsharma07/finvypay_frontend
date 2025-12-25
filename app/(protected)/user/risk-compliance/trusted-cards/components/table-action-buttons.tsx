'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardWhitelist } from '@/lib/services/user/card-whitelist';

interface TableActionButtonsProps {
  row: CardWhitelist;
  onEdit: (card: CardWhitelist) => void;
  onDelete: (card: CardWhitelist) => void;
}

export function TableActionButtons({ row, onEdit, onDelete }: TableActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        className="size-7"
        mode="icon"
        variant="ghost"
        onClick={() => onEdit(row)}
        title="Edit Card"
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        className="size-7"
        mode="icon"
        variant="ghost"
        onClick={() => onDelete(row)}
        title="Delete Card"
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}

