/**
 * Common Types
 */

export interface Option {
  value: string | number | null;
  label: string;
}

export enum FieldTypes {
  input = 'input',
  select = 'select',
  switch = 'switch',
  date = 'date',
  dateRange = 'dateRange',
  /** Same date range UI as dashboard (DateRangeFilter with calendar + Clear/Apply). Stores start_date, end_date (yyyy-MM-dd) when field is created_at. */
  dateRangeFilter = 'dateRangeFilter',
  searchSelect = 'searchSelect',
  multiSelect = 'multiSelect',
}

export interface FiltersSchema {
  field: string;
  label: string;
  type: FieldTypes;
  placeholder?: string;
  options?: Option[];
  valueToShow?: 'label' | 'value';
  valueToSet?: 'label' | 'value';
}

export type FilterFields = Record<string, any>;

export interface DateRange {
  startDate?: Date | string;
  endDate?: Date | string;
}

