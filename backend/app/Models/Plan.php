<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = ['name', 'price'];

    protected $casts = [
        'price' => 'float',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}
