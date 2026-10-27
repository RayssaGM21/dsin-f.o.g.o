<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class PostalCodeLookup
{
    public function find(string $cep): array
    {
        $cacheKey = "postal-code:{$cep}";
        if ($cached = Cache::get($cacheKey)) {
            return $cached;
        }

        try {
            $response = Http::withOptions(['verify' => resource_path('certs/cacert.pem')])
                ->acceptJson()->connectTimeout(3)->timeout(6)
                ->get("https://brasilapi.com.br/api/cep/v2/{$cep}");
        } catch (ConnectionException) {
            return ['error' => 'unavailable'];
        }

        if ($response->status() === 404) {
            return ['error' => 'not_found'];
        }
        if (! $response->successful()) {
            return ['error' => 'unavailable'];
        }

        $data = $response->json();
        if (! is_array($data) || empty($data['city']) || empty($data['state'])) {
            return ['error' => 'unavailable'];
        }

        $latitude = data_get($data, 'location.coordinates.latitude');
        $longitude = data_get($data, 'location.coordinates.longitude');
        $coordinatesValid = is_numeric($latitude) && is_numeric($longitude)
            && (float) $latitude >= -90 && (float) $latitude <= 90
            && (float) $longitude >= -180 && (float) $longitude <= 180;

        $address = [
            'postal_code' => substr($cep, 0, 5).'-'.substr($cep, 5),
            'street' => (string) ($data['street'] ?? ''),
            'neighborhood' => (string) ($data['neighborhood'] ?? ''),
            'city' => (string) $data['city'],
            'state' => (string) $data['state'],
            'latitude' => $coordinatesValid ? (float) $latitude : null,
            'longitude' => $coordinatesValid ? (float) $longitude : null,
        ];

        Cache::put($cacheKey, $address, now()->addDays(7));

        return $address;
    }
}
