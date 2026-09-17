# Simple Learning Materials Store

The previously demo-only frontend is now connected to Django and Flutterwave.

## Public experience

- `/` — public learning-material library
- Free materials download directly from Django
- Paid materials use Flutterwave Uganda Mobile Money (MTN/Airtel)
- Prices are controlled by Django, not the browser
- Paid downloads unlock only after transaction verification

## Content owner experience

- `/admin/login` — dedicated branded admin login
- `/admin/dashboard` — live material/download/revenue overview
- `/admin/materials` — manage materials and publishing status
- `/admin/upload` — upload real PDF/DOCX/PPTX/ZIP files
- `/admin/sales` — live Flutterwave transaction history

The admin portal uses Django JWT authentication. There are no hard-coded production admin credentials in the frontend.

## Setup

Read:

- `FLUTTERWAVE_SETUP.md`
- `VERCEL_DEPLOYMENT.md`
