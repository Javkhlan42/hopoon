import * as React from 'react';
import { cn } from '../../lib/utils/cn';
import {
  Activity,
  Users,
  Car,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export function StatCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
}: StatCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-muted-foreground',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn('text-xs mt-1', trendColors[trend])}>{change}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Pre-configured stat cards
export function ActiveRidesCard({ count }: { count: number }) {
  return (
    <StatCard
      title="Идэвхтэй аялал"
      value={count}
      change="+12% өчигдөр"
      trend="up"
      icon={<Car className="h-4 w-4 text-muted-foreground" />}
    />
  );
}

export function TotalUsersCard({ count }: { count: number }) {
  return (
    <StatCard
      title="Нийт хэрэглэгч"
      value={count.toLocaleString()}
      change="+180 энэ долоо хоногт"
      trend="up"
      icon={<Users className="h-4 w-4 text-muted-foreground" />}
    />
  );
}

export function RevenueCard({ amount }: { amount: number }) {
  return (
    <StatCard
      title="Орлого (MNT)"
      value={`₮${amount.toLocaleString()}`}
      change="+8% өнгөрсөн сар"
      trend="up"
      icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
    />
  );
}

export function SOSAlertsCard({ count }: { count: number }) {
  return (
    <StatCard
      title="SOS Дуудлага"
      value={count}
      change={count > 0 ? 'Анхаарал хэрэгтэй' : 'Бүх зүгээр'}
      trend={count > 0 ? 'down' : 'neutral'}
      icon={
        <AlertCircle
          className={cn(
            'h-4 w-4',
            count > 0 ? 'text-red-500' : 'text-muted-foreground',
          )}
        />
      }
    />
  );
}
