<?php

namespace App\Http\Controllers;

use App\Models\Provider;
use Illuminate\Http\Request;

class ProviderController extends Controller
{
    /**
     * Display a listing of the providers.
     */
    public function index()
    {
        $providers = Provider::all();
        return response()->json($providers);
    }

    /**
     * Store a newly created provider.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'website' => 'nullable|url',
            'rating' => 'nullable|numeric|min:0|max:5',
            'status' => 'nullable|string',
            'logo_url' => 'nullable|url',
            'is_active' => 'nullable|boolean',
        ]);

        $provider = Provider::create($request->all());

        return response()->json($provider, 201);
    }

    /**
     * Update the specified provider.
     */
    public function update(Request $request, $id)
    {
        $provider = Provider::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'website' => 'nullable|url',
            'rating' => 'nullable|numeric|min:0|max:5',
            'status' => 'nullable|string',
            'logo_url' => 'nullable|url',
            'is_active' => 'nullable|boolean',
        ]);

        $provider->update($request->all());

        return response()->json($provider);
    }

    /**
     * Remove the specified provider.
     */
    public function destroy($id)
    {
        $provider = Provider::findOrFail($id);
        $provider->delete();

        return response()->json(['message' => 'Provider deleted successfully']);
    }
}
