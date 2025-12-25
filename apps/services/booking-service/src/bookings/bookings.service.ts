import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Booking, BookingStatus } from './booking.entity';
import { CreateBookingDto, BookingQueryDto } from './bookings.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private httpService: HttpService,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<Booking> {
    const { rideId, seats } = createBookingDto;

    // Fetch ride details from ride-service
    const rideServiceUrl =
      process.env.RIDE_SERVICE_URL || 'http://localhost:3003';
    let ride;

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${rideServiceUrl}/rides/${rideId}`),
      );
      ride = response.data;
    } catch (error) {
      throw new NotFoundException('Ride not found');
    }

    // Validate ride availability
    if (ride.status !== 'active') {
      throw new BadRequestException('Ride is not available for booking');
    }

    const availableSeats = ride.available_seats || ride.availableSeats;
    if (availableSeats < seats) {
      throw new BadRequestException(`Only ${availableSeats} seats available`);
    }

    const driverId = ride.driver_id || ride.driverId;
    if (driverId === userId) {
      throw new BadRequestException('Cannot book your own ride');
    }

    // Check if user already has a booking for this ride
    const existingBooking = await this.bookingsRepository.findOne({
      where: {
        ride_id: rideId,
        passenger_id: userId,
        status: BookingStatus.PENDING,
      },
    });

    if (existingBooking) {
      throw new BadRequestException(
        'You already have a pending booking for this ride',
      );
    }

    // Calculate price
    const pricePerSeat = ride.price_per_seat || ride.pricePerSeat;
    const totalPrice = pricePerSeat * seats;

    // Create booking
    const booking = this.bookingsRepository.create({
      ride_id: rideId,
      passenger_id: userId,
      seats,
      price: totalPrice,
      status: BookingStatus.PENDING,
    });

    const savedBooking = await this.bookingsRepository.save(booking);

    // TODO: Notify driver about new booking request
    // await this.notifyDriver(ride.driverId, savedBooking);

    return savedBooking;
  }

  async findAll(
    query: BookingQueryDto,
    userId: string,
  ): Promise<{ data: Booking[]; total: number }> {
    const { status, rideId, page = 1, limit = 20 } = query;

    const queryBuilder = this.bookingsRepository
      .createQueryBuilder('booking')
      .where('booking.passenger_id = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    if (rideId) {
      queryBuilder.andWhere('booking.ride_id = :rideId', { rideId });
    }

    queryBuilder
      .orderBy('booking.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [bookings, total] = await queryBuilder.getManyAndCount();

    // Fetch ride and driver details for each booking
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          // Fetch ride details
          const rideServiceUrl =
            process.env.RIDE_SERVICE_URL || 'http://localhost:3003';
          const rideResponse = await firstValueFrom(
            this.httpService.get(`${rideServiceUrl}/rides/${booking.ride_id}`),
          );

          const rideData = rideResponse.data?.data || rideResponse.data;

          return {
            ...booking,
            ride: rideData,
          };
        } catch (error) {
          console.error(`Failed to fetch ride ${booking.ride_id}:`, error);
          return booking;
        }
      }),
    );

    return { data: enrichedBookings, total };
  }

  async findOne(id: string, userId: string): Promise<Booking> {
    let booking;
    try {
      booking = await this.bookingsRepository.findOne({ where: { id } });
    } catch (error) {
      // Invalid UUID format or database error
      throw new NotFoundException('Booking not found');
    }

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if user has access to this booking
    if (booking.passenger_id !== userId) {
      // Also check if user is the driver (fetch from ride service)
      const rideServiceUrl =
        process.env.RIDE_SERVICE_URL || 'http://localhost:3003';
      try {
        const response = await firstValueFrom(
          this.httpService.get(`${rideServiceUrl}/rides/${booking.ride_id}`),
        );
        const ride = response.data;
        const driverId = ride.driver_id || ride.driverId;
        if (driverId !== userId) {
          throw new ForbiddenException('Access denied');
        }
      } catch (error) {
        if (error instanceof ForbiddenException) {
          throw error;
        }
        throw new ForbiddenException('Access denied');
      }
    }

    return booking;
  }

  async approve(id: string, driverId: string): Promise<Booking> {
    let booking;
    try {
      booking = await this.bookingsRepository.findOne({ where: { id } });
    } catch (error) {
      throw new NotFoundException('Booking not found');
    }

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify driver owns this ride
    const rideServiceUrl =
      process.env.RIDE_SERVICE_URL || 'http://localhost:3003';
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${rideServiceUrl}/rides/${booking.ride_id}`),
      );
      const ride = response.data;
      const rideDriverId = ride.driver_id || ride.driverId;
      if (rideDriverId !== driverId) {
        throw new ForbiddenException('Only the driver can approve bookings');
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to verify ride ownership');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only approve pending bookings');
    }

    booking.status = BookingStatus.APPROVED;
    await this.bookingsRepository.save(booking);

    // TODO: Update available seats in ride-service
    // TODO: Notify passenger about approval
    // TODO: Process payment

    return booking;
  }

  async reject(
    id: string,
    driverId: string,
    reason?: string,
  ): Promise<Booking> {
    let booking;
    try {
      booking = await this.bookingsRepository.findOne({ where: { id } });
    } catch (error) {
      throw new NotFoundException('Booking not found');
    }

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify driver owns this ride
    const rideServiceUrl =
      process.env.RIDE_SERVICE_URL || 'http://localhost:3003';
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${rideServiceUrl}/rides/${booking.ride_id}`),
      );
      const ride = response.data;
      const rideDriverId = ride.driver_id || ride.driverId;
      if (rideDriverId !== driverId) {
        throw new ForbiddenException('Only the driver can reject bookings');
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to verify ride ownership');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only reject pending bookings');
    }

    booking.status = BookingStatus.REJECTED;
    await this.bookingsRepository.save(booking);

    // TODO: Notify passenger about rejection

    return booking;
  }

  async cancel(id: string, userId: string): Promise<Booking> {
    let booking;
    try {
      booking = await this.bookingsRepository.findOne({ where: { id } });
    } catch (error) {
      throw new NotFoundException('Booking not found');
    }

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.passenger_id !== userId) {
      throw new ForbiddenException(
        'Only the passenger can cancel their booking',
      );
    }

    if (
      ![BookingStatus.PENDING, BookingStatus.APPROVED].includes(booking.status)
    ) {
      throw new BadRequestException('Cannot cancel this booking');
    }

    booking.status = BookingStatus.CANCELLED;
    await this.bookingsRepository.save(booking);

    // TODO: Update available seats in ride-service if booking was approved
    // TODO: Process refund if payment was made
    // TODO: Notify driver about cancellation

    return booking;
  }

  async complete(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.APPROVED) {
      throw new BadRequestException('Can only complete approved bookings');
    }

    booking.status = BookingStatus.COMPLETED;
    await this.bookingsRepository.save(booking);

    return booking;
  }

  async getDriverBookings(
    driverId: string,
    query: BookingQueryDto,
  ): Promise<{ data: Booking[]; total: number }> {
    const { status, page = 1, limit = 20 } = query;

    // Get all rides for this driver from ride-service
    const rideServiceUrl =
      process.env.RIDE_SERVICE_URL || 'http://localhost:3003';
    let rideIds: string[] = [];

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${rideServiceUrl}/rides?driverId=${driverId}`),
      );

      // Handle different response formats from ride-service
      const ridesData = response.data?.data || response.data;
      const rides = Array.isArray(ridesData) ? ridesData : [];

      rideIds = rides.map((ride: any) => ride.id);
      console.log(`Found ${rideIds.length} rides for driver ${driverId}`);
    } catch (error) {
      console.error('Failed to fetch driver rides:', error);
      return { data: [], total: 0 };
    }

    if (rideIds.length === 0) {
      console.log('No rides found for driver, returning empty bookings');
      return { data: [], total: 0 };
    }

    const queryBuilder = this.bookingsRepository
      .createQueryBuilder('booking')
      .where('booking.ride_id IN (:...rideIds)', { rideIds });

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    queryBuilder
      .orderBy('booking.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    console.log(`Found ${total} bookings for driver's rides`);

    return { data, total };
  }
}
