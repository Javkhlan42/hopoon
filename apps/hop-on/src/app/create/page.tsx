'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { BottomNav } from '../../components/BottomNav';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import apiClient from '../../lib/api';
import { geocodeAddress } from '../../lib/geocoding';
import { useDialog } from '../../components/DialogProvider';

export default function CreateRidePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showAlert } = useDialog();
  const [loading, setLoading] = useState(false);

  // Set default date to tomorrow and time to 9:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    originAddress: '',
    destinationAddress: '',
    departureDate: tomorrowStr,
    departureTime: '09:00',
    seats: '4',
    price: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.originAddress.trim()) {
      showAlert('Эхлэх газраа оруулна уу');
      return;
    }
    if (!formData.destinationAddress.trim()) {
      showAlert('Очих газраа оруулна уу');
      return;
    }
    if (!formData.price || parseInt(formData.price) <= 0) {
      showAlert('Үнэ оруулна уу');
      return;
    }

    setLoading(true);

    try {
      // Geocode addresses to get coordinates
      const originGeo = await geocodeAddress(formData.originAddress);
      const destinationGeo = await geocodeAddress(formData.destinationAddress);

      if (!originGeo) {
        showAlert('Эхлэх газрын хаяг олдсонгүй. Дахин оролдоно уу');
        setLoading(false);
        return;
      }

      if (!destinationGeo) {
        showAlert('Очих газрын хаяг олдсонгүй. Дахин оролдоно уу');
        setLoading(false);
        return;
      }

      const departureDateTime = new Date(
        `${formData.departureDate}T${formData.departureTime}`,
      );

      const rideData = {
        origin: {
          lat: originGeo.lat,
          lng: originGeo.lng,
          address: originGeo.formattedAddress,
        },
        destination: {
          lat: destinationGeo.lat,
          lng: destinationGeo.lng,
          address: destinationGeo.formattedAddress,
        },
        departureTime: departureDateTime.toISOString(),
        availableSeats: parseInt(formData.seats),
        pricePerSeat: parseInt(formData.price),
      };

      console.log('Creating ride:', rideData);
      const response = await apiClient.rides.create(rideData);
      console.log('Ride created:', response);

      showAlert('Аялал амжилттай үүслээ!');
      router.push('/trips');
    } catch (error: unknown) {
      console.error('Create ride error:', error);
      showAlert((error as Error).message || 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'driver') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p>Зөвхөн жолооч аялал үүсгэх эрхтэй</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Буцах
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Буцах"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Аялалын пост үүсгэх</h1>
        </div>
      </header>

      <main className="px-4 py-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Origin & Destination */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Хаанаас</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  Өчиг тавьж
                </label>
                <Input
                  placeholder="Жишээ: Улаанбаатар, Сүхбаатарын талбай"
                  value={formData.originAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, originAddress: e.target.value })
                  }
                  className="h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Жишээ: Дархан, Тев талбай
                </label>
                <Input
                  placeholder="Жишээ: Дархан, Тев талбай"
                  value={formData.destinationAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      destinationAddress: e.target.value,
                    })
                  }
                  className="h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Огноо</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  Огноо
                </label>
                <Input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      departureDate: e.target.value,
                    })
                  }
                  className="h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  Цаг
                </label>
                <Input
                  type="time"
                  value={formData.departureTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      departureTime: e.target.value,
                    })
                  }
                  className="h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Seats & Price */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Суудлын тоо</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  Суудал
                </label>
                <select
                  className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  value={formData.seats}
                  onChange={(e) =>
                    setFormData({ ...formData, seats: e.target.value })
                  }
                  required
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  Үнэ (төгрөг)
                </label>
                <Input
                  type="number"
                  placeholder="15000"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-14 text-base font-semibold bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
            disabled={loading}
          >
            {loading ? 'Үүсгэж байна...' : 'Пост үүсгэх'}
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
