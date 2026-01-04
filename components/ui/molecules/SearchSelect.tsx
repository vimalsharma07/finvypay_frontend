'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Option } from '@/lib/types/common-types';

interface SearchSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  valueToShow?: 'label' | 'value';
  valueToSet?: 'label' | 'value';
  placeholder?: string;
  disabled?: boolean;
  maxHeight?: string;
}

export function SearchSelect({
  options,
  value,
  onChange,
  valueToShow = 'label',
  valueToSet = 'value',
  placeholder = 'Select option...',
  disabled = false,
  maxHeight = '300px',
}: SearchSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find(
    (option) => option[valueToSet] === value
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedOption
            ? selectedOption[valueToShow]
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0" 
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList 
            className="overflow-y-auto" 
            style={{ maxHeight }}
          >
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
            <CommandItem
              key={String(option[valueToSet])}
              value={String(option[valueToShow] ?? option[valueToSet] ?? '')}
              onSelect={() => {
                onChange(String(option[valueToSet]));
                setOpen(false);
              }}
            >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option[valueToSet]
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {option[valueToShow]}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

