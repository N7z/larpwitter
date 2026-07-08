<?php

namespace App\Support;

class Text
{
    /**
     * Extract unique, lowercased @mention usernames from a body.
     *
     * @return array<int, string>
     */
    public static function mentions(?string $body): array
    {
        return self::extract('/@([a-z0-9_]+(?:\.[a-z0-9_]+)*)/i', $body);
    }

    /**
     * Extract unique, lowercased #hashtag names from a body.
     *
     * @return array<int, string>
     */
    public static function hashtags(?string $body): array
    {
        return self::extract('/#([\p{L}\p{N}_]+)/u', $body);
    }

    /**
     * @return array<int, string>
     */
    private static function extract(string $pattern, ?string $body): array
    {
        if (! $body) {
            return [];
        }

        preg_match_all($pattern, $body, $matches);

        return array_values(array_unique(array_map(fn (string $match) => mb_strtolower($match, 'UTF-8'), $matches[1])));
    }
}
