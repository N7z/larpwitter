<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DisplayNameController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'display_name' => ['required', 'string', 'max:50'],
        ]);

        $request->user()->update([
            'display_name' => $validated['display_name'],
        ]);

        return redirect()->back();
    }
}
