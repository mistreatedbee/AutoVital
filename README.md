# AutoVital

Vehicle management platform — track maintenance, fuel, documents, and more for all your vehicles.

## Getting Started

1. Install dependencies: `npm install`
2. Copy environment variables: `cp .env.example .env` (or create `.env` manually)
3. Configure the required variables (see Environment below)
4. Run the dev server: `npm run dev`
5. Build for production: `npm run build`
6. Preview production build: `npm run preview`
7. Deploy to Vercel or your preferred hosting provider.

## Environment

Create a `.env` file in the project root with:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_INSFORGE_URL` | InsForge backend URL (e.g. `https://{appkey}.{region}.insforge.app`) | Yes |
| `VITE_INSFORGE_ANON_KEY` | InsForge anonymous/public key | Yes |
| `VITE_ADMIN_EMAILS` | Comma-separated System Admin email allowlist | For `/admin` routes |
| `VITE_AVATARS_BUCKET` | Storage bucket for avatars (default: `avatars`) | Optional |
| `VITE_VEHICLE_IMAGES_BUCKET` | Storage bucket for vehicle images (default: `vehicle-images`) | Optional |
| `VITE_DOCUMENTS_BUCKET` | Storage bucket for documents (default: `vehicle-documents`) | Optional |

Obtain `VITE_INSFORGE_URL` and `VITE_INSFORGE_ANON_KEY` from `insforge metadata --json` or the InsForge dashboard (after `insforge link`).

See `.env.example` for the template.

## Edge Function Secrets

Edge functions run on InsForge and require secrets set via `insforge secrets add`:

| Secret | Used By | Description |
|--------|---------|-------------|
| `INSFORGE_URL` | All functions | InsForge backend base URL |
| `INSFORGE_ANON_KEY` | All functions | InsForge anon/public key |
| `INSFORGE_SERVICE_ROLE_KEY` | check-document-expiry, send-welcome-email, admin-* | Admin API access (never expose in frontend) |
| `SENDGRID_API_KEY` | send-welcome-email | SendGrid API key for transactional email |

## Admin Setup

See [docs/ADMIN_SETUP.md](docs/ADMIN_SETUP.md) for creating System Admin and Company Admin accounts.
