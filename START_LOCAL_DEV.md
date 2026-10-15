# Starting PAJO Local Development

## Quick Start (3 steps)

### Step 1: Start Cloud SQL Proxy (Terminal 1)

```powershell
cd c:\Users\kabon\Documents\Auxlo
.\start-proxy.ps1
```

**Expected output:**
```
Starting Cloud SQL Proxy...
Instance: auxlo-503209:europe-west2:auxlo-db
Port: 5432

[info] (gcloud:auxlo-503209) Generated valid connection token
[info] (gcloud:auxlo-503209) Successfully authenticated using Cloud SDK
[info] (gcloud:auxlo-503209) ready to accept connections on 127.0.0.1:5432
```

✅ Keep this terminal open — the proxy must stay running!

### Step 2: Start Dev Server (Terminal 2)

```powershell
cd c:\Users\kabon\Documents\Auxlo
npm run dev
```

**Expected output:**
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Environment:  .env loaded
  ✓ Ready in 2.5s
```

### Step 3: Open Browser

Navigate to: **http://localhost:3000/pajo**

## Troubleshooting

### "Can't reach database server at 127.0.0.1:5432"

**Cause:** The Cloud SQL proxy (Step 1) is not running.

**Fix:**
1. Check Terminal 1 — is the proxy running?
2. If not, restart it: `.\start-proxy.ps1`
3. Wait for "ready to accept connections" message
4. Retry your request in the app

### "gcloud command not found"

**Cause:** Google Cloud SDK is not installed or not in PATH.

**Fix:**
1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install-windows
2. Authenticate: `gcloud auth login`
3. Set project: `gcloud config set project auxlo-503209`
4. Retry proxy startup

### NextAuth Google Sign-In Failing

**Symptoms:**
- "AccessDenied" error on sign-in page
- Redirects to `/auth/error`

**Checklist:**
- [ ] Cloud SQL proxy is running (Step 1)
- [ ] Database is reachable (check proxy terminal for errors)
- [ ] Google OAuth credentials are in `.env`:
  ```
  GOOGLE_CLIENT_ID=394631971805-...
  GOOGLE_CLIENT_SECRET=GOCSPX-...
  ```
- [ ] `NEXTAUTH_URL=http://localhost:3000` is set

## Useful Commands

```powershell
# Reset Pajo demo data
npm run pajo:seed

# Clean up seeded data
npm run pajo:seed:clean

# Quick health check
npx ts-node scripts/pajo-check.ts

# View proxy logs
Get-Content proxy_log.txt -Tail 50
```

## Environment

| Variable | Value | Purpose |
|---|---|---|
| `DATABASE_URL` | Points to Cloud SQL via proxy on localhost:5432 | Prisma connections |
| `NEXTAUTH_URL` | `http://localhost:3000` | NextAuth OAuth callback |
| `PAJO_BYPASS_AUTH` | `false` (production behavior) | Auth required for `/pajo` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | From GCP Console | Google OAuth provider |

---

**Last updated:** Sept 9, 2026  
**Contact:** hello@auxlo.uk
