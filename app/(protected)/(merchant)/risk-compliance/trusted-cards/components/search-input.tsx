'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ps-9 w-40"
      />
      {value.length > 0 && (
        <Button
          mode="icon"
          variant="ghost"
          className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
          onClick={() => onChange('')}
        >
          <X />
        </Button>
      )}
    </div>
  );
}

