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

export default function CreateRidePage() {
  const { user } = useAuth();
  const router = useRouter();
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
      alert('Эхлэх газраа оруулна уу');
      return;
    }
    if (!formData.destinationAddress.trim()) {
      alert('Очих газраа оруулна уу');
      return;
    }
    if (!formData.price || parseInt(formData.price) <= 0) {
      alert('Үнэ оруулна уу');
      return;
    }

    setLoading(true);

    try {
      // Geocode addresses to get coordinates
      const originGeo = await geocodeAddress(formData.originAddress);
      const destinationGeo = await geocodeAddress(formData.destinationAddress);

      if (!originGeo) {
        alert('Эхлэх газрын хаяг олдсонгүй. Дахин оролдоно уу');
        setLoading(false);
        return;
      }

      if (!destinationGeo) {
        alert('Очих газрын хаяг олдсонгүй. Дахин оролдоно уу');
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

      alert('Аялал амжилттай үүслээ!');
      router.push('/trips');
    } catch (error: unknown) {
      console.error('Create ride error:', error);
      alert((error as Error).message || 'Алдаа гарлаа');
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
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Аялалын пост үүсгэх</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Origin & Destination */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Хаанаас</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  Эхлэх газар
                </label>
                <Input
                  placeholder="Жишээ: Улаанбаатар, Сүхбаатарын талбай"
                  value={formData.originAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, originAddress: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  Очих газар
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
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Огноо</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
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
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seats & Price */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Суудлын тоо</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Суудал
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  <label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Үнэ (төгрөг)
                  </label>
                  <Input
                    type="number"
                    placeholder="15000"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
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
