/**
 * Password Field Component
 * 
 * Reusable form field component for password input with visibility toggle
 */

import { useState } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PasswordFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name?: FieldPath<TFieldValues>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Password Field Component with visibility toggle
 */
export function PasswordField<TFieldValues extends FieldValues>({
  control,
  name = 'password' as FieldPath<TFieldValues>,
  label = 'Password *',
  placeholder = 'Enter password',
  disabled = false,
}: PasswordFieldProps<TFieldValues>) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={passwordVisible ? 'text' : 'password'}
                placeholder={placeholder}
                {...field}
                disabled={disabled}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setPasswordVisible(!passwordVisible)}
                disabled={disabled}
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              >
                {passwordVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

