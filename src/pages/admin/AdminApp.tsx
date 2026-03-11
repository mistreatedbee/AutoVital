import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { UserManagement } from './UserManagement';
import { VehicleManagement } from './VehicleManagement';
import { MaintenanceManagement } from './MaintenanceManagement';
import { FuelManagement } from './FuelManagement';
import { DocumentsManagement } from './DocumentsManagement';
import { AlertsControl } from './AlertsControl';
import { PricingManagement } from './PricingManagement';
import { SubscriptionsManagement } from './SubscriptionsManagement';
import { ContentManagement } from './ContentManagement';
import { RolesManagement } from './RolesManagement';
import { AuditLogsPage } from './AuditLogsPage';
import { AdminAnalytics } from './AdminAnalytics';
import { SupportTickets } from './SupportTickets';
import { AdminSettings } from './AdminSettings';
export function AdminApp() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/vehicles" element={<VehicleManagement />} />
        <Route path="/maintenance" element={<MaintenanceManagement />} />
        <Route path="/fuel" element={<FuelManagement />} />
        <Route path="/documents" element={<DocumentsManagement />} />
        <Route path="/alerts" element={<AlertsControl />} />
        <Route path="/pricing" element={<PricingManagement />} />
        <Route path="/subscriptions" element={<SubscriptionsManagement />} />
        <Route path="/content" element={<ContentManagement />} />
        <Route path="/roles" element={<RolesManagement />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
        <Route path="/analytics" element={<AdminAnalytics />} />
        <Route path="/support" element={<SupportTickets />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>);

}