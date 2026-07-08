<?php

namespace App\Http\Controllers;

use App\Models\Hashtag;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    public function robots(): Response
    {
        $lines = [
            'User-agent: *',
            'Disallow: /admin',
            'Disallow: /notifications',
            '',
            'Sitemap: '.url('/sitemap.xml'),
        ];

        return response(implode("\n", $lines))->header('Content-Type', 'text/plain');
    }

    public function sitemap(): Response
    {
        $urls = collect([
            ['loc' => url('/'), 'priority' => '1.0'],
        ]);

        User::query()->latest()->limit(1000)->pluck('username')
            ->each(fn (string $username) => $urls->push(['loc' => url("/u/{$username}"), 'priority' => '0.6']));

        Hashtag::query()->latest()->limit(500)->pluck('name')
            ->each(fn (string $name) => $urls->push(['loc' => url("/tag/{$name}"), 'priority' => '0.5']));

        Post::query()->whereNull('parent_id')->latest()->limit(500)->pluck('id')
            ->each(fn (int $id) => $urls->push(['loc' => url("/posts/{$id}"), 'priority' => '0.4']));

        return response()
            ->view('sitemap', ['urls' => $urls])
            ->header('Content-Type', 'application/xml');
    }
}
