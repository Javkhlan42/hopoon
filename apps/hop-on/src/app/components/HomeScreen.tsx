import React, { useState } from 'react';
import { Search, ChevronDown, User, Calendar, MapPin, Users, Shield, Leaf } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HomeScreenProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onSearch: () => void;
}

const mockTrips = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1571315742781-a6140d3a8bd5?w=400',
    from: 'Улаанбаатар',
    to: 'Дархан',
    date: '12-р сар',
    price: 18000,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1571315742781-a6140d3a8bd5?w=400',
    from: 'Улаанбаатар',
    to: 'Эрдэнэт',
    date: '12-р сар',
    price: 18000,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1571315742781-a6140d3a8bd5?w=400',
    from: 'Улаанбаатар',
    to: 'Өндөрхаан',
    date: '12-р сар',
    price: 18000,
  },
];

export function HomeScreen({ onSignIn, onSignUp, onSearch }: HomeScreenProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('1');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold" style={{ color: '#00AFF5' }}>HopOn</span>
              <span className="text-2xl">🚗</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Search className="w-5 h-5" />
                <span>Хайх</span>
              </button>
              <button className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
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
                  <DropdownMenuItem onClick={onSignIn}>
                    <User className="w-4 h-4 mr-2" />
                    Sign in
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onSignUp}>
                    <User className="w-4 h-4 mr-2" />
                    Sign up
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section 
        className="relative pt-24 pb-32 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1666061400079-e79dafaa8912?w=1600')`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Headline */}
          <h1 className="text-white text-4xl md:text-5xl font-bold text-center mb-12 drop-shadow-lg">
            Хямд үнээр мянга мянган чиглэлд машинаар үйлчлэх
          </h1>

          {/* Search Card */}
          <Card className="max-w-5xl mx-auto shadow-2xl">
            <CardContent className="p-8">
              {/* Search Grid */}
              <div className="grid md:grid-cols-5 gap-4 mb-4">
                {/* From */}
                <div className="md:col-span-1">
                  <Label htmlFor="from" className="text-sm text-gray-600 mb-2 block">Явах</Label>
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
                  <Label htmlFor="to" className="text-sm text-gray-600 mb-2 block">Очих газ байна</Label>
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
                  <Label htmlFor="date" className="text-sm text-gray-600 mb-2 block">Өнөөдөр</Label>
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
                  <Label htmlFor="passengers" className="text-sm text-gray-600 mb-2 block">1 өөрчл</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                    onClick={onSearch}
                    className="w-full h-14"
                    style={{ backgroundColor: '#00AFF5', color: 'white' }}
                  >
                    Хайх
                  </Button>
                </div>
              </div>

              {/* Quick Booking Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox id="quick" />
                <Label htmlFor="quick" className="cursor-pointer text-sm">
                  Шуурхай бүүлдэл
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Feature Icons */}
          <div className="max-w-5xl mx-auto mt-8 grid grid-cols-3 gap-6 text-white">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium drop-shadow">Баталгаат аюулгүй</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium drop-shadow">Олон мянган жолооч</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Leaf className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium drop-shadow">Эко найрсаг</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Trips Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Санал болгож буй аялуул</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {mockTrips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={trip.image} 
                    alt={`${trip.from} to ${trip.to}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="font-medium">{trip.from}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="font-medium">{trip.to}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{trip.date}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-2xl font-bold" style={{ color: '#00AFF5' }}>
                        ₮{trip.price.toLocaleString()}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-blue-50"
                      >
                        Дэлгэрэнгүй →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold" style={{ color: '#00AFF5' }}>HopOn</span>
                <span className="text-2xl">🚗</span>
              </div>
              <p className="text-gray-400 text-sm">
                Хямд үнээр, найдвартай, эко найрсаг замын үйлчилгээ
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold mb-4">Холбоосууд</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Бидний тухай</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Үйлчилгээний нөхцөл</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Нууцлалын бодлого</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold mb-4">Тусламж</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Түгээмэл асуулт</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Холбоо барих</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Аюулгүй байдал</a></li>
              </ul>
            </div>

            {/* Stats */}
            <div>
              <h3 className="font-bold mb-4">HopOn Систем</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>🚗 1000+ жолооч</li>
                <li>👥 5000+ зорчигч</li>
                <li>🌍 50+ чиглэл</li>
                <li>⭐ 4.8/5 үнэлгээ</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 HopOn. Бүх эрх хуулиар хамгаалагдсан.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}