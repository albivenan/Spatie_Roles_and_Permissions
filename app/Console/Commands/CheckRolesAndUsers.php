<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Spatie\Permission\Models\Role;

class CheckRolesAndUsers extends Command
{
    protected $signature = 'app:check-roles';
    protected $description = 'Check roles and user assignments';

    public function handle()
    {
        $this->info('Checking roles and user assignments...');
        
        // Check super_admin role
        $superAdminRole = Role::where('name', 'super_admin')->first();
        
        if (!$superAdminRole) {
            $this->error('super_admin role does not exist!');
            return 1;
        }
        
        $this->info('\n=== SUPER_ADMIN ROLE ===');
        $this->info('ID: ' . $superAdminRole->id);
        $this->info('Name: ' . $superAdminRole->name);
        $this->info('Is Fixed: ' . ($superAdminRole->is_fixed ? 'Yes' : 'No'));
        
        // Get users with super_admin role
        $superAdmins = User::role('super_admin')->get();
        
        $this->info('\n=== SUPER_ADMIN USERS ===');
        if ($superAdmins->isEmpty()) {
            $this->warn('No users have the super_admin role!');
        } else {
            foreach ($superAdmins as $user) {
                $this->info('- ' . $user->email . ' (ID: ' . $user->id . ')' . 
                          ', Email Verified: ' . ($user->hasVerifiedEmail() ? 'Yes' : 'No'));
            }
        }
        
        // Show all roles
        $this->info('\n=== ALL ROLES ===');
        $roles = Role::with('permissions')->get();
        
        $roles->each(function($role) {
            $this->info('\n' . $role->name . ' (ID: ' . $role->id . ')' . 
                      ', Fixed: ' . ($role->is_fixed ? 'Yes' : 'No'));
            $this->info('Permissions: ' . $role->permissions->pluck('name')->implode(', '));
            $this->info('Users: ' . $role->users()->count());
        });
        
        return 0;
    }
}
