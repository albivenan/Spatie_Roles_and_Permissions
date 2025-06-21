<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if the column doesn't exist before adding it
        if (!Schema::hasColumn('roles', 'is_fixed')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->boolean('is_fixed')->default(false)->after('guard_name');
            });
            
            // Mark default roles as fixed
            DB::table('roles')
                ->whereIn('name', ['super_admin', 'admin', 'member'])
                ->update(['is_fixed' => true]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Only drop the column if it exists
        if (Schema::hasColumn('roles', 'is_fixed')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->dropColumn('is_fixed');
            });
        }
    }
};
