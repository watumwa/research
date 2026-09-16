# Simple Learning Materials Frontend Demo

This frontend was simplified for the client's actual requirement: publish learning materials that visitors can browse and download, with some resources free and others paid.

## Public experience

- `/` — simple public website and resource library
- Visitors do not need an account for free materials
- Free resources download immediately
- Paid resources open a simple demo checkout
- Search and category filters are included
- Demo download counts update automatically

## Content owner experience

- `/admin/login` — dedicated branded login page (separate from Django Admin)
- `/admin/dashboard` — summary statistics
- `/admin/materials` — materials, access type, prices, download counts and publishing status
- `/admin/upload` — upload/add a new material
- `/admin/sales` — premium download and revenue history

### Demo login

- Email: `admin@researchskills.com`
- Password: `admin123`

These credentials are intentionally frontend-only demo credentials and must be replaced by Django authentication before production use.

## Demo-data behavior

The demo uses browser `localStorage`, so uploaded demo records, download counts and demo sales stay available after a page refresh on the same browser. The **Reset demo data** link restores the seeded demo records.

The upload form stores the selected filename only. Demo downloads create a small text file explaining that the production system will return the real uploaded PDF/DOCX/PPTX/ZIP.

## Backend status

The existing Django backend was not modified. It already contains useful free/paid Resource, Payment and administrator concepts that can be adapted for the production version after the client approves this simplified frontend.

## Run

```bash
cd frontend
npm install
npm run dev
```

Production build:

```bash
npm run build
```
