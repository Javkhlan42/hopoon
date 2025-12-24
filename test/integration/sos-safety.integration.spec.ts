import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { io, Socket } from 'socket.io-client';

/**
 * SOS and Safety Feature Integration Tests
 * Tests emergency alert system:
 * - SOS alert creation and management
 * - Admin dashboard notifications
 * - Emergency contact notifications
 * - Location tracking during emergency
 * - Alert resolution and follow-up
 */

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3001';
const RIDE_URL = process.env.RIDE_URL || 'http://localhost:3003';
const NOTIFICATION_URL = process.env.NOTIFICATION_URL || 'http://localhost:3007';
const ADMIN_WS_URL = process.env.ADMIN_WS_URL || 'http://localhost:3008';

describe('SOS and Safety Features', () => {
  let driverToken: string;
  let passengerToken: string;
  let adminToken: string;
  let driverId: string;
  let passengerId: string;
  let adminId: string;
  let rideId: string;
  let bookingId: string;
  let adminSocket: Socket;

  beforeAll(async () => {
    // Create admin user
    const adminData = {
      phone: '+97699999999',
      password: 'Admin123!@#',
      name: 'Admin User',
      role: 'admin',
    };

    try {
      await request(AUTH_URL).post('/auth/register').send(adminData);
    } catch (e) {
      // Admin might already exist
    }

    const adminLogin = await request(AUTH_URL).post('/auth/login').send({
      phone: adminData.phone,
      password: adminData.password,
    });
    adminToken = adminLogin.body.accessToken;
    adminId = adminLogin.body.user?.id || adminLogin.body.userId;

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

    // Create passenger
    const passengerData = {
      phone: `+976${Math.floor(80000000 + Math.random() * 10000000)}`,
      password: 'Pass123!@#',
      name: 'Test Passenger',
    };
    await request(AUTH_URL).post('/auth/register').send(passengerData);
    const passLogin = await request(AUTH_URL)
      .post('/auth/login')
      .send({ phone: passengerData.phone, password: passengerData.password });
    passengerToken = passLogin.body.accessToken;
    passengerId = passLogin.body.user?.id || passLogin.body.userId;

    // Create and start ride
    const rideData = {
      origin: { lat: 47.9184, lng: 106.9177, address: 'UB' },
      destination: { lat: 49.4863, lng: 105.9714, address: 'Darkhan' },
      departureTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
      availableSeats: 2,
      pricePerSeat: 25000,
    };
    const rideResponse = await request(GATEWAY_URL)
      .post('/rides')
      .set('Authorization', `Bearer ${driverToken}`)
      .send(rideData);
    rideId = rideResponse.body.id;

    // Create and approve booking
    const bookingResponse = await request(GATEWAY_URL)
      .post('/bookings')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ rideId, seats: 1 });
    bookingId = bookingResponse.body.id;

    await request(GATEWAY_URL)
      .patch(`/bookings/${bookingId}/approve`)
      .set('Authorization', `Bearer ${driverToken}`);

    // Start ride
    await request(GATEWAY_URL)
      .post(`/rides/${rideId}/start`)
      .set('Authorization', `Bearer ${driverToken}`);
  }, 60000);

  afterAll(() => {
    if (adminSocket) adminSocket.disconnect();
  });

  // ===== SOS Alert Creation =====
  describe('SOS Alert Creation', () => {
    let sosAlertId: string;

    it('should create SOS alert from passenger during active ride', async () => {
      const sosData = {
        rideId,
        location: {
          lat: 47.95,
          lng: 106.95,
        },
        description: 'Эмзэгтэй байдал - Жолооч зөрүүдээ хэтрүүлж байна',
        severity: 'high',
      };

      const response = await request(GATEWAY_URL)
        .post('/safety/sos')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(sosData)
        .expect(201);

      expect(response.body).toHaveProperty('alertId');
      expect(response.body).toHaveProperty('status', 'active');
      expect(response.body).toHaveProperty('rideId', rideId);
      expect(response.body).toHaveProperty('userId', passengerId);
      expect(response.body).toHaveProperty('severity', 'high');
      expect(response.body).toHaveProperty('timestamp');

      sosAlertId = response.body.alertId;
      console.log(`✓ SOS Alert created: ${sosAlertId}`);
    });

    it('should create SOS alert from driver', async () => {
      const sosData = {
        rideId,
        location: {
          lat: 47.96,
          lng: 106.96,
        },
        description: 'Машин эвдэрсэн, тусламж хэрэгтэй',
        severity: 'medium',
      };

      const response = await request(GATEWAY_URL)
        .post('/safety/sos')
        .set('Authorization', `Bearer ${driverToken}`)
        .send(sosData)
        .expect(201);

      expect(response.body.severity).toBe('medium');
      console.log(`✓ Driver SOS created: ${response.body.alertId}`);
    });

    it('should require authentication for SOS creation', async () => {
      const sosData = {
        rideId,
        location: { lat: 47.95, lng: 106.95 },
        description: 'Test',
      };

      await request(GATEWAY_URL).post('/safety/sos').send(sosData).expect(401);
    });

    it('should validate ride exists and is active', async () => {
      const sosData = {
        rideId: 'non-existent-ride',
        location: { lat: 47.95, lng: 106.95 },
        description: 'Test',
      };

      const response = await request(GATEWAY_URL)
        .post('/safety/sos')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(sosData)
        .expect(404);

      expect(response.body.message).toMatch(/ride not found/i);
    });

    it('should store SOS alert in database with TTL in cache', async () => {
      // Check database
      const dbResponse = await request(GATEWAY_URL)
        .get(`/rides/${rideId}/sos`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(dbResponse.body).toBeInstanceOf(Array);
      expect(dbResponse.body.length).toBeGreaterThan(0);

      const alert = dbResponse.body.find((a: any) => a.id === sosAlertId);
      expect(alert).toBeDefined();
      expect(alert.status).toBe('active');
      expect(alert.severity).toBe('high');
    });
  });

  // ===== Admin Dashboard Notifications =====
  describe('Admin Dashboard Notifications', () => {
    it('should connect admin to emergency channel', (done) => {
      adminSocket = io(ADMIN_WS_URL, {
        auth: { token: adminToken },
        transports: ['websocket'],
      });

      adminSocket.on('connect', () => {
        expect(adminSocket.connected).toBe(true);
        adminSocket.emit('subscribe_emergency');
        console.log('✓ Admin connected to emergency channel');
        done();
      });
    }, 10000);

    it('should notify admin of new SOS alert in real-time', (done) => {
      adminSocket.on('sos_alert', (data: any) => {
        expect(data).toHaveProperty('alertId');
        expect(data).toHaveProperty('rideId', rideId);
        expect(data).toHaveProperty('severity');
        expect(data).toHaveProperty('location');
        expect(data).toHaveProperty('description');
        expect(data).toHaveProperty('userId');
        console.log(`✓ Admin received SOS alert: ${data.alertId}`);
        done();
      });

      // Trigger new SOS
      setTimeout(async () => {
        await request(GATEWAY_URL)
          .post('/safety/sos')
          .set('Authorization', `Bearer ${passengerToken}`)
          .send({
            rideId,
            location: { lat: 47.97, lng: 106.97 },
            description: 'Urgent help needed',
            severity: 'critical',
          });
      }, 500);
    }, 10000);

    it('should provide comprehensive alert details to admin', async () => {
      const response = await request(GATEWAY_URL)
        .get('/safety/sos/active')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);

      if (response.body.length > 0) {
        const alert = response.body[0];
        expect(alert).toHaveProperty('alertId');
        expect(alert).toHaveProperty('rideId');
        expect(alert).toHaveProperty('userId');
        expect(alert).toHaveProperty('userName');
        expect(alert).toHaveProperty('userPhone');
        expect(alert).toHaveProperty('driverId');
        expect(alert).toHaveProperty('driverName');
        expect(alert).toHaveProperty('driverPhone');
        expect(alert).toHaveProperty('currentLocation');
        expect(alert).toHaveProperty('severity');
        expect(alert).toHaveProperty('description');
        expect(alert).toHaveProperty('timestamp');
      }
    });

    it('should show alert count on admin dashboard', async () => {
      const response = await request(GATEWAY_URL)
        .get('/safety/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('activeAlerts');
      expect(response.body).toHaveProperty('totalAlerts');
      expect(response.body).toHaveProperty('resolvedToday');
      expect(response.body.activeAlerts).toBeGreaterThan(0);
    });
  });

  // ===== Emergency Contact Notifications =====
  describe('Emergency Contact Notifications', () => {
    it('should notify passenger emergency contacts', async () => {
      // First set emergency contacts
      await request(GATEWAY_URL)
        .put('/users/me/emergency-contacts')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          contacts: [
            { name: 'Ээж', phone: '+97699111111', relation: 'mother' },
            { name: 'Аав', phone: '+97699222222', relation: 'father' },
          ],
        });

      // Create SOS
      const sosResponse = await request(GATEWAY_URL)
        .post('/safety/sos')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          rideId,
          location: { lat: 47.98, lng: 106.98 },
          description: 'Emergency',
          severity: 'critical',
          notifyEmergencyContacts: true,
        })
        .expect(201);

      // Verify notifications were sent
      const notifResponse = await request(NOTIFICATION_URL)
        .get(`/notifications/alert/${sosResponse.body.alertId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(notifResponse.body).toHaveProperty('emergencyContactsNotified', true);
      expect(notifResponse.body).toHaveProperty('notificationsSent');
      expect(notifResponse.body.notificationsSent).toBeGreaterThan(0);
    });

    it('should send SMS to emergency contacts', async () => {
      const response = await request(NOTIFICATION_URL)
        .get('/notifications/sms/recent')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ type: 'emergency' })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      
      if (response.body.length > 0) {
        const sms = response.body[0];
        expect(sms).toHaveProperty('to');
        expect(sms).toHaveProperty('message');
        expect(sms.message).toMatch(/SOS|Emergency|Эмзэгтэй/i);
      }
    });
  });

  // ===== Location Tracking During Emergency =====
  describe('Location Tracking During Emergency', () => {
    let emergencyAlertId: string;

    beforeAll(async () => {
      const response = await request(GATEWAY_URL)
        .post('/safety/sos')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          rideId,
          location: { lat: 48.0, lng: 107.0 },
          description: 'Test emergency for tracking',
          severity: 'high',
        });
      emergencyAlertId = response.body.alertId;
    });

    it('should enable enhanced location tracking during SOS', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/rides/${rideId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('emergencyMode', true);
      expect(response.body).toHaveProperty('trackingInterval', 5); // 5 seconds instead of 30
    });

    it('should store location history with SOS alert', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/safety/sos/${emergencyAlertId}/location-trail`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('alertId', emergencyAlertId);
      expect(response.body).toHaveProperty('locations');
      expect(response.body.locations).toBeInstanceOf(Array);
    });

    it('should share live location with emergency responders', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/safety/sos/${emergencyAlertId}/share-link`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('shareUrl');
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body).toHaveProperty('accessToken');

      // Verify link works without authentication
      const publicResponse = await request(GATEWAY_URL)
        .get(`/safety/track/${response.body.accessToken}`)
        .expect(200);

      expect(publicResponse.body).toHaveProperty('rideId');
      expect(publicResponse.body).toHaveProperty('currentLocation');
      expect(publicResponse.body).toHaveProperty('status');
    });
  });

  // ===== Alert Resolution =====
  describe('Alert Resolution and Follow-up', () => {
    let resolveAlertId: string;

    beforeAll(async () => {
      const response = await request(GATEWAY_URL)
        .post('/safety/sos')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          rideId,
          location: { lat: 48.1, lng: 107.1 },
          description: 'Test for resolution',
          severity: 'medium',
        });
      resolveAlertId = response.body.alertId;
    });

    it('should allow admin to resolve SOS alert', async () => {
      const response = await request(GATEWAY_URL)
        .patch(`/safety/sos/${resolveAlertId}/resolve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          resolution: 'contacted_user',
          notes: 'Spoke with passenger, situation resolved',
          actionTaken: 'phone_call',
        })
        .expect(200);

      expect(response.body.status).toBe('resolved');
      expect(response.body).toHaveProperty('resolvedAt');
      expect(response.body).toHaveProperty('resolvedBy', adminId);
    });

    it('should allow passenger to cancel false alarm', async () => {
      // Create new alert
      const sosResponse = await request(GATEWAY_URL)
        .post('/safety/sos')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          rideId,
          location: { lat: 48.2, lng: 107.2 },
          description: 'False alarm test',
          severity: 'low',
        });

      const alertId = sosResponse.body.alertId;

      // Cancel it
      const response = await request(GATEWAY_URL)
        .patch(`/safety/sos/${alertId}/cancel`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({ reason: 'false_alarm' })
        .expect(200);

      expect(response.body.status).toBe('cancelled');
      expect(response.body).toHaveProperty('cancelledBy', passengerId);
    });

    it('should send follow-up notification after resolution', async () => {
      const response = await request(NOTIFICATION_URL)
        .get('/notifications/user/recent')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      const followUpNotif = response.body.find(
        (n: any) => n.type === 'sos_resolved',
      );

      if (followUpNotif) {
        expect(followUpNotif).toHaveProperty('alertId');
        expect(followUpNotif).toHaveProperty('message');
      }
    });

    it('should record alert in user safety history', async () => {
      const response = await request(GATEWAY_URL)
        .get('/users/me/safety-history')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      
      const history = response.body[0];
      expect(history).toHaveProperty('alertId');
      expect(history).toHaveProperty('rideId');
      expect(history).toHaveProperty('status');
      expect(history).toHaveProperty('severity');
      expect(history).toHaveProperty('createdAt');
    });
  });

  // ===== Prevention and Analytics =====
  describe('Safety Analytics and Prevention', () => {
    it('should track driver safety score', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/users/${driverId}/safety-score`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('safetyScore');
      expect(response.body).toHaveProperty('totalRides');
      expect(response.body).toHaveProperty('sosAlerts');
      expect(response.body).toHaveProperty('complaints');
      expect(response.body.safetyScore).toBeGreaterThanOrEqual(0);
      expect(response.body.safetyScore).toBeLessThanOrEqual(100);
    });

    it('should provide safety insights for rides', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/rides/${rideId}/safety-insights`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('riskLevel');
      expect(response.body).toHaveProperty('alerts');
      expect(response.body).toHaveProperty('driverScore');
      expect(response.body).toHaveProperty('routeRisk');
    });

    it('should flag high-risk users', async () => {
      const response = await request(GATEWAY_URL)
        .get('/safety/high-risk-users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      
      if (response.body.length > 0) {
        const user = response.body[0];
        expect(user).toHaveProperty('userId');
        expect(user).toHaveProperty('riskScore');
        expect(user).toHaveProperty('sosCount');
        expect(user).toHaveProperty('reasons');
      }
    });

    it('should generate monthly safety report', async () => {
      const response = await request(GATEWAY_URL)
        .get('/safety/reports/monthly')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
        })
        .expect(200);

      expect(response.body).toHaveProperty('totalAlerts');
      expect(response.body).toHaveProperty('criticalAlerts');
      expect(response.body).toHaveProperty('resolvedAlerts');
      expect(response.body).toHaveProperty('averageResponseTime');
      expect(response.body).toHaveProperty('topReasons');
    });
  });

  // ===== Edge Cases =====
  describe('Edge Cases and Error Handling', () => {
    it('should handle multiple simultaneous SOS from same ride', async () => {
      const promises = [
        request(GATEWAY_URL)
          .post('/safety/sos')
          .set('Authorization', `Bearer ${passengerToken}`)
          .send({
            rideId,
            location: { lat: 48.3, lng: 107.3 },
            description: 'Simultaneous 1',
          }),
        request(GATEWAY_URL)
          .post('/safety/sos')
          .set('Authorization', `Bearer ${driverToken}`)
          .send({
            rideId,
            location: { lat: 48.3, lng: 107.3 },
            description: 'Simultaneous 2',
          }),
      ];

      const responses = await Promise.all(promises);
      
      responses.forEach((res) => {
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('alertId');
      });

      expect(responses[0].body.alertId).not.toBe(responses[1].body.alertId);
    });

    it('should prevent SOS spam', async () => {
      // Try to create 5 SOS in quick succession
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(GATEWAY_URL)
            .post('/safety/sos')
            .set('Authorization', `Bearer ${passengerToken}`)
            .send({
              rideId,
              location: { lat: 48.4, lng: 107.4 },
              description: `Spam test ${i}`,
            }),
        );
      }

      const responses = await Promise.all(promises);
      
      // Should allow first few but rate limit others
      const successCount = responses.filter((r) => r.status === 201).length;
      const blockedCount = responses.filter((r) => r.status === 429).length;

      expect(successCount).toBeLessThanOrEqual(3);
      expect(blockedCount).toBeGreaterThan(0);
    });

    it('should handle SOS after ride completion', async () => {
      const response = await request(GATEWAY_URL)
        .post('/safety/sos')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          rideId,
          location: { lat: 48.5, lng: 107.5 },
          description: 'After ride SOS',
        });

      // Should still allow for incidents after ride ends
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('alertId');
    });
  });
});
