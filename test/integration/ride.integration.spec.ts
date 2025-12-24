import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

/**
 * Integration Tests for Ride API Endpoints
 * Tests complete ride lifecycle via HTTP
 * Ride Service runs on port 3003
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3003';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3001';

describe('Ride API Integration Tests', () => {
  let accessToken: string;
  let driverId: string;
  let rideId: string;

  beforeAll(async () => {
    // Register and login a driver
    const driverData = {
      phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'Driver123!@#',
      name: 'Test Driver',
    };

    await request(AUTH_URL).post('/auth/register').send(driverData);

    const loginResponse = await request(AUTH_URL).post('/auth/login').send({
      phone: driverData.phone,
      password: driverData.password,
    });

    accessToken = loginResponse.body.accessToken;
    driverId = loginResponse.body.user?.id || loginResponse.body.user;
  });

  describe('POST /rides', () => {
    it('should create a new ride successfully', async () => {
      const rideData = {
        origin: {
          lat: 47.9184,
          lng: 106.9177,
          address: 'Sukhbaatar Square, Ulaanbaatar',
        },
        destination: {
          lat: 47.927,
          lng: 106.906,
          address: 'Zaisan Memorial, Ulaanbaatar',
        },
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        availableSeats: 3,
        pricePerSeat: 5000,
        preferences: {
          smokingAllowed: false,
          petsAllowed: true,
          musicAllowed: true,
        },
      };

      const response = await request(BASE_URL)
        .post('/rides')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(rideData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('driverId', driverId);
      expect(response.body).toHaveProperty('status', 'scheduled');
      expect(response.body.origin).toMatchObject(rideData.origin);
      expect(response.body.destination).toMatchObject(rideData.destination);
      expect(response.body).toHaveProperty('availableSeats', 3);
      expect(response.body).toHaveProperty('pricePerSeat', 5000);

      rideId = response.body.id;
    });

    it('should return 401 without authentication', async () => {
      const rideData = {
        origin: { lat: 47.9184, lng: 106.9177 },
        destination: { lat: 47.927, lng: 106.906 },
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        availableSeats: 3,
        pricePerSeat: 5000,
      };

      const response = await request(BASE_URL)
        .post('/rides')
        .send(rideData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for invalid departure time', async () => {
      const rideData = {
        origin: {
          lat: 47.9184,
          lng: 106.9177,
          address: 'Sukhbaatar Square, Ulaanbaatar',
        },
        destination: {
          lat: 47.927,
          lng: 106.906,
          address: 'Zaisan Memorial, Ulaanbaatar',
        },
        departureTime: '2020-01-01T10:00:00Z', // Past date
        availableSeats: 3,
        pricePerSeat: 5000,
      };

      const response = await request(BASE_URL)
        .post('/rides')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(rideData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      const message = Array.isArray(response.body.message)
        ? response.body.message[0]
        : response.body.message;
      expect(message).toMatch(/future|past/i);
    });

    it('should return 400 for invalid seats', async () => {
      const rideData = {
        origin: {
          lat: 47.9184,
          lng: 106.9177,
          address: 'Sukhbaatar Square, Ulaanbaatar',
        },
        destination: {
          lat: 47.927,
          lng: 106.906,
          address: 'Zaisan Memorial, Ulaanbaatar',
        },
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        availableSeats: 0, // Invalid
        pricePerSeat: 5000,
      };

      const response = await request(BASE_URL)
        .post('/rides')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(rideData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      const message = Array.isArray(response.body.message)
        ? response.body.message[0]
        : response.body.message;
      expect(message).toMatch(/seats/i);
    });

    it('should return 400 for missing required fields', async () => {
      const rideData = {
        origin: {
          lat: 47.9184,
          lng: 106.9177,
          address: 'Sukhbaatar Square, Ulaanbaatar',
        },
        // Missing destination, departureTime, etc.
      };

      const response = await request(BASE_URL)
        .post('/rides')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(rideData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /rides/search', () => {
    it('should search rides by origin and destination', async () => {
      const searchParams = {
        originLat: 47.9184,
        originLng: 106.9177,
        destLat: 47.927,
        destLng: 106.906,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      };

      const response = await request(BASE_URL)
        .get('/rides/search')
        .set('Authorization', `Bearer ${accessToken}`)
        .query(searchParams)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
      expect(response.body.meta).toHaveProperty('total');
    });

    it('should filter rides by available seats', async () => {
      const searchParams = {
        originLat: 47.9184,
        originLng: 106.9177,
        destLat: 47.927,
        destLng: 106.906,
        minSeats: 2,
      };

      const response = await request(BASE_URL)
        .get('/rides/search')
        .set('Authorization', `Bearer ${accessToken}`)
        .query(searchParams)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((ride: any) => {
        expect(ride.availableSeats).toBeGreaterThanOrEqual(2);
      });
    });

    it('should filter rides by price range', async () => {
      const searchParams = {
        originLat: 47.9184,
        originLng: 106.9177,
        destLat: 47.927,
        destLng: 106.906,
        maxPrice: 10000,
      };

      const response = await request(BASE_URL)
        .get('/rides/search')
        .set('Authorization', `Bearer ${accessToken}`)
        .query(searchParams)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((ride: any) => {
        expect(ride.pricePerSeat).toBeLessThanOrEqual(10000);
      });
    });

    it('should support pagination', async () => {
      const searchParams = {
        originLat: 47.9184,
        originLng: 106.9177,
        destLat: 47.927,
        destLng: 106.906,
        page: 1,
        limit: 10,
      };

      const response = await request(BASE_URL)
        .get('/rides/search')
        .set('Authorization', `Bearer ${accessToken}`)
        .query(searchParams)
        .expect(200);

      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    it('should return 400 for missing required search parameters', async () => {
      const response = await request(BASE_URL)
        .get('/rides/search')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /rides/:id', () => {
    it('should get ride by ID', async () => {
      const response = await request(BASE_URL)
        .get(`/rides/${rideId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', rideId);
      expect(response.body).toHaveProperty('driverId');
      expect(response.body).toHaveProperty('origin');
      expect(response.body).toHaveProperty('destination');
      expect(response.body).toHaveProperty('status');
    });

    it('should return 404 for non-existent ride', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(BASE_URL)
        .get(`/rides/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/not found/i);
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await request(BASE_URL)
        .get('/rides/invalid-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PATCH /rides/:id', () => {
    it('should update ride successfully', async () => {
      const updateData = {
        pricePerSeat: 6000,
        availableSeats: 2,
      };

      const response = await request(BASE_URL)
        .patch(`/rides/${rideId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', rideId);
      expect(response.body).toHaveProperty('pricePerSeat', 6000);
      expect(response.body).toHaveProperty('availableSeats', 2);
    });

    it('should return 401 without authentication', async () => {
      const updateData = { pricePerSeat: 7000 };

      const response = await request(BASE_URL)
        .patch(`/rides/${rideId}`)
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 403 if not the driver', async () => {
      // Login as different user
      const otherUserData = {
        phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'Test123!@#',
        name: 'Other User',
      };

      await request(AUTH_URL).post('/auth/register').send(otherUserData);

      const loginResponse = await request(AUTH_URL).post('/auth/login').send({
        phone: otherUserData.phone,
        password: otherUserData.password,
      });

      const otherToken = loginResponse.body.accessToken;

      const updateData = { pricePerSeat: 7000 };

      const response = await request(BASE_URL)
        .patch(`/rides/${rideId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/forbidden|permission/i);
    });
  });

  describe('DELETE /rides/:id', () => {
    it('should cancel ride successfully', async () => {
      const response = await request(BASE_URL)
        .delete(`/rides/${rideId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', rideId);
      expect(response.body).toHaveProperty('status', 'cancelled');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(BASE_URL)
        .delete(`/rides/${rideId}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent ride', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(BASE_URL)
        .delete(`/rides/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });
});
