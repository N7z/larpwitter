<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function show(Request $request, User $user): Response
    {
        $authUser = $request->user();
        $tab = $request->string('tab')->value() === 'replies' ? 'replies' : 'posts';

        $query = $user->posts()
            ->with(['user', 'repostOf.user'])
            ->withCount(['likedBy as likes_count', 'replies', 'reposts']);

        if ($authUser) {
            $query->with(['likedBy' => fn ($q) => $q->where('users.id', $authUser->id)]);
        }

        if ($tab === 'replies') {
            $query->whereNotNull('parent_id')->with('parent.user');
        } else {
            $query->whereNull('parent_id');
        }

        $posts = $query->latest()->get()->each(function (Post $post) {
            $post->liked = $post->relationLoaded('likedBy') ? $post->likedBy->isNotEmpty() : false;
            unset($post->likedBy);
        });

        return Inertia::render('profile/show', [
            'profileUser' => $user->only(['id', 'username', 'display_name', 'avatar_url', 'bio']),
            'postsCount' => $user->posts()->whereNull('parent_id')->count(),
            'repliesCount' => $user->posts()->whereNotNull('parent_id')->count(),
            'followersCount' => $user->followers()->count(),
            'followingCount' => $user->following()->count(),
            'isFollowing' => $authUser && $authUser->id !== $user->id ? $authUser->isFollowing($user) : null,
            'isOwnProfile' => $authUser?->id === $user->id,
            'tab' => $tab,
            'posts' => $posts,
        ]);
    }
}
