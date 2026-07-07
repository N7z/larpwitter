<?php

namespace App\Notifications;

class PostLiked extends SocialNotification
{
    protected function type(): string
    {
        return 'like';
    }
}
