<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ExchangeRateApiService;

class RatesSync extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rates:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize exchange rates with the ExchangeRate-API in real-time';

    /**
     * Execute the console command.
     */
    public function handle(ExchangeRateApiService $service)
    {
        $this->info('Starting exchange rates synchronization...');
        
        $result = $service->syncRates();

        if ($result['success']) {
            $this->info($result['message']);
        } else {
            $this->error($result['message']);
        }
    }
}
