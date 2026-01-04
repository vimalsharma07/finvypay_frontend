'use client';

import { Control, FieldValues, useFieldArray } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelectField } from './multi-select-field';
import { CURRENCIES, PROVIDER_TYPES, FLOW_TYPES, TIMEZONES, COUNTRIES, CARD_TYPES } from '../constants';

interface FormSectionsProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  acquirers: Array<{ id: number | string; acquirerName: string }>;
  currencies?: string[];
  countries?: Array<{ code: string; name: string }>;
  configFields: Array<{ id: string }>;
  appendConfig: () => void;
  removeConfig: (index: number) => void;
  submitting?: boolean;
  disableFieldName?: boolean;
  disableAcquirer?: boolean;
  showStatus?: boolean;
}

export function BasicInformationSection<T extends FieldValues = FieldValues>({
  control,
  acquirers,
  currencies,
  submitting = false,
  disableAcquirer = false,
  showStatus = true,
}: Pick<FormSectionsProps<T>, 'control' | 'acquirers' | 'currencies' | 'submitting' | 'disableAcquirer' | 'showStatus'>) {
  const currencyOptions = currencies && currencies.length > 0 ? currencies : CURRENCIES;
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name={"name" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} disabled={submitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={"acquirerId" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Acquirer <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={submitting || disableAcquirer}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select acquirer" />
                  </SelectTrigger>
                  <SelectContent>
                    {acquirers.map((acquirer) => (
                      <SelectItem key={acquirer.id} value={String(acquirer.id)}>
                        {acquirer.acquirerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={"currency" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Currency <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange} disabled={submitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={"providerType" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Provider Type <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange} disabled={submitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={"flowType" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Flow Type <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange} disabled={submitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select flow type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLOW_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={"timezone" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Timezone <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange} disabled={submitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showStatus && (
          <FormField
            control={control}
            name={"status" as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Status <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange} disabled={submitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}

interface LimitFieldConfig {
  name: string;
  label: string;
  type: 'number' | 'integer' | 'text';
  step?: string;
  required?: boolean;
}

const LIMIT_FIELDS: LimitFieldConfig[] = [
  { name: 'minTransactionAmount', label: 'Minimum Transaction Amount', type: 'number', step: '0.01' },
  { name: 'maxTransactionAmount', label: 'Maximum Transaction Amount', type: 'number', step: '0.01' },
  { name: 'perDaySuccessAmount', label: 'Per Day Success Amount', type: 'number', step: '0.01' },
  { name: 'perDayCardLimit', label: 'Per Day Card Limit', type: 'integer' },
  { name: 'perDayEmailLimit', label: 'Per Day Email Limit', type: 'integer' },
  { name: 'perWeekCardLimit', label: 'Per Week Card Limit', type: 'integer' },
  { name: 'perWeekEmailLimit', label: 'Per Week Email Limit', type: 'integer' },
  { name: 'perMonthCardLimit', label: 'Per Month Card Limit', type: 'integer' },
  { name: 'perMonthEmailLimit', label: 'Per Month Email Limit', type: 'integer' },
  { name: 'dailyCardDeclineLimit', label: 'Daily Card Decline Limit', type: 'integer' },
  { name: 'dailyEmailDeclineLimit', label: 'Daily Email Decline Limit', type: 'integer' },
  { name: 'descriptor', label: 'Descriptor', type: 'text', required: false },
];

export function LimitsSection<T extends FieldValues = FieldValues>({
  control,
  submitting = false,
}: Pick<FormSectionsProps<T>, 'control' | 'submitting'>) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Limits</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {LIMIT_FIELDS.map((fieldConfig) => (
          <FormField
            key={fieldConfig.name}
            control={control}
            name={fieldConfig.name as any}
            render={({ field }) => {
              // For integer fields, show empty string instead of 0 when value is 0 (for better UX)
              const displayValue = fieldConfig.type === 'integer' 
                ? (field.value === 0 || field.value === '' || field.value === null || field.value === undefined ? '' : String(field.value))
                : (field.value || '');

              const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const inputValue = e.target.value;
                
                if (fieldConfig.type === 'integer') {
                  // Handle empty input
                  if (inputValue === '' || inputValue === null || inputValue === undefined) {
                    field.onChange(0);
                    return;
                  }
                  
                  // Remove leading zeros and parse as integer
                  // Keep the raw value if it's just "0" or starts with "0" followed by non-digits
                  let cleanedValue = inputValue.trim();
                  
                  // If it's a valid number string with leading zeros (like "023"), remove them
                  if (/^0+[0-9]+$/.test(cleanedValue)) {
                    cleanedValue = cleanedValue.replace(/^0+/, '');
                  }
                  
                  // Convert to number
                  const numValue = cleanedValue === '' ? 0 : Number(cleanedValue);
                  
                  // Update field if valid number
                  if (!isNaN(numValue)) {
                    field.onChange(numValue);
                  }
                } else if (fieldConfig.type === 'number') {
                  // For decimal numbers, allow the string value
                  field.onChange(inputValue);
                } else {
                  // For text fields
                  field.onChange(inputValue);
                }
              };

              const handleBlur = () => {
                // On blur, if integer field is empty, ensure it's set to 0 internally
                if (fieldConfig.type === 'integer') {
                  if (field.value === '' || field.value === null || field.value === undefined) {
                    field.onChange(0);
                  }
                }
                field.onBlur();
              };

              return (
                <FormItem>
                  <FormLabel>
                    {fieldConfig.label}
                    {fieldConfig.required !== false && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type={fieldConfig.type === 'integer' ? 'number' : fieldConfig.type}
                      step={fieldConfig.step}
                      placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
                      value={displayValue}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function CountriesCardTypesSection<T extends FieldValues = FieldValues>({
  control,
  countries,
  submitting = false,
}: Pick<FormSectionsProps<T>, 'control' | 'countries' | 'submitting'>) {
  const countryList = countries && countries.length > 0 ? countries : COUNTRIES;
  const countryOptions = countryList.map((c) => ({
    value: c.code,
    label: `${c.name} (${c.code})`,
  }));

  const cardTypeOptions = CARD_TYPES.map((type) => ({
    value: type,
    label: type,
  }));

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Countries & Card Types</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MultiSelectField
          control={control}
          name={"allowedCountries" as any}
          label="Accepted Countries"
          options={countryOptions}
          placeholder="Select countries"
          disabled={submitting}
          variant="secondary"
        />
        <MultiSelectField
          control={control}
          name={"blockedCountries" as any}
          label="Blocked Countries"
          options={countryOptions}
          placeholder="Select blocked countries"
          disabled={submitting}
          variant="destructive"
        />
        <MultiSelectField
          control={control}
          name={"acceptedCardTypes" as any}
          label="Accepted Card Type"
          options={cardTypeOptions}
          placeholder="Select accepted card types..."
          disabled={submitting}
          variant="outline"
        />
      </div>
    </div>
  );
}

export function ConfigSection<T extends FieldValues = FieldValues>({
  control,
  configFields,
  appendConfig,
  removeConfig,
  submitting = false,
  disableFieldName = false,
}: Pick<FormSectionsProps<T>, 'control' | 'configFields' | 'appendConfig' | 'removeConfig' | 'submitting' | 'disableFieldName'>) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Config</h3>
      <div className="space-y-4">
        <div className="space-y-3">
          {configFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3">
              <FormField
                control={control}
                name={`config.${index}.fieldName` as any}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="sr-only">Field Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Field Name"
                        {...field}
                        disabled={submitting || disableFieldName}
                        readOnly={disableFieldName}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`config.${index}.fieldValue` as any}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="sr-only">Field Value</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Field Value"
                        type={
                          field.value?.includes('password') || field.value?.includes('secret')
                            ? 'password'
                            : 'text'
                        }
                        {...field}
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {configFields.length > 1 && !disableFieldName && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-0 shrink-0"
                  onClick={() => removeConfig(index)}
                  disabled={submitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {!disableFieldName && (
          <Button
            type="button"
            variant="outline"
            onClick={appendConfig}
            disabled={submitting}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        )}
      </div>
    </div>
  );
}

