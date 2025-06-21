<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ensure super_admin role exists with correct attributes
        $superAdmin = DB::table('roles')->where('name', 'super_admin')->first();
        
        if (!$superAdmin) {
            // Create super_admin role if it doesn't exist
            $roleId = DB::table('roles')->insertGetId([
                'name' => 'super_admin',
                'guard_name' => 'web',
                'is_fixed' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // Assign all permissions to super_admin
            $permissions = DB::table('permissions')->pluck('id');
            $rolePermissions = $permissions->map(function ($permissionId) use ($roleId) {
                return [
                    'permission_id' => $permissionId,
                    'role_id' => $roleId,
                ];
            })->toArray();
            
            DB::table('role_has_permissions')->insert($rolePermissions);
        } else if ($superAdmin->is_fixed != 1) {
            // Update existing super_admin to be fixed
            DB::table('roles')
                ->where('name', 'super_admin')
                ->update([
                    'is_fixed' => true,
                    'updated_at' => now(),
                ]);
        }
        
        // Ensure admin and member roles are marked as fixed
        DB::table('roles')
            ->whereIn('name', ['admin', 'member'])
            ->update(['is_fixed' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We shouldn't revert the role name back to 'superadmin' as it might break things
        // Just ensure the role is not marked as fixed
        DB::table('roles')
            ->where('name', 'super_admin')
            ->update([
                'is_fixed' => false,
                'updated_at' => now(),
            ]);
            
        // Also unset is_fixed for other roles
        DB::table('roles')
            ->whereIn('name', ['admin', 'member'])
            ->update(['is_fixed' => false]);
    }
};
