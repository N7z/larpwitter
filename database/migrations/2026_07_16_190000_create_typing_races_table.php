<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('typing_races', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenger_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('opponent_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->text('passage');
            $table->timestamp('starts_at')->nullable();
            $table->unsignedInteger('challenger_progress')->default(0);
            $table->unsignedInteger('challenger_errors')->default(0);
            $table->unsignedSmallInteger('challenger_wpm')->nullable();
            $table->unsignedTinyInteger('challenger_accuracy')->nullable();
            $table->timestamp('challenger_finished_at')->nullable();
            $table->unsignedInteger('opponent_progress')->default(0);
            $table->unsignedInteger('opponent_errors')->default(0);
            $table->unsignedSmallInteger('opponent_wpm')->nullable();
            $table->unsignedTinyInteger('opponent_accuracy')->nullable();
            $table->timestamp('opponent_finished_at')->nullable();
            $table->foreignId('winner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('post_id')->nullable()->constrained('posts')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('typing_races');
    }
};
