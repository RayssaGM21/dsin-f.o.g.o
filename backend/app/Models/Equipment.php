<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipment extends Model
{
    protected $table = 'equipment';

    protected $fillable = [
        'type', 'serial_number', 'brand', 'model', 'agency', 'status',
        'maintenance_priority', 'next_maintenance', 'location', 'attributes',
    ];

    protected function casts(): array
    {
        return [
            'location' => 'array',
            'attributes' => 'array',
            'next_maintenance' => 'date:Y-m-d',
        ];
    }

    public function events(): HasMany
    {
        return $this->hasMany(TelemetryEvent::class);
    }
}
