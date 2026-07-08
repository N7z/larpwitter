<?php

namespace App\Models;

use App\Support\Text;
use Database\Factories\PostFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Post extends Model
{
    /** @use HasFactory<PostFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'parent_id',
        'repost_of_id',
        'body',
        'image_path',
    ];

    protected $appends = [
        'image_url',
    ];

    protected static function booted(): void
    {
        static::created(fn (Post $post) => $post->syncHashtags());
    }

    public function syncHashtags(): void
    {
        $ids = collect(Text::hashtags($this->body))
            ->map(fn (string $name) => Hashtag::firstOrCreate(['name' => $name])->id);

        $this->hashtags()->sync($ids);
    }

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Post::class, 'parent_id')->latest();
    }

    public function likedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'likes')->withTimestamps();
    }

    public function repostOf(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'repost_of_id');
    }

    public function reposts(): HasMany
    {
        return $this->hasMany(Post::class, 'repost_of_id');
    }

    public function hashtags(): BelongsToMany
    {
        return $this->belongsToMany(Hashtag::class);
    }

    public function isReply(): bool
    {
        return $this->parent_id !== null;
    }

    public function isRepost(): bool
    {
        return $this->repost_of_id !== null;
    }
}
