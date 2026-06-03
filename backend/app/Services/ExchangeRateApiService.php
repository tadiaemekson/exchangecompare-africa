<?php

namespace App\Services;

use App\Models\ExchangeRate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExchangeRateApiService
{
    protected $baseUrl = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api';

    public function __construct()
    {
        // No API key needed for Fawaz Ahmed's API
    }

    /**
     * Fetch latest rates from Fawaz Ahmed's currency-api and update local database.
     */
    public function syncRates()
    {
        try {
            $date = 'latest';
            $apiVersion = 'v1';
            $endpoint = 'currencies/usd.json';
            $url = "{$this->baseUrl}@{$date}/{$apiVersion}/{$endpoint}";
            
            $response = Http::withoutVerifying()->get($url);

            if (!$response->successful()) {
                Log::error("Fawaz Ahmed Currency API Sync Error: API request failed");
                return [
                    'success' => false,
                    'message' => "Fawaz Ahmed Currency API request failed"
                ];
            }

            $ratesList = $response->json('usd'); // format: ["usd" => 1, "eur" => 0.860165, ...]

            if (!$ratesList) {
                Log::error("Fawaz Ahmed Currency API Sync Error: rates object for 'usd' not found in response");
                return [
                    'success' => false,
                    'message' => "Rates list could not be parsed"
                ];
            }

            // Fetch all rates to update
            $rates = ExchangeRate::with(['currencyFrom', 'currencyTo', 'provider'])->get();
            $updatedCount = 0;

            foreach ($rates as $rate) {
                $fromCode = strtolower($rate->currencyFrom->code);
                $toCode = strtolower($rate->currencyTo->code);

                if (isset($ratesList[$fromCode]) && isset($ratesList[$toCode])) {
                    $usdToFrom = floatval($ratesList[$fromCode]);
                    $usdToTo = floatval($ratesList[$toCode]);

                    // Mid rate from A to B = (USD -> B) / (USD -> A)
                    $midRate = $usdToTo / $usdToFrom;

                    // Calculate spread based on provider reputation
                    $providerName = strtolower($rate->provider->name);
                    $spread = 0.015; // default 1.5%

                    if (str_contains($providerName, 'wise')) {
                        $spread = 0.003; // 0.3%
                    } elseif (str_contains($providerName, 'remitly')) {
                        $spread = 0.008; // 0.8%
                    } elseif (str_contains($providerName, 'worldremit')) {
                        $spread = 0.012; // 1.2%
                    } elseif (str_contains($providerName, 'western union')) {
                        $spread = 0.025; // 2.5%
                    } elseif (str_contains($providerName, 'ecobank')) {
                        $spread = 0.028; // 2.8% bank spread
                    } elseif (str_contains($providerName, 'générale') || str_contains($providerName, 'generale')) {
                        $spread = 0.035; // 3.5% bank spread
                    } elseif (str_contains($providerName, 'afriland')) {
                        $spread = 0.030; // 3.0% bank spread
                    } elseif (str_contains($providerName, 'uba')) {
                        $spread = 0.025; // 2.5% bank spread
                    } elseif (str_contains($providerName, 'binance')) {
                        $spread = 0.001; // 0.1% crypto spread
                    } elseif (str_contains($providerName, 'coinbase')) {
                        $spread = 0.004; // 0.4% crypto spread
                    }

                    // Apply spread
                    $buyRate = $midRate * (1 - $spread);
                    $sellRate = $midRate * (1 + $spread);

                    $rate->update([
                        'buy_rate' => $buyRate,
                        'sell_rate' => $sellRate,
                    ]);

                    $updatedCount++;
                }
            }

            return [
                'success' => true,
                'message' => "Successfully synced {$updatedCount} exchange rates using ExchangeRate-API."
            ];

        } catch (\Exception $e) {
            Log::error("ExchangeRateAPI Sync Exception: " . $e->getMessage());
            return [
                'success' => false,
                'message' => "Exception during sync: " . $e->getMessage()
            ];
        }
    }
}
