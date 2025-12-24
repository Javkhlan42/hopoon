import http from 'k6/http';
import { check, sleep } from 'k6';

// Spike test - sudden traffic surge
export const options = {
  stages: [
    { duration: '30s', target: 50 },    // Normal load
    { duration: '10s', target: 1000 },  // Sudden spike
    { duration: '1m', target: 1000 },   // Stay at spike
    { duration: '10s', target: 50 },    // Drop back to normal
    { duration: '30s', target: 50 },    // Stay normal
    { duration: '10s', target: 0 },     // End
  ],
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/rides/search?origin=Ulaanbaatar`);

  check(res, {
    'spike test status is 200': (r) => r.status === 200,
    'spike test response time OK': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
