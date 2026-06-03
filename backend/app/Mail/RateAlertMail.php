<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RateAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public $alert;
    public $currentRate;
    public $platformName;

    /**
     * Create a new message instance.
     */
    public function __construct($alert, $currentRate, $platformName)
    {
        $this->alert = $alert;
        $this->currentRate = $currentRate;
        $this->platformName = $platformName;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Alerte de Taux de Change: Objectif Atteint !')
                    ->html("
                        <h2>Bonjour {$this->alert->user->name},</h2>
                        <p>Votre alerte pour la paire <strong>{$this->alert->currencyFrom->code} vers {$this->alert->currencyTo->code}</strong> a été déclenchée !</p>
                        <p>Le taux actuel sur <strong>{$this->platformName}</strong> est de <strong>{$this->currentRate}</strong>, ce qui correspond à votre condition (taux cible : {$this->alert->target_rate}).</p>
                        <br/>
                        <p>Allez vite sur ExchangeCompare Africa pour finaliser votre transaction !</p>
                    ");
    }
}
