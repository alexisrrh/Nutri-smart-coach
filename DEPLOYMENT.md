# NutriSmart Coach Deployment

This repo deploys as two separate services:

- Frontend: React/Vite on Vercel.
- Backend: Express API on Render or Railway.

## Frontend on Vercel

Use the repository root as the Vercel project root.

Build settings:

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

Required Vercel environment variables:

```bash
VITE_API_URL=https://your-backend.example.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Optional frontend variables:

```bash
VITE_PROFILE_API_ENABLED=false
VITE_DEBUG_DASHBOARD_TIMING=false
```

`VITE_API_URL` must point to the deployed backend origin, without a trailing slash.
For local development, use `VITE_API_URL_DEV=http://127.0.0.1:3000`.

The existing `vercel.json` rewrites frontend routes to `index.html`, which is correct for a Vite single page app.

## Backend on Render or Railway

Use `backend` as the service root.

Start settings:

- Install command: `npm install`
- Start command: `npm start`
- Development command: `npm run dev`

Required backend environment variables:

```bash
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=https://your-frontend.vercel.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...
```

Optional backend variables:

```bash
CORS_ORIGINS=https://www.yourdomain.com,https://your-preview.vercel.app
```

Render and Railway inject `PORT` automatically. Keeping `PORT=3000` is useful only for local development.

## Domains

Recommended production setup:

- Frontend primary domain: `https://www.nutrismartcoach.com`
- Optional apex redirect: `https://nutrismartcoach.com`
- Backend API domain: `https://api.nutrismartcoach.com`

Set `VITE_API_URL=https://api.nutrismartcoach.com` in Vercel.
Set `FRONTEND_URL=https://www.nutrismartcoach.com` in the backend.
If the frontend also serves the apex domain, add it to `CORS_ORIGINS`.

## CORS

The backend allows:

- Local Vite origins: `localhost` and `127.0.0.1` on ports `5173`, `5174`, and `5175`.
- `FRONTEND_URL`.
- Any extra origins listed in `CORS_ORIGINS`.

Do not rely on wildcard Vercel origins in production. Add each preview or custom domain explicitly to `CORS_ORIGINS` when needed.

## Supabase

Frontend uses only:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Backend uses:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Never expose `SUPABASE_SERVICE_ROLE_KEY` in Vercel frontend variables.

Apply all SQL files in `supabase/migrations` before production traffic. The backend expects tables and policies for profiles, diet plans, meal analyses, check-ins, workout data, and `meal_logs` diet progress.

## Stripe

Premium subscriptions use Stripe Checkout, Stripe Billing Portal, and a signed webhook.

Backend variables:

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...
FRONTEND_URL=https://www.nutrismartcoach.com
```

Stripe webhook endpoint:

```bash
POST https://api.nutrismartcoach.com/stripe/webhook
```

Subscribe this endpoint to at least:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Premium state is stored in `profiles` and must only be changed by the backend webhook flow. The frontend can request Checkout or the Billing Portal, but it must not mark a user as premium.

## Health Checks

Backend health check:

```bash
GET /health
```

Expected response shape:

```json
{
  "ok": true,
  "service": "nutrismartcoach-api",
  "uptime": 123.45,
  "timestamp": "2026-05-31T00:00:00.000Z"
}
```

Use `/health` as the Render/Railway health check path.

## Local Development

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
npm install
npm run dev
```

Local frontend should use:

```bash
VITE_API_URL_DEV=http://127.0.0.1:3000
```

Local backend should include:

```bash
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Production Checklist

- Vercel has all `VITE_*` variables configured.
- Backend has all required private variables configured.
- `VITE_API_URL` matches the backend public URL.
- `FRONTEND_URL` and `CORS_ORIGINS` include every frontend domain.
- Supabase migrations have been applied.
- Supabase storage buckets used by food photos and check-ins exist.
- `/health` returns HTTP 200 after deployment.
- `SUPABASE_SERVICE_ROLE_KEY` exists only in backend hosting.
