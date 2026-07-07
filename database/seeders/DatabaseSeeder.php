<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = User::factory(10)->create();

        $posts = collect();
        $users->each(function (User $user) use (&$posts) {
            $posts = $posts->merge(Post::factory(3)->for($user)->create());
        });

        $posts->random(8)->each(function (Post $post) use ($users) {
            Post::factory()->reply($post)->for($users->random())->create();
        });

        $users->each(function (User $user) use ($users) {
            $users->except($user->id)->random(3)->each(function (User $target) use ($user) {
                $user->following()->syncWithoutDetaching([$target->id]);
            });
        });

        $posts->random(15)->each(function (Post $post) use ($users) {
            $post->likedBy()->syncWithoutDetaching([$users->random()->id]);
        });
    }
}
