<?php

namespace App\Notifications;

class UserFollowed extends SocialNotification
{
    protected function type(): string
    {
        return 'follow';
    }
}
