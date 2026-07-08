<?php

namespace App\Http\Controllers;

use App\Models\Hashtag;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HashtagController extends Controller
{
    public function show(Request $request, Hashtag $hashtag): Response
    {
        $user = $request->user();

        $query = $hashtag->posts()
            ->with(['user', 'repostOf.user', 'parent.user'])
            ->withCount(['likedBy as likes_count', 'replies', 'reposts'])
            ->latest();

        if ($user) {
            $query->with(['likedBy' => fn ($q) => $q->where('users.id', $user->id)]);
        }

        $posts = $query->paginate(20)->withQueryString();

        $posts->getCollection()->transform(function (Post $post) {
            $post->liked = $post->relationLoaded('likedBy') ? $post->likedBy->isNotEmpty() : false;
            unset($post->likedBy);

            return $post;
        });

        return Inertia::render('hashtags/show', [
            'hashtag' => $hashtag->name,
            'posts' => $posts,
        ])->withViewData(['seo' => [
            'title' => "#{$hashtag->name}",
            'description' => "Browse posts tagged #{$hashtag->name} on Larpwitter.",
        ]]);
    }
}
