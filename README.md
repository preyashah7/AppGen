# AppGen

AppGen is a config-driven app generator for building internal tools, admin panels, and lightweight business apps without hand-coding each screen. Instead of starting from a blank frontend, you define an app with JSON configuration and AppGen turns that into working pages for dashboards, record management, and operational workflows.

It is designed for teams that need to move quickly on data-heavy products such as task trackers, restaurant back offices, CRM-like panels, inventory apps, and custom admin dashboards.

## What AppGen Does

AppGen lets you:

- create a new app from a template or from scratch
- define entities, fields, pages, and dashboard widgets through config
- manage records with generated CRUD screens
- import and export records as CSV
- view app metrics and recent activity on a live dashboard
- update app structure without rebuilding the whole frontend
- keep everything behind user authentication and app-level navigation

## Product Flow

The product experience is intentionally simple:

1. Create an app and choose a starting template.
2. Customize the app config with entities, fields, and pages.
3. Use the generated UI to create, edit, and review records.
4. Add dashboard widgets to summarize the most important activity.
5. Export or import data when you need to move information in and out of the system.

## How It Is Structured

The repository is split into two main parts:

- [backend/](backend) is the Node + TypeScript API that handles auth, app management, configuration, records, and notifications.
- [frontend/](frontend) is the Vite + React app that powers the landing page, app builder, generated runtime, and admin experience.

The backend uses Prisma for database access and migrations. The frontend renders the app experience from configuration rather than hardcoded screens.

## Key Capabilities

- config-first app generation
- dynamic entity and field definitions
- dashboard widgets for stats, charts, and recent records
- CSV import/export support
- login and signup flows
- app creation from templates such as task manager, restaurant dashboard, and blank starter apps
- GitHub export for app configuration
- notification pages for app activity

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Monaco Editor, Recharts
- Backend: Node.js, Express, TypeScript, Prisma
- Data: relational database via Prisma datasource configuration

## Deployment

The project is set up for a split deployment:

- backend on Render
- frontend on Vercel
- environment-driven API URL and CORS configuration

The repository includes `render.yaml` and `vercel.json` to help with deployment setup.

## Run It Locally

Prerequisites:

- Node 18+ recommended
- npm
- a database for the backend, with PostgreSQL recommended for production and local Prisma support for development

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env` from `backend/.env.example` and set values such as:

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/appgen"
JWT_SECRET=your_jwt_secret_here
PORT=3001
```

Start the API:

```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env` if you need a custom API base URL:

```bash
VITE_API_BASE_URL=http://localhost:3001
```

Start the UI:

```bash
npm run dev
```

Open the app in the browser at the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Database Migrations

When you change the schema, run Prisma migrations from the backend folder:

```bash
cd backend
npx prisma migrate dev --name "your_migration_name"
npx prisma generate
```

For production deployments, use `prisma migrate deploy` or the deployment pipeline configured for your host.

## Build For Production

Backend:

```bash
cd backend
npm run build
npm start
```

Frontend:

```bash
cd frontend
npm run build
```

## Troubleshooting

- If the frontend cannot reach the API, confirm `VITE_API_BASE_URL` and the backend `CORS_ORIGIN` value.
- If Prisma migrations fail, confirm the database connection string and that the database user has permission to create tables and schemas.

## Testing

Run tests from the package folders if they are available:

```bash
cd backend && npm test
cd frontend && npm test
```

## License

This project is provided as-is. Add your preferred license file if you plan to publish or distribute it.