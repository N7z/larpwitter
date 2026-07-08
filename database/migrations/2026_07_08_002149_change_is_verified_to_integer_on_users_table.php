<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE users ALTER COLUMN is_verified DROP DEFAULT');
            DB::statement('ALTER TABLE users ALTER COLUMN is_verified TYPE SMALLINT USING is_verified::integer');
            DB::statement('ALTER TABLE users ALTER COLUMN is_verified SET DEFAULT 0');

            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedTinyInteger('is_verified')->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE users ALTER COLUMN is_verified DROP DEFAULT');
            DB::statement('ALTER TABLE users ALTER COLUMN is_verified TYPE BOOLEAN USING (is_verified <> 0)');
            DB::statement('ALTER TABLE users ALTER COLUMN is_verified SET DEFAULT false');

            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_verified')->default(false)->change();
        });
    }
};
