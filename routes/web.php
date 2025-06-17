<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RolesController;
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
    
    Route::resource('users', UserController::class);
    Route::resource('roles', RolesController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
