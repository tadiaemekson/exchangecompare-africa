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
            ['code' => 'MAD', 'name' => 'Moroccan Dirham', 'symbol' => 'DH', 'country' => 'Maroc'],
            
            // Cryptocurrencies
            ['code' => 'BTC', 'name' => 'Bitcoin', 'symbol' => '₿', 'country' => 'Crypto', 'type' => 'crypto'],
            ['code' => 'ETH', 'name' => 'Ethereum', 'symbol' => 'Ξ', 'country' => 'Crypto', 'type' => 'crypto'],
            ['code' => 'USDT', 'name' => 'Tether USDT', 'symbol' => '₮', 'country' => 'Crypto', 'type' => 'crypto'],
            ['code' => 'SOL', 'name' => 'Solana', 'symbol' => 'SOL', 'country' => 'Crypto', 'type' => 'crypto']
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
                'type' => $c['type'] ?? 'fiat',
                'is_active' => true
            ]);
        }

        // 4. Create Providers (Fintechs, Banks, and Crypto Exchanges)
        $remitly = Provider::create([
            'name' => 'Remitly',
            'website' => 'https://www.remitly.com',
            'rating' => 4.80,
            'status' => 'active',
            'type' => 'fintech',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Remitly_logo.svg',
            'is_active' => true
        ]);
        
        $wise = Provider::create([
            'name' => 'Wise',
            'website' => 'https://www.wise.com',
            'rating' => 4.90,
            'status' => 'active',
            'type' => 'fintech',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Wise_Logo.svg',
            'is_active' => true
        ]);
        
        $western = Provider::create([
            'name' => 'Western Union',
            'website' => 'https://www.westernunion.com',
            'rating' => 4.20,
            'status' => 'active',
            'type' => 'fintech',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/6/63/Western_Union_logo.svg',
            'is_active' => true
        ]);

        $worldremit = Provider::create([
            'name' => 'WorldRemit',
            'website' => 'https://www.worldremit.com',
            'rating' => 4.50,
            'status' => 'active',
            'type' => 'fintech',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/8/8c/WorldRemit_Logo.svg',
            'is_active' => true
        ]);

        // Seed Banks
        $ecobank = Provider::create([
            'name' => 'Ecobank',
            'website' => 'https://www.ecobank.com',
            'rating' => 4.10,
            'status' => 'active',
            'type' => 'bank',
            'logo_url' => 'https://ecobank.com/images/logo.png',
            'is_active' => true
        ]);

        $socgen = Provider::create([
            'name' => 'Société Générale',
            'website' => 'https://www.societegenerale.com',
            'rating' => 3.90,
            'status' => 'active',
            'type' => 'bank',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_Societe_Generale.svg',
            'is_active' => true
        ]);

        $afriland = Provider::create([
            'name' => 'Afriland First Bank',
            'website' => 'https://www.afrilandfirstbank.com',
            'rating' => 4.00,
            'status' => 'active',
            'type' => 'bank',
            'logo_url' => 'https://afrilandfirstbank.com/logo.png',
            'is_active' => true
        ]);

        $uba = Provider::create([
            'name' => 'UBA Bank',
            'website' => 'https://www.ubagroup.com',
            'rating' => 4.20,
            'status' => 'active',
            'type' => 'bank',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/d/da/UBA_Logo.svg',
            'is_active' => true
        ]);

        // Seed Crypto Exchanges
        $binance = Provider::create([
            'name' => 'Binance',
            'website' => 'https://www.binance.com',
            'rating' => 4.70,
            'status' => 'active',
            'type' => 'crypto',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Binance_Logo.svg',
            'is_active' => true
        ]);

        $coinbase = Provider::create([
            'name' => 'Coinbase',
            'website' => 'https://www.coinbase.com',
            'rating' => 4.50,
            'status' => 'active',
            'type' => 'crypto',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Coinbase_Logo.svg',
            'is_active' => true
        ]);

        $expressLink = Provider::create([
            'name' => 'Express Link Direct',
            'website' => 'https://chat.whatsapp.com/ExpressLinkDirectCEMAC',
            'rating' => 4.60,
            'status' => 'active',
            'type' => 'agent',
            'logo_url' => 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=120&q=80',
            'is_active' => true
        ]);

        $providers = [$remitly, $wise, $western, $worldremit, $ecobank, $socgen, $afriland, $uba, $binance, $coinbase, $expressLink];

        // 5. Create Rates dynamically for all pairs of active currencies
        $currenciesList = array_values($currencies);

        foreach ($currenciesList as $from) {
            foreach ($currenciesList as $to) {
                if ($from->id === $to->id) continue;

                $isCryptoPair = ($from->type === 'crypto' || $to->type === 'crypto');

                foreach ($providers as $provider) {
                    // Match provider type with transaction type
                    if ($isCryptoPair && $provider->type !== 'crypto') continue;
                    if (!$isCryptoPair && $provider->type === 'crypto') continue;

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
                    } elseif (str_contains($providerName, 'ecobank')) {
                        $fixedFee = 3500.00;
                        if ($from->code === 'USD' || $from->code === 'EUR') {
                            $fixedFee = 5.99;
                        }
                        $feePercentage = 1.50; // 1.5% bank transfer fee
                    } elseif (str_contains($providerName, 'générale') || str_contains($providerName, 'generale')) {
                        $fixedFee = 5000.00;
                        if ($from->code === 'USD' || $from->code === 'EUR') {
                            $fixedFee = 7.99;
                        }
                        $feePercentage = 2.00;
                    } elseif (str_contains($providerName, 'afriland')) {
                        $fixedFee = 4000.00;
                        if ($from->code === 'USD' || $from->code === 'EUR') {
                            $fixedFee = 6.50;
                        }
                        $feePercentage = 1.80;
                    } elseif (str_contains($providerName, 'uba')) {
                        $fixedFee = 3000.00;
                        if ($from->code === 'USD' || $from->code === 'EUR') {
                            $fixedFee = 4.99;
                        }
                        $feePercentage = 1.20;
                    } elseif (str_contains($providerName, 'binance')) {
                        $feePercentage = 0.10; // Binance has a low trading fee of 0.1%
                    } elseif (str_contains($providerName, 'coinbase')) {
                        $feePercentage = 0.50; // Coinbase has a slightly higher fee of 0.5%
                    } elseif (str_contains($providerName, 'express link') || $provider->type === 'agent') {
                        $fixedFee = 1000.00;
                        if ($from->code === 'USD' || $from->code === 'EUR') {
                            $fixedFee = 1.99;
                        }
                        $feePercentage = 2.00;
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
