# Exercise 04: External API Integration

Learn to call external APIs securely from Edge Functions with caching and rate limit handling.

## Learning Objectives

- Call external APIs securely
- Hide API credentials
- Implement response caching
- Handle rate limits
- Transform API data
- Handle API errors
- Optimize API calls

## Prerequisites

- Completed Exercise 03
- Understanding of REST APIs
- Basic knowledge of caching
- API key from external service

## Estimated Time

30 minutes

## Part 1: Choose External API (5 minutes)

For this exercise, we'll use the **OpenWeatherMap API** (free tier available).

### Task 1.1: Create Account

1. Go to [openweathermap.org](https://openweathermap.org/api)
2. Sign up for free account
3. Verify your email

### Task 1.2: Get API Key

1. Go to **API keys** section
2. Copy your API key
3. Note: It may take a few minutes to activate

### Task 1.3: Set Environment Variable

```bash
supabase secrets set OPENWEATHER_API_KEY=your_key_here
```

Add to `.env.local`:
```
OPENWEATHER_API_KEY=your_key_here
```

## Part 2: Create API Integration Function (12 minutes)

### Task 2.1: Create Function

```bash
supabase functions new get-weather
```

### Task 2.2: Write Function with Caching

**File**: `supabase/functions/get-weather/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache (resets on cold start)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { city } = await req.json();

    if (!city) {
      return new Response(
        JSON.stringify({ error: 'City is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check cache
    const cacheKey = `weather:${city.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Cache hit for:', city);
      return new Response(
        JSON.stringify({ ...cached.data, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call OpenWeatherMap API
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ error: 'City not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      throw new Error(`API error: ${response.status}`);
    }

    const weatherData = await response.json();

    // Transform data
    const transformed = {
      city: weatherData.name,
      country: weatherData.sys.country,
      temperature: Math.round(weatherData.main.temp),
      feelsLike: Math.round(weatherData.main.feels_like),
      humidity: weatherData.main.humidity,
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      windSpeed: weatherData.wind.speed,
      timestamp: new Date().toISOString(),
      cached: false,
    };

    // Store in cache
    cache.set(cacheKey, { data: transformed, timestamp: Date.now() });

    return new Response(
      JSON.stringify(transformed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Weather API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch weather data',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

### Task 2.3: Test Locally

```bash
supabase functions serve get-weather --env-file .env.local

# Test
curl -i --location --request POST 'http://localhost:54321/functions/v1/get-weather' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{"city":"Tokyo"}'
```

### Task 2.4: Deploy

```bash
supabase functions deploy get-weather
```

## Part 3: Advanced Caching with Database (8 minutes)

### Task 3.1: Create Cache Table

```sql
CREATE TABLE api_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_cache_key ON api_cache(cache_key);
CREATE INDEX idx_api_cache_expires ON api_cache(expires_at);
```

### Task 3.2: Update Function with Database Caching

```typescript
async function getCachedData(
  supabase: any,
  cacheKey: string
): Promise<any | null> {
  const { data, error } = await supabase
    .from('api_cache')
    .select('data, expires_at')
    .eq('cache_key', cacheKey)
    .single();

  if (error || !data) return null;

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    // Delete expired cache
    await supabase
      .from('api_cache')
      .delete()
      .eq('cache_key', cacheKey);
    return null;
  }

  return data.data;
}

async function setCachedData(
  supabase: any,
  cacheKey: string,
  data: any,
  ttlMinutes: number
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

  await supabase
    .from('api_cache')
    .upsert({
      cache_key: cacheKey,
      data,
      expires_at: expiresAt.toISOString(),
    });
}
```

## Part 4: Rate Limit Handling (3 minutes)

### Task 4.1: Implement Retry with Backoff

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);

      // Success
      if (response.ok) {
        return response;
      }

      // Rate limited - retry with backoff
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter 
          ? parseInt(retryAfter) * 1000 
          : Math.pow(2, i) * 1000;

        console.log(`Rate limited. Retrying after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Other errors - don't retry
      return response;

    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  throw new Error('Max retries exceeded');
}
```

## Part 5: Frontend Integration (2 minutes)

### Task 5.1: Create Weather Component

**File**: `components/weather-widget.tsx`

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function WeatherWidget() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'get-weather',
        { body: { city } }
      );

      if (functionError) throw functionError;

      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Weather Widget</h2>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
            className="flex-1 p-2 border rounded"
            placeholder="Enter city name"
          />
          <button
            onClick={fetchWeather}
            disabled={loading || !city}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Weather'}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {weather && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold">
                {weather.city}, {weather.country}
              </h3>
              {weather.cached && (
                <span className="text-xs bg-yellow-100 px-2 py-1 rounded">
                  Cached
                </span>
              )}
            </div>
            <div className="text-4xl font-bold mb-2">
              {weather.temperature}°C
            </div>
            <p className="text-gray-600 capitalize">{weather.description}</p>
            <div className="mt-3 text-sm text-gray-600">
              <p>Feels like: {weather.feelsLike}°C</p>
              <p>Humidity: {weather.humidity}%</p>
              <p>Wind: {weather.windSpeed} m/s</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Challenges

### Challenge 1: Multiple APIs
Integrate multiple weather APIs and fallback if one fails.

### Challenge 2: Geocoding
Add geocoding to support searching by coordinates.

### Challenge 3: Forecast
Extend to show 5-day weather forecast.

### Challenge 4: Currency Converter
Create a function that calls a currency exchange rate API.

### Challenge 5: News Aggregator
Build a function that fetches and aggregates news from multiple sources.

## Key Takeaways

- Hide API keys in Edge Functions
- Implement caching to reduce API calls
- Handle rate limits gracefully
- Transform API responses for frontend
- Use retry logic with exponential backoff
- Cache in database for persistence
- Monitor API usage and costs
- Handle errors appropriately

## Next Exercise

Continue to Exercise 05 to implement scheduled tasks!
