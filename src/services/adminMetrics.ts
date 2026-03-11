import { getInsforgeClient } from '../lib/insforgeClient';

export interface AdminDashboardMetrics {
  newRegistrationsThisWeek: number;
  verifiedCount: number;
  unverifiedCount: number;
  totalUsers: number;
  onboardingCompletedCount: number;
  onboardingCompletionRate: number;
  vehiclesPerUser: number;
  upcomingReminderCount: number;
  overdueReminderCount: number;
  totalVehicles: number;
}

export async function fetchAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const empty: AdminDashboardMetrics = {
    newRegistrationsThisWeek: 0,
    verifiedCount: 0,
    unverifiedCount: 0,
    totalUsers: 0,
    onboardingCompletedCount: 0,
    onboardingCompletionRate: 0,
    vehiclesPerUser: 0,
    upcomingReminderCount: 0,
    overdueReminderCount: 0,
    totalVehicles: 0,
  };

  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database.rpc('admin_dashboard_metrics');

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load admin dashboard metrics.', error);
      return empty;
    }

    const m = data as Record<string, unknown>;
    const totalUsers = (m.totalUsers as number) ?? 0;
    const onboardingCompletedCount = (m.onboardingCompletedCount as number) ?? 0;

    return {
      newRegistrationsThisWeek: (m.newRegistrationsThisWeek as number) ?? 0,
      verifiedCount: (m.verifiedCount as number) ?? 0,
      unverifiedCount: (m.unverifiedCount as number) ?? 0,
      totalUsers,
      onboardingCompletedCount,
      onboardingCompletionRate:
        totalUsers > 0 ? Math.round((onboardingCompletedCount / totalUsers) * 100) : 0,
      vehiclesPerUser: Number((m.vehiclesPerUser as number) ?? 0),
      upcomingReminderCount: (m.upcomingReminderCount as number) ?? 0,
      overdueReminderCount: (m.overdueReminderCount as number) ?? 0,
      totalVehicles: (m.totalVehicles as number) ?? 0,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Admin metrics service failed.', err);
    return empty;
  }
}
