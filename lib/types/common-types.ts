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
  dateRange = 'dateRange',
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

