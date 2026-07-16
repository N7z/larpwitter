<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordResetToken extends Model
{
    protected $fillable = [
        'user_id',
        'token',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create a fresh reset token for the given user and return the plaintext token.
     */
    public static function createFor(User $user): string
    {
        static::where('user_id', $user->id)->delete();

        $plainToken = Str::random(64);

        static::create([
            'user_id' => $user->id,
            'token' => Hash::make($plainToken),
            'expires_at' => now()->addMinutes(60),
        ]);

        return $plainToken;
    }

    public static function findValidByToken(string $plainToken): ?self
    {
        return static::where('expires_at', '>', now())
            ->get()
            ->first(fn (self $record) => Hash::check($plainToken, $record->token));
    }
}
