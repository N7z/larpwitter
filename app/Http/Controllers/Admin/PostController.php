<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Notifications\PostRemovedByModeration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('q')->value();

        $posts = Post::query()
            ->with(['user'])
            ->withCount(['likedBy as likes_count', 'replies', 'reposts'])
            ->when($search, fn ($query) => $query->where('body', 'like', "%{$search}%"))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/posts/index', [
            'posts' => $posts,
            'search' => $search,
        ]);
    }

    public function destroy(Request $request, Post $post): RedirectResponse
    {
        Gate::authorize('delete', $post);

        $owner = $post->user;
        $excerpt = filled($post->body) ? Str::limit($post->body, 80) : 'a post';

        $post->delete();

        if ($owner->id !== $request->user()->id) {
            $owner->notify(new PostRemovedByModeration($request->user(), $excerpt));
        }

        return redirect()->back();
    }
}
