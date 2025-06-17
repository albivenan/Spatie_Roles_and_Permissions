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
        // Create default roles and permissions
        $this->call([
            PermissionSeeder::class,
        ]);

        // Create first admin user
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);
        
        // Assign superadmin role to the first user
        $admin->assignRole('superadmin');
        
        // Create some test users with member role
        User::factory(5)->create()->each(function ($user) {
            $user->assignRole('member');
        });
    }
}
