'use client';

import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useState } from 'react';
import api from '../../lib/apiClient';

interface AddUserModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddUserModal({ onClose, onSuccess }: AddUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'passenger',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.users.createUser(formData);
      alert('Хэрэглэгч амжилттай нэмэгдлээ');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Шинэ хэрэглэгч нэмэх</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Үндсэн мэдээлэл */}
          <Card>
            <CardHeader>
              <CardTitle>Үндсэн мэдээлэл</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Овог нэр <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Жишээ нь: Болдбаатар"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Утасны дугаар <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="+976 99123456"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Имэйл хаяг
                </label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Нууц үг <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Хамгийн багадаа 6 тэмдэгт байх ёстой
                </p>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Хэрэглэгчийн төрөл <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  required
                >
                  <option value="passenger">Зорчигч</option>
                  <option value="driver">Жолооч</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Цуцлах
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Хадгалж байна...' : 'Хэрэглэгч нэмэх'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
