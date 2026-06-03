<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExchangeRate extends Model
{
    protected $fillable = [
        'provider_id', 
        'from_currency_id', 
        'to_currency_id', 
        'buy_rate', 
        'sell_rate', 
        'fee_percentage', 
        'fixed_fee'
    ];

    protected $casts = [
        'buy_rate' => 'float',
        'sell_rate' => 'float',
        'fee_percentage' => 'float',
        'fixed_fee' => 'float',
    ];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function currencyFrom()
    {
        return $this->belongsTo(Currency::class, 'from_currency_id');
    }

    public function currencyTo()
    {
        return $this->belongsTo(Currency::class, 'to_currency_id');
    }
}
