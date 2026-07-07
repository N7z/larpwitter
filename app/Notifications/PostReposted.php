<?php

namespace App\Notifications;

class PostReposted extends SocialNotification
{
    protected function type(): string
    {
        return 'repost';
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            ...parent::toDatabase($notifiable),
            'is_quote' => filled($this->post?->body),
        ];
    }
}
