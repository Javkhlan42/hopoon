'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { href: '/', label: 'Нүүр', icon: Home },
  { href: '/search', label: 'Хайх', icon: Search },
  { href: '/create', label: 'Нэмэх', icon: Plus },
  { href: '/trips', label: 'Мессеж', icon: MessageSquare },
  { href: '/profile', label: 'Профайл', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200',
                isActive
                  ? 'text-cyan-500'
                  : 'text-gray-400 hover:text-gray-600',
              )}
            >
              <div
                className={cn(
                  'relative flex items-center justify-center',
                  isActive && 'transform scale-110',
                )}
              >
                <Icon className={cn('w-6 h-6', isActive && 'stroke-[2.5]')} />
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-cyan-500 rounded-full" />
                )}
              </div>
              <span
                className={cn(
                  'text-[11px] font-medium mt-1',
                  isActive && 'font-semibold',
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
