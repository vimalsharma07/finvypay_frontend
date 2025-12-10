'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, ChevronsUpDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'text-search' | 'select' | 'select-search' | 'date';
  placeholder?: string;
  options?: { label: string; value: string }[];
}

export interface AdvancedFilterProps {
  fields: FilterField[];
  onApply: (filters: Record<string, string>) => void;
  onReset?: () => void;
  trigger?: React.ReactNode;
}

export function AdvancedFilter({
  fields,
  onApply,
  onReset,
  trigger,
}: AdvancedFilterProps) {
  const [open, setOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [openComboboxes, setOpenComboboxes] = useState<Record<string, boolean>>({});

  // Initialize filter values
  const initializeFilters = () => {
    const initialValues: Record<string, string> = {};
    fields.forEach((field) => {
      initialValues[field.key] = '';
    });
    setFilterValues(initialValues);
  };

  // Handle field value change
  const handleFieldChange = (key: string, value: string) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle apply filters
  const handleApply = () => {
    // Filter out empty values and 'all' values
    const cleanedFilters: Record<string, string> = {};
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        cleanedFilters[key] = value;
      }
    });
    onApply(cleanedFilters);
    setOpen(false);
  };

  // Handle cancel/reset
  const handleCancel = () => {
    if (onReset) {
      onReset();
      initializeFilters();
    }
    setOpen(false);
  };

  // Initialize filters when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      initializeFilters();
    }
  };

  // Default trigger button
  const defaultTrigger = (
    <Button variant="outline">
      <Filter className="size-4 mr-2" />
      Advanced Filter
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Advanced Filter</DialogTitle>
          <DialogDescription>
            Filter data by the following criteria
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {fields.map((field) => {
            const selectedOption = field.options?.find(
              (opt) => opt.value === filterValues[field.key]
            );
            const isComboboxOpen = openComboboxes[field.key] || false;

            return (
              <div key={field.key} className="grid gap-2">
                <Label htmlFor={`filter-${field.key}`}>{field.label}</Label>
                {field.type === 'text' || field.type === 'text-search' ? (
                  <Input
                    id={`filter-${field.key}`}
                    type="text"
                    placeholder={field.placeholder || `Search ${field.label.toLowerCase()}`}
                    value={filterValues[field.key] || ''}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value)
                    }
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={filterValues[field.key] || undefined}
                    onValueChange={(value) => handleFieldChange(field.key, value === 'all' ? '' : value)}
                  >
                    <SelectTrigger id={`filter-${field.key}`}>
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All {field.label}</SelectItem>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'select-search' ? (
                  <Popover
                    open={isComboboxOpen}
                    onOpenChange={(open) =>
                      setOpenComboboxes((prev) => ({
                        ...prev,
                        [field.key]: open,
                      }))
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isComboboxOpen}
                        className="w-full justify-between"
                      >
                        {selectedOption
                          ? selectedOption.label
                          : field.placeholder || `Select ${field.label.toLowerCase()}...`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder={`Search ${field.label.toLowerCase()}...`}
                        />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {field.options?.map((option) => (
                              <CommandItem
                                key={option.value}
                                value={option.label}
                                onSelect={() => {
                                  handleFieldChange(
                                    field.key,
                                    filterValues[field.key] === option.value
                                      ? ''
                                      : option.value
                                  );
                                  setOpenComboboxes((prev) => ({
                                    ...prev,
                                    [field.key]: false,
                                  }));
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    filterValues[field.key] === option.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {option.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Input
                    id={`filter-${field.key}`}
                    type="date"
                    value={filterValues[field.key] || ''}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value)
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Filter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
