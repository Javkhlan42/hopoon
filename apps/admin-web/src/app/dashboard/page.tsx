'use client';

import { useState, useEffect } from 'react';
import {
  ActiveRidesCard,
  TotalUsersCard,
  RevenueCard,
  SOSAlertsCard,
} from '../../components/dashboard/StatCard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Calendar } from 'lucide-react';
import api from '../../lib/apiClient';

export default function AdminPage() {
  const [stats, setStats] = useState({
    activeRides: 0,
    totalUsers: 0,
    revenue: 0,
    sosAlerts: 0,
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState('today');
  const [loading, setLoading] = useState(true);

  // Анхны дата татаж авах
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [statsData, dailyData] = await Promise.all([
          api.dashboard.getStats(),
          api.dashboard.getDailyStats(
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            new Date().toISOString(),
          ),
        ]);

        setStats({
          activeRides: statsData.totalRides,
          totalUsers: statsData.totalUsers,
          revenue: statsData.totalRevenue,
          sosAlerts: 0,
        });

        // Chart data форматлах
        setChartData(
          dailyData.map((d) => ({
            time: new Date(d.date).toLocaleDateString('mn-MN', {
              month: 'short',
              day: 'numeric',
            }),
            rides: d.rides,
            users: d.users,
          })),
        );
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [dateRange]);

  // Real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const statsData = await api.dashboard.getStats();
        setStats({
          activeRides: statsData.totalRides,
          totalUsers: statsData.totalUsers,
          revenue: statsData.totalRevenue,
          sosAlerts: 0,
        });
      } catch (error) {
        console.error('Failed to update stats:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Системийн бодит цагийн статистик
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="today">Өнөөдөр</option>
            <option value="week">7 хоног</option>
            <option value="month">Сар</option>
            <option value="year">Жил</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ActiveRidesCard count={stats.activeRides} />
        <TotalUsersCard count={stats.totalUsers} />
        <RevenueCard amount={stats.revenue} />
        <SOSAlertsCard count={stats.sosAlerts} />
      </div>

      {/* Real-time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Бодит цагийн график</CardTitle>
          <p className="text-sm text-muted-foreground">
            30 секунд тутамд шинэчлэгдэнэ
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="rides"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Аялал"
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#10b981"
                strokeWidth={2}
                name="Хэрэглэгч"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Сүүлийн аяллууд</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium">Ulaanbaatar → Darkhan</p>
                    <p className="text-sm text-muted-foreground">
                      Driver: Болд Б.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₮15,000</p>
                    <p className="text-xs text-muted-foreground">2 seats</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Шинэ хэрэглэгчид</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium">User {i}</p>
                      <p className="text-sm text-muted-foreground">
                        +976 9999 {i}000
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    2 min ago
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
