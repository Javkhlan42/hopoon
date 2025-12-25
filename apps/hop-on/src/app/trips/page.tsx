'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { BottomNav } from '../../components/BottomNav';
import { Card, CardContent } from '../../components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../../lib/api';
import type { Booking, Ride } from '../../types';
import { formatCurrency, formatTime, formatDate } from '../../lib/utils';
import { RideMiniMap } from '../../components/RideMiniMap';

// Helper function to extract array from various API response formats
function extractArray<T>(response: unknown, key: string): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }
  
  const data = response as Record<string, unknown>;
  
  if (data && typeof data === 'object') {
    // Check if there's a 'data' property that is an array (common format: {data: [...], total: number})
    if ('data' in data && Array.isArray(data.data)) {
      return data.data as T[];
    }
    // Check if the key exists and is an array
    if (key in data && Array.isArray(data[key])) {
      return data[key] as T[];
    }
    // Check nested data.key format
    if ('data' in data) {
      const nestedData = data.data as Record<string, unknown>;
      if (nestedData && typeof nestedData === 'object' && key in nestedData && Array.isArray(nestedData[key])) {
        return nestedData[key] as T[];
      }
    }
  }
  
  return [];
}

export default function TripsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'driver' | 'passenger'>(
    'passenger',
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [rideBookings, setRideBookings] = useState<Record<string, Booking[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  // Set default tab based on user role
  useEffect(() => {
    if (user?.role === 'driver') {
      setActiveTab('driver');
    }
  }, [user?.role]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.id) {
      console.log(
        'User loaded, fetching data for:',
        user.id,
        'tab:',
        activeTab,
      );
      if (activeTab === 'driver') {
        fetchMyRides();
      } else {
        fetchBookings();
      }
    }
  }, [user, user?.id, activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('Fetching bookings...');
      const response = await apiClient.bookings.list();
      console.log('Bookings API response:', response);
      
      const data = response.data || response;
      console.log('Bookings data:', data);
      
      const bookingsData = extractArray<Booking>(data, 'bookings');
      
      console.log('Parsed bookings:', bookingsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRides = async () => {
    if (!user?.id) {
      console.log('User ID not available yet');
      return;
    }

    try {
      setLoading(true);

      console.log('=== FETCHING DRIVER RIDES ===');
      console.log('Driver ID:', user.id);

      // Fetch rides filtered by current driver ID
      const ridesResponse = await apiClient.rides.list({ driverId: user.id });
      console.log('Rides API response:', ridesResponse);

      const ridesData = ridesResponse.data || ridesResponse;
      console.log('Rides data:', ridesData);
      
      const myRidesFiltered = extractArray<Ride>(ridesData, 'rides');
      
      console.log('My rides count:', myRidesFiltered.length);
      console.log('My rides:', myRidesFiltered);
      setMyRides(myRidesFiltered);

      // Fetch bookings for driver's rides using driver endpoint
      const bookingsResponse = await apiClient.bookings.listDriverBookings();
      console.log('Driver bookings response:', bookingsResponse);
      
      const bookingsData = bookingsResponse.data || bookingsResponse;
      console.log('Driver bookings data:', bookingsData);
      
      const allBookings = extractArray<Booking>(bookingsData, 'bookings');
      
      console.log('Driver bookings count:', allBookings.length);
      console.log('Driver bookings:', allBookings);

      // Group bookings by ride_id
      const bookingsMap: Record<string, Booking[]> = {};
      for (const ride of myRidesFiltered) {
        const rideBookings = allBookings.filter((b) => b.ride_id === ride.id);
        bookingsMap[ride.id] = rideBookings;
        console.log(`Ride ${ride.id} has ${rideBookings.length} bookings`);
      }
      setRideBookings(bookingsMap);
      
      console.log('=== DRIVER RIDES FETCH COMPLETE ===');
    } catch (error) {
      console.error('Failed to fetch rides:', error);
      setMyRides([]);
      setRideBookings({});
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId: string) => {
    try {
      await apiClient.bookings.approve(bookingId);
      alert('Захиалга батлагдлаа');
      if (activeTab === 'driver') {
        fetchMyRides();
      } else {
        fetchBookings();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Алдаа гарлаа';
      alert(errorMessage);
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      await apiClient.bookings.reject(bookingId, 'Дүүрсэн байна');
      alert('Захиалга татгалзлаа');
      if (activeTab === 'driver') {
        fetchMyRides();
      } else {
        fetchBookings();
      }
    } catch (error: unknown) {
      alert((error as Error).message || 'Алдаа гарлаа');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
      pending: { label: 'Хүлээгдэж буй', variant: 'outline' },
      approved: { label: 'Батлагдсан', variant: 'default' },
      rejected: { label: 'Татгалзсан', variant: 'destructive' },
      cancelled: { label: 'Цуцлагдсан', variant: 'secondary' },
      completed: { label: 'Идэвхтэй', variant: 'default' },
    };

    const { label, variant } = statusMap[status] || {
      label: status,
      variant: 'outline',
    };
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold mb-4">Миний аялалууд</h1>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('passenger')}
              className={`py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'passenger'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Миний захиалга
            </button>
            <button
              onClick={() => setActiveTab('driver')}
              className={`py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'driver'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Миний ride
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="text-center py-8">Уншиж байна...</div>
        ) : activeTab === 'driver' ? (
          /* Driver View - My Rides and Their Bookings */
          myRides.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Ride үүсгээгүй байна</p>
            </div>
          ) : (
            myRides.map((ride) => (
              <Card key={ride.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {/* Mini Map */}
                  <RideMiniMap
                    originAddress={ride.origin_address || 'Улаанбаатар'}
                    destinationAddress={ride.destination_address || 'Дархан'}
                    originLat={ride.origin_lat}
                    originLng={ride.origin_lng}
                    destinationLat={ride.destination_lat}
                    destinationLng={ride.destination_lng}
                    className="h-32 mb-3"
                  />

                  {/* Ride Info */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant={ride.status === 'active' ? 'default' : 'outline'}
                    >
                      {ride.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDate(ride.created_at)}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="font-medium">
                        {ride.origin_address || 'Улаанбаатар'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="font-medium">
                        {ride.destination_address || 'Дархан'}
                      </span>
                    </div>
                  </div>

                  {/* Ride Details */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 pb-3 border-b">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(ride.departure_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {ride.available_seats} суудал
                    </span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(ride.price_per_seat)}
                    </span>
                  </div>

                  {/* Bookings for this ride */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Хүсэлтүүд ({rideBookings[ride.id]?.length || 0})
                    </h3>

                    {!rideBookings[ride.id] ||
                    rideBookings[ride.id].length === 0 ? (
                      <p className="text-xs text-gray-500 py-2">
                        Хүсэлт ирээгүй байна
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {rideBookings[ride.id].map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={booking.passenger?.profile_photo}
                                />
                                <AvatarFallback>
                                  {booking.passenger?.name?.charAt(0) || 'P'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="text-sm font-medium">
                                  {booking.passenger?.name || 'Зорчигч'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {booking.seats} суудал •{' '}
                                  {formatCurrency(booking.total_price)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(booking.status)}

                                {booking.status === 'pending' && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleReject(booking.id)}
                                      className="h-7 w-7 p-0"
                                    >
                                      <XCircle className="w-4 h-4 text-red-600" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApprove(booking.id)}
                                      className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )
        ) : /* Passenger View - My Bookings */
        bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Одоогоор аялал байхгүй байна</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-4">
                {/* Mini Map */}
                <RideMiniMap
                  originAddress={booking.ride?.origin_address || 'Улаанбаатар'}
                  destinationAddress={booking.ride?.destination_address || 'Дархан'}
                  originLat={booking.ride?.origin_lat}
                  originLng={booking.ride?.origin_lng}
                  destinationLat={booking.ride?.destination_lat}
                  destinationLng={booking.ride?.destination_lng}
                  className="h-32 mb-3"
                />

                {/* Status & Date */}
                <div className="flex items-center justify-between mb-3">
                  {getStatusBadge(booking.status)}
                  <span className="text-xs text-gray-500">
                    {formatDate(booking.created_at)}
                  </span>
                </div>

                {/* Route */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>{booking.ride?.origin_address || 'Улаанбаатар'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>{booking.ride?.destination_address || 'Дархан'}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {booking.ride?.departure_time
                      ? formatTime(booking.ride.departure_time)
                      : '08:00'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {booking.seats} суудал
                  </span>
                </div>

                {/* Driver Info */}
                {booking.ride?.driver && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={booking.ride.driver.profile_photo} />
                      <AvatarFallback>
                        {booking.ride.driver.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {booking.ride.driver.name}
                      </div>
                      <div className="text-xs text-gray-500">Жолооч</div>
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between pt-3 border-t mt-3">
                  <span className="text-sm text-gray-600">Нийт үнэ</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(booking.total_price)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
}
