<?php

namespace App\Http\Controllers;

use App\Http\Requests\EquipmentRequest;
use App\Models\Equipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'type' => ['sometimes', 'string', 'max:80'],
            'status' => ['sometimes', 'string', 'max:30'],
            'agency' => ['sometimes', 'string', 'max:100'],
            'neighborhood' => ['sometimes', 'string', 'max:100'],
        ]);
        $query = Equipment::query()->orderBy('id');
        foreach (['type', 'status', 'agency'] as $field) {
            if (isset($filters[$field])) {
                $query->where($field, $filters[$field]);
            }
        }
        if (isset($filters['neighborhood'])) {
            $query->where('location->neighborhood', $filters['neighborhood']);
        }

        return response()->json($query->get());
    }

    public function store(EquipmentRequest $request): JsonResponse
    {
        return response()->json(Equipment::create($request->validated()), 201);
    }

    public function show(Equipment $equipment): JsonResponse
    {
        return response()->json($equipment);
    }

    public function update(EquipmentRequest $request, Equipment $equipment): JsonResponse
    {
        $equipment->update($request->validated());

        return response()->json($equipment->refresh());
    }

    public function destroy(Equipment $equipment): JsonResponse
    {
        $equipment->delete();

        return response()->json(null, 204);
    }
}
