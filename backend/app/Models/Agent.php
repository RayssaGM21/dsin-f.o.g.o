<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agent extends Model
{
    protected $fillable = ['name', 'role', 'agency', 'status', 'location'];

    protected function casts(): array
    {
        return ['location' => 'array'];
    }
}
