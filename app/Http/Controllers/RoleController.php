<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Role::class);
        
        return Inertia::render('roles/create', [
            'permissions' => Permission::orderBy('name')->get()
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Role::class);
        
        $roles = Role::with('permissions')
            ->orderBy('is_fixed', 'desc')
            ->orderBy('name')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'is_fixed' => (bool) $role->is_fixed,
                    'permissions' => $role->permissions->map(fn($p) => [
                        'id' => $p->id,
                        'name' => $p->name,
                    ]),
                    'created_at' => $role->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $role->updated_at->format('Y-m-d H:i:s'),
                ];
            });
            
        $permissions = Permission::orderBy('name')->get(['id', 'name']);
        
        return Inertia::render('roles/index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'can' => [
                'create' => auth()->user()->can('create', Role::class),
                'edit' => auth()->user()->can('update', Role::class),
                'delete' => auth()->user()->can('delete', Role::class),
            ]
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        $this->authorize('view', $role);
        
        return Inertia::render('roles/show', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'is_fixed' => (bool) $role->is_fixed,
                'permissions' => $role->permissions->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                ]),
                'created_at' => $role->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $role->updated_at->format('Y-m-d H:i:s'),
            ],
            'can' => [
                'edit' => auth()->user()->can('update', $role),
                'delete' => auth()->user()->can('delete', $role),
            ]
        ]);
    }
    
    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        $this->authorize('update', $role);
        
        return Inertia::render('roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('id'),
                'is_fixed' => $role->is_fixed,
            ],
            'permissions' => Permission::orderBy('name')->get(['id', 'name']),
            'can' => [
                'update' => auth()->user()->can('update', $role),
                'delete' => auth()->user()->can('delete', $role),
            ]
        ]);
    }
    
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Role::class);
        
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:roles,name',
                'regex:/^[a-z0-9_]+$/',
            ],
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'exists:permissions,id'
        ], [
            'name.regex' => 'The role name may only contain lowercase letters, numbers, and underscores.',
            'permissions.required' => 'Please select at least one permission.',
            'permissions.min' => 'Please select at least one permission.',
        ]);
        
        try {
            DB::beginTransaction();
            
            $role = Role::create([
                'name' => $validated['name'],
                'is_fixed' => false, // New roles are never fixed
            ]);
            
            $role->syncPermissions($validated['permissions']);
            
            DB::commit();
            
            return redirect()
                ->route('roles.index')
                ->with('success', 'Role created successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withInput()
                ->with('error', 'Failed to create role. ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $this->authorize('update', $role);
        
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:roles,name,' . $role->id,
                'regex:/^[a-z0-9_]+$/'
            ],
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'exists:permissions,id'
        ], [
            'name.regex' => 'The role name may only contain lowercase letters, numbers, and underscores.',
            'permissions.required' => 'Please select at least one permission.',
            'permissions.min' => 'Please select at least one permission.',
        ]);
        
        try {
            DB::beginTransaction();
            
            // Only update name if it's not a fixed role or if user is super admin
            if (!$role->is_fixed || auth()->user()->hasRole('super_admin')) {
                $role->update([
                    'name' => $validated['name']
                ]);
            }
            
            // Update permissions (policy will handle authorization)
            $role->syncPermissions($validated['permissions']);
            
            // Clear cached roles and permissions
            app()['cache']->forget('spatie.permission.cache');
            
            DB::commit();
            
            return redirect()
                ->route('roles.index')
                ->with('success', 'Role updated successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withInput()
                ->with('error', 'Failed to update role. ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        $this->authorize('delete', $role);
        
        try {
            // Prevent deleting roles that are in use
            $userCount = $role->users()->count();
            if ($userCount > 0) {
                return back()
                    ->with('error', "Cannot delete role. It is currently assigned to {$userCount} user(s).");
            }
            
            // Double check this isn't a fixed role (should be caught by policy)
            if ($role->is_fixed) {
                throw new \Exception('Cannot delete a fixed role.');
            }
            
            $role->delete();
            
            // Clear cached roles and permissions
            app()['cache']->forget('spatie.permission.cache');
            
            return redirect()
                ->route('roles.index')
                ->with('success', 'Role deleted successfully.');
                
        } catch (\Exception $e) {
            return back()
                ->with('error', 'Failed to delete role. ' . $e->getMessage());
        }
    }
}
