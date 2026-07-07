<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Models\Post;
use App\Notifications\PostReplied;
use Illuminate\Http\RedirectResponse;

class ReplyController extends Controller
{
    public function store(StorePostRequest $request, Post $post): RedirectResponse
    {
        $post->replies()->create([
            'user_id' => $request->user()->id,
            'body' => $request->body,
            'image_path' => $request->file('image')?->store('posts', 'public'),
        ]);

        if ($post->user_id !== $request->user()->id) {
            $post->user->notify(new PostReplied($request->user(), $post));
        }

        return redirect()->route('posts.show', $post);
    }
}
