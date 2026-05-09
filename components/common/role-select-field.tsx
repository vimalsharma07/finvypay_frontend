/**
 * Role Select Field Component
 * 
 * Reusable form field component for selecting roles with proper type safety
 */

import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Role } from '@/lib/services/admin/roles';

interface RoleSelectFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  disabled?: boolean;
  roles: Role[];
  loadingRoles: boolean;
  onRoleChange?: (roleId: string, roleName: string) => void;
  name?: FieldPath<TFieldValues>;
}

/**
 * Role Select Field Component
 * Handles role selection with proper hydration and type safety
 */
export function RoleSelectField<TFieldValues extends FieldValues>({
  control,
  disabled = false,
  roles,
  loadingRoles,
  onRoleChange,
  name = 'roleId' as FieldPath<TFieldValues>,
}: RoleSelectFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Role *</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              const selectedRole = roles.find(
                (role) => role.id.toString() === value
              );
              if (selectedRole && onRoleChange) {
                onRoleChange(value, selectedRole.name);
              }
            }}
            value={field.value || ''}
            disabled={disabled || loadingRoles}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {loadingRoles ? (
                <SelectItem value="loading" disabled>
                  Loading roles...
                </SelectItem>
              ) : roles.length > 0 ? (
                roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-roles" disabled>
                  No roles available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

