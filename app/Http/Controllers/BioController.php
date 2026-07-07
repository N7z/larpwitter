<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BioController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'bio' => ['nullable', 'string', 'max:160'],
        ]);

        $request->user()->update([
            'bio' => $validated['bio'] ?: null,
        ]);

        return redirect()->back();
    }
}
