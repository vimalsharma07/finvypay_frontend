'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  options: MultiSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  variant?: 'secondary' | 'destructive' | 'outline';
}

export function MultiSelectField({
  control,
  name,
  label,
  options,
  placeholder = 'Select options',
  disabled = false,
  variant = 'secondary',
}: MultiSelectFieldProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(term) ||
        option.value.toLowerCase().includes(term),
    );
  }, [options, searchTerm]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  disabled={disabled}
                >
                  {field.value.length > 0
                    ? `${field.value.length} selected`
                    : placeholder}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <div className="p-2 space-y-2">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9"
                />
                <div className="max-h-[260px] overflow-y-auto">
                  {filteredOptions.length === 0 ? (
                    <div className="py-3 text-sm text-muted-foreground px-2">
                      No options found
                    </div>
                  ) : (
                    filteredOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2 p-2 hover:bg-muted rounded"
                      >
                        <Checkbox
                          id={`${name}-${option.value}`}
                          checked={field.value.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, option.value]
                              : field.value.filter((c: string) => c !== option.value);
                            field.onChange(newValue);
                          }}
                        />
                        <label
                          htmlFor={`${name}-${option.value}`}
                          className="text-sm font-medium leading-none cursor-pointer flex-1"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {field.value.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {field.value.map((value: string) => {
                const option = options.find((o) => o.value === value);
                return (
                  <Badge key={value} variant={variant}>
                    {option?.label || value}
                    <button
                      type="button"
                      onClick={() => {
                        field.onChange(field.value.filter((c: string) => c !== value));
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

