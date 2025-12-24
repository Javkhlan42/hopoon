import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

/**
 * Integration Tests for Booking API Endpoints
 * Tests complete booking workflow via HTTP
 * Booking Service runs on port 3004
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3004';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3001';
const RIDE_URL = process.env.RIDE_URL || 'http://localhost:3003';

describe('Booking API Integration Tests', () => {
  let driverToken: string;
  let passengerToken: string;
  let driverId: string;
  let passengerId: string;
  let rideId: string;
  let bookingId: string;

  beforeAll(async () => {
    // Register and login driver
    const driverData = {
      phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'Driver123!@#',
      name: 'Test Driver',
    };

    await request(AUTH_URL).post('/auth/register').send(driverData);

    const driverLogin = await request(AUTH_URL).post('/auth/login').send({
      phone: driverData.phone,
      password: driverData.password,
    });

    driverToken = driverLogin.body.accessToken;
    driverId = driverLogin.body.user?.id || driverLogin.body.user;

    // Register and login passenger
    const passengerData = {
      phone: `+976${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'Passenger123!@#',
      name: 'Test Passenger',
    };

    await request(AUTH_URL).post('/auth/register').send(passengerData);

    const passengerLogin = await request(AUTH_URL).post('/auth/login').send({
      phone: passengerData.phone,
      password: passengerData.password,
    });

    passengerToken = passengerLogin.body.accessToken;
    passengerId = passengerLogin.body.user?.id || passengerLogin.body.user;

    // Create a test ride
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
      availableSeats: 3,
      pricePerSeat: 5000,
    };

    const rideResponse = await request(RIDE_URL)
      .post('/rides')
      .set('Authorization', `Bearer ${driverToken}`)
      .send(rideData);

    rideId = rideResponse.body.id;
  });

  describe('POST /bookings', () => {
    it('should create a new booking successfully', async () => {
      const bookingData = {
        rideId: rideId,
        seats: 2,
      };

      const response = await request(BASE_URL)
        .post('/bookings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('rideId', rideId);
      expect(response.body).toHaveProperty('passengerId', passengerId);
      expect(response.body).toHaveProperty('seats', 2);
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('totalPrice', 10000); // 2 seats * 5000

      bookingId = response.body.id;
    });

    it('should return 401 without authentication', async () => {
      const bookingData = {
        rideId: rideId,
        seats: 1,
      };

      const response = await request(BASE_URL)
        .post('/bookings')
        .send(bookingData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for invalid seats', async () => {
      const bookingData = {
        rideId: rideId,
        seats: 0, // Invalid
        pickupPoint: { lat: 47.9184, lng: 106.9177 },
        dropoffPoint: { lat: 47.927, lng: 106.906 },
      };

      const response = await request(BASE_URL)
        .post('/bookings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      const message = Array.isArray(response.body.message)
        ? response.body.message[0]
        : response.body.message;
      expect(message).toMatch(/seats/i);
    });

    it('should return 400 for booking more seats than available', async () => {
      const bookingData = {
        rideId: rideId,
        seats: 10, // More than available
      };

      const response = await request(BASE_URL)
        .post('/bookings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      const message = Array.isArray(response.body.message)
        ? response.body.message[0]
        : response.body.message;
      expect(message).toMatch(/available|seats/i);
    });

    it('should return 403 for driver booking their own ride', async () => {
      const bookingData = {
        rideId: rideId,
        seats: 1,
      };

      const response = await request(BASE_URL)
        .post('/bookings')
        .set('Authorization', `Bearer ${driverToken}`)
        .send(bookingData)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/own ride|driver/i);
    });

    it('should return 404 for non-existent ride', async () => {
      const bookingData = {
        rideId: '00000000-0000-0000-0000-000000000000',
        seats: 1,
      };

      const response = await request(BASE_URL)
        .post('/bookings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(bookingData)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/not found/i);
    });
  });

  describe('GET /bookings/:id', () => {
    it('should get booking by ID', async () => {
      const response = await request(BASE_URL)
        .get(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', bookingId);
      expect(response.body).toHaveProperty('rideId', rideId);
      expect(response.body).toHaveProperty('passengerId', passengerId);
      expect(response.body).toHaveProperty('status');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(BASE_URL)
        .get(`/bookings/${bookingId}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(BASE_URL)
        .get(`/bookings/${fakeId}`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PATCH /bookings/:id/approve', () => {
    it('should approve booking successfully by driver', async () => {
      const response = await request(BASE_URL)
        .patch(`/bookings/${bookingId}/approve`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', bookingId);
      expect(response.body).toHaveProperty('status', 'confirmed');
      expect(response.body).toHaveProperty('confirmedAt');
    });

    it('should return 403 if passenger tries to confirm', async () => {
      // Create another booking
      const bookingData = {
        rideId: rideId,
        seats: 1,
        pickupPoint: { lat: 47.9184, lng: 106.9177 },
        dropoffPoint: { lat: 47.927, lng: 106.906 },
      };

      const bookingResponse = await request(BASE_URL)
        .post('/bookings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(bookingData);

      const newBookingId = bookingResponse.body.id;

      const response = await request(BASE_URL)
        .patch(`/bookings/${newBookingId}/approve`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/driver|permission/i);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(BASE_URL)
        .patch(`/bookings/${bookingId}/approve`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /bookings/:id', () => {
    it('should cancel booking successfully', async () => {
      const response = await request(BASE_URL)
        .delete(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({ reason: 'Changed plans' })
        .expect(200);

      expect(response.body).toHaveProperty('id', bookingId);
      expect(response.body).toHaveProperty('status', 'cancelled');
      expect(response.body).toHaveProperty('cancelReason', 'Changed plans');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(BASE_URL)
        .delete(`/bookings/${bookingId}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(BASE_URL)
        .delete(`/bookings/${fakeId}`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /bookings', () => {
    it('should get user bookings', async () => {
      const response = await request(BASE_URL)
        .get('/bookings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter bookings by status', async () => {
      const response = await request(BASE_URL)
        .get('/bookings')
        .query({ status: 'confirmed' })
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((booking: any) => {
        expect(booking.status).toBe('confirmed');
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await request(BASE_URL).get('/bookings').expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /bookings/driver', () => {
    it('should get driver bookings', async () => {
      const response = await request(BASE_URL)
        .get('/bookings/driver')
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 403 if not a driver', async () => {
      const response = await request(BASE_URL)
        .get('/bookings/driver')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/driver|permission/i);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(BASE_URL)
        .get('/bookings/driver')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });
});
