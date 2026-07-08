<?php

namespace App\Feed;

use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Ranks recent posts for a user's "For You" feed.
 *
 * There is no ML infra here. We pull a bounded pool of recent posts, build a
 * lightweight interest profile from the things the user has liked, authored and
 * followed, then score every candidate on a handful of explainable signals.
 */
class RecommendationEngine
{
    private const CANDIDATE_WINDOW_DAYS = 14;

    private const CANDIDATE_LIMIT = 500;

    private const RECENCY_HALF_LIFE_HOURS = 18;

    private const CACHE_TTL_SECONDS = 300;

    private const W_ENGAGEMENT = 1.0;

    private const W_RECENCY = 2.5;

    private const W_AUTHOR = 2.0;

    private const W_HASHTAG = 1.5;

    private const W_SOCIAL = 1.8;

    private const W_VERIFIED = 0.3;

    private const AUTHOR_DIVERSITY_PENALTY = 0.6;

    /**
     * Ordered post IDs, best first. Cached briefly so pagination is stable and
     * we don't re-score on every page hit.
     *
     * @return Collection<int, int>
     */
    public function rankedPostIds(User $user): Collection
    {
        return Cache::remember(
            "for-you:{$user->id}",
            self::CACHE_TTL_SECONDS,
            fn () => $this->computeRanking($user),
        );
    }

    public function forget(User $user): void
    {
        Cache::forget("for-you:{$user->id}");
    }

    /**
     * @return Collection<int, int>
     */
    private function computeRanking(User $user): Collection
    {
        $candidates = $this->candidates($user);

        if ($candidates->isEmpty()) {
            return collect();
        }

        $profile = $this->interestProfile($user, $candidates);

        $scored = $candidates
            ->each(fn (Post $post) => $post->setAttribute('score', $this->score($post, $profile)))
            ->sortByDesc('score')
            ->values();

        return $this->diversify($scored)->pluck('id')->values();
    }

    /**
     * Recent, top-level posts the user hasn't already liked. The user's own
     * posts stay in the pool so a fresh post shows up in their For You.
     *
     * @return Collection<int, Post>
     */
    private function candidates(User $user): Collection
    {
        return Post::query()
            ->whereNull('parent_id')
            ->where('created_at', '>=', now()->subDays(self::CANDIDATE_WINDOW_DAYS))
            ->whereNotExists(function ($q) use ($user) {
                $q->select(DB::raw(1))
                    ->from('likes')
                    ->whereColumn('likes.post_id', 'posts.id')
                    ->where('likes.user_id', $user->id);
            })
            ->select('id', 'user_id', 'created_at')
            ->withCount(['likedBy as likes_count', 'replies', 'reposts'])
            ->latest()
            ->limit(self::CANDIDATE_LIMIT)
            ->get();
    }

    /**
     * @param  Collection<int, Post>  $candidates
     * @return array{self: int, followed: array<int, bool>, likedAuthors: array<int, bool>, hashtagWeights: array<int, float>, postHashtags: array<int, list<int>>, social: array<int, int>, verified: array<int, bool>}
     */
    private function interestProfile(User $user, Collection $candidates): array
    {
        $candidateIds = $candidates->pluck('id');
        $authorIds = $candidates->pluck('user_id')->unique();

        $followedIds = $user->following()->pluck('users.id');

        $likedPostIds = DB::table('likes')->where('user_id', $user->id)->pluck('post_id');
        $authoredPostIds = Post::where('user_id', $user->id)->pluck('id');
        $engagedPostIds = $likedPostIds->merge($authoredPostIds)->unique();

        $likedAuthorIds = Post::whereIn('id', $likedPostIds)->pluck('user_id')->unique();

        $hashtagCounts = DB::table('hashtag_post')
            ->whereIn('post_id', $engagedPostIds)
            ->select('hashtag_id', DB::raw('count(*) as c'))
            ->groupBy('hashtag_id')
            ->pluck('c', 'hashtag_id');

        $maxHashtagCount = max(1, (int) $hashtagCounts->max());
        $hashtagWeights = $hashtagCounts
            ->mapWithKeys(fn ($count, $id) => [(int) $id => $count / $maxHashtagCount])
            ->all();

        $postHashtags = DB::table('hashtag_post')
            ->whereIn('post_id', $candidateIds)
            ->get()
            ->groupBy('post_id')
            ->map(fn ($rows) => $rows->pluck('hashtag_id')->map(fn ($id) => (int) $id)->all())
            ->all();

        $social = [];
        if ($followedIds->isNotEmpty()) {
            $social = DB::table('likes')
                ->whereIn('post_id', $candidateIds)
                ->whereIn('user_id', $followedIds)
                ->select('post_id', DB::raw('count(*) as c'))
                ->groupBy('post_id')
                ->pluck('c', 'post_id')
                ->mapWithKeys(fn ($count, $id) => [(int) $id => (int) $count])
                ->all();
        }

        $verified = DB::table('users')
            ->whereIn('id', $authorIds)
            ->pluck('is_verified', 'id')
            ->mapWithKeys(fn ($value, $id) => [(int) $id => (int) $value > 0])
            ->all();

        return [
            'self' => $user->id,
            'followed' => $followedIds->mapWithKeys(fn ($id) => [(int) $id => true])->all(),
            'likedAuthors' => $likedAuthorIds->mapWithKeys(fn ($id) => [(int) $id => true])->all(),
            'hashtagWeights' => $hashtagWeights,
            'postHashtags' => $postHashtags,
            'social' => $social,
            'verified' => $verified,
        ];
    }

    /**
     * @param  array{self: int, followed: array<int, bool>, likedAuthors: array<int, bool>, hashtagWeights: array<int, float>, postHashtags: array<int, list<int>>, social: array<int, int>, verified: array<int, bool>}  $profile
     */
    private function score(Post $post, array $profile): float
    {
        $engagement = log(1 + 3 * $post->likes_count + 4 * $post->reposts_count + 2 * $post->replies_count);

        $ageHours = abs($post->created_at->diffInHours(now()));
        $recency = pow(0.5, $ageHours / self::RECENCY_HALF_LIFE_HOURS);

        $author = match (true) {
            $post->user_id === $profile['self'] => 1.0,
            isset($profile['followed'][$post->user_id]) => 1.0,
            isset($profile['likedAuthors'][$post->user_id]) => 0.5,
            default => 0.0,
        };

        $hashtag = 0.0;
        foreach ($profile['postHashtags'][$post->id] ?? [] as $hashtagId) {
            $hashtag += $profile['hashtagWeights'][$hashtagId] ?? 0.0;
        }
        $hashtag = min($hashtag, 1.5);

        $social = log(1 + ($profile['social'][$post->id] ?? 0));

        $verified = ($profile['verified'][$post->user_id] ?? false) ? 1.0 : 0.0;

        return self::W_ENGAGEMENT * $engagement
            + self::W_RECENCY * $recency
            + self::W_AUTHOR * $author
            + self::W_HASHTAG * $hashtag
            + self::W_SOCIAL * $social
            + self::W_VERIFIED * $verified;
    }

    /**
     * Demote repeated authors so a single prolific larper can't own the feed.
     *
     * @param  Collection<int, Post>  $scored
     * @return Collection<int, Post>
     */
    private function diversify(Collection $scored): Collection
    {
        $seen = [];

        return $scored
            ->each(function (Post $post) use (&$seen) {
                $times = $seen[$post->user_id] ?? 0;
                $post->setAttribute('score', $post->score - $times * self::AUTHOR_DIVERSITY_PENALTY);
                $seen[$post->user_id] = $times + 1;
            })
            ->sortByDesc('score')
            ->values();
    }
}
