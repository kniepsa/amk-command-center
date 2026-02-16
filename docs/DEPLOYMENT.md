# Deployment Guide - AMK Command Center

**Environment:** Development + Production
**Architecture:** SvelteKit frontend + Shared Bun backend
**Databases:** SQLite (headless backend)

---

## Quick Start (Development)

### Prerequisites

- Node.js 18+ (for frontend)
- Bun 1.0+ (for backend)
- Git (version control)

### 1. Start Backend (Shared API)

```bash
# Navigate to backend
cd /Users/amk/Projects/amk-journal/.claude/api

# Install dependencies (first time only)
bun install

# Start dev server
bun run dev

# Expected output:
# Server running on http://localhost:3002
# Database: SQLite (.claude/data/journal.db)
# Workspace: amk
```

**Backend serves:**

- Command Center API (workspace: amk)
- M&A Tracker API (workspace: ma)
- Shared endpoints (search, tasks, people)

---

### 2. Start Frontend (Command Center UI)

```bash
# Open new terminal
cd /Users/amk/Projects/amk-command-center

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev

# Expected output:
# VITE v6.0.0  ready in 1234 ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

---

### 3. Verify Setup

**Backend Health Check:**

```bash
curl http://localhost:3002/api/v1/health | jq
```

**Expected Response:**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-02-16T10:00:00.000Z",
  "database": "sqlite"
}
```

**Frontend Access:**

```bash
open http://localhost:5173
```

**Expected:**

- Quote header loads
- Morning ritual form visible
- Habit streaks display (mock data)
- Global search (Cmd+K) works

---

## Environment Variables

### Backend (.claude/api/.env)

**Location:** `/Users/amk/Projects/amk-journal/.claude/api/.env`

**Required Variables:**

```bash
# Server Configuration
PORT=3002
NODE_ENV=development

# Database
DATABASE_URL=file:./.claude/data/journal.db

# AI Services
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...

# Optional Services
TELEGRAM_BOT_TOKEN=...  # For notifications (optional)
GOOGLE_CALENDAR_API_KEY=...  # For calendar sync (future)
```

**Create File:**

```bash
cd /Users/amk/Projects/amk-journal/.claude/api
cp .env.example .env
nano .env  # Edit with your API keys
```

---

### Frontend (.env)

**Location:** `/Users/amk/Projects/amk-command-center/.env`

**Required Variables:**

```bash
# Backend API URL
VITE_API_URL=http://localhost:3002/api/v1

# Workspace (amk = journaling, ma = M&A tracking)
PUBLIC_WORKSPACE=amk

# Optional: Analytics
PUBLIC_PLAUSIBLE_DOMAIN=command-center.local
```

**Create File:**

```bash
cd /Users/amk/Projects/amk-command-center
touch .env
nano .env  # Add variables above
```

---

## Database Setup

### SQLite Initialization

**Location:** `/Users/amk/Projects/amk-journal/.claude/api/.claude/data/journal.db`

**First Time Setup:**

```bash
cd /Users/amk/Projects/amk-journal/.claude/api

# Run migrations (creates tables)
bun run db:migrate

# Expected output:
# Applying migration: 0001_create_entries.sql
# Applying migration: 0002_create_people.sql
# Applying migration: 0003_create_tasks.sql
# Applying migration: 0004_create_buyers.sql
# ✓ Migrations complete
```

**Verify Database:**

```bash
# Check database file exists
ls -lh .claude/data/journal.db

# Expected: ~100KB file (empty schema)

# Inspect schema (optional)
sqlite3 .claude/data/journal.db ".schema"
```

---

### Seed Data (Optional)

**Add test data for development:**

```bash
cd /Users/amk/Projects/amk-journal/.claude/api

# Run seed script
bun run db:seed

# Expected output:
# ✓ Created 5 test buyers
# ✓ Created 10 interactions
# ✓ Created 20 tasks
# ✓ Created 5 people
```

**Verify Seed:**

```bash
# Start backend
bun run dev

# Test search endpoint
curl "http://localhost:3002/api/v1/search?q=leon&workspace=ma" | jq

# Expected: Returns Leon (test buyer)
```

---

## Testing Checklist

### Backend Tests

**Run Backend Tests:**

```bash
cd /Users/amk/Projects/amk-journal/.claude/api

# Unit tests
bun test

# Integration tests (with database)
bun test:integration

# Expected: All tests pass
```

**Manual API Tests:**

```bash
# Health check
curl http://localhost:3002/api/v1/health

# Search API
curl "http://localhost:3002/api/v1/search?q=leon&workspace=ma" | jq

# Habits API
curl http://localhost:3002/api/v1/habits/streaks | jq

# Urgent items API
curl http://localhost:3002/api/v1/urgent | jq
```

---

### Frontend Tests

**Run Frontend Tests:**

```bash
cd /Users/amk/Projects/amk-command-center

# Unit tests
npm test

# Component tests
npm run test:components

# E2E tests (Playwright)
npm run test:e2e
```

**Manual UI Tests:**

1. **Morning Ritual:**
   - Click "Morning Ritual" button
   - Fill 3 fields (grateful, excited, priorities)
   - Submit
   - Verify: Variable reward message appears
   - Verify: Data added to extraction preview

2. **Habit Streaks:**
   - Click any habit circle
   - Verify: Turns green instantly (optimistic UI)
   - Verify: Streak counter increments
   - Hover: Tooltip shows details

3. **Global Search (Cmd+K):**
   - Press Cmd+K
   - Type "leon"
   - Verify: Results appear within 300ms
   - Arrow down/up: Navigate results
   - Enter: Navigate to selected result

4. **Calendar Section:**
   - Verify: Today's events display
   - Verify: Time badges show (9:00 AM)
   - Verify: @mentions extracted
   - Verify: Auto-refresh every 15 min

5. **Urgent Items:**
   - Verify: Top 3 items from NEXT.md
   - Verify: Priority badges (high/medium)
   - Verify: Due dates parsed (today, this-week)
   - Click expand: Shows full list

---

## Production Deployment

### Build Frontend

```bash
cd /Users/amk/Projects/amk-command-center

# Production build
npm run build

# Expected output:
# vite v6.0.0 building for production...
# ✓ 124 modules transformed.
# dist/index.html                   2.1 kB
# dist/assets/index-abc123.js       145.2 kB │ gzip: 52.3 kB
# ✓ built in 3.45s
```

**Preview Build:**

```bash
npm run preview

# Expected output:
# ➜  Local:   http://localhost:4173/
# ➜  Network: use --host to expose
```

**Test Production Build:**

```bash
open http://localhost:4173
```

---

### Deploy Backend (Production)

**Options:**

#### Option 1: VPS (DigitalOcean, Linode, Hetzner)

```bash
# SSH into server
ssh user@your-server.com

# Clone repo
git clone https://github.com/yourusername/amk-journal.git
cd amk-journal/.claude/api

# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install --production

# Setup environment
cp .env.example .env
nano .env  # Add production API keys

# Run migrations
bun run db:migrate

# Start with PM2 (process manager)
pm2 start bun --name "amk-api" -- run start

# Setup auto-restart
pm2 startup
pm2 save
```

**Nginx Reverse Proxy:**

```nginx
# /etc/nginx/sites-available/amk-api
server {
    listen 80;
    server_name api.amk-command-center.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

#### Option 2: Railway.app (Easiest)

**Setup:**

1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select `amk-journal` repo
4. Set root directory: `.claude/api`
5. Add environment variables (from .env)
6. Deploy

**Railway Config:**

```toml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "bun run start"
healthcheckPath = "/api/v1/health"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

**Custom Domain:**

- Settings → Domains → Add custom domain
- Add DNS record: `api.amk-command-center.com` → Railway CNAME
- SSL auto-enabled

---

#### Option 3: Fly.io (Docker)

**Dockerfile:**

```dockerfile
# .claude/api/Dockerfile
FROM oven/bun:1-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --production

# Copy source
COPY . .

# Run migrations
RUN bun run db:migrate

# Expose port
EXPOSE 3002

# Start server
CMD ["bun", "run", "start"]
```

**Deploy:**

```bash
cd /Users/amk/Projects/amk-journal/.claude/api

# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Initialize app
flyctl launch

# Deploy
flyctl deploy

# Check status
flyctl status
```

---

### Deploy Frontend (Production)

**Options:**

#### Option 1: Vercel (Recommended for SvelteKit)

```bash
cd /Users/amk/Projects/amk-command-center

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

**Environment Variables (Vercel Dashboard):**

- `VITE_API_URL` = `https://api.amk-command-center.com/api/v1`
- `PUBLIC_WORKSPACE` = `amk`

**Custom Domain:**

- Settings → Domains → Add domain
- Add DNS record: `command-center.amk.com` → Vercel
- SSL auto-enabled

---

#### Option 2: Netlify

```bash
cd /Users/amk/Projects/amk-command-center

# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

**netlify.toml:**

```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

#### Option 3: Self-Hosted (Nginx)

```bash
# Build on local machine
npm run build

# Copy build to server
scp -r build/* user@server:/var/www/command-center/

# Nginx config
# /etc/nginx/sites-available/command-center
server {
    listen 80;
    server_name command-center.amk.com;

    root /var/www/command-center;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3002;
    }
}
```

---

## Monitoring

### Backend Monitoring

**Health Check Endpoint:**

```bash
# Ping every 5 minutes
*/5 * * * * curl -f http://localhost:3002/api/v1/health || systemctl restart amk-api
```

**Logs:**

```bash
# PM2 logs
pm2 logs amk-api

# System logs
journalctl -u amk-api -f

# Database size
ls -lh /Users/amk/Projects/amk-journal/.claude/api/.claude/data/journal.db
```

**Metrics:**

- Request count: Track in application logs
- Response time: Use `console.time()` in routes
- Database size: Monitor with `ls -lh`
- Error rate: Count 500 responses

---

### Frontend Monitoring

**Analytics (Plausible):**

```html
<!-- Add to src/app.html -->
<script
  defer
  data-domain="command-center.amk.com"
  src="https://plausible.io/js/script.js"
></script>
```

**Error Tracking (Sentry - Optional):**

```bash
npm install @sentry/sveltekit

# src/hooks.client.ts
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: 'https://...@sentry.io/...',
  tracesSampleRate: 1.0,
});
```

---

## Backup Strategy

### Database Backups

**Automated Daily Backups:**

```bash
#!/bin/bash
# /etc/cron.daily/backup-journal-db

DB_PATH="/Users/amk/Projects/amk-journal/.claude/api/.claude/data/journal.db"
BACKUP_DIR="/backups/journal"
DATE=$(date +%Y-%m-%d)

# Create backup
sqlite3 $DB_PATH ".backup '$BACKUP_DIR/journal-$DATE.db'"

# Compress
gzip $BACKUP_DIR/journal-$DATE.db

# Keep last 30 days
find $BACKUP_DIR -name "journal-*.db.gz" -mtime +30 -delete
```

**Manual Backup:**

```bash
cd /Users/amk/Projects/amk-journal/.claude/api/.claude/data

# Create timestamped backup
sqlite3 journal.db ".backup 'journal-$(date +%Y-%m-%d-%H%M%S).db'"

# Verify backup
sqlite3 journal-2026-02-16-100000.db "SELECT COUNT(*) FROM entries;"
```

---

### Configuration Backups

**Backup .env files:**

```bash
# Create secure backup (encrypted)
tar -czf config-backup.tar.gz .env
openssl enc -aes-256-cbc -salt -in config-backup.tar.gz -out config-backup.tar.gz.enc

# Restore
openssl enc -aes-256-cbc -d -in config-backup.tar.gz.enc -out config-backup.tar.gz
tar -xzf config-backup.tar.gz
```

---

## Troubleshooting

### Backend Won't Start

**Error:** `EADDRINUSE: address already in use :::3002`

**Fix:**

```bash
# Find process using port 3002
lsof -i :3002

# Kill process
kill -9 <PID>

# Restart backend
bun run dev
```

---

### Database Locked Error

**Error:** `SQLITE_BUSY: database is locked`

**Fix:**

```bash
# Check for zombie connections
fuser .claude/data/journal.db

# Kill zombie processes
fuser -k .claude/data/journal.db

# Restart backend
bun run dev
```

---

### Frontend API Calls Failing

**Error:** `Failed to fetch` (CORS or wrong URL)

**Fix:**

```bash
# 1. Check backend is running
curl http://localhost:3002/api/v1/health

# 2. Verify frontend .env
cat .env | grep VITE_API_URL
# Should be: VITE_API_URL=http://localhost:3002/api/v1

# 3. Restart frontend (picks up .env changes)
npm run dev
```

---

### Search Returns No Results

**Error:** Empty results array despite data existing

**Fix:**

```bash
# 1. Check database has data
cd /Users/amk/Projects/amk-journal/.claude/api
sqlite3 .claude/data/journal.db "SELECT COUNT(*) FROM buyers;"

# 2. Check workspace isolation
curl "http://localhost:3002/api/v1/search?q=leon&workspace=ma" | jq

# 3. Verify search endpoint registered
grep -r "handleSearchRoutes" routes/v1/index.ts
```

---

## Performance Optimization

### Backend Optimizations

**1. Database Indexes:**

```sql
-- Add indexes for common searches
CREATE INDEX idx_buyers_name ON buyers(name);
CREATE INDEX idx_buyers_company ON buyers(company);
CREATE INDEX idx_tasks_content ON tasks(content);
CREATE INDEX idx_people_handle ON people(handle);
```

**2. Response Caching:**

```typescript
// Add Redis caching (optional)
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

async function cachedSearch(query: string) {
  const cacheKey = `search:${query}`;
  const cached = await redis.get(cacheKey);

  if (cached) return JSON.parse(cached);

  const results = await performSearch(query);
  await redis.set(cacheKey, JSON.stringify(results), "EX", 300); // 5 min TTL

  return results;
}
```

---

### Frontend Optimizations

**1. Code Splitting:**

```typescript
// Lazy load heavy components
const CalendarSection = lazy(() => import("./CalendarSection.svelte"));
const HabitStreaks = lazy(() => import("./HabitStreaks.svelte"));
```

**2. Image Optimization:**

```bash
# Install sharp for automatic image optimization
npm install @sveltejs/enhanced-img
```

**3. Bundle Analysis:**

```bash
# Check bundle size
npm run build -- --mode analyze

# Expected: <200KB main bundle
```

---

## Security Checklist

- [ ] API keys in .env (not committed)
- [ ] CORS configured for production domains only
- [ ] HTTPS enabled (SSL certificates)
- [ ] Database backups automated (daily)
- [ ] Rate limiting on API endpoints (future)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Drizzle ORM)
- [ ] XSS prevention (Svelte auto-escapes)

---

## References

- [Timeline MVP Documentation](../TIMELINE-MVP-IMPLEMENTATION.md)
- [Search API Documentation](SEARCH-API.md)
- [Variable Rewards System](VARIABLE-REWARDS.md)
- [Backend README](../../../amk-journal/.claude/api/README.md)
- [SvelteKit Deployment Docs](https://kit.svelte.dev/docs/adapter-auto)

---

**Last Updated:** 2026-02-16
**Maintained By:** Claude Sonnet 4.5 + AMK
**Version:** 1.0.0
