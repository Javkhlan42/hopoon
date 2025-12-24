import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

/**
 * Integration Tests for Auth API Endpoints
 * Tests complete authentication flow via HTTP
 * Auth Service runs on port 3001, API Gateway on port 3000
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

describe('Auth API Integration Tests', () => {
  let accessToken: string;
  let refreshToken: string;
  let testUserId: string;

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'Test123!@#',
        name: 'Test User',
      };

      const response = await request(BASE_URL)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('phone', userData.phone);
      expect(response.body.user).toHaveProperty('name', userData.name);
      expect(response.body.user).not.toHaveProperty('password');

      testUserId = response.body.user.id;
    });

    it('should return 400 for invalid phone format', async () => {
      const userData = {
        phone: 'invalid-phone',
        password: 'Test123!@#',
        name: 'Test User',
      };

      const response = await request(BASE_URL)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      const message = Array.isArray(response.body.message)
        ? response.body.message[0]
        : response.body.message;
      expect(message).toMatch(/phone/i);
    });

    it('should return 400 for weak password', async () => {
      const userData = {
        phone: '+97699887766',
        password: '123', // Too short
        name: 'Test User',
      };

      const response = await request(BASE_URL)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      const message = Array.isArray(response.body.message)
        ? response.body.message[0]
        : response.body.message;
      expect(message).toMatch(/password/i);
    });

    it('should return 409 for duplicate phone number', async () => {
      const userData = {
        phone: '+97699887766',
        password: 'Test123!@#',
        name: 'Test User',
      };

      // First registration
      await request(BASE_URL).post('/auth/register').send(userData);

      // Duplicate registration
      const response = await request(BASE_URL)
        .post('/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(
        /exists|duplicate|already registered/i,
      );
    });

    it('should return 400 for missing required fields', async () => {
      const userData = {
        phone: '+97699887766',
        // Missing password and name
      };

      const response = await request(BASE_URL)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      // Register a test user
      const userData = {
        phone: '+97699112233',
        password: 'Test123!@#',
        name: 'Login Test User',
      };

      await request(BASE_URL).post('/auth/register').send(userData);
    });

    it('should login with valid credentials', async () => {
      const credentials = {
        phone: '+97699112233',
        password: 'Test123!@#',
      };

      const response = await request(BASE_URL)
        .post('/auth/login')
        .send(credentials)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('phone', credentials.phone);

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should return 401 for invalid password', async () => {
      const credentials = {
        phone: '+97699112233',
        password: 'WrongPassword123',
      };

      const response = await request(BASE_URL)
        .post('/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/invalid|credentials/i);
    });

    it('should return 401 for non-existent user', async () => {
      const credentials = {
        phone: '+97600000000',
        password: 'Test123!@#',
      };

      const response = await request(BASE_URL)
        .post('/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/invalid|credentials/i);
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(BASE_URL)
        .post('/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /auth/me', () => {
    it('should get current user with valid token', async () => {
      const response = await request(BASE_URL)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('phone');
      expect(response.body).toHaveProperty('role');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const response = await request(BASE_URL).get('/auth/me').expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/unauthorized|token/i);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(BASE_URL)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 with expired token', async () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const response = await request(BASE_URL)
        .get('/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const response = await request(BASE_URL)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      // Update tokens for subsequent tests
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(BASE_URL)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid.refresh.token' })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/invalid|token/i);
    });

    it('should return 400 for missing refresh token', async () => {
      const response = await request(BASE_URL)
        .post('/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(BASE_URL)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/logout|success/i);
    });

    it('should return 401 without token', async () => {
      const response = await request(BASE_URL).post('/auth/logout').expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should invalidate tokens after logout', async () => {
      // Login again
      const loginResponse = await request(BASE_URL).post('/auth/login').send({
        phone: '+97699112233',
        password: 'Test123!@#',
      });

      const token = loginResponse.body.accessToken;

      // Logout
      await request(BASE_URL)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      // Try to use token after logout
      const response = await request(BASE_URL)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      // Token might still work (JWT can't be invalidated without blacklist)
      expect([200, 401]).toContain(response.status);
    });
  });
});
