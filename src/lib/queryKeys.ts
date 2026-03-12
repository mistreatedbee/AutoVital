/**
 * Centralized query key factory for TanStack Query.
 * Enables consistent cache invalidation and key structure.
 */
export const queryKeys = {
  vehicles: {
    all: ['vehicles'] as const,
    list: (accountId: string) => ['vehicles', 'list', accountId] as const,
    detail: (vehicleId: string) => ['vehicles', 'detail', vehicleId] as const,
  },
  maintenance: {
    all: ['maintenance'] as const,
    list: (accountId: string) => ['maintenance', 'list', accountId] as const,
    byVehicle: (vehicleId: string) => ['maintenance', 'vehicle', vehicleId] as const,
  },
  fuel: {
    all: ['fuel'] as const,
    list: (accountId: string) => ['fuel', 'list', accountId] as const,
    byVehicle: (vehicleId: string) => ['fuel', 'vehicle', vehicleId] as const,
  },
  documents: {
    all: ['documents'] as const,
    list: (accountId: string) => ['documents', 'list', accountId] as const,
  },
  mileage: {
    all: ['mileage'] as const,
    history: (vehicleId: string) => ['mileage', 'history', vehicleId] as const,
  },
  alerts: {
    all: ['alerts'] as const,
    list: (accountId: string) => ['alerts', 'list', accountId] as const,
    preferences: (accountId: string) => ['alerts', 'preferences', accountId] as const,
  },
  billing: {
    all: ['billing'] as const,
    subscription: (accountId: string) => ['billing', 'subscription', accountId] as const,
    plans: () => ['billing', 'plans'] as const,
  },
  dashboard: {
    overview: (accountId: string) => ['dashboard', 'overview', accountId] as const,
  },
  reports: {
    monthly: (accountId: string) => ['reports', 'monthly', accountId] as const,
    vehicles: (accountId: string) => ['reports', 'vehicles', accountId] as const,
  },
  blog: {
    all: ['blog'] as const,
    list: (params: { query?: string; category?: string; page?: number }) =>
      ['blog', 'list', params] as const,
    detail: (slug: string) => ['blog', 'detail', slug] as const,
  },
  admin: {
    metrics: () => ['admin', 'metrics'] as const,
    vehicles: (params?: object) => ['admin', 'vehicles', params ?? {}] as const,
    maintenance: (params?: object) => ['admin', 'maintenance', params ?? {}] as const,
    fuel: (params?: object) => ['admin', 'fuel', params ?? {}] as const,
    documents: (params?: object) => ['admin', 'documents', params ?? {}] as const,
    users: (params?: object) => ['admin', 'users', params ?? {}] as const,
    subscriptions: (params?: object) => ['admin', 'subscriptions', params ?? {}] as const,
    roles: (params?: object) => ['admin', 'roles', params ?? {}] as const,
    auditLogs: (params?: object) => ['admin', 'auditLogs', params ?? {}] as const,
    plans: () => ['admin', 'plans'] as const,
  },
  profile: {
    current: (userId: string) => ['profile', userId] as const,
  },
  consents: {
    user: () => ['consents', 'user'] as const,
  },
};
