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

        // 3. Create Currencies (32 major global and African currencies)
        $currenciesData = [
            ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$', 'country' => 'États-Unis'],
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€', 'country' => 'Union Européenne'],
            ['code' => 'GBP', 'name' => 'British Pound', 'symbol' => '£', 'country' => 'Royaume-Uni'],
            ['code' => 'CAD', 'name' => 'Canadian Dollar', 'symbol' => 'C$', 'country' => 'Canada'],
            ['code' => 'CHF', 'name' => 'Swiss Franc', 'symbol' => 'CHF', 'country' => 'Suisse'],
            ['code' => 'JPY', 'name' => 'Japanese Yen', 'symbol' => '¥', 'country' => 'Japon'],
            ['code' => 'CNY', 'name' => 'Chinese Yuan', 'symbol' => '元', 'country' => 'Chine'],
            ['code' => 'AUD', 'name' => 'Australian Dollar', 'symbol' => 'A$', 'country' => 'Australie'],
            ['code' => 'NZD', 'name' => 'New Zealand Dollar', 'symbol' => 'NZ$', 'country' => 'Nouvelle-Zélande'],
            ['code' => 'INR', 'name' => 'Indian Rupee', 'symbol' => '₹', 'country' => 'Inde'],
            ['code' => 'AED', 'name' => 'UAE Dirham', 'symbol' => 'AED', 'country' => 'Émirats Arabes Unis'],
            ['code' => 'SAR', 'name' => 'Saudi Riyal', 'symbol' => 'SAR', 'country' => 'Arabie Saoudite'],
            
            // African Currencies
            ['code' => 'XAF', 'name' => 'Franc CFA BEAC', 'symbol' => 'FCFA', 'country' => 'Afrique Centrale (CEMAC)'],
            ['code' => 'XOF', 'name' => 'Franc CFA BCEAO', 'symbol' => 'FCFA', 'country' => 'Afrique de l\'Ouest (UEMOA)'],
            ['code' => 'NGN', 'name' => 'Naira', 'symbol' => '₦', 'country' => 'Nigeria'],
            ['code' => 'ZAR', 'name' => 'Rand', 'symbol' => 'R', 'country' => 'Afrique du Sud'],
            ['code' => 'KES', 'name' => 'Shilling Kenyan', 'symbol' => 'KSh', 'country' => 'Kenya'],
            ['code' => 'GHS', 'name' => 'Cedi', 'symbol' => 'GH₵', 'country' => 'Ghana'],
            ['code' => 'EGP', 'name' => 'Egyptian Pound', 'symbol' => 'E£', 'country' => 'Égypte'],
            ['code' => 'MAD', 'name' => 'Dirham Marocain', 'symbol' => 'MAD', 'country' => 'Maroc'],
            ['code' => 'TND', 'name' => 'Dinar Tunisien', 'symbol' => 'DT', 'country' => 'Tunisie'],
            ['code' => 'DZD', 'name' => 'Dinar Algérien', 'symbol' => 'DA', 'country' => 'Algérie'],
            ['code' => 'UGX', 'name' => 'Shilling Ougandais', 'symbol' => 'USh', 'country' => 'Ouganda'],
            ['code' => 'TZS', 'name' => 'Shilling Tanzanien', 'symbol' => 'TSh', 'country' => 'Tanzanie'],
            ['code' => 'RWF', 'name' => 'Franc Rwandais', 'symbol' => 'RF', 'country' => 'Rwanda'],
            ['code' => 'CDF', 'name' => 'Franc Congolais', 'symbol' => 'FC', 'country' => 'RDC'],
            ['code' => 'ZMW', 'name' => 'Kwacha Zambien', 'symbol' => 'ZK', 'country' => 'Zambie'],
            ['code' => 'MZN', 'name' => 'Metical', 'symbol' => 'MT', 'country' => 'Mozambique'],
            ['code' => 'MUR', 'name' => 'Rupee Mauricienne', 'symbol' => '₨', 'country' => 'Maurice'],
            ['code' => 'SCR', 'name' => 'Rupee Seychelloise', 'symbol' => 'SR', 'country' => 'Seychelles'],
            ['code' => 'AOA', 'name' => 'Kwanza', 'symbol' => 'Kz', 'country' => 'Angola'],
            ['code' => 'MAD', 'name' => 'Moroccan Dirham', 'symbol' => 'DH', 'country' => 'Maroc']
        ];

        $currencies = [];
        foreach ($currenciesData as $c) {
            // Avoid duplicate MAD entry (which was added twice by accident in raw list)
            if (isset($currencies[$c['code']])) continue;
            
            $currencies[$c['code']] = Currency::create([
                'code' => $c['code'],
                'name' => $c['name'],
                'symbol' => $c['symbol'],
                'country' => $c['country'],
                'is_active' => true
            ]);
        }

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

        $providers = [$remitly, $wise, $western, $worldremit];

        // 5. Create Rates dynamically for all pairs of these 31 active currencies
        $currenciesList = array_values($currencies);

        foreach ($currenciesList as $from) {
            foreach ($currenciesList as $to) {
                if ($from->id === $to->id) continue;

                foreach ($providers as $provider) {
                    $feePercentage = 0.00;
                    $fixedFee = 0.00;

                    $providerName = strtolower($provider->name);
                    if (str_contains($providerName, 'wise')) {
                        $feePercentage = 0.50; // 0.5% variable fee
                    } elseif (str_contains($providerName, 'remitly')) {
                        $fixedFee = 1500.00; // default for weak source currencies
                        if ($from->code === 'USD' || $from->code === 'EUR' || $from->code === 'CAD' || $from->code === 'GBP' || $from->code === 'CHF') {
                            $fixedFee = 2.99; // Lower fixed fee for strong source currencies
                        }
                    } elseif (str_contains($providerName, 'western')) {
                        $fixedFee = 2000.00;
                        if ($from->code === 'USD' || $from->code === 'EUR' || $from->code === 'CAD' || $from->code === 'GBP' || $from->code === 'CHF') {
                            $fixedFee = 4.99;
                        }
                        $feePercentage = 0.50;
                    } elseif (str_contains($providerName, 'worldremit')) {
                        $fixedFee = 1000.00;
                        if ($from->code === 'USD' || $from->code === 'EUR' || $from->code === 'CAD' || $from->code === 'GBP' || $from->code === 'CHF') {
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
