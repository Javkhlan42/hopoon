#!/usr/bin/env node
/**
 * Script to check if microservices are running before executing tests
 */

const http = require('http');

const SERVICES = [
  {
    name: 'Auth Service',
    url: process.env.AUTH_URL || 'http://localhost:3001',
    path: '/health',
  },
  {
    name: 'Ride Service',
    url: process.env.RIDE_URL || 'http://localhost:3003',
    path: '/health',
  },
  {
    name: 'Booking Service',
    url: process.env.BOOKING_URL || 'http://localhost:3004',
    path: '/health',
  },
];

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds

function checkService(service, retries = 0) {
  return new Promise((resolve, reject) => {
    const url = new URL(service.url);

    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: service.path,
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        // 404 is OK - service is running but health endpoint might not exist
        console.log(`✓ ${service.name} is running`);
        resolve(true);
      } else {
        console.log(
          `✗ ${service.name} returned status code: ${res.statusCode}`,
        );
        if (retries < MAX_RETRIES) {
          console.log(
            `Retrying ${service.name} in ${RETRY_DELAY / 1000} seconds... (${retries + 1}/${MAX_RETRIES})`,
          );
          setTimeout(() => {
            checkService(service, retries + 1)
              .then(resolve)
              .catch(reject);
          }, RETRY_DELAY);
        } else {
          reject(
            new Error(
              `${service.name} is not responding correctly after multiple retries`,
            ),
          );
        }
      }
    });

    req.on('error', (err) => {
      console.log(`✗ Cannot connect to ${service.name}: ${err.message}`);
      if (retries < MAX_RETRIES) {
        console.log(
          `Retrying ${service.name} in ${RETRY_DELAY / 1000} seconds... (${retries + 1}/${MAX_RETRIES})`,
        );
        setTimeout(() => {
          checkService(service, retries + 1)
            .then(resolve)
            .catch(reject);
        }, RETRY_DELAY);
      } else {
        console.error(
          `\n❌ ${service.name} is not available at: ${service.url}`,
        );
        reject(new Error(`${service.name} is not available`));
      }
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`✗ ${service.name} request timeout`);
      if (retries < MAX_RETRIES) {
        console.log(
          `Retrying ${service.name} in ${RETRY_DELAY / 1000} seconds... (${retries + 1}/${MAX_RETRIES})`,
        );
        setTimeout(() => {
          checkService(service, retries + 1)
            .then(resolve)
            .catch(reject);
        }, RETRY_DELAY);
      } else {
        reject(new Error(`${service.name} timeout after multiple retries`));
      }
    });

    req.end();
  });
}

async function checkAllServices() {
  console.log('Checking microservices...\n');

  const results = await Promise.allSettled(
    SERVICES.map((service) => checkService(service)),
  );

  const failed = results.filter((r) => r.status === 'rejected');

  if (failed.length > 0) {
    console.error('\n❌ Some services are not available:');
    failed.forEach((result, index) => {
      const service = SERVICES.find((s, i) => results[i] === result);
      if (service) {
        console.error(`   - ${service.name}: ${service.url}`);
      }
    });
    console.error('\nPlease start the required services:');
    console.error('   nx serve auth-service');
    console.error('   nx serve ride-service');
    console.error('   nx serve booking-service\n');
    process.exit(1);
  } else {
    console.log('\n✓ All services ready for testing\n');
    process.exit(0);
  }
}

checkAllServices();
