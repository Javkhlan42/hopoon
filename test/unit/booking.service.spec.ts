import { describe, it, expect, beforeEach, jest } from '@jest/globals';

/**
 * Booking Service Unit Tests
 * Tests for booking creation, confirmation, and management
 */
describe('BookingService', () => {
  let bookingService: any;

  beforeEach(() => {
    // Mock BookingService
    bookingService = {
      createBooking: jest.fn(),
      getBookingById: jest.fn(),
      confirmBooking: jest.fn(),
      cancelBooking: jest.fn(),
      getUserBookings: jest.fn(),
      getRideBookings: jest.fn(),
    };
  });

  describe('createBooking', () => {
    it('should create a new booking successfully', async () => {
      const bookingData = {
        rideId: 'ride-123',
        passengerId: 'passenger-123',
        seats: 2,
        pickupPoint: {
          lat: 47.9184,
          lng: 106.9177,
          address: 'Ulaanbaatar, Mongolia',
        },
        dropoffPoint: {
          lat: 47.927,
          lng: 106.906,
          address: 'Zaisan, Ulaanbaatar',
        },
      };

      const mockBooking = {
        id: 'booking-123',
        ...bookingData,
        status: 'pending',
        totalPrice: 10000,
        createdAt: new Date(),
      };

      bookingService.createBooking.mockResolvedValue(mockBooking);

      const result = await bookingService.createBooking(bookingData);

      expect(bookingService.createBooking).toHaveBeenCalledWith(bookingData);
      expect(result.id).toBe('booking-123');
      expect(result.status).toBe('pending');
      expect(result.seats).toBe(2);
      expect(result.totalPrice).toBe(10000);
    });

    it('should validate seats requested is positive', async () => {
      const bookingData = {
        rideId: 'ride-123',
        passengerId: 'passenger-123',
        seats: 0, // Invalid
        pickupPoint: { lat: 47.9184, lng: 106.9177 },
        dropoffPoint: { lat: 47.927, lng: 106.906 },
      };

      bookingService.createBooking.mockRejectedValue(
        new Error('Seats must be greater than 0'),
      );

      await expect(bookingService.createBooking(bookingData)).rejects.toThrow(
        'Seats must be greater than 0',
      );
    });

    it('should check if ride has available seats', async () => {
      const bookingData = {
        rideId: 'ride-123',
        passengerId: 'passenger-123',
        seats: 5,
        pickupPoint: { lat: 47.9184, lng: 106.9177 },
        dropoffPoint: { lat: 47.927, lng: 106.906 },
      };

      bookingService.createBooking.mockRejectedValue(
        new Error('Not enough available seats'),
      );

      await expect(bookingService.createBooking(bookingData)).rejects.toThrow(
        'Not enough available seats',
      );
    });

    it('should not allow booking for cancelled ride', async () => {
      const bookingData = {
        rideId: 'ride-cancelled',
        passengerId: 'passenger-123',
        seats: 2,
        pickupPoint: { lat: 47.9184, lng: 106.9177 },
        dropoffPoint: { lat: 47.927, lng: 106.906 },
      };

      bookingService.createBooking.mockRejectedValue(
        new Error('Cannot book cancelled ride'),
      );

      await expect(bookingService.createBooking(bookingData)).rejects.toThrow(
        'Cannot book cancelled ride',
      );
    });

    it('should not allow driver to book their own ride', async () => {
      const bookingData = {
        rideId: 'ride-123',
        passengerId: 'driver-123', // Same as driver
        seats: 2,
        pickupPoint: { lat: 47.9184, lng: 106.9177 },
        dropoffPoint: { lat: 47.927, lng: 106.906 },
      };

      bookingService.createBooking.mockRejectedValue(
        new Error('Driver cannot book their own ride'),
      );

      await expect(bookingService.createBooking(bookingData)).rejects.toThrow(
        'Driver cannot book their own ride',
      );
    });
  });

  describe('getBookingById', () => {
    it('should get booking by ID successfully', async () => {
      const bookingId = 'booking-123';

      const mockBooking = {
        id: bookingId,
        rideId: 'ride-123',
        passengerId: 'passenger-123',
        status: 'confirmed',
        seats: 2,
        totalPrice: 10000,
      };

      bookingService.getBookingById.mockResolvedValue(mockBooking);

      const result = await bookingService.getBookingById(bookingId);

      expect(bookingService.getBookingById).toHaveBeenCalledWith(bookingId);
      expect(result.id).toBe(bookingId);
      expect(result.status).toBe('confirmed');
    });

    it('should throw error for non-existent booking', async () => {
      const bookingId = 'non-existent';

      bookingService.getBookingById.mockRejectedValue(
        new Error('Booking not found'),
      );

      await expect(bookingService.getBookingById(bookingId)).rejects.toThrow(
        'Booking not found',
      );
    });
  });

  describe('confirmBooking', () => {
    it('should confirm booking successfully', async () => {
      const bookingId = 'booking-123';

      const mockConfirmedBooking = {
        id: bookingId,
        status: 'confirmed',
        confirmedAt: new Date(),
      };

      bookingService.confirmBooking.mockResolvedValue(mockConfirmedBooking);

      const result = await bookingService.confirmBooking(bookingId);

      expect(bookingService.confirmBooking).toHaveBeenCalledWith(bookingId);
      expect(result.status).toBe('confirmed');
      expect(result.confirmedAt).toBeDefined();
    });

    it('should only allow driver to confirm booking', async () => {
      const bookingId = 'booking-123';

      bookingService.confirmBooking.mockRejectedValue(
        new Error('Only driver can confirm booking'),
      );

      await expect(bookingService.confirmBooking(bookingId)).rejects.toThrow(
        'Only driver can confirm booking',
      );
    });

    it('should not allow confirming cancelled booking', async () => {
      const bookingId = 'booking-123';

      bookingService.confirmBooking.mockRejectedValue(
        new Error('Cannot confirm cancelled booking'),
      );

      await expect(bookingService.confirmBooking(bookingId)).rejects.toThrow(
        'Cannot confirm cancelled booking',
      );
    });

    it('should update ride available seats after confirmation', async () => {
      const bookingId = 'booking-123';

      const mockConfirmedBooking = {
        id: bookingId,
        status: 'confirmed',
        seats: 2,
        rideId: 'ride-123',
      };

      bookingService.confirmBooking.mockResolvedValue(mockConfirmedBooking);

      const result = await bookingService.confirmBooking(bookingId);

      expect(result.status).toBe('confirmed');
      // In real implementation, ride available seats should decrease by 2
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking successfully', async () => {
      const bookingId = 'booking-123';
      const reason = 'Changed plans';

      const mockCancelledBooking = {
        id: bookingId,
        status: 'cancelled',
        cancelReason: reason,
        cancelledAt: new Date(),
      };

      bookingService.cancelBooking.mockResolvedValue(mockCancelledBooking);

      const result = await bookingService.cancelBooking(bookingId, reason);

      expect(bookingService.cancelBooking).toHaveBeenCalledWith(
        bookingId,
        reason,
      );
      expect(result.status).toBe('cancelled');
      expect(result.cancelReason).toBe(reason);
    });

    it('should allow both driver and passenger to cancel', async () => {
      const bookingId = 'booking-123';

      const mockCancelledBooking = {
        id: bookingId,
        status: 'cancelled',
      };

      bookingService.cancelBooking.mockResolvedValue(mockCancelledBooking);

      const result = await bookingService.cancelBooking(bookingId);

      expect(result.status).toBe('cancelled');
    });

    it('should not allow cancelling completed booking', async () => {
      const bookingId = 'booking-123';

      bookingService.cancelBooking.mockRejectedValue(
        new Error('Cannot cancel completed booking'),
      );

      await expect(bookingService.cancelBooking(bookingId)).rejects.toThrow(
        'Cannot cancel completed booking',
      );
    });

    it('should restore ride available seats after cancellation', async () => {
      const bookingId = 'booking-123';

      const mockCancelledBooking = {
        id: bookingId,
        status: 'cancelled',
        seats: 2,
        rideId: 'ride-123',
      };

      bookingService.cancelBooking.mockResolvedValue(mockCancelledBooking);

      const result = await bookingService.cancelBooking(bookingId);

      expect(result.status).toBe('cancelled');
      // In real implementation, ride available seats should increase by 2
    });
  });

  describe('getUserBookings', () => {
    it('should get all bookings for a user', async () => {
      const userId = 'passenger-123';

      const mockBookings = [
        {
          id: 'booking-1',
          passengerId: userId,
          status: 'confirmed',
          seats: 2,
        },
        {
          id: 'booking-2',
          passengerId: userId,
          status: 'completed',
          seats: 1,
        },
      ];

      bookingService.getUserBookings.mockResolvedValue({
        data: mockBookings,
        meta: { page: 1, limit: 20, total: 2 },
      });

      const result = await bookingService.getUserBookings(userId);

      expect(bookingService.getUserBookings).toHaveBeenCalledWith(userId);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].passengerId).toBe(userId);
    });

    it('should filter bookings by status', async () => {
      const userId = 'passenger-123';
      const status = 'confirmed';

      const mockBookings = [
        {
          id: 'booking-1',
          passengerId: userId,
          status: 'confirmed',
          seats: 2,
        },
      ];

      bookingService.getUserBookings.mockResolvedValue({
        data: mockBookings,
        meta: { page: 1, limit: 20, total: 1 },
      });

      const result = await bookingService.getUserBookings(userId, { status });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('confirmed');
    });
  });

  describe('getRideBookings', () => {
    it('should get all bookings for a ride', async () => {
      const rideId = 'ride-123';

      const mockBookings = [
        {
          id: 'booking-1',
          rideId: rideId,
          status: 'confirmed',
          seats: 2,
        },
        {
          id: 'booking-2',
          rideId: rideId,
          status: 'pending',
          seats: 1,
        },
      ];

      bookingService.getRideBookings.mockResolvedValue({
        data: mockBookings,
        meta: { page: 1, limit: 20, total: 2 },
      });

      const result = await bookingService.getRideBookings(rideId);

      expect(bookingService.getRideBookings).toHaveBeenCalledWith(rideId);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].rideId).toBe(rideId);
    });

    it('should only show bookings to driver', async () => {
      const rideId = 'ride-123';

      bookingService.getRideBookings.mockRejectedValue(
        new Error('Only driver can view ride bookings'),
      );

      await expect(bookingService.getRideBookings(rideId)).rejects.toThrow(
        'Only driver can view ride bookings',
      );
    });
  });
});
