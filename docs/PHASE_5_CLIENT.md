# Phase 5 – Client Dashboard & Onboarding Hardening

## Overview

This document summarizes the Phase 5 hardening work for the client dashboard, registration/onboarding flows, and South Africa (SA) defaults.

---

## Auth & Route Guards

### Route hierarchy

- **`ProtectedRoute`** – Requires authenticated user. Shows `AuthRouteLoading` while session resolves; redirects to `/login` if no user.
- **`RequireEmailVerified`** – Requires verified email. Redirects unverified users to `/verify-email`. Must be inside `ProtectedRoute`.
- **`OnboardingRoute`** – Wraps `/onboarding`. Redirects to `/dashboard` if onboarding is already complete (`completed_at` set). Shows loading while onboarding progress is fetched.
- **`RequireOnboardingComplete`** – Wraps `/dashboard/*`. Redirects to `/onboarding` if user has not completed onboarding. Shows loading while progress is fetched.

### Redirect-loop safety

- All guards show loading states while their respective data is resolving.
- Redirects only occur when `loading` is false.
- `/verify-email` is outside `RequireEmailVerified`, so unverified users can always reach it.
- `OnboardingRoute` and `RequireOnboardingComplete` both use `useOnboardingProgress` and interpret `isComplete` from `completedAt` consistently.

---

## Onboarding

### Persistence

- Each step writes to `onboarding_progress` via `upsertOnboardingProgress`:
  - Step 1: Profile fields + `profileCompleted`, `currentStep: 2`
  - Step 2: Vehicle (or skip) + `vehicleAdded`, `currentStep: 3`
  - Step 3: Service baseline + `serviceBaselineCompleted`, `currentStep: 4`
  - Step 4: Reminders + `remindersCompleted`, `currentStep: 5`
- Autosave writes step-specific JSON to `step_data` (debounced 500ms).
- `loadInitialData` rehydrates state from `step_data` when resuming across sessions.

### SA defaults

- Profile defaults: `country: 'ZA'`, `currency: 'ZAR'`, `mileageUnit: 'km'`, `fuelUnit: 'litres'`, `timezone: 'Africa/Johannesburg'`, `locale: 'en'`.
- `saveProfileStep` persists these when fields are empty.
- `resetOnboardingProgress` resets client state to these defaults.

---

## SA Defaults & Units

### Where defaults are set

- **Bootstrap** (`authBootstrap.ts`): New users get `measurement_system: 'metric'`, `country: 'ZA'`, `currency: 'ZAR'`, `mileage_unit: 'km'`, `fuel_unit: 'litres'`, `timezone: 'Africa/Johannesburg'`.
- **Onboarding**: Profile step uses the same defaults.
- **Profile Settings**: Country, currency, timezone, and units are editable; defaults are SA-centric.

### Propagation

- Profile and service preference updates invalidate:
  - `['profile', user.id]`
  - `queryKeys.dashboard.overview(accountId)`
  - `queryKeys.fuel.all`
  - `queryKeys.maintenance.all`
- Fuel, maintenance, reports, and dashboard read profile for currency/units and update when caches are invalidated.

---

## Reports & Analytics

### ZAR/km/litre logic

- Costs are stored in cents (ZAR).
- Distances are in km; volumes in litres.
- `reports.ts` aggregates maintenance and fuel by month and by vehicle; cost-per-km uses km.
- `formatCurrencyZAR` formats cents to ZAR display.
- Charts and exports explicitly label amounts as ZAR and distances as km.

### Exports

- **Monthly CSV**: `exportMonthlyCostTrendsToCsv` – month, maintenance (ZAR), fuel (ZAR), total (ZAR).
- **Vehicle CSV**: `exportVehicleBreakdownToCsv` – vehicle, maintenance, fuel, total, distance_km, cost_per_km (ZAR).

---

## React Query Cache Invalidation

Mutations that affect dashboard or reports invalidate:

| Mutation | Invalidates |
|----------|-------------|
| `useUpsertVehicle` | vehicles list, vehicle detail, dashboard overview |
| `useArchiveVehicle` | vehicles list, vehicle detail, dashboard overview |
| `useCreateMaintenanceLog` / `useUpdateMaintenanceLog` | maintenance list, maintenance all, dashboard overview, reports monthly, reports vehicles |
| `useCreateFuelLog` | fuel all, dashboard overview, reports monthly, reports vehicles |
| `useUploadDocument` / `useDeleteDocument` | documents list, dashboard overview |
| Profile update (ProfileSettings) | profile, dashboard overview, fuel all, maintenance all |

---

## Adding New Metrics

To add new metrics or reports:

1. Define query keys in `queryKeys.ts` (e.g. `reports.myNewReport(accountId)`).
2. Create a `useQuery` that fetches from your service.
3. Ensure relevant mutations invalidate the new query key so data stays fresh.
