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
        $xaf = Currency::create(['code' => 'XAF', 'name' => 'Franc CFA (CEMAC)', 'symbol' => 'FCFA', 'country' => 'Cameroun / Afrique Centrale', 'is_active' => true]);
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

        // 5. Create Rates
        // Rates from XAF to USD
        ExchangeRate::create([
            'provider_id' => $remitly->id,
            'from_currency_id' => $xaf->id,
            'to_currency_id' => $usd->id,
            'buy_rate' => 0.001650,
            'sell_rate' => 0.001680,
            'fee_percentage' => 0.00,
            'fixed_fee' => 1200.00 // Fixed fee in XAF (2$)
        ]);
        
        ExchangeRate::create([
            'provider_id' => $wise->id,
            'from_currency_id' => $xaf->id,
            'to_currency_id' => $usd->id,
            'buy_rate' => 0.001670,
            'sell_rate' => 0.001690,
            'fee_percentage' => 1.50, // 1.5% fee
            'fixed_fee' => 0.00
        ]);
        
        ExchangeRate::create([
            'provider_id' => $western->id,
            'from_currency_id' => $xaf->id,
            'to_currency_id' => $usd->id,
            'buy_rate' => 0.001550,
            'sell_rate' => 0.001600,
            'fee_percentage' => 0.50,
            'fixed_fee' => 3000.00 // High fixed fee in XAF
        ]);

        ExchangeRate::create([
            'provider_id' => $worldremit->id,
            'from_currency_id' => $xaf->id,
            'to_currency_id' => $usd->id,
            'buy_rate' => 0.001620,
            'sell_rate' => 0.001660,
            'fee_percentage' => 1.00,
            'fixed_fee' => 900.00
        ]);

        // Rates from XAF to EUR
        ExchangeRate::create([
            'provider_id' => $remitly->id,
            'from_currency_id' => $xaf->id,
            'to_currency_id' => $eur->id,
            'buy_rate' => 0.001520,
            'sell_rate' => 0.001550,
            'fee_percentage' => 0.00,
            'fixed_fee' => 1000.00
        ]);
        ExchangeRate::create([
            'provider_id' => $wise->id,
            'from_currency_id' => $xaf->id,
            'to_currency_id' => $eur->id,
            'buy_rate' => 0.001524,
            'sell_rate' => 0.001538,
            'fee_percentage' => 1.20,
            'fixed_fee' => 0.00
        ]);
        ExchangeRate::create([
            'provider_id' => $western->id,
            'from_currency_id' => $xaf->id,
            'to_currency_id' => $eur->id,
            'buy_rate' => 0.001480,
            'sell_rate' => 0.001510,
            'fee_percentage' => 0.80,
            'fixed_fee' => 2500.00
        ]);

        // USD to NGN
        ExchangeRate::create([
            'provider_id' => $wise->id,
            'from_currency_id' => $usd->id,
            'to_currency_id' => $ngn->id,
            'buy_rate' => 1450.000000,
            'sell_rate' => 1480.000000,
            'fee_percentage' => 0.80,
            'fixed_fee' => 2.00
        ]);
        ExchangeRate::create([
            'provider_id' => $remitly->id,
            'from_currency_id' => $usd->id,
            'to_currency_id' => $ngn->id,
            'buy_rate' => 1430.000000,
            'sell_rate' => 1460.000000,
            'fee_percentage' => 0.00,
            'fixed_fee' => 3.99
        ]);
    }
}
