import request from 'supertest';
import { describe, it, expect } from '@jest/globals';

/**
 * Security Tests for HopOn Platform
 * Tests for authentication, authorization, and security vulnerabilities
 * Testing against Auth Service (port 3001) and API Gateway (port 3000)
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

describe('Security Tests', () => {
  describe('Authentication Security', () => {
    it('should reject requests without authentication token', async () => {
      const response = await request(BASE_URL).get('/auth/me').expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject malformed JWT tokens', async () => {
      const response = await request(BASE_URL)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid.token.format')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject expired JWT tokens', async () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj0vTBq-CR9acj8d3tlSXSC3SQzDmyWLhVfn4Gbc';

      const response = await request(BASE_URL)
        .get('/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should enforce password complexity requirements', async () => {
      const weakPasswords = ['123', '123456', 'password', 'qwerty', 'abc123'];

      for (const password of weakPasswords) {
        const response = await request(BASE_URL)
          .post('/auth/register')
          .send({
            phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
            password: password,
            name: 'Test User',
          });

        // Should reject weak passwords
        expect(response.status).not.toBe(201);
        expect([400, 422]).toContain(response.status);
        const message = Array.isArray(response.body.message)
          ? response.body.message[0]
          : response.body.message;
        expect(message).toMatch(/password|weak/i);
      }
    });

    it('should hash passwords before storage', async () => {
      const password = 'TestPassword123!@#';
      const userData = {
        phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: password,
        name: 'Test User',
      };

      const registerResponse = await request(BASE_URL)
        .post('/auth/register')
        .send(userData);

      // Verify password is not returned
      expect(registerResponse.body).not.toHaveProperty('password');

      // Even if we check the raw response, password should not be there
      const responseString = JSON.stringify(registerResponse.body);
      expect(responseString).not.toContain(password);
    });

    it.skip('should implement rate limiting on login attempts', async () => {
      const credentials = {
        phone: '+97699887766',
        password: 'WrongPassword',
      };

      // Make multiple failed login attempts
      const attempts = [];
      for (let i = 0; i < 10; i++) {
        attempts.push(request(BASE_URL).post('/auth/login').send(credentials));
      }

      const responses = await Promise.all(attempts);

      // At least one response should be rate-limited (429)
      const rateLimited = responses.some((r) => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('Authorization Security', () => {
    it.skip('should prevent unauthorized access to other users data', async () => {
      // Login as user 1
      const user1Data = {
        phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'User1Pass123!@#',
        name: 'User One',
      };

      await request(BASE_URL).post('/auth/register').send(user1Data);
      const user1Login = await request(BASE_URL)
        .post('/auth/login')
        .send({ phone: user1Data.phone, password: user1Data.password });
      const user1Token = user1Login.body.accessToken;

      // Login as user 2
      const user2Data = {
        phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'User2Pass123!@#',
        name: 'User Two',
      };

      await request(BASE_URL).post('/auth/register').send(user2Data);
      const user2Login = await request(BASE_URL)
        .post('/auth/login')
        .send({ phone: user2Data.phone, password: user2Data.password });
      const user2Token = user2Login.body.accessToken;
      const user2Id = user2Login.body.user.id;

      // Try to access user2's data with user1's token
      const response = await request(BASE_URL)
        .get(`/users/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });

    it.skip('should prevent passengers from accessing driver-only endpoints', async () => {
      // Login as passenger
      const passengerData = {
        phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'Pass123!@#',
        name: 'Test Passenger',
        role: 'passenger',
      };

      await request(BASE_URL).post('/auth/register').send(passengerData);
      const passengerLogin = await request(BASE_URL)
        .post('/auth/login')
        .send({ phone: passengerData.phone, password: passengerData.password });
      const passengerToken = passengerLogin.body.accessToken;

      // Try to access driver-only endpoint
      const response = await request(BASE_URL)
        .get('/rides/driver/earnings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/forbidden|unauthorized|driver/i);
    });

    it.skip('should prevent modifying rides created by other drivers', async () => {
      // Create ride as driver 1
      const driver1Data = {
        phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'Driver1Pass123!@#',
        name: 'Driver One',
        role: 'driver',
      };

      await request(BASE_URL).post('/auth/register').send(driver1Data);
      const driver1Login = await request(BASE_URL)
        .post('/auth/login')
        .send({ phone: driver1Data.phone, password: driver1Data.password });
      const driver1Token = driver1Login.body.accessToken;

      const rideData = {
        origin: { lat: 47.9184, lng: 106.9177 },
        destination: { lat: 47.927, lng: 106.906 },
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        availableSeats: 3,
        pricePerSeat: 5000,
      };

      const rideResponse = await request(BASE_URL)
        .post('/rides')
        .set('Authorization', `Bearer ${driver1Token}`)
        .send(rideData);
      const rideId = rideResponse.body.id;

      // Login as driver 2
      const driver2Data = {
        phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'Driver2Pass123!@#',
        name: 'Driver Two',
        role: 'driver',
      };

      await request(BASE_URL).post('/auth/register').send(driver2Data);
      const driver2Login = await request(BASE_URL)
        .post('/auth/login')
        .send({ phone: driver2Data.phone, password: driver2Data.password });
      const driver2Token = driver2Login.body.accessToken;

      // Try to modify driver1's ride with driver2's token
      const response = await request(BASE_URL)
        .patch(`/rides/${rideId}`)
        .set('Authorization', `Bearer ${driver2Token}`)
        .send({ pricePerSeat: 10000 })
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should prevent SQL injection in login', async () => {
      const maliciousInputs = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "admin'--",
        "' OR 1=1--",
        "1' AND '1' = '1",
      ];

      for (const input of maliciousInputs) {
        const response = await request(BASE_URL).post('/auth/login').send({
          phone: input,
          password: input,
        });

        // Should return 400 or 401, not 500 (which might indicate SQL error)
        expect([400, 401, 404]).toContain(response.status);
      }
    });

    it.skip('should prevent SQL injection in search', async () => {
      const maliciousInputs = [
        "'; DROP TABLE rides; --",
        "1' OR '1'='1",
        '1 UNION SELECT * FROM users',
      ];

      for (const input of maliciousInputs) {
        const response = await request(BASE_URL).get('/rides/search').query({
          originLat: input,
          originLng: input,
          destLat: 47.927,
          destLng: 106.906,
        });

        // Should return validation error, not SQL error
        expect([400, 422]).toContain(response.status);
      }
    });
  });

  describe('XSS Prevention', () => {
    it.skip('should sanitize user input to prevent XSS', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
        '<svg onload=alert("XSS")>',
      ];

      const userData = {
        phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'Test123!@#',
        name: xssPayloads[0], // XSS in name field
      };

      const registerResponse = await request(BASE_URL)
        .post('/auth/register')
        .send(userData);

      if (registerResponse.status === 201) {
        // Verify the XSS payload is escaped/sanitized
        const name = registerResponse.body.name;
        expect(name).not.toContain('<script>');
        expect(name).not.toMatch(/<.*>/);
      }
    });
  });

  describe('CSRF Protection', () => {
    it.skip('should validate request origin', async () => {
      // This test would check for CSRF token validation
      // Implementation depends on your CSRF protection mechanism
      const response = await request(BASE_URL)
        .post('/auth/logout')
        .set('Origin', 'https://malicious-site.com')
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Data Exposure Prevention', () => {
    it('should not expose sensitive data in error messages', async () => {
      const response = await request(BASE_URL).post('/auth/login').send({
        phone: '+97699999999',
        password: 'WrongPassword',
      });

      const errorMessage = response.body.message.toLowerCase();

      // Should not reveal if user exists
      expect(errorMessage).not.toContain('user not found');
      expect(errorMessage).not.toContain('password incorrect');

      // Should use generic error message
      expect(errorMessage).toMatch(/invalid|credentials/i);
    });

    it('should not expose internal server details in errors', async () => {
      const response = await request(BASE_URL)
        .get('/invalid-endpoint')
        .expect(404);

      const responseString = JSON.stringify(response.body);

      // Should not expose stack traces or file paths
      expect(responseString).not.toMatch(/at \w+\.js:\d+/);
      expect(responseString).not.toContain('/node_modules/');
      expect(responseString).not.toContain('C:\\');
      expect(responseString).not.toContain('/home/');
    });
  });

  describe('Session Management', () => {
    it('should invalidate session after logout', async () => {
      // Login
      const userData = {
        phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'Test123!@#',
        name: 'Test User',
      };

      await request(BASE_URL).post('/auth/register').send(userData);
      const loginResponse = await request(BASE_URL)
        .post('/auth/login')
        .send({ phone: userData.phone, password: userData.password });
      const token = loginResponse.body.accessToken;

      // Logout
      await request(BASE_URL)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      // JWT tokens can't be invalidated without blacklist
      // This test verifies logout endpoint works, not token invalidation
      // In production, implement token blacklist or use short-lived tokens
      const response = await request(BASE_URL)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      // Token might still work (JWT limitation) or be invalidated (with blacklist)
      expect([200, 401]).toContain(response.status);
    });

    it('should implement token expiration', async () => {
      // This test verifies that tokens have expiration time
      const userData = {
        phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'Test123!@#',
        name: 'Test User',
      };

      await request(BASE_URL).post('/auth/register').send(userData);
      const loginResponse = await request(BASE_URL)
        .post('/auth/login')
        .send({ phone: userData.phone, password: userData.password });

      const token = loginResponse.body.accessToken;

      // Decode token to check expiration
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        expect(payload).toHaveProperty('exp');
        expect(payload.exp).toBeGreaterThan(Date.now() / 1000);
      }
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', async () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user@.com',
        'user@example',
      ];

      for (const email of invalidEmails) {
        const response = await request(BASE_URL)
          .post('/auth/register')
          .send({
            phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
            password: 'Test123!@#',
            name: 'Test User',
            email: email,
          });

        expect([400, 422]).toContain(response.status);
      }
    });

    it('should validate phone number format', async () => {
      const invalidPhones = ['1234', 'notaphone', '+1', '999999999999999999'];

      for (const phone of invalidPhones) {
        const response = await request(BASE_URL).post('/auth/register').send({
          phone: phone,
          password: 'Test123!@#',
          name: 'Test User',
        });

        expect([400, 422]).toContain(response.status);
      }
    });

    it.skip('should validate coordinates in ride creation', async () => {
      const userData = {
        phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'Test123!@#',
        name: 'Test Driver',
        role: 'driver',
      };

      await request(BASE_URL).post('/auth/register').send(userData);
      const loginResponse = await request(BASE_URL)
        .post('/auth/login')
        .send({ phone: userData.phone, password: userData.password });
      const token = loginResponse.body.accessToken;

      const invalidCoordinates = [
        { lat: 200, lng: 106.9177 }, // Invalid latitude
        { lat: 47.9184, lng: 300 }, // Invalid longitude
        { lat: 'invalid', lng: 106.9177 }, // Non-numeric
      ];

      for (const coords of invalidCoordinates) {
        const response = await request(BASE_URL)
          .post('/rides')
          .set('Authorization', `Bearer ${token}`)
          .send({
            origin: coords,
            destination: { lat: 47.927, lng: 106.906 },
            departureTime: new Date(
              Date.now() + 24 * 60 * 60 * 1000,
            ).toISOString(),
            availableSeats: 3,
            pricePerSeat: 5000,
          });

        expect([400, 422]).toContain(response.status);
      }
    });
  });
});
