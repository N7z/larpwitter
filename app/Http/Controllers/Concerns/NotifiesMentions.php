<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Post;
use App\Models\User;
use App\Notifications\UserMentioned;
use App\Support\Text;

trait NotifiesMentions
{
    /**
     * Notify users mentioned in a post's body, skipping the author and any
     * users that were already notified about this post through another channel.
     *
     * @param  array<int, int>  $excludeUserIds
     */
    protected function notifyMentions(Post $post, array $excludeUserIds = []): void
    {
        $usernames = Text::mentions($post->body);

        if (empty($usernames)) {
            return;
        }

        $excluded = array_merge([$post->user_id], $excludeUserIds);

        User::query()
            ->whereIn('username', $usernames)
            ->whereNotIn('id', $excluded)
            ->get()
            ->each(fn (User $user) => $user->notify(new UserMentioned($post->user, $post)));
    }
}
