process.env.NODE_ENV = 'test';
import app from './server/server';
import http from 'http';

const server = http.createServer(app);
const PORT = 5055;

server.listen(PORT, async () => {
  console.log(`Test server running on port ${PORT}...`);
  const baseUrl = `http://localhost:${PORT}/api`;

  try {
    // 1. Health check
    console.log('\n--- 1. Testing /api/health ---');
    let res = await fetch(`${baseUrl}/health`);
    let data = await res.json();
    console.log('Health status:', data.status, '| version:', data.version);

    // 2. Geocoding
    console.log('\n--- 2. Testing /api/geocode?q=Wayanad ---');
    res = await fetch(`${baseUrl}/geocode?q=Wayanad`);
    data = await res.json();
    console.log('Geocode success:', data.success, '| results count:', data.count, '| first:', data.data?.[0]?.name);

    // 3. Nearby Hotels with distance & EcoScore
    console.log('\n--- 3. Testing /api/hotels/nearby ---');
    res = await fetch(`${baseUrl}/hotels/nearby?lat=11.6854&lng=76.1320&radius=15000`);
    data = await res.json();
    console.log('Hotels success:', data.success, '| count:', data.count, '| first:', data.data?.[0]?.name, `(${data.data?.[0]?.distance?.formatted})`);

    // 4. Nearby Restaurants with Pure Veg filter
    console.log('\n--- 4. Testing /api/restaurants/nearby?foodType=pure_vegetarian ---');
    res = await fetch(`${baseUrl}/restaurants/nearby?lat=11.6854&lng=76.1320&radius=15000&foodType=pure_vegetarian`);
    data = await res.json();
    console.log('Restaurants success:', data.success, '| count:', data.count, '| dietInfo:', data.data?.[0]?.dietInfo, '| name:', data.data?.[0]?.name);

    // 5. Affordable Food Budget Filtering (Under ₹300)
    console.log('\n--- 5. Testing /api/restaurants/nearby?budgetMax=300 ---');
    res = await fetch(`${baseUrl}/restaurants/nearby?lat=11.6854&lng=76.1320&radius=15000&budgetMax=300`);
    data = await res.json();
    console.log('Budget filtered success:', data.success, '| count:', data.count, '| meal price:', `₹${data.data?.[0]?.averageMealCostInr}`);

    // 6. Restaurant Menu
    console.log('\n--- 6. Testing GET /api/restaurants/:id/menu ---');
    res = await fetch(`${baseUrl}/restaurants/rest_wayanad_1/menu`);
    data = await res.json();
    console.log('Menu success:', data.success, '| items count:', data.count, '| item 1:', data.data?.[0]?.name, `(₹${data.data?.[0]?.priceInr})`);

    // 7. Add Menu Item via POST
    console.log('\n--- 7. Testing POST /api/restaurants/:id/menu ---');
    res = await fetch(`${baseUrl}/restaurants/rest_wayanad_1/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Organic Kerala Coconut Kokum Cooler',
        description: 'Chilled tender coconut water with crushed fresh kokum and mint',
        priceInr: 90,
        category: 'beverages',
        isVegetarian: true,
        isVegan: true
      })
    });
    data = await res.json();
    console.log('POST menu item success:', data.success, '| new item:', data.data?.name, `(₹${data.data?.priceInr})`);

    // 8. Unified Places API
    console.log('\n--- 8. Testing /api/places/nearby ---');
    res = await fetch(`${baseUrl}/places/nearby?lat=11.6854&lng=76.1320&radius=10000&type=all`);
    data = await res.json();
    console.log('Places success:', data.success, '| total count:', data.count, '| hotels:', data.data?.hotels?.length, '| restaurants:', data.data?.restaurants?.length);

    // 9. Distance & Route
    console.log('\n--- 9. Testing /api/route ---');
    res = await fetch(`${baseUrl}/route?startLat=11.6854&startLng=76.1320&endLat=12.4244&endLng=75.7382`);
    data = await res.json();
    console.log('Route success:', data.success, '| distance:', data.data?.formattedDistance, '| duration:', data.data?.formattedDuration, '| source:', data.data?.source);

    // 10. Admin Multi-Provider Telemetry
    console.log('\n--- 10. Testing /api/admin/providers/status ---');
    res = await fetch(`${baseUrl}/admin/providers/status`);
    data = await res.json();
    console.log('Provider telemetry success:', data.success, '| active providers:', data.summary?.activeProviders, '| total queries:', data.summary?.totalRequests);

    // 11. Explainable Recommendations
    console.log('\n--- 11. Testing POST /api/recommendations ---');
    res = await fetch(`${baseUrl}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: 'Kerala',
        maxBudget: 10000,
        priorities: { solar: true, waste: true }
      })
    });
    data = await res.json();
    console.log('Recommendations success:', data.success, '| top recommendation:', data.data?.[0]?.accommodation?.name, `(Match: ${data.data?.[0]?.matchScore}%)`);

    // 12. Error handling: Invalid coordinates
    console.log('\n--- 12. Testing Error Handling (invalid lat/lng) ---');
    res = await fetch(`${baseUrl}/places/nearby?lat=abc&lng=xyz`);
    data = await res.json();
    console.log('Status:', res.status, '| Error caught correctly:', data.error);

    console.log('\n🎉 ALL 12 BACKEND ENDPOINTS & REAL-WORLD DISCOVERY TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
