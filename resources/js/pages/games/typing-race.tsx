import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Flag, Keyboard, Trophy } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Avatar from '@/components/avatar';
import Button from '@/components/button';
import Seo from '@/components/seo';
import AppLayout from '@/layouts/app-layout';
import { RacerInfo, TypingRaceState } from '@/types';

interface TypingRacePageProps {
    race: TypingRaceState;
}

const POLL_PENDING_MS = 2000;
const POLL_ACTIVE_MS = 1000;
const PUSH_PROGRESS_MS = 750;

export default function TypingRacePage({ race: initialRace }: TypingRacePageProps) {
    const [race, setRace] = useState(initialRace);
    const [now, setNow] = useState(() => Date.now());

    // Offset between server clock and local clock, so the countdown and WPM
    // math agree with the server regardless of the visitor's clock.
    const clockOffset = useMemo(() => Date.parse(initialRace.server_now) - Date.now(), [initialRace.server_now]);
    const serverNow = now + clockOffset;

    const mySide = race.me;
    const me = mySide ? race[mySide] : null;
    const rivalSide = mySide === 'challenger' ? 'opponent' : 'challenger';
    const rival = mySide ? race[rivalSide] : null;

    const startsAt = race.starts_at ? Date.parse(race.starts_at) : null;
    const countdown = startsAt ? Math.ceil((startsAt - serverNow) / 1000) : null;
    const racing = race.status === 'active' && countdown !== null && countdown <= 0;

    // Local typing state — kept out of `race` so polling never clobbers it.
    const [index, setIndex] = useState(me?.progress ?? 0);
    const [errors, setErrors] = useState(0);
    const lastSent = useRef(-1);
    const iFinished = (me?.finished ?? false) || index >= race.passage.length;

    // Clock tick for countdown + live WPM.
    useEffect(() => {
        if (race.status === 'finished' || race.status === 'declined' || race.status === 'expired') return;
        const timer = setInterval(() => setNow(Date.now()), 200);
        return () => clearInterval(timer);
    }, [race.status]);

    // Poll the server for the opponent's progress / status changes.
    useEffect(() => {
        if (race.status !== 'pending' && race.status !== 'active') return;
        const interval = race.status === 'active' ? POLL_ACTIVE_MS : POLL_PENDING_MS;
        const timer = setInterval(async () => {
            try {
                const { data } = await axios.get<{ race: TypingRaceState }>(`/games/typing-race/${race.id}/state`);
                setRace(data.race);
            } catch {
                // transient network error — next tick will retry
            }
        }, interval);
        return () => clearInterval(timer);
    }, [race.id, race.status]);

    // Capture keystrokes while racing.
    useEffect(() => {
        if (!racing || !mySide || iFinished) return;

        function onKeyDown(event: KeyboardEvent) {
            if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;
            event.preventDefault();
            setIndex((current) => {
                if (event.key === race.passage[current]) return current + 1;
                setErrors((count) => count + 1);
                return current;
            });
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [racing, mySide, iFinished, race.passage]);

    const pushProgress = useCallback(
        async (typedLength: number, errorCount: number) => {
            try {
                const { data } = await axios.post<{ race: TypingRaceState }>(`/games/typing-race/${race.id}/progress`, {
                    typed: race.passage.slice(0, typedLength),
                    errors: errorCount,
                });
                setRace(data.race);
            } catch {
                lastSent.current = -1; // resend on the next tick
            }
        },
        [race.id, race.passage],
    );

    // Push progress on a throttle, and immediately when the passage is done.
    useEffect(() => {
        if (race.status !== 'active' || !mySide) return;

        if (index >= race.passage.length && lastSent.current < race.passage.length) {
            lastSent.current = race.passage.length;
            void pushProgress(index, errors);
            return;
        }

        const timer = setInterval(() => {
            if (index !== lastSent.current) {
                lastSent.current = index;
                void pushProgress(index, errors);
            }
        }, PUSH_PROGRESS_MS);
        return () => clearInterval(timer);
    }, [race.status, mySide, index, errors, pushProgress, race.passage.length]);

    const elapsedMinutes = startsAt ? Math.max(0.01, (serverNow - startsAt) / 60000) : 0.01;
    const liveWpm = racing && !iFinished ? Math.round(index / 5 / elapsedMinutes) : null;

    const myDisplayProgress = mySide ? Math.max(index, me?.progress ?? 0) : 0;

    return (
        <AppLayout>
            <Seo title="Typing Race" />

            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h1 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                    <Keyboard className="h-6 w-6 text-sky-500" />
                    Typing Race
                </h1>

                <div className="mb-6 space-y-3">
                    <RacerRow
                        racer={race.challenger}
                        progress={mySide === 'challenger' ? myDisplayProgress : race.challenger.progress}
                        total={race.passage.length}
                        liveWpm={mySide === 'challenger' ? liveWpm : null}
                        isWinner={race.winner_id === race.challenger.id}
                        isMe={mySide === 'challenger'}
                    />
                    <RacerRow
                        racer={race.opponent}
                        progress={mySide === 'opponent' ? myDisplayProgress : race.opponent.progress}
                        total={race.passage.length}
                        liveWpm={mySide === 'opponent' ? liveWpm : null}
                        isWinner={race.winner_id === race.opponent.id}
                        isMe={mySide === 'opponent'}
                    />
                </div>

                {race.status === 'pending' && mySide === 'challenger' && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Waiting for <strong>@{race.opponent.username}</strong> to accept your challenge… this page will update
                        automatically.
                    </p>
                )}

                {race.status === 'pending' && mySide === 'opponent' && (
                    <div className="flex flex-col items-start gap-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>@{race.challenger.username}</strong> challenged you to a typing race. First to finish the
                            passage wins — the result gets posted to the feed!
                        </p>
                        <div className="flex gap-2">
                            <Button type="button" onClick={() => router.post(`/games/typing-race/${race.id}/accept`)}>
                                Accept & race
                            </Button>
                            <Button
                                type="button"
                                onClick={() => router.post(`/games/typing-race/${race.id}/decline`)}
                                className="!bg-white !text-gray-900 border border-gray-300 hover:!bg-gray-100 dark:!bg-gray-900 dark:!text-gray-100 dark:border-gray-700 dark:hover:!bg-gray-800"
                            >
                                Decline
                            </Button>
                        </div>
                    </div>
                )}

                {race.status === 'active' && countdown !== null && countdown > 0 && (
                    <div className="py-8 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Get ready…</p>
                        <p className="text-6xl font-bold text-sky-500">{countdown}</p>
                    </div>
                )}

                {racing && (
                    <div>
                        <Passage passage={race.passage} index={myDisplayProgress} racing={!iFinished && mySide !== null} />
                        {mySide === null ? (
                            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Spectating this race.</p>
                        ) : iFinished ? (
                            <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                <Flag className="h-4 w-4" /> You finished! Waiting for the race to wrap up…
                            </p>
                        ) : (
                            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                Just start typing — errors count against your accuracy.
                            </p>
                        )}
                    </div>
                )}

                {race.status === 'finished' && <ResultPanel race={race} />}

                {race.status === 'declined' && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">This challenge was declined.</p>
                )}

                {race.status === 'expired' && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">This challenge expired before it was accepted.</p>
                )}
            </div>
        </AppLayout>
    );
}

function RacerRow({
    racer,
    progress,
    total,
    liveWpm,
    isWinner,
    isMe,
}: {
    racer: RacerInfo;
    progress: number;
    total: number;
    liveWpm: number | null;
    isWinner: boolean;
    isMe: boolean;
}) {
    const percent = Math.min(100, Math.round((progress / total) * 100));
    const wpm = racer.wpm ?? liveWpm;

    return (
        <div className="flex items-center gap-3">
            <Avatar username={racer.username} displayName={racer.display_name} avatarUrl={racer.avatar_url} size="sm" />
            <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="truncate font-medium text-gray-900 dark:text-gray-100">
                        @{racer.username}
                        {isMe && <span className="text-gray-400 dark:text-gray-500"> (you)</span>}
                        {isWinner && <Trophy className="ml-1 inline h-3.5 w-3.5 text-amber-500" />}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                        {wpm !== null ? `${wpm} WPM` : `${percent}%`}
                        {racer.accuracy !== null && ` · ${racer.accuracy}% acc`}
                    </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${racer.finished ? 'bg-emerald-500' : 'bg-sky-500'}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

function Passage({ passage, index, racing }: { passage: string; index: number; racing: boolean }) {
    return (
        <p className="rounded-lg bg-gray-100 p-4 font-mono text-base leading-relaxed break-words select-none dark:bg-gray-800">
            <span className="text-emerald-600 dark:text-emerald-400">{passage.slice(0, index)}</span>
            {racing && index < passage.length && (
                <span className="rounded-sm bg-sky-500 text-white">{passage[index]}</span>
            )}
            <span className="text-gray-500 dark:text-gray-400">{passage.slice(racing ? index + 1 : index)}</span>
        </p>
    );
}

function ResultPanel({ race }: { race: TypingRaceState }) {
    const winner = race.winner_id === race.challenger.id ? race.challenger : race.winner_id === race.opponent.id ? race.opponent : null;

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-800 dark:bg-gray-950">
            <Trophy className="mx-auto mb-2 h-8 w-8 text-amber-500" />
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {winner ? `@${winner.username} wins!` : "It's a draw!"}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                @{race.challenger.username}: {race.challenger.wpm ?? 0} WPM · @{race.opponent.username}:{' '}
                {race.opponent.wpm ?? 0} WPM
            </p>
            <div className="mt-4 flex justify-center gap-3 text-sm font-semibold">
                {race.post_id && (
                    <Link href={`/posts/${race.post_id}`} className="text-sky-600 hover:underline dark:text-sky-400">
                        View result post
                    </Link>
                )}
                <Link href="/" className="text-gray-500 hover:underline dark:text-gray-400">
                    Back to feed
                </Link>
            </div>
        </div>
    );
}
