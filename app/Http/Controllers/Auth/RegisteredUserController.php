<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    public function store(RegisterRequest $request)
    {
        $user = User::create([
            'username' => $request->username,
            'display_name' => $request->display_name,
            'password' => $request->password,
        ]);

        Auth::login($user);

        return redirect()->route('feed');
    }
}
