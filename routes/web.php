<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\PostController as AdminPostController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\AvatarController;
use App\Http\Controllers\BioController;
use App\Http\Controllers\DisplayNameController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\HashtagController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReplyController;
use App\Http\Controllers\RepostController;
use App\Http\Controllers\SeoController;
use App\Http\Controllers\TypingRaceController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:login')->name('login.store');
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store'])
        ->middleware('throttle:register')->name('register.store');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->middleware('throttle:register')->name('password.update');
});

Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')->name('logout');

Route::get('robots.txt', [SeoController::class, 'robots'])->name('robots');
Route::get('sitemap.xml', [SeoController::class, 'sitemap'])->name('sitemap');

Route::get('/', [PostController::class, 'index'])->name('feed');
Route::get('posts/{post}', [PostController::class, 'show'])->name('posts.show');
Route::get('u/{user:username}', [ProfileController::class, 'show'])->name('profile.show');
Route::get('tag/{hashtag:name}', [HashtagController::class, 'show'])->name('hashtags.show');

Route::middleware('auth')->group(function () {
    Route::post('posts', [PostController::class, 'store'])->name('posts.store');
    Route::patch('posts/{post}', [PostController::class, 'update'])->name('posts.update');
    Route::delete('posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');

    Route::post('posts/{post}/replies', [ReplyController::class, 'store'])->name('replies.store');
    Route::post('posts/{post}/reposts', [RepostController::class, 'store'])->name('reposts.store');

    Route::post('posts/{post}/like', [LikeController::class, 'store'])->name('likes.store');
    Route::delete('posts/{post}/like', [LikeController::class, 'destroy'])->name('likes.destroy');

    Route::post('users/{user:username}/follow', [FollowController::class, 'store'])->name('follows.store');
    Route::delete('users/{user:username}/follow', [FollowController::class, 'destroy'])->name('follows.destroy');

    Route::post('profile/avatar', [AvatarController::class, 'store'])->name('avatar.store');
    Route::post('profile/bio', [BioController::class, 'store'])->name('bio.store');
    Route::post('profile/display-name', [DisplayNameController::class, 'store'])->name('display-name.store');

    Route::post('games/typing-race', [TypingRaceController::class, 'store'])->name('typing-race.store');
    Route::get('games/typing-race/{race}', [TypingRaceController::class, 'show'])->name('typing-race.show');
    Route::post('games/typing-race/{race}/accept', [TypingRaceController::class, 'accept'])->name('typing-race.accept');
    Route::post('games/typing-race/{race}/decline', [TypingRaceController::class, 'decline'])->name('typing-race.decline');
    Route::get('games/typing-race/{race}/state', [TypingRaceController::class, 'state'])->name('typing-race.state');
    Route::post('games/typing-race/{race}/progress', [TypingRaceController::class, 'progress'])->name('typing-race.progress');

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/latest', [NotificationController::class, 'latest'])->name('notifications.latest');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
    Route::patch('users/{user}/toggle-admin', [AdminUserController::class, 'toggleAdmin'])->name('users.toggle-admin');
    Route::patch('users/{user}/verification', [AdminUserController::class, 'updateVerification'])->name('users.update-verification');
    Route::post('users/{user}/reset-password', [AdminUserController::class, 'resetPassword'])->name('users.reset-password');
    Route::delete('users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

    Route::get('posts', [AdminPostController::class, 'index'])->name('posts.index');
    Route::delete('posts/{post}', [AdminPostController::class, 'destroy'])->name('posts.destroy');
});

Route::fallback(fn () => abort(404));
