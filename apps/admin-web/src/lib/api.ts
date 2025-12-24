/**
 * Admin API Service
 * API endpoint холболтууд бүх админ панелийн хуудсанд
 * Base URL: http://localhost:3000/api/v1/admin
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const ADMIN_BASE = `${API_BASE_URL}/admin`;

// Helper function - Authorization header
const getAuthHeaders = () => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic fetch wrapper
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================
// DASHBOARD APIs - Үндсэн статистик
// ============================================

export const dashboardAPI = {
  // Нийт статистикууд авах
  getStats: () =>
    fetchAPI<{
      totalUsers: number;
      activeDrivers: number;
      totalRides: number;
      totalRevenue: number;
    }>(`${ADMIN_BASE}/dashboard/stats`),

  // Өдрийн статистик (real-time graph-д)
  getDailyStats: (startDate: string, endDate: string) =>
    fetchAPI<
      Array<{
        date: string;
        users: number;
        rides: number;
        revenue: number;
      }>
    >(
      `${ADMIN_BASE}/dashboard/daily-stats?startDate=${startDate}&endDate=${endDate}`,
    ),

  // Идэвхтэй SOS-ууд авах
  getActiveSOS: () =>
    fetchAPI<
      Array<{
        id: string;
        userId: string;
        userName: string;
        location: { lat: number; lng: number };
        timestamp: string;
        status: 'active' | 'resolved';
      }>
    >(`${ADMIN_BASE}/dashboard/active-sos`),
};

// ============================================
// USERS APIs - Хэрэглэгчдийн удирдлага
// ============================================

export const usersAPI = {
  // Бүх хэрэглэгчдийг жагсаалт + хайлт + filter
  getUsers: (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'blocked' | 'inactive' | 'all';
    role?: 'driver' | 'passenger' | 'all';
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchAPI<{
      users: Array<{
        id: string;
        name: string;
        phone: string;
        email?: string;
        role: string;
        rating: number;
        totalRides: number;
        status: string;
        verified: boolean;
        registeredAt: string;
      }>;
      meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`${ADMIN_BASE}/users?${query}`);
  },

  // Тодорхой хэрэглэгчийн дэлгэрэнгүй мэдээлэл
  getUserDetails: (userId: string) =>
    fetchAPI<{
      user: {
        id: string;
        name: string;
        phone: string;
        email?: string;
        role: string;
        rating: number;
        totalRides: number;
        status: string;
        verified: boolean;
        registeredAt: string;
        balance: number;
        profilePhoto?: string;
      };
      rides: Array<{
        id: string;
        from: string;
        to: string;
        date: string;
        status: string;
        price: number;
      }>;
      reviews: Array<{
        id: string;
        rating: number;
        comment: string;
        date: string;
        reviewer: string;
      }>;
      sosHistory: Array<{
        id: string;
        date: string;
        location: string;
        status: string;
      }>;
    }>(`${ADMIN_BASE}/users/${userId}`),

  // Хэрэглэгчийг блоклох
  blockUser: (userId: string, reason: string) =>
    fetchAPI(`${ADMIN_BASE}/users/${userId}/block`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Хэрэглэгчийн блокыг тайлах
  unblockUser: (userId: string) =>
    fetchAPI(`${ADMIN_BASE}/users/${userId}/unblock`, { method: 'POST' }),

  // Хэрэглэгч устгах
  deleteUser: (userId: string) =>
    fetchAPI(`${ADMIN_BASE}/users/${userId}`, { method: 'DELETE' }),

  // Баталгаажуулалт өгөх/хасах
  toggleVerification: (userId: string) =>
    fetchAPI(`${ADMIN_BASE}/users/${userId}/verify`, { method: 'POST' }),

  // Шинэ хэрэглэгч нэмэх
  createUser: (userData: {
    name: string;
    phone: string;
    email?: string;
    role: 'driver' | 'passenger';
    password: string;
  }) =>
    fetchAPI(`${ADMIN_BASE}/users`, {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

// ============================================
// RIDES APIs - Зорчилтын удирдлага
// ============================================

export const ridesAPI = {
  // Бүх зорчилтуудын жагсаалт + хайлт + filter
  getRides: (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'completed' | 'cancelled' | 'all';
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchAPI<{
      rides: Array<{
        id: string;
        driverId: string;
        driverName: string;
        from: string;
        to: string;
        departureTime: string;
        availableSeats: number;
        totalSeats: number;
        price: number;
        status: string;
        passengers: number;
      }>;
      meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`${ADMIN_BASE}/rides?${query}`);
  },

  // Тодорхой зорчилтын дэлгэрэнгүй
  getRideDetails: (rideId: string) =>
    fetchAPI<{
      ride: {
        id: string;
        driver: {
          id: string;
          name: string;
          phone: string;
          rating: number;
          photo?: string;
        };
        from: string;
        to: string;
        departureTime: string;
        arrivalTime?: string;
        price: number;
        totalSeats: number;
        availableSeats: number;
        status: string;
        vehicle: {
          model: string;
          plate: string;
          color: string;
        };
      };
      passengers: Array<{
        id: string;
        name: string;
        phone: string;
        seats: number;
        status: string;
      }>;
      chatHistory: Array<{
        senderId: string;
        senderName: string;
        message: string;
        timestamp: string;
      }>;
    }>(`${ADMIN_BASE}/rides/${rideId}`),

  // Зорчилт цуцлах
  cancelRide: (rideId: string, reason: string) =>
    fetchAPI(`${ADMIN_BASE}/rides/${rideId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Зорчилт устгах
  deleteRide: (rideId: string) =>
    fetchAPI(`${ADMIN_BASE}/rides/${rideId}`, { method: 'DELETE' }),
};

// ============================================
// SOS APIs - Яаралтай дохионы удирдлага
// ============================================

export const sosAPI = {
  // Бүх SOS дуудлагууд (active + resolved)
  getSOSAlerts: (params: {
    page?: number;
    limit?: number;
    status?: 'active' | 'resolved' | 'all';
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchAPI<{
      alerts: Array<{
        id: string;
        userId: string;
        userName: string;
        userPhone: string;
        location: {
          lat: number;
          lng: number;
          address?: string;
        };
        rideId?: string;
        timestamp: string;
        status: 'active' | 'resolved';
        resolvedAt?: string;
        resolvedBy?: string;
        notes?: string;
      }>;
      meta: {
        page: number;
        limit: number;
        total: number;
      };
    }>(`${ADMIN_BASE}/sos?${query}`);
  },

  // SOS-г шийдсэн болгох
  resolveAlert: (alertId: string, notes: string) =>
    fetchAPI(`${ADMIN_BASE}/sos/${alertId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  // Хэрэглэгч рүү хариу дуудлага хийх
  callUser: (alertId: string) =>
    fetchAPI(`${ADMIN_BASE}/sos/${alertId}/call`, { method: 'POST' }),

  // Байршил дээр очих (Maps link)
  getNavigationLink: (alertId: string) =>
    fetchAPI<{ mapUrl: string }>(`${ADMIN_BASE}/sos/${alertId}/navigation`),
};

// ============================================
// MODERATION APIs - Контент модераци
// ============================================

export const moderationAPI = {
  // Бүх мэдэгдлүүд (reports)
  getReports: (params: {
    page?: number;
    limit?: number;
    type?: 'user' | 'ride' | 'chat' | 'all';
    status?: 'pending' | 'reviewed' | 'all';
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchAPI<{
      reports: Array<{
        id: string;
        reporterId: string;
        reporterName: string;
        targetId: string;
        targetType: 'user' | 'ride' | 'chat';
        reason: string;
        description: string;
        status: 'pending' | 'reviewed';
        createdAt: string;
      }>;
      meta: {
        page: number;
        limit: number;
        total: number;
      };
    }>(`${ADMIN_BASE}/moderation/reports?${query}`);
  },

  // Тодорхой report-ийн дэлгэрэнгүй
  getReportDetails: (reportId: string) =>
    fetchAPI<{
      report: {
        id: string;
        reporter: {
          id: string;
          name: string;
          phone: string;
        };
        target: {
          id: string;
          type: string;
          name?: string;
          content?: string;
        };
        reason: string;
        description: string;
        attachments?: string[];
        context: {
          rideId?: string;
          chatId?: string;
          messages?: Array<{
            sender: string;
            message: string;
            timestamp: string;
          }>;
        };
        status: string;
        createdAt: string;
      };
    }>(`${ADMIN_BASE}/moderation/reports/${reportId}`),

  // Report батлах (контентыг устгах)
  approveReport: (
    reportId: string,
    action: 'delete' | 'warn' | 'ban',
    notes?: string,
  ) =>
    fetchAPI(`${ADMIN_BASE}/moderation/reports/${reportId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action, notes }),
    }),

  // Report татгалзах
  rejectReport: (reportId: string, reason: string) =>
    fetchAPI(`${ADMIN_BASE}/moderation/reports/${reportId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// ============================================
// REPORTS APIs - Тайлан, статистик
// ============================================

export const reportsAPI = {
  // Хэрэглэгчдийн өсөлт (graph)
  getUserGrowth: (period: 'week' | 'month' | 'year') =>
    fetchAPI<
      Array<{
        date: string;
        drivers: number;
        passengers: number;
        total: number;
      }>
    >(`${ADMIN_BASE}/reports/user-growth?period=${period}`),

  // Зорчилтын статистик (completion rate)
  getRideStats: () =>
    fetchAPI<{
      completed: number;
      cancelled: number;
      ongoing: number;
      completionRate: number;
    }>(`${ADMIN_BASE}/reports/ride-stats`),

  // Орлогын тайлан (revenue graph)
  getRevenue: (period: 'week' | 'month' | 'year') =>
    fetchAPI<
      Array<{
        date: string;
        amount: number;
        transactions: number;
      }>
    >(`${ADMIN_BASE}/reports/revenue?period=${period}`),

  // Түгээмэл чиглэлүүд
  getPopularRoutes: (limit?: number) =>
    fetchAPI<
      Array<{
        from: string;
        to: string;
        count: number;
        avgPrice: number;
      }>
    >(`${ADMIN_BASE}/reports/popular-routes?limit=${limit || 10}`),

  // Шилдэг жолооч нар
  getTopDrivers: (limit?: number) =>
    fetchAPI<
      Array<{
        id: string;
        name: string;
        rating: number;
        totalRides: number;
        revenue: number;
      }>
    >(`${ADMIN_BASE}/reports/top-drivers?limit=${limit || 10}`),
};

// ============================================
// SYSTEM APIs - Системийн мониторинг
// ============================================

export const systemAPI = {
  // Системийн статус (real-time)
  getSystemStatus: () =>
    fetchAPI<{
      cpu: number;
      memory: {
        used: number;
        total: number;
        percentage: number;
      };
      disk: {
        used: number;
        total: number;
        percentage: number;
      };
      uptime: number;
    }>(`${ADMIN_BASE}/system/status`),

  // Сервисүүдийн health check
  getServicesHealth: () =>
    fetchAPI<
      Array<{
        name: string;
        status: 'healthy' | 'unhealthy' | 'degraded';
        responseTime: number;
        lastChecked: string;
      }>
    >(`${ADMIN_BASE}/system/services`),

  // Логуудын жагсаалт
  getLogs: (params: {
    page?: number;
    limit?: number;
    level?: 'info' | 'warn' | 'error' | 'all';
    service?: string;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchAPI<{
      logs: Array<{
        timestamp: string;
        level: string;
        service: string;
        message: string;
        metadata?: any;
      }>;
      meta: {
        page: number;
        limit: number;
        total: number;
      };
    }>(`${ADMIN_BASE}/system/logs?${query}`);
  },

  // Системийн тохиргоо өөрчлөх
  updateConfig: (config: Record<string, any>) =>
    fetchAPI(`${ADMIN_BASE}/system/config`, {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
};

// ============================================
// AUTH APIs - Админ нэвтрэлт
// ============================================

export const authAPI = {
  // Админ нэвтрэх
  login: (email: string, password: string) =>
    fetchAPI<{
      accessToken: string;
      refreshToken: string;
      admin: {
        id: string;
        email: string;
        name: string;
        role: 'superadmin' | 'admin' | 'moderator';
      };
    }>(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Token сэргээх
  refreshToken: (refreshToken: string) =>
    fetchAPI<{
      accessToken: string;
      refreshToken: string;
    }>(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  // Гарах
  logout: () => fetchAPI(`${API_BASE_URL}/auth/logout`, { method: 'POST' }),
};

// Export бүх API-г
export const api = {
  dashboard: dashboardAPI,
  users: usersAPI,
  rides: ridesAPI,
  sos: sosAPI,
  moderation: moderationAPI,
  reports: reportsAPI,
  system: systemAPI,
  auth: authAPI,
};

export default api;
