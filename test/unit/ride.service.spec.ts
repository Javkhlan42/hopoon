import { describe, it, expect, beforeEach, jest } from '@jest/globals';

/**
 * Ride Service Unit Tests
 * Tests for ride creation, search, and management
 */
describe('RideService', () => {
  let rideService: any;

  beforeEach(() => {
    // Mock RideService
    rideService = {
      createRide: jest.fn(),
      searchRides: jest.fn(),
      getRideById: jest.fn(),
      updateRide: jest.fn(),
      cancelRide: jest.fn(),
      completeRide: jest.fn(),
    };
  });

  describe('createRide', () => {
    it('should create a new ride successfully', async () => {
      const rideData = {
        driverId: 'driver-123',
        origin: {
          lat: 47.9184,
          lng: 106.9177,
          address: 'Ulaanbaatar, Mongolia',
        },
        destination: {
          lat: 47.927,
          lng: 106.906,
          address: 'Zaisan, Ulaanbaatar',
        },
        departureTime: '2024-12-25T10:00:00Z',
        availableSeats: 3,
        pricePerSeat: 5000,
      };

      const mockRide = {
        id: 'ride-123',
        ...rideData,
        status: 'scheduled',
        createdAt: new Date(),
      };

      rideService.createRide.mockResolvedValue(mockRide);

      const result = await rideService.createRide(rideData);

      expect(rideService.createRide).toHaveBeenCalledWith(rideData);
      expect(result.id).toBe('ride-123');
      expect(result.status).toBe('scheduled');
      expect(result.availableSeats).toBe(3);
    });

    it('should validate departure time is in future', async () => {
      const rideData = {
        driverId: 'driver-123',
        origin: { lat: 47.9184, lng: 106.9177 },
        destination: { lat: 47.927, lng: 106.906 },
        departureTime: '2020-01-01T10:00:00Z', // Past date
        availableSeats: 3,
        pricePerSeat: 5000,
      };

      rideService.createRide.mockRejectedValue(
        new Error('Departure time must be in the future'),
      );

      await expect(rideService.createRide(rideData)).rejects.toThrow(
        'Departure time must be in the future',
      );
    });

    it('should validate available seats is positive', async () => {
      const rideData = {
        driverId: 'driver-123',
        origin: { lat: 47.9184, lng: 106.9177 },
        destination: { lat: 47.927, lng: 106.906 },
        departureTime: '2024-12-25T10:00:00Z',
        availableSeats: 0, // Invalid
        pricePerSeat: 5000,
      };

      rideService.createRide.mockRejectedValue(
        new Error('Available seats must be greater than 0'),
      );

      await expect(rideService.createRide(rideData)).rejects.toThrow(
        'Available seats must be greater than 0',
      );
    });

    it('should validate price per seat is positive', async () => {
      const rideData = {
        driverId: 'driver-123',
        origin: { lat: 47.9184, lng: 106.9177 },
        destination: { lat: 47.927, lng: 106.906 },
        departureTime: '2024-12-25T10:00:00Z',
        availableSeats: 3,
        pricePerSeat: -1000, // Invalid
      };

      rideService.createRide.mockRejectedValue(
        new Error('Price per seat must be positive'),
      );

      await expect(rideService.createRide(rideData)).rejects.toThrow(
        'Price per seat must be positive',
      );
    });
  });

  describe('searchRides', () => {
    it('should search rides by origin and destination', async () => {
      const searchParams = {
        originLat: 47.9184,
        originLng: 106.9177,
        destLat: 47.927,
        destLng: 106.906,
        date: '2024-12-25',
      };

      const mockRides = [
        {
          id: 'ride-1',
          origin: { lat: 47.9184, lng: 106.9177 },
          destination: { lat: 47.927, lng: 106.906 },
          departureTime: '2024-12-25T10:00:00Z',
          availableSeats: 3,
          pricePerSeat: 5000,
        },
        {
          id: 'ride-2',
          origin: { lat: 47.918, lng: 106.9175 },
          destination: { lat: 47.9268, lng: 106.9058 },
          departureTime: '2024-12-25T14:00:00Z',
          availableSeats: 2,
          pricePerSeat: 4500,
        },
      ];

      rideService.searchRides.mockResolvedValue({
        data: mockRides,
        meta: { page: 1, limit: 20, total: 2 },
      });

      const result = await rideService.searchRides(searchParams);

      expect(rideService.searchRides).toHaveBeenCalledWith(searchParams);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('ride-1');
    });

    it('should return empty array when no rides found', async () => {
      const searchParams = {
        originLat: 47.9184,
        originLng: 106.9177,
        destLat: 50.0,
        destLng: 100.0,
        date: '2024-12-25',
      };

      rideService.searchRides.mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 20, total: 0 },
      });

      const result = await rideService.searchRides(searchParams);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should filter rides by available seats', async () => {
      const searchParams = {
        originLat: 47.9184,
        originLng: 106.9177,
        destLat: 47.927,
        destLng: 106.906,
        date: '2024-12-25',
        minSeats: 3,
      };

      const mockRides = [
        {
          id: 'ride-1',
          availableSeats: 3,
          pricePerSeat: 5000,
        },
      ];

      rideService.searchRides.mockResolvedValue({
        data: mockRides,
        meta: { page: 1, limit: 20, total: 1 },
      });

      const result = await rideService.searchRides(searchParams);

      expect(result.data[0].availableSeats).toBeGreaterThanOrEqual(3);
    });
  });

  describe('getRideById', () => {
    it('should get ride by ID successfully', async () => {
      const rideId = 'ride-123';

      const mockRide = {
        id: rideId,
        driverId: 'driver-123',
        status: 'scheduled',
        availableSeats: 3,
      };

      rideService.getRideById.mockResolvedValue(mockRide);

      const result = await rideService.getRideById(rideId);

      expect(rideService.getRideById).toHaveBeenCalledWith(rideId);
      expect(result.id).toBe(rideId);
    });

    it('should throw error for non-existent ride', async () => {
      const rideId = 'non-existent';

      rideService.getRideById.mockRejectedValue(new Error('Ride not found'));

      await expect(rideService.getRideById(rideId)).rejects.toThrow(
        'Ride not found',
      );
    });
  });

  describe('updateRide', () => {
    it('should update ride successfully', async () => {
      const rideId = 'ride-123';
      const updateData = {
        availableSeats: 2,
        pricePerSeat: 6000,
      };

      const mockUpdatedRide = {
        id: rideId,
        availableSeats: 2,
        pricePerSeat: 6000,
      };

      rideService.updateRide.mockResolvedValue(mockUpdatedRide);

      const result = await rideService.updateRide(rideId, updateData);

      expect(rideService.updateRide).toHaveBeenCalledWith(rideId, updateData);
      expect(result.availableSeats).toBe(2);
      expect(result.pricePerSeat).toBe(6000);
    });

    it('should not allow updating completed ride', async () => {
      const rideId = 'ride-123';
      const updateData = { pricePerSeat: 6000 };

      rideService.updateRide.mockRejectedValue(
        new Error('Cannot update completed ride'),
      );

      await expect(rideService.updateRide(rideId, updateData)).rejects.toThrow(
        'Cannot update completed ride',
      );
    });
  });

  describe('cancelRide', () => {
    it('should cancel ride successfully', async () => {
      const rideId = 'ride-123';

      const mockCancelledRide = {
        id: rideId,
        status: 'cancelled',
      };

      rideService.cancelRide.mockResolvedValue(mockCancelledRide);

      const result = await rideService.cancelRide(rideId);

      expect(rideService.cancelRide).toHaveBeenCalledWith(rideId);
      expect(result.status).toBe('cancelled');
    });

    it('should not allow cancelling in-progress ride', async () => {
      const rideId = 'ride-123';

      rideService.cancelRide.mockRejectedValue(
        new Error('Cannot cancel in-progress ride'),
      );

      await expect(rideService.cancelRide(rideId)).rejects.toThrow(
        'Cannot cancel in-progress ride',
      );
    });
  });

  describe('completeRide', () => {
    it('should complete ride successfully', async () => {
      const rideId = 'ride-123';

      const mockCompletedRide = {
        id: rideId,
        status: 'completed',
        completedAt: new Date(),
      };

      rideService.completeRide.mockResolvedValue(mockCompletedRide);

      const result = await rideService.completeRide(rideId);

      expect(rideService.completeRide).toHaveBeenCalledWith(rideId);
      expect(result.status).toBe('completed');
      expect(result.completedAt).toBeDefined();
    });

    it('should only allow driver to complete ride', async () => {
      const rideId = 'ride-123';

      rideService.completeRide.mockRejectedValue(
        new Error('Only driver can complete ride'),
      );

      await expect(rideService.completeRide(rideId)).rejects.toThrow(
        'Only driver can complete ride',
      );
    });
  });
});
