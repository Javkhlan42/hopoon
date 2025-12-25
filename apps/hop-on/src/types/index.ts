// User & Authentication Types
export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: 'driver' | 'passenger' | 'admin';
  profile_photo?: string;
  rating?: number;
  verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Location Types
export interface Location {
  lat: number;
  lng: number;
  address: string;
}

// Ride Types
export interface Ride {
  id: string;
  driver_id: string;
  driver?: User;
  origin_lat: number;
  origin_lng: number;
  origin_address: string;
  destination_lat: number;
  destination_lng: number;
  destination_address: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  vehicle_type?: string;
  vehicle_number?: string;
  notes?: string;
  status:
    | 'draft'
    | 'active'
    | 'full'
    | 'in_progress'
    | 'completed'
    | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CreateRideDto {
  origin: Location;
  destination: Location;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  vehicleType?: string;
  vehicleNumber?: string;
  notes?: string;
}

// Booking Types
export interface Booking {
  id: string;
  ride_id: string;
  passenger_id: string;
  seats: number;
  total_price: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  ride?: Ride;
  passenger?: User;
}

export interface CreateBookingDto {
  rideId: string;
  seats: number;
}

// Review Types
export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: User;
  reviewee?: User;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type:
    | 'booking_request'
    | 'booking_approved'
    | 'booking_rejected'
    | 'ride_reminder'
    | 'payment_success';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

// Payment Types
export interface Payment {
  id: string;
  booking_id?: string;
  user_id: string;
  amount: number;
  type: 'ride_payment' | 'refund' | 'wallet_topup' | 'payout';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
}

export interface Wallet {
  user_id: string;
  balance: number;
  updated_at: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: User;
}

export interface ChatRoom {
  id: string;
  ride_id: string;
  participants: string[];
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
