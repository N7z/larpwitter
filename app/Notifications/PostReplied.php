<?php

namespace App\Notifications;

class PostReplied extends SocialNotification
{
    protected function type(): string
    {
        return 'reply';
    }
}
