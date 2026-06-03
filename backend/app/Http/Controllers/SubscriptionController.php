<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of subscription plans.
     */
    public function getPlans()
    {
        return response()->json(Plan::all());
    }

    /**
     * Get the authenticated user's current subscription.
     */
    public function getCurrentSubscription(Request $request)
    {
        $user = $request->user();
        $subscription = Subscription::where('user_id', $user->id)->with('plan')->first();
        
        if (!$subscription) {
            // Automatically assign default basic plan if none exists
            $basicPlan = Plan::where('name', 'like', '%Basic%')->first();
            if ($basicPlan) {
                $subscription = Subscription::create([
                    'user_id' => $user->id,
                    'plan_id' => $basicPlan->id
                ]);
                $subscription->load('plan');
            }
        }

        return response()->json($subscription);
    }

    /**
     * Create or update the user's subscription.
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $user = $request->user();

        // Check if there is an existing subscription
        $subscription = Subscription::where('user_id', $user->id)->first();

        if ($subscription) {
            $subscription->update([
                'plan_id' => $request->plan_id
            ]);
        } else {
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $request->plan_id
            ]);
        }

        return response()->json($subscription->load('plan'));
    }
}
