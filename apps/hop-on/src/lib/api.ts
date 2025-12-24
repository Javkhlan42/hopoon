/**
 * Hop-On API Client
 * API Gateway-тэй холбогдох frontend client
 * Base URL: http://localhost:3000/api/v1
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
// Note: Chat REST API нь Gateway дамжуулна (/api/v1/chat/*)
// WebSocket л шууд Chat Service (localhost:3006) руу холбогдоно

// ============================================
// Types & Interfaces
// ============================================

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role?: 'driver' | 'passenger';
  rating?: number;
  totalRides?: number;
  verified?: boolean;
  createdAt?: string;
}

interface Ride {
  id: string;
  driverId?: string;
  driver?: User;
  origin: Location;
  destination: Location;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  vehicleType?: string;
  vehicleNumber?: string;
  notes?: string;
  status?: 'draft' | 'active' | 'full' | 'in_progress' | 'completed' | 'cancelled';
  distance?: number;
  bookings?: Booking[];
}

interface Booking {
  id: string;
  rideId: string;
  passengerId: string;
  ride?: Ride;
  driver?: User;
  passenger?: User;
  seats: number;
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  pickupLocation?: Location;
  dropoffLocation?: Location;
  payment?: {
    status: string;
    method: string;
  };
  createdAt?: string;
}

interface Payment {
  id: string;
  userId: string;
  bookingId?: string;
  amount: number;
  type: 'charge' | 'refund' | 'topup' | 'withdrawal';
  method: 'wallet' | 'card' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

// ============================================
// API Client Class
// ============================================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: 'Request failed',
        error: `HTTP ${response.status}` 
      }));
      throw new Error(error.message || error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================

  auth = {
    /**
     * Нэвтрэх
     * POST /auth/login
     */
    login: async (phone: string, password: string) => {
      return this.request<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });
    },

    /**
     * Бүртгүүлэх
     * POST /auth/register
     */
    register: async (data: { 
      phone: string; 
      password: string; 
      name: string;
      email?: string;
    }) => {
      return this.request<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Token сэргээх
     * POST /auth/refresh
     */
    refresh: async (refreshToken: string) => {
      return this.request<{
        accessToken: string;
        refreshToken: string;
      }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    },

    /**
     * Одоогийн хэрэглэгчийн мэдээлэл авах
     * GET /auth/me
     */
    getCurrentUser: async () => {
      return this.request<User>('/auth/me');
    },

    /**
     * Гарах
     * POST /auth/logout
     */
    logout: async () => {
      return this.request('/auth/logout', {
        method: 'POST',
      });
    },
  };

  // ============================================
  // RIDES ENDPOINTS
  // ============================================

  rides = {
    /**
     * Зорчилт үүсгэх (Жолооч)
     * POST /rides
     */
    create: async (data: {
      origin: Location;
      destination: Location;
      departureTime: string;
      availableSeats: number;
      pricePerSeat: number;
      vehicleType?: string;
      vehicleNumber?: string;
      notes?: string;
    }) => {
      return this.request<Ride>('/rides', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Зорчилтын жагсаалт
     * GET /rides
     */
    list: async (filters?: {
      status?: string;
      driverId?: string;
      page?: number;
      limit?: number;
    }) => {
      const query = filters ? new URLSearchParams(filters as any).toString() : '';
      return this.request<{
        rides: Ride[];
        pagination: {
          page: number;
          limit: number;
          total: number;
        };
      }>(`/rides${query ? '?' + query : ''}`);
    },

    /**
     * Зорчилт хайх
     * GET /rides/search
     */
    search: async (params: {
      originLat: number;
      originLng: number;
      destinationLat: number;
      destinationLng: number;
      maxRadius?: number;
      departureDate?: string;
      seats?: number;
      page?: number;
      limit?: number;
    }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.request<{
        rides: Ride[];
        matchQuality: string;
      }>(`/rides/search?${query}`);
    },

    /**
     * Зорчилтын дэлгэрэнгүй мэдээлэл
     * GET /rides/:id
     */
    getById: async (id: string) => {
      return this.request<Ride>(`/rides/${id}`);
    },

    /**
     * Зорчилт шинэчлэх (Жолооч)
     * PATCH /rides/:id
     */
    update: async (id: string, data: {
      departureTime?: string;
      availableSeats?: number;
      pricePerSeat?: number;
      notes?: string;
    }) => {
      return this.request<Ride>(`/rides/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    /**
     * Зорчилт цуцлах (Жолооч)
     * DELETE /rides/:id
     */
    cancel: async (id: string) => {
      return this.request(`/rides/${id}`, {
        method: 'DELETE',
      });
    },

    /**
     * Миний зорчилтууд
     * GET /rides/my-rides
     */
    getMyRides: async () => {
      return this.request<{ rides: Ride[] }>('/rides/my-rides');
    },
  };

  // ============================================
  // BOOKINGS ENDPOINTS
  // ============================================

  bookings = {
    /**
     * Захиалга үүсгэх (Зорчигч)
     * POST /bookings
     */
    create: async (data: {
      rideId: string;
      seats: number;
      pickupLocation?: Location;
      dropoffLocation?: Location;
    }) => {
      return this.request<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Захиалгын жагсаалт
     * GET /bookings
     */
    list: async (filters?: {
      status?: string;
      rideId?: string;
      page?: number;
      limit?: number;
    }) => {
      const query = filters ? new URLSearchParams(filters as any).toString() : '';
      return this.request<{
        bookings: Booking[];
      }>(`/bookings${query ? '?' + query : ''}`);
    },

    /**
     * Жолоочийн захиалгууд
     * GET /bookings/driver
     */
    getDriverBookings: async () => {
      return this.request<{ bookings: Booking[] }>('/bookings/driver');
    },

    /**
     * Захиалгын дэлгэрэнгүй
     * GET /bookings/:id
     */
    getById: async (id: string) => {
      return this.request<Booking>(`/bookings/${id}`);
    },

    /**
     * Захиалга зөвшөөрөх (Жолооч)
     * PATCH /bookings/:id/approve
     */
    approve: async (id: string) => {
      return this.request<Booking>(`/bookings/${id}/approve`, {
        method: 'PATCH',
      });
    },

    /**
     * Захиалга татгалзах (Жолооч)
     * PATCH /bookings/:id/reject
     */
    reject: async (id: string, reason?: string) => {
      return this.request<Booking>(`/bookings/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
    },

    /**
     * Захиалга цуцлах (Зорчигч)
     * DELETE /bookings/:id
     */
    cancel: async (id: string) => {
      return this.request(`/bookings/${id}`, {
        method: 'DELETE',
      });
    },

    /**
     * Миний захиалгууд
     * GET /bookings/my-bookings
     */
    getMyBookings: async () => {
      return this.request<{ bookings: Booking[] }>('/bookings/my-bookings');
    },
  };

  // ============================================
  // PAYMENTS ENDPOINTS
  // ============================================

  payments = {
    /**
     * Зорчилтын төлбөр төлөх
     * POST /payments/payments/ride
     */
    processRidePayment: async (bookingId: string, method: 'wallet' | 'card') => {
      return this.request<Payment>('/payments/payments/ride', {
        method: 'POST',
        body: JSON.stringify({ bookingId, method }),
      });
    },

    /**
     * Төлбөр буцаах
     * POST /payments/payments/refund
     */
    refund: async (paymentId: string, reason: string) => {
      return this.request<Payment>('/payments/payments/refund', {
        method: 'POST',
        body: JSON.stringify({ paymentId, reason }),
      });
    },

    /**
     * Төлбөрийн түүх
     * GET /payments/payments/history
     */
    getHistory: async (userId?: string) => {
      const query = userId ? `?userId=${userId}` : '';
      return this.request<{
        payments: Payment[];
      }>(`/payments/payments/history${query}`);
    },

    /**
     * Төлбөрийн дэлгэрэнгүй
     * GET /payments/payments/:id
     */
    getById: async (id: string, userId?: string) => {
      const query = userId ? `?userId=${userId}` : '';
      return this.request<Payment>(`/payments/payments/${id}${query}`);
    },
  };

  // ============================================
  // WALLET ENDPOINTS
  // ============================================

  wallet = {
    /**
     * Хэтэвчний үлдэгдэл
     * GET /payments/wallet/balance
     */
    getBalance: async () => {
      return this.request<{
        balance: number;
        currency: string;
      }>('/payments/wallet/balance');
    },

    /**
     * Хэтэвч цэнэглэх
     * POST /payments/wallet/topup
     */
    topup: async (amount: number, paymentMethod: string) => {
      return this.request<{
        balance: number;
        transaction: Payment;
      }>('/payments/wallet/topup', {
        method: 'POST',
        body: JSON.stringify({ amount, paymentMethod }),
      });
    },
  };

  // ============================================
  // NOTIFICATIONS ENDPOINTS
  // ============================================

  notifications = {
    /**
     * Мэдэгдлүүдийн жагсаалт
     * GET /notifications
     */
    list: async (userId: string, unreadOnly?: boolean) => {
      const query = new URLSearchParams({ 
        userId,
        ...(unreadOnly && { unreadOnly: 'true' })
      }).toString();
      return this.request<{
        notifications: Notification[];
        unreadCount: number;
      }>(`/notifications?${query}`);
    },

    /**
     * Мэдэгдэл уншсан гэж тэмдэглэх
     * PATCH /notifications/mark-read
     */
    markAsRead: async (userId: string, notificationIds: string[]) => {
      return this.request('/notifications/mark-read', {
        method: 'PATCH',
        body: JSON.stringify({ userId, notificationIds }),
      });
    },

    /**
     * Уншаагүй мэдэгдлийн тоо
     * GET /notifications/unread-count
     */
    getUnreadCount: async (userId: string) => {
      return this.request<{
        count: number;
      }>(`/notifications/unread-count?userId=${userId}`);
    },
  };

  // ============================================
  // CHAT ENDPOINTS (REST via Gateway)
  // Gateway: /api/v1/chat/* -> Chat Service (localhost:3006)
  // WebSocket нь шууд Chat Service руу холбогдоно
  // ============================================

  chat = {
    /**
     * Харилцан яриа үүсгэх
     * POST /api/v1/chat/conversations
     * Body: { participantIds, rideId?, title? }
     */
    createConversation: async (data: {
      participantIds: string[];
      rideId?: string;
      title?: string;
    }) => {
      return this.request('/chat/conversations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Харилцан яриануудын жагсаалт
     * GET /api/v1/chat/conversations
     */
    getConversations: async () => {
      return this.request('/chat/conversations');
    },

    /**
     * Харилцан яриа авах
     * GET /api/v1/chat/conversations/:id
     */
    getConversation: async (id: string) => {
      return this.request(`/chat/conversations/${id}`);
    },

    /**
     * Зурвас илгээх
     * POST /api/v1/chat/messages
     * Body: { conversationId, content }
     */
    sendMessage: async (conversationId: string, content: string) => {
      return this.request('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId, content }),
      });
    },

    /**
     * Зурваснуудыг авах
     * GET /api/v1/chat/messages/conversation/:conversationId?limit=50&offset=0
     */
    getMessages: async (conversationId: string, limit?: number, offset?: number) => {
      const query = new URLSearchParams({
        ...(limit && { limit: limit.toString() }),
        ...(offset && { offset: offset.toString() }),
      }).toString();
      return this.request(`/chat/messages/conversation/${conversationId}${query ? '?' + query : ''}`);
    },

    /**
     * Уншсан гэж тэмдэглэх
     * PATCH /api/v1/chat/messages/mark-read
     * Body: { conversationId }
     */
    markAsRead: async (conversationId: string) => {
      return this.request('/chat/messages/mark-read', {
        method: 'PATCH',
        body: JSON.stringify({ conversationId }),
      });
    },

    /**
     * Уншаагүй зурвасын тоо
     * GET /api/v1/chat/messages/unread-count?conversationId=xxx
     */
    getUnreadCount: async (conversationId?: string) => {
      const query = conversationId ? `?conversationId=${conversationId}` : '';
      return this.request(`/chat/messages/unread-count${query}`);
    },
  };
}

// ============================================
// Export
// ============================================

export const apiClient = new ApiClient();
export const api = apiClient; // Backwards compatibility
export default apiClient;

// Export types
export type {
  ApiResponse,
  Location,
  User,
  Ride,
  Booking,
  Payment,
  Notification,
};
