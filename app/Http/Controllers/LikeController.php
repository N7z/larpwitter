<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Notifications\PostLiked;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function store(Request $request, Post $post): RedirectResponse
    {
        $result = $request->user()->likedPosts()->syncWithoutDetaching([$post->id]);

        if (! empty($result['attached']) && $post->user_id !== $request->user()->id) {
            $post->user->notify(new PostLiked($request->user(), $post));
        }

        return redirect()->back();
    }

    public function destroy(Request $request, Post $post): RedirectResponse
    {
        $request->user()->likedPosts()->detach($post->id);

        return redirect()->back();
    }
}
