<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class TypingRace extends Model
{
    /** Seconds between accepting a challenge and the race starting. */
    public const COUNTDOWN_SECONDS = 5;

    /** Seconds after the start before an unfinished race is force-finalized. */
    public const TIME_LIMIT_SECONDS = 120;

    /** Minutes a pending challenge stays open before expiring. */
    public const PENDING_EXPIRY_MINUTES = 10;

    protected $fillable = [
        'challenger_id',
        'opponent_id',
        'status',
        'passage',
        'starts_at',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'challenger_finished_at' => 'datetime',
            'opponent_finished_at' => 'datetime',
        ];
    }

    public function challenger(): BelongsTo
    {
        return $this->belongsTo(User::class, 'challenger_id');
    }

    public function opponent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opponent_id');
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'winner_id');
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function isParticipant(?User $user): bool
    {
        return $user !== null && in_array($user->id, [$this->challenger_id, $this->opponent_id], true);
    }

    /**
     * Which side of the race a user is on, or null for spectators.
     */
    public function sideFor(?User $user): ?string
    {
        return match (true) {
            $user === null => null,
            $user->id === $this->challenger_id => 'challenger',
            $user->id === $this->opponent_id => 'opponent',
            default => null,
        };
    }

    public function deadline(): ?Carbon
    {
        return $this->starts_at?->addSeconds(self::TIME_LIMIT_SECONDS);
    }

    public function isExpiredPending(): bool
    {
        return $this->status === 'pending'
            && $this->created_at->addMinutes(self::PENDING_EXPIRY_MINUTES)->isPast();
    }
}
