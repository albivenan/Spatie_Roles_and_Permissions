<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default permissions first, then roles and assign permissions
        $this->call([
            PermissionSeeder::class,
            RolePermissionSeeder::class,
        ]);

        // Create first admin user if not exists
        if (!User::where('email', 'admin@example.com')->exists()) {
            $admin = User::factory()->create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
            ]);
            
            // Assign super_admin role to the first user
            $admin->assignRole('super_admin');
        }
        
        // Create some test users with member role
        User::factory(5)->create()->each(function ($user) {
            $user->assignRole('member');
        });
    }
}
