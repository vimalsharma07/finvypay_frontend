'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <div className="relative w-full max-w-lg my-2 group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <Search className={cn(
          "size-4.5 transition-all duration-200",
          value 
            ? "text-primary" 
            : "text-muted-foreground group-focus-within:text-primary"
        )} />
      </div>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "pl-11 pr-10 h-9 text-sm w-full",
          "bg-background border-border/60",
          "focus-visible:border-primary/50 focus-visible:ring-primary/20",
          "transition-all duration-200",
          "shadow-sm hover:shadow-md focus-visible:shadow-lg",
          value && "border-primary/30 bg-primary/5"
        )}
      />
      {value.length > 0 && (
        <Button
          mode="icon"
          variant="ghost"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md hover:bg-muted/80 transition-colors"
          onClick={() => onChange('')}
        >
          <X className="size-3.5 text-muted-foreground hover:text-foreground" />
        </Button>
      )}
    </div>
  );
}

