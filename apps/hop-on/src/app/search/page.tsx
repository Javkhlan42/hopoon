'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import {
  MapPin,
  Users,
  Star,
  Clock,
  Search,
  Car,
  User as UserIcon,
  MessageSquare,
} from 'lucide-react';
import apiClient from '../../lib/api';
import type { Ride } from '../../types';
import { formatCurrency, formatTime } from '../../lib/utils';
import { geocodeAddress } from '../../lib/geocoding';
import { RideMiniMap } from '../../components/RideMiniMap';
import { useDialog } from '../../components/DialogProvider';

// Helper function to extract array from various API response formats
function extractArray<T>(response: unknown, key: string): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  const data = response as Record<string, unknown>;

  if (data && typeof data === 'object') {
    if ('data' in data && Array.isArray(data.data)) {
      return data.data as T[];
    }
    if (key in data && Array.isArray(data[key])) {
      return data[key] as T[];
    }
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

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showAlert } = useDialog();

  const [origin, setOrigin] = useState(searchParams.get('origin') || '');
  const [destination, setDestination] = useState(
    searchParams.get('destination') || '',
  );
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [results, setResults] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [bookingRideId, setBookingRideId] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (origin && destination) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!origin || !destination) {
      showAlert('Хаанаас болон хаашаа хоёрыг оруулна уу');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const originGeo = await geocodeAddress(origin);
      const destinationGeo = await geocodeAddress(destination);

      if (!originGeo || !destinationGeo) {
        showAlert('Хаягийн мэдээлэл олдсонгүй');
        setLoading(false);
        return;
      }

      const searchApiParams = {
        originLat: originGeo.lat,
        originLng: originGeo.lng,
        destinationLat: destinationGeo.lat,
        destinationLng: destinationGeo.lng,
        maxRadius: 10,
      };

      const response = await apiClient.rides.search(searchApiParams);
      const data = response.data || response;
      const searchResults = extractArray<Ride>(data, 'rides');
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = async (rideId: string) => {
    try {
      setBookingRideId(rideId);
      await apiClient.bookings.create({ rideId, seats: 1 });
      showAlert('Суудал захиалга амжилттай илгээгдлээ!');
      handleSearch();
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || 'Алдаа гарлаа';
      showAlert(errorMessage);
    } finally {
      setBookingRideId(null);
    }
  };

  const timeFilters = [
    { label: 'Өглөө (06:00 - 12:00)', value: 'morning', icon: Clock },
    { label: 'Үдэс хойш (12:00 - 18:00)', value: 'afternoon', icon: Clock },
    { label: 'Орой (18:00 - 06:00)', value: 'evening', icon: Clock },
  ];

  const filteredResults = results.filter((ride) => {
    if (
      ride.price_per_seat < priceRange[0] ||
      ride.price_per_seat > priceRange[1]
    ) {
      return false;
    }

    if (selectedTimeFilter) {
      const hour = new Date(ride.departure_time).getHours();
      if (selectedTimeFilter === 'morning' && (hour < 6 || hour >= 12))
        return false;
      if (selectedTimeFilter === 'afternoon' && (hour < 12 || hour >= 18))
        return false;
      if (selectedTimeFilter === 'evening' && hour >= 6 && hour < 18)
        return false;
    }

    return true;
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Уншиж байна...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-6 h-6 text-cyan-500" />
              <span className="text-xl font-bold text-cyan-500">HopOn</span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-gray-700 hover:text-cyan-500 transition-colors"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Хайх</span>
              </button>
              <button
                onClick={() => router.push('/trips')}
                className="flex items-center gap-2 text-gray-700 hover:text-cyan-500 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="hidden sm:inline">Мессеж</span>
              </button>
              <button
                onClick={() => router.push('/create')}
                className="text-gray-700 hover:text-cyan-500 transition-colors"
              >
                Нийтлэх
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-10 h-11"
                placeholder="Явах"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-10 h-11"
                placeholder="Очих газар"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <Input
              type="date"
              className="h-11"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="h-11 bg-cyan-500 hover:bg-cyan-600"
            >
              {loading ? 'Хайж байна...' : 'Хайх'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="col-span-12 md:col-span-3 space-y-6">
            {/* Time Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Явах цаг</h3>
              <div className="space-y-3">
                {timeFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() =>
                      setSelectedTimeFilter(
                        selectedTimeFilter === filter.value ? '' : filter.value,
                      )
                    }
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                      selectedTimeFilter === filter.value
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <filter.icon className="w-5 h-5" />
                    <span className="text-sm">{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Үнэ</h3>
              <input
                type="range"
                min="0"
                max="150000"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className="w-full h-2 bg-cyan-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                <span>₮{priceRange[0].toLocaleString()}</span>
                <span>₮{priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right Content - Results */}
          <div className="col-span-12 md:col-span-9">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                Танд санал болгох аялалууд
              </h2>
              <p className="text-gray-600 text-sm">
                {filteredResults.length} аялал
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">
                Хайж байна...
              </div>
            ) : !searched ? (
              <div className="text-center py-12 text-gray-500">
                Хайх товчийг дарж аялал хайна уу
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Аялал олдсонгүй</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResults.map((ride) => (
                  <Card
                    key={ride.id}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {/* Left: Map */}
                        <div className="w-48 flex-shrink-0">
                          <RideMiniMap
                            originAddress={ride.origin_address}
                            destinationAddress={ride.destination_address}
                            originLat={ride.origin_lat}
                            originLng={ride.origin_lng}
                            destinationLat={ride.destination_lat}
                            destinationLng={ride.destination_lng}
                            className="w-full h-32 rounded-lg"
                          />
                        </div>

                        {/* Center: Info */}
                        <div className="flex-1 space-y-3">
                          {/* Time and Route */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                              <div>
                                <div className="text-2xl font-bold">
                                  {formatTime(ride.departure_time)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  4ч 10м
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                  <div className="flex-1 h-px bg-gray-300"></div>
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                                  <span>{ride.origin_address}</span>
                                  <span>{ride.destination_address}</span>
                                </div>
                              </div>
                              <div className="text-2xl font-bold">
                                {formatTime(
                                  new Date(
                                    new Date(ride.departure_time).getTime() +
                                      4 * 60 * 60 * 1000,
                                  ).toISOString(),
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Driver Info */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={ride.driver?.profile_photo} />
                                <AvatarFallback>
                                  {ride.driver?.name?.charAt(0) || 'D'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">
                                    {ride.driver?.name || 'Driver'}
                                  </span>
                                  <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-sm font-medium">
                                      {ride.driver?.rating?.toFixed(1) || '4.8'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                  2 сууддаг удэсэн
                                </div>
                              </div>
                            </div>

                            {/* Price and Action */}
                            <div className="text-right">
                              <div className="text-2xl font-bold text-cyan-500">
                                {formatCurrency(ride.price_per_seat)}
                              </div>
                              <Button
                                onClick={() => handleBookRide(ride.id)}
                                disabled={
                                  bookingRideId === ride.id ||
                                  ride.available_seats === 0
                                }
                                className="mt-2 bg-cyan-500 hover:bg-cyan-600 px-6"
                              >
                                {bookingRideId === ride.id
                                  ? 'Захиалж байна...'
                                  : ride.available_seats === 0
                                    ? 'Дүүрсэн'
                                    : 'Дэлгэрэнгүй үзэх'}
                              </Button>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-yellow-50 text-yellow-700 border-yellow-200"
                            >
                              ⚡ Баталгаажсан
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              ⚡ Алдартай
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
