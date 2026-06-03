<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    protected $fillable = ['user_id', 'currency_from_id', 'currency_to_id', 'target_rate', 'condition', 'is_active'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function currencyFrom() {
        return $this->belongsTo(Currency::class, 'currency_from_id');
    }

    public function currencyTo() {
        return $this->belongsTo(Currency::class, 'currency_to_id');
    }
}
