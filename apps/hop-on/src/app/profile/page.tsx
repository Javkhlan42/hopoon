'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { BottomNav } from '../../components/BottomNav';
import { Card, CardContent } from '../../components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Star, Phone, Mail, Calendar, Shield, LogOut } from 'lucide-react';
import apiClient from '../../lib/api';
import type { Review, Booking } from '../../types';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    driverRating: 4.8,
    passengerRating: 4.9,
    badges: 4,
  });
  const [activeTab, setActiveTab] = useState<'reviews' | 'badges' | 'vehicle'>(
    'reviews',
  );

  useEffect(() => {
    if (user) {
      // Reviews endpoint not implemented yet
      // fetchReviews();
      fetchStats();
    }
  }, [user]);

  const fetchReviews = async () => {
    // Reviews endpoint not implemented yet
    // Will be added in future
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.bookings.list();
      const data = response.data || response;
      const bookings = data?.data || [];
      setStats({ ...stats, totalTrips: bookings.length });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogout = async () => {
    if (confirm('Гарахдаа итгэлтэй байна уу?')) {
      await logout();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header with Background */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 pb-12 pt-6 px-4">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-lg font-semibold text-white">Профайл</h1>
          <button
            onClick={handleLogout}
            className="text-white text-sm px-3 py-1.5 hover:bg-white/20 rounded-md transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            Гарах
          </button>
        </div>

        {/* Profile Card */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.profile_photo} />
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0) || user.phone?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">
                    {user.name || user.phone}
                  </h2>
                  {user.verified && (
                    <Badge className="bg-green-600">
                      <Shield className="w-3 h-3 mr-1" />
                      Баталгаажсан
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {user.role === 'driver' ? 'Жолооч' : 'Зорчигч'}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                  {user.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Элссэн:{' '}
                      {new Date(user.created_at).toLocaleDateString('mn-MN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalTrips}
                </div>
                <div className="text-xs text-gray-600">Нийт аялал</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                  {stats.driverRating}
                  <Star className="w-5 h-5 fill-yellow-600" />
                </div>
                <div className="text-xs text-gray-600">Жолоочийн үнэлгээ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                  {stats.passengerRating}
                  <Star className="w-5 h-5 fill-green-600" />
                </div>
                <div className="text-xs text-gray-600">Зорчигчийн үнэлгээ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.badges}
                </div>
                <div className="text-xs text-gray-600">Шагнал</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-6 mb-4">
        <Card>
          <CardContent className="p-2">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-3 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === 'reviews'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Үнэлгээ
              </button>
              <button
                onClick={() => setActiveTab('badges')}
                className={`py-3 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === 'badges'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Шагнал
              </button>
              <button
                onClick={() => setActiveTab('vehicle')}
                className={`py-3 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === 'vehicle'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Машины мэдээлэл
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <main className="px-4 space-y-4">
        {activeTab === 'reviews' && (
          <>
            <h3 className="font-semibold text-lg">Сүүлийн үнэлгээнүүд</h3>
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Одоогоор үнэлгээ байхгүй байна
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.reviewer?.profile_photo} />
                        <AvatarFallback>
                          {review.reviewer?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {review.reviewer?.name || 'User'}
                          </span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-700">
                            {review.comment}
                          </p>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(review.created_at).toLocaleDateString(
                            'mn-MN',
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}

        {activeTab === 'badges' && (
          <>
            <h3 className="font-semibold text-lg">Миний шагнал</h3>
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Шагналууд удахгүй...
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'vehicle' && (
          <>
            <h3 className="font-semibold text-lg">Машины мэдээлэл</h3>
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Машины мэдээлэл нэмэх
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
