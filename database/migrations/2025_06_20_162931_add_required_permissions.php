<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Daftar permission yang diperlukan
        $permissions = [
            'users.manage',
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'roles.manage',
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',
            'roles.assign',
        ];

        // Tambahkan permission ke database jika belum ada
        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        // Berikan semua permission ke role super_admin
        $superAdmin = Role::where('name', 'super_admin')->first();
        if ($superAdmin) {
            $superAdmin->syncPermissions($permissions);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Hapus permissions yang dibuat
        $permissions = [
            'users.manage',
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'roles.manage',
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',
            'roles.assign',
        ];

        foreach ($permissions as $permission) {
            $perm = Permission::where('name', $permission)->first();
            if ($perm) {
                $perm->delete();
            }
        }
    }
};
