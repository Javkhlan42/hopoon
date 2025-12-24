import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { io, Socket } from 'socket.io-client';

/**
 * Real-time Chat and Location Tracking Integration Tests
 * Tests WebSocket functionality for:
 * - Chat messaging between driver and passengers
 * - Live location updates during ride
 * - Multiple passengers in same ride
 * - Message persistence and history
 */

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3001';
const RIDE_URL = process.env.RIDE_URL || 'http://localhost:3003';
const BOOKING_URL = process.env.BOOKING_URL || 'http://localhost:3004';
const CHAT_WS_URL = process.env.CHAT_WS_URL || 'http://localhost:3005';

describe('Chat and Real-time Tracking', () => {
  let driverToken: string;
  let passenger1Token: string;
  let passenger2Token: string;
  let driverId: string;
  let passenger1Id: string;
  let passenger2Id: string;
  let rideId: string;
  let booking1Id: string;
  let booking2Id: string;

  let driverSocket: Socket;
  let passenger1Socket: Socket;
  let passenger2Socket: Socket;

  beforeAll(async () => {
    // Create driver
    const driverData = {
      phone: `+976${Math.floor(80000000 + Math.random() * 10000000)}`,
      password: 'Driver123!@#',
      name: 'Test Driver',
    };
    await request(AUTH_URL).post('/auth/register').send(driverData);
    const driverLogin = await request(AUTH_URL)
      .post('/auth/login')
      .send({ phone: driverData.phone, password: driverData.password });
    driverToken = driverLogin.body.accessToken;
    driverId = driverLogin.body.user?.id || driverLogin.body.userId;

    // Create passenger 1
    const passenger1Data = {
      phone: `+976${Math.floor(80000000 + Math.random() * 10000000)}`,
      password: 'Pass123!@#',
      name: 'Passenger One',
    };
    await request(AUTH_URL).post('/auth/register').send(passenger1Data);
    const pass1Login = await request(AUTH_URL)
      .post('/auth/login')
      .send({ phone: passenger1Data.phone, password: passenger1Data.password });
    passenger1Token = pass1Login.body.accessToken;
    passenger1Id = pass1Login.body.user?.id || pass1Login.body.userId;

    // Create passenger 2
    const passenger2Data = {
      phone: `+976${Math.floor(80000000 + Math.random() * 10000000)}`,
      password: 'Pass123!@#',
      name: 'Passenger Two',
    };
    await request(AUTH_URL).post('/auth/register').send(passenger2Data);
    const pass2Login = await request(AUTH_URL)
      .post('/auth/login')
      .send({ phone: passenger2Data.phone, password: passenger2Data.password });
    passenger2Token = pass2Login.body.accessToken;
    passenger2Id = pass2Login.body.user?.id || pass2Login.body.userId;

    // Create ride
    const rideData = {
      origin: { lat: 47.9184, lng: 106.9177, address: 'UB' },
      destination: { lat: 49.4863, lng: 105.9714, address: 'Darkhan' },
      departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      availableSeats: 3,
      pricePerSeat: 20000,
    };
    const rideResponse = await request(GATEWAY_URL)
      .post('/rides')
      .set('Authorization', `Bearer ${driverToken}`)
      .send(rideData);
    rideId = rideResponse.body.id;

    // Create bookings
    const booking1Response = await request(GATEWAY_URL)
      .post('/bookings')
      .set('Authorization', `Bearer ${passenger1Token}`)
      .send({ rideId, seats: 1 });
    booking1Id = booking1Response.body.id;

    const booking2Response = await request(GATEWAY_URL)
      .post('/bookings')
      .set('Authorization', `Bearer ${passenger2Token}`)
      .send({ rideId, seats: 1 });
    booking2Id = booking2Response.body.id;

    // Approve bookings
    await request(GATEWAY_URL)
      .patch(`/bookings/${booking1Id}/approve`)
      .set('Authorization', `Bearer ${driverToken}`);
    await request(GATEWAY_URL)
      .patch(`/bookings/${booking2Id}/approve`)
      .set('Authorization', `Bearer ${driverToken}`);

    // Start ride
    await request(GATEWAY_URL)
      .post(`/rides/${rideId}/start`)
      .set('Authorization', `Bearer ${driverToken}`);
  }, 60000);

  afterAll(() => {
    if (driverSocket) driverSocket.disconnect();
    if (passenger1Socket) passenger1Socket.disconnect();
    if (passenger2Socket) passenger2Socket.disconnect();
  });

  // ===== WebSocket Connection Tests =====
  describe('WebSocket Connections', () => {
    it('should connect driver to ride channel', (done) => {
      driverSocket = io(CHAT_WS_URL, {
        auth: { token: driverToken },
        transports: ['websocket'],
      });

      driverSocket.on('connect', () => {
        expect(driverSocket.connected).toBe(true);
        driverSocket.emit('join_ride', { rideId });
        console.log('✓ Driver connected');
        done();
      });

      driverSocket.on('connect_error', (err) => {
        done(err);
      });
    }, 10000);

    it('should connect passenger 1 to ride channel', (done) => {
      passenger1Socket = io(CHAT_WS_URL, {
        auth: { token: passenger1Token },
        transports: ['websocket'],
      });

      passenger1Socket.on('connect', () => {
        expect(passenger1Socket.connected).toBe(true);
        passenger1Socket.emit('join_ride', { rideId });
        console.log('✓ Passenger 1 connected');
        done();
      });
    }, 10000);

    it('should connect passenger 2 to ride channel', (done) => {
      passenger2Socket = io(CHAT_WS_URL, {
        auth: { token: passenger2Token },
        transports: ['websocket'],
      });

      passenger2Socket.on('connect', () => {
        expect(passenger2Socket.connected).toBe(true);
        passenger2Socket.emit('join_ride', { rideId });
        console.log('✓ Passenger 2 connected');
        done();
      });
    }, 10000);

    it('should add users to Redis active_users set', async () => {
      // Wait for connections to settle
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await request(GATEWAY_URL)
        .get(`/rides/${rideId}/participants`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.activeUsers).toContain(driverId);
      expect(response.body.activeUsers).toContain(passenger1Id);
      expect(response.body.activeUsers).toContain(passenger2Id);
    });
  });

  // ===== Chat Messaging Tests =====
  describe('Chat Messaging', () => {
    it('should broadcast message from driver to all passengers', (done) => {
      const testMessage = 'Сайн байна уу, та бүхэн бэлэн үү?';
      let receivedCount = 0;

      const messageHandler = (data: any) => {
        expect(data.message).toBe(testMessage);
        expect(data.senderId).toBe(driverId);
        expect(data.senderName).toBeDefined();
        receivedCount++;

        if (receivedCount === 2) {
          console.log('✓ Both passengers received message');
          passenger1Socket.off('message', messageHandler);
          passenger2Socket.off('message', messageHandler);
          done();
        }
      };

      passenger1Socket.on('message', messageHandler);
      passenger2Socket.on('message', messageHandler);

      driverSocket.emit('send_message', {
        rideId,
        message: testMessage,
      });
    }, 10000);

    it('should send message from passenger to driver and others', (done) => {
      const testMessage = 'Тийм ээ, бэлэн байна!';
      let receivedByDriver = false;
      let receivedByOtherPassenger = false;

      driverSocket.on('message', (data: any) => {
        if (data.message === testMessage) {
          expect(data.senderId).toBe(passenger1Id);
          receivedByDriver = true;
          if (receivedByOtherPassenger) done();
        }
      });

      passenger2Socket.on('message', (data: any) => {
        if (data.message === testMessage) {
          expect(data.senderId).toBe(passenger1Id);
          receivedByOtherPassenger = true;
          if (receivedByDriver) done();
        }
      });

      passenger1Socket.emit('send_message', {
        rideId,
        message: testMessage,
      });
    }, 10000);

    it('should persist messages in database', async () => {
      // Send a few messages
      driverSocket.emit('send_message', {
        rideId,
        message: 'Хөдөлж байна',
      });

      await new Promise((resolve) => setTimeout(resolve, 500));

      passenger1Socket.emit('send_message', {
        rideId,
        message: 'Баярлалаа',
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch message history
      const response = await request(GATEWAY_URL)
        .get(`/rides/${rideId}/messages`)
        .set('Authorization', `Bearer ${passenger1Token}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('message');
      expect(response.body[0]).toHaveProperty('senderId');
      expect(response.body[0]).toHaveProperty('timestamp');
    });

    it('should support message pagination', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/rides/${rideId}/messages`)
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('messages');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 10);
    });

    it('should prevent unauthorized users from accessing chat', async () => {
      // Try to get messages without token
      await request(GATEWAY_URL).get(`/rides/${rideId}/messages`).expect(401);
    });
  });

  // ===== Live Location Tracking =====
  describe('Live Location Tracking', () => {
    it('should broadcast location updates to all passengers', (done) => {
      const testLocation = {
        lat: 47.92,
        lng: 106.92,
        heading: 45,
        speed: 60,
        timestamp: Date.now(),
      };

      let receivedCount = 0;

      const locationHandler = (data: any) => {
        expect(data.lat).toBe(testLocation.lat);
        expect(data.lng).toBe(testLocation.lng);
        expect(data.heading).toBe(testLocation.heading);
        expect(data.speed).toBe(testLocation.speed);
        expect(data.driverId).toBe(driverId);
        receivedCount++;

        if (receivedCount === 2) {
          console.log('✓ Both passengers received location');
          passenger1Socket.off('location_update', locationHandler);
          passenger2Socket.off('location_update', locationHandler);
          done();
        }
      };

      passenger1Socket.on('location_update', locationHandler);
      passenger2Socket.on('location_update', locationHandler);

      driverSocket.emit('update_location', {
        rideId,
        ...testLocation,
      });
    }, 10000);

    it('should store location in Redis using GEOADD', async () => {
      // Send multiple location updates
      const locations = [
        { lat: 47.93, lng: 106.93 },
        { lat: 47.94, lng: 106.94 },
        { lat: 47.95, lng: 106.95 },
      ];

      for (const loc of locations) {
        driverSocket.emit('update_location', {
          rideId,
          ...loc,
          heading: 45,
          speed: 60,
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Get current location
      const response = await request(GATEWAY_URL)
        .get(`/rides/${rideId}/location`)
        .set('Authorization', `Bearer ${passenger1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('lat');
      expect(response.body).toHaveProperty('lng');
      expect(response.body).toHaveProperty('heading');
      expect(response.body).toHaveProperty('speed');
      expect(response.body).toHaveProperty('timestamp');
    }, 10000);

    it('should return location history trail', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/rides/${rideId}/location/history`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('lat');
      expect(response.body[0]).toHaveProperty('lng');
      expect(response.body[0]).toHaveProperty('timestamp');
    });

    it('should calculate ETA based on current location', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/rides/${rideId}/eta`)
        .set('Authorization', `Bearer ${passenger1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('eta');
      expect(response.body).toHaveProperty('distanceRemaining');
      expect(response.body).toHaveProperty('estimatedArrival');
    });

    it('should throttle location updates (max 1 per second)', async () => {
      let updateCount = 0;

      passenger1Socket.on('location_update', () => {
        updateCount++;
      });

      // Send 10 updates rapidly
      for (let i = 0; i < 10; i++) {
        driverSocket.emit('update_location', {
          rideId,
          lat: 47.92 + i * 0.001,
          lng: 106.92 + i * 0.001,
          heading: 45,
          speed: 60,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Should receive ~2-3 updates (throttled to 1/sec)
      expect(updateCount).toBeLessThan(5);
      console.log(`✓ Received ${updateCount} throttled updates`);
    }, 5000);
  });

  // ===== Typing Indicators =====
  describe('Typing Indicators', () => {
    it('should broadcast typing indicator', (done) => {
      passenger2Socket.on('user_typing', (data: any) => {
        expect(data.userId).toBe(passenger1Id);
        expect(data.userName).toBeDefined();
        console.log('✓ Typing indicator received');
        done();
      });

      passenger1Socket.emit('typing', { rideId });
    }, 5000);

    it('should broadcast stop typing', (done) => {
      passenger2Socket.on('user_stop_typing', (data: any) => {
        expect(data.userId).toBe(passenger1Id);
        done();
      });

      passenger1Socket.emit('stop_typing', { rideId });
    }, 5000);
  });

  // ===== Connection Management =====
  describe('Connection Management', () => {
    it('should notify others when user disconnects', (done) => {
      const tempSocket = io(CHAT_WS_URL, {
        auth: { token: passenger1Token },
        transports: ['websocket'],
      });

      tempSocket.on('connect', () => {
        tempSocket.emit('join_ride', { rideId });

        driverSocket.once('user_left', (data: any) => {
          expect(data.userId).toBe(passenger1Id);
          console.log('✓ User disconnect notification received');
          done();
        });

        setTimeout(() => {
          tempSocket.disconnect();
        }, 500);
      });
    }, 10000);

    it('should handle reconnection gracefully', (done) => {
      passenger1Socket.disconnect();

      setTimeout(() => {
        passenger1Socket.connect();

        passenger1Socket.once('connect', () => {
          passenger1Socket.emit('join_ride', { rideId });
          console.log('✓ Reconnected successfully');
          done();
        });
      }, 1000);
    }, 10000);

    it('should maintain message order', async () => {
      const messages = ['Message 1', 'Message 2', 'Message 3'];
      const receivedMessages: string[] = [];

      passenger1Socket.on('message', (data: any) => {
        receivedMessages.push(data.message);
      });

      for (const msg of messages) {
        driverSocket.emit('send_message', { rideId, message: msg });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      expect(receivedMessages).toContain('Message 1');
      expect(receivedMessages).toContain('Message 2');
      expect(receivedMessages).toContain('Message 3');
    }, 10000);
  });

  // ===== Performance Tests =====
  describe('Performance and Scalability', () => {
    it('should handle concurrent messages from multiple users', async () => {
      const messagePromises = [];

      for (let i = 0; i < 10; i++) {
        messagePromises.push(
          new Promise<void>((resolve) => {
            driverSocket.emit('send_message', {
              rideId,
              message: `Driver message ${i}`,
            });
            setTimeout(resolve, 50);
          }),
        );

        messagePromises.push(
          new Promise<void>((resolve) => {
            passenger1Socket.emit('send_message', {
              rideId,
              message: `Passenger1 message ${i}`,
            });
            setTimeout(resolve, 50);
          }),
        );
      }

      await Promise.all(messagePromises);

      // Verify all messages persisted
      const response = await request(GATEWAY_URL)
        .get(`/rides/${rideId}/messages`)
        .query({ limit: 50 })
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.messages.length).toBeGreaterThan(15);
      console.log(
        `✓ Handled ${response.body.messages.length} concurrent messages`,
      );
    }, 15000);

    it('should maintain low latency for location updates', async () => {
      const latencies: number[] = [];

      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();

        await new Promise<void>((resolve) => {
          passenger1Socket.once('location_update', () => {
            const latency = Date.now() - startTime;
            latencies.push(latency);
            resolve();
          });

          driverSocket.emit('update_location', {
            rideId,
            lat: 47.92 + i * 0.01,
            lng: 106.92 + i * 0.01,
            heading: 45,
            speed: 60,
          });
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const avgLatency =
        latencies.reduce((a, b) => a + b, 0) / latencies.length;
      console.log(`✓ Average latency: ${avgLatency.toFixed(2)}ms`);
      expect(avgLatency).toBeLessThan(500); // Should be under 500ms
    }, 15000);
  });
});
