<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AgentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'role' => ['required', 'string', 'max:80'],
            'agency' => ['required', 'string', 'max:100'],
            'status' => ['required', Rule::in(['active', 'available', 'off_duty'])],
            ...LocationRules::rules(),
        ];
    }
}
