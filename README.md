# Research Skills & Business Communication Platform — V5

A full-stack guided learning platform built with **Django / Django REST Framework** and **React / Vite**.

The requested folder structure is preserved exactly:

```text
research-blueprint-complete-v5/
├── backed/      # all Django/backend code
└── frontend/    # all React/Vite frontend code
```

> The backend folder is intentionally named `backed` as requested.

## What the platform does

The system helps learners build research and professional-communication skills through structured lessons, examples, practice, quizzes and guided builders. It also stores progress, practice answers, builder drafts, premium entitlements, payments and profile information in Django.

Main learning products:

- The Research Blueprint
- Business Communication Toolkit
- Research Problem Builder
- Chapter One Builder
- Literature Review Builder
- Premium Problem Analysis resource

## V5 UX improvements

V5 completes the previous GUI/UX checklist while deliberately keeping the product simple.

- Responsive mobile navigation drawer inside the logged-in system
- Working global search across lessons, courses, resources and builders
- Real notification panel with unread count and mark-as-read
- Previous / Next lesson navigation
- Saved practice answers in Django
- Course and lesson progress context
- Production-shaped checkout states without DEBUG/test wording
- Two-step new-user onboarding
- Improved reading typography
- Skeleton loading states
- Global toast feedback
- Inline form validation
- Password show/hide and strength feedback
- Terms/Privacy consent and pages
- Email verification and resend flow
- Resume-course actions
- Collapsible modules
- Resource search/filter/sort
- Dashboard personalization and milestones
- Expanded profile/preferences/security area
- Admin search, filters, pagination, user status actions and engagement indicators
- Breadcrumbs, better empty states and restrained microinteractions
- Keyboard focus and reduced-motion accessibility support

See `UX_V5_CHANGELOG.md` for the checklist-by-checklist implementation summary.

## Authentication

- Email/password registration and sign-in
- JWT access/refresh tokens
- Google sign-in / registration
- Forgot/reset password
- Email verification
- Learner/editor/admin roles

Google authentication requires the same Web Client ID in both environment files:

`frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com
```

`backed/.env`:

```env
GOOGLE_OAUTH_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com
```

The backend includes both `google-auth` and `requests`, so Google Auth's requests transport is installed by the normal requirements command.

## First-time setup on Ubuntu/Linux

Install prerequisites:

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip
node -v
npm -v
```

Node 20+ is recommended.

From the project root:

```bash
chmod +x setup.sh start-backend.sh start-frontend.sh
./setup.sh
```

The setup script creates the Django virtual environment, installs dependencies, creates environment files, creates migrations, migrates the database, seeds the platform content and installs the frontend dependencies.

Create an administrator:

```bash
cd backed
source .venv/bin/activate
python manage.py createsuperuser
```

## Upgrading an existing V4 installation

V5 adds user fields plus `Notification` and `LessonPractice` models. After replacing the source, use the virtual environment you already have and run:

```bash
cd backed
source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py makemigrations accounts learning
python manage.py migrate
python manage.py seed_platform
```

If your own virtual environment is named `venv` instead of `.venv`, activate it with:

```bash
source ../venv/bin/activate
```

or use its exact path. The important point is that `pip` and `python` must come from the same environment.

## Start the application

Terminal 1:

```bash
./start-backend.sh
```

Django API: `http://127.0.0.1:8000`

Django Admin: `http://127.0.0.1:8000/admin/`

Terminal 2:

```bash
./start-frontend.sh
```

React/Vite: `http://localhost:5173`

## Premium Problem Analysis

Problem Analysis remains server-protected. The learner can see the product and preview, but Django returns the full lesson only after entitlement verification.

Current working flow:

```text
Premium resource
    ↓
Choose payment method
    ↓
Create payment request
    ↓
Submit provider transaction reference
    ↓
Pending verification
    ↓
Administrator verifies payment
    ↓
Django creates entitlement
    ↓
Full resource unlocks
```

V5 removes developer/test-payment language from the customer checkout. The interface supports MTN Mobile Money, Airtel Money and a general card/payment-reference option, with pending/success/failure UX states.

### Live payment gateway

The internal payment/entitlement lifecycle is implemented, but true automatic Mobile Money/card collection still requires the client's real merchant/provider API credentials and webhook configuration. Those credentials cannot safely be invented or shipped in source code. Once a provider is selected, its verified webhook should call the existing `mark_payment_paid()` service.

## Production email

Development defaults to Django's console email backend. For real password-reset and verification emails, configure SMTP in `backed/.env`:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=...
```

## PostgreSQL production setup

Set `DATABASE_URL` in `backed/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=use-a-long-random-production-secret
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

Frontend example:

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_BACKEND_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com
```

Then:

```bash
cd backed
source .venv/bin/activate
python manage.py migrate
python manage.py seed_platform
python manage.py collectstatic --noinput
```

## Admin and content management

The React Admin screen is the simple operational view for:

- platform totals
- payment verification
- payment status filtering
- user search
- learner/editor/admin filtering
- account enable/disable
- course-engagement overview

Django Admin remains the detailed content-management area for courses, modules, lessons, quizzes, resources, entitlements, payments and users.

## Important production items still requiring client input

These are external/client decisions rather than missing GUI code:

1. final domain and hosting/VPS;
2. production PostgreSQL credentials;
3. SMTP/email credentials;
4. Google OAuth production origin/client configuration;
5. live Mobile Money/card merchant credentials and webhook secrets;
6. client-approved prices;
7. client/legal review of Terms, Privacy and refund language;
8. final real photographs/testimonials/contact details.

The V5 source is structured so these can be configured without redesigning the learner experience.

## Vercel deployment

If frontend and backend are deployed as separate Vercel projects, read `VERCEL_DEPLOYMENT.md`. The frontend must be built with `VITE_API_URL` and `VITE_BACKEND_URL` pointing to the deployed Django project; the backend must allow the frontend origin through CORS.

### Flutterwave payout destination

The Flutterwave store now has an explicit Uganda Mobile Money payout destination: `256762640590` (local format `0762640590`). Each verified sale creates one server-side payout record. Automatic transfer is disabled by default; admins can send queued payouts from **Sales & revenue**, or enable automatic payouts with `FLW_AUTO_PAYOUT=True` after testing.
