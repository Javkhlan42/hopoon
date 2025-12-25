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
import {
  Star,
  Phone,
  Mail,
  Calendar,
  Shield,
  LogOut,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Settings,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import apiClient from '../../lib/api';
import type { Review, Booking, Ride } from '../../types';
import { RideMiniMap } from '../../components/RideMiniMap';
import { useDialog } from '../../components/DialogProvider';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { showAlert, showConfirm } = useDialog();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [rideBookings, setRideBookings] = useState<Record<string, Booking[]>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTrips: 0,
    driverTrips: 0,
    passengerTrips: 0,
    rating: 4.8,
    reviewCount: 24,
  });
  const [activeTab, setActiveTab] = useState<
    'reviews' | 'vehicle' | 'bookings' | 'rides'
  >('bookings');

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const extractArray = <T,>(data: any, key?: string): T[] => {
    if (Array.isArray(data)) {
      return data;
    }
    if (key && data && Array.isArray(data[key])) {
      return data[key];
    }
    if (data && typeof data === 'object') {
      const possibleKeys = ['data', 'items', key].filter(Boolean);
      for (const k of possibleKeys) {
        if (Array.isArray(data[k])) {
          return data[k];
        }
      }
    }
    return [];
  };

  const fetchBookings = async () => {
    try {
      console.log('=== Fetching Bookings ===');
      const response = await apiClient.bookings.list();
      const data = response.data || response;
      const bookingsData = extractArray<Booking>(data, 'bookings');
      console.log('Bookings:', bookingsData);
      console.log('Bookings Count:', bookingsData.length);
      setBookings(bookingsData);
      return bookingsData.length;
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      return 0;
    }
  };

  const fetchMyRides = async () => {
    if (!user?.id) return 0;

    try {
      console.log('=== Fetching My Rides ===');
      console.log('User ID:', user.id);

      const ridesResponse = await apiClient.rides.list({ driverId: user.id });
      console.log('Rides API Response:', ridesResponse);

      const ridesData = ridesResponse.data || ridesResponse;
      console.log('Rides Data:', ridesData);

      const myRidesFiltered = extractArray<Ride>(ridesData, 'rides');
      console.log('Filtered Rides:', myRidesFiltered);
      console.log('Rides Count:', myRidesFiltered.length);

      setMyRides(myRidesFiltered);

      const bookingsResponse = await apiClient.bookings.listDriverBookings();
      const bookingsData = bookingsResponse.data || bookingsResponse;
      const allBookings = extractArray<Booking>(bookingsData, 'bookings');

      const bookingsMap: Record<string, Booking[]> = {};
      for (const ride of myRidesFiltered) {
        const rideBookings = allBookings.filter((b) => b.ride_id === ride.id);
        bookingsMap[ride.id] = rideBookings;
      }
      setRideBookings(bookingsMap);

      console.log('=== Fetch Complete ===');
      return myRidesFiltered.length;
    } catch (error) {
      console.error('Failed to fetch rides:', error);
      setMyRides([]);
      setRideBookings({});
      return 0;
    }
  };

  const loadAllData = async () => {
    const [passengerCount, driverCount] = await Promise.all([
      fetchBookings(),
      fetchMyRides(),
    ]);

    // Update stats after both fetches complete
    setStats((prev) => ({
      ...prev,
      passengerTrips: passengerCount,
      driverTrips: driverCount,
      totalTrips: passengerCount + driverCount,
    }));
  };

  const fetchReviews = async () => {
    // Reviews endpoint not implemented yet
    // Will be added in future
  };

  const handleLogout = async () => {
    showConfirm('Гарахдаа итгэлтэй байна уу?', async () => {
      await logout();
    });
  };

  const handleApprove = async (bookingId: string) => {
    try {
      await apiClient.bookings.approve(bookingId);
      showAlert('Захиалга батлагдлаа');
      fetchMyRides();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Алдаа гарлаа';
      showAlert(errorMessage);
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      await apiClient.bookings.reject(bookingId, 'Дүүрсэн байна');
      showAlert('Захиалга татгалзлаа');
      fetchMyRides();
    } catch (error: unknown) {
      showAlert((error as Error).message || 'Алдаа гарлаа');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant: 'default' | 'destructive' | 'outline' | 'secondary';
      }
    > = {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('mn-MN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('mn-MN', {
      style: 'currency',
      currency: 'MNT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Background */}
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 pt-6 pb-32 px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white mb-8 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base font-medium">Back</span>
        </button>

        {/* Profile Info */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            <AvatarImage src={user.profile_photo} />
            <AvatarFallback className="text-3xl bg-white text-cyan-600">
              {user.name?.charAt(0) || user.phone?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-white">
                {user.name || user.phone}
              </h1>
              {user.verified && (
                <Badge className="bg-green-500 text-white border-0 text-xs px-2 py-0.5">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-white mb-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-xl font-bold">{stats.rating}</span>
              <span className="text-white/80 text-sm">
                ({stats.reviewCount} reviews)
              </span>
            </div>

            <p className="text-white/90 text-sm">
              Member since{' '}
              {new Date(user.created_at).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push('/profile/edit')}
              className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <Settings className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors font-medium border border-white/30"
            >
              <LogOut className="w-4 h-4" />
              Гарах
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-20 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/90 backdrop-blur shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {stats.totalTrips}
              </div>
              <div className="text-sm text-gray-600">Total Trips</div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {stats.driverTrips}
              </div>
              <div className="text-sm text-gray-600">As Driver</div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {stats.passengerTrips}
              </div>
              <div className="text-sm text-gray-600">As Passenger</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verification Status */}
      <div className="px-4 mb-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">
                  Verification Complete
                </h3>
                <p className="text-sm text-gray-600">Phone & ID verified</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-6 mb-4">
        <Card>
          <CardContent className="p-2">
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-3 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === 'bookings'
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Миний захиалга
              </button>
              <button
                onClick={() => setActiveTab('rides')}
                className={`py-3 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === 'rides'
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Миний ride
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-3 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === 'reviews'
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Үнэлгээ
              </button>
              <button
                onClick={() => setActiveTab('vehicle')}
                className={`py-3 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === 'vehicle'
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Машин
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <main className="px-4 space-y-4">
        {activeTab === 'bookings' && (
          <>
            <h3 className="font-semibold text-lg">Миний захиалга</h3>
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Одоогоор аялал байхгүй байна
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-row gap-6 items-start">
                      {/* Left: Booking Info */}
                      <div className="flex-1">
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
                            <span>
                              {booking.ride?.origin_address || 'Улаанбаатар'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>
                              {booking.ride?.destination_address || 'Дархан'}
                            </span>
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
                              <AvatarImage
                                src={booking.ride.driver.profile_photo}
                              />
                              <AvatarFallback>
                                {booking.ride.driver.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">
                                {booking.ride.driver.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Жолооч
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between pt-3 border-t mt-3">
                          <span className="text-sm text-gray-600">
                            Нийт үнэ
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(booking.total_price)}
                          </span>
                        </div>
                      </div>

                      {/* Right: Mini Map */}
                      <div className="w-64 flex-shrink-0">
                        <RideMiniMap
                          originAddress={
                            booking.ride?.origin_address || 'Улаанбаатар'
                          }
                          destinationAddress={
                            booking.ride?.destination_address || 'Дархан'
                          }
                          originLat={booking.ride?.origin_lat}
                          originLng={booking.ride?.origin_lng}
                          destinationLat={booking.ride?.destination_lat}
                          destinationLng={booking.ride?.destination_lng}
                          className="w-full h-40 rounded-lg border"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}

        {activeTab === 'rides' && (
          <>
            <h3 className="font-semibold text-lg">Миний ride</h3>
            {myRides.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Ride үүсгээгүй байна
                </CardContent>
              </Card>
            ) : (
              myRides.map((ride) => (
                <Card key={ride.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-row gap-6 items-start">
                      {/* Left: Ride Info */}
                      <div className="flex-1">
                        {/* Ride Info */}
                        <div className="flex items-center justify-between mb-3">
                          <Badge
                            variant={
                              ride.status === 'active' ? 'default' : 'outline'
                            }
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
                                        {booking.passenger?.name?.charAt(0) ||
                                          'P'}
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
                                            onClick={() =>
                                              handleReject(booking.id)
                                            }
                                            className="h-7 w-7 p-0"
                                          >
                                            <XCircle className="w-4 h-4 text-red-600" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              handleApprove(booking.id)
                                            }
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
                      </div>

                      {/* Right: Mini Map */}
                      <div className="w-64 flex-shrink-0">
                        <RideMiniMap
                          originAddress={ride.origin_address || 'Улаанбаатар'}
                          destinationAddress={
                            ride.destination_address || 'Дархан'
                          }
                          originLat={ride.origin_lat}
                          originLng={ride.origin_lng}
                          destinationLat={ride.destination_lat}
                          destinationLng={ride.destination_lng}
                          className="w-full h-40 rounded-lg border"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}

        {activeTab === 'reviews' && (
          <>
            <h3 className="font-semibold text-lg">Сүүлийн үнэлгээнүүд</h3>
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Одоогоор үнэлгээ байхгүй байна
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.reviewer?.profile_photo} />
                        <AvatarFallback>
                          {review.reviewer?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {review.reviewer?.name || 'User'}
                          </span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-700">
                            {review.comment}
                          </p>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(review.created_at).toLocaleDateString(
                            'mn-MN',
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}

        {activeTab === 'vehicle' && (
          <>
            <h3 className="font-semibold text-lg">Машины мэдээлэл</h3>
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Машины мэдээлэл нэмэх
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
