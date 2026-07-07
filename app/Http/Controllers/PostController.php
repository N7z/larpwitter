<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(Request $request): Response
    {
        $scope = $request->string('scope')->value() === 'following' ? 'following' : 'global';
        $user = $request->user();

        $query = Post::query()
            ->whereNull('parent_id')
            ->with('user')
            ->withCount(['likedBy as likes_count', 'replies'])
            ->with(['likedBy' => fn ($q) => $q->where('users.id', $user->id)])
            ->latest();

        if ($scope === 'following') {
            $query->whereIn('user_id', [...$user->following()->pluck('users.id')->all(), $user->id]);
        }

        $posts = $query->paginate(20)->withQueryString();

        $posts->getCollection()->transform(function (Post $post) {
            $post->liked = $post->likedBy->isNotEmpty();
            unset($post->likedBy);

            return $post;
        });

        return Inertia::render('feed/index', [
            'posts' => $posts,
            'scope' => $scope,
        ]);
    }

    public function store(StorePostRequest $request): RedirectResponse
    {
        $request->user()->posts()->create([
            'body' => $request->body,
        ]);

        return redirect()->back();
    }

    public function show(Post $post): Response
    {
        $post->load('user');
        $post->likes_count = $post->likedBy()->count();
        $post->liked = $post->likedBy()->where('users.id', request()->user()->id)->exists();

        $replies = $post->replies()
            ->with('user')
            ->withCount(['likedBy as likes_count', 'replies'])
            ->with(['likedBy' => fn ($q) => $q->where('users.id', request()->user()->id)])
            ->get()
            ->each(function (Post $reply) {
                $reply->liked = $reply->likedBy->isNotEmpty();
                unset($reply->likedBy);
            });

        return Inertia::render('posts/show', [
            'post' => $post,
            'replies' => $replies,
        ]);
    }

    public function destroy(Post $post): RedirectResponse
    {
        Gate::authorize('delete', $post);

        $post->delete();

        return redirect()->back();
    }
}
