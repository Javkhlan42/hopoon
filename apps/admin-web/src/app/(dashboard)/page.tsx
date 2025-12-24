import {
  ActiveRidesCard,
  TotalUsersCard,
  RevenueCard,
  SOSAlertsCard,
} from '../../components/dashboard/StatCard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';

export default function AdminPage() {
  // Mock data - будет заменено на API вызовы
  const stats = {
    activeRides: 45,
    totalUsers: 12543,
    revenue: 8542000,
    sosAlerts: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ActiveRidesCard count={stats.activeRides} />
        <TotalUsersCard count={stats.totalUsers} />
        <RevenueCard amount={stats.revenue} />
        <SOSAlertsCard count={stats.sosAlerts} />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium">Ulaanbaatar → Darkhan</p>
                    <p className="text-sm text-muted-foreground">
                      Driver: Болд Б.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₮15,000</p>
                    <p className="text-xs text-muted-foreground">2 seats</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium">User {i}</p>
                      <p className="text-sm text-muted-foreground">
                        +976 9999 {i}000
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    2 min ago
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
