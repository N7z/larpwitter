<?php

namespace App\Notifications;

class UserVerified extends SocialNotification
{
    protected function type(): string
    {
        return 'verified';
    }
}
