<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversion extends Model
{
    protected $fillable = [
        'user_id', 
        'amount', 
        'best_provider_id', 
        'from_currency_id', 
        'to_currency_id', 
        'converted_amount', 
        'rate',
        'beneficiary_details'
    ];

    protected $casts = [
        'amount' => 'float',
        'converted_amount' => 'float',
        'rate' => 'float',
        'beneficiary_details' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class, 'best_provider_id');
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
