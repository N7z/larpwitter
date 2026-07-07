<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRepostRequest;
use App\Models\Post;
use App\Notifications\PostReposted;
use Illuminate\Http\RedirectResponse;

class RepostController extends Controller
{
    public function store(StoreRepostRequest $request, Post $post): RedirectResponse
    {
        $original = $post->isRepost() ? $post->repostOf : $post;

        $repost = $request->user()->posts()->create([
            'repost_of_id' => $original->id,
            'body' => $request->body ?? '',
        ]);

        if ($original->user_id !== $request->user()->id) {
            $original->user->notify(new PostReposted($request->user(), $repost));
        }

        return redirect()->back();
    }
}
