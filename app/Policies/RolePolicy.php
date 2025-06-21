<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class RolePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        // Super admin selalu memiliki akses
        if ($user->hasRole('super_admin')) {
            return true;
        }
        // Atur izin default untuk pengguna lain jika diperlukan
        return $user->can('roles.viewAny');
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  \App\Models\User  $user
     * @param  mixed  $role
     * @return bool
     */
    public function view(User $user, $role = null): bool
    {
        // Super admin selalu memiliki akses
        if ($user->hasRole('super_admin')) {
            return true;
        }

        // Jika tidak ada role spesifik yang diberikan (pengecekan di level class)
        if ($role === null) {
            return $user->can('roles.view');
        }
        
        // Jika $role adalah string (nama class), izinkan akses
        if (is_string($role) && $role === Role::class) {
            return $user->can('roles.view');
        }
        
        // Jika $role adalah instance Role
        if ($role instanceof Role) {
            // Jika role tidak fixed, izinkan akses
            if (!$role->is_fixed) {
                return $user->can('roles.view');
            }
            // Jika role fixed, hanya super_admin yang bisa mengakses
            return $user->hasRole('super_admin');
        }
        
        return false;
    }

    public function create(User $user): bool
    {
        // Super admin selalu bisa membuat role baru
        if ($user->hasRole('super_admin')) {
            return true;
        }
        // Atur izin untuk pengguna lain
        return $user->can('roles.create');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\Models\User  $user
     * @param  mixed  $role
     * @return bool
     */
    public function update(User $user, $role = null): bool
    {
        // Super admin selalu bisa mengupdate role apapun
        if ($user->hasRole('super_admin')) {
            return true;
        }

        // Jika tidak ada role spesifik yang diberikan (pengecekan di level class)
        if ($role === null) {
            return $user->can('roles.update');
        }
        
        // Jika $role adalah string (nama class)
        if (is_string($role) && $role === Role::class) {
            return $user->can('roles.update');
        }
        
        // Jika $role adalah instance Role
        if ($role instanceof Role) {
            // Jika role tidak fixed, izinkan update jika memiliki permission
            if (!$role->is_fixed) {
                return $user->can('roles.update');
            }
            // Jika role fixed, hanya super_admin yang bisa mengupdate
            return $user->hasRole('super_admin');
        }
        
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  mixed  $role
     * @return bool
     */
    public function delete(User $user, $role = null): bool
    {
        // Super admin selalu bisa menghapus role apapun
        if ($user->hasRole('super_admin')) {
            return true;
        }

        // Jika tidak ada role spesifik yang diberikan (pengecekan di level class)
        if ($role === null) {
            return $user->can('roles.delete');
        }
        
        // Jika $role adalah string (nama class)
        if (is_string($role) && $role === Role::class) {
            return $user->can('roles.delete');
        }
        
        // Jika $role adalah instance Role
        if ($role instanceof Role) {
            // Jika role tidak fixed, izinkan hapus jika memiliki permission
            if (!$role->is_fixed) {
                return $user->can('roles.delete');
            }
            // Jika role fixed, hanya super_admin yang bisa menghapus
            return $user->hasRole('super_admin');
        }
        
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param  \App\Models\User  $user
     * @param  mixed  $role
     * @return bool
     */
    public function restore(User $user, $role = null): bool
    {
        // If no specific role is provided (checking class-level permissions)
        if ($role === null) {
            return true; // Allow checking restore permission at class level
        }
        
        // If $role is a string (class name), allow access
        if (is_string($role) && $role === Role::class) {
            return true;
        }
        
        // If $role is a Role instance, allow access
        if ($role instanceof Role) {
            return true;
        }
        
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  mixed  $role
     * @return bool
     */
    public function forceDelete(User $user, $role = null): bool
    {
        // If no specific role is provided (checking class-level permissions)
        if ($role === null) {
            return true; // Allow checking forceDelete permission at class level
        }
        
        // If $role is a string (class name), allow access
        if (is_string($role) && $role === Role::class) {
            return true;
        }
        
        // If $role is a Role instance, check if it's not fixed
        if ($role instanceof Role) {
            return !$role->is_fixed;
        }
        
        return false;
    }
}
