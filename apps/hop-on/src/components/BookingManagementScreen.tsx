'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, MapPin, Calendar, Clock, Users, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface Booking {
  id: string;
  rideId: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  passengerPhoto?: string;
  seats: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  createdAt: string;
  ride?: {
    from: string;
    to: string;
    departureTime: string;
    pricePerSeat: number;
  };
}

interface BookingManagementScreenProps {
  onBack: () => void;
}

const BookingManagementScreen: React.FC<BookingManagementScreenProps> = ({ onBack }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.bookings.getDriverBookings();
      setBookings(response.bookings || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      toast.error('Захиалгууд татахад алдаа гарлаа');
      // Mock data for testing
      setBookings([
        {
          id: '1',
          rideId: 'ride-1',
          passengerId: 'user-1',
          passengerName: 'Дорж',
          passengerPhone: '+97699887766',
          seats: 2,
          status: 'pending',
          createdAt: new Date().toISOString(),
          ride: {
            from: 'Улаанбаатар',
            to: 'Дархан',
            departureTime: '2025-12-26T08:00:00Z',
            pricePerSeat: 18000,
          },
        },
        {
          id: '2',
          rideId: 'ride-1',
          passengerId: 'user-2',
          passengerName: 'Сарантуяа',
          passengerPhone: '+97699887767',
          seats: 1,
          status: 'pending',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          ride: {
            from: 'Улаанбаатар',
            to: 'Дархан',
            departureTime: '2025-12-26T08:00:00Z',
            pricePerSeat: 18000,
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId: string) => {
    try {
      await apiClient.bookings.approve(bookingId);
      toast.success('Захиалга зөвшөөрөгдлөө!');
      loadBookings();
    } catch (error) {
      console.error('Failed to approve booking:', error);
      toast.error('Захиалга зөвшөөрөхөд алдаа гарлаа');
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!rejectReason.trim()) {
      toast.error('Татгалзах шалтгаан оруулна уу');
      return;
    }

    try {
      await apiClient.bookings.reject(bookingId, rejectReason);
      toast.success('Захиалга татгалзагдлаа');
      setRejectingId(null);
      setRejectReason('');
      loadBookings();
    } catch (error) {
      console.error('Failed to reject booking:', error);
      toast.error('Захиалга татгалзахад алдаа гарлаа');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('mn-MN', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('mn-MN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Хүлээгдэж буй</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Зөвшөөрөгдсөн</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Татгалзсан</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500">Цуцлагдсан</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Дууссан</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const otherBookings = bookings.filter((b) => b.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-gray-500">Ачааллаж байна...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">Захиалгын удирдлага</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Pending Bookings */}
        {pendingBookings.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-yellow-600">
              Хүлээгдэж буй захиалгууд ({pendingBookings.length})
            </h2>
            <div className="space-y-3">
              {pendingBookings.map((booking) => (
                <Card key={booking.id} className="border-2 border-yellow-200">
                  <CardContent className="p-4">
                    {/* Passenger Info */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-lg">{booking.passengerName}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-sm text-gray-600">{booking.passengerPhone}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Ride Info */}
                    {booking.ride && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{booking.ride.from}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium">{booking.ride.to}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(booking.ride.departureTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{booking.seats} суудал</span>
                          </div>
                          <div className="font-semibold text-[#00AFF5]">
                            {(booking.ride.pricePerSeat * booking.seats).toLocaleString()}₮
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reject Reason Input */}
                    {rejectingId === booking.id && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          Татгалзах шалтгаан *
                        </label>
                        <Textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Жишээ нь: Суудал дүүрсэн, цаг тохиромжгүй гэх мэт..."
                          className="resize-none"
                          rows={3}
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {rejectingId === booking.id ? (
                        <>
                          <Button
                            onClick={() => handleReject(booking.id)}
                            variant="destructive"
                            className="flex-1"
                            disabled={!rejectReason.trim()}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Татгалзах
                          </Button>
                          <Button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason('');
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            Болих
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleApprove(booking.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Зөвшөөрөх
                          </Button>
                          <Button
                            onClick={() => setRejectingId(booking.id)}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Татгалзах
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Other Bookings */}
        {otherBookings.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">
              Бусад захиалгууд ({otherBookings.length})
            </h2>
            <div className="space-y-3">
              {otherBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{booking.passengerName}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {booking.seats} суудал • {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-center">Захиалга байхгүй байна</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManagementScreen;
