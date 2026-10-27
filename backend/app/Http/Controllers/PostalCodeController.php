<?php

namespace App\Http\Controllers;

use App\Services\PostalCodeLookup;
use Illuminate\Http\JsonResponse;

class PostalCodeController extends Controller
{
    public function show(string $cep, PostalCodeLookup $lookup): JsonResponse
    {
        if (! preg_match('/^\d{8}$/', $cep)) {
            return response()->json(['message' => 'Informe um CEP com 8 dígitos.'], 422);
        }

        $result = $lookup->find($cep);

        return match ($result['error'] ?? null) {
            'not_found' => response()->json(['message' => 'CEP não encontrado.'], 404),
            'unavailable' => response()->json(['message' => 'Consulta de CEP indisponível no momento.'], 503),
            default => response()->json($result),
        };
    }
}
