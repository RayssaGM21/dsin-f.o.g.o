<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\Equipment;
use App\Models\TelemetryEvent;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (Equipment::query()->exists()) {
            return;
        }

        $areas = [
            ['Centro', -20.8115, -49.3758, 'Av. Alberto Andaló'],
            ['Boa Vista', -20.7972, -49.3680, 'Rua Bernardino de Campos'],
            ['Vila Redentora', -20.8260, -49.3864, 'Av. Bady Bassitt'],
            ['Jardim América', -20.8380, -49.3640, 'Rua Independência'],
            ['Cidade Nova', -20.7915, -49.3920, 'Av. Danilo Galeazzi'],
        ];
        $location = fn (int $area, float $offset = 0) => [
            'postal_code' => sprintf('150%02d-000', $area),
            'neighborhood' => $areas[$area][0],
            'city' => 'São José do Rio Preto', 'state' => 'SP',
            'street' => $areas[$area][3], 'reference' => 'Próximo ao nº 181',
            'latitude' => $areas[$area][1] + $offset,
            'longitude' => $areas[$area][2] + $offset * .8,
        ];
        $specs = [
            ['Radar de velocidade', 'operational', 'none', 0, 'Mobilidade', ['speed_limit_kmh' => 60]],
            ['Câmera de videomonitoramento', 'operational', 'scheduled', 0, 'Guarda Municipal', ['night_vision' => true]],
            ['Semáforo inteligente', 'malfunction', 'immediate', 0, 'Mobilidade', ['adaptive_timing' => true]],
            ['Totem de estacionamento', 'operational', 'none', 1, 'Mobilidade', ['payment' => ['PIX', 'cartão']]],
            ['Câmera de videomonitoramento', 'maintenance', 'scheduled', 1, 'Guarda Municipal', ['night_vision' => false]],
            ['Radar de velocidade', 'operational', 'scheduled', 1, 'Mobilidade', ['speed_limit_kmh' => 50]],
            ['Balança de caminhão', 'operational', 'none', 2, 'Mobilidade', ['capacity_tons' => 30]],
            ['Cancela automatizada', 'disabled', 'immediate', 2, 'Mobilidade', ['remote_control' => true]],
            ['Patinete compartilhado', 'operational', 'none', 3, 'Mobilidade', ['battery_percent' => 81]],
            ['Radar de semáforo', 'operational', 'scheduled', 3, 'Mobilidade', ['red_light_detection' => true]],
            ['Totem de estacionamento', 'planned', 'none', 4, 'Mobilidade', ['payment' => ['PIX']]],
            ['Câmera de videomonitoramento', 'stolen', 'immediate', 4, 'Guarda Municipal', ['night_vision' => true]],
        ];
        $devicesByArea = [];
        foreach ($specs as $index => [$type, $status, $priority, $area, $agency, $attributes]) {
            $device = Equipment::create([
                'type' => $type, 'serial_number' => sprintf('FOGO-%04d', $index + 1),
                'brand' => 'Civitas', 'model' => 'Urban '.(2020 + $index % 5),
                'agency' => $agency, 'status' => $status,
                'maintenance_priority' => $priority,
                'next_maintenance' => today()->addDays([18, 3, -2, 35, 2, 5, 45, -1, 60, 6, 90, -3][$index]),
                'location' => $location($area, ($index % 3 - 1) * .0015),
                'attributes' => $attributes,
            ]);
            $devicesByArea[$area][] = $device->id;
        }
        $people = [
            ['Marina Costa', 'Agente de trânsito', 'Mobilidade', 'active', 0],
            ['João Ribeiro', 'Guarda municipal', 'Guarda Municipal', 'active', 0],
            ['Ana Ferreira', 'Agente de trânsito', 'Mobilidade', 'active', 1],
            ['Paulo Souza', 'Policial militar', 'Polícia Militar', 'available', 2],
            ['Lívia Almeida', 'Guarda municipal', 'Guarda Municipal', 'active', 3],
            ['Carlos Mendes', 'Agente de trânsito', 'Mobilidade', 'off_duty', 4],
        ];
        foreach ($people as $index => [$name, $role, $agency, $status, $area]) {
            Agent::create(compact('name', 'role', 'agency', 'status') + ['location' => $location($area, .002 + $index * .0003)]);
        }
        // Four weeks of synthetic heartbeats make telemetry coverage explicit.
        // Centro receives a recent alert burst so the demo exposes the signal.
        for ($day = 0; $day < 28; $day++) {
            foreach ($devicesByArea as $area => $deviceIds) {
                TelemetryEvent::create([
                    'equipment_id' => $deviceIds[0], 'kind' => 'device_health',
                    'severity' => 'info', 'description' => 'Leitura periódica recebida',
                    'occurred_at' => now()->subDays($day)->subHours(2),
                ]);

                if ($area === 0 || ($area === 1 && $day % 2 === 0) || ($area === 4 && $day % 3 === 0)) {
                    TelemetryEvent::create([
                        'equipment_id' => $deviceIds[0], 'kind' => 'device_health',
                        'severity' => 'warning', 'description' => 'Oscilação no sinal do dispositivo',
                        'occurred_at' => now()->subDays($day)->subHours(3),
                    ]);
                }
            }
        }
        for ($index = 0; $index < 4; $index++) {
            TelemetryEvent::create([
                'equipment_id' => $devicesByArea[0][0], 'kind' => 'device_health',
                'severity' => 'critical', 'description' => 'Falha de comunicação detectada',
                'occurred_at' => now()->subMinutes(20 + $index * 15),
            ]);
        }
    }
}
