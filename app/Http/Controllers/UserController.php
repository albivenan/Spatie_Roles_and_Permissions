<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;    
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];
    
    /**
     * Display a listing of users.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        // Get all users with their roles and permissions
        $users = User::with('roles.permissions')->get();
        // Get all roles with their permissions for filtering
        $roles = Role::with('permissions')->get();
        
        // Ensure roles are properly loaded for each user
        foreach ($users as $user) {
            $user->load('roles');
        }
        
        // Return the users index view with users and roles data
        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form for creating a new user.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        // Return the create user form with all available roles
        return Inertia::render('users/create', [
            'roles' => Role::all(),
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
        // Validate the incoming request data
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,id'
        ]);

        // Create a new user with the validated data
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
        
        // Sync the selected roles with the user
        $user->syncRoles($request->roles);
        
        // Redirect to the users index with success message
        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     *
     * @param  string  $id
     * @return \Inertia\Response
     */
    public function show(string $id)
    {
        // Find the user by ID with their roles
        $user = User::with('roles')->findOrFail($id);
        
        // Return the user show view with user data
        return Inertia::render('users/show', [
            'user' => $user,
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
        // Find the user by ID with their roles
        $user = User::with('roles')->findOrFail($id);
        // Get all roles for the role selection dropdown
        $roles = Role::with('permissions')->get();
        
        // Return the edit user form with user and roles data
        return Inertia::render('users/edit', [
            'user' => $user,
            'roles' => $roles,
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
        // Find the user by ID
        $user = User::findOrFail($id);
        
        // Validate the incoming request data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,id'
        ]);

        // Update the user with validated data
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        
        // Only update password if provided
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        
        // Save the user
        $user->save();
        
        // Sync the selected roles with the user
        $user->syncRoles($validated['roles']);
        
        // Redirect to the users index with success message
        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     *
     * @param  string  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(string $id)
    {
        // Find the user by ID
        $user = User::findOrFail($id);
        
        // Delete the user
        $user->delete();
        
        // Redirect to the users index with success message
        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }
}
