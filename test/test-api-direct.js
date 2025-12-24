const request = require('supertest');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

console.log('Testing BASE_URL:', BASE_URL);

request(BASE_URL)
  .post('/auth/register')
  .send({
    phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'Test123!@#',
    name: 'Test User Direct',
  })
  .end((err, res) => {
    console.log('Error:', err);
    console.log('Response status:', res?.status);
    console.log('Response body:', res?.body);
    console.log('Response text:', res?.text);
  });
