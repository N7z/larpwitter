<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function store(Request $request, Post $post): RedirectResponse
    {
        $request->user()->likedPosts()->syncWithoutDetaching([$post->id]);

        return redirect()->back();
    }

    public function destroy(Request $request, Post $post): RedirectResponse
    {
        $request->user()->likedPosts()->detach($post->id);

        return redirect()->back();
    }
}
