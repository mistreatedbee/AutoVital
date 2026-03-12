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

export interface RevenueByMonthPoint {
  monthKey: string;
  monthLabel: string;
  revenueCents: number;
}

export async function fetchAdminRevenueByMonth(
  months: number = 6,
): Promise<RevenueByMonthPoint[]> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database.rpc('admin_revenue_by_month', {
      p_months: months,
    });

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load admin revenue by month.', error);
      return [];
    }

    const rows = (data as { month_key: string; revenue_cents: number }[]) ?? [];
    return rows.map((r) => {
      const [y, m] = (r.month_key ?? '').split('-');
      const d = new Date(Number(y), Number(m || 1) - 1, 1);
      const monthLabel = d.toLocaleDateString('en-ZA', { month: 'short' });
      return {
        monthKey: r.month_key,
        monthLabel,
        revenueCents: Number(r.revenue_cents ?? 0),
      };
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Admin revenue by month failed.', err);
    return [];
  }
}

export interface SignupsByDayPoint {
  dayKey: string;
  dayLabel: string;
  signupCount: number;
}

export async function fetchAdminSignupsByDay(
  days: number = 7,
): Promise<SignupsByDayPoint[]> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database.rpc('admin_signups_by_day', {
      p_days: days,
    });

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load admin signups by day.', error);
      return [];
    }

    const rows = (data as { day_key: string; signup_count: number }[]) ?? [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return rows.map((r) => {
      const d = new Date(r.day_key);
      const dayLabel = dayNames[d.getDay()] ?? '';
      return {
        dayKey: r.day_key,
        dayLabel,
        signupCount: Number(r.signup_count ?? 0),
      };
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Admin signups by day failed.', err);
    return [];
  }
}
