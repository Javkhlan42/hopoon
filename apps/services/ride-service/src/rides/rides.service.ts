import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ride, RideStatus } from './ride.entity';
import {
  CreateRideDto,
  UpdateRideDto,
  SearchRidesDto,
  RideQueryDto,
} from './rides.dto';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride)
    private ridesRepository: Repository<Ride>,
  ) {}

  async create(createRideDto: CreateRideDto, driverId: string): Promise<Ride> {
    const { origin, destination, departureTime, availableSeats, pricePerSeat } =
      createRideDto;

    // Validate departure time is in the future
    const departureDate = new Date(departureTime);
    if (departureDate <= new Date()) {
      throw new BadRequestException('Departure time must be in the future');
    }

    // Create route geometry using PostGIS function
    const wkt = `LINESTRING(${origin.lng} ${origin.lat}, ${destination.lng} ${destination.lat})`;

    const ride = this.ridesRepository.create({
      driver_id: driverId,
      origin_lat: origin.lat,
      origin_lng: origin.lng,
      origin_address: origin.address,
      destination_lat: destination.lat,
      destination_lng: destination.lng,
      destination_address: destination.address,
      route_geometry: () => `ST_GeomFromText('${wkt}', 4326)`,
      departure_time: departureDate,
      available_seats: availableSeats,
      price_per_seat: pricePerSeat,
      status: RideStatus.ACTIVE,
    });

    return this.ridesRepository.save(ride);
  }

  async findAll(query: RideQueryDto): Promise<{ data: Ride[]; total: number }> {
    const { status, driverId, page = 1, limit = 20 } = query;

    const queryBuilder = this.ridesRepository.createQueryBuilder('ride');

    if (status) {
      queryBuilder.where('ride.status = :status', { status });
    }
    // For admin, show all rides regardless of status if no status filter is provided

    if (driverId) {
      queryBuilder.andWhere('ride.driver_id = :driverId', { driverId });
    }

    queryBuilder
      .orderBy('ride.departure_time', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Ride> {
    const ride = await this.ridesRepository.findOne({ where: { id } });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    return ride;
  }

  async count(filter?: { status?: string }): Promise<number> {
    if (filter?.status) {
      return this.ridesRepository.count({
        where: { status: filter.status as RideStatus },
      });
    }
    return this.ridesRepository.count();
  }

  async update(
    id: string,
    updateRideDto: UpdateRideDto,
    userId: string,
  ): Promise<Ride> {
    const ride = await this.findOne(id);

    // Only driver can update their own ride
    if (ride.driver_id !== userId) {
      throw new ForbiddenException('Only the driver can update this ride');
    }

    // Cannot update completed or cancelled rides
    if ([RideStatus.COMPLETED, RideStatus.CANCELLED].includes(ride.status)) {
      throw new BadRequestException(
        'Cannot update completed or cancelled rides',
      );
    }

    // Update fields
    if (updateRideDto.origin) {
      ride.origin_lat = updateRideDto.origin.lat;
      ride.origin_lng = updateRideDto.origin.lng;
      ride.origin_address = updateRideDto.origin.address;
    }

    if (updateRideDto.destination) {
      ride.destination_lat = updateRideDto.destination.lat;
      ride.destination_lng = updateRideDto.destination.lng;
      ride.destination_address = updateRideDto.destination.address;
    }

    if (updateRideDto.origin || updateRideDto.destination) {
      // Update route geometry
      const routeGeometry = `SRID=4326;LINESTRING(${ride.origin_lng} ${ride.origin_lat}, ${ride.destination_lng} ${ride.destination_lat})`;
      ride.route_geometry = routeGeometry;
    }

    if (updateRideDto.departureTime) {
      const departureDate = new Date(updateRideDto.departureTime);
      if (departureDate <= new Date()) {
        throw new BadRequestException('Departure time must be in the future');
      }
      ride.departure_time = departureDate;
    }

    if (updateRideDto.availableSeats !== undefined) {
      ride.available_seats = updateRideDto.availableSeats;
    }

    if (updateRideDto.pricePerSeat !== undefined) {
      ride.price_per_seat = updateRideDto.pricePerSeat;
    }

    if (updateRideDto.status) {
      ride.status = updateRideDto.status;
    }

    return this.ridesRepository.save(ride);
  }

  async cancel(id: string, userId: string): Promise<Ride> {
    const ride = await this.findOne(id);

    // Allow admin to cancel any ride, otherwise only driver can cancel
    if (userId !== 'admin' && ride.driver_id !== userId) {
      throw new ForbiddenException('Only the driver can cancel this ride');
    }

    if (ride.status === RideStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed ride');
    }

    if (ride.status === RideStatus.CANCELLED) {
      throw new BadRequestException('Ride is already cancelled');
    }

    ride.status = RideStatus.CANCELLED;
    return this.ridesRepository.save(ride);
  }

  async search(
    searchDto: SearchRidesDto,
  ): Promise<{ data: Ride[]; total: number }> {
    const {
      originLat,
      originLng,
      destinationLat,
      destinationLng,
      departureDate,
      seats = 1,
      maxRadius = 5,
      page = 1,
      limit = 20,
    } = searchDto;

    // Convert km to meters for PostGIS
    const maxRadiusMeters = maxRadius * 1000;

    const queryBuilder = this.ridesRepository.createQueryBuilder('ride');

    // Only search active rides
    queryBuilder.where('ride.status = :status', { status: RideStatus.ACTIVE });

    // Available seats check
    queryBuilder.andWhere('ride.available_seats >= :seats', { seats });

    // Origin proximity check using PostGIS
    queryBuilder.andWhere(
      `ST_DWithin(
        ST_MakePoint(ride.origin_lng, ride.origin_lat)::geography,
        ST_MakePoint(:originLng, :originLat)::geography,
        :maxRadiusMeters
      )`,
      { originLng, originLat, maxRadiusMeters },
    );

    // Destination proximity check using PostGIS
    queryBuilder.andWhere(
      `ST_DWithin(
        ST_MakePoint(ride.destination_lng, ride.destination_lat)::geography,
        ST_MakePoint(:destinationLng, :destinationLat)::geography,
        :maxRadiusMeters
      )`,
      { destinationLng, destinationLat, maxRadiusMeters },
    );

    // Departure date filter (same day)
    if (departureDate) {
      const searchDate = new Date(departureDate);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

      queryBuilder.andWhere(
        'ride.departure_time BETWEEN :startOfDay AND :endOfDay',
        {
          startOfDay,
          endOfDay,
        },
      );
    } else {
      // Only future rides
      queryBuilder.andWhere('ride.departure_time > :now', { now: new Date() });
    }

    // Order by closest match (distance from origin)
    queryBuilder.addSelect(
      `ST_Distance(
        ST_MakePoint(ride.origin_lng, ride.origin_lat)::geography,
        ST_MakePoint(:originLng, :originLat)::geography
      )`,
      'origin_distance',
    );

    queryBuilder
      .orderBy('origin_distance', 'ASC')
      .addOrderBy('ride.departure_time', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async updateAvailableSeats(
    rideId: string,
    seatsChange: number,
  ): Promise<Ride> {
    const ride = await this.findOne(rideId);

    const newAvailableSeats = ride.available_seats + seatsChange;

    if (newAvailableSeats < 0) {
      throw new BadRequestException('Not enough available seats');
    }

    ride.available_seats = newAvailableSeats;

    // Update status based on available seats
    if (newAvailableSeats === 0) {
      ride.status = RideStatus.FULL;
    } else if (ride.status === RideStatus.FULL && newAvailableSeats > 0) {
      ride.status = RideStatus.ACTIVE;
    }

    return this.ridesRepository.save(ride);
  }

  async startRide(id: string, userId: string): Promise<Ride> {
    const ride = await this.findOne(id);

    if (ride.driver_id !== userId) {
      throw new ForbiddenException('Only the driver can start this ride');
    }

    if (ride.status !== RideStatus.ACTIVE && ride.status !== RideStatus.FULL) {
      throw new BadRequestException('Cannot start this ride');
    }

    ride.status = RideStatus.IN_PROGRESS;
    return this.ridesRepository.save(ride);
  }

  async completeRide(id: string, userId: string): Promise<Ride> {
    const ride = await this.findOne(id);

    if (ride.driver_id !== userId) {
      throw new ForbiddenException('Only the driver can complete this ride');
    }

    if (ride.status !== RideStatus.IN_PROGRESS) {
      throw new BadRequestException('Ride must be in progress to complete');
    }

    ride.status = RideStatus.COMPLETED;
    return this.ridesRepository.save(ride);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getFeed(query: any): Promise<any> {
    const { lat, lng, radius = 50000, page = 1, limit = 20 } = query;

    const queryBuilder = this.ridesRepository.createQueryBuilder('ride');

    // Only show active rides
    queryBuilder.where('ride.status = :status', { status: RideStatus.ACTIVE });

    // Only future rides
    queryBuilder.andWhere('ride.departure_time > :now', { now: new Date() });

    // If location provided, filter by radius
    if (lat && lng) {
      queryBuilder.andWhere(
        `ST_DWithin(
          ST_MakePoint(ride.origin_lng, ride.origin_lat)::geography,
          ST_MakePoint(:lng, :lat)::geography,
          :radius
        )`,
        {
          lng: parseFloat(lng),
          lat: parseFloat(lat),
          radius: parseInt(radius),
        },
      );
    }

    queryBuilder
      .orderBy('ride.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data.map((ride) => ({
        id: ride.id,
        driver: {
          id: ride.driver_id,
          // Should fetch driver details from Auth service
        },
        route: {
          origin: ride.origin_address,
          destination: ride.destination_address,
          distance: null, // Calculate from geometry
        },
        departureTime: ride.departure_time,
        seatsAvailable: ride.available_seats,
        costPerSeat: ride.price_per_seat,
        commentCount: 0, // Should query from comments table
        bookingCount: 0, // Should query from bookings
        createdAt: ride.created_at,
      })),
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async addComment(rideId: string, userId: string, text: string): Promise<any> {
    const ride = await this.findOne(rideId);

    // In production, save to comments table
    const comment = {
      id: `comment_${Date.now()}`,
      rideId,
      user: {
        id: userId,
        // Should fetch user details from Auth service
      },
      text,
      createdAt: new Date().toISOString(),
    };

    return comment;
  }
}
