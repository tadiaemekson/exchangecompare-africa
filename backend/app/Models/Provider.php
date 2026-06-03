<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Provider extends Model
{
    protected $fillable = ['name', 'website', 'rating', 'status', 'type', 'logo_url', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
        'rating' => 'float',
    ];

    public function rates()
    {
        return $this->hasMany(ExchangeRate::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function conversions()
    {
        return $this->hasMany(Conversion::class, 'best_provider_id');
    }
}
