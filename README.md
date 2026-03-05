# Edukarya Backend (MongoDB) — Production Ready

Fitur:
- Auth: Applicant register/login, Admin & Super Admin login
- SUPER_ADMIN bootstrap via seed (tidak ada register publik admin)
- Applicant: dashboard + submit pendaftaran (data diri + divisi + upload CV PDF max 5MB + checkbox deklarasi)
- Admin: dashboard stats, list pendaftar (search/filter/pagination), detail, update status, download CV (private), export Excel
- Uploads **tidak public** (tidak ada static file serving). CV hanya bisa diakses admin via endpoint.

## Setup (MongoDB lokal)
1) Copy `.env.example` → `.env` lalu sesuaikan `MONGO_URI` dan `JWT_SECRET`.
2) Install:
```bash
npm install
```
3) Seed Super Admin:
```bash
npm run seed
```
4) Run:
```bash
npm run dev
```

## Endpoint ringkas

### Auth
- POST `/api/auth/register` (APPLICANT)
- POST `/api/auth/login` (APPLICANT/ADMIN/SUPER_ADMIN)
- GET `/api/auth/me` (Bearer)

### Applicant (Bearer APPLICANT)
- GET `/api/applicant/dashboard`
- POST `/api/applicant/apply` (multipart form-data: `full_name, phone, university, semester, division, declaration, cv`)

### Admin (Bearer ADMIN/SUPER_ADMIN)
- GET `/api/admin/dashboard/stats`
- GET `/api/admin/applicants?search=&status=&page=&limit=`
- GET `/api/admin/applicants/:id`
- PUT `/api/admin/applicants/:id/status`
- GET `/api/admin/applicants/:id/cv` (download/inline PDF)
- GET `/api/admin/export?status=PENDING` (download .xlsx)

### Super Admin only
- POST `/api/admin/users` (create admin)

## Form field (sesuai mockup)
- `division`: HR | IT | SOSMED | DESIGN
- `status`: PENDING | INTERVIEW | ACCEPTED | REJECTED
