import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
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
        title: 'Users',
        href: '/users',
    },
];

type Props = {
    roles: Role[];
};

interface RoleGroup {
    name: string;
    roles: Role[];
    isOpen: boolean;
}

export default function CreateUser({ roles }: Props) {
    const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([]);
    
    const { data, setData, errors, post, processing } = useForm<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        roles: number[];
    }>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [],
    });

    // Group roles by their type (admin, manager, etc.)
    useEffect(() => {
        const groups: { [key: string]: Role[] } = {};
        
        roles.forEach(role => {
            const groupName = role.name.split('_')[0];
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(role);
        });
        
        // Convert to array and sort
        const groupArray = Object.entries(groups).map(([name, roles]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
            roles: roles.sort((a, b) => a.name.localeCompare(b.name)),
            isOpen: true
        }));
        
        setRoleGroups(groupArray);
    }, [roles]);
    
    const toggleGroup = (groupName: string) => {
        setRoleGroups(groups => 
            groups.map(group => 
                group.name === groupName 
                    ? { ...group, isOpen: !group.isOpen } 
                    : group
            )
        );
    };

    const handleCheckboxChange = (roleId: number, checked: boolean) => {
        setData('roles', checked 
            ? [...data.roles, roleId]
            : data.roles.filter(id => id !== roleId)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => {
                setData('name', '');
                setData('email', '');
                setData('password', '');
                setData('password_confirmation', '');
                setData('roles', []);
            },
            preserveScroll: true
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">Penambahan User</h2>
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Lengkap
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="mt-1">
                                            <input 
                                                type="text" 
                                                id="name" 
                                                name="name" 
                                                required 
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-lg border ${
                                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out`}
                                                placeholder="Masukkan nama lengkap"
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="mt-1">
                                            <input 
                                                type="email" 
                                                id="email" 
                                                name="email" 
                                                required 
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-lg border ${
                                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out`}
                                                placeholder="contoh@email.com"
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Password
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="mt-1">
                                            <input 
                                                type="password" 
                                                id="password" 
                                                name="password" 
                                                required 
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-lg border ${
                                                    errors.password ? 'border-red-500' : 'border-gray-300'
                                                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out`}
                                                placeholder="Minimal 8 karakter"
                                            />
                                            {errors.password && (
                                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                            Konfirmasi Password
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="mt-1">
                                            <input 
                                                type="password" 
                                                id="password_confirmation" 
                                                name="password_confirmation" 
                                                required 
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-lg border ${
                                                    errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                                                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out`}
                                                placeholder="Ketik ulang password"
                                            />
                                            {errors.password_confirmation && (
                                                <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Peran Pengguna
                                            <span className="text-red-500 ml-1">*</span>
                                        </h3>
                                        <div className="text-sm">
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setData('roles', roles.map(r => r.id));
                                                }}
                                                className="text-indigo-600 hover:text-indigo-800 mr-4"
                                            >
                                                Pilih Semua
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setData('roles', [])}
                                                className="text-indigo-600 hover:text-indigo-800"
                                            >
                                                Hapus Pilihan
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {roleGroups.map((group) => (
                                            <div key={group.name} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <div 
                                                    className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
                                                    onClick={() => toggleGroup(group.name)}
                                                >
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-700">
                                                            {group.name}
                                                        </span>
                                                        <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                                            {group.roles.length} peran
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <svg 
                                                            className={`w-5 h-5 text-gray-500 transform transition-transform ${group.isOpen ? 'rotate-180' : ''}`} 
                                                            fill="none" 
                                                            stroke="currentColor" 
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                {group.isOpen && (
                                                    <div className="p-4 space-y-3">
                                                        {group.roles.map((role) => (
                                                            <div key={role.id} className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`role-${role.id}`}
                                                                    name="roles[]"
                                                                    value={role.id}
                                                                    checked={data.roles.includes(role.id)}
                                                                    onChange={(e) => handleCheckboxChange(role.id, e.target.checked)}
                                                                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                                                />
                                                                <label 
                                                                    htmlFor={`role-${role.id}`} 
                                                                    className="ml-3 text-sm text-gray-700 flex items-center"
                                                                >
                                                                    <span className="font-medium">
                                                                        {role.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                    </span>
                                                                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                                        {role.permissions?.length || 0} izin
                                                                    </span>
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {errors.roles && (
                                            <p className="mt-2 text-sm text-red-600">{errors.roles}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-end space-x-3">
                                        <Link
                                            href={route('users.index')}
                                            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Batal
                                        </Link>
                                        <button 
                                            type="submit" 
                                            disabled={processing}
                                            className={`inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white ${
                                                processing
                                                    ? 'bg-indigo-400 cursor-not-allowed'
                                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                            }`}
                                        >
                                            {processing ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                    </svg>
                                                    Simpan Pengguna
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
