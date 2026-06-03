<?php

namespace App\Http\Controllers;

use App\Models\Currency;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    /**
     * Display a listing of the currencies.
     */
    public function index()
    {
        $currencies = Currency::all();
        return response()->json($currencies);
    }

    /**
     * Store a newly created currency.
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:3|unique:currencies,code',
            'name' => 'required|string|max:255',
            'symbol' => 'nullable|string|max:10',
            'country' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        $currency = Currency::create($request->all());

        return response()->json($currency, 201);
    }

    /**
     * Update the specified currency.
     */
    public function update(Request $request, $id)
    {
        $currency = Currency::findOrFail($id);

        $request->validate([
            'code' => 'sometimes|required|string|size:3|unique:currencies,code,' . $id,
            'name' => 'sometimes|required|string|max:255',
            'symbol' => 'nullable|string|max:10',
            'country' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        $currency->update($request->all());

        return response()->json($currency);
    }

    /**
     * Remove the specified currency.
     */
    public function destroy($id)
    {
        $currency = Currency::findOrFail($id);
        $currency->delete();

        return response()->json(['message' => 'Currency deleted successfully']);
    }
}
