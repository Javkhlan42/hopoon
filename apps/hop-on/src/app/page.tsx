'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Clock,
  Users,
  Filter,
  Heart,
  MessageCircle,
  Car,
  Calendar,
} from 'lucide-react';
import apiClient from '../lib/api';
import type { Ride } from '../types';
import { formatCurrency, formatTime } from '../lib/utils';
import { RideMiniMap } from '../components/RideMiniMap';

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
      if (
        nestedData &&
        typeof nestedData === 'object' &&
        key in nestedData &&
        Array.isArray(nestedData[key])
      ) {
        return nestedData[key] as T[];
      }
    }
  }

  return [];
}

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('Бүгд');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRides();
    }
  }, [isAuthenticated]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const response = await apiClient.rides.list({
        status: 'active',
        limit: 20,
      });
      console.log('Rides API Response:', response);
      const data = response.data || response;
      console.log('Data extracted:', data);

      const ridesData = extractArray<Ride>(data, 'data');
      console.log('Rides array:', ridesData);
      console.log('Setting rides state with', ridesData.length, 'items');
      setRides(ridesData);
    } catch (error) {
      console.error('Failed to fetch rides:', error);
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRide = async (rideId: string) => {
    try {
      await apiClient.bookings.create({ rideId, seats: 1 });
      alert('Суудал захиалга амжилттай илгээгдлээ!');
      fetchRides();
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || 'Алдаа гарлаа';

      // User-friendly error messages
      if (errorMessage.includes('already have a pending booking')) {
        alert('Та энэ аялалд аль хэдийн захиалга үүсгэсэн байна');
      } else if (errorMessage.includes('not enough seats')) {
        alert('Суудал дүүрсэн байна');
      } else {
        alert(errorMessage);
      }
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Уншиж байна...</div>
      </div>
    );
  }

  const filters = ['Бүгд', 'УБ', 'Дархан', 'Эрдэнэт'];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold">Аялалын Пост</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-5 h-5" />
              <span className="sr-only">Шүүх</span>
            </button>
            {user?.role === 'driver' && (
              <Button
                onClick={() => router.push('/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 h-9"
              >
                + Пост нэмэх
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                selectedFilter === filter
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Уншиж байна...</div>
        ) : rides.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">
              Одоогоор идэвхтэй аялал байхгүй байна
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <Card key={ride.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-row gap-6 items-stretch">
                    {/* Left: Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Driver Info */}
                      <div className="flex items-start gap-3 mb-2">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={ride.driver?.profile_photo} />
                          <AvatarFallback className="bg-gray-200">
                            {ride.driver?.name?.charAt(0) || 'J'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              {ride.driver?.name || 'Driver'}
                            </span>
                            {ride.driver?.verified && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0">
                                ⭐ {ride.driver.rating?.toFixed(1) || '4.8'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            127 аялал • 2 цаг өмнө
                          </p>
                        </div>
                      </div>

                      {/* Route */}
                      <div className="space-y-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="font-medium text-sm">
                            {ride.origin_address}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="font-medium text-sm">
                            {ride.destination_address}
                          </span>
                        </div>
                      </div>

                      {/* Trip Details */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(ride.departure_time).toLocaleDateString(
                              'mn-MN',
                              { month: '2-digit', day: '2-digit' },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTime(ride.departure_time)}</span>
                        </div>
                        {ride.vehicle_type && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Car className="w-3.5 h-3.5" />
                            <span>{ride.vehicle_type}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Users className="w-3.5 h-3.5" />
                          <span>{ride.available_seats}/4 суудал</span>
                        </div>
                      </div>

                      {/* Notes */}
                      {ride.notes && (
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                          {ride.notes}
                        </p>
                      )}

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(ride.price_per_seat)}
                        </div>
                        <div className="flex items-center gap-3">
                          {ride.available_seats === 0 ? (
                            <Badge className="bg-gray-900 text-white px-3 py-1">
                              Суудал бүлэн
                            </Badge>
                          ) : (
                            user?.role === 'passenger' && (
                              <Button
                                onClick={() => handleJoinRide(ride.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm"
                              >
                                Суудал захиалах
                              </Button>
                            )
                          )}
                        </div>
                      </div>

                      {/* Engagement Stats */}
                      <div className="flex items-center gap-4 mt-2 pt-2 border-t">
                        <button className="flex items-center gap-1.5 text-gray-600 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">12</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-gray-600 hover:text-blue-500 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">5</span>
                        </button>
                      </div>
                    </div>
                    {/* Right: Mini Map */}
                    <div className="w-64 flex-shrink-0 flex items-center justify-center">
                      <RideMiniMap
                        originAddress={ride.origin_address}
                        destinationAddress={ride.destination_address}
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
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
