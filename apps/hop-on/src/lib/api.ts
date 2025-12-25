import type {
  User,
  AuthResponse,
  Ride,
  CreateRideDto,
  Booking,
  CreateBookingDto,
  Payment,
  Wallet,
  Notification,
  Review,
  ApiResponse,
  PaginatedResponse,
} from '../types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error: unknown) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================
  auth = {
    register: async (data: {
      phone: string;
      password: string;
      name: string;
      email?: string;
      role?: 'driver' | 'passenger';
    }) => {
      return this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    login: async (phone: string, password: string) => {
      return this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });
    },

    getCurrentUser: async () => {
      return this.request<User>('/auth/me');
    },

    logout: async () => {
      return this.request('/auth/logout', {
        method: 'POST',
      });
    },

    refresh: async (refreshToken: string) => {
      return this.request<{ accessToken: string; refreshToken: string }>(
        '/auth/refresh',
        {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        },
      );
    },
  };

  // ============================================
  // RIDES ENDPOINTS
  // ============================================
  rides = {
    create: async (data: CreateRideDto) => {
      return this.request<Ride>('/rides', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    list: async (filters?: {
      status?: string;
      driverId?: string;
      page?: number;
      limit?: number;
    }) => {
      let query = '';
      if (filters) {
        const params: Record<string, string> = {};
        if (filters.status) params.status = filters.status;
        if (filters.driverId) params.driverId = filters.driverId;
        if (filters.page !== undefined) params.page = filters.page.toString();
        if (filters.limit !== undefined)
          params.limit = filters.limit.toString();
        query = new URLSearchParams(params).toString();
      }
      return this.request<PaginatedResponse<Ride>>(
        `/rides${query ? '?' + query : ''}`,
      );
    },

    search: async (params: {
      originLat: number;
      originLng: number;
      destinationLat: number;
      destinationLng: number;
      maxRadius?: number;
      departureDate?: string;
      seats?: number;
    }) => {
      const queryParams: Record<string, string> = {
        originLat: params.originLat.toString(),
        originLng: params.originLng.toString(),
        destinationLat: params.destinationLat.toString(),
        destinationLng: params.destinationLng.toString(),
      };

      if (params.maxRadius) queryParams.maxRadius = params.maxRadius.toString();
      if (params.departureDate)
        queryParams.departureDate = params.departureDate;
      if (params.seats) queryParams.seats = params.seats.toString();

      const query = new URLSearchParams(queryParams).toString();
      return this.request<{ rides: Ride[]; matchQuality: string }>(
        `/rides/search?${query}`,
      );
    },

    getById: async (id: string) => {
      return this.request<Ride>(`/rides/${id}`);
    },

    update: async (id: string, data: Partial<CreateRideDto>) => {
      return this.request<Ride>(`/rides/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    cancel: async (id: string) => {
      return this.request(`/rides/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // ============================================
  // BOOKINGS ENDPOINTS
  // ============================================
  bookings = {
    create: async (data: CreateBookingDto) => {
      return this.request<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    list: async (filters?: {
      status?: string;
      rideId?: string;
      page?: number;
      limit?: number;
    }) => {
      let query = '';
      if (filters) {
        const params: Record<string, string> = {};
        if (filters.status) params.status = filters.status;
        if (filters.rideId) params.rideId = filters.rideId;
        if (filters.page !== undefined) params.page = filters.page.toString();
        if (filters.limit !== undefined)
          params.limit = filters.limit.toString();
        query = new URLSearchParams(params).toString();
      }
      return this.request<PaginatedResponse<Booking>>(
        `/bookings${query ? '?' + query : ''}`,
      );
    },

    getById: async (id: string) => {
      return this.request<Booking>(`/bookings/${id}`);
    },

    approve: async (id: string) => {
      return this.request<Booking>(`/bookings/${id}/approve`, {
        method: 'PATCH',
      });
    },

    reject: async (id: string, reason?: string) => {
      return this.request<Booking>(`/bookings/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
    },

    cancel: async (id: string) => {
      return this.request(`/bookings/${id}`, {
        method: 'DELETE',
      });
    },

    // Get bookings for driver (bookings on driver's rides)
    listDriverBookings: async (filters?: {
      status?: string;
      rideId?: string;
      page?: number;
      limit?: number;
    }) => {
      let query = '';
      if (filters) {
        const params: Record<string, string> = {};
        if (filters.status) params.status = filters.status;
        if (filters.rideId) params.rideId = filters.rideId;
        if (filters.page !== undefined) params.page = filters.page.toString();
        if (filters.limit !== undefined)
          params.limit = filters.limit.toString();
        query = new URLSearchParams(params).toString();
      }
      return this.request<PaginatedResponse<Booking>>(
        `/bookings/driver${query ? '?' + query : ''}`,
      );
    },
  };

  // ============================================
  // PAYMENTS & WALLET ENDPOINTS
  // ============================================
  payments = {
    processRidePayment: async (bookingId: string, paymentMethod: string) => {
      return this.request<Payment>('/payments/payments/ride', {
        method: 'POST',
        body: JSON.stringify({ bookingId, paymentMethod }),
      });
    },

    getHistory: async (params?: { page?: number; limit?: number }) => {
      let query = '';
      if (params) {
        const queryParams: Record<string, string> = {};
        if (params.page !== undefined)
          queryParams.page = params.page.toString();
        if (params.limit !== undefined)
          queryParams.limit = params.limit.toString();
        query = new URLSearchParams(queryParams).toString();
      }
      return this.request<PaginatedResponse<Payment>>(
        `/payments/payments${query ? '?' + query : ''}`,
      );
    },
  };

  wallet = {
    getBalance: async () => {
      return this.request<Wallet>('/payments/wallet');
    },

    topup: async (amount: number, paymentMethod: string) => {
      return this.request<Payment>('/payments/wallet/topup', {
        method: 'POST',
        body: JSON.stringify({ amount, paymentMethod }),
      });
    },
  };

  // ============================================
  // NOTIFICATIONS ENDPOINTS
  // ============================================
  notifications = {
    list: async (params?: { page?: number; limit?: number }) => {
      const query = params
        ? new URLSearchParams(params as Record<string, string>).toString()
        : '';
      return this.request<PaginatedResponse<Notification>>(
        `/notifications${query ? '?' + query : ''}`,
      );
    },

    markAsRead: async (id: string) => {
      return this.request(`/notifications/${id}/read`, {
        method: 'PATCH',
      });
    },

    getUnreadCount: async () => {
      return this.request<{ count: number }>('/notifications/unread/count');
    },
  };

  // ============================================
  // USERS ENDPOINTS
  // ============================================
  users = {
    updateProfile: async (data: Partial<User>) => {
      return this.request<User>('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    getProfile: async (id: string) => {
      return this.request<User>(`/users/${id}`);
    },

    uploadPhoto: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${this.baseURL}/users/upload-photo`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      return response.json();
    },
  };

  // ============================================
  // REVIEWS ENDPOINTS
  // ============================================
  reviews = {
    create: async (data: {
      bookingId: string;
      rating: number;
      comment?: string;
    }) => {
      return this.request<Review>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getByUser: async (userId: string) => {
      return this.request<Review[]>(`/reviews/user/${userId}`);
    },
  };
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
