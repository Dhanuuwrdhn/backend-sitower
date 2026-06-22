# Backend SiTower — Setup Guide

NestJS REST API untuk sistem pemantauan tower transmisi PLN UIW Banten.

---

## Stack

| Layer | Teknologi |
|---|---|
| Framework | NestJS 11 |
| ORM | Prisma 7 (engine type: client) |
| Database | PostgreSQL (via `@prisma/adapter-pg`) |
| Auth | JWT + Passport (`@nestjs/jwt`, `passport-jwt`) |
| Upload | Multer (local storage `./uploads/`) |
| Import | xlsx |
| Docs | Swagger (`@nestjs/swagger`) |

---

## Prasyarat

- Node.js >= 18
- PostgreSQL berjalan lokal
- Database `sitower_db` sudah dibuat

```bash
createdb sitower_db
```

---

## Instalasi

```bash
cd backend-sitower
npm install
```

---

## Environment

Buat file `.env` di root `backend-sitower/`:

```env
DATABASE_URL="postgresql://dhanu@localhost:5432/sitower_db"
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=sitower_jwt_secret_2025
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
```

> Ganti `dhanu` dengan username PostgreSQL lokal kamu.
> Pastikan user tersebut punya akses ke database `sitower_db`.

---

## Database Setup

### Prisma v7 — Catatan Penting

Prisma v7 **tidak mengizinkan** `url = env("DATABASE_URL")` di `schema.prisma`.
URL koneksi dikonfigurasi melalui `prisma.config.ts`:

```typescript
// prisma.config.ts (sudah ada di repo)
import { defineConfig } from "prisma/config"
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url: process.env["DATABASE_URL"] },
})
```

### Jalankan migrasi

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Seed data awal

```bash
npx prisma db seed
```

Seed akan membuat:
- 1 akun admin: NIK `000001`, password `admin123`
- 1 akun teknisi: NIK `100001`, password `teknisi123`

---

## Menjalankan Server

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

Server akan berjalan di `http://localhost:3001`

---

## API Documentation

Akses Swagger UI di: `http://localhost:3001/api`

---

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

---

## Troubleshooting

### Error koneksi database
- Pastikan PostgreSQL berjalan: `brew services start postgresql` (macOS)
- Cek DATABASE_URL di `.env`
- Verifikasi user dan database ada: `psql -U dhanu -d sitower_db`

### Prisma error
- Jalankan `npx prisma generate` setelah perubahan schema
- Untuk reset database: `npx prisma migrate reset`

### Port conflict
- Ganti PORT di `.env` jika 3001 sudah digunakan

### Upload error
- Pastikan folder `uploads/` ada dan writable
- Cek konfigurasi UPLOAD_DIR di `.env`

---

## Development Tips

- Gunakan `npm run start:debug` untuk debugging
- Format code: `npm run format`
- Lint code: `npm run lint`
- Prisma Studio: `npx prisma studio` (akses di browser)

# Production
npm run build
npm run start:prod
```

Server berjalan di: `http://localhost:3001`

---

## Struktur Modul

```
src/
├── prisma/          # PrismaService (global, pakai @prisma/adapter-pg)
├── auth/            # JWT login, guard, strategy, roles decorator
├── towers/          # CRUD tower + endpoint /towers/dropdown
├── laporan/         # CRUD laporan gangguan + upload foto + stats
├── sertifikat/      # CRUD sertifikat + upload PDF
├── as-built-drawing/# CRUD drawing + upload file
├── pegawai/         # CRUD user/pegawai + toggle aktif
└── import/          # Import Excel (towers, laporan)
```

---

## API Endpoints Utama

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| POST | `/api/auth/login` | — | Login, dapat JWT token |
| GET | `/api/auth/profile` | JWT | Info user login |
| GET | `/api/towers` | JWT | List tower (search, tipe, kondisi, page) |
| GET | `/api/towers/dropdown` | JWT | List tower untuk form select |
| POST | `/api/towers` | Admin | Tambah tower |
| GET | `/api/laporan` | JWT | List laporan (filter banyak) |
| GET | `/api/laporan/stats` | JWT | Statistik per kategori |
| POST | `/api/laporan` | JWT | Tambah laporan |
| POST | `/api/laporan/upload-foto` | JWT | Upload foto, return URL array |
| GET | `/api/sertifikat` | JWT | List sertifikat |
| GET | `/api/as-built-drawing` | JWT | List drawing |
| GET | `/api/pegawai` | Admin | List user |
| PUT | `/api/pegawai/:id/toggle-aktif` | Admin | Aktif/nonaktif user |
| POST | `/api/import/towers` | Admin | Import Excel tower |

### Swagger UI

Akses dokumentasi interaktif di: `http://localhost:3001/api/docs`

---

## PrismaService — Konfigurasi Khusus

Karena Prisma v7 memerlukan adapter eksplisit untuk koneksi PostgreSQL:

```typescript
// src/prisma/prisma.service.ts
import { PrismaPg } from '@prisma/adapter-pg'

constructor() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  super({ adapter })
}
```

Tanpa adapter ini akan muncul error:
`PrismaClientConstructorValidationError: engine type "client" requires adapter`

---

## Roles

| Role | Akses |
|---|---|
| `admin` | Semua endpoint termasuk CRUD user, delete, import |
| `teknisi` | Read + create laporan, sertifikat, drawing |
| `viewer` | Read only |

Guard diterapkan di level controller dengan `@UseGuards(JwtAuthGuard, RolesGuard)` dan `@Roles('admin')` per method.

---

## Static Files (Uploads)

File yang diupload disimpan di `./uploads/` dan diakses via:

```
http://localhost:3001/uploads/<filename>
```

Konfigurasi di `main.ts`:
```typescript
app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' })
```

---

## Troubleshooting

**`npm` not found di terminal non-interaktif**
npm adalah fungsi zsh yang lazy-load NVM. Gunakan:
```bash
zsh -lc 'npm install'
```

**Prisma migrate gagal (P1012)**
Pastikan `schema.prisma` tidak punya `url = env(...)` di datasource.
URL hanya boleh ada di `prisma.config.ts`.

**Port sudah dipakai**
Ubah `PORT` di `.env`. Default: `3001`.
