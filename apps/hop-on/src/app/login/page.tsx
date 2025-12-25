'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(phone, password);
    } catch (err: any) {
      setError(err.message || 'Нэвтрэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md shadow-none border-0">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-8">
            <div className="text-3xl font-bold text-blue-600">HopOn</div>
          </div>
          <CardTitle className="text-xl text-center font-semibold">
            Нэвтрэх
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Таны дансанд нэвтэрнэ үү
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Утасны дугаар
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+976 9999 9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Нууц үг
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Уншиж байна...' : 'Нэвтрэх'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Бүртгэлгүй юу? </span>
              <Link
                href="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Бүртгүүлэх
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
