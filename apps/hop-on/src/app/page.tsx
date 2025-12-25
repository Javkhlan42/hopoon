'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  MapPin,
  Calendar,
  Users,
  Shield,
  User as UserIcon,
  Leaf,
  Search,
  Car,
  MessageSquare,
} from 'lucide-react';
import { useDialog } from '../components/DialogProvider';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { showAlert } = useDialog();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSearch = () => {
    if (!origin || !destination) {
      showAlert('Хаанаас болон хаашаа хоёрыг оруулна уу');
      return;
    }
    router.push(
      `/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${date}&passengers=${passengers}`,
    );
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Уншиж байна...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
                onClick={() => router.push('/search')}
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

      {/* Hero Section */}
      <div className="relative min-h-[600px] flex items-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600)',
            filter: 'brightness(0.7)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Хямд үнээр мянга мянган чиглэлд машинаар үйлчлэх
            </h1>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Origin */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Явах
                </label>
                <Input
                  placeholder="Улаанбаатар"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="h-12 border-gray-300 focus:border-cyan-500"
                />
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Очих газ байна
                </label>
                <Input
                  placeholder="Дархан"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="h-12 border-gray-300 focus:border-cyan-500"
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Өнөөдөр
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12 border-gray-300 focus:border-cyan-500"
                />
              </div>

              {/* Passengers */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Users className="w-4 h-4" />1 өөрөл
                </label>
                <Input
                  type="number"
                  min="1"
                  max="8"
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="h-12 border-gray-300 focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Round Trip Checkbox */}
            <div className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                id="roundTrip"
                checked={isRoundTrip}
                onChange={(e) => setIsRoundTrip(e.target.checked)}
                className="w-4 h-4 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
              />
              <label htmlFor="roundTrip" className="text-sm text-gray-700">
                Шуурхай буулдал
              </label>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="w-full h-14 bg-cyan-500 hover:bg-cyan-600 text-white font-medium text-lg rounded-xl"
            >
              Хайх
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Баталгаат аюулгүй</h3>
            <p className="text-gray-600">
              Хэрэглэгчийн баталгаажсан профайл, үнэлгээ, сэтгэгдэл
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Олон мянган хөлөөч</h3>
            <p className="text-gray-600">
              Та хүссэн газраа хүрэхийн тулд олон жолооч байдаг
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Эко найрсаг</h3>
            <p className="text-gray-600">
              Нэг машинд олон хүн зорчих нь байгаль орчинд ээлтэй
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
