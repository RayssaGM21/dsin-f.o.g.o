<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::view('/', 'app', ['page' => 'landing'])->name('home');

Route::middleware('guest')->group(function (): void {
    Route::view('/login', 'app', ['page' => 'login'])->name('login');
    Route::view('/register', 'app', ['page' => 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
});

Route::middleware('auth')->group(function (): void {
    Route::view('/platform', 'app', ['page' => 'platform'])->name('platform');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});
