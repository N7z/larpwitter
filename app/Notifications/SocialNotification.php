<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\User;
use Illuminate\Notifications\Notification;

abstract class SocialNotification extends Notification
{
    public function __construct(public User $actor, public ?Post $post = null) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => $this->type(),
            'actor_id' => $this->actor->id,
            'post_id' => $this->post?->id,
        ];
    }

    abstract protected function type(): string;
}
