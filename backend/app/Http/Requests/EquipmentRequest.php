<?php

namespace App\Http\Requests;

use App\Support\EquipmentTypes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(EquipmentTypes::VALUES)],
            'serial_number' => ['required', 'string', 'max:80', Rule::unique('equipment')->ignore($this->route('equipment'))],
            'brand' => ['required', 'string', 'max:80'],
            'model' => ['required', 'string', 'max:80'],
            'agency' => ['required', 'string', 'max:100'],
            'status' => ['required', Rule::in(['planned', 'operational', 'malfunction', 'maintenance', 'disabled', 'stolen'])],
            'maintenance_priority' => ['required', Rule::in(['none', 'scheduled', 'immediate'])],
            'next_maintenance' => ['nullable', 'date_format:Y-m-d'],
            'attributes' => ['present', 'array'],
            ...LocationRules::rules(),
        ];
    }
}
