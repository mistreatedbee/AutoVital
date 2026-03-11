# AutoVital

Vehicle management platform — track maintenance, fuel, documents, and more for all your vehicles.

## Getting Started

1. Install dependencies: `npm install`
2. Copy environment variables: `cp .env.example .env` (or create `.env` manually)
3. Configure the required variables (see Environment below)
4. Run the dev server: `npm run dev`
5. Build for production: `npm run build`
6. Preview production build: `npm run preview`

## Environment

Create a `.env` file in the project root with:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_INSFORGE_URL` | InsForge backend URL | Yes |
| `VITE_INSFORGE_ANON_KEY` | InsForge anonymous/public key | Yes |
| `VITE_ADMIN_EMAILS` | Comma-separated admin email allowlist (e.g. `admin@company.com`) | For `/admin` routes |

See `.env.example` for the template.
