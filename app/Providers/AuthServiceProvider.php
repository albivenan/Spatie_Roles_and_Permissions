<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        User::class => 'App\Policies\UserPolicy',
        Role::class => 'App\Policies\RolePolicy',
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Define gates for role and permission checks
        Gate::before(function (User $user, $ability) {
            if ($user->hasRole('super_admin')) {
                return true;
            }
        });

        // Define gates for role actions
        Gate::define('update-role', function (User $user, $role) {
            return $user->can('update', $role);
        });

        // Define viewAny gates
        Gate::define('viewAny-role', function (User $user) {
            return $user->can('viewAny', Role::class);
        });

        Gate::define('viewAny-user', function (User $user) {
            return $user->can('viewAny', User::class);
        });
    }
}
