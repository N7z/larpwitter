<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\UserFollowed;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FollowController extends Controller
{
    public function store(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->id === $user->id) {
            throw ValidationException::withMessages([
                'follow' => 'You cannot follow yourself.',
            ]);
        }

        $result = $request->user()->following()->syncWithoutDetaching([$user->id]);

        if (! empty($result['attached'])) {
            $user->notify(new UserFollowed($request->user()));
        }

        return redirect()->back();
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $request->user()->following()->detach($user->id);

        return redirect()->back();
    }
}
