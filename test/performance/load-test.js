import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    errors: ['rate<0.1'],             // Error rate should be below 10%
  },
};

const BASE_URL = 'http://localhost:3000';

// Test data
const users = [
  { phone: '+97699001122', password: 'Test123' },
  { phone: '+97699223344', password: 'Test123' },
  { phone: '+97699445566', password: 'Test123' },
];

export function setup() {
  // Register test users
  users.forEach((user) => {
    http.post(`${BASE_URL}/auth/register`, JSON.stringify({
      ...user,
      name: 'Load Test User',
      email: `${user.phone}@test.com`,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  });

  return { users };
}

export default function (data) {
  // Select random user
  const user = data.users[Math.floor(Math.random() * data.users.length)];

  // Login
  let loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify(user),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login has token': (r) => JSON.parse(r.body).accessToken !== undefined,
  }) || errorRate.add(1);

  if (loginRes.status !== 200) {
    return;
  }

  const authToken = JSON.parse(loginRes.body).accessToken;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  };

  sleep(1);

  // Search rides
  let searchRes = http.get(
    `${BASE_URL}/rides/search?origin=Ulaanbaatar&destination=Darkhan`,
    { headers }
  );

  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
    'search returns array': (r) => Array.isArray(JSON.parse(r.body)),
  }) || errorRate.add(1);

  sleep(1);

  // Create ride (50% of users)
  if (Math.random() > 0.5) {
    let createRideRes = http.post(
      `${BASE_URL}/rides`,
      JSON.stringify({
        origin: 'Ulaanbaatar',
        destination: 'Darkhan',
        departureTime: new Date(Date.now() + 86400000).toISOString(),
        availableSeats: 3,
        pricePerSeat: 15000,
      }),
      { headers }
    );

    check(createRideRes, {
      'create ride status is 201': (r) => r.status === 201,
      'create ride has id': (r) => JSON.parse(r.body).id !== undefined,
    }) || errorRate.add(1);
  }

  sleep(2);

  // Get user's rides
  let myRidesRes = http.get(`${BASE_URL}/rides/my-rides`, { headers });

  check(myRidesRes, {
    'my rides status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Get bookings
  let bookingsRes = http.get(`${BASE_URL}/bookings`, { headers });

  check(bookingsRes, {
    'bookings status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(2);
}

export function teardown(data) {
  console.log('Load test completed');
}
