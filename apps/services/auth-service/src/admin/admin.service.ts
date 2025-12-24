import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Dashboard
  async getDashboardStats() {
    const [totalUsers, activeDrivers] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({
        where: [{ role: 'driver' as any }, { role: 'both' as any }],
      }),
    ]);

    return {
      totalUsers,
      activeDrivers,
      totalRides: 0, // Will come from ride service
      totalRevenue: 0, // Will come from payment service
    };
  }

  async getDailyStats(startDate?: string, endDate?: string) {
    // Mock implementation - will need actual data from multiple services
    const days = 7;
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      users: Math.floor(Math.random() * 50) + 20,
      rides: Math.floor(Math.random() * 100) + 50,
      revenue: Math.floor(Math.random() * 500000) + 200000,
    }));
  }

  async getActiveSOS() {
    // Mock implementation - SOS functionality not yet implemented
    return [];
  }

  // Users
  async getUsers(query: any) {
    const { search, status, role, page = 1, limit = 20 } = query;

    const where: any = {};
    const orConditions = [];

    if (search) {
      orConditions.push(
        { name: Like(`%${search}%`) },
        { phone: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
      );
    }

    // Status field not available in User entity
    // if (status && status !== 'all') {
    //   where.status = status;
    // }

    if (role && role !== 'all') {
      where.role = role;
    }

    const [users, total] = await this.userRepository.findAndCount({
      where: orConditions.length > 0 ? orConditions : where,
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    return {
      users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Additional data would come from other services (rides, reviews, etc.)
    return {
      user,
      rides: [],
      reviews: [],
      sosHistory: [],
    };
  }

  async blockUser(userId: string, reason?: string) {
    // Status field not available - would need to add to User entity
    // await this.userRepository.update(userId, { status: 'blocked' });
    // For now, just return success
    return {
      success: true,
      message: 'User block not implemented (status field missing)',
    };
  }

  async unblockUser(userId: string) {
    // Status field not available - would need to add to User entity
    // await this.userRepository.update(userId, { status: 'active' });
    return {
      success: true,
      message: 'User unblock not implemented (status field missing)',
    };
  }

  async deleteUser(userId: string) {
    await this.userRepository.delete(userId);

    return { success: true, message: 'User deleted successfully' };
  }

  async toggleVerification(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    // Toggle verification_status instead of status
    const newStatus =
      user.verification_status === 'verified' ? 'unverified' : 'verified';
    await this.userRepository.update(userId, {
      verification_status: newStatus as any,
    });

    return { success: true, message: 'Verification status updated' };
  }

  async updateUserRole(userId: string, role: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.update(userId, {
      role: role as any,
    });

    return {
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: user.id,
        name: user.name,
        role: role,
      },
    };
  }

  // SOS - Mock implementations
  async getSOSAlerts(query: any) {
    return { alerts: [], meta: { page: 1, limit: 50, total: 0 } };
  }

  async resolveAlert(alertId: string, notes?: string) {
    return { success: true, message: 'Alert resolved' };
  }

  async initiateCall(alertId: string) {
    return { success: true, message: 'Call initiated' };
  }

  async getNavigationLink(alertId: string) {
    return { mapUrl: 'https://maps.google.com' };
  }

  // Moderation - Mock implementations
  async getReports(query: any) {
    return { reports: [], meta: { page: 1, limit: 20, total: 0 } };
  }

  async getReportDetails(reportId: string) {
    throw new Error('Report not found');
  }

  async approveReport(reportId: string, action?: string, notes?: string) {
    return { success: true, message: 'Report approved' };
  }

  async rejectReport(reportId: string, reason?: string) {
    return { success: true, message: 'Report rejected' };
  }

  // Reports
  async getUserGrowth(period: string) {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;

    return Array.from({ length: Math.min(days, 30) }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      drivers: Math.floor(Math.random() * 50) + 20,
      passengers: Math.floor(Math.random() * 80) + 40,
      total: Math.floor(Math.random() * 130) + 60,
    }));
  }

  async getTopDrivers(limit: number) {
    const drivers = await this.userRepository.find({
      where: [{ role: 'driver' as any }, { role: 'both' as any }],
      take: limit,
      order: { created_at: 'DESC' },
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });

    // Mock rating and stats data
    return drivers.map((driver) => ({
      ...driver,
      rating: 4.5,
      totalRides: 0,
      revenue: 0,
    }));
  }

  async getRevenue(period: string) {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;

    return Array.from({ length: Math.min(days, 30) }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      amount: Math.floor(Math.random() * 500000) + 200000,
      transactions: Math.floor(Math.random() * 100) + 50,
    }));
  }

  // System
  async getSystemStatus() {
    return {
      cpu: Math.floor(Math.random() * 40) + 20,
      memory: {
        used: 6.4,
        total: 16,
        percentage: Math.floor(Math.random() * 30) + 40,
      },
      disk: {
        used: 45.2,
        total: 100,
        percentage: 45,
      },
      uptime: process.uptime(),
    };
  }

  async getServicesHealth() {
    return [
      {
        name: 'Auth Service',
        status: 'healthy',
        responseTime: 15,
        lastChecked: new Date().toISOString(),
      },
    ];
  }

  async getLogs(query: any) {
    return {
      logs: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
      },
    };
  }
}
