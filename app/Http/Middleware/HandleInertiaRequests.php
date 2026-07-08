<?php

namespace App\Http\Middleware;

use App\Models\Hashtag;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => fn () => $request->user()?->only(['id', 'username', 'display_name', 'avatar_url', 'is_admin', 'is_verified']),
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
            ],
            'unreadNotificationsCount' => fn () => $request->user()?->unreadNotifications()->count() ?? 0,
            'newUsers' => function () use ($request) {
                $authUser = $request->user();

                $users = User::query()
                    ->when($authUser, fn ($q) => $q->where('id', '!=', $authUser->id))
                    ->latest()
                    ->take(5)
                    ->get(['id', 'username', 'display_name', 'avatar_path', 'is_verified', 'is_admin']);

                $followingIds = $authUser ? $authUser->following()->pluck('users.id')->all() : [];

                return $users->map(fn (User $user) => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'display_name' => $user->display_name,
                    'avatar_url' => $user->avatar_url,
                    'is_verified' => $user->is_verified,
                    'is_admin' => $user->is_admin,
                    'is_following' => in_array($user->id, $followingIds),
                ]);
            },
            'trendingHashtags' => fn () => Hashtag::query()
                ->withCount(['posts as posts_count' => fn ($q) => $q->where('posts.created_at', '>=', now()->subDays(7))])
                ->orderByDesc('posts_count')
                ->take(10)
                ->get(['id', 'name'])
                ->filter(fn (Hashtag $hashtag) => $hashtag->posts_count > 0)
                ->take(5)
                ->values(),
        ];
    }
}
