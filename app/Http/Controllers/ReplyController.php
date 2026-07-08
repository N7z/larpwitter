<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\NotifiesMentions;
use App\Http\Requests\StorePostRequest;
use App\Models\Post;
use App\Notifications\PostReplied;
use Illuminate\Http\RedirectResponse;

class ReplyController extends Controller
{
    use NotifiesMentions;

    public function store(StorePostRequest $request, Post $post): RedirectResponse
    {
        $reply = $post->replies()->create([
            'user_id' => $request->user()->id,
            'body' => $request->body,
            'image_path' => $request->file('image')?->store('posts', 'public'),
        ]);

        if ($post->user_id !== $request->user()->id) {
            $post->user->notify(new PostReplied($request->user(), $post));
        }

        $this->notifyMentions($reply, [$post->user_id]);

        return redirect()->route('posts.show', $post);
    }
}
