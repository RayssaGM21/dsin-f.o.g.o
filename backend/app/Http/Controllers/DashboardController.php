<?php

namespace App\Http\Controllers;

use App\Services\OperationsService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(OperationsService $operations): JsonResponse
    {
        return response()->json($operations->dashboard());
    }

    public function forecast(OperationsService $operations): JsonResponse
    {
        return response()->json($operations->forecast());
    }
}
