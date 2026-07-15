<?php

namespace App\Http\Controllers;

use App\Models\Conversion;
use Illuminate\Http\Request;

class ConversionController extends Controller
{
    /**
     * Display a listing of conversions.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->role === 'admin') {
            // Admins can see all conversions with user details
            $conversions = Conversion::with(['user', 'provider', 'currencyFrom', 'currencyTo'])
                                     ->orderBy('created_at', 'desc')
                                     ->get();
        } else {
            // Regular users see only their conversions
            $conversions = Conversion::where('user_id', $user->id)
                                     ->with(['provider', 'currencyFrom', 'currencyTo'])
                                     ->orderBy('created_at', 'desc')
                                     ->get();
        }

        return response()->json($conversions);
    }

    /**
     * Store a newly created conversion.
     */
    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'best_provider_id' => 'required|exists:providers,id',
            'from_currency_id' => 'required|exists:currencies,id',
            'to_currency_id' => 'required|exists:currencies,id',
            'converted_amount' => 'required|numeric',
            'rate' => 'required|numeric',
            'beneficiary_details' => 'nullable|array',
        ]);

        $user = auth('sanctum')->user();

        $beneficiaryDetails = $request->beneficiary_details;
        if (is_array($beneficiaryDetails)) {
            array_walk_recursive($beneficiaryDetails, function (&$val) {
                if (is_string($val)) {
                    $val = strip_tags($val);
                }
            });
        }

        $conversion = Conversion::create([
            'user_id' => $user ? $user->id : null,
            'amount' => $request->amount,
            'best_provider_id' => $request->best_provider_id,
            'from_currency_id' => $request->from_currency_id,
            'to_currency_id' => $request->to_currency_id,
            'converted_amount' => $request->converted_amount,
            'rate' => $request->rate,
            'beneficiary_details' => $beneficiaryDetails,
        ]);

        return response()->json($conversion->load(['provider', 'currencyFrom', 'currencyTo']), 201);
    }

    /**
     * Display a listing of P2P agent conversions.
     */
    public function indexAgent(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'agent' && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Fetch P2P conversions (provider type = agent)
        $conversions = Conversion::whereHas('provider', function ($query) {
            $query->where('type', 'agent');
        })
        ->with(['user', 'provider', 'currencyFrom', 'currencyTo'])
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($conversions);
    }

    /**
     * Update the status of a P2P conversion.
     */
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'agent' && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|string|in:pending,processing,completed,cancelled'
        ]);

        $conversion = Conversion::findOrFail($id);
        
        $updateData = ['status' => $request->status];
        
        // Auto-assign the handling agent
        if ($user->role === 'agent' && !$conversion->p2p_agent_id) {
            $updateData['p2p_agent_id'] = $user->id;
        }

        $conversion->update($updateData);

        return response()->json($conversion->load(['user', 'provider', 'currencyFrom', 'currencyTo']));
    }

    /**
     * Send a direct chat message inside a conversion.
     */
    public function sendMessage(Request $request, $id)
    {
        $user = $request->user();
        $conversion = Conversion::findOrFail($id);

        if ($conversion->user_id !== $user->id && $user->role !== 'agent' && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'message' => 'required|string|max:1000'
        ]);

        $messages = $conversion->chat_messages ?? [];
        if (!is_array($messages)) {
            $messages = [];
        }

        $newMessage = [
            'sender_id' => $user->id,
            'sender_name' => $user->name,
            'sender_role' => $user->role,
            'message' => strip_tags($request->message),
            'created_at' => now()->toIso8601String()
        ];

        $messages[] = $newMessage;
        $conversion->update(['chat_messages' => $messages]);

        return response()->json($conversion->load(['user', 'provider', 'currencyFrom', 'currencyTo']));
    }
}

