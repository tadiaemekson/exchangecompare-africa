<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    protected $fillable = ['code', 'name', 'symbol', 'country', 'is_active'];

    public function exchangeRatesFrom() {
        return $this->hasMany(ExchangeRate::class, 'from_currency_id');
    }

    public function exchangeRatesTo() {
        return $this->hasMany(ExchangeRate::class, 'to_currency_id');
    }
}
