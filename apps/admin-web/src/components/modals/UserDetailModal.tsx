'use client';

import {
  X,
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import api from '../../lib/apiClient';
import { useState } from 'react';

interface UserDetailModalProps {
  user: any;
  onClose: () => void;
  onUpdate?: () => void;
}

export function UserDetailModal({
  user,
  onClose,
  onUpdate,
}: UserDetailModalProps) {
  if (!user) return null;
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role || 'passenger');

  const handleUpdateRole = async () => {
    if (selectedRole === user.role) {
      alert('Эрх өөрчлөгдөөгүй байна');
      return;
    }
    setLoading(true);
    try {
      await api.users.updateUserRole(user.id, selectedRole as any);
      alert(`Хэрэглэгчийн эрх "${selectedRole}" болж өөрчлөгдлөө`);
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };
  const handleToggleVerification = async () => {
    setLoading(true);
    try {
      await api.users.toggleVerification(user.id);
      alert(
        user.verified ? 'Баталгаажилт цуцлагдлаа' : 'Баталгаажуулалт амжилттай',
      );
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to toggle verification:', error);
      alert('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!confirm('Энэ хэрэглэгчийг блоклох уу?')) return;
    setLoading(true);
    try {
      await api.users.blockUser(user.id, 'Админы шийдвэр');
      alert('Хэрэглэгч блоклогдлоо');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to block user:', error);
      alert('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async () => {
    setLoading(true);
    try {
      await api.users.unblockUser(user.id);
      alert('Блок тайлагдлаа');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to unblock user:', error);
      alert('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Энэ хэрэглэгчийг устгах уу? Энэ үйлдлийг буцаах боломжгүй!'))
      return;
    setLoading(true);
    try {
      await api.users.deleteUser(user.id);
      alert('Хэрэглэгч устгагдлаа');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Хэрэглэгчийн дэлгэрэнгүй</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>Үндсэн мэдээлэл</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold">
                  {user.name[0]}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-2xl font-bold">{user.name}</h3>
                    <p className="text-muted-foreground">ID: {user.id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        {user.rating} үнэлгээ
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">2024-01-15 бүртгүүлсэн</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={user.verified ? 'success' : 'secondary'}>
                      {user.verified ? 'Баталгаажсан' : 'Баталгаажаагүй'}
                    </Badge>
                    <Badge
                      variant={
                        user.status === 'active'
                          ? 'success'
                          : user.status === 'suspended'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {user.status === 'active'
                        ? 'Идэвхтэй'
                        : user.status === 'suspended'
                          ? 'Түр хаасан'
                          : 'Хүлээгдэж буй'}
                    </Badge>
                    <Badge variant="outline">
                      {user.role === 'driver'
                        ? 'Жолооч'
                        : user.role === 'passenger'
                          ? 'Зорчигч'
                          : user.role === 'both'
                            ? 'Жолооч/Зорчигч'
                            : 'Админ'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Management */}
          <Card>
            <CardHeader>
              <CardTitle>Эрх удирдлага</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Хэрэглэгчийн эрх
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    disabled={loading}
                  >
                    <option value="passenger">Зорчигч</option>
                    <option value="driver">Жолооч</option>
                    <option value="both">Жолооч/Зорчигч хоёулаа</option>
                    <option value="admin">Админ</option>
                  </select>
                </div>
                {selectedRole !== user.role && (
                  <Button
                    variant="default"
                    onClick={handleUpdateRole}
                    disabled={loading}
                    className="w-full"
                  >
                    Эрх өөрчлөх
                  </Button>
                )}
                <p className="text-sm text-muted-foreground">
                  {selectedRole === 'driver' &&
                    '🚗 Жолооч эрх өгснөөр тус хэрэглэгч аялал үүсгэх боломжтой болно.'}
                  {selectedRole === 'passenger' &&
                    '👤 Зорчигч эрхтэй хэрэглэгч зөвхөн аялалд суух боломжтой.'}
                  {selectedRole === 'both' &&
                    '🚗👤 Жолооч болон зорчигч хоёр эрхтэй. Аялал үүсгэх болон суух боломжтой.'}
                  {selectedRole === 'admin' &&
                    '⚙️ Админ эрх өгснөөр админ панел руу нэвтрэх боломжтой болно.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ride History */}
          <Card>
            <CardHeader>
              <CardTitle>Аяллын түүх (12)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">Улаанбаатар → Дархан</p>
                      <p className="text-sm text-muted-foreground">
                        2024-12-{20 - i} • Жолооч
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₮15,000</p>
                      <Badge variant="success">Дууссан</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Сэтгэгдэл (8)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200" />
                        <span className="font-medium">Сарнай Б.</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Маш сайн жолооч байлаа. Цаг баримталдаг, найрсаг.
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SOS History */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <CardTitle>SOS түүх (0)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                SOS дуудлага байхгүй байна
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            {!user.verified && (
              <Button
                variant="default"
                onClick={handleToggleVerification}
                disabled={loading}
              >
                Баталгаажуулах
              </Button>
            )}
            {user.verified && (
              <Button
                variant="outline"
                onClick={handleToggleVerification}
                disabled={loading}
              >
                Баталгаажилт цуцлах
              </Button>
            )}
            {user.status === 'active' && (
              <Button
                variant="destructive"
                onClick={handleBlockUser}
                disabled={loading}
              >
                Түр хаах
              </Button>
            )}
            {user.status === 'blocked' && (
              <Button
                variant="default"
                onClick={handleUnblockUser}
                disabled={loading}
              >
                Идэвхжүүлэх
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={loading}
            >
              Хэрэглэгч устгах
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Хаах
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
