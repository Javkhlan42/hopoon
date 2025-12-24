/**
 * Mock API Server with Sample JSON Data
 * Жинхэнэ backend бэлэн болтол ашиглах mock API
 */

// Delay function - жинхэнэ API шиг сүлжээний хугацаа
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// SAMPLE DATA
// ============================================

const SAMPLE_USERS = [
  {
    id: '1',
    name: 'Болдбаатар',
    phone: '+97699123456',
    email: 'bold@example.com',
    role: 'driver',
    rating: 4.8,
    totalRides: 145,
    status: 'active',
    verified: true,
    registeredAt: '2024-01-15T10:30:00Z',
    balance: 125000,
    profilePhoto: null,
  },
  {
    id: '2',
    name: 'Сарангэрэл',
    phone: '+97699234567',
    email: 'sarangee@example.com',
    role: 'passenger',
    rating: 4.9,
    totalRides: 89,
    status: 'active',
    verified: true,
    registeredAt: '2024-02-20T14:20:00Z',
    balance: 45000,
    profilePhoto: null,
  },
  {
    id: '3',
    name: 'Ганбаатар',
    phone: '+97699345678',
    email: null,
    role: 'driver',
    rating: 3.5,
    totalRides: 23,
    status: 'blocked',
    verified: false,
    registeredAt: '2024-11-10T09:15:00Z',
    balance: 0,
    profilePhoto: null,
  },
  {
    id: '4',
    name: 'Оюунчимэг',
    phone: '+97699456789',
    email: 'oyunchimeg@example.com',
    role: 'passenger',
    rating: 4.7,
    totalRides: 67,
    status: 'active',
    verified: true,
    registeredAt: '2024-03-05T11:45:00Z',
    balance: 78000,
    profilePhoto: null,
  },
];

const SAMPLE_RIDES = [
  {
    id: 'ride-1',
    driverId: '1',
    driverName: 'Болдбаатар',
    from: 'Сүхбаатарын талбай',
    to: 'ШУТИС',
    fromLocation: { lat: 47.9184, lng: 106.9177 },
    toLocation: { lat: 47.9215, lng: 106.92 },
    departureTime: '2025-12-23T08:00:00Z',
    availableSeats: 2,
    totalSeats: 4,
    price: 3000,
    status: 'active',
    passengers: 2,
  },
  {
    id: 'ride-2',
    driverId: '3',
    driverName: 'Ганбаатар',
    from: 'Нарантуул зах',
    to: 'Сонсголон',
    fromLocation: { lat: 47.9215, lng: 106.92 },
    toLocation: { lat: 47.91, lng: 106.905 },
    departureTime: '2025-12-23T09:30:00Z',
    availableSeats: 0,
    totalSeats: 3,
    price: 2500,
    status: 'completed',
    passengers: 3,
  },
  {
    id: 'ride-3',
    driverId: '1',
    driverName: 'Болдбаатар',
    from: 'Зайсан',
    to: 'Аргентайн төв',
    fromLocation: { lat: 47.91, lng: 106.905 },
    toLocation: { lat: 47.9184, lng: 106.9177 },
    departureTime: '2025-12-23T10:00:00Z',
    availableSeats: 3,
    totalSeats: 4,
    price: 4000,
    status: 'active',
    passengers: 1,
  },
];

const SAMPLE_SOS_ALERTS = [
  {
    id: 'sos-1',
    userId: '2',
    userName: 'Сарангэрэл',
    userPhone: '+97699234567',
    location: {
      lat: 47.9184,
      lng: 106.9177,
      address: 'Сүхбаатарын талбай, 1-р хороо',
    },
    rideId: 'ride-1',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: 'active' as const,
    priority: 'high',
  },
  {
    id: 'sos-2',
    userId: '4',
    userName: 'Оюунчимэг',
    userPhone: '+97699456789',
    location: {
      lat: 47.9215,
      lng: 106.92,
      address: 'Нарантуул зах, 15-р хороо',
    },
    rideId: 'ride-2',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'active' as const,
    priority: 'critical',
  },
  {
    id: 'sos-3',
    userId: '2',
    userName: 'Сарангэрэл',
    userPhone: '+97699234567',
    location: {
      lat: 47.91,
      lng: 106.905,
      address: 'Зайсан, 3-р хороо',
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'resolved' as const,
    priority: 'medium',
    resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    resolvedBy: 'Admin',
    notes: 'Асуудал шийдэгдсэн',
  },
];

const SAMPLE_REPORTS = [
  {
    id: 'report-1',
    reporterId: '2',
    reporterName: 'Сарангэрэл',
    targetId: '3',
    targetType: 'user' as const,
    reason: 'Зохисгүй үг хэллэг',
    description: 'Жолооч надад доромжилсон үг хэлсэн',
    status: 'pending' as const,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'report-2',
    reporterId: '4',
    reporterName: 'Оюунчимэг',
    targetId: 'ride-2',
    targetType: 'ride' as const,
    reason: 'Зохисгүй жолоодлого',
    description: 'Жолооч хурдны хязгаар зөрчсөн',
    status: 'pending' as const,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================
// MOCK API FUNCTIONS
// ============================================

export const mockAPI = {
  dashboard: {
    getStats: async () => {
      await delay(300);
      return {
        totalUsers: SAMPLE_USERS.length,
        activeDrivers: SAMPLE_USERS.filter(
          (u) => u.role === 'driver' && u.status === 'active',
        ).length,
        totalRides: SAMPLE_RIDES.length,
        totalRevenue: 1250000,
      };
    },

    getDailyStats: async (startDate: string, endDate: string) => {
      await delay(400);
      const days = 7;
      return Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        users: Math.floor(Math.random() * 50) + 20,
        rides: Math.floor(Math.random() * 100) + 50,
        revenue: Math.floor(Math.random() * 500000) + 200000,
      }));
    },

    getActiveSOS: async () => {
      await delay(200);
      return SAMPLE_SOS_ALERTS.filter((s) => s.status === 'active');
    },
  },

  users: {
    getUsers: async (params: any) => {
      await delay(500);
      let filtered = [...SAMPLE_USERS];

      if (params.search) {
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(params.search.toLowerCase()) ||
            u.phone.includes(params.search),
        );
      }

      if (params.status && params.status !== 'all') {
        filtered = filtered.filter((u) => u.status === params.status);
      }

      if (params.role && params.role !== 'all') {
        filtered = filtered.filter((u) => u.role === params.role);
      }

      const page = params.page || 1;
      const limit = params.limit || 20;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        users: filtered.slice(start, end),
        meta: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit),
        },
      };
    },

    getUserDetails: async (userId: string) => {
      await delay(400);
      const user = SAMPLE_USERS.find((u) => u.id === userId);
      if (!user) throw new Error('User not found');

      return {
        user,
        rides: [
          {
            id: 'ride-1',
            from: 'Сүхбаатарын талбай',
            to: 'ШУТИС',
            date: '2025-12-20T08:00:00Z',
            status: 'completed',
            price: 3000,
          },
          {
            id: 'ride-2',
            from: 'Нарантуул',
            to: 'Зайсан',
            date: '2025-12-19T09:30:00Z',
            status: 'completed',
            price: 4000,
          },
        ],
        reviews: [
          {
            id: 'rev-1',
            rating: 5,
            comment: 'Маш сайн жолооч',
            date: '2025-12-20T10:00:00Z',
            reviewer: 'Батаа',
          },
        ],
        sosHistory: [
          {
            id: 'sos-1',
            date: '2025-12-15T14:30:00Z',
            location: 'Сүхбаатарын талбай',
            status: 'resolved',
          },
        ],
      };
    },

    blockUser: async (userId: string, reason: string) => {
      await delay(300);
      return { success: true, message: 'User blocked' };
    },

    unblockUser: async (userId: string) => {
      await delay(300);
      return { success: true, message: 'User unblocked' };
    },

    deleteUser: async (userId: string) => {
      await delay(300);
      return { success: true, message: 'User deleted' };
    },

    toggleVerification: async (userId: string) => {
      await delay(300);
      return { success: true, message: 'Verification toggled' };
    },

    createUser: async (userData: any) => {
      await delay(500);
      const newUser = {
        id: String(SAMPLE_USERS.length + 1),
        name: userData.name,
        phone: userData.phone,
        email: userData.email || null,
        role: userData.role,
        rating: 0,
        totalRides: 0,
        status: 'active',
        verified: false,
        registeredAt: new Date().toISOString(),
        balance: 0,
        profilePhoto: null,
      };
      SAMPLE_USERS.push(newUser);
      return { success: true, user: newUser };
    },
  },

  rides: {
    getRides: async (params: any) => {
      await delay(400);
      let filtered = [...SAMPLE_RIDES];

      if (params.search) {
        filtered = filtered.filter(
          (r) =>
            r.from.toLowerCase().includes(params.search.toLowerCase()) ||
            r.to.toLowerCase().includes(params.search.toLowerCase()) ||
            r.driverName.toLowerCase().includes(params.search.toLowerCase()),
        );
      }

      if (params.status && params.status !== 'all') {
        filtered = filtered.filter((r) => r.status === params.status);
      }

      const page = params.page || 1;
      const limit = params.limit || 20;

      return {
        rides: filtered,
        meta: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit),
        },
      };
    },

    getRideDetails: async (rideId: string) => {
      await delay(400);
      const ride = SAMPLE_RIDES.find((r) => r.id === rideId);
      if (!ride) throw new Error('Ride not found');

      return {
        ride: {
          ...ride,
          driver: {
            id: ride.driverId,
            name: ride.driverName,
            phone: '+97699123456',
            rating: 4.8,
            photo: null,
          },
          arrivalTime: new Date(
            new Date(ride.departureTime).getTime() + 30 * 60 * 1000,
          ).toISOString(),
          vehicle: {
            model: 'Toyota Prius',
            plate: 'УБ 1234',
            color: 'Цагаан',
          },
        },
        passengers: [
          {
            id: '2',
            name: 'Сарангэрэл',
            phone: '+97699234567',
            seats: 1,
            status: 'confirmed',
          },
        ],
        chatHistory: [
          {
            senderId: '1',
            senderName: 'Болдбаатар',
            message: 'Сайн байна уу',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
        ],
      };
    },

    cancelRide: async (rideId: string, reason: string) => {
      await delay(300);
      return { success: true, message: 'Ride cancelled' };
    },

    deleteRide: async (rideId: string) => {
      await delay(300);
      return { success: true, message: 'Ride deleted' };
    },
  },

  sos: {
    getSOSAlerts: async (params: any) => {
      await delay(300);
      let filtered = [...SAMPLE_SOS_ALERTS];

      if (params.status && params.status !== 'all') {
        filtered = filtered.filter((s) => s.status === params.status);
      }

      return {
        alerts: filtered,
        meta: {
          page: 1,
          limit: 50,
          total: filtered.length,
        },
      };
    },

    respondToAlert: async (alertId: string, adminId: string) => {
      await delay(300);
      return { success: true, message: 'Admin response recorded' };
    },

    resolveAlert: async (alertId: string, notes: string) => {
      await delay(300);
      return { success: true, message: 'Alert resolved' };
    },

    callUser: async (alertId: string) => {
      await delay(200);
      return { success: true, message: 'Call initiated' };
    },

    getNavigationLink: async (alertId: string) => {
      await delay(200);
      const alert = SAMPLE_SOS_ALERTS.find((a) => a.id === alertId);
      return {};
    },
  },

  moderation: {
    getReports: async (params: any) => {
      await delay(400);
      let filtered = [...SAMPLE_REPORTS];

      if (params.type && params.type !== 'all') {
        filtered = filtered.filter((r) => r.targetType === params.type);
      }

      if (params.status && params.status !== 'all') {
        filtered = filtered.filter((r) => r.status === params.status);
      }

      return {
        reports: filtered,
        meta: {
          page: 1,
          limit: 20,
          total: filtered.length,
        },
      };
    },

    getReportDetails: async (reportId: string) => {
      await delay(400);
      const report = SAMPLE_REPORTS.find((r) => r.id === reportId);
      if (!report) throw new Error('Report not found');

      return {
        report: {
          ...report,
          reporter: {
            id: report.reporterId,
            name: report.reporterName,
            phone: '+97699234567',
          },
          target: {
            id: report.targetId,
            type: report.targetType,
            name: 'Ганбаатар',
            content: 'Зохисгүй контент',
          },
          attachments: [],
          context: {
            rideId: 'ride-1',
            messages: [
              {
                sender: 'Ганбаатар',
                message: 'Зохисгүй мессеж',
                timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
              },
            ],
          },
        },
      };
    },

    approveReport: async (reportId: string, action: string, notes?: string) => {
      await delay(300);
      return { success: true, message: 'Report approved' };
    },

    rejectReport: async (reportId: string, reason: string) => {
      await delay(300);
      return { success: true, message: 'Report rejected' };
    },
  },

  reports: {
    getUserGrowth: async (period: string) => {
      await delay(500);
      const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
      return Array.from({ length: Math.min(days, 12) }, (_, i) => ({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        drivers: Math.floor(Math.random() * 50) + 20,
        passengers: Math.floor(Math.random() * 80) + 40,
        total: Math.floor(Math.random() * 130) + 60,
      }));
    },

    getRideStats: async () => {
      await delay(300);
      return {
        completed: 1250,
        cancelled: 85,
        ongoing: 23,
        completionRate: 93.6,
      };
    },

    getRevenue: async (period: string) => {
      await delay(400);
      const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
      return Array.from({ length: Math.min(days, 12) }, (_, i) => ({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        amount: Math.floor(Math.random() * 500000) + 200000,
        transactions: Math.floor(Math.random() * 100) + 50,
      }));
    },

    getPopularRoutes: async (limit = 10) => {
      await delay(400);
      return [
        { from: 'Сүхбаатарын талбай', to: 'ШУТИС', count: 245, avgPrice: 3000 },
        { from: 'Нарантуул зах', to: 'Зайсан', count: 189, avgPrice: 4500 },
        { from: 'Төв', to: 'Аэропорт', count: 156, avgPrice: 15000 },
        { from: 'МУИС', to: 'Хан-Уул', count: 134, avgPrice: 3500 },
        { from: 'Барилгачин', to: 'Сонсголон', count: 98, avgPrice: 2500 },
      ];
    },

    getTopDrivers: async (limit = 10) => {
      await delay(400);
      return [
        {
          id: '1',
          name: 'Болдбаатар',
          rating: 4.9,
          totalRides: 345,
          revenue: 2450000,
        },
        {
          id: '3',
          name: 'Батаа',
          rating: 4.8,
          totalRides: 298,
          revenue: 2100000,
        },
        {
          id: '5',
          name: 'Дорж',
          rating: 4.7,
          totalRides: 267,
          revenue: 1890000,
        },
      ];
    },
  },

  system: {
    getSystemStatus: async () => {
      await delay(200);
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
        uptime: 345600,
      };
    },

    getServicesHealth: async () => {
      await delay(300);
      return [
        {
          name: 'API Gateway',
          status: 'healthy' as const,
          responseTime: Math.floor(Math.random() * 50) + 10,
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'Auth Service',
          status: 'healthy' as const,
          responseTime: Math.floor(Math.random() * 50) + 10,
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'Ride Service',
          status: 'healthy' as const,
          responseTime: Math.floor(Math.random() * 50) + 10,
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'Chat Service',
          status: 'degraded' as const,
          responseTime: Math.floor(Math.random() * 200) + 100,
          lastChecked: new Date().toISOString(),
        },
      ];
    },

    getLogs: async (params: any) => {
      await delay(400);
      return {
        logs: [
          {
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            level: 'info',
            service: 'api-gateway',
            message: 'Request received',
            metadata: {},
          },
          {
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            level: 'warn',
            service: 'chat-service',
            message: 'High latency detected',
            metadata: {},
          },
        ],
        meta: {
          page: 1,
          limit: 20,
          total: 2,
        },
      };
    },

    updateConfig: async (config: any) => {
      await delay(300);
      return { success: true, message: 'Config updated' };
    },
  },

  auth: {
    login: async (email: string, password: string) => {
      await delay(500);
      return {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        admin: {
          id: 'admin-1',
          email,
          name: 'Админ',
          role: 'superadmin' as const,
        },
      };
    },

    refreshToken: async (refreshToken: string) => {
      await delay(300);
      return {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
      };
    },

    logout: async () => {
      await delay(200);
      return { success: true };
    },
  },
};
