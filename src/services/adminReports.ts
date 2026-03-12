import { getInsforgeClient } from '../lib/insforgeClient';
import { formatCurrencyZAR } from '../lib/formatters';
import { fetchAdminDashboardMetrics } from './adminMetrics';
import { fetchAdminRevenueByMonth } from './adminMetrics';
import { fetchAdminSubscriptions } from './adminPlans';
import { fetchAuditLogs } from './auditLog';

export interface AdminReportData {
  generatedAt: string;
  metrics: {
    totalUsers: number;
    verifiedCount: number;
    newRegistrationsThisWeek: number;
    totalVehicles: number;
    upcomingReminderCount: number;
    overdueReminderCount: number;
  };
  revenueByMonth: { month: string; revenueCents: number }[];
  subscriptionCount: number;
  recentActivityCount: number;
}

export async function fetchAdminReportData(): Promise<AdminReportData> {
  const [metrics, revenue, subscriptions, auditResult] = await Promise.all([
    fetchAdminDashboardMetrics(),
    fetchAdminRevenueByMonth(6),
    fetchAdminSubscriptions(),
    fetchAuditLogs({ limit: 50, pageSize: 50 }),
  ]);

  const activeSubs = subscriptions.filter((s) => s.status === 'active' || s.status === 'trialing');

  return {
    generatedAt: new Date().toISOString(),
    metrics: {
      totalUsers: metrics.totalUsers,
      verifiedCount: metrics.verifiedCount,
      newRegistrationsThisWeek: metrics.newRegistrationsThisWeek,
      totalVehicles: metrics.totalVehicles,
      upcomingReminderCount: metrics.upcomingReminderCount,
      overdueReminderCount: metrics.overdueReminderCount,
    },
    revenueByMonth: revenue.map((r) => ({ month: r.monthKey, revenueCents: r.revenueCents })),
    subscriptionCount: activeSubs.length,
    recentActivityCount: auditResult.items.length,
  };
}

export function generateAdminReportCsv(data: AdminReportData): Blob {
  const rows: string[] = [
    'AutoVital Admin Report',
    `Generated,${data.generatedAt}`,
    '',
    'Platform Metrics',
    `Total Users,${data.metrics.totalUsers}`,
    `Verified Users,${data.metrics.verifiedCount}`,
    `New Registrations (This Week),${data.metrics.newRegistrationsThisWeek}`,
    `Total Vehicles,${data.metrics.totalVehicles}`,
    `Upcoming Reminders,${data.metrics.upcomingReminderCount}`,
    `Overdue Reminders,${data.metrics.overdueReminderCount}`,
    '',
    'Subscriptions',
    `Active/Trialing,${data.subscriptionCount}`,
    '',
    'Revenue by Month (ZAR)',
    'Month,Revenue (cents),Revenue (ZAR)',
    ...data.revenueByMonth.map((r) => `${r.month},${r.revenueCents},${formatCurrencyZAR(r.revenueCents)}`),
  ];
  const csv = rows.join('\n');
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

export async function generateAdminReport(): Promise<Blob> {
  const data = await fetchAdminReportData();
  return generateAdminReportCsv(data);
}
