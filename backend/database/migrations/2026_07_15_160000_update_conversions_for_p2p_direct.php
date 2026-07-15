<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Convert users.role column from enum to string to support new roles ('agent') easily
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user')->change();
        });

        // 2. Add P2P tracking and status columns to the conversions table
        Schema::table('conversions', function (Blueprint $table) {
            $table->string('status')->default('pending')->after('rate'); // pending, processing, completed, cancelled
            $table->foreignId('p2p_agent_id')->nullable()->after('status')->constrained('users')->onDelete('set null');
            $table->json('chat_messages')->nullable()->after('p2p_agent_id'); // [{ sender_id, sender_name, message, created_at }]
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversions', function (Blueprint $table) {
            $table->dropForeign(['p2p_agent_id']);
            $table->dropColumn(['status', 'p2p_agent_id', 'chat_messages']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'user'])->default('user')->change();
        });
    }
};
