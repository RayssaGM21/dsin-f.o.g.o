<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\Equipment;
use App\Models\TelemetryEvent;
use Illuminate\Support\Carbon;

class OperationsService
{
    private const UNAVAILABLE = ['malfunction', 'maintenance', 'disabled', 'stolen'];

    public function dashboard(): array
    {
        $equipment = Equipment::all();
        $agents = Agent::all();
        $installed = $equipment->where('status', '!=', 'planned')->count();
        $operational = $equipment->where('status', 'operational')->count();
        $due = $equipment->filter(fn (Equipment $item) => $item->maintenance_priority === 'immediate' ||
            ($item->next_maintenance && $item->next_maintenance->lte(today()->addDays(7)))
        );
        $regions = [];
        foreach ($equipment as $item) {
            $name = $item->location['neighborhood'];
            $regions[$name] ??= ['name' => $name, 'equipment' => 0, 'operational' => 0, 'unavailable' => 0, 'agents_active' => 0];
            $regions[$name]['equipment']++;
            $regions[$name]['operational'] += (int) ($item->status === 'operational');
            $regions[$name]['unavailable'] += (int) in_array($item->status, self::UNAVAILABLE, true);
        }
        foreach ($agents as $agent) {
            $name = $agent->location['neighborhood'];
            $regions[$name] ??= ['name' => $name, 'equipment' => 0, 'operational' => 0, 'unavailable' => 0, 'agents_active' => 0];
            $regions[$name]['agents_active'] += (int) ($agent->status === 'active');
        }
        ksort($regions);

        return [
            'updated_at' => now()->toIso8601String(),
            'indicators' => [
                'equipment_total' => $equipment->count(),
                'operational' => $operational,
                'unavailable' => $equipment->whereIn('status', self::UNAVAILABLE)->count(),
                'availability_percent' => $installed ? round(100 * $operational / $installed, 1) : null,
                'agents_active' => $agents->where('status', 'active')->count(),
                'maintenance_due' => $due->count(),
            ],
            'regions' => array_values($regions),
            'alerts' => TelemetryEvent::with('equipment')->where('severity', 'critical')
                ->latest('occurred_at')->limit(10)->get()->map(fn ($event) => [
                    'id' => $event->id,
                    'description' => $event->description,
                    'occurred_at' => $event->occurred_at,
                    'serial_number' => $event->equipment->serial_number,
                    'neighborhood' => $event->equipment->location['neighborhood'],
                ]),
            'maintenance_due' => $due->values(),
        ];
    }

    public function forecast(): array
    {
        $groups = [];
        foreach (Equipment::all() as $item) {
            $name = $item->location['neighborhood'];
            $groups[$name] ??= ['weighted' => 0, 'alerts' => 0, 'events' => 0, 'unavailable' => 0, 'agents' => 0];
            $groups[$name]['unavailable'] += (int) in_array($item->status, self::UNAVAILABLE, true);
        }
        foreach (Agent::all() as $agent) {
            $name = $agent->location['neighborhood'];
            $groups[$name] ??= ['weighted' => 0, 'alerts' => 0, 'events' => 0, 'unavailable' => 0, 'agents' => 0];
            $groups[$name]['agents'] += (int) ($agent->status === 'active');
        }
        $events = TelemetryEvent::with('equipment')->where('occurred_at', '>=', now()->subDays(7))
            ->latest('occurred_at')->limit(5000)->get();
        foreach ($events as $event) {
            $name = $event->equipment->location['neighborhood'];
            $groups[$name]['events']++;
            $groups[$name]['alerts'] += (int) ($event->severity !== 'info');
            $groups[$name]['weighted'] += match ($event->severity) {
                'critical' => 3, 'warning' => 1, default => 0
            };
        }
        $regions = [];
        foreach ($groups as $name => $group) {
            $score = max(0, min(100, $group['weighted'] * 4 + $group['unavailable'] * 12 - $group['agents'] * 3));
            $level = $score >= 60 ? 'alto' : ($score >= 30 ? 'moderado' : 'baixo');
            $regions[] = [
                'neighborhood' => $name,
                'risk_index' => $score,
                'level' => $level,
                'expected_alerts_next_24h' => round($group['alerts'] / 7, 2),
                'events_7d' => $group['events'],
                'unavailable_equipment' => $group['unavailable'],
                'active_agents' => $group['agents'],
                'evidence' => "{$group['events']} eventos em 7 dias; {$group['unavailable']} equipamentos indisponíveis; {$group['agents']} agentes ativos.",
                'recommendation' => match ($level) {
                    'alto' => 'Priorizar inspeção e reforçar equipe nesta região.',
                    'moderado' => 'Revisar alertas recentes e planejar manutenção preventiva.',
                    default => 'Manter monitoramento e rotina de manutenção.',
                },
            ];
        }
        usort($regions, fn ($a, $b) => $b['risk_index'] <=> $a['risk_index']);

        return [
            'generated_at' => Carbon::now()->toIso8601String(),
            'method' => 'Média diária de alertas dos últimos 7 dias. Índice heurístico: 4 × severidade ponderada (crítico=3, aviso=1) + 12 × indisponíveis − 3 × agentes ativos, limitado a 0–100.',
            'limitations' => config('fogo.mode') === 'clean'
                ? 'Índice operacional, não é probabilidade nem previsão causal. Sem telemetria suficiente, a leitura de risco é preliminar.'
                : 'Índice operacional, não é probabilidade nem previsão causal. Dados de demonstração são sintéticos; amostras pequenas reduzem a confiabilidade.',
            'regions' => $regions,
        ];
    }
}
