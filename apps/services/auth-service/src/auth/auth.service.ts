import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(phone: string, password: string): Promise<any> {
    const user = await this.usersService.findByPhone(phone);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(
    phone: string,
    password: string,
    name: string,
    email?: string,
    role?: 'passenger' | 'driver' | 'both',
  ) {
    const existingUser = await this.usersService.findByPhone(phone);
    if (existingUser) {
      throw new ConflictException('Phone number already registered');
    }

    const user = await this.usersService.create(
      phone,
      password,
      name,
      email,
      role,
    );
    const { password: _, ...result } = user;

    return {
      user: result,
      ...(await this.generateTokens(user.id, user.phone, user.role)),
    };
  }

  async login(phone: string, password: string) {
    const user = await this.validateUser(phone, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      user,
      ...(await this.generateTokens(user.id, user.phone, user.role)),
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'hopon-secret-key',
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || user.refresh_token !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.id, user.phone, user.role);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, phone: string, role: string) {
    const payload = { sub: userId, phone, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    });

    await this.usersService.updateRefreshToken(userId, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async adminLogin(email: string, password: string) {
    // Simple admin check - in production, use separate admin table
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hopon.mn';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (email !== adminEmail || password !== adminPassword) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const payload = { 
      sub: 'admin-1', 
      email, 
      role: 'superadmin' 
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      admin: {
        id: 'admin-1',
        email,
        name: 'Admin',
        role: 'superadmin',
      },
    };
  }
}
