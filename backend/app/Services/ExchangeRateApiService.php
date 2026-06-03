<?php

namespace App\Services;

use App\Models\ExchangeRate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExchangeRateApiService
{
    protected $baseUrl;
    protected $defaultDate;
    protected $defaultApiVersion;
    protected $defaultEndpoint;
    protected $fallbackUrlTemplate;

    public function __construct()
    {
        $this->baseUrl = config('services.currency_api.base_url', 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api');
        $this->defaultDate = config('services.currency_api.date', 'latest');
        $this->defaultApiVersion = config('services.currency_api.api_version', 'v1');
        $this->defaultEndpoint = config('services.currency_api.endpoint', 'currencies/usd.json');
        $this->fallbackUrlTemplate = config('services.currency_api.fallback_url', 'https://{date}.currency-api.pages.dev/{apiVersion}/{endpoint}');
    }

    /**
     * Fetch latest rates from Fawaz Ahmed's currency-api and update local database.
     */
    public function syncRates($date = null, $apiVersion = null, $endpoint = null)
    {
        try {
            $date = $date ?? $this->defaultDate;
            $apiVersion = $apiVersion ?? $this->defaultApiVersion;
            $endpoint = $endpoint ?? $this->defaultEndpoint;

            $primaryUrl = "{$this->baseUrl}@{$date}/{$apiVersion}/{$endpoint}";
            
            Log::info("Fetching exchange rates from primary API: {$primaryUrl}");
            $response = Http::withoutVerifying()->get($primaryUrl);

            if (!$response->successful()) {
                Log::warning("Primary Fawaz Ahmed Currency API request failed. Trying fallback URL...");
                
                $fallbackUrl = str_replace(
                    ['{date}', '{apiVersion}', '{endpoint}'],
                    [$date, $apiVersion, $endpoint],
                    $this->fallbackUrlTemplate
                );

                Log::info("Fetching exchange rates from fallback API: {$fallbackUrl}");
                $response = Http::withoutVerifying()->get($fallbackUrl);
            }

            if (!$response->successful()) {
                Log::error("Fawaz Ahmed Currency API Sync Error: Both primary and fallback API requests failed");
                return [
                    'success' => false,
                    'message' => "Fawaz Ahmed Currency API requests failed (primary and fallback)"
                ];
            }

            // Extract the base currency code from endpoint (e.g. "currencies/usd.json" -> "usd")
            $baseCurrency = 'usd';
            if (preg_match('/currencies\/([a-z0-9]+)\.json/i', $endpoint, $matches)) {
                $baseCurrency = strtolower($matches[1]);
            }

            $ratesList = $response->json($baseCurrency); // format: ["usd" => 1, "eur" => 0.860165, ...]

            if (!$ratesList) {
                Log::error("Fawaz Ahmed Currency API Sync Error: rates object for '{$baseCurrency}' not found in response");
                return [
                    'success' => false,
                    'message' => "Rates list for '{$baseCurrency}' could not be parsed"
                ];
            }

            // Fetch all rates to update
            $rates = ExchangeRate::with(['currencyFrom', 'currencyTo', 'provider'])->get();
            $updatedCount = 0;

            foreach ($rates as $rate) {
                $fromCode = strtolower($rate->currencyFrom->code);
                $toCode = strtolower($rate->currencyTo->code);

                // If base currency is different from USD, we can compute cross rate relative to baseCurrency
                if (isset($ratesList[$fromCode]) && isset($ratesList[$toCode])) {
                    $baseToFrom = floatval($ratesList[$fromCode]);
                    $baseToTo = floatval($ratesList[$toCode]);

                    // Mid rate from A to B = (Base -> B) / (Base -> A)
                    $midRate = $baseToTo / $baseToFrom;

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
                    } elseif (str_contains($providerName, 'express link') || $rate->provider->type === 'agent') {
                        $spread = 0.020; // 2.0% agent spread
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
                'message' => "Successfully synced {$updatedCount} exchange rates using Fawaz Ahmed Currency API."
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
