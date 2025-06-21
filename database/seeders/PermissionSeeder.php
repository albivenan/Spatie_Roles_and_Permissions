<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define permissions by group
        $permissionGroups = [
            'users' => [
                'view', 'create', 'edit', 'delete', 'view_any', 'force_delete', 'restore'
            ],
            'roles' => [
                'view', 'create', 'edit', 'delete', 'view_any', 'update_any', 'delete_any'
            ],
            'permissions' => [
                'view', 'view_any'
            ]
        ];

        // Create permissions
        foreach ($permissionGroups as $group => $actions) {
            foreach ($actions as $action) {
                $name = "{$group}.{$action}";
                Permission::firstOrCreate([
                    'name' => $name,
                    'guard_name' => 'web'
                ]);
            }
        }

        $this->command->info('Permissions seeded successfully.');
    }
}
