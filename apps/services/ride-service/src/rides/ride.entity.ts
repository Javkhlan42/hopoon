import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum RideStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  FULL = 'full',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('rides')
export class Ride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  driver_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  origin_lat: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  origin_lng: number;

  @Column({ type: 'text' })
  origin_address: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  destination_lat: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  destination_lng: number;

  @Column({ type: 'text' })
  destination_address: string;

  @Column({ type: 'geometry', spatialFeatureType: 'LineString', srid: 4326, nullable: true })
  route_geometry: any;

  @Column({ type: 'timestamp with time zone' })
  @Index()
  departure_time: Date;

  @Column({ type: 'int' })
  available_seats: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_per_seat: number;

  @Column({ type: 'enum', enum: RideStatus, default: RideStatus.ACTIVE })
  @Index()
  status: RideStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
