import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DashboardHome } from './DashboardHome';
import { MyVehicles } from './MyVehicles';
import { VehicleDetails } from './VehicleDetails';
import { VehicleForm } from './VehicleForm';
import { MaintenanceLog } from './MaintenanceLog';
import { FuelTracker } from './FuelTracker';
import { MileageTracker } from './MileageTracker';
import { AlertsReminders } from './AlertsReminders';
import { Documents } from './Documents';
import { ReportsAnalytics } from './ReportsAnalytics';
import { BillingSubscription } from './BillingSubscription';
import { ProfileSettings } from './ProfileSettings';
export function DashboardApp() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/vehicles" element={<MyVehicles />} />
        <Route path="/vehicles/new" element={<VehicleForm mode="create" />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/vehicles/:id/edit" element={<VehicleForm mode="edit" />} />
        <Route path="/maintenance" element={<MaintenanceLog />} />
        <Route path="/fuel" element={<FuelTracker />} />
        <Route path="/mileage" element={<MileageTracker />} />
        <Route path="/alerts" element={<AlertsReminders />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/reports" element={<ReportsAnalytics />} />
        <Route path="/billing" element={<BillingSubscription />} />
        <Route path="/settings" element={<ProfileSettings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>);

}