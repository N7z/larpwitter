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

        $posts = $user->posts()
            ->whereNull('parent_id')
            ->with('user')
            ->withCount(['likedBy as likes_count', 'replies'])
            ->with(['likedBy' => fn ($q) => $q->where('users.id', $authUser->id)])
            ->latest()
            ->get()
            ->each(function (Post $post) {
                $post->liked = $post->likedBy->isNotEmpty();
                unset($post->likedBy);
            });

        return Inertia::render('profile/show', [
            'profileUser' => $user->only(['id', 'username', 'display_name', 'avatar_url']),
            'postsCount' => $posts->count(),
            'followersCount' => $user->followers()->count(),
            'followingCount' => $user->following()->count(),
            'isFollowing' => $authUser->id === $user->id ? null : $authUser->isFollowing($user),
            'isOwnProfile' => $authUser->id === $user->id,
            'posts' => $posts,
        ]);
    }
}
