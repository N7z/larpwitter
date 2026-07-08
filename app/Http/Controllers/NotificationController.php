<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $notifications = $user->notifications()->paginate(20);
        $collection = $notifications->getCollection();

        $actors = User::query()
            ->whereIn('id', $collection->pluck('data.actor_id')->filter()->unique())
            ->get()
            ->keyBy('id');

        $posts = Post::query()
            ->whereIn('id', $collection->pluck('data.post_id')->filter()->unique())
            ->get()
            ->keyBy('id');

        $items = $collection->map(function ($notification) use ($actors, $posts) {
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
        });

        $user->unreadNotifications()->update(['read_at' => now()]);

        return Inertia::render('notifications/index', [
            'notifications' => $items->values(),
        ])->withViewData(['seo' => ['title' => 'Notifications', 'noindex' => true]]);
    }
}
