<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Development route for testing permissions - remove in production
    Route::get('/test-permissions', function () {
        return Inertia::render('TestPermissions');
    })->name('test.permissions');
    
    // User Management
    Route::middleware(['auth'])->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
        Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });
    
    // Role Management
    Route::middleware(['auth'])->group(function () {
        Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
        Route::get('roles/create', [RoleController::class, 'create'])->name('roles.create');
        Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
        Route::get('roles/{role}', [RoleController::class, 'show'])->name('roles.show');
        Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
        Route::put('roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
    });
});

// Route to check current user permissions
Route::get('/check-permissions', function () {
    if (!auth()->check()) {
        return response()->json(['error' => 'Not authenticated'], 401);
    }
    
    $user = auth()->user();
    
    return [
        'user' => $user->only(['id', 'name', 'email']),
        'roles' => $user->getRoleNames(),
        'permissions' => $user->getAllPermissions()->pluck('name'),
        'can_view_users' => $user->can('viewAny', \App\Models\User::class),
        'can_view_roles' => $user->can('viewAny', \Spatie\Permission\Models\Role::class),
    ];
})->middleware('auth');

// Route to verify and fix roles structure if needed
Route::get('/verify-roles', function () {
    try {
        // Check if the column exists
        $hasIsFixedColumn = Schema::hasColumn('roles', 'is_fixed');
        
        if (!$hasIsFixedColumn) {
            return [
                'success' => false,
                'message' => 'is_fixed column does not exist in roles table',
                'next_steps' => 'Run the migration to add the is_fixed column',
            ];
        }
        
        // Get all roles with their permissions
        $roles = \Spatie\Permission\Models\Role::with('permissions')->get();
        
        // Check if default roles exist and are marked as fixed
        $defaultRoles = ['super_admin', 'admin', 'member'];
        $missingRoles = [];
        $fixedStatus = [];
        
        foreach ($defaultRoles as $roleName) {
            $role = $roles->firstWhere('name', $roleName);
            
            if (!$role) {
                $missingRoles[] = $roleName;
                continue;
            }
            
            $fixedStatus[$roleName] = [
                'exists' => true,
                'is_fixed' => (bool) $role->is_fixed,
                'permissions' => $role->permissions->pluck('name')->toArray(),
            ];
        }
        
        // Check for any non-fixed roles
        $nonFixedRoles = $roles->where('is_fixed', false)
            ->pluck('name')
            ->toArray();
        
        return [
            'success' => true,
            'has_is_fixed_column' => true,
            'default_roles_status' => $fixedStatus,
            'missing_default_roles' => $missingRoles,
            'non_fixed_roles' => $nonFixedRoles,
            'all_roles' => $roles->map(function($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'is_fixed' => (bool) $role->is_fixed,
                    'guard_name' => $role->guard_name,
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'created_at' => $role->created_at->toDateTimeString(),
                    'updated_at' => $role->updated_at->toDateTimeString(),
                ];
            }),
        ];
        
    } catch (\Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ];
    }
})->middleware('auth');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
