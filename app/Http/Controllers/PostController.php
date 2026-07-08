<?php

namespace App\Http\Controllers;

use App\Feed\RecommendationEngine;
use App\Http\Controllers\Concerns\NotifiesMentions;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    use NotifiesMentions;

    public function index(Request $request, RecommendationEngine $engine): Response
    {
        $user = $request->user();
        $scope = $this->resolveScope($request, $user);

        $posts = $scope === 'for_you'
            ? $this->forYouFeed($request, $user, $engine)
            : $this->timelineFeed($request, $user, $scope);

        $posts->getCollection()->transform(fn (Post $post) => $this->markLiked($post));

        return Inertia::render('feed/index', [
            'posts' => $posts,
            'scope' => $scope,
        ])->withViewData(['seo' => [
            'title' => match ($scope) {
                'for_you' => 'For You',
                'following' => 'Following',
                default => 'Home',
            },
            'description' => 'See what larpers are posting right now.',
        ]]);
    }

    private function resolveScope(Request $request, ?User $user): string
    {
        if (! $user) {
            return 'global';
        }

        $requested = $request->string('scope')->value();

        return in_array($requested, ['for_you', 'following', 'global'], true)
            ? $requested
            : 'for_you';
    }

    private function timelineFeed(Request $request, ?User $user, string $scope): LengthAwarePaginator
    {
        $query = $this->baseFeedQuery($user)
            ->whereNull('parent_id')
            ->latest();

        if ($scope === 'following') {
            $query->whereIn('user_id', [...$user->following()->pluck('users.id')->all(), $user->id]);
        }

        return $query->paginate(20)->withQueryString();
    }

    private function forYouFeed(Request $request, User $user, RecommendationEngine $engine): LengthAwarePaginator
    {
        $rankedIds = $engine->rankedPostIds($user);

        $perPage = 20;
        $page = max(1, $request->integer('page', 1));
        $pageIds = $rankedIds->forPage($page, $perPage);

        $postsById = $this->baseFeedQuery($user)
            ->whereIn('id', $pageIds->all())
            ->get()
            ->keyBy('id');

        $ordered = $pageIds
            ->map(fn (int $id) => $postsById->get($id))
            ->filter()
            ->values();

        return new Paginator($ordered, $rankedIds->count(), $perPage, $page, [
            'path' => $request->url(),
            'query' => $request->query(),
        ]);
    }

    private function baseFeedQuery(?User $user)
    {
        $query = Post::query()
            ->with(['user', 'repostOf.user'])
            ->withCount(['likedBy as likes_count', 'replies', 'reposts']);

        if ($user) {
            $query->with(['likedBy' => fn ($q) => $q->where('users.id', $user->id)]);
        }

        return $query;
    }

    private function markLiked(Post $post): Post
    {
        $post->liked = $post->relationLoaded('likedBy') ? $post->likedBy->isNotEmpty() : false;
        unset($post->likedBy);

        return $post;
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
