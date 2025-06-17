import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface Role {
    id: number;
    name: string;
    permissions: {
        id: number;
        name: string;
    }[];
}

interface Permission {
    id: number;
    name: string;
} // This interface is now unused since we're using the role's permissions directly

type Props = {
    role: Role;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Show Role',
        href: '/roles',
    },
];

export default function ShowRole({ role }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Show Role" />
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">Role Details</h2>
                                <Link 
                                    href={route('roles.index')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
                                >
                                    <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back
                                </Link>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-1 font-medium">Name:</p>
                                <p className="text-lg text-gray-800">{role.name}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-1 font-medium">Permissions:</p>
                                {role.permissions.map((permission) => (
                                                <span key={permission.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                    {permission.name}
                                                </span>
                                            ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
