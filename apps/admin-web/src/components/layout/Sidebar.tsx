'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils/cn';
import {
  LayoutDashboard,
  Users,
  Car,
  AlertTriangle,
  BarChart3,
  Settings,
  MessageSquare,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Хэрэглэгч',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    name: 'Аялал',
    href: '/dashboard/rides',
    icon: Car,
  },
  {
    name: 'SOS Дуудлага',
    href: '/dashboard/sos',
    icon: AlertTriangle,
    badge: 0, // будет обновляться динамически
  },
  {
    name: 'Контент',
    href: '/dashboard/moderation',
    icon: MessageSquare,
  },
  {
    name: 'Тайлан',
    href: '/dashboard/reports',
    icon: BarChart3,
  },
  {
    name: 'Систем',
    href: '/dashboard/system',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-50 flex-col bg-card border-r">
      <div className="flex h-16 items-center border-b px-4">
        <h1 className="text-xl font-bold text-primary">HopOn Админ</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md border-l-4 border-primary-foreground/50'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1 hover:shadow-sm active:scale-95',
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Админ</p>
            <p className="text-xs text-muted-foreground">admin@hopon.mn</p>
          </div>
        </div>
      </div>
    </div>
  );
}
