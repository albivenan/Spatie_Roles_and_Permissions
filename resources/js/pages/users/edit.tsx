import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    roles?: {
        id: number;
        name: string;
    }[];
};

type Role = {
    id: number;
    name: string;
    permissions: {
        id: number;
        name: string;
    }[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit User',
        href: '/users',
    },
];

type Props = {
    user: User;
    roles: Role[];
};

export default function EditUser({ user, roles }: Props) {
    const { data, setData, errors, put, processing } = useForm<{
        name: string;
        email: string;
        password: string;
        roles: number[];
    }>({
        name: user.name || '',
        email: user.email || '',
        password: '',
        roles: user.roles?.map(role => role.id) || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };

    const handleCheckboxChange = (roleId: number, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleId]);
        } else {
            setData('roles', data.roles.filter(id => id !== roleId));
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">Edit User</h2>
                                <Link 
                                    href={route('users.index')}
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
                                        placeholder="Enter user name"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email" 
                                        required 
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-lg border ${
                                            errors.email ? 'border-red-500' : 'border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out`}
                                        placeholder="Enter email address"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input 
                                        type="password" 
                                        id="password" 
                                        name="password" 
                                        required 
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-lg border ${
                                            errors.password ? 'border-red-500' : 'border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out`}
                                        placeholder="Enter password"
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label>Roles:</label>
                                    <div className="space-y-2">
                                        {roles && roles.length > 0 ? (
                                            roles.map((role) => (
                                                <div key={role.id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`role-${role.id}`}
                                                        name="roles[]"
                                                        value={role.id}
                                                        checked={data.roles.includes(role.id)}
                                                        onChange={(e) =>
                                                            handleCheckboxChange(role.id, e.target.checked)
                                                        }
                                                        className="form-checkbox h-4 w-4 text-indigo-600"
                                                    />
                                                    <label htmlFor={`role-${role.id}`} className="ml-2 text-sm text-gray-700">
                                                        {role.name}
                                                    </label>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500">No roles available</p>
                                        )}
                                    </div>
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
                                                Update User
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
