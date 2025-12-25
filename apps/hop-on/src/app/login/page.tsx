'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Car } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-cyan-500 p-4 rounded-2xl shadow-lg mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-cyan-500 mb-2">HopOn</h1>
          <p className="text-gray-600 text-sm">
            Your trusted carpooling community
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-2">Нэвтрэх</h2>
          <p className="text-center text-gray-500 text-sm mb-6">
            Өөрийн бүртгэлээр нэвтрэх
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700"
              >
                Утасны дугаар
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+97699887766"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Нууц үг
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Нууц үгээ оруулна уу"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl transition-colors text-base"
              disabled={loading}
            >
              {loading ? 'Уншиж байна...' : 'Нэвтрэх →'}
            </Button>

            <div className="text-center text-sm pt-2">
              <span className="text-gray-600">Шинэ хэрэглэгч үү? </span>
              <Link
                href="/register"
                className="text-cyan-500 hover:underline font-medium"
              >
                Бүртгүүлэх
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
