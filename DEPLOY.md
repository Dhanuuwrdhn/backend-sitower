# SPEKTRA Deploy — Gotchas & Runbook

Catatan deploy quirks SPEKTRA (frontend + backend). Wajib dibaca sebelum
deploy / debug deploy issue. Untuk struktur repo & layout lihat README.

---

## Git remotes (BOTH must receive push)

Local repo `frontend-sitower` punya 2 push remotes:
- `origin` (GitHub `https://github.com/danusprout/sitower.git`)
- `deploy` (`ubuntu@129.226.95.198:/opt/git/sitower-frontend.git` — bare mirror)

**Konfigurasi**: `origin` sudah di-set push ke kedua URL via:
```bash
git remote set-url --add --push origin https://github.com/danusprout/sitower.git
git remote set-url --add --push origin ubuntu@129.226.95.198:/opt/git/sitower-frontend.git
```
Sehingga `git push origin staging` otomatis push ke kedua-duanya.

**Why**: Server deploy script fetch dari bare repo lokal
(`/opt/git/sitower-frontend.git`), bukan dari GitHub. Kalau push ke GitHub
aja, server gak update.

Backend (`backend-sitower`) belum dual-push — set up dengan command yang
sama bila perlu deploy via push (saat ini deploy backend sering manual /
via webhook GitHub Actions).

---

## Webhook flow

1. GitHub Actions (`.github/workflows/deploy-staging.yml`) — pada
   `push: branches: staging` → curl ke
   `https://staging.spektra.biz.id/webhook/deploy-staging-frontend`
2. Webhook service (`sitower-webhook.service`, port 9000, run as `ubuntu`)
   → execute `/opt/live/deploy-staging-frontend.sh`
3. Script: `git fetch` from local bare → `npm install` → `next build`
   → `systemctl restart sitower-staging-frontend`

Production: same flow, branch `main`, hits
`https://api.spektra.biz.id/webhook/deploy-frontend`.

### Manual webhook trigger

```bash
curl -X POST https://staging.spektra.biz.id/webhook/deploy-staging-frontend
curl -X POST https://api.spektra.biz.id/webhook/deploy-frontend
```

---

## Systemd services (NOT PM2)

Server pakai systemd, bukan PM2. 5 unit:

| Service | Env | WorkingDirectory | Notes |
|---|---|---|---|
| `sitower-frontend.service` | prod | `/opt/live/frontend` (→ `/opt/frontend-sitower`) | `npx next start -H 0.0.0.0 -p 3000`, `User=ubuntu` (changed from `root` 2026-05-17 — see gotcha #3) |
| `sitower-backend.service` | prod | `/opt/live/backend` (→ `/opt/backend-sitower`) | `node dist/src/main.js` |
| `sitower-staging-frontend.service` | staging | `/opt/frontend-staging` | NB: no `/opt/live` symlink, beda dari prod |
| `sitower-staging-backend.service` | staging | `/opt/backend-staging` | |
| `sitower-webhook.service` | shared | — | GitHub webhook receiver, port 9000, run as `ubuntu` |

Cek nama service:
```bash
systemctl list-units --type=service --state=running | grep sitower
```
Restart manual: `sudo systemctl restart sitower-<name>`.

---

## Stuck deploy diagnosis

**Symptom**: webhook fires tapi page tidak update / blank page.

### Common causes (sudah pernah diperbaiki)

1. **Lock file leftover**: `/tmp/deploy-staging-frontend.lock` — script
   bail early bila ada. Hapus manual:
   ```bash
   ssh ubuntu@... 'rm /tmp/deploy-*.lock'
   ```

2. **Permission EACCES on `package-lock.json`**: file dimiliki
   `root:root`, deploy run sebagai `ubuntu`. Fix:
   ```bash
   chown ubuntu:ubuntu /opt/frontend-sitower/package-lock.json
   ```

3. **Permission EACCES on `.next/server/app/*.rsc` (frontend blank page)**:
   prod `sitower-frontend.service` dulu `User=root` (staging selalu
   `User=ubuntu` — itu kenapa staging tidak pernah kena). Service yang
   run as root **menulis** `.next/server/app/*.rsc` (RSC cache) sebagai
   root saat serve traffic. Saat deploy script (run as ubuntu) eksekusi
   `rm -rf .next` + `npm run build`, root service yang masih hidup terus
   nulis root-owned files DURING build → EACCES race → build fail →
   script `set -e` exit sebelum systemctl restart → service tetap up
   dengan `.next` partial (no `prerender-manifest.json`) → blank page.

   **Permanent fix** (2026-05-17): ubah `User=root` → `User=ubuntu` di
   `/etc/systemd/system/sitower-frontend.service`, plus deploy script
   punya `sudo chown -R ubuntu:ubuntu <dir>` setelah `cd` (safety net).

   Kalau bug ini muncul lagi:
   - cek `systemctl cat sitower-frontend | grep User=` harus `ubuntu`
   - cek deploy script masih punya chown line
   - **manual recovery**:
     ```bash
     sudo chown -R ubuntu:ubuntu /opt/frontend-sitower
     cd /opt/frontend-sitower
     rm -rf .next && npm run build
     sudo systemctl restart sitower-frontend
     ```
     (staging: `/opt/frontend-staging` + `sitower-staging-frontend`)

4. **Spurious trigger**: webhook fired tapi gak ada commit baru → script
   sekarang ada early-exit
   (`git fetch && [ HEAD == origin/<branch> ] && exit 0`).

5. **Wrong remote pushed**: kalau push ke `origin` GitHub aja tanpa
   `deploy` bare repo, script log "No new commits, skip build". Fix:
   pakai `git push origin staging` (sudah dual-push).

### Diagnosis commands

```bash
ssh ubuntu@129.226.95.198 'sudo tail -20 /opt/live/logs/deploy-staging-frontend.log'
ssh ubuntu@129.226.95.198 'sudo systemctl status sitower-webhook'
ssh ubuntu@129.226.95.198 'ls /tmp/deploy-*.lock'
ssh ubuntu@129.226.95.198 'systemctl show sitower-frontend -p ActiveEnterTimestamp'  # kapan terakhir restart
ssh ubuntu@129.226.95.198 'journalctl -u sitower-frontend -n 50 --no-pager'         # runtime errors
```

---

## Backend deploy runs prisma migrations

Both `/opt/live/deploy-backend.sh` dan `/opt/live/deploy-staging-backend.sh`
run `npx prisma migrate deploy` setelah `prisma generate` (added
2026-05-17). Past that date, new Prisma migrations auto-apply on webhook.

Before that, deploy only ran `generate` — migrations had to be applied
manually:
```bash
ssh ubuntu@129.226.95.198 'cd /opt/backend-sitower && npx prisma migrate deploy'
```

If a migration ever fails on deploy, the deploy script does **NOT** abort
(no `set -e`), so service akan restart dengan code yang mismatch schema
→ 500s. Watch deploy log lines for `Applying migration` or errors after
pushing a backend change with a new migration folder.

---

## Hooks config

`/opt/live/hooks.json` — 4 endpoints, NO match-rules (any POST triggers
deploy):

- `deploy-frontend` → `/opt/live/deploy-frontend.sh` (prod, cwd `/opt/frontend-sitower`)
- `deploy-backend` → `/opt/live/deploy-backend.sh`
- `deploy-staging-frontend` → `/opt/live/deploy-staging-frontend.sh`
- `deploy-staging-backend` → `/opt/live/deploy-staging-backend.sh`

---

## Quick deploy workflow

```bash
# 1. dari local, push ke staging
git push origin staging          # auto dual-push GitHub + bare repo

# 2. tunggu webhook deploy (cek log)
ssh ubuntu@129.226.95.198 'tail -f /opt/live/logs/deploy-staging-frontend.log'

# 3. verifikasi di staging.spektra.biz.id

# 4. merge ke main untuk prod
git checkout main && git merge --ff-only origin/main
git merge --no-ff staging -m "merge: <description>"
git push origin main

# 5. tunggu prod deploy
ssh ubuntu@129.226.95.198 'tail -f /opt/live/logs/deploy-frontend.log'
```
