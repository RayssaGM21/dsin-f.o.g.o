<?php

namespace App\Http\Requests;

final class LocationRules
{
    public static function rules(): array
    {
        return [
            'location' => ['required', 'array'],
            'location.postal_code' => ['required', 'regex:/^\d{5}-?\d{3}$/'],
            'location.neighborhood' => ['required', 'string', 'max:100'],
            'location.city' => ['required', 'string', 'max:100'],
            'location.state' => ['required', 'string', 'size:2'],
            'location.street' => ['required', 'string', 'max:150'],
            'location.reference' => ['required', 'string', 'max:150'],
            'location.latitude' => ['required', 'numeric', 'between:-90,90'],
            'location.longitude' => ['required', 'numeric', 'between:-180,180'],
        ];
    }
}
