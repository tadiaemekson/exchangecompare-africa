<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Alert;
use App\Models\ExchangeRate;
use App\Models\Notification;
use App\Mail\RateAlertMail;
use Illuminate\Support\Facades\Mail;

class CheckAlerts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'alerts:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Vérifie les alertes de taux de change et notifie les utilisateurs si les conditions sont remplies.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Début de la vérification des alertes...');
        
        $alerts = Alert::where('is_active', true)->with(['user', 'currencyFrom', 'currencyTo'])->get();
        
        $count = 0;
        foreach ($alerts as $alert) {
            // Chercher le meilleur taux actuel (buy_rate) pour cette paire
            $bestRate = ExchangeRate::with('provider')
                ->where('from_currency_id', $alert->currency_from_id)
                ->where('to_currency_id', $alert->currency_to_id)
                ->whereHas('provider', function($q) {
                    $q->where('is_active', true);
                })
                ->orderBy('buy_rate', 'desc') // Taux le plus élevé d'abord
                ->first();
                
            if (!$bestRate) continue;

            $triggered = false;
            
            if ($alert->condition === 'above' && $bestRate->buy_rate >= $alert->target_rate) {
                $triggered = true;
            } elseif ($alert->condition === 'below' && $bestRate->buy_rate <= $alert->target_rate) {
                $triggered = true;
            }

            if ($triggered) {
                // Envoyer l'email
                try {
                    Mail::to($alert->user->email)->send(new RateAlertMail($alert, $bestRate->buy_rate, $bestRate->provider->name));
                } catch (\Exception $e) {
                    $this->error("Erreur d'envoi d'email pour l'utilisateur {$alert->user->email} : " . $e->getMessage());
                }
                
                // Créer un enregistrement de notification
                Notification::create([
                    'user_id' => $alert->user->id,
                    'alert_id' => $alert->id,
                    'message' => "Le taux de change pour {$alert->currencyFrom->code} -> {$alert->currencyTo->code} a atteint {$bestRate->buy_rate} chez {$bestRate->provider->name}.",
                    'is_read' => false,
                ]);

                // Désactiver l'alerte
                $alert->update(['is_active' => false]);
                $count++;
                
                $this->info("Alerte déclenchée pour l'utilisateur {$alert->user->email} (Taux: {$bestRate->buy_rate})");
            }
        }
        
        $this->info("Vérification terminée. {$count} alerte(s) déclenchée(s).");
    }
}
