# Flutterwave Uganda Mobile Money Setup

The project now uses Flutterwave Uganda Mobile Money for paid learning materials.

## What is already implemented

- MTN and Airtel Uganda checkout from the public website.
- Server-side prices: the browser cannot decide the amount charged.
- Uganda number normalization, for example `0762640590` -> `256762640590`.
- Unique transaction references for every purchase.
- Flutterwave direct-charge initiation from Django only.
- Webhook endpoint with `verif-hash` validation.
- Independent transaction verification before a download is unlocked.
- Polling fallback using Flutterwave `verify_by_reference`.
- Secure per-payment download token.
- Django-backed material uploads, download counters, sales and revenue statistics.
- Dedicated frontend admin login using the existing Django JWT authentication.

## Important: merchant receiving number

The merchant receiving/settlement number you supplied is:

    0762640590

Do **not** put that number in the customer charge payload. Flutterwave first collects the money into your merchant account. Configure the merchant settlement/payout destination inside your verified Flutterwave account/dashboard. If Flutterwave requests the number in international format, use:

    256762640590

The source code therefore does not hard-code the merchant receiving number into each transaction.

## 1. Create/configure Flutterwave account

Use a verified Flutterwave business account that is enabled for Uganda / UGX Mobile Money.

Start with TEST credentials. Move to LIVE credentials only after you have tested the full flow.

## 2. Backend environment variables

In `backed/.env` for local development, or in the backend host's environment-variable settings:

    FLW_SECRET_KEY=FLWSECK_TEST-REPLACE-ME
    FLW_SECRET_HASH=REPLACE-WITH-A-LONG-RANDOM-SECRET
    FLW_BASE_URL=https://api.flutterwave.com/v3
    FLW_HTTP_TIMEOUT=25

Never expose `FLW_SECRET_KEY` as a `VITE_*` variable and never commit it to Git.

Generate a webhook hash with something like:

    python -c "import secrets; print(secrets.token_urlsafe(48))"

## 3. Flutterwave webhook

After your backend is online, set the Flutterwave webhook URL to:

    https://YOUR-BACKEND-DOMAIN/api/store/flutterwave/webhook/

Set the webhook secret hash in Flutterwave to the **same value** as `FLW_SECRET_HASH`.

The webhook handler does not trust the webhook payload by itself. It re-verifies the transaction with Flutterwave before setting the payment to `paid`.

## 4. Payment flow

1. Customer chooses a paid material.
2. Customer enters name, email, MTN/Airtel network and phone number.
3. Frontend sends the material slug and customer details to Django.
4. Django reads the real price from its database.
5. Django creates a pending payment and calls Flutterwave.
6. Customer completes/authorizes the Mobile Money request.
7. Webhook or status polling reaches Django.
8. Django verifies `status`, `tx_ref`, `currency`, and `amount` with Flutterwave.
9. Only then does Django return a secure paid-download URL.

## 5. Seed the initial catalogue

After migrations:

    python manage.py seed_store

This creates the seven current catalogue entries and their server-side prices. It intentionally does not include fake files. Sign into `/admin/login` and upload the real PDF/DOCX/PPTX/ZIP for each material.

## 6. Test locally

Backend:

    cd backed
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py seed_store
    python manage.py runserver

Frontend:

    cd frontend
    npm install
    npm run dev

Then visit:

    http://localhost:5173

## 7. Production checklist

Before switching to LIVE Flutterwave credentials:

- Use PostgreSQL, not SQLite.
- Use S3/S3-compatible persistent storage for uploaded materials if the Django backend is serverless.
- Set `DJANGO_DEBUG=False`.
- Use a strong `DJANGO_SECRET_KEY`.
- Set exact CORS/CSRF frontend origins.
- Configure the Flutterwave webhook and secret hash.
- Confirm settlement details in the Flutterwave dashboard.
- Run at least one low-value LIVE transaction and verify the payment record, settlement, and protected download.
