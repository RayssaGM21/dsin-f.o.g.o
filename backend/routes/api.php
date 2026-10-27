<?php

use App\Http\Controllers\AgentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\EquipmentTypeController;
use App\Http\Controllers\PostalCodeController;
use App\Http\Controllers\TelemetryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'throttle:60,1'])->group(function (): void {
    Route::get('equipment-types', [EquipmentTypeController::class, 'index']);
    Route::get('postal-codes/{cep}', [PostalCodeController::class, 'show']);
    Route::apiResource('equipment', EquipmentController::class);
    Route::apiResource('agents', AgentController::class);
    Route::post('telemetry', [TelemetryController::class, 'store']);
    Route::get('events', [TelemetryController::class, 'index']);
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('forecast', [DashboardController::class, 'forecast']);
});
