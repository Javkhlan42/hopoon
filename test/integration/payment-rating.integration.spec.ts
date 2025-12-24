import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

/**
 * Payment Processing and Rating System Integration Tests
 * Tests:
 * - Wallet-based payments
 * - Payment processing workflow
 * - Refunds and cancellations
 * - Mutual rating system (driver ↔ passenger)
 * - Rating analytics and insights
 */

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3001';
const PAYMENT_URL = process.env.PAYMENT_URL || 'http://localhost:3006';

describe('Payment Processing and Ratings', () => {
  let driverToken: string;
  let passengerToken: string;
  let driverId: string;
  let passengerId: string;
  let rideId: string;
  let bookingId: string;

  beforeAll(async () => {
    // Create driver
    const driverData = {
      phone: `+976${Math.floor(80000000 + Math.random() * 10000000)}`,
      password: 'Driver123!@#',
      name: 'Payment Test Driver',
    };
    await request(AUTH_URL).post('/auth/register').send(driverData);
    const driverLogin = await request(AUTH_URL)
      .post('/auth/login')
      .send({ phone: driverData.phone, password: driverData.password });
    driverToken = driverLogin.body.accessToken;
    driverId = driverLogin.body.user?.id || driverLogin.body.userId;

    // Create passenger with wallet balance
    const passengerData = {
      phone: `+976${Math.floor(80000000 + Math.random() * 10000000)}`,
      password: 'Pass123!@#',
      name: 'Payment Test Passenger',
    };
    await request(AUTH_URL).post('/auth/register').send(passengerData);
    const passLogin = await request(AUTH_URL)
      .post('/auth/login')
      .send({ phone: passengerData.phone, password: passengerData.password });
    passengerToken = passLogin.body.accessToken;
    passengerId = passLogin.body.user?.id || passLogin.body.userId;

    // Top up passenger wallet
    await request(GATEWAY_URL)
      .post('/wallet/topup')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({
        amount: 100000, // ₮100,000
        method: 'test_payment',
      });

    // Create ride
    const rideData = {
      origin: { lat: 47.9184, lng: 106.9177, address: 'UB' },
      destination: { lat: 49.4863, lng: 105.9714, address: 'Darkhan' },
      departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      availableSeats: 3,
      pricePerSeat: 30000,
    };
    const rideResponse = await request(GATEWAY_URL)
      .post('/rides')
      .set('Authorization', `Bearer ${driverToken}`)
      .send(rideData);
    rideId = rideResponse.body.id;
  }, 60000);

  // ===== Wallet Management =====
  describe('Wallet Management', () => {
    it('should check wallet balance', async () => {
      const response = await request(GATEWAY_URL)
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('balance');
      expect(response.body).toHaveProperty('currency', 'MNT');
      expect(response.body.balance).toBeGreaterThanOrEqual(100000);
      console.log(`✓ Wallet balance: ₮${response.body.balance}`);
    });

    it('should show wallet transaction history', async () => {
      const response = await request(GATEWAY_URL)
        .get('/wallet/transactions')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);

      const topup = response.body[0];
      expect(topup).toHaveProperty('type', 'topup');
      expect(topup).toHaveProperty('amount', 100000);
      expect(topup).toHaveProperty('status', 'completed');
    });

    it('should validate sufficient balance before booking', async () => {
      // Try to book with insufficient balance
      // First, drain the wallet
      await request(GATEWAY_URL)
        .post('/wallet/withdraw')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({ amount: 95000 });

      const response = await request(GATEWAY_URL)
        .post('/bookings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          rideId,
          seats: 3, // ₮90,000 (should fail with ₮5,000 balance)
        })
        .expect(400);

      expect(response.body.message).toMatch(/insufficient balance/i);

      // Top up again for next tests
      await request(GATEWAY_URL)
        .post('/wallet/topup')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({ amount: 100000, method: 'test_payment' });
    });
  });

  // ===== Booking and Payment Flow =====
  describe('Booking Payment Processing', () => {
    it('should hold funds when creating booking', async () => {
      const balanceBefore = await request(GATEWAY_URL)
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${passengerToken}`);

      const bookingResponse = await request(GATEWAY_URL)
        .post('/bookings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({ rideId, seats: 2 }) // ₮60,000
        .expect(201);

      bookingId = bookingResponse.body.id;

      const balanceAfter = await request(GATEWAY_URL)
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${passengerToken}`);

      // Balance should be reduced by hold amount
      expect(balanceAfter.body.balance).toBe(
        balanceBefore.body.balance - 60000,
      );
      expect(balanceAfter.body).toHaveProperty('heldAmount', 60000);

      console.log(`✓ Funds held: ₮60,000`);
    });

    it('should show payment as pending', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/payments/booking/${bookingId}`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('amount', 60000);
      expect(response.body).toHaveProperty('method', 'wallet');
      expect(response.body).toHaveProperty('holdId');
    });

    it('should approve booking by driver', async () => {
      await request(GATEWAY_URL)
        .patch(`/bookings/${bookingId}/approve`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      // Payment should still be pending until ride completes
      const payment = await request(GATEWAY_URL)
        .get(`/payments/booking/${bookingId}`)
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(payment.body.status).toBe('pending');
    });

    it('should complete payment when ride ends', async () => {
      // Start ride
      await request(GATEWAY_URL)
        .post(`/rides/${rideId}/start`)
        .set('Authorization', `Bearer ${driverToken}`);

      // End ride
      await request(GATEWAY_URL)
        .post(`/rides/${rideId}/end`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      // Payment should be completed
      const payment = await request(GATEWAY_URL)
        .get(`/payments/booking/${bookingId}`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(payment.body.status).toBe('completed');
      expect(payment.body).toHaveProperty('completedAt');
      console.log(`✓ Payment completed: ₮60,000`);
    });

    it('should transfer funds to driver wallet', async () => {
      const driverWallet = await request(GATEWAY_URL)
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      // Driver should have received payment (minus platform fee)
      const platformFee = 60000 * 0.1; // 10% fee
      const driverReceives = 60000 - platformFee;

      expect(driverWallet.body.balance).toBeGreaterThanOrEqual(driverReceives);
      console.log(
        `✓ Driver received: ₮${driverReceives} (₮${platformFee} fee)`,
      );
    });

    it('should record transaction in both wallets', async () => {
      // Passenger transaction
      const passengerTx = await request(GATEWAY_URL)
        .get('/wallet/transactions')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      const payment = passengerTx.body.find(
        (tx: any) => tx.type === 'payment' && tx.bookingId === bookingId,
      );
      expect(payment).toBeDefined();
      expect(payment.amount).toBe(-60000); // Debit

      // Driver transaction
      const driverTx = await request(GATEWAY_URL)
        .get('/wallet/transactions')
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      const earning = driverTx.body.find(
        (tx: any) => tx.type === 'earning' && tx.bookingId === bookingId,
      );
      expect(earning).toBeDefined();
      expect(earning.amount).toBe(54000); // Credit (₮60,000 - 10%)
    });
  });

  // ===== Refunds and Cancellations =====
  describe('Refunds and Cancellations', () => {
    let refundRideId: string;
    let refundBookingId: string;

    beforeAll(async () => {
      // Create new ride for refund tests
      const rideData = {
        origin: { lat: 47.9184, lng: 106.9177, address: 'UB' },
        destination: { lat: 49.4863, lng: 105.9714, address: 'Darkhan' },
        departureTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        availableSeats: 2,
        pricePerSeat: 25000,
      };
      const rideResponse = await request(GATEWAY_URL)
        .post('/rides')
        .set('Authorization', `Bearer ${driverToken}`)
        .send(rideData);
      refundRideId = rideResponse.body.id;

      // Create booking
      const bookingResponse = await request(GATEWAY_URL)
        .post('/bookings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({ rideId: refundRideId, seats: 1 });
      refundBookingId = bookingResponse.body.id;
    });

    it('should refund 100% if cancelled by driver', async () => {
      const balanceBefore = await request(GATEWAY_URL)
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${passengerToken}`);

      await request(GATEWAY_URL)
        .post(`/bookings/${refundBookingId}/cancel`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ reason: 'Driver cancelled' })
        .expect(200);

      const balanceAfter = await request(GATEWAY_URL)
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(balanceAfter.body.balance).toBe(
        balanceBefore.body.balance + 25000,
      );
      console.log(`✓ Full refund: ₮25,000`);
    });

    it('should apply cancellation fee if passenger cancels late', async () => {
      // Create another booking
      const booking2 = await request(GATEWAY_URL)
        .post('/bookings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({ rideId: refundRideId, seats: 1 });

      const balanceBefore = await request(GATEWAY_URL)
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${passengerToken}`);

      // Passenger cancels (late cancellation = 20% fee)
      await request(GATEWAY_URL)
        .post(`/bookings/${booking2.body.id}/cancel`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({ reason: 'Changed plans' })
        .expect(200);

      const balanceAfter = await request(GATEWAY_URL)
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${passengerToken}`);

      const refundAmount = 25000 * 0.8; // 80% refund
      expect(balanceAfter.body.balance).toBe(
        balanceBefore.body.balance + refundAmount,
      );
      console.log(`✓ Partial refund: ₮${refundAmount} (20% fee)`);
    });

    it('should process refund for rejected booking', async () => {
      // Create new booking
      const booking3 = await request(GATEWAY_URL)
        .post('/bookings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({ rideId: refundRideId, seats: 1 });

      const balanceBefore = await request(GATEWAY_URL)
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${passengerToken}`);

      // Driver rejects
      await request(GATEWAY_URL)
        .patch(`/bookings/${booking3.body.id}/reject`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ reason: 'Fully booked' })
        .expect(200);

      const balanceAfter = await request(GATEWAY_URL)
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${passengerToken}`);

      // Should get full refund
      expect(balanceAfter.body.balance).toBe(
        balanceBefore.body.balance + 25000,
      );
    });
  });

  // ===== Rating System =====
  describe('Mutual Rating System', () => {
    it('should allow passenger to rate driver', async () => {
      const ratingData = {
        bookingId,
        ratedUserId: driverId,
        rating: 5,
        comment: 'Маш сайн жолооч! Цагтаа ирсэн, аюулгүй жолоодсон.',
        categories: {
          punctuality: 5,
          driving: 5,
          cleanliness: 5,
          communication: 5,
          vehicleCondition: 4,
        },
      };

      const response = await request(GATEWAY_URL)
        .post('/ratings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(ratingData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('bookingId', bookingId);
      expect(response.body).toHaveProperty('rating', 5);
      expect(response.body).toHaveProperty('ratedUserId', driverId);
      expect(response.body).toHaveProperty('reviewerId', passengerId);
      console.log(`✓ Passenger rated driver: ⭐⭐⭐⭐⭐`);
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
          communication: 5,
        },
      };

      const response = await request(GATEWAY_URL)
        .post('/ratings')
        .set('Authorization', `Bearer ${driverToken}`)
        .send(ratingData)
        .expect(201);

      expect(response.body).toHaveProperty('rating', 5);
      console.log(`✓ Driver rated passenger: ⭐⭐⭐⭐⭐`);
    });

    it('should prevent rating same booking twice', async () => {
      const ratingData = {
        bookingId,
        ratedUserId: driverId,
        rating: 4,
        comment: 'Duplicate test',
      };

      const response = await request(GATEWAY_URL)
        .post('/ratings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(ratingData)
        .expect(400);

      expect(response.body.message).toMatch(/already rated/i);
    });

    it('should validate rating range (1-5)', async () => {
      const invalidRating = {
        bookingId,
        ratedUserId: driverId,
        rating: 6,
        comment: 'Invalid',
      };

      const response = await request(GATEWAY_URL)
        .post('/ratings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(invalidRating)
        .expect(400);

      expect(response.body.message).toMatch(/rating must be between 1 and 5/i);
    });

    it('should update driver average rating', async () => {
      const profile = await request(GATEWAY_URL)
        .get(`/users/${driverId}/profile`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(profile.body).toHaveProperty('averageRating');
      expect(profile.body).toHaveProperty('totalRatings');
      expect(profile.body.averageRating).toBeGreaterThanOrEqual(4.5);
      expect(profile.body.totalRatings).toBeGreaterThan(0);
      console.log(
        `✓ Driver average: ${profile.body.averageRating} (${profile.body.totalRatings} ratings)`,
      );
    });

    it('should show rating breakdown by category', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/users/${driverId}/ratings/breakdown`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('overall');
      expect(response.body).toHaveProperty('categories');
      expect(response.body.categories).toHaveProperty('punctuality');
      expect(response.body.categories).toHaveProperty('driving');
      expect(response.body.categories).toHaveProperty('cleanliness');
      expect(response.body.categories).toHaveProperty('communication');
    });

    it('should list recent reviews', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/users/${driverId}/reviews`)
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('reviews');
      expect(response.body).toHaveProperty('total');
      expect(response.body.reviews).toBeInstanceOf(Array);

      if (response.body.reviews.length > 0) {
        const review = response.body.reviews[0];
        expect(review).toHaveProperty('rating');
        expect(review).toHaveProperty('comment');
        expect(review).toHaveProperty('reviewerName');
        expect(review).toHaveProperty('createdAt');
        // Should not expose reviewer's full details for privacy
        expect(review).not.toHaveProperty('reviewerPhone');
      }
    });

    it('should support rating filters', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/users/${driverId}/reviews`)
        .query({ minRating: 4 })
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      response.body.reviews.forEach((review: any) => {
        expect(review.rating).toBeGreaterThanOrEqual(4);
      });
    });
  });

  // ===== Rating Analytics =====
  describe('Rating Analytics and Insights', () => {
    it('should generate driver performance report', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/users/${driverId}/performance`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('overallRating');
      expect(response.body).toHaveProperty('totalRides');
      expect(response.body).toHaveProperty('completionRate');
      expect(response.body).toHaveProperty('cancellationRate');
      expect(response.body).toHaveProperty('acceptanceRate');
      expect(response.body).toHaveProperty('earnings');
      expect(response.body).toHaveProperty('categoryRatings');
    });

    it('should show rating trend over time', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/users/${driverId}/ratings/trend`)
        .query({ period: '30days' })
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('trend');
      expect(response.body.trend).toBeInstanceOf(Array);

      if (response.body.trend.length > 0) {
        const point = response.body.trend[0];
        expect(point).toHaveProperty('date');
        expect(point).toHaveProperty('averageRating');
        expect(point).toHaveProperty('count');
      }
    });

    it('should compare with platform average', async () => {
      const response = await request(GATEWAY_URL)
        .get(`/users/${driverId}/ratings/comparison`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('yourRating');
      expect(response.body).toHaveProperty('platformAverage');
      expect(response.body).toHaveProperty('percentile');
      console.log(
        `✓ Driver rating: ${response.body.yourRating} (Platform avg: ${response.body.platformAverage})`,
      );
    });

    it('should flag low-rated users for review', async () => {
      const response = await request(GATEWAY_URL)
        .get('/admin/users/low-rated')
        .set('Authorization', `Bearer ${driverToken}`) // Would be admin token in production
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);

      response.body.forEach((user: any) => {
        expect(user).toHaveProperty('userId');
        expect(user).toHaveProperty('averageRating');
        expect(user.averageRating).toBeLessThan(3.5);
      });
    });
  });

  // ===== Payment Edge Cases =====
  describe('Payment Edge Cases', () => {
    it('should handle wallet insufficient funds gracefully', async () => {
      // Create user with no balance
      const poorUserData = {
        phone: `+976${Math.floor(80000000 + Math.random() * 10000000)}`,
        password: 'Poor123!@#',
        name: 'No Money User',
      };
      await request(AUTH_URL).post('/auth/register').send(poorUserData);
      const poorLogin = await request(AUTH_URL)
        .post('/auth/login')
        .send({ phone: poorUserData.phone, password: poorUserData.password });

      const response = await request(GATEWAY_URL)
        .post('/bookings')
        .set('Authorization', `Bearer ${poorLogin.body.accessToken}`)
        .send({ rideId, seats: 1 })
        .expect(400);

      expect(response.body.message).toMatch(/insufficient balance/i);
    });

    it('should handle concurrent bookings correctly', async () => {
      // Top up wallet significantly
      await request(GATEWAY_URL)
        .post('/wallet/topup')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({ amount: 500000, method: 'test_payment' });

      // Create ride with 1 seat
      const limitedRide = await request(GATEWAY_URL)
        .post('/rides')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          origin: { lat: 47.9184, lng: 106.9177, address: 'UB' },
          destination: { lat: 49.4863, lng: 105.9714, address: 'Darkhan' },
          departureTime: new Date(
            Date.now() + 4 * 60 * 60 * 1000,
          ).toISOString(),
          availableSeats: 1,
          pricePerSeat: 20000,
        });

      // Try to book simultaneously from same user
      const promises = [
        request(GATEWAY_URL)
          .post('/bookings')
          .set('Authorization', `Bearer ${passengerToken}`)
          .send({ rideId: limitedRide.body.id, seats: 1 }),
        request(GATEWAY_URL)
          .post('/bookings')
          .set('Authorization', `Bearer ${passengerToken}`)
          .send({ rideId: limitedRide.body.id, seats: 1 }),
      ];

      const results = await Promise.all(promises.map((p) => p.catch((e) => e)));

      // One should succeed, one should fail
      const successes = results.filter((r) => r.status === 201);
      const failures = results.filter(
        (r) => r.status === 400 || r.status === 409,
      );

      expect(successes.length).toBe(1);
      expect(failures.length).toBe(1);
    });

    it('should rollback payment on booking failure', async () => {
      const balanceBefore = await request(GATEWAY_URL)
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${passengerToken}`);

      // Try to book non-existent ride
      await request(GATEWAY_URL)
        .post('/bookings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({ rideId: 'non-existent-ride-id', seats: 1 })
        .expect(404);

      const balanceAfter = await request(GATEWAY_URL)
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${passengerToken}`);

      // Balance should remain unchanged
      expect(balanceAfter.body.balance).toBe(balanceBefore.body.balance);
    });
  });

  // ===== Summary =====
  describe('Payment and Rating Summary', () => {
    it('should generate complete payment report', async () => {
      const response = await request(GATEWAY_URL)
        .get('/payments/report')
        .set('Authorization', `Bearer ${passengerToken}`)
        .query({
          startDate: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          endDate: new Date().toISOString(),
        })
        .expect(200);

      expect(response.body).toHaveProperty('totalSpent');
      expect(response.body).toHaveProperty('totalRefunded');
      expect(response.body).toHaveProperty('numberOfRides');
      expect(response.body).toHaveProperty('transactions');
      console.log(`\n=== PAYMENT SUMMARY ===`);
      console.log(`Total spent: ₮${response.body.totalSpent}`);
      console.log(`Total refunded: ₮${response.body.totalRefunded}`);
      console.log(`Rides: ${response.body.numberOfRides}`);
      console.log(`=======================\n`);
    });

    it('should display driver earnings summary', async () => {
      const response = await request(GATEWAY_URL)
        .get('/payments/earnings')
        .set('Authorization', `Bearer ${driverToken}`)
        .query({ period: 'month' })
        .expect(200);

      expect(response.body).toHaveProperty('totalEarnings');
      expect(response.body).toHaveProperty('platformFees');
      expect(response.body).toHaveProperty('netEarnings');
      expect(response.body).toHaveProperty('numberOfRides');
      expect(response.body).toHaveProperty('averagePerRide');
      console.log(`\n=== DRIVER EARNINGS ===`);
      console.log(`Gross: ₮${response.body.totalEarnings}`);
      console.log(`Fees: ₮${response.body.platformFees}`);
      console.log(`Net: ₮${response.body.netEarnings}`);
      console.log(`Avg/ride: ₮${response.body.averagePerRide}`);
      console.log(`=======================\n`);
    });
  });
});
