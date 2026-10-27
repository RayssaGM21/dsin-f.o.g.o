<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment', function (Blueprint $table): void {
            $table->id();
            $table->string('type', 80);
            $table->string('serial_number', 80)->unique();
            $table->string('brand', 80);
            $table->string('model', 80);
            $table->string('agency', 100)->index();
            $table->string('status', 30)->index();
            $table->string('maintenance_priority', 20)->default('none');
            $table->date('next_maintenance')->nullable();
            $table->json('location');
            $table->json('attributes');
            $table->timestamps();
        });

        Schema::create('agents', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 120);
            $table->string('role', 80);
            $table->string('agency', 100)->index();
            $table->string('status', 30)->index();
            $table->json('location');
            $table->timestamps();
        });

        Schema::create('telemetry_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment')->cascadeOnDelete();
            $table->string('kind', 80);
            $table->string('severity', 20)->index();
            $table->string('description', 250);
            $table->timestamp('occurred_at')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('telemetry_events');
        Schema::dropIfExists('agents');
        Schema::dropIfExists('equipment');
    }
};
