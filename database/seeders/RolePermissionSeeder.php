<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles
        $superAdmin = Role::firstOrCreate([
            'name' => 'super_admin',
            'guard_name' => 'web',
            'is_fixed' => true
        ]);

        $admin = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web',
            'is_fixed' => true
        ]);

        $member = Role::firstOrCreate([
            'name' => 'member',
            'guard_name' => 'web',
            'is_fixed' => true
        ]);

        // Assign all permissions to super_admin
        $superAdmin->syncPermissions(Permission::all());
        
        // Assign specific permissions to admin
        $admin->syncPermissions([
            'users.view',
            'users.create',
            'users.edit',
            'users.view_any',
            'roles.view',
            'roles.view_any',
            'permissions.view',
            'permissions.view_any'
        ]);

        // Assign basic view permissions to member
        $member->syncPermissions([
            'users.view',
            'users.view_any',
            'roles.view',
            'roles.view_any'
        ]);

        $this->command->info('Roles and permissions assigned successfully.');

        // Update the first user to be super_admin if exists
        if ($user = \App\Models\User::first()) {
            $user->assignRole('super_admin');
        }
    }
}
