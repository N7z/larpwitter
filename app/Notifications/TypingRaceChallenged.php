<?php

namespace App\Notifications;

use App\Models\TypingRace;
use App\Models\User;
use Illuminate\Notifications\Notification;

class TypingRaceChallenged extends Notification
{
    public function __construct(public User $actor, public TypingRace $race) {}

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
            'type' => 'typing_race',
            'actor_id' => $this->actor->id,
            'post_id' => null,
            'race_id' => $this->race->id,
        ];
    }
}
