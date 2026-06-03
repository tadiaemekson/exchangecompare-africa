<?php

namespace App\Http\Controllers;

use App\Models\ExchangeRate;
use App\Models\Provider;
use Illuminate\Http\Request;

class ExchangeRateController extends Controller
{
    /**
     * Display a listing of the rates.
     */
    public function index(Request $request)
    {
        $query = ExchangeRate::with(['provider', 'currencyFrom', 'currencyTo']);
        
        if ($request->has('currency_from')) {
            $query->whereHas('currencyFrom', function($q) use ($request) {
                $q->where('code', strtoupper($request->currency_from));
            });
        }
        
        if ($request->has('currency_to')) {
            $query->whereHas('currencyTo', function($q) use ($request) {
                $q->where('code', strtoupper($request->currency_to));
            });
        }

        if ($request->has('provider_id')) {
            $query->where('provider_id', $request->provider_id);
        }
        
        $perPage = $request->get('per_page', 50);
        $paginated = $query->orderBy('id', 'desc')->paginate($perPage);
        
        return response()->json($paginated);
    }

    /**
     * Store a newly created rate.
     */
    public function store(Request $request)
    {
        $request->validate([
            'provider_id' => 'required|exists:providers,id',
            'from_currency_id' => 'required|exists:currencies,id',
            'to_currency_id' => 'required|exists:currencies,id',
            'buy_rate' => 'required|numeric|min:0',
            'sell_rate' => 'required|numeric|min:0',
            'fee_percentage' => 'nullable|numeric|min:0|max:100',
            'fixed_fee' => 'nullable|numeric|min:0',
        ]);

        $rate = ExchangeRate::create($request->all());

        return response()->json($rate->load(['provider', 'currencyFrom', 'currencyTo']), 201);
    }

    /**
     * Update the specified rate.
     */
    public function update(Request $request, $id)
    {
        $rate = ExchangeRate::findOrFail($id);

        $request->validate([
            'provider_id' => 'sometimes|required|exists:providers,id',
            'from_currency_id' => 'sometimes|required|exists:currencies,id',
            'to_currency_id' => 'sometimes|required|exists:currencies,id',
            'buy_rate' => 'sometimes|required|numeric|min:0',
            'sell_rate' => 'sometimes|required|numeric|min:0',
            'fee_percentage' => 'nullable|numeric|min:0|max:100',
            'fixed_fee' => 'nullable|numeric|min:0',
        ]);

        $rate->update($request->all());

        return response()->json($rate->load(['provider', 'currencyFrom', 'currencyTo']));
    }

    /**
     * Remove the specified rate.
     */
    public function destroy($id)
    {
        $rate = ExchangeRate::findOrFail($id);
        $rate->delete();

        return response()->json(['message' => 'Rate deleted successfully']);
    }

    /**
     * Compare rates and calculate final amount based on integrated fees.
     */
    public function compare(Request $request)
    {
        $request->validate([
            'currency_from' => 'required|string',
            'currency_to' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
        ]);

        $amount = $request->amount;

        // Fetch corresponding rates with providers
        $rates = ExchangeRate::with(['provider', 'currencyFrom', 'currencyTo'])
            ->whereHas('currencyFrom', function($q) use ($request) {
                $q->where('code', strtoupper($request->currency_from));
            })
            ->whereHas('currencyTo', function($q) use ($request) {
                $q->where('code', strtoupper($request->currency_to));
            })
            ->whereHas('provider', function($q) {
                $q->where('is_active', true);
            })
            ->get();

        $results = [];

        foreach ($rates as $rate) {
            $provider = $rate->provider;
            
            // Calculate fees in source currency
            $fixedFee = floatval($rate->fixed_fee);
            $percentageFee = $amount * (floatval($rate->fee_percentage) / 100);
            $totalFeesSource = $fixedFee + $percentageFee;

            // Subtract fees and convert using buy_rate
            $netAmountSource = max(0, $amount - $totalFeesSource);
            $amountReceived = $netAmountSource * floatval($rate->buy_rate);

            // Convert fees to destination currency for display
            $totalFeesDest = $totalFeesSource * floatval($rate->buy_rate);

            $results[] = [
                'provider' => [
                    'id' => $provider->id,
                    'name' => $provider->name,
                    'website' => $provider->website,
                    'rating' => $provider->rating,
                    'logo_url' => $provider->logo_url,
                    'type' => $provider->type,
                ],
                'buy_rate' => floatval($rate->buy_rate),
                'sell_rate' => floatval($rate->sell_rate),
                'fee_percentage' => floatval($rate->fee_percentage),
                'fixed_fee' => floatval($rate->fixed_fee),
                'total_fees_source' => $totalFeesSource,
                'total_fees_dest' => $totalFeesDest,
                'amount_received' => max(0, $amountReceived),
                'from_currency_id' => $rate->from_currency_id,
                'to_currency_id' => $rate->to_currency_id,
            ];
        }

        // Sort by amount received (highest first)
        usort($results, function($a, $b) {
            return $b['amount_received'] <=> $a['amount_received'];
        });

        return response()->json([
            'amount_sent' => $amount,
            'currency_from' => strtoupper($request->currency_from),
            'currency_to' => strtoupper($request->currency_to),
            'recommendations' => $results,
        ]);
    }
}
