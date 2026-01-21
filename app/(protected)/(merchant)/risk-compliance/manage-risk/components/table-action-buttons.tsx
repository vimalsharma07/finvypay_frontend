'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { RiskManagement } from '@/lib/services/user/risk-management';
import { TableActionMenu, TableActionMenuItem } from '@/app/(protected)/components/table-action-menu';

interface TableActionButtonsProps {
  row: RiskManagement;
  onEdit: (risk: RiskManagement) => void;
  onDelete: (risk: RiskManagement) => void;
}

export function TableActionButtons({ row, onEdit, onDelete }: TableActionButtonsProps) {
  const actions: TableActionMenuItem<RiskManagement>[] = [
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

