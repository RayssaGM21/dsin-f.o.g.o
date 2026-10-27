<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OperationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
    }

    public function test_empty_installation_reports_no_resources_or_risk(): void
    {
        config()->set('fogo.mode', 'clean');

        $this->getJson('/api/dashboard')->assertOk()
            ->assertJsonPath('indicators.equipment_total', 0)
            ->assertJsonPath('indicators.availability_percent', null)
            ->assertJsonPath('indicators.agents_active', 0)
            ->assertJsonCount(0, 'regions')
            ->assertJsonCount(0, 'alerts');

        $this->getJson('/api/forecast')->assertOk()
            ->assertJsonCount(0, 'regions')
            ->assertJsonPath('limitations', 'Índice operacional, não é probabilidade nem previsão causal. Sem telemetria suficiente, a leitura de risco é preliminar.');
    }

    private function equipment(string $serial = 'TEST-001'): array
    {
        return [
            'type' => 'Radar de velocidade', 'serial_number' => $serial,
            'brand' => 'Civitas', 'model' => 'Urban', 'agency' => 'Mobilidade',
            'status' => 'operational', 'maintenance_priority' => 'none',
            'next_maintenance' => null, 'attributes' => ['speed_limit_kmh' => 60],
            'location' => [
                'postal_code' => '15000-000', 'neighborhood' => 'Centro',
                'city' => 'São José do Rio Preto', 'state' => 'SP',
                'street' => 'Av. Central', 'reference' => 'nº 181',
                'latitude' => -20.8115, 'longitude' => -49.3758,
            ],
        ];
    }

    public function test_inventory_validation_and_filters(): void
    {
        $this->getJson('/api/equipment-types')->assertOk()
            ->assertJsonFragment(['Radar de velocidade']);
        $created = $this->postJson('/api/equipment', $this->equipment())->assertCreated();
        $this->postJson('/api/equipment', $this->equipment())->assertUnprocessable()
            ->assertJsonValidationErrors('serial_number');
        $invalid = $this->equipment('TEST-002');
        $invalid['location']['latitude'] = 100;
        $this->postJson('/api/equipment', $invalid)->assertUnprocessable()
            ->assertJsonValidationErrors('location.latitude');
        $unknownType = $this->equipment('TEST-003');
        $unknownType['type'] = 'Radar qualquer';
        $this->postJson('/api/equipment', $unknownType)->assertUnprocessable()
            ->assertJsonValidationErrors('type');
        $this->getJson('/api/equipment?neighborhood=Centro')->assertOk()->assertJsonCount(1);
        $this->getJson('/api/equipment?neighborhood=Boa%20Vista')->assertOk()->assertJsonCount(0);
        $this->deleteJson('/api/equipment/'.$created->json('id'))->assertNoContent();
        $this->getJson('/api/equipment')->assertOk()->assertJsonCount(0);
    }

    public function test_equipment_accepts_empty_optional_attributes(): void
    {
        $equipment = $this->equipment();
        $equipment['attributes'] = [];

        $this->postJson('/api/equipment', $equipment)->assertCreated()
            ->assertJsonPath('attributes', []);
    }

    public function test_telemetry_changes_status_and_dashboard_forecast(): void
    {
        $id = $this->postJson('/api/equipment', $this->equipment())->assertCreated()->json('id');
        $this->postJson('/api/telemetry', [
            'equipment_id' => $id, 'kind' => 'device_health',
            'severity' => 'critical', 'description' => 'Falha detectada',
            'status' => 'malfunction',
        ])->assertCreated();
        $this->getJson("/api/equipment/{$id}")->assertOk()
            ->assertJsonPath('status', 'malfunction')
            ->assertJsonPath('maintenance_priority', 'immediate');
        $this->getJson('/api/dashboard')->assertOk()
            ->assertJsonPath('indicators.unavailable', 1)
            ->assertJsonCount(1, 'alerts');
        $this->getJson('/api/forecast')->assertOk()
            ->assertJsonPath('regions.0.neighborhood', 'Centro')
            ->assertJsonPath('regions.0.risk_index', 24);
    }

    public function test_agent_lifecycle(): void
    {
        $payload = [
            'name' => 'Maria Costa', 'role' => 'Agente de trânsito',
            'agency' => 'Mobilidade', 'status' => 'active',
            'location' => $this->equipment()['location'],
        ];
        $id = $this->postJson('/api/agents', $payload)->assertCreated()->json('id');
        $this->getJson('/api/dashboard')->assertJsonPath('indicators.agents_active', 1);
        $this->putJson("/api/agents/{$id}", [...$payload, 'status' => 'available'])
            ->assertOk()->assertJsonPath('status', 'available');
        $this->deleteJson("/api/agents/{$id}")->assertNoContent();
    }
}
