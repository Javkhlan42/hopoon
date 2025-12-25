import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MapPin,
  User,
  CheckCircle,
  ChevronDown,
  Calendar,
  Users2,
  Clock,
  Star,
  MessageCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { RideCardMap } from './RideCardMap';
import { apiClient, Ride as ApiRide } from '../../lib/api';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface RideFeedScreenProps {
  userRole: 'driver' | 'passenger';
  onCreateRide: () => void;
  onSearchRide: () => void;
  onJoinRide: (rideId: string) => void;
  onChat: (rideId: string) => void;
  onProfile: () => void;
  onStartTracking?: () => void;
}

interface Ride {
  id: string;
  driverName: string;
  driverPhoto: string;
  driverRating: number;
  verified: boolean;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seatsAvailable: number;
  totalSeats: number;
  popular?: boolean;
  origin: {
    lat: number;
    lng: number;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
}

export function RideFeedScreen({
  userRole,
  onCreateRide,
  onSearchRide,
  onJoinRide,
  onChat,
  onProfile,
  onStartTracking,
}: RideFeedScreenProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch rides from backend
  useEffect(() => {
    const fetchRides = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.rides.list({ status: 'active' });

        // Backend returns { data: [], total: number } format
        const ridesData = response.data?.data || response.data?.rides || [];

        if (ridesData.length > 0) {
          // Transform API rides to component format
          const transformedRides: Ride[] = ridesData.map((apiRide: any) => ({
            id: apiRide.id,
            driverName: apiRide.driver?.name || 'Driver',
            driverPhoto:
              'https://images.unsplash.com/photo-1758525747638-25563afc9ff5?w=200',
            driverRating: apiRide.driver?.rating || 4.5,
            verified: apiRide.driver?.verified || false,
            from:
              apiRide.origin_address || apiRide.origin?.address || 'Unknown',
            to:
              apiRide.destination_address ||
              apiRide.destination?.address ||
              'Unknown',
            departureTime: new Date(
              apiRide.departure_time || apiRide.departureTime,
            ).toLocaleTimeString('mn-MN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            arrivalTime: '', // Calculate based on distance/duration
            duration: '4ц 00м', // Default duration
            price: apiRide.price_per_seat || apiRide.pricePerSeat,
            seatsAvailable: apiRide.available_seats || apiRide.availableSeats,
            totalSeats: apiRide.available_seats || apiRide.availableSeats,
            popular: false,
            origin: {
              lat: apiRide.origin_lat || apiRide.origin?.lat,
              lng: apiRide.origin_lng || apiRide.origin?.lng,
              address:
                apiRide.origin_address || apiRide.origin?.address || 'Unknown',
            },
            destination: {
              lat: apiRide.destination_lat || apiRide.destination?.lat,
              lng: apiRide.destination_lng || apiRide.destination?.lng,
              address:
                apiRide.destination_address ||
                apiRide.destination?.address ||
                'Unknown',
            },
          }));

          setRides(transformedRides);
          setFilteredRides(transformedRides);
        } else {
          // No rides from backend, use empty array
          setRides([]);
          setFilteredRides([]);
        }
      } catch (error: any) {
        console.error('Failed to fetch rides:', error);
        toast.error('Зорчилт татахад алдаа гарлаа');
        // Use empty array if fetch fails
        setRides([]);
        setFilteredRides([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRides();
  }, []);

  // Filter rides based on price and time
  const applyFilters = () => {
    let filtered = rides.filter(
      (ride) => ride.price >= priceRange[0] && ride.price <= priceRange[1],
    );

    if (timeFilter) {
      filtered = filtered.filter((ride) => {
        const hour = parseInt(ride.departureTime.split(':')[0]);
        switch (timeFilter) {
          case 'morning':
            return hour >= 6 && hour < 12;
          case 'afternoon':
            return hour >= 12 && hour < 18;
          case 'evening':
            return hour >= 18 || hour < 6;
          default:
            return true;
        }
      });
    }

    setFilteredRides(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [priceRange, timeFilter]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold" style={{ color: '#00AFF5' }}>
                HopOn
              </span>
              <span className="text-2xl">🚗</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Search className="w-5 h-5" />
                <span>Хайх</span>
              </button>
              <button
                onClick={() => onChat('')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Мессеж</span>
              </button>
              <button
                onClick={onCreateRide}
                className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Нийтлэх
              </button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={onProfile}>
                    <User className="w-4 h-4 mr-2" />
                    Миний профайл
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Гарах
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Search Card */}
          <Card className="max-w-5xl mx-auto shadow-2xl">
            <CardContent className="p-8">
              {/* Search Grid */}
              <div className="grid md:grid-cols-5 gap-4 mb-4">
                {/* From */}
                <div className="md:col-span-1">
                  <Label
                    htmlFor="from"
                    className="text-sm text-gray-600 mb-2 block"
                  >
                    Явах
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="from"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="Улаанбаатар"
                      className="pl-10 h-14 border-2"
                    />
                  </div>
                </div>

                {/* To */}
                <div className="md:col-span-1">
                  <Label
                    htmlFor="to"
                    className="text-sm text-gray-600 mb-2 block"
                  >
                    Очих газар
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="to"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="Дархан"
                      className="pl-10 h-14 border-2"
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="md:col-span-1">
                  <Label
                    htmlFor="date"
                    className="text-sm text-gray-600 mb-2 block"
                  >
                    Өнөөдөр
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="pl-10 h-14 border-2"
                    />
                  </div>
                </div>

                {/* Passengers */}
                <div className="md:col-span-1">
                  <Label
                    htmlFor="passengers"
                    className="text-sm text-gray-600 mb-2 block"
                  >
                    Зорчигч
                  </Label>
                  <div className="relative">
                    <Users2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="passengers"
                      type="number"
                      min="1"
                      max="8"
                      value={passengers}
                      onChange={(e) => setPassengers(e.target.value)}
                      className="pl-10 h-14 border-2"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <div className="md:col-span-1 flex items-end">
                  <Button
                    onClick={onSearchRide}
                    className="w-full h-14"
                    style={{ backgroundColor: '#00AFF5', color: 'white' }}
                  >
                    Хайх
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            {/* Time Filter */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Явах цаг</h3>
                <div className="space-y-2">
                  <button
                    onClick={() =>
                      setTimeFilter(timeFilter === 'morning' ? null : 'morning')
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      timeFilter === 'morning'
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Clock className="w-4 h-4 inline mr-2" />
                    Өглөө (06:00 - 12:00)
                  </button>
                  <button
                    onClick={() =>
                      setTimeFilter(
                        timeFilter === 'afternoon' ? null : 'afternoon',
                      )
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      timeFilter === 'afternoon'
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Clock className="w-4 h-4 inline mr-2" />
                    Үдээс хойш (12:00 - 18:00)
                  </button>
                  <button
                    onClick={() =>
                      setTimeFilter(timeFilter === 'evening' ? null : 'evening')
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      timeFilter === 'evening'
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Clock className="w-4 h-4 inline mr-2" />
                    Орой (18:00 - 06:00)
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Price Filter */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Үнэ</h3>
                <Slider
                  min={0}
                  max={50000}
                  step={1000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mb-4"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>₮{priceRange[0].toLocaleString()}</span>
                  <span>₮{priceRange[1].toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Filters */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Олон нийтийн бүлэг</h3>
                <div className="space-y-2">
                  <Badge
                    variant="secondary"
                    className="w-full justify-start cursor-pointer hover:bg-gray-100"
                  >
                    <CheckCircle
                      className="w-4 h-4 mr-2"
                      style={{ color: '#00AFF5' }}
                    />
                    Баталгаажсан
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="w-full justify-start cursor-pointer hover:bg-gray-100"
                  >
                    💼 Ажлын нөхөд
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="w-full justify-start cursor-pointer hover:bg-gray-100"
                  >
                    🎓 Оюутнууд
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="w-full justify-start cursor-pointer hover:bg-gray-100"
                  >
                    👩 Эмэгтэйчүүд
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rides List */}
          <div className="space-y-4">
            {/* Results header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Танд санал болгох аялалууд</h2>
              <span className="text-sm text-gray-600">
                {filteredRides.length} аялал
              </span>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-gray-600">Зорчилт татаж байна...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredRides.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="text-6xl">🚗</div>
                <h3 className="text-xl font-semibold text-gray-700">
                  Зорчилт олдсонгүй
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  Одоогоор таны хайлтад тохирох зорчилт байхгүй байна. Өөр цаг
                  эсвэл чиглэлээр хайж үзнэ үү.
                </p>
                {userRole === 'driver' && (
                  <Button onClick={onCreateRide} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Зорчилт үүсгэх
                  </Button>
                )}
              </div>
            )}

            {/* Ride Cards */}
            {!isLoading && filteredRides.length > 0 && (
              <div className="space-y-3">
                {filteredRides.map((ride) => (
                  <Card
                    key={ride.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        {/* Map Section */}
                        <div className="w-48 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                          <RideCardMap
                            origin={ride.origin}
                            destination={ride.destination}
                          />
                        </div>

                        {/* Main Content */}
                        <div className="flex items-center justify-between flex-1">
                          {/* Left: Time and Route */}
                          <div className="flex items-center gap-6 flex-1">
                            {/* Departure Time */}
                            <div className="text-center">
                              <div className="text-xl font-bold">
                                {ride.departureTime}
                              </div>
                              <div className="text-xs text-gray-500">
                                {ride.duration}
                              </div>
                            </div>

                            {/* Route Visualization */}
                            <div className="flex-1 max-w-xs">
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <div className="text-sm font-medium mb-1">
                                    {ride.from}
                                  </div>
                                  <div className="h-px bg-gray-300 relative">
                                    <div
                                      className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                                      style={{ backgroundColor: '#00AFF5' }}
                                    ></div>
                                    <div
                                      className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                                      style={{ backgroundColor: '#00AFF5' }}
                                    ></div>
                                  </div>
                                  <div className="text-sm font-medium mt-1">
                                    {ride.to}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Arrival Time */}
                            <div className="text-center">
                              <div className="text-xl font-bold">
                                {ride.arrivalTime}
                              </div>
                            </div>
                          </div>

                          {/* Middle: Driver Info */}
                          <div className="flex items-center gap-3 px-6">
                            <Avatar className="w-10 h-10">
                              <AvatarImage
                                src={ride.driverPhoto}
                                alt={ride.driverName}
                              />
                              <AvatarFallback>
                                {ride.driverName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">
                                {ride.driverName}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{ride.driverRating}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Price and Seats */}
                          <div className="text-right">
                            <div
                              className="text-2xl font-bold"
                              style={{ color: '#00AFF5' }}
                            >
                              ₮{ride.price.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {ride.seatsAvailable > 0 ? (
                                <span className="text-green-600">
                                  {ride.seatsAvailable} суудал үлдсэн
                                </span>
                              ) : (
                                <span className="text-red-600 font-medium">
                                  Дүүрсэн
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Баталгаажсан
                          </Badge>
                          {ride.popular && (
                            <Badge className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              ⚡ Алдартай
                            </Badge>
                          )}
                        </div>
                        <Button
                          onClick={() => onJoinRide(ride.id)}
                          disabled={ride.seatsAvailable === 0}
                          style={{
                            backgroundColor:
                              ride.seatsAvailable > 0 ? '#00AFF5' : '#ccc',
                            color: 'white',
                          }}
                        >
                          Дэлгэрэнгүй үзэх
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Load More */}
            {!isLoading && filteredRides.length > 0 && (
              <div className="text-center py-6">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8"
                >
                  Цааш үзэх
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating action button for mobile */}
      {userRole === 'driver' && (
        <div className="fixed bottom-6 right-6 md:hidden">
          <Button
            onClick={onCreateRide}
            size="lg"
            className="rounded-full w-14 h-14 p-0 shadow-2xl"
            style={{ backgroundColor: '#00AFF5', color: 'white' }}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
