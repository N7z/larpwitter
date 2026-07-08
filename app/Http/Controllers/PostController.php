<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\NotifiesMentions;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    use NotifiesMentions;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $scope = $user && $request->string('scope')->value() === 'following' ? 'following' : 'global';

        $query = Post::query()
            ->whereNull('parent_id')
            ->with(['user', 'repostOf.user'])
            ->withCount(['likedBy as likes_count', 'replies', 'reposts'])
            ->latest();

        if ($user) {
            $query->with(['likedBy' => fn ($q) => $q->where('users.id', $user->id)]);
        }

        if ($scope === 'following') {
            $query->whereIn('user_id', [...$user->following()->pluck('users.id')->all(), $user->id]);
        }

        $posts = $query->paginate(20)->withQueryString();

        $posts->getCollection()->transform(function (Post $post) {
            $post->liked = $post->relationLoaded('likedBy') ? $post->likedBy->isNotEmpty() : false;
            unset($post->likedBy);

            return $post;
        });

        return Inertia::render('feed/index', [
            'posts' => $posts,
            'scope' => $scope,
        ])->withViewData(['seo' => [
            'title' => $scope === 'following' ? 'Following' : 'Home',
            'description' => 'See what larpers are posting right now.',
        ]]);
    }

    public function store(StorePostRequest $request): RedirectResponse
    {
        $post = $request->user()->posts()->create([
            'body' => $request->body,
            'image_path' => $request->file('image')?->store('posts', 'public'),
        ]);

        $this->notifyMentions($post);

        return redirect()->back();
    }

    public function show(Post $post): Response
    {
        $post->load(['user', 'repostOf.user', 'parent.user']);
        $userId = request()->user()?->id;

        $post->likes_count = $post->likedBy()->count();
        $post->reposts_count = $post->reposts()->count();
        $post->liked = $userId ? $post->likedBy()->where('users.id', $userId)->exists() : false;

        $repliesQuery = $post->replies()
            ->with('user')
            ->withCount(['likedBy as likes_count', 'replies', 'reposts']);

        if ($userId) {
            $repliesQuery->with(['likedBy' => fn ($q) => $q->where('users.id', $userId)]);
        }

        $replies = $repliesQuery->get()
            ->each(function (Post $reply) {
                $reply->liked = $reply->relationLoaded('likedBy') ? $reply->likedBy->isNotEmpty() : false;
                unset($reply->likedBy);
            });

        return Inertia::render('posts/show', [
            'post' => $post,
            'replies' => $replies,
        ])->withViewData(['seo' => [
            'title' => "{$post->user->display_name} (@{$post->user->username})",
            'description' => Str::limit($post->body, 160),
            'image' => $post->image_url,
            'card' => $post->image_url ? 'summary_large_image' : 'summary',
        ]]);
    }

    public function update(UpdatePostRequest $request, Post $post): RedirectResponse
    {
        Gate::authorize('update', $post);

        $post->update(['body' => $request->body]);

        return redirect()->back();
    }

    public function destroy(Post $post): RedirectResponse
    {
        Gate::authorize('delete', $post);

        $redirectTo = $post->isReply() ? route('posts.show', $post->parent_id) : route('feed');

        $post->delete();

        return redirect($redirectTo);
    }
}
