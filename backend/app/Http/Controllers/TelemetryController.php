<?php

namespace App\Http\Controllers;

use App\Http\Requests\TelemetryRequest;
use App\Models\Equipment;
use App\Models\TelemetryEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TelemetryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = $request->validate(['limit' => ['sometimes', 'integer', 'between:1,500']])['limit'] ?? 100;

        return response()->json(TelemetryEvent::with('equipment')->latest('occurred_at')->limit($limit)->get());
    }

    public function store(TelemetryRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $event = DB::transaction(function () use ($payload): TelemetryEvent {
            $equipment = Equipment::findOrFail($payload['equipment_id']);
            if (isset($payload['status'])) {
                $equipment->update([
                    'status' => $payload['status'],
                    'maintenance_priority' => $payload['status'] === 'malfunction' ? 'immediate' : $equipment->maintenance_priority,
                ]);
            }

            return TelemetryEvent::create([
                'equipment_id' => $equipment->id,
                'kind' => $payload['kind'],
                'severity' => $payload['severity'],
                'description' => $payload['description'],
                'occurred_at' => $payload['occurred_at'] ?? now(),
            ]);
        });

        return response()->json($event, 201);
    }
}
