<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Currency;
use App\Models\Provider;
use App\Models\ExchangeRate;
use App\Models\Plan;
use App\Models\User;
use App\Models\Subscription;

class ExchangeDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Users (Admin & regular test user)
        $admin = User::create([
            'name' => 'Admin ExchangeCompare',
            'email' => 'admin@exchangecompare.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'phone' => '+237600000000',
        ]);

        $user = User::create([
            'name' => 'Test User',
            'email' => 'user@exchangecompare.com',
            'password' => bcrypt('password'),
            'role' => 'user',
            'phone' => '+237611111111',
        ]);

        // 2. Create Plans
        $basicPlan = Plan::create(['name' => 'Basic (Gratuit)', 'price' => 0.00]);
        $premiumPlan = Plan::create(['name' => 'Premium', 'price' => 9.99]);
        $vipPlan = Plan::create(['name' => 'VIP Gold', 'price' => 29.99]);

        // Subscribe users to basic plan
        Subscription::create(['user_id' => $admin->id, 'plan_id' => $basicPlan->id]);
        Subscription::create(['user_id' => $user->id, 'plan_id' => $basicPlan->id]);

        // 3. Create Currencies (with countries)
        $xaf = Currency::create(['code' => 'XAF', 'name' => 'Franc CFA (CEMAC)', 'symbol' => 'FCFA', 'country' => 'Afrique Centrale', 'is_active' => true]);
        $usd = Currency::create(['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$', 'country' => 'États-Unis', 'is_active' => true]);
        $eur = Currency::create(['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€', 'country' => 'Union Européenne', 'is_active' => true]);
        $cad = Currency::create(['code' => 'CAD', 'name' => 'Canadian Dollar', 'symbol' => 'C$', 'country' => 'Canada', 'is_active' => true]);
        $ngn = Currency::create(['code' => 'NGN', 'name' => 'Naira', 'symbol' => '₦', 'country' => 'Nigeria', 'is_active' => true]);

        // 4. Create Providers
        $remitly = Provider::create([
            'name' => 'Remitly',
            'website' => 'https://www.remitly.com',
            'rating' => 4.80,
            'status' => 'active',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Remitly_logo.svg',
            'is_active' => true
        ]);
        
        $wise = Provider::create([
            'name' => 'Wise',
            'website' => 'https://www.wise.com',
            'rating' => 4.90,
            'status' => 'active',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Wise_Logo.svg',
            'is_active' => true
        ]);
        
        $western = Provider::create([
            'name' => 'Western Union',
            'website' => 'https://www.westernunion.com',
            'rating' => 4.20,
            'status' => 'active',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/6/63/Western_Union_logo.svg',
            'is_active' => true
        ]);

        $worldremit = Provider::create([
            'name' => 'WorldRemit',
            'website' => 'https://www.worldremit.com',
            'rating' => 4.50,
            'status' => 'active',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/8/8c/WorldRemit_Logo.svg',
            'is_active' => true
        ]);

        // 5. Create Rates dynamically for all pairs
        $currencies = [$xaf, $usd, $eur, $cad, $ngn];
        $providers = [$remitly, $wise, $western, $worldremit];

        foreach ($currencies as $from) {
            foreach ($currencies as $to) {
                if ($from->id === $to->id) continue;

                foreach ($providers as $provider) {
                    $feePercentage = 0.00;
                    $fixedFee = 0.00;

                    $providerName = strtolower($provider->name);
                    if (str_contains($providerName, 'wise')) {
                        $feePercentage = 0.50; // 0.5% variable fee
                    } elseif (str_contains($providerName, 'remitly')) {
                        $fixedFee = 1500.00; // in source currency
                        if ($from->code === 'USD' || $from->code === 'EUR' || $from->code === 'CAD') {
                            $fixedFee = 2.99;
                        }
                    } elseif (str_contains($providerName, 'western')) {
                        $fixedFee = 2000.00;
                        if ($from->code === 'USD' || $from->code === 'EUR' || $from->code === 'CAD') {
                            $fixedFee = 4.99;
                        }
                        $feePercentage = 0.50;
                    } elseif (str_contains($providerName, 'worldremit')) {
                        $fixedFee = 1000.00;
                        if ($from->code === 'USD' || $from->code === 'EUR' || $from->code === 'CAD') {
                            $fixedFee = 1.99;
                        }
                        $feePercentage = 1.00;
                    }

                    ExchangeRate::create([
                        'provider_id' => $provider->id,
                        'from_currency_id' => $from->id,
                        'to_currency_id' => $to->id,
                        'buy_rate' => 1.00, // Will be updated by RatesSync
                        'sell_rate' => 1.00,
                        'fee_percentage' => $feePercentage,
                        'fixed_fee' => $fixedFee,
                    ]);
                }
            }
        }
    }
}
