<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\StreamedEvent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NotificationController extends Controller
{
    /**
     * How long a single SSE connection stays open. The browser's EventSource
     * reconnects automatically when it ends, so no worker is held forever.
     */
    private const STREAM_WINDOW_SECONDS = 50;

    /** Seconds between notification checks inside an open stream. */
    private const STREAM_TICK_SECONDS = 2;

    public function index(Request $request): Response
    {
        $user = $request->user();

        $notifications = $user->notifications()->paginate(20);
        $items = $this->mapNotifications($notifications->getCollection());

        $user->unreadNotifications()->update(['read_at' => now()]);

        return Inertia::render('notifications/index', [
            'notifications' => $items,
        ])->withViewData(['seo' => ['title' => 'Notifications', 'noindex' => true]]);
    }

    public function latest(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = $user->notifications()->take(15)->get();

        return response()->json([
            'notifications' => $this->mapNotifications($notifications),
        ]);
    }

    /**
     * Server-sent events stream of new notifications for the toast stack.
     */
    public function stream(Request $request): StreamedResponse
    {
        $user = $request->user();

        return response()->eventStream(
            fn () => $this->newNotificationEvents($user, now()->addSeconds(self::STREAM_WINDOW_SECONDS)),
        );
    }

    /**
     * Yield notifications created while the stream is open, plus periodic
     * pings so a closed connection is detected instead of idling.
     *
     * @return \Generator<int, StreamedEvent>
     */
    protected function newNotificationEvents(User $user, Carbon $deadline): \Generator
    {
        @set_time_limit(0); // sleep() counts as wall time on Windows

        $since = now();
        $flagSince = now()->getTimestampMs();

        while (now()->lt($deadline)) {
            // Each tick reads only the cache flag; the database is queried
            // solely when a notification actually arrived, so an idle site
            // lets a compute-billed database sleep.
            $flag = Cache::get(User::notificationFlagKey($user->id));

            if ($flag !== null && (int) $flag >= $flagSince) {
                $flagSince = (int) $flag + 1;

                // >= because created_at has second precision; the client dedupes by id.
                $fresh = $user->notifications()
                    ->where('created_at', '>=', $since)
                    ->get();

                if ($fresh->isNotEmpty()) {
                    $since = Carbon::parse($fresh->max('created_at'));
                }

                foreach ($this->mapNotifications($fresh) as $item) {
                    yield new StreamedEvent(event: 'notification', data: json_encode($item));
                }
            } else {
                yield new StreamedEvent(event: 'ping', data: '{}');
            }

            sleep(self::STREAM_TICK_SECONDS);
        }
    }

    /**
     * Normalize a notification collection into the shape the frontend expects.
     */
    protected function mapNotifications(Collection $notifications): array
    {
        $actors = User::query()
            ->whereIn('id', $notifications->pluck('data.actor_id')->filter()->unique())
            ->get()
            ->keyBy('id');

        $posts = Post::query()
            ->whereIn('id', $notifications->pluck('data.post_id')->filter()->unique())
            ->get()
            ->keyBy('id');

        return $notifications->map(function ($notification) use ($actors, $posts) {
            $actor = $actors->get($notification->data['actor_id']);
            $postId = $notification->data['post_id'] ?? null;

            return [
                'id' => $notification->id,
                'type' => $notification->data['type'],
                'actor' => $actor ? [
                    'id' => $actor->id,
                    'username' => $actor->username,
                    'display_name' => $actor->display_name,
                    'avatar_url' => $actor->avatar_url,
                ] : null,
                'post_id' => $postId && $posts->has($postId) ? $postId : null,
                'race_id' => $notification->data['race_id'] ?? null,
                'is_quote' => $notification->data['is_quote'] ?? false,
                'excerpt' => $notification->data['excerpt'] ?? null,
                'is_new' => $notification->read_at === null,
                'created_at' => $notification->created_at,
            ];
        })->values()->all();
    }
}
