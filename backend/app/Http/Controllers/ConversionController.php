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
        ]);

        $conversion = Conversion::create([
            'user_id' => $request->user()->id,
            'amount' => $request->amount,
            'best_provider_id' => $request->best_provider_id,
            'from_currency_id' => $request->from_currency_id,
            'to_currency_id' => $request->to_currency_id,
            'converted_amount' => $request->converted_amount,
            'rate' => $request->rate,
        ]);

        return response()->json($conversion->load(['provider', 'currencyFrom', 'currencyTo']), 201);
    }
}
