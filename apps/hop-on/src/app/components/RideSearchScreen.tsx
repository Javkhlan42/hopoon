import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, ArrowRight, Users2, Clock, Star, ChevronDown, User, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import api from '../../lib/api';
import { toast } from 'sonner';

interface RideSearchScreenProps {
  onBack: () => void;
  onJoinRide: (rideId: string) => void;
  onChat: (rideId: string) => void;
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
}

const mockRides: Ride[] = [
  {
    id: '1',
    driverName: 'Batmunkh',
    driverPhoto: 'https://images.unsplash.com/photo-1758525747638-25563afc9ff5?w=200',
    driverRating: 4.8,
    verified: true,
    from: 'Улаанбаатар',
    to: 'Дархан',
    departureTime: '14:20',
    arrivalTime: '18:30',
    duration: '4ц 10м',
    price: 18000,
    seatsAvailable: 2,
    totalSeats: 4,
    popular: true,
  },
  {
    id: '2',
    driverName: 'Oyunaa',
    driverPhoto: 'https://images.unsplash.com/photo-1761666519860-6279e707e2c6?w=200',
    driverRating: 5.0,
    verified: true,
    from: 'Улаанбаатар',
    to: 'Дархан',
    departureTime: '12:40',
    arrivalTime: '16:45',
    duration: '4ц 05м',
    price: 15000,
    seatsAvailable: 3,
    totalSeats: 4,
  },
  {
    id: '3',
    driverName: 'Dorj',
    driverPhoto: 'https://images.unsplash.com/photo-1758525747638-25563afc9ff5?w=200',
    driverRating: 4.5,
    verified: true,
    from: 'Улаанбаатар',
    to: 'Дархан',
    departureTime: '15:00',
    arrivalTime: '19:30',
    duration: '4ц 30м',
    price: 20000,
    seatsAvailable: 1,
    totalSeats: 3,
  },
  {
    id: '4',
    driverName: 'Enkhjin',
    driverPhoto: 'https://images.unsplash.com/photo-1758525747638-25563afc9ff5?w=200',
    driverRating: 4.9,
    verified: true,
    from: 'Улаанбаатар',
    to: 'Дархан',
    departureTime: '17:00',
    arrivalTime: '21:15',
    duration: '4ц 15м',
    price: 17000,
    seatsAvailable: 4,
    totalSeats: 4,
  },
];

export function RideSearchScreen({ onBack, onJoinRide, onChat }: RideSearchScreenProps) {
  const [from, setFrom] = useState('Улаанбаатар');
  const [to, setTo] = useState('Дархан');
  const [date, setDate] = useState('2024-12-23');
  const [passengers, setPassengers] = useState('1');
  const [selectedTab, setSelectedTab] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [filteredRides, setFilteredRides] = useState(mockRides);
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<any>(null);

  // API ашиглан зорчилт хайх
  const searchRides = async () => {
    // Coordinates - жишээ нь Улаанбаатар -> Дархан
    // TODO: Geocoding API ашиглан хаягаас coordinate олох
    const originLat = 47.9184;
    const originLng = 106.9177;
    const destinationLat = 49.4871;
    const destinationLng = 105.9057;

    setLoading(true);
    try {
      const response = await api.rides.search({
        originLat,
        originLng,
        destinationLat,
        destinationLng,
        seats: parseInt(passengers),
        page: 1,
        limit: 20,
      });

      if (response.success && response.data) {
        const formattedRides = response.data.rides.map((ride: any) => ({
          id: ride.id,
          driverName: ride.driver?.name || 'Unknown',
          driverPhoto: 'https://images.unsplash.com/photo-1758525747638-25563afc9ff5?w=200',
          driverRating: ride.driver?.rating || 4.5,
          verified: ride.driver?.verified || false,
          from: ride.origin.address || from,
          to: ride.destination.address || to,
          departureTime: new Date(ride.departureTime).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }),
          arrivalTime: '',
          duration: '',
          price: ride.pricePerSeat,
          seatsAvailable: ride.availableSeats,
          totalSeats: ride.availableSeats + (ride.bookings?.length || 0),
          popular: false,
        }));
        setRides(formattedRides);
        setFilteredRides(formattedRides);
        toast.success(`${formattedRides.length} зорчилт олдлоо`);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error('Зорчилт хайхад алдаа гарлаа');
      setFilteredRides(mockRides);
    } finally {
      setLoading(false);
    }
  };

  // Component ачаалагдахад болон search параметер өөрчлөгдөхөд хайх
  useEffect(() => {
    if (from && to) {
      searchRides();
    }
  }, []); // Анх удаа л 1 удаа хайх

  // Filter rides based on price and time
  const applyFilters = () => {
    const dataSource = rides.length > 0 ? rides : mockRides;
    let filtered = dataSource.filter(ride => 
      ride.price >= priceRange[0] && ride.price <= priceRange[1]
    );

    if (timeFilter) {
      filtered = filtered.filter(ride => {
        const hour = parseInt(ride.departureTime.split(':')[0]);
        switch (timeFilter) {
          case 'morning': return hour >= 6 && hour < 12;
          case 'afternoon': return hour >= 12 && hour < 18;
          case 'evening': return hour >= 18 || hour < 6;
          default: return true;
        }
      });
    }

    setFilteredRides(filtered);
  };

  React.useEffect(() => {
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
              <span className="text-2xl font-bold" style={{ color: '#00AFF5' }}>HopOn</span>
              <span className="text-2xl">🚗</span>
            </div>

            {/* Profile */}
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
                <DropdownMenuItem onClick={onBack}>
                  <X className="w-4 h-4 mr-2" />
                  Close
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Compact Search Bar */}
          <div className="mt-4 flex items-center gap-3 bg-white border-2 rounded-lg p-3">
            <div className="flex items-center gap-2 flex-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <input 
                value={from} 
                onChange={(e) => setFrom(e.target.value)}
                className="border-none outline-none bg-transparent text-sm flex-1"
              />
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-400" />
            
            <div className="flex items-center gap-2 flex-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <input 
                value={to} 
                onChange={(e) => setTo(e.target.value)}
                className="border-none outline-none bg-transparent text-sm flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Өнөөдөр</span>
            </div>

            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{passengers} зорчигч</span>
            </div>

            <Button 
              size="sm"
              style={{ backgroundColor: '#00AFF5', color: 'white' }}
            >
              Хайх
            </Button>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTab === 'all' 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Бүгд · {mockRides.length}
            </button>
            <button 
              onClick={() => setSelectedTab('carpool')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                selectedTab === 'carpool' 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🚗 Машин · {mockRides.length}
            </button>
            <button 
              onClick={() => setSelectedTab('bus')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                selectedTab === 'bus' 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🚌 Автобус · 0
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            {/* Time Filter */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Явах цаг</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => setTimeFilter(timeFilter === 'morning' ? null : 'morning')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      timeFilter === 'morning' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Clock className="w-4 h-4 inline mr-2" />
                    Өглөө (06:00 - 12:00)
                  </button>
                  <button 
                    onClick={() => setTimeFilter(timeFilter === 'afternoon' ? null : 'afternoon')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      timeFilter === 'afternoon' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Clock className="w-4 h-4 inline mr-2" />
                    Үдээс хойш (12:00 - 18:00)
                  </button>
                  <button 
                    onClick={() => setTimeFilter(timeFilter === 'evening' ? null : 'evening')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      timeFilter === 'evening' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
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
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Results header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg">
                Өнөөдөр · Улаанбаатар → Дархан
              </h2>
              <span className="text-sm text-gray-600">{filteredRides.length} аялал олдсон</span>
            </div>

            {/* Popular notice */}
            {filteredRides.some(r => r.popular) && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  ⚡
                </div>
                <div>
                  <p className="font-medium text-blue-900">Түгээмэл аялал! Шуурхай захиалга хийнэ үү.</p>
                  <p className="text-sm text-blue-700">Аялалуудын 60% аль хэдийн захиалагдсан</p>
                </div>
              </div>
            )}

            {/* Ride Cards */}
            <div className="space-y-3">
              {filteredRides.map((ride) => (
                <Card key={ride.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      {/* Left: Time and Route */}
                      <div className="flex items-center gap-6 flex-1">
                        {/* Time */}
                        <div className="text-center">
                          <div className="text-xl font-bold">{ride.departureTime}</div>
                          <div className="text-xs text-gray-500">{ride.duration}</div>
                        </div>

                        {/* Route Visualization */}
                        <div className="flex-1 max-w-xs">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="text-sm font-medium mb-1">{ride.from}</div>
                              <div className="h-px bg-gray-300 relative">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500"></div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500"></div>
                              </div>
                              <div className="text-sm font-medium mt-1">{ride.to}</div>
                            </div>
                          </div>
                        </div>

                        {/* Time display */}
                        <div className="text-center">
                          <div className="text-xl font-bold">{ride.arrivalTime}</div>
                        </div>
                      </div>

                      {/* Middle: Driver Info */}
                      <div className="flex items-center gap-3 px-6">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={ride.driverPhoto} alt={ride.driverName} />
                          <AvatarFallback>{ride.driverName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{ride.driverName}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{ride.driverRating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Price and Seats */}
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: '#00AFF5' }}>
                          ₮{ride.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {ride.seatsAvailable > 0 ? (
                            <span className="text-green-600">
                              {ride.seatsAvailable} суудал үлдсэн
                            </span>
                          ) : (
                            <span className="text-red-600 font-medium">Дүүрсэн</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
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
                          backgroundColor: ride.seatsAvailable > 0 ? '#00AFF5' : '#ccc',
                          color: 'white' 
                        }}
                      >
                        Дэлгэрэнгүй үзэх
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}