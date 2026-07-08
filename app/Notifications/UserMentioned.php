<?php

namespace App\Notifications;

class UserMentioned extends SocialNotification
{
    protected function type(): string
    {
        return 'mention';
    }
}
