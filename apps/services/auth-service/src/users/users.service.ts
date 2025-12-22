import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
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
      select: ['id', 'phone', 'email', 'name', 'password', 'role', 'verification_status', 'rating', 'created_at', 'updated_at'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(phone: string, password: string, name: string, email?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      phone,
      password: hashedPassword,
      name,
      email,
    });
    return this.usersRepository.save(user);
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this.usersRepository.update(userId, { refresh_token: refreshToken });
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { refresh_token: refreshToken },
      select: ['id', 'phone', 'email', 'name', 'password', 'role', 'verification_status', 'rating', 'created_at', 'updated_at'],
    });
  }
}
