<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

trait ThrottlesPosting
{
    /**
     * Handle a passed validation attempt.
     */
    protected function passedValidation(): void
    {
        $this->ensureIsNotRateLimited();

        RateLimiter::hit($this->throttleKey(), 60);
    }

    /**
     * Ensure the request is not rate limited.
     */
    protected function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'body' => "You're posting too fast. Please wait {$seconds} seconds and try again.",
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    protected function throttleKey(): string
    {
        return 'post:'.$this->user()->id;
    }
}
