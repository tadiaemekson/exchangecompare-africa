<?php
namespace App\Http\Controllers;

use App\Models\Alert;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    /**
     * Display a listing of the user's alerts.
     */
    public function index(Request $request)
    {
        $alerts = Alert::where('user_id', $request->user()->id)
                    ->with(['currencyFrom', 'currencyTo'])
                    ->get();
        return response()->json($alerts);
    }

    /**
     * Store a newly created alert.
     */
    public function store(Request $request)
    {
        $request->validate([
            'currency_from_id' => 'required|exists:currencies,id',
            'currency_to_id' => 'required|exists:currencies,id',
            'target_rate' => 'required|numeric',
            'condition' => 'required|string|in:above,below',
        ]);

        $alert = Alert::create([
            'user_id' => $request->user()->id,
            'currency_from_id' => $request->currency_from_id,
            'currency_to_id' => $request->currency_to_id,
            'target_rate' => $request->target_rate,
            'condition' => $request->condition,
            'is_active' => true,
        ]);

        return response()->json($alert->load(['currencyFrom', 'currencyTo']), 201);
    }

    /**
     * Update the specified alert.
     */
    public function update(Request $request, $id)
    {
        $alert = Alert::where('user_id', $request->user()->id)->findOrFail($id);

        $request->validate([
            'target_rate' => 'sometimes|numeric',
            'condition' => 'sometimes|string|in:above,below',
            'is_active' => 'sometimes|boolean',
        ]);

        $alert->update($request->all());

        return response()->json($alert->load(['currencyFrom', 'currencyTo']));
    }

    /**
     * Remove the specified alert.
     */
    public function destroy(Request $request, $id)
    {
        $alert = Alert::where('user_id', $request->user()->id)->findOrFail($id);
        $alert->delete();

        return response()->json(['message' => 'Alert deleted successfully']);
    }
}
