'use client';

import { useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Option } from '@/lib/types/common-types';

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedSet = useMemo(() => new Set(selected ?? []), [selected]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) =>
        String(o.label).toLowerCase().includes(q) || String(o.value).toLowerCase().includes(q)
    );
  }, [options, search]);

  const toggle = (value: string) => {
    const next = new Set(selectedSet);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    onChange(Array.from(next));
  };

  const summary = selected
    .map((val) => options.find((o) => String(o.value) === val)?.label || val)
    .filter(Boolean);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSearch('');
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between text-xs md:text-sm">
          <div className="flex flex-wrap gap-1 items-center">
            {summary.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {summary.map((label) => (
              <Badge key={label} variant="secondary" className="text-[11px]">
                {label}
              </Badge>
            ))}
          </div>
          <span className="text-muted-foreground text-xs">▼</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-64" onOpenAutoFocus={(e) => e.preventDefault()}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="max-h-56">
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={String(option.value)}
                    value={String(option.value)}
                    className="cursor-pointer data-[disabled=true]:!pointer-events-auto data-[disabled=true]:!opacity-100"
                    onSelect={() => toggle(String(option.value))}
                  >
                    <Checkbox
                      checked={selectedSet.has(String(option.value))}
                      className="pointer-events-none"
                      aria-label={String(option.label)}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

