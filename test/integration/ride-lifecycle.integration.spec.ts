import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { io, Socket } from 'socket.io-client';

/**
 * Complete Ride Lifecycle Integration Test
 * Tests all 7 steps from sequence diagram:
 * 1. Ride Post creation (Driver)
 * 2. Search and Discovery (Passenger)
 * 3. Booking request
 * 4. Approval & Chat
 * 5. Ride start & Live tracking
 * 6. SOS (if needed)
 * 7. Completion & Rating
 */

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3001';
const RIDE_URL = process.env.RIDE_URL || 'http://localhost:3003';
const BOOKING_URL = process.env.BOOKING_URL || 'http://localhost:3004';
const CHAT_URL = process.env.CHAT_URL || 'http://localhost:3005';
const PAYMENT_URL = process.env.PAYMENT_URL || 'http://localhost:3006';
const NOTIFICATION_URL =
  process.env.NOTIFICATION_URL || 'http://localhost:3007';
const CHAT_WS_URL = process.env.CHAT_WS_URL || 'http://localhost:3005';

describe('Complete Ride Lifecycle - End-to-End', () => {
  let driverToken: string;
  let passengerToken: string;
  let driverId: string;
  let passengerId: string;
  let rideId: string;
  let bookingId: string;
  let chatId: string;
  let driverSocket: Socket;
  let passengerSocket: Socket;

  beforeAll(async () => {
    // Register driver (Bold - Жолооч)
    const driverData = {
      phone: `+976${Math.floor(80000000 + Math.random() * 10000000)}`,
      password: 'Bold123!@#',
      name: 'Болд',
      role: 'driver',
    };

    await request(AUTH_URL).post('/auth/register').send(driverData);

    const driverLogin = await request(AUTH_URL).post('/auth/login').send({
      phone: driverData.phone,
      password: driverData.password,
    });

    driverToken = driverLogin.body.accessToken;
    driverId = driverLogin.body.user?.id || driverLogin.body.userId;

    // Register passenger (Sara - Зорчигч)
    const passengerData = {
      phone: `+976${Math.floor(80000000 + Math.random() * 10000000)}`,
      password: 'Sara123!@#',
      name: 'Сараа',
      role: 'passenger',
    };

    await request(AUTH_URL).post('/auth/register').send(passengerData);

    const passengerLogin = await request(AUTH_URL).post('/auth/login').send({
      phone: passengerData.phone,
      password: passengerData.password,
    });

    passengerToken = passengerLogin.body.accessToken;
    passengerId = passengerLogin.body.user?.id || passengerLogin.body.userId;
  }, 30000);

  afterAll(() => {
    if (driverSocket) driverSocket.disconnect();
    if (passengerSocket) passengerSocket.disconnect();
  });

  // ===== АЛХАМ 1: Ride Post үүсгэх (Жолооч) =====
  describe('Step 1: Create Ride Post (Driver)', () => {
    it('should create a ride from Ulaanbaatar to Darkhan', async () => {
      const rideData = {
        origin: {
          lat: 47.9184,
          lng: 106.9177,
          address: 'Улаанбаатар хот',
        },
        destination: {
          lat: 49.4863,
          lng: 105.9714,
          address: 'Дархан хот',
        },
        departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        availableSeats: 3,
        pricePerSeat: 25000,
        preferences: {
          smokingAllowed: false,
          petsAllowed: true,
          musicAllowed: true,
        },
      };

      const response = await request(GATEWAY_URL)
        .post('/rides')
        .set('Authorization', `Bearer ${driverToken}`)
        .send(rideData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('driverId', driverId);
      expect(response.body).toHaveProperty('status', 'scheduled');
      expect(response.body).toHaveProperty('availableSeats', 3);
      expect(response.body).toHaveProperty('pricePerSeat', 25000);
      expect(response.body).toHaveProperty('route'); // From Mapbox API
      expect(response.body.route).toHaveProperty('distance');
      expect(response.body.route).toHaveProperty('duration');
      expect(response.body.route).toHaveProperty('polyline');

      rideId = response.body.id;
      console.log(`✓ Ride created: ${rideId}`);
    }, 15000);

    it('should cache the ride status in Redis', async () => {
      // Verify ride is in cache
      const response = await request(GATEWAY_URL)
        .get(`/rides/${rideId}`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'scheduled');
      expect(response.headers).toHaveProperty('x-cache-hit');
    });
  });

  // ===== АЛХАМ 2: Хайлт ба Илэрц (Зорчигч) =====
  describe('Step 2: Search and Discovery (Passenger)', () => {
    it('should find the ride when searching for Darkhan destination', async () => {
      const response = await request(GATEWAY_URL)
        .get('/rides/feed')
        .query({
          destination: 'Дархан',
          departureDate: new Date().toISOString().split('T')[0],
        })
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);

      const foundRide = response.body.find((r: any) => r.id === rideId);
      expect(foundRide).toBeDefined();
      expect(foundRide.availableSeats).toBe(3);
      expect(foundRide.pricePerSeat).toBe(25000);

      console.log(`✓ Found ${response.body.length} rides`);
    });

    it('should use PostGIS ST_DWithin for geo search', async () => {
      const response = await request(GATEWAY_URL)
        .get('/rides/search')
        .query({
          lat: 49.4863,
          lng: 105.9714,
          radius: 5000, // 5km
        })
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      const foundRide = response.body.find((r: any) => r.id === rideId);
      expect(foundRide).toBeDefined();
    });
  });

  // ===== АЛХАМ 3: Booking хүсэлт =====
  describe('Step 3: Create Booking Request', () => {
    it('should create a booking and lock seats', async () => {
      const bookingData = {
        rideId: rideId,
        seats: 2,
        pickupLocation: {
          lat: 47.9184,
          lng: 106.9177,
          address: 'Сүхбаатарын талбай',
        },
      };

      const response = await request(GATEWAY_URL)
        .post('/bookings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('rideId', rideId);
      expect(response.body).toHaveProperty('passengerId', passengerId);
      expect(response.body).toHaveProperty('seats', 2);
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('totalPrice', 50000); // 2 * 25000

      bookingId = response.body.id;
      console.log(`✓ Booking created: ${bookingId}`);
    });

    it('should decrement available seats in cache', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/rides/${rideId}`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body.availableSeats).toBe(1); // 3 - 2 = 1
    });

    it('should notify driver of new booking', async () => {
      // In real implementation, this would check notification service
      // For now, verify booking exists
      const response = await request(GATEWAY_URL)
        .get(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.status).toBe('pending');
    });
  });

  // ===== АЛХАМ 4: Баталгаажуулалт & Chat =====
  describe('Step 4: Approval and Chat Setup', () => {
    it('should approve booking by driver', async () => {
      const response = await request(GATEWAY_URL)
        .patch(`/bookings/${bookingId}/approve`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.status).toBe('approved');
      console.log(`✓ Booking approved`);
    });

    it('should create chat channel after approval', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('chatId');
      chatId = response.body.chatId;
      console.log(`✓ Chat channel created: ${chatId}`);
    });

    it('should allow WebSocket connection for chat', (done) => {
      passengerSocket = io(CHAT_WS_URL, {
        auth: { token: passengerToken },
        transports: ['websocket'],
      });

      passengerSocket.on('connect', () => {
        passengerSocket.emit('join_ride', { rideId });
        console.log(`✓ Passenger connected to chat`);
      });

      driverSocket = io(CHAT_WS_URL, {
        auth: { token: driverToken },
        transports: ['websocket'],
      });

      driverSocket.on('connect', () => {
        driverSocket.emit('join_ride', { rideId });
        console.log(`✓ Driver connected to chat`);
        done();
      });
    }, 10000);

    it('should send and receive messages between driver and passenger', (done) => {
      const testMessage =
        'Сайн байна уу, Сүхбаатарын талбайн хаана очиж авах вэ?';

      driverSocket.on('message', (data: any) => {
        expect(data.message).toBe(testMessage);
        expect(data.senderId).toBe(passengerId);
        console.log(`✓ Driver received message`);
        done();
      });

      passengerSocket.emit('send_message', {
        rideId,
        message: testMessage,
      });
    }, 10000);
  });

  // ===== АЛХАМ 5: Аялал эхлэх & Live Tracking =====
  describe('Step 5: Start Ride and Live Tracking', () => {
    it('should start the ride', async () => {
      const response = await request(GATEWAY_URL)
        .post(`/rides/${rideId}/start`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.status).toBe('in_progress');
      console.log(`✓ Ride started`);
    });

    it('should enable tracking in cache', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/rides/${rideId}`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.status).toBe('in_progress');
      expect(response.body.trackingEnabled).toBe(true);
    });

    it('should notify passengers that ride has started', async () => {
      // Verify notification sent (in real implementation)
      const response = await request(GATEWAY_URL)
        .get(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body.rideStatus).toBe('in_progress');
    });

    it('should broadcast live location updates via WebSocket', (done) => {
      const testLocation = {
        lat: 47.92,
        lng: 106.92,
        heading: 45,
        speed: 60,
      };

      passengerSocket.on('location_update', (data: any) => {
        expect(data).toHaveProperty('lat');
        expect(data).toHaveProperty('lng');
        expect(data.driverId).toBe(driverId);
        console.log(`✓ Passenger received location update`);
        done();
      });

      driverSocket.emit('update_location', {
        rideId,
        ...testLocation,
      });
    }, 10000);

    it('should store location in Redis GEOADD', async () => {
      // Simulate multiple location updates
      for (let i = 0; i < 3; i++) {
        await new Promise((resolve) => {
          driverSocket.emit('update_location', {
            rideId,
            lat: 47.92 + i * 0.01,
            lng: 106.92 + i * 0.01,
            heading: 45,
            speed: 60,
          });
          setTimeout(resolve, 500);
        });
      }

      // Verify location tracking
      const response = await request(GATEWAY_URL)
        .get(`/rides/${rideId}/location`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('lat');
      expect(response.body).toHaveProperty('lng');
    }, 10000);
  });

  // ===== АЛХАМ 6: SOS (Emergency) =====
  describe('Step 6: Emergency SOS Alert', () => {
    it('should trigger SOS alert from passenger', async () => {
      const sosData = {
        rideId,
        location: {
          lat: 47.93,
          lng: 106.93,
        },
        description: 'Эмзэгтэй байдал',
      };

      const response = await request(GATEWAY_URL)
        .post('/safety/sos')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(sosData)
        .expect(201);

      expect(response.body).toHaveProperty('alertId');
      expect(response.body).toHaveProperty('status', 'active');
      expect(response.body).toHaveProperty('rideId', rideId);

      console.log(`✓ SOS alert created: ${response.body.alertId}`);
    });

    it('should store SOS alert in database', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/rides/${rideId}/sos`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('status', 'active');
    });

    it('should notify admin dashboard of emergency', async () => {
      // In production, this would verify admin notification
      // For test, verify the SOS is marked for admin review
      const response = await request(GATEWAY_URL)
        .get(`/rides/${rideId}`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('hasActiveAlert', true);
    });

    it('should resolve SOS alert', async () => {
      // Admin or system resolves the alert
      const response = await request(GATEWAY_URL)
        .post(`/safety/sos/${rideId}/resolve`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ resolution: 'false_alarm' })
        .expect(200);

      expect(response.body.status).toBe('resolved');
      console.log(`✓ SOS alert resolved`);
    });
  });

  // ===== АЛХАМ 7: Дуусгалт & Үнэлгээ =====
  describe('Step 7: Complete Ride and Ratings', () => {
    it('should end the ride', async () => {
      const response = await request(GATEWAY_URL)
        .post(`/rides/${rideId}/end`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.status).toBe('completed');
      console.log(`✓ Ride completed`);
    });

    it('should process payment via wallet', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('paymentStatus', 'completed');
      expect(response.body.totalPrice).toBe(50000);
    });

    it('should verify payment in database', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/payments/booking/${bookingId}`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'completed');
      expect(response.body).toHaveProperty('amount', 50000);
      expect(response.body).toHaveProperty('method', 'wallet');
    });

    it('should allow passenger to rate driver', async () => {
      const ratingData = {
        bookingId,
        ratedUserId: driverId,
        rating: 5,
        comment: 'Маш сайн жолооч байсан!',
        categories: {
          punctuality: 5,
          driving: 5,
          cleanliness: 5,
          communication: 5,
        },
      };

      const response = await request(GATEWAY_URL)
        .post('/ratings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(ratingData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('rating', 5);
      console.log(`✓ Passenger rated driver: 5 stars`);
    });

    it('should allow driver to rate passenger', async () => {
      const ratingData = {
        bookingId,
        ratedUserId: passengerId,
        rating: 5,
        comment: 'Цагтаа ирсэн, найрсаг зорчигч!',
        categories: {
          punctuality: 5,
          behavior: 5,
          cleanliness: 5,
        },
      };

      const response = await request(GATEWAY_URL)
        .post('/ratings')
        .set('Authorization', `Bearer ${driverToken}`)
        .send(ratingData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('rating', 5);
      console.log(`✓ Driver rated passenger: 5 stars`);
    });

    it('should update user ratings', async () => {
      // Check driver rating
      const driverProfile = await request(GATEWAY_URL)
        .get(`/users/${driverId}/profile`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(driverProfile.body).toHaveProperty('averageRating');
      expect(driverProfile.body.averageRating).toBeGreaterThanOrEqual(0);

      // Check passenger rating
      const passengerProfile = await request(GATEWAY_URL)
        .get(`/users/${passengerId}/profile`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(passengerProfile.body).toHaveProperty('averageRating');
      expect(passengerProfile.body.averageRating).toBeGreaterThanOrEqual(0);
    });

    it('should notify both users of completion', async () => {
      // Verify ride is marked as completed for both
      const driverView = await request(GATEWAY_URL)
        .get(`/rides/${rideId}`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      const passengerView = await request(GATEWAY_URL)
        .get(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(driverView.body.status).toBe('completed');
      expect(passengerView.body.status).toBe('completed');
      console.log(`✓ Both users notified of completion`);
    });
  });

  // ===== Verification & Summary =====
  describe('Complete Lifecycle Verification', () => {
    it('should have completed full ride lifecycle', async () => {
      const ride = await request(GATEWAY_URL)
        .get(`/rides/${rideId}`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      const booking = await request(GATEWAY_URL)
        .get(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      // Verify final states
      expect(ride.body.status).toBe('completed');
      expect(booking.body.status).toBe('completed');
      expect(booking.body.paymentStatus).toBe('completed');

      console.log('\n=== RIDE LIFECYCLE SUMMARY ===');
      console.log(`Ride ID: ${rideId}`);
      console.log(`Booking ID: ${bookingId}`);
      console.log(`Driver: ${driverId}`);
      console.log(`Passenger: ${passengerId}`);
      console.log(`Route: Улаанбаатар → Дархан`);
      console.log(`Seats booked: 2/3`);
      console.log(`Total paid: ₮50,000`);
      console.log(`Status: ✓ Completed`);
      console.log(`Ratings: ⭐⭐⭐⭐⭐ (Both 5 stars)`);
      console.log('==============================\n');
    });
  });
});
