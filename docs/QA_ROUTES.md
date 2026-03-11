# Route-by-Route Testing Checklist

Use this checklist for manual smoke-testing. Verify each route renders without crashing and core flows work.

## Public Routes

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Landing page | |
| `/features` | Features page | |
| `/how-it-works` | How it works | |
| `/pricing` | Pricing page | |
| `/about` | About page | |
| `/contact` | Contact page | |
| `/blog` | Blog listing | |
| `/blog/:slug` | Blog article (test with valid & invalid slug) | |
| `/terms` | Terms of Service | |
| `/privacy` | Privacy Policy | |
| `/faq` | FAQ page | |
| `/cookies` | Cookies page | |
| `/security` | Security page | |
| `/careers` | Careers page | |
| `/changelog` | Changelog page | |

## Auth Routes (unauthenticated access)

| Route | Description | Status |
|-------|-------------|--------|
| `/login` | Login form | |
| `/signup` | Sign up form | |
| `/forgot-password` | Password reset request | |
| `/reset-password` | Set new password | |
| `/verify-email` | Email verification prompt | |
| `/welcome` | Welcome / post-signup | |

## Onboarding

| Route | Description | Status |
|-------|-------------|--------|
| `/onboarding` | Onboarding flow | |

## Dashboard Routes (requires auth)

| Route | Description | Status |
|-------|-------------|--------|
| `/dashboard` | Dashboard home | |
| `/dashboard/vehicles` | My Vehicles | |
| `/dashboard/vehicles/new` | Add vehicle form | |
| `/dashboard/vehicles/:id` | Vehicle details (test valid & invalid ID) | |
| `/dashboard/vehicles/:id/edit` | Edit vehicle | |
| `/dashboard/maintenance` | Maintenance log | |
| `/dashboard/fuel` | Fuel tracker | |
| `/dashboard/mileage` | Mileage tracker | |
| `/dashboard/alerts` | Alerts & reminders | |
| `/dashboard/documents` | Documents | |
| `/dashboard/reports` | Reports & analytics | |
| `/dashboard/billing` | Billing & subscription | |
| `/dashboard/settings` | Profile settings | |

## Admin Routes (requires admin email in VITE_ADMIN_EMAILS)

| Route | Description | Status |
|-------|-------------|--------|
| `/admin` | Admin dashboard | |
| `/admin/users` | User management | |
| `/admin/vehicles` | Vehicle management | |
| `/admin/maintenance` | Maintenance management | |
| `/admin/fuel` | Fuel management | |
| `/admin/documents` | Documents management | |
| `/admin/alerts` | Alerts control | |
| `/admin/pricing` | Pricing management | |
| `/admin/subscriptions` | Subscriptions management | |
| `/admin/content` | Content management | |
| `/admin/roles` | Roles management | |
| `/admin/audit-logs` | Audit logs | |
| `/admin/analytics` | Admin analytics | |
| `/admin/support` | Support tickets | |
| `/admin/settings` | Admin settings | |

## Edge Cases

| Scenario | Expected | Status |
|----------|----------|--------|
| Unauthenticated user visits `/dashboard` | Redirect to `/login` with state | |
| Unauthenticated user visits `/admin` | Redirect to `/login` | |
| Non-admin visits `/admin` | Redirect to `/dashboard` | |
| Invalid vehicle ID `/dashboard/vehicles/bad-id` | ErrorState + Back button | |
| Invalid blog slug `/blog/nonexistent` | "Article not found" + Back link | |
| Unknown route `/*` | NotFoundPage | |
| Login then redirect back to originally requested route | Should land on that route | |

## Responsive Breakpoints

Test critical flows at:
- **375px** (mobile)
- **768px** (tablet)
- **1280px** (desktop)
