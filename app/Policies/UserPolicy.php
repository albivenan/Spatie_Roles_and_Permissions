<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Super admin selalu memiliki akses
        if ($user->hasRole('super_admin')) {
            return true;
        }
        return $user->can('users.viewAny');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        // Super admin selalu memiliki akses
        if ($user->hasRole('super_admin')) {
            return true;
        }

        // Pengguna bisa melihat profil mereka sendiri
        if ($user->id === $model->id) {
            return true;
        }

        return $user->can('users.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Super admin selalu bisa membuat pengguna baru
        if ($user->hasRole('super_admin')) {
            return true;
        }
        return $user->can('users.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        // Super admin selalu bisa mengupdate semua pengguna
        if ($user->hasRole('super_admin')) {
            return true;
        }

        // Pengguna bisa mengupdate profil mereka sendiri
        if ($user->id === $model->id) {
            return true;
        }

        // Cek permission untuk mengupdate pengguna lain
        return $user->can('users.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        // Super admin tidak bisa menghapus dirinya sendiri
        if ($user->id === $model->id) {
            return false;
        }

        // Super admin bisa menghapus pengguna lain
        if ($user->hasRole('super_admin')) {
            return true;
        }

        // Cek permission untuk menghapus pengguna
        return $user->can('users.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): bool
    {
        return $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): bool
    {
        return $user->hasRole('super_admin');
    }
}
