'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '../../components/BottomNav';
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
  Calendar,
  Users,
  Star,
  ArrowLeft,
  SlidersHorizontal,
} from 'lucide-react';
import apiClient from '../../lib/api';
import type { Ride } from '../../types';
import { formatCurrency, formatTime, formatDate } from '../../lib/utils';
import { geocodeAddress } from '../../lib/geocoding';
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
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [results, setResults] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [bookingRideId, setBookingRideId] = useState<string | null>(null);

  const handleSearch = async () => {
    console.log('=== SEARCH STARTED ===');
    console.log('Origin input:', origin);
    console.log('Destination input:', destination);

    if (!origin || !destination) {
      alert('Хаанаас болон хаашаа хоёрыг оруулна уу');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // Geocode addresses to get coordinates
      console.log('Starting geocoding...');
      const originGeo = await geocodeAddress(origin);
      console.log('Origin geocoded:', originGeo);

      const destinationGeo = await geocodeAddress(destination);
      console.log('Destination geocoded:', destinationGeo);

      if (!originGeo) {
        console.error('Origin geocoding failed');
        alert('Эхлэх газрын хаяг олдсонгүй. Дахин оролдоно уу');
        setLoading(false);
        return;
      }

      if (!destinationGeo) {
        console.error('Destination geocoding failed');
        alert('Очих газрын хаяг олдсонгүй. Дахин оролдоно уу');
        setLoading(false);
        return;
      }

      const searchParams = {
        originLat: originGeo.lat,
        originLng: originGeo.lng,
        destinationLat: destinationGeo.lat,
        destinationLng: destinationGeo.lng,
        maxRadius: 10,
      };

      console.log('Search API request params:', searchParams);

      const response = await apiClient.rides.search(searchParams);
      console.log('Search API response:', response);

      const data = response.data || response;
      console.log('Data after extraction:', data);

      const searchResults = extractArray<Ride>(data, 'rides');

      console.log('Search results count:', searchResults.length);
      console.log('Search results:', searchResults);

      setResults(searchResults);
      console.log('=== SEARCH COMPLETED ===');
    } catch (error) {
      console.error('=== SEARCH FAILED ===');
      console.error('Error details:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = async (rideId: string) => {
    try {
      setBookingRideId(rideId);
      console.log('Booking ride:', rideId);

      await apiClient.bookings.create({
        rideId,
        seats: 1,
      });

      alert('Суудал захиалга амжилттай илгээгдлээ!');

      // Refresh search results to update available seats
      handleSearch();
    } catch (error: unknown) {
      console.error('Booking failed:', error);
      const errorMessage = (error as Error).message || 'Алдаа гарлаа';

      // User-friendly error messages
      if (errorMessage.includes('already have a pending booking')) {
        alert('Та энэ аялалд аль хэдийн захиалга үүсгэсэн байна');
      } else if (errorMessage.includes('not enough seats')) {
        alert('Суудал дүүрсэн байна');
      } else if (errorMessage.includes('cannot book your own ride')) {
        alert('Та өөрийн аялалд захиалга үүсгэж болохгүй');
      } else {
        alert(errorMessage);
      }
    } finally {
      setBookingRideId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Аялал хайх</h1>
          </div>

          {/* Search Inputs */}
          <div className="space-y-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
              <Input
                className="pl-10"
                placeholder="Хаанаас (жишээ: Улаанбаатар)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
              <Input
                className="pl-10"
                placeholder="Хаашаа (жишээ: Дархан)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSearch}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Хайж байна...' : 'Хайх'}
            </Button>
          </div>
        </div>
      </header>

      {/* Results */}
      <main className="px-4 py-4">
        {loading ? (
          <div className="text-center py-8">Хайж байна...</div>
        ) : !searched ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Хайлт хийнэ үү</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">5 аялал олдсоноос</p>
            <p className="text-sm text-gray-400 mt-2">
              Шүүлтүүрийг өөрчилж үзнэ үү
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 mb-3">
              {results.length} аялал олдлоо
            </div>

            {results.map((ride) => (
              <Card
                key={ride.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex flex-row gap-6 items-stretch">
                    {/* Left: Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Driver Info */}
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={ride.driver?.profile_photo} />
                          <AvatarFallback>
                            {ride.driver?.name?.charAt(0) || 'J'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {ride.driver?.name || 'Driver'}
                            </span>
                            {ride.driver?.verified && (
                              <Badge variant="secondary" className="text-xs">
                                ⭐ {ride.driver.rating?.toFixed(1) || '4.8'}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {ride.driver?.verified
                              ? '127 аялал'
                              : 'Шинэ жолооч'}
                          </div>
                        </div>
                      </div>

                      {/* Route */}
                      <div className="space-y-2 mb-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="font-medium">
                            {ride.origin_address}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="font-medium">
                            {ride.destination_address}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                        <span>
                          {formatDate(ride.departure_time)} •{' '}
                          {formatTime(ride.departure_time)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {ride.available_seats} суудал
                        </span>
                      </div>

                      {ride.notes && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                          {ride.notes}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(ride.price_per_seat)}
                        </div>
                        <div className="flex gap-2">
                          {ride.available_seats > 0 ? (
                            <Button
                              size="sm"
                              onClick={() => handleBookRide(ride.id)}
                              className="bg-green-600 hover:bg-green-700"
                              disabled={bookingRideId === ride.id}
                            >
                              {bookingRideId === ride.id
                                ? 'Захиалж байна...'
                                : 'Захиалах'}
                            </Button>
                          ) : (
                            <Badge variant="secondary" className="px-3 py-1">
                              Дүүрсэн
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/rides/${ride.id}`)}
                          >
                            Дэлгэрэнгүй
                          </Button>
                        </div>
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
