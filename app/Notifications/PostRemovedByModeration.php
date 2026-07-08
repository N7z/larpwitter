<?php

namespace App\Notifications;

use App\Models\User;

class PostRemovedByModeration extends SocialNotification
{
    public function __construct(User $actor, protected string $excerpt)
    {
        parent::__construct($actor);
    }

    protected function type(): string
    {
        return 'post_removed';
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            ...parent::toDatabase($notifiable),
            'excerpt' => $this->excerpt,
        ];
    }
}
