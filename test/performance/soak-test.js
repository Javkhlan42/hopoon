import http from 'k6/http';
import { check, sleep } from 'k6';

// Soak test - sustained load over time
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '30m', target: 100 },  // Stay at 100 for 30 minutes
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Simulate real user behavior
  const scenarios = [
    () => {
      // Search rides
      http.get(`${BASE_URL}/rides/search?origin=Ulaanbaatar&destination=Darkhan`);
      sleep(2);
    },
    () => {
      // Check health
      http.get(`${BASE_URL}/health`);
      sleep(1);
    },
    () => {
      // View ride feed
      http.get(`${BASE_URL}/rides?page=1&limit=20`);
      sleep(3);
    },
  ];

  // Execute random scenario
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenario();
}
