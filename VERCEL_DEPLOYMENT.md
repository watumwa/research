# Vercel: connect the React frontend to the Django backend

The React/Vite frontend and Django backend are separate Vercel projects. They must be connected with environment variables.

## 1. Test the backend first

Open:

    https://YOUR-BACKEND.vercel.app/api/health/

Expected response:

    {"service":"research-blueprint-api","status":"ok"}

If this endpoint does not return JSON, fix the backend deployment before troubleshooting the frontend.

## 2. Frontend Vercel environment variables

In the FRONTEND Vercel project, Settings -> Environment Variables:

    VITE_API_URL=https://YOUR-BACKEND.vercel.app/api
    VITE_BACKEND_URL=https://YOUR-BACKEND.vercel.app
    VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com

Use no trailing slash. Apply the variables to Production (and Preview if you use previews), then REDEPLOY the frontend because Vite embeds VITE_* values at build time.

## 3. Backend Vercel environment variables

In the BACKEND Vercel project:

    DJANGO_SECRET_KEY=<strong random secret>
    DJANGO_DEBUG=False
    DJANGO_ALLOWED_HOSTS=YOUR-BACKEND.vercel.app,.vercel.app
    CORS_ALLOWED_ORIGINS=https://YOUR-FRONTEND.vercel.app
    CSRF_TRUSTED_ORIGINS=https://YOUR-FRONTEND.vercel.app
    FRONTEND_URL=https://YOUR-FRONTEND.vercel.app
    DATABASE_URL=<your production PostgreSQL URL>
    GOOGLE_OAUTH_CLIENT_ID=<same Google client ID used by frontend>

CORS/CSRF origins include https:// and must not have a trailing slash.

After saving, redeploy the backend.

## 4. Google sign-in

In Google Cloud Console, add the production frontend origin to the Web Client's Authorized JavaScript origins:

    https://YOUR-FRONTEND.vercel.app

## 5. Browser verification

Open the frontend, then DevTools -> Network and attempt Sign in/Register.

A correct request should go to:

    https://YOUR-BACKEND.vercel.app/api/auth/...

It must NOT go to:

    http://127.0.0.1:8000/api/...

If it still points to localhost, the frontend was built without VITE_API_URL. Verify the Vercel environment variable scope and redeploy.

If the request goes to the backend but the browser reports a CORS error, verify CORS_ALLOWED_ORIGINS on the backend exactly matches the frontend origin.

## 6. Do not deploy local secrets/build folders

Do not commit or upload:

- `.env` / `.env.local`
- `.vercel/`
- `venv/` or `.venv/`
- `node_modules/`
- `dist/`
- `db.sqlite3`

Use the Vercel dashboard for production environment variables.
