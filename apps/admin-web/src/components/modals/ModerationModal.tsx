'use client';

import { X, AlertTriangle, Eye, User, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface ModerationModalProps {
  report: any;
  onClose: () => void;
  onApprove: () => void;
  onDelete: () => void;
  onWarn: () => void;
  onBan: () => void;
}

export function ModerationModal({
  report,
  onClose,
  onApprove,
  onDelete,
  onWarn,
  onBan,
}: ModerationModalProps) {
  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold">Report дэлгэрэнгүй</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Report Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Report мэдээлэл</CardTitle>
                <Badge variant="destructive">{report.id}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Төрөл</p>
                  <p className="font-medium">{report.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Огноо</p>
                  <p className="font-medium">{report.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Шалтгаан</p>
                  <Badge variant="destructive">{report.reason}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Статус</p>
                  <Badge variant="secondary">Хүлээгдэж буй</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reporter Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Report хийсэн хүн</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {report.reportedBy?.initial || 'R'}
                </div>
                <div>
                  <p className="font-medium">
                    {report.reportedBy?.name || 'Хэрэглэгч'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    +976 9999 1234
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reported User */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <CardTitle>Report ирсэн хэрэглэгч</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg">
                  {report.reportedUser?.initial || 'U'}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {report.reportedUser?.name || 'Хэрэглэгч'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    +976 9999 5678
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">45 аялал</Badge>
                    <Badge variant="success">4.5 үнэлгээ</Badge>
                    <Badge variant="default">3 сарын турш</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>Бичлэгийн агуулга</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm">
                  {report.contentType === 'post' &&
                    'Энэ бол сэтгэгдлийн жишээ текст юм. Хэрэглэгчийн бичсэн агуулга энд харагдана. Доромжилсон эсвэл зохисгүй үг хэллэг агуулж болно.'}
                  {report.contentType === 'comment' &&
                    'Коммент дахь текст: Та муу жолооч байна.'}
                  {report.contentType === 'user' &&
                    'Хэрэглэгчийн profile: Хуурамч эрх ашиглаж байгаа сэжигтэй.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Context */}
          <Card>
            <CardHeader>
              <CardTitle>Нэмэлт мэдээлэл</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Аялал ID:</strong> RIDE-12345
                </p>
                <p>
                  <strong>Огноо:</strong> 2024-12-20 15:30
                </p>
                <p>
                  <strong>Байршил:</strong> Улаанбаатар → Дархан
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 justify-end border-t pt-4">
            <Button variant="default" onClick={onApprove}>
              <Eye className="mr-2 h-4 w-4" />
              Зөвшөөрөх
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Устгах
            </Button>
            <Button variant="outline" onClick={onWarn}>
              Анхааруулах
            </Button>
            <Button variant="outline" onClick={onBan}>
              Бан хийх
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
