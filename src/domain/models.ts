// Core domain models for AutoVital.
// These types are frontend-facing and should mirror the backend schema
// defined in `db/schema.sql`.

export type UUID = string;

export type PlanTier = 'starter' | 'pro' | 'fleet';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete';

export interface User {
  id: UUID;
  email: string;
  fullName: string | null;
  createdAt: string;
}

export interface Profile {
  userId: UUID;
  defaultAccountId: UUID | null;
  phoneNumber: string | null;
  measurementSystem: 'imperial' | 'metric';
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: UUID;
  name: string;
  slug: string | null;
  ownerUserId: UUID;
  createdAt: string;
  updatedAt: string;
}

export type AccountRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface AccountMember {
  id: UUID;
  accountId: UUID;
  userId: UUID;
  role: AccountRole;
  createdAt: string;
}

export interface Plan {
  id: UUID;
  code: PlanTier;
  name: string;
  priceMonthlyCents: number;
  vehicleLimit: number | null;
  features: Record<string, boolean | number | string>;
  createdAt: string;
}

export interface Subscription {
  id: UUID;
  accountId: UUID;
  planId: UUID;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  externalCustomerId: string | null; // e.g. Stripe customer id
  externalSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'other';

export interface Vehicle {
  id: UUID;
  accountId: UUID;
  ownerUserId: UUID | null;
  nickname: string | null;
  make: string;
  model: string;
  year: number | null;
  vin: string | null;
  licensePlate: string | null;
  fuelType: FuelType | null;
  currentMileage: number | null;
  healthScore: number | null;
  heroImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export type MaintenanceType =
  | 'oil_change'
  | 'tire_rotation'
  | 'inspection'
  | 'brake_service'
  | 'battery'
  | 'registration'
  | 'other';

export interface MaintenanceLog {
  id: UUID;
  accountId: UUID;
  vehicleId: UUID;
  userId: UUID | null;
  type: MaintenanceType;
  description: string | null;
  mileage: number | null;
  serviceDate: string;
  costCents: number | null;
  currency: string;
  vendorName: string | null;
  createdAt: string;
}

export interface FuelLog {
  id: UUID;
  accountId: UUID;
  vehicleId: UUID;
  userId: UUID | null;
  fillDate: string;
  odometer: number | null;
  volume: number; // gallons or liters depending on measurementSystem
  totalCostCents: number;
  pricePerUnitCents: number | null;
  currency: string;
  notes: string | null;
  createdAt: string;
}

export interface MileageLog {
  id: UUID;
  accountId: UUID;
  vehicleId: UUID;
  userId: UUID | null;
  logDate: string;
  odometer: number;
  source: 'manual' | 'fuel_fill' | 'maintenance' | 'import' | string;
  note: string | null;
  createdAt: string;
}

export type DocumentType =
  | 'insurance'
  | 'registration'
  | 'inspection'
  | 'receipt'
  | 'warranty'
  | 'other';

export interface Document {
  id: UUID;
  accountId: UUID;
  vehicleId: UUID | null;
  userId: UUID | null;
  type: DocumentType;
  name: string;
  storageBucket: string;
  storageKey: string;
  publicUrl: string | null;
  sizeBytes: number | null;
  mimeType: string | null;
  tags?: string[] | null;
  metadata?: Record<string, unknown> | null;
  deletedAt?: string | null;
  deletedByUserId?: UUID | null;
  createdAt: string;
}

export type AlertChannel = 'email' | 'in_app';

export type AlertStatus = 'pending' | 'sent' | 'resolved' | 'dismissed';

export type AlertKind =
  | 'maintenance_due'
  | 'maintenance_overdue'
  | 'document_expiring'
  | 'subscription_renewal'
  | 'health_drop';

export interface Alert {
  id: UUID;
  accountId: UUID;
  vehicleId: UUID | null;
  userId: UUID | null;
  kind: AlertKind;
  channel: AlertChannel;
  status: AlertStatus;
  title: string;
  message: string;
  scheduledAt: string | null;
  sentAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface VehicleHealthSnapshot {
  id: UUID;
  vehicleId: UUID;
  accountId: UUID;
  score: number;
  snapshotDate: string;
  createdAt: string;
}

export interface VehicleImage {
  id: UUID;
  vehicleId: UUID;
  accountId: UUID;
  url: string;
  storageBucket: string | null;
  storageKey: string | null;
  provider: string | null;
  isPrimary: boolean;
  createdAt: string;
}

