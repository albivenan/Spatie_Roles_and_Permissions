import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

interface Role {
    id: number;
    name: string;
    permissions: string[]; // nama permissions, bukan ID
}

interface Permission {
    id: number;
    name: string;
}

type Props = {
    role: Role;
    permissions: Permission[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit Role',
        href: '/roles',
    },
];

export default function EditRole({ role, permissions }: Props) {
    const { data, setData, errors, put, processing } = useForm({
        name: role.name ?? '',
        permissions: role.permissions ?? [],
    });

    const handleCheckboxChange = (permissionName: string, isChecked: boolean) => {
        if (isChecked) {
            setData('permissions', [...data.permissions, permissionName]);
        } else {
            setData(
                'permissions',
                data.permissions.filter((p) => p !== permissionName)
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('roles.update', role.id), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Role" />
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">Edit Role</h2>
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
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        name="name" 
                                        required 
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-lg border ${
                                            errors.name ? 'border-red-500' : 'border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out`}
                                        placeholder="Enter role name"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                                    <div className="space-y-2">
                                        {permissions.map((permission) => (
                                            <div key={permission.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`permission-${permission.id}`}
                                                    name="permissions[]"
                                                    value={permission.name}
                                                    checked={data.permissions.includes(permission.name)}
                                                    onChange={(e) =>
                                                        handleCheckboxChange(permission.name, e.target.checked)
                                                    }
                                                    className="form-checkbox h-4 w-4 text-indigo-600"
                                                />
                                                <label htmlFor={`permission-${permission.id}`} className="ml-2 text-sm text-gray-700">
                                                    {permission.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.permissions && (
                                        <p className="mt-1 text-sm text-red-600">{errors.permissions}</p>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`px-4 py-2 text-sm font-medium ${
                                            processing
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-indigo-600 hover:bg-indigo-700'
                                        } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out`}
                                    >
                                        {processing ? 'Updating...' : 'Update'}
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
