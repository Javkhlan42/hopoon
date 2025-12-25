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

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'passenger' as 'driver' | 'passenger',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Нууц үг таарахгүй байна');
      return;
    }

    if (formData.password.length < 6) {
      setError('Нууц үг 6-аас дээш тэмдэгттэй байх ёстой');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        email: formData.email || undefined,
        role: formData.role,
      });
    } catch (err: any) {
      setError(err.message || 'Бүртгэлд алдаа гарлаа');
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
            Бүртгүүлэх
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Шинэ данс үүсгэх
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
              <label className="text-sm font-medium">Хэрэглэгчийн төрөл</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, role: 'passenger' })
                  }
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'passenger'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🚶</div>
                  <div className="font-medium">Зорчигч</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'driver' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'driver'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🚗</div>
                  <div className="font-medium">Жолооч</div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Нэр
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Таны нэр"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Утасны дугаар
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+976 9999 9999"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                И-мэйл (заавал биш)
              </label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Нууц үг давтах
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Уншиж байна...' : 'Бүртгүүлэх'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Бүртгэлтэй юу? </span>
              <Link
                href="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Нэвтрэх
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
