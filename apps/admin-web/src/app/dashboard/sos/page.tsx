'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { AlertTriangle, MapPin, Phone, User, Clock } from 'lucide-react';
import api from '../../../lib/apiClient';

export default function SOSPage() {
  const [sosAlerts, setSosAlerts] = useState<any[]>([]);
  const [resolvedAlerts, setResolvedAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // SOS датаг татаж авах
  const fetchAlerts = async () => {
    try {
      const data = await api.sos.getSOSAlerts({ status: 'all' });
      setSosAlerts(data.alerts.filter((a: any) => a.status === 'active'));
      setResolvedAlerts(
        data.alerts.filter((a: any) => a.status === 'resolved'),
      );
    } catch (error) {
      console.error('Failed to fetch SOS alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // 10 секунд тутам шинэчлэх
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRespond = async (alertId: string) => {
    try {
      await api.sos.respondToAlert(alertId, 'ADMIN-001');
      fetchAlerts();
    } catch (error) {
      console.error('Failed to respond to alert:', error);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await api.sos.resolveAlert(alertId, 'Асуудал шийдэгдсэн');
      fetchAlerts();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const handleCall = async (alertId: string) => {
    try {
      await api.sos.callUser(alertId);
      if (typeof window !== 'undefined') {
        (window as any).alert('Дуудлага эхэллээ');
      }
    } catch (error) {
      console.error('Failed to call user:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">SOS Alert Management</h1>
            <p className="text-muted-foreground">
              Яаралтай дуудлагад хариу өгөх, хянах
            </p>
          </div>
        </div>
        {sosAlerts.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-700 font-semibold">
              {sosAlerts.length} идэвхтэй дуудлага
            </span>
          </div>
        )}
      </div>

      {/* Active Alerts */}
      {sosAlerts.length > 0 ? (
        <div className="space-y-4">
          {sosAlerts.map((alert) => (
            <Card key={alert.id} className="border-2 border-red-300 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b-2 border-red-200">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="destructive"
                        className="text-sm px-3 py-1"
                      >
                        🚨 ЯАРАЛТАЙ
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-red-300 text-red-700"
                      >
                        {alert.priority?.toUpperCase() || 'HIGH'}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl text-red-700 flex items-center gap-2">
                      Alert #{alert.id}
                      <span className="text-sm font-normal text-muted-foreground">
                        • {alert.timestamp}
                      </span>
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleCall(alert.id)}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Хэрэглэгчид залгах
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={async () => {
                        try {
                          const data = await api.sos.getNavigationLink(
                            alert.id,
                          );
                          window.open(data.mapUrl, '_blank');
                        } catch (error) {
                          console.error(
                            'Failed to get navigation link:',
                            error,
                          );
                        }
                      }}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Байршил харах
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 pb-6">
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div className="space-y-5">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-full">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          Хэрэглэгч
                        </p>
                        <p className="font-semibold text-lg">
                          {alert.userName}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {alert.userPhone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-full">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          Дуудлагын цаг
                        </p>
                        <p className="font-semibold">{alert.timestamp}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-full">
                        <MapPin className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          Байршил
                        </p>
                        <p className="font-semibold">
                          {alert.location.address}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.location.lat.toFixed(4)},{' '}
                          {alert.location.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-full">
                        <AlertTriangle className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          Аяллын ID
                        </p>
                        <p className="font-semibold font-mono">
                          {alert.rideId}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="destructive"
                    className="flex-1 h-11 text-base"
                    onClick={() => handleRespond(alert.id)}
                  >
                    🚑 Яаралтай албанд холбогдох
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 px-6"
                    onClick={() => handleResolve(alert.id)}
                  >
                    ✅ Шийдсэн гэж тэмдэглэх
                  </Button>
                  <Button variant="ghost" className="h-11 px-6">
                    📝 Тэмдэглэл нэмэх
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                <AlertTriangle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Идэвхтэй дуудлага байхгүй
              </h3>
              <p className="text-muted-foreground">
                ✅ Бүх зүйл хэвийн байна. Яаралтай дуудлага одоогоор байхгүй.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolved Alerts History */}
      <div className="pt-4">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>Шийдсэн дуудлагууд</span>
          <Badge variant="secondary">{resolvedAlerts.length}</Badge>
        </h2>
        <div className="space-y-3">
          {resolvedAlerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        ✓ ШИЙДСЭН
                      </Badge>
                      <Badge variant="outline">{alert.priority}</Badge>
                    </div>
                    <CardTitle className="text-lg">Alert #{alert.id}</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm">
                    Дэлгэрэнгүй харах
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Хэрэглэгч
                    </p>
                    <p className="font-medium">{alert.user}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Дуудлагын цаг
                    </p>
                    <p className="font-medium">{alert.timestamp}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Шийдсэн
                    </p>
                    <p className="font-medium">{alert.resolvedAt}</p>
                  </div>
                </div>
                {alert.notes && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium mb-1">
                      📋 Тэмдэглэл:
                    </p>
                    <p className="text-sm text-gray-700">{alert.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
