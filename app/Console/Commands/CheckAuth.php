<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;

class CheckAuth extends Command
{
    protected $signature = 'app:check-auth {email? : Email of the user to check}';
    protected $description = 'Check authentication and authorization status';

    public function handle()
    {
        $email = $this->argument('email') ?? 'admin@example.com';
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email {$email} not found!");
            return 1;
        }

        // Basic user info
        $this->info("\n=== USER INFO ===");
        $this->line("ID: " . $user->id);
        $this->line("Name: " . $user->name);
        $this->line("Email: " . $user->email);
        $this->line("Email Verified: " . ($user->hasVerifiedEmail() ? 'Yes' : 'No'));
        $this->line("Created: " . $user->created_at);

        // Direct role check
        $this->info("\n=== ROLES ===");
        $roles = $user->getRoleNames();
        if ($roles->isEmpty()) {
            $this->warn("User has no roles assigned!");
        } else {
            $this->line("Direct roles: " . $roles->implode(', '));
        }

        // Direct permissions
        $this->info("\n=== DIRECT PERMISSIONS ===");
        $permissions = $user->getDirectPermissions();
        if ($permissions->isEmpty()) {
            $this->line("No direct permissions assigned");
        } else {
            $permissions->each(function($permission) {
                $this->line("- " . $permission->name);
            });
        }

        // All permissions (direct + via roles)
        $this->info("\n=== ALL PERMISSIONS ===");
        $allPermissions = $user->getAllPermissions();
        if ($allPermissions->isEmpty()) {
            $this->warn("User has no permissions at all!");
        } else {
            $allPermissions->each(function($permission) {
                $this->line("- " . $permission->name);
            });
        }

        // Check specific abilities
        $this->info("\n=== ABILITY CHECKS ===");
        $abilities = [
            'viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'
        ];
        
        $this->line("\n[Role Abilities]");
        foreach ($abilities as $ability) {
            $result = $user->can($ability, \Spatie\Permission\Models\Role::class) ? '✓' : '✗';
            $this->line(sprintf("%-15s %s", $ability . ' role:', $result));
        }

        // Check if user is super admin
        $this->info("\n=== SUPER ADMIN CHECK ===");
        $isSuperAdmin = $user->hasRole('super_admin');
        $this->line("Has super_admin role: " . ($isSuperAdmin ? '✓' : '✗'));
        $this->line("Is super admin (via hasRole): " . ($isSuperAdmin ? '✓' : '✗'));

        // Check role model
        $role = Role::findByName('super_admin');
        if ($role) {
            $this->line("\n=== SUPER_ADMIN ROLE DETAILS ===");
            $this->line("ID: " . $role->id);
            $this->line("Name: " . $role->name);
            $this->line("Guard: " . $role->guard_name);
            $this->line("Is Fixed: " . ($role->is_fixed ? 'Yes' : 'No'));
            $this->line("Created At: " . $role->created_at);
            $this->line("Updated At: " . $role->updated_at);
            
            $this->line("\nPermissions assigned to super_admin role:");
            $permissions = $role->permissions;
            if ($permissions->isEmpty()) {
                $this->warn("No permissions assigned to super_admin role!");
            } else {
                $permissions->each(function($permission) {
                    $this->line("- " . $permission->name);
                });
            }
        } else {
            $this->error("super_admin role not found!");
        }

        return 0;
    }
}
