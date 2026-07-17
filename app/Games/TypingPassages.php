<?php

namespace App\Games;

use Illuminate\Support\Arr;

class TypingPassages
{
    /**
     * Passages are plain ASCII so per-character comparison is safe on both
     * the client and the server.
     *
     * @var array<int, string>
     */
    private const PASSAGES = [
        'The quick brown fox jumps over the lazy dog while the whole timeline watches and pretends not to care about the outcome.',
        'Somewhere between the first keystroke and the last, every typist discovers that speed means nothing without a little accuracy.',
        'Posting fast is easy, but typing fast under pressure with a rival watching your progress bar is a completely different sport.',
        'A wizard, a knight, and a bard walk into a tavern and immediately start arguing about who has the fastest fingers in the realm.',
        'Great duels are not won by the strongest hands but by the calmest minds, steady breathing, and a keyboard that does not betray you.',
        'The scroll of victory belongs to whoever finishes this sentence first, so stop reading ahead and start typing like your honor depends on it.',
        'Legends say the fastest typist in the land never looked at the keyboard, never missed a space, and never once blamed the lag.',
        'In the heat of battle a single typo can cost you the crown, so choose every character wisely and let your rival make the mistakes.',
        'Two rivals enter, one result gets posted to the feed, and the loser must live with the replies for the rest of eternity.',
        'Practice does not make perfect, but it does make you fast enough to humiliate your friends in public typing duels.',
    ];

    public static function random(): string
    {
        return Arr::random(self::PASSAGES);
    }
}
