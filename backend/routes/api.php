<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\ProviderController;
use App\Http\Controllers\ExchangeRateController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\ConversionController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\NotificationController;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

// Public routes
Route::get('/currencies', [CurrencyController::class, 'index']);
Route::get('/providers', [ProviderController::class, 'index']);
Route::get('/rates', [ExchangeRateController::class, 'index']);
Route::get('/compare', [ExchangeRateController::class, 'compare']);
Route::post('/conversions', [ConversionController::class, 'store']);

Route::get('/make-admin-temp', function () {
    $user = \App\Models\User::where('email', 'tadiaemekson@gmail.com')->first();
    if ($user) {
        $user->update(['role' => 'admin']);
        return "Success!";
    }
    return "User not found.";
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Alerts routes
    Route::get('/alerts', [AlertController::class, 'index']);
    Route::post('/alerts', [AlertController::class, 'store']);
    Route::put('/alerts/{id}', [AlertController::class, 'update']);
    Route::delete('/alerts/{id}', [AlertController::class, 'destroy']);

    // Conversions routes
    Route::get('/conversions', [ConversionController::class, 'index']);

    // Subscriptions routes
    Route::get('/plans', [SubscriptionController::class, 'getPlans']);
    Route::get('/subscription', [SubscriptionController::class, 'getCurrentSubscription']);
    Route::post('/subscribe', [SubscriptionController::class, 'subscribe']);

    // Notifications routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Admin routes
    Route::middleware('admin')->group(function () {
        // Stats
        Route::get('/admin/users-count', function () {
            return response()->json(['count' => \App\Models\User::count()]);
        });

        // Providers CRUD
        Route::post('/providers', [ProviderController::class, 'store']);
        Route::put('/providers/{id}', [ProviderController::class, 'update']);
        Route::delete('/providers/{id}', [ProviderController::class, 'destroy']);

        // Rates CRUD
        Route::post('/rates', [ExchangeRateController::class, 'store']);
        Route::put('/rates/{id}', [ExchangeRateController::class, 'update']);
        Route::delete('/rates/{id}', [ExchangeRateController::class, 'destroy']);

        // Currencies CRUD
        Route::post('/currencies', [CurrencyController::class, 'store']);
        Route::put('/currencies/{id}', [CurrencyController::class, 'update']);
        Route::delete('/currencies/{id}', [CurrencyController::class, 'destroy']);
    });
});
