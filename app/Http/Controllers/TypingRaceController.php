<?php

namespace App\Http\Controllers;

use App\Games\TypingPassages;
use App\Models\TypingRace;
use App\Models\User;
use App\Notifications\TypingRaceChallenged;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TypingRaceController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'opponent' => ['required', 'string', 'exists:users,username'],
        ]);

        $opponent = User::query()->where('username', $validated['opponent'])->firstOrFail();

        abort_if($opponent->id === $request->user()->id, 422, 'You cannot race against yourself.');

        $race = TypingRace::create([
            'challenger_id' => $request->user()->id,
            'opponent_id' => $opponent->id,
            'passage' => TypingPassages::random(),
        ]);

        $opponent->notify(new TypingRaceChallenged($request->user(), $race));

        return redirect()->route('typing-race.show', $race);
    }

    public function show(Request $request, TypingRace $race): Response
    {
        $user = $request->user();

        abort_unless($race->isParticipant($user) || $race->status === 'finished', 403);

        $this->settle($race);

        return Inertia::render('games/typing-race', [
            'race' => $this->payload($race, $user),
        ])->withViewData(['seo' => ['title' => 'Typing Race', 'noindex' => true]]);
    }

    public function accept(Request $request, TypingRace $race): RedirectResponse
    {
        abort_unless($race->opponent_id === $request->user()->id, 403);
        abort_unless($race->status === 'pending', 422, 'This challenge is no longer open.');

        $race->update([
            'status' => 'active',
            'starts_at' => now()->addSeconds(TypingRace::COUNTDOWN_SECONDS),
        ]);

        return redirect()->route('typing-race.show', $race);
    }

    public function decline(Request $request, TypingRace $race): RedirectResponse
    {
        abort_unless($race->opponent_id === $request->user()->id, 403);
        abort_unless($race->status === 'pending', 422, 'This challenge is no longer open.');

        $race->update(['status' => 'declined']);

        return redirect()->route('feed');
    }

    public function state(Request $request, TypingRace $race): JsonResponse
    {
        abort_unless($race->isParticipant($request->user()) || $race->status === 'finished', 403);

        $this->settle($race);

        return response()->json(['race' => $this->payload($race, $request->user())]);
    }

    public function progress(Request $request, TypingRace $race): JsonResponse
    {
        $user = $request->user();
        $side = $race->sideFor($user);

        abort_if($side === null, 403);

        $validated = $request->validate([
            'typed' => ['present', 'string', 'max:2000'],
            'errors' => ['required', 'integer', 'min:0', 'max:10000'],
        ]);

        DB::transaction(function () use ($race, $side, $validated) {
            $race = TypingRace::query()->lockForUpdate()->findOrFail($race->id);

            if ($race->status !== 'active' || $race->{$side.'_finished_at'} !== null) {
                return;
            }

            if ($race->starts_at->isFuture()) {
                return;
            }

            // Progress is the length of the typed prefix that matches the
            // passage: the server never trusts a raw counter from the client.
            $progress = $this->matchingPrefixLength($race->passage, $validated['typed']);

            $race->{$side.'_progress'} = max($race->{$side.'_progress'}, $progress);
            $race->{$side.'_errors'} = max($race->{$side.'_errors'}, $validated['errors']);

            if ($race->{$side.'_progress'} >= strlen($race->passage)) {
                $race->{$side.'_finished_at'} = now();
                $race->{$side.'_wpm'} = $this->wpm(strlen($race->passage), $race->starts_at, $race->{$side.'_finished_at'});
                $race->{$side.'_accuracy'} = $this->accuracy(strlen($race->passage), $race->{$side.'_errors'});
            }

            $race->save();

            $this->finalizeIfDue($race);
        });

        return response()->json(['race' => $this->payload($race->refresh(), $user)]);
    }

    /**
     * Expire stale pending challenges and finalize overdue active races.
     */
    private function settle(TypingRace $race): void
    {
        if ($race->isExpiredPending()) {
            $race->update(['status' => 'expired']);

            return;
        }

        if ($race->status === 'active' && $race->deadline()->isPast()) {
            DB::transaction(function () use ($race) {
                $locked = TypingRace::query()->lockForUpdate()->findOrFail($race->id);
                $this->finalizeIfDue($locked);
            });

            $race->refresh();
        }
    }

    /**
     * Finish the race when both players are done or time is up, decide the
     * winner, and publish the result to the feed. Caller must hold the lock.
     */
    private function finalizeIfDue(TypingRace $race): void
    {
        if ($race->status !== 'active') {
            return;
        }

        $bothFinished = $race->challenger_finished_at !== null && $race->opponent_finished_at !== null;

        if (! $bothFinished && $race->deadline()->isFuture()) {
            return;
        }

        // Give any unfinished side a WPM based on where they stalled out.
        foreach (['challenger', 'opponent'] as $side) {
            if ($race->{$side.'_finished_at'} === null && $race->{$side.'_wpm'} === null) {
                $race->{$side.'_wpm'} = $this->wpm($race->{$side.'_progress'}, $race->starts_at, $race->deadline());
                $race->{$side.'_accuracy'} = $this->accuracy($race->{$side.'_progress'}, $race->{$side.'_errors'});
            }
        }

        $race->winner_id = $this->decideWinner($race);
        $race->status = 'finished';
        $race->save();

        $this->publishResult($race);
    }

    private function decideWinner(TypingRace $race): ?int
    {
        $challengerDone = $race->challenger_finished_at;
        $opponentDone = $race->opponent_finished_at;

        if ($challengerDone && $opponentDone) {
            if ($challengerDone->eq($opponentDone)) {
                return null;
            }

            return $challengerDone->lt($opponentDone) ? $race->challenger_id : $race->opponent_id;
        }

        if ($challengerDone || $opponentDone) {
            return $challengerDone ? $race->challenger_id : $race->opponent_id;
        }

        return match (true) {
            $race->challenger_progress > $race->opponent_progress => $race->challenger_id,
            $race->opponent_progress > $race->challenger_progress => $race->opponent_id,
            default => null,
        };
    }

    private function publishResult(TypingRace $race): void
    {
        $race->loadMissing(['challenger', 'opponent']);

        if ($race->winner_id === null) {
            $author = $race->challenger;
            $body = sprintf(
                '🏁 @%s and @%s tied in a typing race: %d WPM each! #TypingRace',
                $race->challenger->username,
                $race->opponent->username,
                $race->challenger_wpm ?? 0,
            );
        } else {
            [$winner, $loser, $winnerSide, $loserSide] = $race->winner_id === $race->challenger_id
                ? [$race->challenger, $race->opponent, 'challenger', 'opponent']
                : [$race->opponent, $race->challenger, 'opponent', 'challenger'];

            $author = $winner;
            $body = $race->{$loserSide.'_finished_at'}
                ? sprintf(
                    '🏁 I just beat @%s in a typing race: %d WPM vs %d WPM (%d%% accuracy)! #TypingRace',
                    $loser->username,
                    $race->{$winnerSide.'_wpm'},
                    $race->{$loserSide.'_wpm'},
                    $race->{$winnerSide.'_accuracy'} ?? 100,
                )
                : sprintf(
                    "🏁 I just beat @%s in a typing race: %d WPM, and they didn't even finish 😅 #TypingRace",
                    $loser->username,
                    $race->{$winnerSide.'_wpm'},
                );
        }

        $post = $author->posts()->create(['body' => $body]);

        $race->post_id = $post->id;
        $race->save();
    }

    private function matchingPrefixLength(string $passage, string $typed): int
    {
        $max = min(strlen($passage), strlen($typed));

        for ($i = 0; $i < $max; $i++) {
            if ($passage[$i] !== $typed[$i]) {
                return $i;
            }
        }

        return $max;
    }

    private function wpm(int $chars, Carbon $start, Carbon $end): int
    {
        $minutes = max(0.01, $start->diffInSeconds($end) / 60);

        return (int) round(($chars / 5) / $minutes);
    }

    private function accuracy(int $correctChars, int $errors): int
    {
        if ($correctChars === 0) {
            return 0;
        }

        return (int) round(100 * $correctChars / ($correctChars + $errors));
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(TypingRace $race, ?User $user): array
    {
        $race->loadMissing(['challenger', 'opponent']);

        return [
            'id' => $race->id,
            'status' => $race->status,
            'passage' => $race->passage,
            'starts_at' => $race->starts_at?->toIso8601String(),
            'server_now' => now()->toIso8601String(),
            'me' => $race->sideFor($user),
            'winner_id' => $race->winner_id,
            'post_id' => $race->post_id,
            'challenger' => $this->userInfo($race->challenger) + $this->sideStats($race, 'challenger'),
            'opponent' => $this->userInfo($race->opponent) + $this->sideStats($race, 'opponent'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function userInfo(User $user): array
    {
        return [
            'id' => $user->id,
            'username' => $user->username,
            'display_name' => $user->display_name,
            'avatar_url' => $user->avatar_url,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function sideStats(TypingRace $race, string $side): array
    {
        return [
            'progress' => $race->{$side.'_progress'},
            'wpm' => $race->{$side.'_wpm'},
            'accuracy' => $race->{$side.'_accuracy'},
            'finished' => $race->{$side.'_finished_at'} !== null,
        ];
    }
}
