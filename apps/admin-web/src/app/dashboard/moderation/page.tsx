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
import { AlertTriangle, CheckCircle, Trash2, Eye } from 'lucide-react';
import { ModerationModal } from '../../../components/modals/ModerationModal';
import api from '../../../lib/apiClient';

export default function ModerationPage() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState<any[]>([]);
  const [resolvedReports, setResolvedReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, deleted: 0 });

  // Reports датаг татаж авах
  const fetchReports = async () => {
    try {
      const data = await api.moderation.getReports({
        page: 1,
        limit: 20,
        type: 'all',
        status: 'all',
      });
      const reportsData = data.reports.map((r: any) => ({
        id: r.id,
        type:
          r.targetType === 'user'
            ? 'Хэрэглэгч'
            : r.targetType === 'ride'
              ? 'Зорчилт'
              : 'Мессеж',
        contentType: r.targetType,
        reportedBy: { name: r.reporterName, initial: r.reporterName[0] },
        reportedUser: { name: `User ${r.targetId}`, initial: 'U' },
        reason: r.reason,
        date: new Date(r.createdAt).toLocaleString('mn-MN'),
        status: r.status,
      }));
      setReports(reportsData);
      setStats({
        pending: reportsData.filter((r: any) => r.status === 'pending').length,
        approved: 0,
        deleted: 0,
      });
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleApprove = async () => {
    if (!selectedReport) return;
    try {
      await api.moderation.approveReport(
        selectedReport.id,
        'delete',
        'Админы шийдвэр',
      );
      fetchReports();
      setSelectedReport(null);
    } catch (error) {
      console.error('Failed to approve report:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedReport) return;
    try {
      await api.moderation.rejectReport(selectedReport.id, 'Буруу мэдээлэл');
      fetchReports();
      setSelectedReport(null);
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const handleWarn = async () => {
    if (!selectedReport) return;
    try {
      alert('Анхааруулга илгээгдлээ');
      console.log('Warned:', selectedReport);
      setSelectedReport(null);
    } catch (error) {
      console.error('Failed to warn:', error);
    }
  };

  const handleBan = async () => {
    if (!selectedReport) return;
    if (!confirm('Энэ хэрэглэгчийг бан хийх үү?')) return;
    try {
      await api.moderation.approveReport(
        selectedReport.id,
        'ban',
        'Хэрэглэгч бан хийгдлээ',
      );
      alert('Хэрэглэгч бан хийгдлээ');
      fetchReports();
      setSelectedReport(null);
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Алдаа гарлаа');
    }
  };

  if (loading) return <div className="p-6">Уншиж байна...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Контент хянах</h1>
        <p className="text-muted-foreground">
          Report ирсэн бичлэгүүдийг шалгах
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Хүлээгдэж буй</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Зөвшөөрсөн</p>
                <p className="text-3xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Устгасан</p>
                <p className="text-3xl font-bold">{stats.deleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Хүлээгдэж буй report-ууд</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Төрөл</TableHead>
                <TableHead>Report хийсэн</TableHead>
                <TableHead>Report ирсэн хэрэглэгч</TableHead>
                <TableHead>Шалтгаан</TableHead>
                <TableHead>Огноо</TableHead>
                <TableHead className="text-right">Үйлдэл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        report.type === 'Сэтгэгдэл'
                          ? 'default'
                          : report.type === 'Коммент'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {report.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                        {report.reportedBy.initial}
                      </div>
                      <span className="text-sm">{report.reportedBy.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-sm font-medium">
                        {report.reportedUser.initial}
                      </div>
                      <span className="text-sm">
                        {report.reportedUser.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {report.reason}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {report.date}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Шалгах
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Сүүлд хийсэн үйлдлүүд</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resolvedReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {report.id}
                  </span>
                  <Badge variant="outline">{report.type}</Badge>
                  <span className="text-sm">{report.reportedUser}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      report.action === 'Зөвшөөрсөн' ? 'success' : 'destructive'
                    }
                  >
                    {report.action}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {report.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedReport && (
        <ModerationModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onApprove={handleApprove}
          onDelete={handleDelete}
          onWarn={handleWarn}
          onBan={handleBan}
        />
      )}
    </div>
  );
}
