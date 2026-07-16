<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetToken;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    public function create(string $token): Response
    {
        return Inertia::render('auth/reset-password', [
            'token' => $token,
            'valid' => PasswordResetToken::findValidByToken($token) !== null,
        ])->withViewData(['seo' => ['title' => 'Reset password', 'noindex' => true]]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $resetToken = PasswordResetToken::findValidByToken($request->string('token')->value());

        abort_if($resetToken === null, 419, 'This password reset link is invalid or has expired.');

        $user = $resetToken->user;
        $user->password = $request->string('password')->value();
        $user->save();

        $resetToken->delete();

        return redirect()->route('login')->with('status', 'Your password has been reset. You can now log in.');
    }
}
