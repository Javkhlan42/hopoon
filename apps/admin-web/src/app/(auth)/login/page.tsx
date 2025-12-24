'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { api } from '../../../lib/apiClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Хуучин token-уудыг устгах (JWT_SECRET солигдсон тул)
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminRefreshToken');

      // Admin email нэвтрэх
      const response = await api.auth.adminLogin(email, password);

      // Token-ийг localStorage-д хадгалах
      if (response.accessToken) {
        localStorage.setItem('adminToken', response.accessToken);
        // Backend 'admin' field буцаана, 'user' биш
        localStorage.setItem('adminUser', JSON.stringify(response.admin));

        console.log('✅ Login successful:', {
          user: response.admin,
          tokenPreview: response.accessToken.substring(0, 20) + '...',
        });

        // Dashboard руу шилжих
        router.push('/dashboard');
      } else {
        throw new Error('No access token received');
      }
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(
        err.message ||
          'Нэвтрэх амжилтгүй боллоо. Имэйл болон нууц үгээ шалгана уу.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-6 pb-8">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-md">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-semibold">
            Carpooling Admin
          </CardTitle>
          <CardDescription className="text-center text-base">
            Админ хяналтын самбар руу нэвтрэх
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium block">
                Админы имэйл / Username
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium block">
                Нууц үг
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="remember" className="text-sm cursor-pointer">
                Намайг сана
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            </Button>

            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Тест эрх:</p>
              <p className="font-mono text-xs mt-1">
                admin@hopon.mn / admin123
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
