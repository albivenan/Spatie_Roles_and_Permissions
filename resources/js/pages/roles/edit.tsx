import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import React, { useState, useEffect, useCallback } from 'react';
import { Shield, ArrowLeft, Check, X, Save, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
      form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
    }
  }
}

interface Permission {
  id: number;
  name: string;
  group?: string;
}

interface PermissionGroup {
  name: string;
  permissions: Permission[];
  isOpen: boolean;
  allSelected: boolean;
  someSelected: boolean;
}

interface PageProps {
  role: {
    id: number;
    name: string;
    is_fixed: boolean;
    permissions: string[];
  };
  permissions: Permission[];
  can: {
    update: boolean;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Roles', href: '/roles' },
  { title: 'Edit Role', href: '#' },
];

export default function EditRole({ role, permissions: allPermissions, can }: PageProps) {
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const permissionNameToId = Object.fromEntries(allPermissions.map(p => [p.name, p.id]));

  // Define the form data type
  type RoleFormData = {
    name: string;
    permissions: number[];
    is_fixed: boolean;
  };

  // Convert permission names to IDs for the form
  const initialPermissions = role.permissions
    .map(name => permissionNameToId[name])
    .filter(Boolean) as number[];

  const { data, setData, errors, put, processing } = useForm({
    name: role.name,
    permissions: initialPermissions,
    is_fixed: role.is_fixed,
  } as RoleFormData);

  // Function to update group selection states
  const updateGroupSelections = useCallback((permissions: number[], groups: PermissionGroup[]): PermissionGroup[] => {
    return groups.map(group => {
      const permissionIds = group.permissions.map(p => p.id);
      const allSelected = permissionIds.length > 0 && permissionIds.every(id => permissions.includes(id));
      const someSelected = !allSelected && permissionIds.some(id => permissions.includes(id));
      return { ...group, allSelected, someSelected };
    });
  }, []);

  // Function to toggle a single permission
  const togglePermission = useCallback((permissionId: number, groupName: string) => {
    if (role.is_fixed) return;
    
    const currentPermissions = Array.isArray(data.permissions) ? [...data.permissions] : [];
    const newPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(id => id !== permissionId)
      : [...currentPermissions, permissionId];
    
    // Update the form data
    setData('permissions', newPermissions);
    
    // Update the UI state for all groups
    setPermissionGroups(groups => updateGroupSelections(newPermissions, groups));
  }, [data.permissions, role.is_fixed, updateGroupSelections]);

  // Initialize permission groups
  useEffect(() => {
    const groups: Record<string, Permission[]> = {};
    allPermissions.forEach((permission) => {
      const groupName = permission.name.split('.')[0];
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(permission);
    });

    const groupArray = Object.entries(groups).map(([name, permissions]) => ({
      name,
      permissions: [...permissions].sort((a, b) => a.name.localeCompare(b.name)),
      isOpen: false,
      allSelected: false,
      someSelected: false
    }));

    const sortedGroups = groupArray.sort((a, b) => a.name.localeCompare(b.name));
    const updatedGroups = updateGroupSelections(data.permissions || [], sortedGroups);
    
    // Only update if the groups have actually changed
    setPermissionGroups(prevGroups => {
      if (JSON.stringify(prevGroups) !== JSON.stringify(updatedGroups)) {
        return updatedGroups;
      }
      return prevGroups;
    });
  }, [allPermissions, data.permissions, updateGroupSelections]);

  const toggleGroup = (groupName: string) => {
    setPermissionGroups((groups) =>
      groups.map((group) => {
        if (group.name !== groupName) return group;
        const allSelected = group.permissions.every((p) => data.permissions.includes(p.id));
        const someSelected = group.permissions.some((p) => data.permissions.includes(p.id)) && !allSelected;
        return { ...group, isOpen: !group.isOpen, allSelected, someSelected };
      })
    );
  };

  const toggleAllInGroup = useCallback((groupName: string, permissions: {id: number, name: string}[]) => {
    if (role.is_fixed) return;
    
    const currentPermissions = Array.isArray(data.permissions) ? [...data.permissions] : [];
    const permissionIds = permissions.map(p => p.id);
    const allSelected = permissionIds.every(id => currentPermissions.includes(id));
    
    let newPermissions: number[];
    if (allSelected) {
      // Remove all permissions in this group
      newPermissions = currentPermissions.filter(id => !permissionIds.includes(id));
    } else {
      // Add all permissions in this group that aren't already selected
      const permissionSet = new Set(currentPermissions);
      permissionIds.forEach(id => permissionSet.add(id));
      newPermissions = Array.from(permissionSet);
    }
    
    // Update the form data
    setData('permissions', newPermissions);
    
    // Update the UI state for all groups
    setPermissionGroups(groups => updateGroupSelections(newPermissions, groups));
  }, [data.permissions, role.is_fixed, setData, updateGroupSelections]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!can.update || role.is_fixed) return;
    
    setIsSubmitting(true);
    
    // Use Inertia's post with _method=PUT for form submission
    router.post(route('roles.update', role.id), {
      _method: 'PUT',
      name: data.name,
      permissions: Array.isArray(data.permissions) ? data.permissions : []
    }, {
      onSuccess: () => {
        toast.success('Role updated successfully!');
        router.visit(route('roles.index'), {
          only: ['roles'],
          preserveScroll: true,
        });
      },
      onError: (errors) => {
        console.error('Update error:', errors);
        toast.error('Failed to update role. Please try again.');
      },
      onFinish: () => {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Role: ${role.name}`} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 mr-4">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Edit Role</h2>
                  <p className="text-sm text-gray-500">Update role details and permissions</p>
                </div>
              </div>
              <Link
                href={route('roles.index')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Roles
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              <div className="px-6 py-5 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    disabled={role.is_fixed}
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring focus:border-indigo-500 disabled:bg-gray-100"
                    title={role.is_fixed ? 'This role is fixed and cannot be edited.' : undefined}
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                  {role.is_fixed && (
                    <span className="text-xs text-gray-500">This role is fixed and cannot be edited.</span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Permissions</h3>
                  <div className="space-y-4 mt-2">
                    {permissionGroups.map((group) => (
                      <div key={group.name} className="border border-gray-200 rounded">
                        <button
                          type="button"
                          onClick={() => toggleGroup(group.name)}
                          className="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
                        >
                          <span className="capitalize font-medium">{group.name} ({group.permissions.length})</span>
                          {group.isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {group.isOpen && (
                          <div className="px-4 py-2">
                            <div className="mb-2 flex items-center space-x-2">
                              <input
                                type="checkbox"
                                disabled={role.is_fixed}
                                checked={group.allSelected}
                                ref={el => {
                                  if (el) el.indeterminate = group.someSelected;
                                }}
                                onChange={() => toggleAllInGroup(group.name, group.permissions)}
                                title={role.is_fixed ? 'This role is fixed and cannot be edited.' : undefined}
                              />
                              <span className="font-semibold">Select All</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {group.permissions.map((perm) => (
                                <label key={perm.id} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    disabled={role.is_fixed}
                                    checked={Array.isArray(data.permissions) && data.permissions.includes(perm.id)}
                                    onChange={() => togglePermission(perm.id, group.name)}
                                    title={role.is_fixed ? 'This role is fixed and cannot be edited.' : undefined}
                                  />
                                  <span>{perm.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <button
                  type="submit"
                  disabled={processing || isSubmitting || role.is_fixed}
                  className={`inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60 relative`}
                  title={role.is_fixed ? 'This role is fixed and cannot be edited.' : undefined}
                >
                  {(processing || isSubmitting) && (
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  )}
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
