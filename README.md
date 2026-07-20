# CrazyGrowMind Studio — Backend + Admin Portal

A production-ready MERN backend and admin dashboard for CrazyGrowMind Studio.
**No public website is included** — this repo only contains the REST API
backend and the internal admin portal.

```
crazygrowmind/
├── backend/     Node.js + Express + MongoDB REST API
└── admin/       React (Vite) admin dashboard
```

## Quickstart (run everything with one command)

```bash
cd crazygrowmind
npm run install:all          # installs both backend/ and admin/ dependencies

cp backend/.env.example backend/.env    # fill in at least MONGO_URI + JWT_SECRET
cp admin/.env.example admin/.env

npm run seed                 # creates the default super admin + company settings
npm run seed:branding        # optional — see "Local logo & signature" below

npm run dev                  # starts backend (:5000) AND admin (:5173) together
```

That's it — edit any file in `backend/` or `admin/src/` and both sides
hot-reload (nodemon for the API, Vite HMR for the admin UI), so you don't
need to restart anything while iterating.

Default seeded login (change these in `.env` before running `npm run seed`):

```
Email:    admin@crazygrowmind.com
Password: Admin@12345
```

## Local logo & signature (no Cloudinary needed)

You do **not** need Cloudinary credentials to develop locally. If
`CLOUDINARY_*` env vars are left as the placeholder values in
`.env.example`, the backend automatically falls back to storing uploaded
images (service photos, company logo, signature) on local disk under
`backend/uploads/` and serves them itself — everything just works.

To set your logo and signature without clicking through the admin UI:

1. Drop two image files into `backend/branding-source/`:
   ```
   backend/branding-source/logo.png
   backend/branding-source/signature.png
   ```
   (`.jpg` / `.jpeg` / `.webp` also work.) A transparent-background PNG is
   best for the signature.
2. Run:
   ```bash
   cd backend
   npm run seed:branding
   ```
3. Generate/view any invoice — the logo and signature now appear
   automatically, no restart required.

Re-run `npm run seed:branding` any time you swap either file out. You can
also always upload/replace both from **Settings** in the admin UI itself.

When you're ready for production, just fill in real `CLOUDINARY_*`
credentials in `.env` — uploads switch to Cloudinary automatically, no
code changes needed.

## Features

- JWT authentication with role-based authorization (`superadmin`, `admin`, `staff`)
- Login / Logout / Forgot Password / Reset Password
- Dashboard with revenue, leads, customers, invoices, payments stats + charts
- Leads management (CRUD, search, filter, status pipeline)
- Customers management (CRUD, GSTIN, billing address)
- Services management (CRUD, categories, pricing, image upload)
- Invoice management (CRUD, pixel-accurate PDF generation matching the
  original tax invoice template — including company logo and signatory
  signature — Print, Email via Nodemailer)
- Payments (record payments, pending dues, full history)
- Reports (revenue, leads, customers, services, invoices, payments)
- Settings (company details, GST, invoice prefix/numbering, logo,
  signature, bank details, email settings)
- Activity logs for every create/update/delete/login/email action
- Pagination, search, filtering, and sorting on every list endpoint
- Dark sidebar + white workspace + gold accent admin UI, fully responsive

## Invoice PDF

`backend/utils/pdfGenerator.js` recreates the exact layout of the supplied
tax invoice (company header, GSTIN, invoice meta row, customer + place of
supply, item table, taxable amount / total / TDS / amount payable block,
amount-in-words, bank details, and signatory block with logo + signature
images) using PDFKit, with bundled DejaVu Sans fonts so the ₹ symbol
renders correctly (PDFKit's built-in Helvetica has no glyph for it). The
default seed data (`backend/utils/seedAdmin.js`) is pre-filled with the
company and bank details from the original template so the first invoice
you generate matches it out of the box.

## Notes

- File uploads (service images, company logo, signature) go through
  Multer, automatically using Cloudinary in production or local disk
  storage in development — see "Local logo & signature" above.
- Emails (password reset, invoice delivery) go through Nodemailer using
  standard SMTP credentials.
- Only `superadmin` accounts can manage other admin/staff users
  (`/api/users`) and delete records across most modules.

