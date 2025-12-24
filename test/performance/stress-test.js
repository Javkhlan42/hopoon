import http from 'k6/http';
import { check, sleep } from 'k6';

// Stress test configuration - push system to limits
export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Ramp up to 100 users
    { duration: '2m', target: 200 },   // Ramp up to 200 users
    { duration: '3m', target: 500 },   // Spike to 500 users
    { duration: '2m', target: 1000 },  // Extreme load: 1000 users
    { duration: '3m', target: 1000 },  // Stay at 1000
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% requests under 1s
    http_req_failed: ['rate<0.2'],     // Error rate under 20%
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Test ride search endpoint under heavy load
  const searchRes = http.get(
    `${BASE_URL}/rides/search?origin=Ulaanbaatar&destination=Darkhan`
  );

  check(searchRes, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(0.5);

  // Test health endpoint
  const healthRes = http.get(`${BASE_URL}/health`);

  check(healthRes, {
    'health check is 200': (r) => r.status === 200,
  });

  sleep(0.3);
}
