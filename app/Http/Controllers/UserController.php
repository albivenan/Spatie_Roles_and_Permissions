<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;    
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $this->authorize('viewAny', User::class);
        
        // Get all users with their roles and permissions
        $users = User::with('roles.permissions')
            ->latest()
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                    'roles' => $user->roles->map(fn($role) => [
                        'id' => $role->id,
                        'name' => $role->name,
                    ]),
                    'can' => [
                        'edit' => auth()->user()->can('update', $user),
                        'delete' => auth()->user()->can('delete', $user),
                    ]
                ];
            });
        
        // Get all roles for the create/edit form
        $roles = Role::orderBy('name')->get(['id', 'name']);
        
        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => $roles,
            'can' => [
                'create' => auth()->user()->can('create', User::class),
            ]
        ]);
    }

    /**
     * Show the form for creating a new user.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        $this->authorize('create', User::class);
        
        return Inertia::render('users/create', [
            'roles' => Role::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created user in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $this->authorize('create', User::class);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,id'
        ], [
            'roles.required' => 'Please select at least one role.',
            'roles.min' => 'Please select at least one role.',
        ]);

        try {
            DB::beginTransaction();
            
            // Create a new user with the validated data
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'email_verified_at' => now(),
            ]);
            
            // Sync the selected roles with the user
            $user->syncRoles($validated['roles']);
            
            DB::commit();
            
            return redirect()->route('users.index')
                ->with('success', 'User created successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withInput()
                ->with('error', 'Failed to create user. ' . $e->getMessage());
        }
    }

    /**
     * Display the specified user.
     *
     * @param  string  $id
     * @return \Inertia\Response
     */
    public function show(string $id)
    {
        $user = User::with('roles')->findOrFail($id);
        $this->authorize('view', $user);
        
        return Inertia::render('users/show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at?->format('Y-m-d H:i:s'),
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                'roles' => $user->roles->map(fn($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                ]),
            ],
            'can' => [
                'edit' => auth()->user()->can('update', $user),
                'delete' => auth()->user()->can('delete', $user),
            ]
        ]);
    }
    
    /**
     * Show the form for editing the specified user.
     *
     * @param  string  $id
     * @return \Inertia\Response
     */
    public function edit(string $id)
    {
        $user = User::with('roles')->findOrFail($id);
        $this->authorize('update', $user);
        
        return Inertia::render('users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('id'),
            ],
            'roles' => Role::orderBy('name')->get(['id', 'name']),
        ]);
    }
    
    /**
     * Update the specified user in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        $this->authorize('update', $user);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,id'
        ], [
            'roles.required' => 'Please select at least one role.',
            'roles.min' => 'Please select at least one role.',
        ]);
        
        try {
            DB::beginTransaction();
            
            // Update user data
            $user->name = $validated['name'];
            $user->email = $validated['email'];
            
            // Update password if provided
            if (!empty($validated['password'])) {
                $user->password = Hash::make($validated['password']);
            }
            
            $user->save();
            
            // Sync roles (only if user is not updating themselves)
            if (auth()->id() !== $user->id) {
                $user->syncRoles($validated['roles']);
            }
            
            DB::commit();
            
            return redirect()->route('users.index')
                ->with('success', 'User updated successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withInput()
                ->with('error', 'Failed to update user. ' . $e->getMessage());
        }
    }
    
    /**
     * Remove the specified user from storage.
     *
     * @param  string  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $this->authorize('delete', $user);
        
        try {
            // Prevent deleting the currently authenticated user
            if (auth()->id() === $user->id) {
                return back()->with('error', 'You cannot delete your own account.');
            }
            
            // Prevent deleting users with super_admin role
            if ($user->hasRole('super_admin')) {
                return back()->with('error', 'Cannot delete a user with super admin role.');
            }
            
            $user->delete();
            
            return redirect()->route('users.index')
                ->with('success', 'User deleted successfully.');
                
        } catch (\Exception $e) {
            return back()
                ->with('error', 'Failed to delete user. ' . $e->getMessage());
        }
    }
}
