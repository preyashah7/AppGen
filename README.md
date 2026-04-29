# AppGen

AppGen is a low-code app generator and administration UI that lets you configure entities, pages, and dashboards and then manage records in a hosted or local environment.

This repository contains two main parts:

- `backend/` — Node + TypeScript API, Prisma schema and migrations, business logic and API routes.
- `frontend/` — Vite + React UI for the admin console and app runtime.

## Key Features

- Dynamic entity configuration via `config.json` and admin UI
- CSV import/export for records
- Built-in authentication + multi-tenant app support
- Dashboard widgets and CRUD UI generated from config

---

## Prerequisites

- Node 18+ (recommended)
- npm or yarn
- PostgreSQL (or other database) for production; SQLite works for local testing via Prisma
- Git (for code and migration history)

## Quickstart (development)

Clone the repo and run backend + frontend in parallel.

```bash
# from project root (this README location)
cd backend
npm install
# create a .env based on .env.example (see backend folder)
npm run dev

# in another terminal
cd frontend
npm install
npm run dev
```

Open the UI at `http://localhost:5173` (or the port shown by Vite).

### Environment variables

Create `.env` files for each service (do not commit secrets):

- `backend/.env` should contain database URL and any auth/secret keys, example:

```
DATABASE_URL="postgresql://user:pass@localhost:5432/appgen"
JWT_SECRET=your_jwt_secret_here
PORT=5174
```

- `frontend/.env` may contain API base URL if needed (e.g. `VITE_API_BASE_URL=http://localhost:5174`).

## Database migrations (Prisma)

After making schema changes run:

```bash
cd backend
npx prisma migrate dev --name "your_migration_name"
npx prisma generate
```

For production use `prisma migrate deploy`.

## Building for production

Backend:

```bash
cd backend
npm run build
# start the built server
npm start
```

Frontend:

```bash
cd frontend
npm run build
# serve the `dist` folder with a static server or integrate into your backend
```

## Deployment notes

- Use environment variables (secrets) from your deployment platform.
- Use a managed database (Postgres preferred) for production and sync schema using `npx prisma db push` in the deployment pipeline.
- Secure `JWT_SECRET` and any tokens; rotate them if leaked.

### Deploy Backend on Render

1. Create a new Web Service on Render from this repository.
2. Set the root directory to `backend`.
3. Use these commands:

```bash
Build Command: npm install && npx prisma generate && npx prisma db push && npm run build
Start Command: npm run start
```

4. Set environment variables in Render:

```bash
NODE_VERSION=20
PORT=3001
JWT_SECRET=<strong-random-secret>
DATABASE_PROVIDER=postgresql
DATABASE_URL=<render-postgres-internal-url>
CORS_ORIGIN=<your-vercel-url>
```

5. Verify health endpoint after deploy:

```bash
https://<your-render-service>.onrender.com/health
```

### Deploy Frontend on Vercel

1. Import this repository into Vercel.
2. Keep project root at repository root; `vercel.json` will build `frontend` and publish `frontend/dist`.
3. Set environment variable in Vercel:

```bash
VITE_API_BASE_URL=https://<your-render-service>.onrender.com
```

4. Deploy and open your Vercel URL.
5. Update Render `CORS_ORIGIN` with the exact Vercel URL and redeploy Render if needed.

### Order of Deployment

1. Deploy Render backend first and copy its URL.
2. Deploy Vercel frontend with `VITE_API_BASE_URL` set to that backend URL.
3. Set Render `CORS_ORIGIN` to the final Vercel URL.
4. Re-test login, app list, dashboard, record CRUD, CSV import, and notifications.

## Testing

If there are tests, run them from the respective package folders:

```bash
cd backend && npm test
cd frontend && npm test
```

## Troubleshooting

- If the frontend can't reach the API, confirm `VITE_API_BASE_URL` or same-origin proxy in Vite config.
- If migrations fail, ensure the database URL is correct and the user has permission to create schemas/tables.

## Contributing

- Keep migrations in `backend/prisma/migrations` for schema history.
- Run linting and tests before opening a PR.
- Describe breaking changes in the PR description.

## License

This project is provided as-is; add your preferred license in this README or in a `LICENSE` file.
