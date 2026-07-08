<?php

namespace App\Notifications;

class UserPromotedToAdmin extends SocialNotification
{
    protected function type(): string
    {
        return 'admin';
    }
}
