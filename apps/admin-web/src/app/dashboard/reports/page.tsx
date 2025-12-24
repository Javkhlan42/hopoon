'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Users, Car, TrendingUp, Star, Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../../lib/apiClient';

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRides: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [rideCompletionData, setRideCompletionData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [growth, rideStats, revenue, routes] = await Promise.all([
          api.reports.getUserGrowth('month'),
          api.reports.getRideStats(),
          api.reports.getRevenue('month'),
          api.reports.getPopularRoutes(5),
        ]);

        // User growth data
        setUserGrowthData(
          growth.map((d: any) => ({
            month: new Date(d.date).toLocaleDateString('mn-MN', {
              month: 'short',
            }),
            users: d.total,
          })),
        );

        // Ride completion data
        setRideCompletionData([
          { name: 'Дууссан', value: rideStats.completed, color: '#10b981' },
          { name: 'Цуцлагдсан', value: rideStats.cancelled, color: '#ef4444' },
          { name: 'Хүлээгдэж буй', value: rideStats.ongoing, color: '#f59e0b' },
        ]);

        // Revenue data
        setRevenueData(
          revenue.map((d: any) => ({
            month: new Date(d.date).toLocaleDateString('mn-MN', {
              month: 'short',
            }),
            revenue: Math.round(d.amount / 1000),
          })),
        );

        // Popular routes
        setPopularRoutes(
          routes.map((r: any) => ({
            route: `${r.from} → ${r.to}`,
            count: r.count,
            revenue: `${((r.avgPrice * r.count) / 1000000).toFixed(1)}M₮`,
            avgPrice: `${r.avgPrice.toLocaleString()}₮`,
          })),
        );

        // Stats
        setStats({
          totalUsers:
            rideStats.completed + rideStats.cancelled + rideStats.ongoing,
          totalRides: rideStats.completed + rideStats.cancelled,
          totalRevenue: revenue.reduce(
            (sum: number, r: any) => sum + r.amount,
            0,
          ),
          averageRating: 4.6,
        });
      } catch (error) {
        console.error('Failed to fetch report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Тайлан & Статистик</h1>
          <p className="text-muted-foreground">
            Системийн дэлгэрэнгүй тайлан, шинжилгээ
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              alert('PDF татаж авах функц удахгүй нэмэгдэнэ');
              console.log('Exporting to PDF...');
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              alert('Excel татаж авах функц удахгүй нэмэгдэнэ');
              console.log('Exporting to Excel...');
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Тайлангийн төрөл
              </label>
              <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Төрөл сонгох</option>
                <option>Хэрэглэгч</option>
                <option>Аялал</option>
                <option>Орлого</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Эхлэх огноо
              </label>
              <input
                type="date"
                defaultValue="2024-01-12"
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Дуусах огноо
              </label>
              <input
                type="date"
                defaultValue="2024-12-22"
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  alert('Шүүлтүүр хэрэгжүүлж байна...');
                  console.log('Filtering reports...');
                }}
              >
                Шүүх
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Нийт хэрэглэгч</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-green-600">+15% энэ сард</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Car className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Нийт аялал</p>
                <p className="text-2xl font-bold">{stats.totalRides}</p>
                <p className="text-xs text-green-600">+12% энэ сард</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Нийт орлого</p>
                <p className="text-2xl font-bold">
                  {stats.totalRevenue.toLocaleString()}₮
                </p>
                <p className="text-xs text-green-600">+18% энэ сард</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Дундаж үнэлгээ</p>
                <p className="text-2xl font-bold">{stats.averageRating}</p>
                <p className="text-xs text-muted-foreground">5-аас</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Хэрэглэгчийн өсөлт
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" name="Хэрэглэгч" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-green-600" />
              Аяллын дүүргэлт
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rideCompletionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {rideCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Орлогын график
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Орлого (мянган ₮)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Popular Routes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Түгээмэл маршрутууд
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularRoutes.map((route, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="font-medium">{route.route}</span>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-sm">
                  <div>
                    <p className="text-muted-foreground">Аяллын тоо</p>
                    <p className="font-medium">{route.count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Орлого</p>
                    <p className="font-medium">{route.revenue}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Дундаж үнэ</p>
                    <p className="font-medium">{route.avgPrice}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
