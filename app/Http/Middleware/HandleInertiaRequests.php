<?php

namespace App\Http\Middleware;

use App\Models\Hashtag;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
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
            'unreadNotificationsCount' => function () use ($request) {
                $authUser = $request->user();

                if (! $authUser) {
                    return 0;
                }

                return Cache::remember(
                    "unread-notifications-count:{$authUser->id}",
                    now()->addSeconds(30),
                    fn () => $authUser->unreadNotifications()->count()
                );
            },
            'newUsers' => function () use ($request) {
                $authUser = $request->user();

                return Cache::remember(
                    'new-users:'.($authUser?->id ?? 'guest'),
                    now()->addSeconds(30),
                    function () use ($authUser) {
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
                    }
                );
            },
            'trendingHashtags' => fn () => $this->trendingHashtags(),
        ];
    }

    /**
     * Trending ranks hashtags by a recency-weighted score, not a flat count, so
     * yesterday's burst decays and fresh chatter rises. Cached since it runs on
     * every request.
     */
    private function trendingHashtags(): Collection
    {
        return Cache::remember('trending-hashtags', now()->addMinutes(10), function () {
            $halfLifeHours = 12;

            $rows = DB::table('hashtag_post')
                ->join('posts', 'posts.id', '=', 'hashtag_post.post_id')
                ->where('posts.created_at', '>=', now()->subDays(3))
                ->get(['hashtag_post.hashtag_id', 'posts.created_at']);

            $scores = [];
            $counts = [];

            foreach ($rows as $row) {
                $id = (int) $row->hashtag_id;
                $ageHours = abs(Carbon::parse($row->created_at)->diffInHours(now()));
                $scores[$id] = ($scores[$id] ?? 0) + pow(0.5, $ageHours / $halfLifeHours);
                $counts[$id] = ($counts[$id] ?? 0) + 1;
            }

            arsort($scores);
            $topIds = array_slice(array_keys($scores), 0, 5);

            if ($topIds === []) {
                return collect();
            }

            $names = Hashtag::whereIn('id', $topIds)->pluck('name', 'id');

            return collect($topIds)
                ->filter(fn (int $id) => isset($names[$id]))
                ->map(fn (int $id) => [
                    'id' => $id,
                    'name' => $names[$id],
                    'posts_count' => $counts[$id],
                ])
                ->values();
        });
    }
}
