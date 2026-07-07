<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\AvatarController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReplyController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:login')->name('login.store');
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store'])
        ->middleware('throttle:register')->name('register.store');
});

Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/', [PostController::class, 'index'])->name('feed');
    Route::post('posts', [PostController::class, 'store'])->name('posts.store');
    Route::get('posts/{post}', [PostController::class, 'show'])->name('posts.show');
    Route::delete('posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');

    Route::post('posts/{post}/replies', [ReplyController::class, 'store'])->name('replies.store');

    Route::post('posts/{post}/like', [LikeController::class, 'store'])->name('likes.store');
    Route::delete('posts/{post}/like', [LikeController::class, 'destroy'])->name('likes.destroy');

    Route::post('users/{user:username}/follow', [FollowController::class, 'store'])->name('follows.store');
    Route::delete('users/{user:username}/follow', [FollowController::class, 'destroy'])->name('follows.destroy');

    Route::get('u/{user:username}', [ProfileController::class, 'show'])->name('profile.show');

    Route::post('profile/avatar', [AvatarController::class, 'store'])->name('avatar.store');
});
