<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'guard_name',
        'is_fixed',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_fixed' => 'boolean',
    ];

    /**
     * The default fixed role names.
     *
     * @var array
     */
    public const FIXED_ROLES = [
        'super_admin',
        'admin',
        'member',
    ];

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::creating(function ($role) {
            // Automatically set is_fixed for default roles
            if (in_array($role->name, self::FIXED_ROLES)) {
                $role->is_fixed = true;
            } else {
                $role->is_fixed = $role->is_fixed ?? false;
            }
        });
    }

    /**
     * A role belongs to some permissions of the guard belonging to the specified guard.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function permissions(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(
            config('permission.models.permission'),
            config('permission.table_names.role_has_permissions'),
            'role_id',
            'permission_id'
        )->withTimestamps();
    }
    
    /**
     * Check if role is a fixed role.
     *
     * @return bool
     */
    public function isFixed(): bool
    {
        return $this->is_fixed === true;
    }
    
    /**
     * Check if role is a default fixed role.
     *
     * @return bool
     */
    public function isDefaultFixed(): bool
    {
        return in_array($this->name, self::FIXED_ROLES);
    }
}
