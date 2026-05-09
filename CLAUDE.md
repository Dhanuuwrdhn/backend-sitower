# backend-sitower

NestJS backend untuk SPEKTRA — sistem pemantauan kerawanan transmisi tower PLN.

## Stack

- **Framework**: NestJS 11
- **ORM**: Prisma v7 + adapter pg (PostgreSQL)
- **Auth**: JWT + Passport
- **Validation**: class-validator + class-transformer
- **Docs**: Swagger (`/api/docs`)
- **File Upload**: multer
- **Excel Import**: xlsx

## Database

- PostgreSQL
- Schema: `prisma/schema.prisma`
- Migration: `prisma/migrations/`
- Seed: `prisma/seed.ts`

## Struktur Direktori

```
src/
  auth/                # JWT auth, login, guard
  pegawai/             # Data pegawai / user
  towers/              # Data tower PLN
  laporan/             # Laporan (gangguan, cleanup, CUI)
  sertifikat/          # Sertifikat tower
  as-built-drawing/    # As-built drawing
  import/              # Import data dari Excel
  prisma/              # PrismaService (singleton)

prisma/
  schema.prisma        # Prisma schema
  migrations/          # DB migrations
  seed.ts              # Seed data

uploads/               # File uploads (multer)
```

## Dev Commands

```bash
npm run start:dev        # Start dengan watch mode (port 3001)
npm run build            # Build production
npm run start:prod       # Run production build

# Prisma
npx prisma migrate dev   # Buat dan jalankan migration baru
npx prisma generate      # Generate Prisma client
npx prisma db seed       # Jalankan seed
npx prisma studio        # Buka Prisma Studio

# Test
npm run test             # Unit test
npm run test:e2e         # E2E test
npm run test:cov         # Coverage
```

## Conventions

- Setiap modul punya: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`
- DTO pakai class-validator decorator
- Auth guard: `JwtAuthGuard` (dari `src/auth/`)
- PrismaService di-inject via `PrismaModule` (global)
- Response format konsisten: `{ data, message }`

## Catatan

- Project ini bagian dari SPEKTRA / bornworks, **bukan** Sprout
- Tidak ada Jira ticket untuk perubahan di repo ini
- Backend berjalan di port 3001, frontend di port 3000
- Swagger docs: `http://localhost:3001/api/docs`
