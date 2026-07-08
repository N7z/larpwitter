<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\UserPromotedToAdmin;
use App\Notifications\UserVerified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('q')->value();

        $users = User::query()
            ->withCount(['posts', 'followers', 'following'])
            ->when($search, fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('username', 'like', "%{$search}%")
                    ->orWhere('display_name', 'like', "%{$search}%");
            }))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'search' => $search,
        ])->withViewData(['seo' => ['title' => 'Admin · Users', 'noindex' => true]]);
    }

    public function toggleAdmin(Request $request, User $user): RedirectResponse
    {
        abort_if($user->id === $request->user()->id, 403, "You can't change your own admin status.");

        $user->is_admin = ! $user->is_admin;
        $user->save();

        if ($user->is_admin) {
            $user->notify(new UserPromotedToAdmin($request->user()));
        }

        return redirect()->back();
    }

    public function toggleVerified(Request $request, User $user): RedirectResponse
    {
        $user->is_verified = ! $user->is_verified;
        $user->save();

        if ($user->is_verified && $user->id !== $request->user()->id) {
            $user->notify(new UserVerified($request->user()));
        }

        return redirect()->back();
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->id === $request->user()->id, 403, "You can't delete your own account.");

        $user->delete();

        return redirect()->back();
    }
}
