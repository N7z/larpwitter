<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Notifications\Events\NotificationSent;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', function ($request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('register', function ($request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // Flag new notifications in cache so the SSE stream can poll the
        // cheap cache store instead of waking the database on every tick.
        Event::listen(NotificationSent::class, function (NotificationSent $event) {
            if ($event->channel === 'database' && $event->notifiable instanceof User) {
                Cache::put(
                    User::notificationFlagKey($event->notifiable->getKey()),
                    now()->getTimestampMs(),
                    now()->addMinutes(10),
                );
            }
        });
    }
}
