<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TelemetryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'equipment_id' => ['required', 'integer', 'exists:equipment,id'],
            'kind' => ['required', 'string', 'max:80'],
            'severity' => ['required', Rule::in(['info', 'warning', 'critical'])],
            'description' => ['required', 'string', 'max:250'],
            'occurred_at' => ['nullable', 'date'],
            'status' => ['nullable', Rule::in(['planned', 'operational', 'malfunction', 'maintenance', 'disabled', 'stolen'])],
        ];
    }
}
