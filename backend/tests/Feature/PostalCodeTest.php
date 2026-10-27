<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PostalCodeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
    }

    public function test_lookup_returns_address_and_optional_coordinates_without_repeating_provider_call(): void
    {
        Http::fake(['https://brasilapi.com.br/api/cep/v2/01001000' => Http::response([
            'cep' => '01001000', 'street' => 'Praça da Sé', 'neighborhood' => 'Sé',
            'city' => 'São Paulo', 'state' => 'SP',
            'location' => ['coordinates' => ['latitude' => '-23.5501', 'longitude' => '-46.6340']],
        ])]);

        $this->getJson('/api/postal-codes/01001000')->assertOk()
            ->assertJsonPath('postal_code', '01001-000')
            ->assertJsonPath('street', 'Praça da Sé')
            ->assertJsonPath('city', 'São Paulo')
            ->assertJsonPath('latitude', -23.5501);
        $this->getJson('/api/postal-codes/01001000')->assertOk();
        Http::assertSentCount(1);
    }

    public function test_invalid_unknown_and_unavailable_postal_codes_return_clear_statuses(): void
    {
        $this->getJson('/api/postal-codes/123')->assertUnprocessable();

        Http::fake([
            'https://brasilapi.com.br/api/cep/v2/99999999' => Http::response([], 404),
            'https://brasilapi.com.br/api/cep/v2/88888888' => Http::response([], 500),
        ]);
        $this->getJson('/api/postal-codes/99999999')->assertNotFound();
        $this->getJson('/api/postal-codes/88888888')->assertServiceUnavailable();
    }
}
