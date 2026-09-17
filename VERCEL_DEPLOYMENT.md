# Vercel Deployment Configuration

This repository contains two deployable applications:

- `frontend/` — React + Vite (recommended on Vercel)
- `backed/` — Django API (Vercel supports Django through its Python runtime, but production database and uploaded files must be external/persistent)

## Recommended production layout

The most straightforward layout is:

    Frontend: Vercel
    Django API: Vercel, Railway, Render, Fly.io, or another Python host
    Database: Managed PostgreSQL
    Material files: S3 / Cloudflare R2 / another S3-compatible bucket
    Payments: Flutterwave

If you place Django on Vercel, do not depend on SQLite or the local filesystem for persistent production data/files.

---

## A. Deploy the frontend to Vercel

Create a Vercel project from this repository and set:

    Root Directory: frontend
    Framework Preset: Vite
    Build Command: npm run build
    Output Directory: dist

`frontend/vercel.json` is already included and contains the SPA rewrite needed for React Router.

### Frontend environment variables

In Vercel -> Project -> Settings -> Environment Variables:

    VITE_API_URL=https://YOUR-BACKEND-DOMAIN/api
    VITE_BACKEND_URL=https://YOUR-BACKEND-DOMAIN

If you use Google sign-in elsewhere in the project:

    VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com

Do **not** add Flutterwave secret keys to the frontend project.

After changing any `VITE_*` value, redeploy the frontend because Vite embeds these variables at build time.

---

## B. Deploy Django to Vercel

Create a second Vercel project from the same repository and set:

    Root Directory: backed

Vercel can detect the Django `manage.py` project and use the Python runtime. `backed/vercel.json` is included and runs `collectstatic` during the build.

### Backend environment variables

Required:

    DJANGO_SECRET_KEY=GENERATE-A-STRONG-RANDOM-SECRET
    DJANGO_DEBUG=False
    DJANGO_ALLOWED_HOSTS=YOUR-BACKEND.vercel.app,.vercel.app
    DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
    FRONTEND_URL=https://YOUR-FRONTEND.vercel.app
    CORS_ALLOWED_ORIGINS=https://YOUR-FRONTEND.vercel.app
    CSRF_TRUSTED_ORIGINS=https://YOUR-FRONTEND.vercel.app

Flutterwave:

    FLW_SECRET_KEY=FLWSECK_TEST-...   # later replace with LIVE key
    FLW_SECRET_HASH=YOUR-RANDOM-WEBHOOK-HASH
    FLW_BASE_URL=https://api.flutterwave.com/v3
    FLW_HTTP_TIMEOUT=25

Optional Google auth:

    GOOGLE_OAUTH_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com

### Persistent material storage

Vercel serverless filesystems are not suitable for permanent user uploads. This project automatically uses S3 storage when `AWS_STORAGE_BUCKET_NAME` is set.

For AWS S3:

    AWS_STORAGE_BUCKET_NAME=your-bucket
    AWS_ACCESS_KEY_ID=...
    AWS_SECRET_ACCESS_KEY=...
    AWS_S3_REGION_NAME=...

For Cloudflare R2 or another S3-compatible service, also set:

    AWS_S3_ENDPOINT_URL=https://YOUR-ENDPOINT
    AWS_S3_CUSTOM_DOMAIN=YOUR-PUBLIC-OR-CUSTOM-DOMAIN   # optional

Do not expose the bucket publicly if you want paid files protected. The Django download endpoint streams the file only after access checks.

---

## C. Run production migrations and seed the store

The Vercel build configuration intentionally does not mutate your production database. Run these once against your production `DATABASE_URL` from a trusted shell/CI environment:

    python manage.py migrate
    python manage.py seed_store

Create an administrator if needed:

    python manage.py createsuperuser

The branded admin login is:

    https://YOUR-FRONTEND.vercel.app/admin/login

It authenticates against Django JWT instead of using hard-coded demo credentials.

---

## D. Flutterwave webhook on production

In Flutterwave Dashboard -> Webhooks, set:

    https://YOUR-BACKEND-DOMAIN/api/store/flutterwave/webhook/

Use the exact same secret hash as the backend's `FLW_SECRET_HASH`.

---

## E. Verification after deployment

Backend health check:

    https://YOUR-BACKEND-DOMAIN/api/health/

Expected:

    {"service":"research-blueprint-api","status":"ok"}

Public materials API:

    https://YOUR-BACKEND-DOMAIN/api/store/materials/

Then open the frontend and verify:

1. Materials load from Django.
2. Admin login works with a Django admin/editor account.
3. A real file can be uploaded and then downloaded as a free material.
4. A paid material shows MTN/Airtel checkout.
5. Flutterwave TEST payment becomes `paid`.
6. The secure download button appears only after verification.
7. Revenue appears under Admin -> Sales & revenue.

---

## Security notes

Never commit or upload these files/directories:

    .env
    .env.local
    .vercel/
    db.sqlite3
    node_modules/
    venv/
    .venv/

The clean ZIP supplied with this implementation excludes local deployment credentials, local databases and virtual environments.

## Payout environment variables

Add these to the **backend** Vercel project only:

```env
FLW_PAYOUT_MOBILE_NUMBER=256762640590
FLW_PAYOUT_BANK_CODE=MPS
FLW_PAYOUT_BENEFICIARY_NAME=Research Skills Payout
FLW_AUTO_PAYOUT=False
```

Do not add them as `VITE_*` variables. Payout execution must remain server-side.

After deploying the updated backend, run the new database migration:

```bash
python manage.py migrate
```

The migration creates the `StorePayout` table used to track payouts to the configured destination.
