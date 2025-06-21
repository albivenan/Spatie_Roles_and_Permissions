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
        // Add timestamps to model_has_roles if they don't exist
        if (!Schema::hasColumn('model_has_roles', 'created_at')) {
            Schema::table('model_has_roles', function (Blueprint $table) {
                $table->timestamps();
            });
            
            // Set default timestamps for existing records
            \DB::table('model_has_roles')->update([
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        
        // Add timestamps to model_has_permissions if they don't exist
        if (!Schema::hasColumn('model_has_permissions', 'created_at')) {
            Schema::table('model_has_permissions', function (Blueprint $table) {
                $table->timestamps();
            });
            
            // Set default timestamps for existing records
            \DB::table('model_has_permissions')->update([
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We won't remove the columns in the down method to prevent data loss
        // If you need to rollback, you should create a new migration to handle that
    }
};
