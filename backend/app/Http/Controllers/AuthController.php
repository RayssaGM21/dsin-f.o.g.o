<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $input = $request->all();
        $input['email'] = Str::lower(trim((string) ($input['email'] ?? '')));

        $validated = Validator::make($input, [
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'email' => ['required', 'email', 'max:254', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(12)->letters()->numbers()],
        ], [
            'name.required' => 'Informe seu nome.',
            'name.min' => 'O nome deve ter pelo menos 2 caracteres.',
            'email.required' => 'Informe seu e-mail.',
            'email.email' => 'Informe um e-mail válido.',
            'email.unique' => 'Este e-mail já está cadastrado.',
            'password.required' => 'Crie uma senha.',
            'password.min' => 'A senha deve ter pelo menos 12 caracteres.',
            'password.letters' => 'A senha deve conter letras.',
            'password.numbers' => 'A senha deve conter números.',
            'password.confirmed' => 'As senhas não coincidem.',
        ])->validate();

        $user = User::create($validated);
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['redirect' => route('platform')], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'Informe seu e-mail.',
            'email.email' => 'Informe um e-mail válido.',
            'password.required' => 'Informe sua senha.',
        ]);
        $validated['email'] = Str::lower(trim($validated['email']));

        if (! Auth::attempt($validated)) {
            return response()->json(['message' => 'E-mail ou senha inválidos.'], 422);
        }

        $request->session()->regenerate();

        return response()->json(['redirect' => route('platform')]);
    }

    public function logout(Request $request): JsonResponse|RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $request->expectsJson()
            ? response()->json(['redirect' => route('home')])
            : redirect()->route('home');
    }
}
