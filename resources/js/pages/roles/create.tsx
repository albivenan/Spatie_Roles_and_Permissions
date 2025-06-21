import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface Role {
    id: number;
    name: string;
    is_fixed: boolean;
    permissions: string[];
};

interface Permission {
    id: number;
    name: string;
    group: string;
};

interface PermissionGroup {
    name: string;
    permissions: Permission[];
    isOpen: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
];

type Props = {
    roles: Role[];
    permissions: Permission[];
};

export default function CreateRole({ roles, permissions: allPermissions }: Props) {
    const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
    
    const { data, setData, errors, processing } = useForm({
        name: '',
        permissions: [] as string[],
        is_fixed: false,
    });
    
    // Group permissions by their group name
    useEffect(() => {
        const groups: { [key: string]: Permission[] } = {};
        
        allPermissions.forEach(permission => {
            const groupName = permission.name.split('.')[0];
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(permission);
        });
        
        // Convert to array and sort
        const groupArray = Object.entries(groups).map(([name, permissions]) => ({
            name,
            permissions: permissions.sort((a, b) => a.name.localeCompare(b.name)),
            isOpen: false
        }));
        
        // Sort groups by name
        groupArray.sort((a, b) => a.name.localeCompare(b.name));
        
        setPermissionGroups(groupArray);
    }, [allPermissions]);
    
    const toggleGroup = (groupName: string) => {
        setPermissionGroups(groups => 
            groups.map(group => 
                group.name === groupName 
                    ? { ...group, isOpen: !group.isOpen } 
                    : group
            )
        );
    };
    
    const toggleAllInGroup = (groupName: string, permissions: Permission[]) => {
        const groupPermissions = permissions.map(p => p.name);
        const allSelected = groupPermissions.every(perm => 
            data.permissions.includes(perm as never)
        );
        
        if (allSelected) {
            // Remove all permissions from this group
            setData('permissions', 
                data.permissions.filter(perm => !groupPermissions.includes(perm as string))
            );
        } else {
            // Add all permissions from this group
            const newPermissions = [...new Set([...data.permissions as string[], ...groupPermissions])];
            setData('permissions', newPermissions);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Dapatkan ID permission yang dipilih
        const selectedPermissionIds = allPermissions
            .filter(permission => data.permissions.includes(permission.name))
            .map(permission => permission.id);
        
        // Kirim data dengan method POST biasa
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('_method', 'post');
        
        // Tambahkan permission IDs
        selectedPermissionIds.forEach(id => {
            formData.append('permissions[]', id.toString());
        });
        
        // Gunakan router.post dari Inertia
        router.post(route('roles.store'), {
            _method: 'post',
            name: data.name,
            permissions: selectedPermissionIds,
        }, {
            onSuccess: () => {
                setData('name', '');
                setData('permissions', []);
            },
            onError: (err) => {
                console.error('Error creating role:', err);
            },
            preserveScroll: true,
            preserveState: false
        });
    };

    // const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if(e.target.checked) {
    //         setData('permissions', [...data.permissions, e.target.value]);
    //     } else {
    //         setData('permissions', data.permissions.filter((permission) => permission !== e.target.value));
    //     }
    // };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">Create Role</h2>
                                <Link 
                                    href={route('roles.index')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
                                >
                                    <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back
                                </Link>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Role Name
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input 
                                            type="text" 
                                            id="name" 
                                            name="name" 
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={`block w-full px-4 py-3 rounded-md border ${
                                                errors.name ? 'border-red-500' : 'border-gray-300'
                                            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out`}
                                            placeholder="e.g., content_manager"
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">
                                        Use lowercase with underscores (e.g., content_manager, report_viewer)
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <label htmlFor="permissions" className="block text-sm font-medium text-gray-700">
                                            Permissions
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="text-sm">
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    const allPerms = allPermissions.map(p => p.name);
                                                    setData('permissions', allPerms);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-2"
                                            >
                                                Select All
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setData('permissions', [])}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {permissionGroups.map((group) => (
                                            <div key={group.name} className="border rounded-lg overflow-hidden">
                                                <div 
                                                    className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
                                                    onClick={() => toggleGroup(group.name)}
                                                >
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-900">
                                                            {group.name.split('_').map(word => 
                                                                word.charAt(0).toUpperCase() + word.slice(1)
                                                            ).join(' ')}
                                                        </span>
                                                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800">
                                                            {group.permissions.length} permissions
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-indigo-600 mr-2">
                                                            {group.permissions.every(p => 
                                                                (data.permissions as string[]).includes(p.name)
                                                            ) ? 'All' : 
                                                            group.permissions.some(p => 
                                                                (data.permissions as string[]).includes(p.name)
                                                            ) ? 'Some' : 'None'}
                                                        </span>
                                                        <svg 
                                                            className={`w-5 h-5 text-gray-500 transform transition-transform ${group.isOpen ? 'rotate-180' : ''}`} 
                                                            fill="none" 
                                                            viewBox="0 0 24 24" 
                                                            stroke="currentColor"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                
                                                {group.isOpen && (
                                                    <div className="p-3 bg-white border-t">
                                                        <div className="flex items-center mb-2">
                                                            <input
                                                                type="checkbox"
                                                                id={`group-${group.name}`}
                                                                checked={group.permissions.every(p => 
                                                                    (data.permissions as string[]).includes(p.name)
                                                                )}
                                                                onChange={() => toggleAllInGroup(group.name, group.permissions)}
                                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            <label 
                                                                htmlFor={`group-${group.name}`}
                                                                className="ml-2 text-sm font-medium text-gray-700"
                                                            >
                                                                Select All
                                                            </label>
                                                        </div>
                                                        
                                                        <div className="space-y-2 pl-6">
                                                            {group.permissions.map((permission) => (
                                                                <div key={permission.id} className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`permission-${permission.id}`}
                                                                        name="permissions[]"
                                                                        value={permission.name}
                                                                        checked={data.permissions.includes(permission.name)}
                                                                        onChange={(e) => {
                                                                            const newPermissions = [...data.permissions];
                                                                            if (e.target.checked) {
                                                                                newPermissions.push(permission.name);
                                                                            } else {
                                                                                const index = newPermissions.indexOf(permission.name);
                                                                                if (index > -1) {
                                                                                    newPermissions.splice(index, 1);
                                                                                }
                                                                            }
                                                                            setData('permissions', newPermissions);
                                                                        }}
                                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                    />
                                                                    <label
                                                                        htmlFor={`permission-${permission.id}`}
                                                                        className="ml-2 text-sm text-gray-700"
                                                                    >
                                                                        {permission.name.split('.').slice(1).join('.') || permission.name}
                                                                        <span className="text-xs text-gray-500 ml-1">
                                                                            ({permission.name})
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {errors.permissions && (
                                        <p className="mt-1 text-sm text-red-600">{errors.permissions}</p>
                                    )}
                                </div>

                                <div>
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className={`w-full ${
                                            processing
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-indigo-600 hover:bg-indigo-700'
                                        } text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-200 ease-in-out flex items-center justify-center`}
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Create Role
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
