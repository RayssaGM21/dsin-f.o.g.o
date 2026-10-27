<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_platform_or_operational_api(): void
    {
        $this->get('/')->assertOk();
        $this->get('/login')->assertOk();
        $this->get('/register')->assertOk();
        $this->get('/platform')->assertRedirect('/login');

        foreach (['equipment', 'equipment-types', 'postal-codes/01001000', 'agents', 'events', 'dashboard', 'forecast'] as $endpoint) {
            $this->getJson('/api/'.$endpoint)->assertUnauthorized();
        }
        $this->postJson('/api/equipment', [])->assertUnauthorized();
        $this->postJson('/api/agents', [])->assertUnauthorized();
        $this->postJson('/api/telemetry', [])->assertUnauthorized();
    }

    public function test_registration_creates_session_and_logout_closes_it(): void
    {
        $this->postJson('/register', [
            'name' => 'Rayssa Silva',
            'email' => ' RAYSSA@example.com ',
            'password' => 'UmaSenhaSegura2026',
            'password_confirmation' => 'UmaSenhaSegura2026',
        ])->assertCreated()->assertJsonPath('redirect', route('platform'));

        $this->assertDatabaseHas('users', ['email' => 'rayssa@example.com']);
        $this->get('/platform')->assertOk();
        $this->getJson('/api/dashboard')->assertOk();
        $this->postJson('/logout')->assertOk();
        $this->getJson('/api/dashboard')->assertUnauthorized();
    }

    public function test_login_validates_credentials_and_duplicate_registration(): void
    {
        User::factory()->create(['email' => 'user@example.com', 'password' => 'UmaSenhaSegura2026']);

        $this->postJson('/login', ['email' => 'user@example.com', 'password' => 'senha-incorreta'])
            ->assertUnprocessable();
        $this->postJson('/register', [
            'name' => 'Outra Pessoa', 'email' => 'USER@example.com',
            'password' => 'UmaSenhaSegura2026', 'password_confirmation' => 'UmaSenhaSegura2026',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->postJson('/login', ['email' => 'USER@example.com', 'password' => 'UmaSenhaSegura2026'])
            ->assertOk()->assertJsonPath('redirect', route('platform'));
        $this->getJson('/api/equipment')->assertOk();
    }
}
