<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'users' => User::count(),
                'admins' => User::where('is_admin', true)->count(),
                'posts' => Post::whereNull('parent_id')->whereNull('repost_of_id')->count(),
                'replies' => Post::whereNotNull('parent_id')->count(),
                'reposts' => Post::whereNotNull('repost_of_id')->count(),
                'likes' => DB::table('likes')->count(),
                'follows' => DB::table('follows')->count(),
            ],
            'recentUsers' => User::latest()->take(5)->get(['id', 'username', 'display_name', 'created_at']),
        ])->withViewData(['seo' => ['title' => 'Admin · Dashboard', 'noindex' => true]]);
    }
}
