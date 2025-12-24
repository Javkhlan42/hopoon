'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { AlertCircle, Activity, Database, HardDrive, Wifi } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import api from '../../../lib/apiClient';

export default function SystemPage() {
  const [cpuData, setCpuData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    cpu: 0,
    ram: 0,
    disk: 0,
    network: 35,
  });
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Системийн статус татаж авах
  const fetchSystemStatus = async () => {
    try {
      const [status, servicesHealth] = await Promise.all([
        api.system.getSystemStatus(),
        api.system.getServicesHealth(),
      ]);

      setMetrics({
        cpu: status.cpu,
        ram: status.memory.percentage,
        disk: status.disk.percentage,
        network: 35,
      });

      setServices(
        servicesHealth.map((s: any) => ({
          name: s.name,
          status: s.status === 'healthy' ? 'online' : 'offline',
          uptime: s.status === 'healthy' ? '99.9%' : '0%',
          responseTime: `${s.responseTime}ms`,
        })),
      );

      // Update chart data
      setCpuData((prev) => {
        const newPoint = {
          time: new Date().toLocaleTimeString('mn-MN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          cpu: status.cpu,
          ram: status.memory.percentage,
          disk: status.disk.percentage,
        };
        const updated = [...prev, newPoint].slice(-6);
        return updated;
      });
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Анх удаа татаж авах
  useEffect(() => {
    fetchSystemStatus();
  }, []);

  // Real-time updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchSystemStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-6">Уншиж байна...</div>;

  const logs = [
    {
      level: 'INFO',
      service: 'Ride Service',
      message: 'System operation completed',
      time: new Date().toLocaleTimeString('mn-MN'),
    },
    {
      level: 'WARNING',
      service: 'API Gateway',
      message: 'High latency detected',
      time: new Date(Date.now() - 2 * 60 * 1000).toLocaleTimeString('mn-MN'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Систем</h1>
        <p className="text-muted-foreground">
          Системийн эрүүл мэнд, хянах самбар
        </p>
      </div>

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">CPU Usage</p>
                <p className="text-2xl font-bold">45.0%</p>
                <p className="text-xs text-muted-foreground">Хэвийн</p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${metrics.cpu}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <HardDrive className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">RAM Usage</p>
                <p className="text-2xl font-bold">{metrics.ram.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Хэвийн</p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{ width: `${metrics.ram}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Wifi className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">
                  120<span className="text-sm">ms</span>
                </p>
                <p className="text-xs text-muted-foreground">Сайн</p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: '20%' }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Disk Usage</p>
                <p className="text-2xl font-bold">38%</p>
                <p className="text-xs text-muted-foreground">256GB / 500GB</p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500"
                style={{ width: '38%' }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Бодит цагийн системийн график</CardTitle>
          <p className="text-sm text-muted-foreground">
            10 секунд тутамд шинэчлэгдэнэ
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cpuData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="cpu"
                stroke="#3b82f6"
                strokeWidth={2}
                name="CPU %"
              />
              <Line
                type="monotone"
                dataKey="ram"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="RAM %"
              />
              <Line
                type="monotone"
                dataKey="disk"
                stroke="#10b981"
                strokeWidth={2}
                name="Disk %"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle>Үйлчилгээний статус</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground mr-1"></span>
                        {service.responseTime}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Uptime: {service.uptime}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant={
                    service.status === 'online'
                      ? 'success'
                      : service.status === 'degraded'
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {service.status === 'online'
                    ? 'Online'
                    : service.status === 'degraded'
                      ? 'Degraded'
                      : 'Offline'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Системийн лог</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.map((log, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-3 border-l-4 rounded"
                style={{
                  borderLeftColor:
                    log.level === 'ERROR'
                      ? '#ef4444'
                      : log.level === 'WARNING'
                        ? '#f59e0b'
                        : '#3b82f6',
                }}
              >
                <Badge
                  variant={
                    log.level === 'ERROR'
                      ? 'destructive'
                      : log.level === 'WARNING'
                        ? 'secondary'
                        : 'default'
                  }
                  className="mt-1"
                >
                  {log.level}
                </Badge>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{log.service}</p>
                    <span className="text-xs text-muted-foreground">
                      {log.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {log.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
