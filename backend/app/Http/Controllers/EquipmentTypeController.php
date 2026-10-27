<?php

namespace App\Http\Controllers;

use App\Support\EquipmentTypes;
use Illuminate\Http\JsonResponse;

class EquipmentTypeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(EquipmentTypes::VALUES);
    }
}
