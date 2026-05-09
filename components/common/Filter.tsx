"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  FiltersSchema,
  FilterFields,
  FieldTypes,
  DateRange,
  Option,
} from "@/lib/types/common-types";
import { generateFilterQuery, formatDate } from "@/lib/helpers";
import { DateRangePicker, SingleDatePicker } from "@/components/ui/molecules/DatePicker";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { SearchSelect } from "@/components/ui/molecules/SearchSelect";
import { MultiSelect } from "./MultiSelect";
import { format } from "date-fns";
import type { DateRange as PickerDateRange } from "react-day-picker";

type FilterValue = string | number | boolean | string[] | number[] | null;

interface FilterProps {
  filtersSchema: FiltersSchema[];
  onApplyFilters: (filters: FilterFields) => void;
  currentFilters: FilterFields;
  open: boolean;
  setOpen: (open: boolean) => void;
  baseUrl: string;
}

export function Filter({
  filtersSchema,
  onApplyFilters,
  currentFilters,
  open,
  setOpen,
  baseUrl,
}: FilterProps) {
  const [filterValues, setFilterValues] = useState<FilterFields>({});
  const router = useRouter();

  useEffect(() => {
    // Normalize multiSelect fields: ensure arrays of strings, split comma-separated strings
    const processedFilters: FilterFields = { ...currentFilters };
    filtersSchema.forEach((filter) => {
      if (filter.type === FieldTypes.multiSelect) {
        const rawValue = currentFilters[
          filter.field as keyof FilterFields
        ] as any;
        if (rawValue !== undefined && rawValue !== null) {
          if (Array.isArray(rawValue)) {
            (processedFilters as any)[filter.field] = rawValue.map((v: any) =>
              String(v)
            );
          } else if (typeof rawValue === "string") {
            const values = rawValue
              .split(",")
              .map((v) => v.trim())
              .filter((v) => v.length > 0);
            (processedFilters as any)[filter.field] =
              values.length > 0 ? values : [];
          } else {
            (processedFilters as any)[filter.field] = [String(rawValue)];
          }
        }
      }
    });

    // Avoid state updates if nothing changed to prevent render loops
    setFilterValues((prev) => {
      const prevString = JSON.stringify(prev);
      const nextString = JSON.stringify(processedFilters);
      return prevString === nextString ? prev : processedFilters;
    });
  }, [currentFilters, filtersSchema]);

  const handleInputChange = (field: keyof FilterFields, value: string) => {
    setFilterValues((prev: FilterFields) => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = useCallback(
    (field: keyof FilterFields, value: FilterValue) => {
      setFilterValues((prev: FilterFields) => {
        if (value === null) {
          // Create a new object without the field when "All" is selected
          const newValues = { ...prev };
          delete newValues[field];
          return newValues;
        }
        return { ...prev, [field]: value };
      });
    },
    []
  );

  const handleSwitchChange = useCallback(
    (field: keyof FilterFields, checked: boolean) => {
      setFilterValues((prev: FilterFields) => ({
        ...prev,
        [field]: checked.toString(),
      }));
    },
    []
  );

  const handleDateRangeChange = useCallback(
    (field: keyof FilterFields, range: DateRange | null) => {
      if (range?.startDate && range?.endDate) {
        if (field === "created_at") {
          setFilterValues((prev: FilterFields) => {
            const nextStart = formatDate(range.startDate!);
            const nextEnd = formatDate(range.endDate!);
            if (prev.start_date === nextStart && prev.end_date === nextEnd) return prev;
            return {
              ...prev,
              start_date: nextStart,
              end_date: nextEnd,
            };
          });
        } else {
          const key = String(field);
          setFilterValues((prev: FilterFields) => {
            const nextStart = formatDate(range.startDate!);
            const nextEnd = formatDate(range.endDate!);
            if (
              prev[`${key}_start`] === nextStart &&
              prev[`${key}_end`] === nextEnd
            ) {
              return prev;
            }
            return {
              ...prev,
              [`${key}_start`]: nextStart,
              [`${key}_end`]: nextEnd,
            };
          });
        }
      } else {
        const key = String(field);
        setFilterValues((prev: FilterFields) => {
          const newValues = { ...prev };
          if (field === "created_at") {
            delete newValues["start_date" as keyof FilterFields];
            delete newValues["end_date" as keyof FilterFields];
          } else {
            delete newValues[`${key}_start` as keyof FilterFields];
            delete newValues[`${key}_end` as keyof FilterFields];
          }
          return newValues;
        });
      }
    },
    []
  );

  const getDateRangeValue = (field: string): DateRange | null => {
    const startDate =
      field === "created_at"
        ? filterValues["start_date" as keyof FilterFields]
        : filterValues[`${field}_start` as keyof FilterFields];
    const endDate =
      field === "created_at"
        ? filterValues["end_date" as keyof FilterFields]
        : filterValues[`${field}_end` as keyof FilterFields];

    if (startDate && endDate) {
      return {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      };
    }
    return null;
  };

  /** Value for DateRangeFilter (react-day-picker: from/to) from start_date/end_date (created_at) */
  const getDateRangeFilterValue = (field: string): PickerDateRange | undefined => {
    if (field !== "created_at") return undefined;
    const start = filterValues["start_date" as keyof FilterFields] as string | undefined;
    const end = filterValues["end_date" as keyof FilterFields] as string | undefined;
    if (!start || !end) return undefined;
    const from = new Date(start);
    const to = new Date(end);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return undefined;
    return { from, to };
  };

  const handleDateRangeFilterChange = useCallback(
    (field: keyof FilterFields, range: PickerDateRange | undefined) => {
      if (field !== "created_at") return;
      if (range?.from && range?.to) {
        const start_date = format(range.from, "yyyy-MM-dd");
        const end_date = format(range.to, "yyyy-MM-dd");
        setFilterValues((prev: FilterFields) => ({
          ...prev,
          start_date,
          end_date,
        }));
      } else {
        setFilterValues((prev: FilterFields) => {
          const next = { ...prev };
          delete next["start_date" as keyof FilterFields];
          delete next["end_date" as keyof FilterFields];
          return next;
        });
      }
    },
    []
  );

  const handleSingleDateChange = useCallback(
    (field: keyof FilterFields, value: string | null) => {
      setFilterValues((prev: FilterFields) => {
        if (!value || value.trim() === "") {
          const next = { ...prev };
          delete next[field as keyof FilterFields];
          return next;
        }
        return { ...prev, [field]: value.trim() };
      });
    },
    []
  );

  const handleApplyFilters = useCallback(() => {
    const queryObject: any = generateFilterQuery(filterValues);
    setOpen(false);
    onApplyFilters(queryObject);
  }, [filterValues, onApplyFilters, setOpen]);

  const handleResetFilters = useCallback(() => {
    setFilterValues({});
    setOpen(false);
    onApplyFilters({});
    router.replace(baseUrl);
  }, [baseUrl, router, setOpen, onApplyFilters]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter" && open && !event.defaultPrevented) {
        event.preventDefault();
        handleApplyFilters();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [open, handleApplyFilters]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent className="flex flex-col bg-card max-h-[80vh] p-0 gap-0 max-w-2xl">
        <DialogHeader className="p-3  border-b rounded-t-lg">
          <DialogTitle>Advanced Filter</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 overflow-x-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtersSchema.map((filter) => (
              <div key={filter.field} className="space-y-2">
                <Label htmlFor={filter.field} className="text-xs md:text-sm">
                  {filter.label}
                </Label>

                {filter.type === FieldTypes.input && (
                  <Input
                    id={filter.field}
                    value={
                      filterValues[filter.field as keyof FilterFields] || ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        filter.field as keyof FilterFields,
                        e.target?.value?.trim()
                      )
                    }
                    placeholder={`${
                      filter?.placeholder
                        ? filter?.placeholder
                        : `Enter ${filter.label}`
                    } `}
                    className="text-xs md:text-sm"
                  />
                )}

                {filter.type === FieldTypes.select && (
                  <Select
                    // value={
                    //   filterValues[filter.field as keyof FilterFields] === undefined
                    //     ? ""
                    //     : filterValues[filter.field as keyof FilterFields] === null
                    //       ? "null"
                    //       : String(filterValues[filter.field as keyof FilterFields])
                    // }

                    value={
                      filterValues[filter.field as keyof FilterFields] ===
                      undefined
                        ? ""
                        : String(
                            filterValues[filter.field as keyof FilterFields] ??
                              "null"
                          )
                    }
                    onValueChange={(value: string) => {
                      if (value === "null") {
                        // When "All" is selected, pass null to handleSelectChange
                        handleSelectChange(
                          filter.field as keyof FilterFields,
                          null
                        );
                      } else {
                        // For other options
                        const isNumericOptions = filter.options?.every(
                          (option: any) => typeof option.value === "number"
                        );
                        const processedValue = isNumericOptions
                          ? Number(value)
                          : value;
                        handleSelectChange(
                          filter.field as keyof FilterFields,
                          processedValue
                        );
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option">
                        {filterValues[filter.field as keyof FilterFields] ===
                        undefined
                          ? "Select an option"
                          : filter.options?.find(
                              (opt: Option) =>
                                String(opt.value) ===
                                String(
                                  filterValues[
                                    filter.field as keyof FilterFields
                                  ]
                                )
                            )?.label ||
                            (filterValues[
                              filter.field as keyof FilterFields
                            ] === null
                              ? "All"
                              : "Select an option")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options?.map((option: any) => (
                        <SelectItem
                          key={option?.value ?? "null"}
                          value={
                            option?.value === null
                              ? "null"
                              : String(option?.value)
                          }
                        >
                          {option?.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {filter.type === FieldTypes.switch && (
                  <Switch
                    id={filter.field}
                    checked={
                      filterValues[filter.field as keyof FilterFields] ===
                      "true"
                    }
                    onCheckedChange={(checked) =>
                      handleSwitchChange(
                        filter.field as keyof FilterFields,
                        checked
                      )
                    }
                  />
                )}
                {filter.type === FieldTypes.date && (
                  <SingleDatePicker
                    value={
                      (filterValues[filter.field as keyof FilterFields] as string) || null
                    }
                    onChange={(value) =>
                      handleSingleDateChange(
                        filter.field as keyof FilterFields,
                        value
                      )
                    }
                    placeholder={`Select ${filter.label}`}
                    className="text-xs md:text-sm w-full"
                  />
                )}

                {filter.type === FieldTypes.dateRange && (
                  <div>
                    <DateRangePicker
                      initialRange={getDateRangeValue(filter.field)}
                    onChange={(range: DateRange | null) =>
                        handleDateRangeChange(
                          filter.field as keyof FilterFields,
                          range
                        )
                      }
                    />
                  </div>
                )}

                {filter.type === FieldTypes.dateRangeFilter && (
                  <div>
                    <DateRangeFilter
                      value={getDateRangeFilterValue(filter.field)}
                      onChange={(range) =>
                        handleDateRangeFilterChange(
                          filter.field as keyof FilterFields,
                          range
                        )
                      }
                      placeholder="Select from and to date"
                      numberOfMonths={2}
                      size="sm"
                      triggerClassName="w-full min-w-0"
                    />
                  </div>
                )}

                {filter.type === FieldTypes.searchSelect && (
                  <div className="relative">
                    <SearchSelect
                      options={filter.options || []}
                      value={
                        filterValues[
                          filter.field as keyof FilterFields
                        ]?.toString() || ""
                      }
                      onChange={(value: string | number | null) =>
                        handleSelectChange(
                          filter.field as keyof FilterFields,
                          value
                        )
                      }
                      valueToShow={filter.valueToShow || "label"}
                      valueToSet={filter.valueToSet || "value"}
                    />
                  </div>
                )}
                {filter.type === FieldTypes.multiSelect && (
                  <div className="relative">
                    <MultiSelect
                      options={filter.options || []}
                      selected={
                        Array.isArray(
                          filterValues[filter.field as keyof FilterFields]
                        )
                          ? (filterValues[
                              filter.field as keyof FilterFields
                            ] as unknown as string[]) || []
                          : []
                      }
                      onChange={(selected: string[]) =>
                        handleSelectChange(
                          filter.field as keyof FilterFields,
                          selected
                        )
                      }
                      placeholder={`Select ${filter.label}...`}
                      size={filter.multiSelectSize ?? 'default'}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="shrink-0 mt-auto p-3 border-t">
          <div className="flex gap-2 w-full justify-end">
            <Button onClick={handleApplyFilters} className="text-xs md:text-sm">
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="text-xs md:text-sm"
            >
              Reset
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}