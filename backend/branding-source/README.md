# Drop your branding files here

Put your company logo and signature image files directly in this folder,
named exactly:

```
logo.png        (or logo.jpg / logo.jpeg / logo.webp)
signature.png   (or signature.jpg / signature.jpeg / signature.webp)
```

A transparent-background PNG works best for the signature (it sits
directly on the white invoice background, above "Authorized Signatory").

Then run, from the `backend/` folder:

```bash
npm run seed:branding
```

This copies both files into `backend/uploads/branding/` and saves them on
the company Settings document — no need to log into the admin portal and
upload them by hand every time you reset your local database. It works
whether or not Cloudinary is configured; if Cloudinary credentials are
missing it just uses local disk storage automatically (served at
`/uploads/...`).

Re-run the command any time you swap either file out.
