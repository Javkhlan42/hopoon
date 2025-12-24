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
import { Search, Filter, UserPlus, Eye } from 'lucide-react';
import { UserDetailModal } from '../../../components/modals/UserDetailModal';
import { AddUserModal } from '../../../components/modals/AddUserModal';
import api from '../../../lib/apiClient';

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);

  // Хэрэглэгчдийг API-аас татаж авах
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await api.users.getUsers({
          search: searchTerm,
          status: statusFilter,
          page: 1,
          limit: 20,
        });
        setUsers(data.users);
        setMeta(data.meta);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm, statusFilter]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Хэрэглэгч удирдлага</h1>
          <p className="text-muted-foreground">
            Бүх хэрэглэгчийг хянах, удирдах
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Хэрэглэгч нэмэх
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Нэр, утас, имэйлээр хайх..."
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
              <option value="pending">Хүлээгдэж буй</option>
              <option value="suspended">Түр хаасан</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Бүх хэрэглэгч ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Нэр</TableHead>
                <TableHead>Холбоо барих</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Үнэлгээ</TableHead>
                <TableHead>Баталгаажилт</TableHead>
                <TableHead className="text-right">Үйлдэл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {user.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{user.phone}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    {user.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{user.rating}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Үнэлгээ байхгүй
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.verified ? (
                      <Badge variant="success">Баталгаажсан</Badge>
                    ) : (
                      <Badge variant="secondary">Хүлээгдэж буй</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
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

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={() => {
            // Refresh the users list after update
            const fetchUsers = async () => {
              try {
                const data = await api.users.getUsers({
                  search: searchTerm,
                  status: statusFilter,
                  page: 1,
                  limit: 20,
                });
                setUsers(data.users);
                setMeta(data.meta);
              } catch (error) {
                console.error('Failed to refresh users:', error);
              }
            };
            fetchUsers();
          }}
        />
      )}

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            // Refresh the users list after adding new user
            const fetchUsers = async () => {
              try {
                const data = await api.users.getUsers({
                  search: searchTerm,
                  status: statusFilter,
                  page: 1,
                  limit: 20,
                });
                setUsers(data.users);
                setMeta(data.meta);
              } catch (error) {
                console.error('Failed to refresh users:', error);
              }
            };
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
