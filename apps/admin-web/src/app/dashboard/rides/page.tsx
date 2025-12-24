'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Search, MapPin, Eye } from 'lucide-react';
import { RideDetailModal } from '../../../components/modals/RideDetailModal';
import api from '../../../lib/apiClient';

export default function RidesPage() {
  const [selectedRide, setSelectedRide] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Зорчилтуудыг API-аас татаж авах
  useEffect(() => {
    const fetchRides = async () => {
      setLoading(true);
      try {
        const data = await api.rides.getRides({
          search: searchTerm,
          status: statusFilter,
          page: 1,
          limit: 20,
        });
        setRides(data.rides);
      } catch (error) {
        console.error('Failed to fetch rides:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [searchTerm, statusFilter]);

  const filteredRides = rides.filter((ride) => {
    const matchesSearch =
      ride.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.to?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || ride.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  if (loading) return <div className="p-6">Уншиж байна...</div>;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Аялал удирдлага</h1>
        <p className="text-muted-foreground">Бүх аяллыг хянах, удирдах</p>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Жолооч, маршрутаар хайх..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">Бүх статус</option>
              <option value="active">Идэвхтэй</option>
              <option value="completed">Дууссан</option>
              <option value="scheduled">Төлөвлөсөн</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Rides Table */}
      <Card>
        <CardHeader>
          <CardTitle>Бүх аялал ({filteredRides.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Жолооч</TableHead>
                <TableHead>Маршрут</TableHead>
                <TableHead>Огноо & Цаг</TableHead>
                <TableHead>Суудал</TableHead>
                <TableHead>Үнэ</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Үйлдэл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRides.map((ride) => (
                <TableRow key={ride.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm">
                        {ride.driverName?.[0] || 'D'}
                      </div>
                      <span className="font-medium">{ride.driverName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {ride.from} → {ride.to}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(ride.departureTime).toLocaleDateString(
                          'mn-MN',
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(ride.departureTime).toLocaleTimeString(
                          'mn-MN',
                          { hour: '2-digit', minute: '2-digit' },
                        )}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {ride.availableSeats}/{ride.totalSeats}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      ₮{ride.price.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{ride.seats} суудал</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      ₮{ride.price.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ride.status === 'active'
                          ? 'success'
                          : ride.status === 'completed'
                            ? 'secondary'
                            : 'default'
                      }
                    >
                      {ride.status === 'active'
                        ? 'Идэвхтэй'
                        : ride.status === 'completed'
                          ? 'Дууссан'
                          : 'Төлөвлөсөн'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRide(ride)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Харах
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedRide && (
        <RideDetailModal
          ride={selectedRide}
          onClose={() => setSelectedRide(null)}
          onUpdate={() => {
            // Refresh the rides list after update
            const fetchRides = async () => {
              try {
                const data = await api.rides.getRides({
                  search: searchTerm,
                  status: statusFilter,
                  page: 1,
                  limit: 20,
                });
                setRides(data.rides);
              } catch (error) {
                console.error('Failed to refresh rides:', error);
              }
            };
            fetchRides();
          }}
        />
      )}
    </div>
  );
}
