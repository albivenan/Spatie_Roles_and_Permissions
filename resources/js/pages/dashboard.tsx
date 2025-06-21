import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { can } from '@/lib/can';
import { useEffect, useState } from 'react';
import { User, Users, Shield, Lock, UserPlus, ShieldPlus, CheckCircle, XCircle } from 'lucide-react';

interface AuthUser {
    id: number;
    name: string;
    email: string;
    role?: string;
    role_name?: string; // Keeping for backward compatibility
    permissions: string[];
}

interface PageProps extends InertiaPageProps {
    auth: {
        user: AuthUser | null;
    };
    stats: {
        total_users: number;
        total_roles: number;
        total_permissions: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Permission card component
const PermissionCard = ({ title, permissions }: { title: string; permissions: { label: string; permission: string }[] }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <div className="space-y-3">
                {permissions.map((item) => (
                    <div key={item.permission} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{item.label}</span>
                        {can(item.permission) ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Stat card component
const StatCard = ({ icon: Icon, title, value, color }: { 
    icon: React.ElementType; 
    title: string; 
    value: number | string;
    color: string;
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const { auth, stats } = usePage<PageProps>().props;
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Format time
    const formattedTime = currentTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const formattedDate = currentTime.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Selamat Datang, {auth.user?.name || 'Pengguna'}!</h2>
                            <p className="text-gray-600 mt-1">
                                {formattedDate} • {formattedTime}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {auth.user?.role?.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) || auth.user?.role_name || 'Unknown Role'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        icon={Users} 
                        title="Total Pengguna" 
                        value={stats?.total_users || 0} 
                        color="text-blue-600"
                    />
                    <StatCard 
                        icon={Shield} 
                        title="Total Peran" 
                        value={stats?.total_roles || 0} 
                        color="text-green-600"
                    />
                    <StatCard 
                        icon={Lock} 
                        title="Total Izin" 
                        value={stats?.total_permissions || 0} 
                        color="text-purple-600"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {can('users.create') && (
                        <Link 
                            href="/users/create" 
                            className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow duration-200 border border-transparent hover:border-blue-100"
                        >
                            <div className="p-3 bg-blue-50 rounded-full mb-2">
                                <UserPlus className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">Tambah Pengguna</span>
                            <span className="text-xs text-gray-500 mt-1">Buat akun pengguna baru</span>
                        </Link>
                    )}
                    {can('roles.create') && (
                        <Link 
                            href="/roles/create" 
                            className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow duration-200 border border-transparent hover:border-green-100"
                        >
                            <div className="p-3 bg-green-50 rounded-full mb-2">
                                <ShieldPlus className="h-6 w-6 text-green-600" />
                            </div>
                            <span className="font-medium text-gray-900">Buat Peran</span>
                            <span className="text-xs text-gray-500 mt-1">Buat peran dan atur izin</span>
                        </Link>
                    )}
                    {can('users.view') && (
                        <Link 
                            href="/users" 
                            className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow duration-200 border border-transparent hover:border-purple-100"
                        >
                            <div className="p-3 bg-purple-50 rounded-full mb-2">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <span className="font-medium text-gray-900">Kelola Pengguna</span>
                            <span className="text-xs text-gray-500 mt-1">Lihat dan kelola pengguna</span>
                        </Link>
                    )}
                    {can('roles.view') && (
                        <Link 
                            href="/roles" 
                            className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow duration-200 border border-transparent hover:border-yellow-100"
                        >
                            <div className="p-3 bg-yellow-50 rounded-full mb-2">
                                <Shield className="h-6 w-6 text-yellow-600" />
                            </div>
                            <span className="font-medium text-gray-900">Kelola Peran</span>
                            <span className="text-xs text-gray-500 mt-1">Lihat dan kelola peran</span>
                        </Link>
                    )}
                </div>

                {/* Permissions Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PermissionCard 
                        title="Izin Pengguna" 
                        permissions={[
                            { label: 'Lihat Daftar Pengguna', permission: 'users.view' },
                            { label: 'Tambah Pengguna', permission: 'users.create' },
                            { label: 'Edit Pengguna', permission: 'users.edit' },
                            { label: 'Hapus Pengguna', permission: 'users.delete' }
                        ]} 
                    />
                    <PermissionCard 
                        title="Izin Peran" 
                        permissions={[
                            { label: 'Lihat Daftar Peran', permission: 'roles.view' },
                            { label: 'Buat Peran', permission: 'roles.create' },
                            { label: 'Edit Peran', permission: 'roles.edit' },
                            { label: 'Hapus Peran', permission: 'roles.delete' }
                        ]} 
                    />
                </div>
            </div>
        </AppLayout>
    );
}
