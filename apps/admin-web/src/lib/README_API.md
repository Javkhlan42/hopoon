# API Integration Guide - Админ Панел

## Тохиргоо

### 1. Environment Variables

`.env.local` файл үүсгэх:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### 2. API Client Import

```typescript
import api from '@/lib/api';
// эсвэл
import { dashboardAPI, usersAPI, ridesAPI } from '@/lib/api';
```

---

## Хэрэглээний Жишээнүүд

### Dashboard Page

```typescript
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Нийт статистикууд
        const statsData = await api.dashboard.getStats();
        setStats(statsData);

        // Өдрийн статистик (сүүлийн 7 хоног)
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const daily = await api.dashboard.getDailyStats(startDate, endDate);
        setDailyData(daily);
      } catch (error) {
        console.error('Dashboard data fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Уншиж байна...</div>;

  return (
    <div>
      <h1>Нийт хэрэглэгч: {stats?.totalUsers}</h1>
      {/* Chart component */}
    </div>
  );
}
```

### Users Page - Search, Filter, Pagination

```typescript
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: 'all',
    role: 'all',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.users.getUsers(filters);
        setUsers(data.users);
        setMeta(data.meta);
      } catch (error) {
        console.error('Users fetch failed:', error);
      }
    };

    fetchUsers();
  }, [filters]);

  const handleSearch = (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleBlock = async (userId: string) => {
    try {
      await api.users.blockUser(userId, 'Админы шийдвэр');
      // Refresh list
      setFilters({ ...filters });
    } catch (error) {
      console.error('Block user failed:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Хайх..."
        onChange={(e) => handleSearch(e.target.value)}
      />

      <select onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
        <option value="all">Бүгд</option>
        <option value="active">Идэвхтэй</option>
        <option value="blocked">Блоклогдсон</option>
      </select>

      {users.map((user) => (
        <div key={user.id}>
          <span>{user.name}</span>
          <button onClick={() => handleBlock(user.id)}>Блоклох</button>
        </div>
      ))}

      <div>
        <button
          disabled={filters.page === 1}
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
        >
          Өмнөх
        </button>
        <span>Хуудас {meta?.page} / {meta?.totalPages}</span>
        <button
          disabled={filters.page === meta?.totalPages}
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
        >
          Дараах
        </button>
      </div>
    </div>
  );
}
```

### User Detail Modal

```typescript
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function UserDetailModal({ userId, onClose }) {
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await api.users.getUserDetails(userId);
        setUserDetails(data);
      } catch (error) {
        console.error('User details fetch failed:', error);
      }
    };

    if (userId) fetchDetails();
  }, [userId]);

  const handleBlock = async () => {
    try {
      await api.users.blockUser(userId, 'Зөрчил гаргасан');
      onClose();
    } catch (error) {
      console.error('Block failed:', error);
    }
  };

  if (!userDetails) return <div>Уншиж байна...</div>;

  return (
    <div>
      <h2>{userDetails.user.name}</h2>
      <p>Утас: {userDetails.user.phone}</p>
      <p>Үнэлгээ: {userDetails.user.rating}⭐</p>

      <h3>Зорчилтын түүх</h3>
      {userDetails.rides.map((ride) => (
        <div key={ride.id}>
          {ride.from} → {ride.to} - ₮{ride.price}
        </div>
      ))}

      <button onClick={handleBlock}>Блоклох</button>
    </div>
  );
}
```

### SOS Page - Real-time Updates

```typescript
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function SOSPage() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await api.sos.getSOSAlerts({ status: 'all' });
        setAlerts(data.alerts);
      } catch (error) {
        console.error('SOS fetch failed:', error);
      }
    };

    // Анх удаа ачаалах
    fetchAlerts();

    // 10 секунд тутам шинэчлэх
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (alertId: string) => {
    try {
      await api.sos.resolveAlert(alertId, 'Асуудал шийдэгдсэн');
      // Refresh list
      setAlerts(alerts.filter((a) => a.id !== alertId));
    } catch (error) {
      console.error('Resolve failed:', error);
    }
  };

  const handleCall = async (alertId: string) => {
    try {
      await api.sos.callUser(alertId);
      alert('Дуудлага эхэллээ');
    } catch (error) {
      console.error('Call failed:', error);
    }
  };

  return (
    <div>
      <h1>Идэвхтэй SOS: {alerts.filter((a) => a.status === 'active').length}</h1>

      {alerts
        .filter((a) => a.status === 'active')
        .map((alert) => (
          <div key={alert.id} className="bg-red-50 p-4">
            <h3>{alert.userName}</h3>
            <p>Байршил: {alert.location.address}</p>
            <p>Цаг: {new Date(alert.timestamp).toLocaleString('mn-MN')}</p>

            <button onClick={() => handleCall(alert.id)}>
              📞 Дуудах
            </button>
            <button onClick={() => handleResolve(alert.id)}>
              ✅ Шийдсэн
            </button>
          </div>
        ))}
    </div>
  );
}
```

### Reports Page - Charts

```typescript
'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';

export default function ReportsPage() {
  const [userGrowth, setUserGrowth] = useState([]);
  const [rideStats, setRideStats] = useState(null);
  const [revenue, setRevenue] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [growth, stats, rev] = await Promise.all([
          api.reports.getUserGrowth('month'),
          api.reports.getRideStats(),
          api.reports.getRevenue('month'),
        ]);

        setUserGrowth(growth);
        setRideStats(stats);
        setRevenue(rev);
      } catch (error) {
        console.error('Reports fetch failed:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Хэрэглэгчдийн өсөлт</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={userGrowth}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="drivers" fill="#3b82f6" name="Жолооч" />
          <Bar dataKey="passengers" fill="#10b981" name="Зорчигч" />
        </BarChart>
      </ResponsiveContainer>

      <h2>Зорчилтын статистик</h2>
      <p>Дууссан: {rideStats?.completed}</p>
      <p>Цуцалсан: {rideStats?.cancelled}</p>
      <p>Амжилтын хувь: {rideStats?.completionRate}%</p>
    </div>
  );
}
```

### System Monitoring - Real-time

```typescript
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function SystemPage() {
  const [status, setStatus] = useState(null);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [statusData, servicesData] = await Promise.all([
          api.system.getSystemStatus(),
          api.system.getServicesHealth(),
        ]);

        setStatus(statusData);
        setServices(servicesData);
      } catch (error) {
        console.error('System status fetch failed:', error);
      }
    };

    // Анх удаа ачаалах
    fetchStatus();

    // 5 секунд тутам шинэчлэх
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Системийн статус</h1>

      {status && (
        <div>
          <div>CPU: {status.cpu}%</div>
          <div>RAM: {status.memory.percentage}%</div>
          <div>Disk: {status.disk.percentage}%</div>
        </div>
      )}

      <h2>Сервисүүд</h2>
      {services.map((service) => (
        <div key={service.name}>
          <span>{service.name}</span>
          <span className={service.status === 'healthy' ? 'text-green-500' : 'text-red-500'}>
            {service.status}
          </span>
          <span>{service.responseTime}ms</span>
        </div>
      ))}
    </div>
  );
}
```

---

## Error Handling

```typescript
try {
  const data = await api.users.getUsers({ page: 1 });
  setUsers(data.users);
} catch (error) {
  if (error.message.includes('401')) {
    // Token дууссан - дахин нэвтэрч орох
    router.push('/login');
  } else if (error.message.includes('403')) {
    // Эрх хүрэхгүй
    alert('Танд энэ үйлдэл хийх эрх алга');
  } else {
    // Бусад алдаа
    console.error('API Error:', error);
    alert('Алдаа гарлаа. Дахин оролдоно уу.');
  }
}
```

---

## React Query Integration (Санал болгож буй)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Users list
export function useUsers(filters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => api.users.getUsers(filters),
    staleTime: 30000, // 30 секунд
  });
}

// User details
export function useUserDetails(userId) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.users.getUserDetails(userId),
    enabled: !!userId,
  });
}

// Block user mutation
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }) => api.users.blockUser(userId, reason),
    onSuccess: () => {
      // Cache-г шинэчлэх
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Usage in component
function UsersPage() {
  const { data, isLoading, error } = useUsers({ page: 1, limit: 20 });
  const blockUser = useBlockUser();

  if (isLoading) return <div>Уншиж байна...</div>;
  if (error) return <div>Алдаа: {error.message}</div>;

  return (
    <div>
      {data?.users.map((user) => (
        <div key={user.id}>
          <span>{user.name}</span>
          <button onClick={() => blockUser.mutate({ userId: user.id, reason: 'Test' })}>
            Блоклох
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## WebSocket Integration (Real-time SOS)

```typescript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export function useRealtimeSOS() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const socket = io('http://localhost:3000', {
      auth: {
        token: localStorage.getItem('adminToken'),
      },
    });

    // Шинэ SOS дохио ирэхэд
    socket.on('sos:new', (alert) => {
      setAlerts((prev) => [alert, ...prev]);
      // Push notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Шинэ SOS дохио!', {
          body: `${alert.userName} - ${alert.location.address}`,
          icon: '/sos-icon.png',
        });
      }
    });

    // SOS шийдэгдсэн
    socket.on('sos:resolved', ({ alertId }) => {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    });

    return () => socket.disconnect();
  }, []);

  return alerts;
}
```

---

## Бүх API Endpoint-үүд

### Dashboard

- `GET /api/v1/admin/dashboard/stats` - Нийт статистик
- `GET /api/v1/admin/dashboard/daily-stats` - Өдрийн статистик
- `GET /api/v1/admin/dashboard/active-sos` - Идэвхтэй SOS

### Users

- `GET /api/v1/admin/users` - Хэрэглэгчдийн жагсаалт
- `GET /api/v1/admin/users/:id` - Дэлгэрэнгүй мэдээлэл
- `POST /api/v1/admin/users/:id/block` - Блоклох
- `POST /api/v1/admin/users/:id/unblock` - Блок тайлах
- `DELETE /api/v1/admin/users/:id` - Устгах
- `POST /api/v1/admin/users/:id/verify` - Баталгаажуулах

### Rides

- `GET /api/v1/admin/rides` - Зорчилтын жагсаалт
- `GET /api/v1/admin/rides/:id` - Дэлгэрэнгүй мэдээлэл
- `POST /api/v1/admin/rides/:id/cancel` - Цуцлах
- `DELETE /api/v1/admin/rides/:id` - Устгах

### SOS

- `GET /api/v1/admin/sos` - SOS дуудлагууд
- `POST /api/v1/admin/sos/:id/resolve` - Шийдсэн болгох
- `POST /api/v1/admin/sos/:id/call` - Дуудах
- `GET /api/v1/admin/sos/:id/navigation` - Байршлын холбоос

### Moderation

- `GET /api/v1/admin/moderation/reports` - Report-уудын жагсаалт
- `GET /api/v1/admin/moderation/reports/:id` - Дэлгэрэнгүй
- `POST /api/v1/admin/moderation/reports/:id/approve` - Батлах
- `POST /api/v1/admin/moderation/reports/:id/reject` - Татгалзах

### Reports

- `GET /api/v1/admin/reports/user-growth` - Хэрэглэгчдийн өсөлт
- `GET /api/v1/admin/reports/ride-stats` - Зорчилтын статистик
- `GET /api/v1/admin/reports/revenue` - Орлогын тайлан
- `GET /api/v1/admin/reports/popular-routes` - Түгээмэл чиглэлүүд
- `GET /api/v1/admin/reports/top-drivers` - Шилдэг жолооч нар

### System

- `GET /api/v1/admin/system/status` - Системийн статус
- `GET /api/v1/admin/system/services` - Сервисүүдийн эрүүл байдал
- `GET /api/v1/admin/system/logs` - Логууд
- `PUT /api/v1/admin/system/config` - Тохиргоо өөрчлөх

### Auth

- `POST /api/v1/auth/admin/login` - Нэвтрэх
- `POST /api/v1/auth/refresh` - Token сэргээх
- `POST /api/v1/auth/logout` - Гарах
