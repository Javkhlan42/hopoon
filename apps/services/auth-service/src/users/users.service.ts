import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { phone },
      select: [
        'id',
        'phone',
        'email',
        'name',
        'password',
        'role',
        'verification_status',
        'rating',
        'created_at',
        'updated_at',
      ],
    });
  }

  async findById(id: string): Promise<User> {
    let user;
    try {
      user = await this.usersRepository.findOne({ where: { id } });
    } catch (error) {
      throw new NotFoundException('User not found');
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(
    phone: string,
    password: string,
    name: string,
    email?: string,
    role?: 'passenger' | 'driver' | 'both',
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Map string role to UserRole enum
    let userRole: UserRole = UserRole.PASSENGER;
    if (role === 'driver') userRole = UserRole.DRIVER;
    else if (role === 'both') userRole = UserRole.BOTH;
    else if (role === 'passenger') userRole = UserRole.PASSENGER;

    const user = this.usersRepository.create({
      phone,
      password: hashedPassword,
      name,
      email,
      role: userRole,
    });
    return this.usersRepository.save(user);
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.usersRepository.update(userId, { refresh_token: refreshToken });
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { refresh_token: refreshToken },
      select: [
        'id',
        'phone',
        'email',
        'name',
        'password',
        'role',
        'verification_status',
        'rating',
        'created_at',
        'updated_at',
      ],
    });
  }

  async updateProfile(
    userId: string,
    updateDto: { name?: string; email?: string; bio?: string },
  ): Promise<User> {
    await this.usersRepository.update(userId, updateDto);
    return this.findById(userId);
  }

  async uploadProfilePhoto(
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    file: any,
  ): Promise<any> {
    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    const photoUrl = `https://cdn.hopon.mn/users/${userId}.jpg`;

    await this.usersRepository.update(userId, {
      // Add profile_photo column if needed
    });

    return {
      photoUrl,
      uploadedAt: new Date().toISOString(),
    };
  }

  async submitIdentityVerification(
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    idPhoto: any,
  ): Promise<any> {
    // In production, upload files and create verification request
    const verificationId = `ver_${Date.now()}`;

    await this.usersRepository.update(userId, {
      verification_status: 'pending' as any,
    });

    return {
      verificationId,
      status: 'pending',
      message: 'Verification submitted. Results in 24-48 hours.',
      submittedAt: new Date().toISOString(),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getRideHistory(userId: string, query: any): Promise<any> {
    // This should call Ride Service via HTTP
    // For now, return mock data
    return {
      data: [],
      meta: {
        page: query.page || 1,
        limit: query.limit || 20,
        total: 0,
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getPublicProfile(userId: string): Promise<any> {
    const user = await this.findById(userId);

    // Return public fields only
    return {
      id: user.id,
      name: user.name,
      verified: user.verification_status === 'verified',
      rating: user.rating,
      reviewCount: 0, // Should query from review service
      badges: user.verification_status === 'verified' ? ['verified'] : [],
      memberSince: user.created_at,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getUserReviews(userId: string, query: any): Promise<any> {
    // This should call Review/Rating Service
    // For now, return mock data
    return {
      data: [],
      meta: {
        page: query.page || 1,
        limit: query.limit || 20,
        total: 0,
        totalPages: 0,
        averageRating: 0,
      },
    };
  }
}
