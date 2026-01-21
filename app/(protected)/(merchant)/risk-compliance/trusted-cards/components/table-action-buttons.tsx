'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { CardWhitelist } from '@/lib/services/user/card-whitelist';
import { TableActionMenu, TableActionMenuItem } from '@/app/(protected)/components/table-action-menu';

interface TableActionButtonsProps {
  row: CardWhitelist;
  onEdit: (card: CardWhitelist) => void;
  onDelete: (card: CardWhitelist) => void;
}

export function TableActionButtons({ row, onEdit, onDelete }: TableActionButtonsProps) {
  const actions: TableActionMenuItem<CardWhitelist>[] = [
    {
      label: 'Edit',
      icon: Pencil,
      onClick: () => onEdit(row),
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: () => onDelete(row),
      variant: 'destructive',
      separator: true,
    },
  ];

  return <TableActionMenu row={row} actions={actions} />;
}

