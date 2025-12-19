'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RiskManagement } from '@/lib/services/admin/risk-management';

interface TableActionButtonsProps {
  row: RiskManagement;
  onEdit: (risk: RiskManagement) => void;
  onDelete: (risk: RiskManagement) => void;
}

export function TableActionButtons({ row, onEdit, onDelete }: TableActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        className="size-7"
        mode="icon"
        variant="ghost"
        onClick={() => onEdit(row)}
        title="Edit Risk"
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        className="size-7"
        mode="icon"
        variant="ghost"
        onClick={() => onDelete(row)}
        title="Delete Risk"
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}

