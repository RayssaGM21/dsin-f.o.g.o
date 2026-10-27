<?php

namespace App\Http\Controllers;

use App\Http\Requests\AgentRequest;
use App\Models\Agent;
use Illuminate\Http\JsonResponse;

class AgentController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Agent::query()->orderBy('id')->get());
    }

    public function store(AgentRequest $request): JsonResponse
    {
        return response()->json(Agent::create($request->validated()), 201);
    }

    public function show(Agent $agent): JsonResponse
    {
        return response()->json($agent);
    }

    public function update(AgentRequest $request, Agent $agent): JsonResponse
    {
        $agent->update($request->validated());

        return response()->json($agent->refresh());
    }

    public function destroy(Agent $agent): JsonResponse
    {
        $agent->delete();

        return response()->json(null, 204);
    }
}
