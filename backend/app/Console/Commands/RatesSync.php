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
    protected $signature = 'rates:sync {--date= : Custom date (YYYY-MM-DD or latest)} {--apiVersion= : API version (v1, etc.)} {--endpoint= : API endpoint (currencies/usd.json, etc.)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize exchange rates with the Fawaz Ahmed Currency API in real-time';

    /**
     * Execute the console command.
     */
    public function handle(ExchangeRateApiService $service)
    {
        $date = $this->option('date');
        $apiVersion = $this->option('apiVersion');
        $endpoint = $this->option('endpoint');

        $this->info('Starting exchange rates synchronization...');
        
        $result = $service->syncRates($date, $apiVersion, $endpoint);

        if ($result['success']) {
            $this->info($result['message']);
        } else {
            $this->error($result['message']);
        }
    }
}
