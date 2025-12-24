'use client';

import { X, MapPin, Calendar, Clock, Users, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import api from '../../lib/apiClient';
import { useState } from 'react';

interface RideDetailModalProps {
  ride: any;
  onClose: () => void;
  onUpdate?: () => void;
}

export function RideDetailModal({
  ride,
  onClose,
  onUpdate,
}: RideDetailModalProps) {
  if (!ride) return null;
  const [loading, setLoading] = useState(false);

  const handleCancelRide = async () => {
    if (!confirm('Энэ аяллыг цуцлах уу?')) return;
    setLoading(true);
    try {
      await api.rides.cancelRide(ride.id, 'Админы шийдвэр');
      alert('Аялал цуцлагдлаа');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to cancel ride:', error);
      alert('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRide = async () => {
    if (!confirm('Энэ аяллыг устгах уу? Энэ үйлдлийг буцаах боломжгүй!'))
      return;
    setLoading(true);
    try {
      await api.rides.deleteRide(ride.id);
      alert('Аялал устгагдлаа');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to delete ride:', error);
      alert('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Аяллын дэлгэрэнгүй</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Ride Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Аяллын мэдээлэл</CardTitle>
                <Badge
                  variant={
                    ride.status === 'active'
                      ? 'success'
                      : ride.status === 'completed'
                        ? 'secondary'
                        : 'default'
                  }
                >
                  {ride.status === 'active'
                    ? 'Идэвхтэй'
                    : ride.status === 'completed'
                      ? 'Дууссан'
                      : 'Төлөвлөсөн'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Хаанаас</p>
                      <p className="font-medium">{ride.from}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-red-500 mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Хаашаа</p>
                      <p className="font-medium">{ride.to}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Огноо</p>
                      <p className="font-medium">{ride.date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Цаг</p>
                      <p className="font-medium">{ride.time}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Үнэ</p>
                  <p className="text-2xl font-bold">
                    ₮{ride.price?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Суудлын тоо</p>
                  <p className="text-2xl font-bold">{ride.seats}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Driver Info */}
          <Card>
            <CardHeader>
              <CardTitle>Жолоочийн мэдээлэл</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                  {ride.driver?.[0] || 'J'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">
                    {ride.driver || 'Жолооч'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    +976 9999 1234
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium">4.8</span>
                    <span className="text-sm text-muted-foreground">
                      (45 үнэлгээ)
                    </span>
                  </div>
                </div>
                <Button variant="outline">Холбогдох</Button>
              </div>
            </CardContent>
          </Card>

          {/* Passengers */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Зорчигчид (3)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 border-b pb-3 last:border-0"
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      З{i}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Зорчигч {i}</p>
                      <p className="text-sm text-muted-foreground">
                        +976 9999 000{i}
                      </p>
                    </div>
                    <Badge variant="success">Баталгаажсан</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Маршрутын мэдээлэл */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <CardTitle>Маршрут</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Хаанаас</p>
                    <p className="font-semibold">{ride.from}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Хаашаа</p>
                    <p className="font-semibold">{ride.to}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat History */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>Чат түүх</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Зорчигч {i}</p>
                      <p className="text-sm text-muted-foreground">
                        Сайн байна уу, хэдэн цагт хөдөлнө вэ?
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        14:3{i}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="destructive"
              onClick={handleDeleteRide}
              disabled={loading}
            >
              Аяллыг устгах
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelRide}
              disabled={loading}
            >
              Аяллыг цуцлах
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Хаах
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
