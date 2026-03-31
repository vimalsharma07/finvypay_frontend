'use client';

import { Fragment, useEffect, useState, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getRoleById,
  updateRole,
  UpdateRolePayload,
  Role,
} from '@/lib/services/admin/roles';
import { getAllPermissionsForAssignment, Permission } from '@/lib/services/admin/permissions';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

// Form schema
const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  type: z.string().min(1, 'Role type is required'),
});

type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;

// Permission group structure
interface PermissionGroup {
  module: string;
  subModule: string;
  permissions: Permission[];
}

export function EditRoleContent() {
  const router = useRouter();
  const params = useParams();
  const roleId = params?.id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  
  // Store original role type and permission selections for restoration
  const [originalRoleType, setOriginalRoleType] = useState<string | null>(null);
  const [originalPermissionIds, setOriginalPermissionIds] = useState<Set<number>>(new Set());
  const [permissionSelectionsByType, setPermissionSelectionsByType] = useState<Record<string, Set<number>>>({});
  
  // Use ref to track previous role type to avoid unnecessary effect runs
  const previousRoleTypeRef = useRef<string | null>(null);

  const form = useForm<UpdateRoleFormData>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      name: '',
      type: 'ADMIN',
    },
  });

  // Fetch role and permissions on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!roleId) {
        toast.error('Role ID is missing');
        router.push('/admin/roles-permissions/roles');
        return;
      }

      setLoading(true);
      try {
        const [roleResponse, permissionsResponse] = await Promise.all([
          getRoleById(roleId),
          getAllPermissionsForAssignment(),
        ]);

        handleApiResponse(permissionsResponse, {
          onSuccess: (data) => {
            if (data && data.success && Array.isArray(data.data)) {
              setPermissions(data.data);
            } else {
              setPermissions([]);
            }
          },
          onError: () => {
            setPermissions([]);
          },
        });

        handleApiResponse(roleResponse, {
          onSuccess: (roleData) => {
            if (roleData) {
              setRole(roleData);
              
              setOriginalRoleType(roleData.type);
              
              form.reset({
                name: roleData.name,
                type: roleData.type,
              });

              const permissionIds = new Set<number>();
              if (roleData.rolePermissions && Array.isArray(roleData.rolePermissions)) {
                roleData.rolePermissions.forEach((rp: any) => {
                  if (rp.permissionId) {
                    permissionIds.add(Number(rp.permissionId));
                  }
                });
              }
              
              setOriginalPermissionIds(new Set(permissionIds));
              
              setPermissionSelectionsByType({
                [roleData.type]: new Set(permissionIds),
              });
              
              setSelectedPermissionIds(permissionIds);
              
              previousRoleTypeRef.current = roleData.type;
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load role');
            router.push('/admin/roles-permissions/roles');
          },
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('An error occurred while loading data');
        router.push('/admin/roles-permissions/roles');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roleId, router, form]);

  // Get role type from form
  const roleType = form.watch('type');

  // Group permissions by module and subModule, filtered by role type
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionGroup[]> = {};

    const filteredPermissions = permissions.filter((p) => {
      if (!roleType) return true;
      return p.type === roleType;
    });

    filteredPermissions.forEach((permission) => {
      const module = permission.module || 'Other';
      const subModule = permission.subModule || 'General';

      if (!groups[module]) {
        groups[module] = [];
      }

      let subModuleGroup = groups[module].find((g) => g.subModule === subModule);
      if (!subModuleGroup) {
        subModuleGroup = {
          module,
          subModule,
          permissions: [],
        };
        groups[module].push(subModuleGroup);
      }

      subModuleGroup.permissions.push(permission);
    });

    Object.keys(groups).forEach((module) => {
      groups[module].forEach((group) => {
        group.permissions.sort((a, b) => a.name.localeCompare(b.name));
      });
      groups[module].sort((a, b) => a.subModule.localeCompare(b.subModule));
    });

    return groups;
  }, [permissions, roleType]);

  // Get unique modules for tabs
  const modules = useMemo(() => {
    return Object.keys(groupedPermissions).sort();
  }, [groupedPermissions]);

  // Set initial active tab when modules are available
  useEffect(() => {
    if (modules.length > 0 && !activeTab) {
      setActiveTab(modules[0]);
    }
  }, [modules, activeTab]);

  // Handle role type changes - preserve selections per role type
  useEffect(() => {
    if (!roleType || !originalRoleType || permissions.length === 0) {
      return;
    }

    if (previousRoleTypeRef.current === roleType) {
      return;
    }

    previousRoleTypeRef.current = roleType;

    const newModules = Object.keys(groupedPermissions);
    if (newModules.length > 0 && !newModules.includes(activeTab)) {
      setActiveTab(newModules[0]);
    }

    const savedSelections = permissionSelectionsByType[roleType];
    
    if (savedSelections && savedSelections.size > 0) {
      const validSelections = new Set<number>();
      savedSelections.forEach((permissionId) => {
        const permission = permissions.find((p) => Number(p.id) === permissionId);
        if (permission && permission.type === roleType) {
          validSelections.add(permissionId);
        }
      });
      setSelectedPermissionIds(validSelections);
    } else {
      setSelectedPermissionIds((prev) => {
        const newSet = new Set<number>();
        prev.forEach((permissionId) => {
          const permission = permissions.find((p) => Number(p.id) === permissionId);
          if (permission && permission.type === roleType) {
            newSet.add(permissionId);
          }
        });
        
        setPermissionSelectionsByType((prev) => ({
          ...prev,
          [roleType]: new Set(newSet),
        }));
        
        return newSet;
      });
    }
  }, [roleType, originalRoleType, permissions, groupedPermissions, activeTab, permissionSelectionsByType]);

  // Get permissions for active tab
  const activeTabPermissions = groupedPermissions[activeTab] || [];

  // Toggle permission selection and save to current role type
  const togglePermission = (permissionId: number) => {
    setSelectedPermissionIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      
      if (roleType) {
        setPermissionSelectionsByType((prev) => ({
          ...prev,
          [roleType]: new Set(newSet),
        }));
      }
      
      return newSet;
    });
  };

  // Select all permissions in a sub-category
  const toggleSelectAllSubCategory = (subCategoryPermissions: Permission[]) => {
    const allSelected = subCategoryPermissions.every((p) =>
      selectedPermissionIds.has(Number(p.id))
    );

    setSelectedPermissionIds((prev) => {
      const newSet = new Set(prev);
      subCategoryPermissions.forEach((p) => {
        const permissionId = Number(p.id);
        if (allSelected) {
          newSet.delete(permissionId);
        } else {
          newSet.add(permissionId);
        }
      });
      
      if (roleType) {
        setPermissionSelectionsByType((prev) => ({
          ...prev,
          [roleType]: new Set(newSet),
        }));
      }
      
      return newSet;
    });
  };

  // Select all permissions in active tab
  const toggleSelectAllCategory = () => {
    const allPermissionsInTab = activeTabPermissions.flatMap(
      (group) => group.permissions
    );
    const allSelected = allPermissionsInTab.every((p) =>
      selectedPermissionIds.has(Number(p.id))
    );

    setSelectedPermissionIds((prev) => {
      const newSet = new Set(prev);
      allPermissionsInTab.forEach((p) => {
        const permissionId = Number(p.id);
        if (allSelected) {
          newSet.delete(permissionId);
        } else {
          newSet.add(permissionId);
        }
      });
      
      if (roleType) {
        setPermissionSelectionsByType((prev) => ({
          ...prev,
          [roleType]: new Set(newSet),
        }));
      }
      
      return newSet;
    });
  };

  const onSubmit = async (data: UpdateRoleFormData) => {
    if (!roleId) {
      toast.error('Role ID is missing');
      return;
    }

    setSubmitting(true);
    try {
      const permissionIds = Array.from(selectedPermissionIds).map((id) => Number(id));

      const payload: UpdateRolePayload = {
        name: data.name,
        type: data.type,
        permissionIds: permissionIds,
      };

      const response = await updateRole(roleId, payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Role updated successfully!');
          router.push('/admin/roles-permissions/roles');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update role');
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
      console.error('❌ Error updating role:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Loading role data...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Role not found</p>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/roles-permissions/roles')}
              className="mt-4"
            >
              Back to Roles
            </Button>
          </div>
        </div>
    );
  }

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle>Role Information</CardTitle>
      </CardHeader>
      <CardContent>
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

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading permissions...
              </div>
            ) : modules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {roleType
                  ? `No permissions available for role type: ${roleType}`
                  : 'Please select a role type to view permissions'}
              </div>
            ) : (
              <div className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <ScrollArea className="w-full">
                    <TabsList variant="line" className="w-full justify-start min-w-max">
                      {modules.map((module) => (
                        <TabsTrigger key={module} value={module}>
                          {module}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </ScrollArea>

                  {modules.map((module) => (
                    <TabsContent key={module} value={module} className="mt-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{module}</h3>
                          {activeTabPermissions.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Checkbox
                                checked={
                                  activeTabPermissions
                                    .flatMap((g) => g.permissions)
                                    .every((p) => selectedPermissionIds.has(Number(p.id)))
                                }
                                onCheckedChange={toggleSelectAllCategory}
                                id={`select-all-${module}`}
                              />
                              <label
                                htmlFor={`select-all-${module}`}
                                className="text-sm cursor-pointer"
                              >
                                Select All
                              </label>
                            </div>
                          )}
                        </div>

                        {activeTabPermissions.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No permissions available for this module
                          </div>
                        ) : (
                          activeTabPermissions.map((group, groupIndex) => (
                            <div key={groupIndex} className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-base font-medium">
                                  {group.subModule}
                                </h4>
                                {group.permissions.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Checkbox
                                      checked={group.permissions.every((p) =>
                                        selectedPermissionIds.has(Number(p.id))
                                      )}
                                      onCheckedChange={() =>
                                        toggleSelectAllSubCategory(group.permissions)
                                      }
                                      id={`select-all-${module}-${group.subModule}`}
                                    />
                                    <label
                                      htmlFor={`select-all-${module}-${group.subModule}`}
                                      className="text-sm cursor-pointer"
                                    >
                                      Select All
                                    </label>
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {group.permissions.map((permission) => (
                                  <div
                                    key={permission.id}
                                    className="flex items-center gap-1"
                                  >
                                    <Checkbox
                                      checked={selectedPermissionIds.has(Number(permission.id))}
                                      onCheckedChange={() =>
                                        togglePermission(Number(permission.id))
                                      }
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
            )}

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/roles-permissions/roles')}
                disabled={submitting}
              >
                <X className="h-4 w-4 me-1" />
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                <Save className="h-4 w-4 me-1" />
                {submitting ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

