// User Types
export interface User {
  id: string;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  verified: boolean;
  role: 'driver' | 'passenger' | 'admin';
  avatar?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  bio?: string;
  completedRides: number;
  totalRatings: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

// Ride Types
export interface Ride {
  id: string;
  driverId: string;
  driver?: User;
  origin: Location;
  destination: Location;
  departureTime: Date;
  availableSeats: number;
  pricePerSeat: number;
  status: 'active' | 'full' | 'completed' | 'cancelled';
  recurring?: RecurringSchedule;
  route?: RouteGeometry;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
}

export interface RouteGeometry {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface RecurringSchedule {
  enabled: boolean;
  days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  time: string;
}

// Booking Types
export interface Booking {
  id: string;
  rideId: string;
  passengerId: string;
  passenger?: User;
  seats: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  pickupPoint: Location;
  dropoffPoint: Location;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

// Message Types
export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'location' | 'image';
  createdAt: Date;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  rideId: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: Date;
}

// Payment Types
export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'ride_payment' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: 'MNT';
  updatedAt: Date;
}

// Rating Types
export interface Rating {
  id: string;
  rideId: string;
  fromUserId: string;
  toUserId: string;
  score: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}
