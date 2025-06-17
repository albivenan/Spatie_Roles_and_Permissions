import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { can, usePermissions } from '@/lib/can';

export default function TestPermissions() {
    const permissions = usePermissions();

    return (
        <AppLayout>
            <Head title="Test Permissions" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-6">Permission Test Page</h1>
                        
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Your Permissions:</h2>
                            {permissions.length > 0 ? (
                                <ul className="list-disc pl-5">
                                    {permissions.map((permission, index) => (
                                        <li key={index} className="text-gray-700">
                                            {permission}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No permissions found. Make sure you're logged in and have roles assigned.</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Permission Tests:</h2>
                            
                            <div className="p-4 border rounded">
                                <h3 className="font-medium">User Permissions:</h3>
                                <div className="mt-2 space-y-2">
                                    <p>Can view users: {can('users.view') ? '✅' : '❌'}</p>
                                    <p>Can create users: {can('users.create') ? '✅' : '❌'}</p>
                                    <p>Can edit users: {can('users.edit') ? '✅' : '❌'}</p>
                                    <p>Can delete users: {can('users.delete') ? '✅' : '❌'}</p>
                                </div>
                            </div>

                            <div className="p-4 border rounded">
                                <h3 className="font-medium">Role Permissions:</h3>
                                <div className="mt-2 space-y-2">
                                    <p>Can view roles: {can('roles.view') ? '✅' : '❌'}</p>
                                    <p>Can create roles: {can('roles.create') ? '✅' : '❌'}</p>
                                    <p>Can edit roles: {can('roles.edit') ? '✅' : '❌'}</p>
                                    <p>Can delete roles: {can('roles.delete') ? '✅' : '❌'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
