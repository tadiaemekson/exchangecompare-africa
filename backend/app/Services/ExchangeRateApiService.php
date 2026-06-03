<?php

namespace App\Services;

use App\Models\ExchangeRate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExchangeRateApiService
{
    protected $apiKey;
    protected $baseUrl = 'https://v6.exchangerate-api.com/v6';

    public function __construct()
    {
        $this->apiKey = env('EXCHANGE_RATE_API_KEY', 'f0bd86c6248062029830b6b7');
    }

    /**
     * Fetch latest rates from ExchangeRate-API and update local database.
     */
    public function syncRates()
    {
        try {
            $url = "{$this->baseUrl}/{$this->apiKey}/latest/USD";
            $response = Http::withoutVerifying()->get($url);

            if (!$response->successful() || $response->json('result') !== 'success') {
                $errorMsg = $response->json('error-type') ?? 'API request failed';
                Log::error("ExchangeRateAPI Sync Error: " . $errorMsg);
                return [
                    'success' => false,
                    'message' => "ExchangeRate-API error: " . $errorMsg
                ];
            }

            $ratesList = $response->json('conversion_rates'); // format: ["USD" => 1, "EUR" => 0.923, ...]

            // Fetch all rates to update
            $rates = ExchangeRate::with(['currencyFrom', 'currencyTo', 'provider'])->get();
            $updatedCount = 0;

            foreach ($rates as $rate) {
                $fromCode = $rate->currencyFrom->code;
                $toCode = $rate->currencyTo->code;

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
