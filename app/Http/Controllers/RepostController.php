<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRepostRequest;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;

class RepostController extends Controller
{
    public function store(StoreRepostRequest $request, Post $post): RedirectResponse
    {
        $original = $post->isRepost() ? $post->repostOf : $post;

        $request->user()->posts()->create([
            'repost_of_id' => $original->id,
            'body' => $request->body ?? '',
        ]);

        return redirect()->back();
    }
}
