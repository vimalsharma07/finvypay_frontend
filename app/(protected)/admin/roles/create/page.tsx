'use client';

import { Fragment, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  Form,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createRole, CreateRolePayload } from '@/lib/services/roles-api';
import { getPermissions, Permission } from '@/lib/services/permissions-api';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

// Form schema
const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  type: z.string().min(1, 'Role type is required'),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

// Permission categories based on the UI
const PERMISSION_CATEGORIES = [
  'Authentication',
  'Dashboard',
  'User Management',
  'Magic Link',
  'Transactions',
  'Approval',
  'Providers',
  'Risk Management',
  'Template',
  'Merchant Payment',
  'Master',
];

// Mock permissions data structure - replace with actual API data
interface PermissionGroup {
  category: string;
  subCategory?: string;
  permissions: Permission[];
}

export default function CreateRolePage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string | number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('User Management');

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: '',
      type: 'ADMIN',
    },
  });

  // Fetch permissions on mount
  useEffect(() => {
    const fetchPermissions = async () => {
      setLoading(true);
      try {
        const response = await getPermissions();
        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data && data.success && Array.isArray(data.data)) {
              setPermissions(data.data);
            } else {
              // Fallback to empty array if API fails
              setPermissions([]);
            }
          },
          onError: () => {
            // Use empty array if API fails - permissions will be added later
            setPermissions([]);
          },
        });
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  // Group permissions by category
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionGroup[]> = {};

    PERMISSION_CATEGORIES.forEach((category) => {
      groups[category] = [];
      
      // Filter permissions for this category (mock - you'll need to adjust based on your API)
      const categoryPermissions = permissions.filter(
        (p) => p.category === category || !p.category
      );

      if (categoryPermissions.length > 0) {
        // Group by sub-category if available
        const subGroups: Record<string, Permission[]> = {};
        categoryPermissions.forEach((perm) => {
          const subCat = perm.subCategory || 'General';
          if (!subGroups[subCat]) {
            subGroups[subCat] = [];
          }
          subGroups[subCat].push(perm);
        });

        Object.entries(subGroups).forEach(([subCat, perms]) => {
          groups[category].push({
            category,
            subCategory: subCat !== 'General' ? subCat : undefined,
            permissions: perms,
          });
        });
      } else {
        // Add empty group for categories without permissions
        groups[category].push({
          category,
          permissions: [],
        });
      }
    });

    return groups;
  }, [permissions]);

  // Get permissions for active tab
  const activeTabPermissions = groupedPermissions[activeTab] || [];

  // Toggle permission selection
  const togglePermission = (permissionId: string | number) => {
    setSelectedPermissionIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  // Select all permissions in a sub-category
  const toggleSelectAllSubCategory = (subCategoryPermissions: Permission[]) => {
    const allSelected = subCategoryPermissions.every((p) =>
      selectedPermissionIds.has(p.id)
    );

    setSelectedPermissionIds((prev) => {
      const newSet = new Set(prev);
      subCategoryPermissions.forEach((p) => {
        if (allSelected) {
          newSet.delete(p.id);
        } else {
          newSet.add(p.id);
        }
      });
      return newSet;
    });
  };

  // Select all permissions in active tab
  const toggleSelectAllCategory = () => {
    const allPermissionsInTab = activeTabPermissions.flatMap(
      (group) => group.permissions
    );
    const allSelected = allPermissionsInTab.every((p) =>
      selectedPermissionIds.has(p.id)
    );

    setSelectedPermissionIds((prev) => {
      const newSet = new Set(prev);
      allPermissionsInTab.forEach((p) => {
        if (allSelected) {
          newSet.delete(p.id);
        } else {
          newSet.add(p.id);
        }
      });
      return newSet;
    });
  };

  const onSubmit = async (data: CreateRoleFormData) => {
    try {
      const payload: CreateRolePayload = {
        name: data.name,
        type: data.type,
        permissionIds: Array.from(selectedPermissionIds),
      };

      const response = await createRole(payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Role created successfully!');
          router.push('/admin/roles');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create role');
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
          toast.error(Array.isArray(messages) ? messages.join(', ') : messages);
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      console.error('❌ Error creating role:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Add Role"
            description="Create a new role with specific permissions"
          />
          <div className="flex items-center">
            <Link
              href="/admin/roles"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </div>
        </Toolbar>
      </Container>

      <Container>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Admin Permissions</h2>
            <p className="text-sm text-muted-foreground">
              You can update permissions for this Admin, please select the actions allowed.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Role Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter role name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Role Type <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                          <SelectItem value="MERCHANT">MERCHANT</SelectItem>
                          <SelectItem value="AFFILIATE">AFFILIATE</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Permission Tabs */}
              <div className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <ScrollArea className="w-full">
                    <TabsList variant="line" className="w-full justify-start min-w-max">
                      {PERMISSION_CATEGORIES.map((category) => (
                        <TabsTrigger key={category} value={category}>
                          {category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </ScrollArea>

                  {PERMISSION_CATEGORIES.map((category) => (
                    <TabsContent key={category} value={category} className="mt-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{category}</h3>
                          {activeTabPermissions.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={activeTabPermissions
                                  .flatMap((g) => g.permissions)
                                  .every((p) => selectedPermissionIds.has(p.id))}
                                onCheckedChange={toggleSelectAllCategory}
                                id={`select-all-${category}`}
                              />
                              <label
                                htmlFor={`select-all-${category}`}
                                className="text-sm cursor-pointer"
                              >
                                Select All
                              </label>
                            </div>
                          )}
                        </div>

                        {activeTabPermissions.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No permissions available for this category
                          </div>
                        ) : (
                          activeTabPermissions.map((group, groupIndex) => (
                            <div key={groupIndex} className="space-y-4">
                              {group.subCategory && (
                                <div className="flex items-center justify-between">
                                  <h4 className="text-base font-medium">
                                    {group.subCategory}
                                  </h4>
                                  {group.permissions.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        checked={group.permissions.every((p) =>
                                          selectedPermissionIds.has(p.id)
                                        )}
                                        onCheckedChange={() =>
                                          toggleSelectAllSubCategory(group.permissions)
                                        }
                                        id={`select-all-${group.subCategory}`}
                                      />
                                      <label
                                        htmlFor={`select-all-${group.subCategory}`}
                                        className="text-sm cursor-pointer"
                                      >
                                        Select All
                                      </label>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {group.permissions.map((permission) => (
                                  <div
                                    key={permission.id}
                                    className="flex items-center gap-2"
                                  >
                                    <Checkbox
                                      checked={selectedPermissionIds.has(permission.id)}
                                      onCheckedChange={() => togglePermission(permission.id)}
                                      id={`permission-${permission.id}`}
                                    />
                                    <label
                                      htmlFor={`permission-${permission.id}`}
                                      className="text-sm cursor-pointer flex-1"
                                    >
                                      {permission.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/roles')}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Add Role
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Container>
    </Fragment>
  );
}
