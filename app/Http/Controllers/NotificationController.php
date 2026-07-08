<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
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
                'is_quote' => $notification->data['is_quote'] ?? false,
                'excerpt' => $notification->data['excerpt'] ?? null,
                'is_new' => $notification->read_at === null,
                'created_at' => $notification->created_at,
            ];
        })->values()->all();
    }
}
