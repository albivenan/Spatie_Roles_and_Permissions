<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Inertia\Inertia;

class RolesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('roles/index', [
            'roles' => Role::with('permissions')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('roles/create', [
            'permissions' => Permission::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'permissions' => 'required',
        ]);

        $role = Role::create(['name' => $request->name]);
        $role->syncPermissions($request->permissions);

        return redirect()->route('roles.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        return Inertia::render('roles/show', [  
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                    ];
                })->toArray(),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
{
    $role = Role::with('permissions')->findOrFail($id);

    return Inertia::render('roles/edit', [
        'role' => [
            'id' => $role->id,
            'name' => $role->name,
            'permissions' => $role->permissions->pluck('name'), // ⬅️ array of permission names
        ],
        'permissions' => Permission::all()->map(function ($perm) {
            return [
                'id' => $perm->id,
                'name' => $perm->name,
            ];
        }),
    ]);
}


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
{
    $role = Role::findOrFail($id);

    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'permissions' => 'required|array',
        'permissions.*' => 'string',
    ]);

    $role->update([
        'name' => $validated['name'],
    ]);

    // Gunakan syncPermissions untuk menyimpan ulang permission
    $role->syncPermissions($validated['permissions']);

    return redirect()->route('roles.index')
        ->with('success', 'Role updated successfully');
}


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $role = Role::findOrFail($id);
        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully');
    }
}
