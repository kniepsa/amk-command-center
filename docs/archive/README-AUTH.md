# Command Center Authentication

## Overview

Command Center uses **HTTP Basic Authentication** to protect your personal data when deployed to Vercel.

When you access the app, your browser will show a login prompt asking for:

- **Username**: Enter anything (e.g., "user", "amk", etc.)
- **Password**: The password you configured

---

## Local Development

**Current password**: `changeme`

When running locally (http://localhost:5176), you'll see a browser login prompt. Enter:

- Username: `user` (or anything)
- Password: `changeme`

---

## Production Deployment (Vercel)

### Step 1: Set Password in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your Command Center project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `PASSWORD`
   - **Value**: Your secure password (e.g., `MySecurePass123!`)
   - **Environment**: Production (and Preview if needed)
5. Click **Save**
6. Redeploy your app

### Step 2: Deploy to Vercel

```bash
cd /Users/amk/Projects/amk-command-center
vercel --prod
```

### Step 3: Access Your App

When you visit your Vercel URL (e.g., `https://command-center-xxx.vercel.app`):

1. Browser will show login prompt
2. Enter:
   - **Username**: `user` (or anything)
   - **Password**: The password you set in Vercel environment variables
3. Click "Sign In"
4. ✅ You're in!

---

## Security Notes

### ✅ What This Protects

- All routes are password-protected
- No one can access your personal data without the password
- Browser remembers credentials for the session

### ⚠️ Limitations

- **Not encrypted** if using HTTP (always use HTTPS on Vercel)
- **Single password** for all users (fine for personal use)
- **Browser-based auth** (not a custom login page)

### 🔒 Recommendations

1. **Use a strong password**: Mix uppercase, lowercase, numbers, symbols
2. **Don't share the password**: This is YOUR personal dashboard
3. **Use HTTPS only**: Vercel provides this automatically
4. **Change default password**: Never use `changeme` in production!

---

## How It Works (Technical)

The authentication is implemented in `src/hooks.server.ts`:

```typescript
export const handle: Handle = async ({ event, resolve }) => {
  const auth = event.request.headers.get("authorization");

  if (!auth) {
    return new Response("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Command Center - Private Access"',
      },
    });
  }

  const [scheme, encoded] = auth.split(" ");
  const [username, password] = atob(encoded || "").split(":");
  const correctPassword = process.env.PASSWORD || "changeme";

  if (password !== correctPassword) {
    return new Response("Invalid credentials", { status: 401 });
  }

  return resolve(event);
};
```

**What happens:**

1. Every request checks for `Authorization` header
2. If missing → 401 Unauthorized → Browser shows login prompt
3. If present → Decode Base64 credentials → Check password
4. If password matches `process.env.PASSWORD` → Allow access
5. If password wrong → 401 Unauthorized → Try again

---

## Changing Password

### Local Development

Edit `.env`:

```bash
PASSWORD=your-new-password
```

Then restart dev server:

```bash
npm run dev
```

### Vercel Production

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Edit `PASSWORD` variable
3. Redeploy (or wait for next deployment)

---

## Removing Password Protection (Not Recommended)

If you want to disable auth (e.g., for internal network only):

Edit `src/hooks.server.ts`:

```typescript
export const handle: Handle = async ({ event, resolve }) => {
  // Skip auth if DISABLE_AUTH=true
  if (process.env.DISABLE_AUTH === "true") {
    return resolve(event);
  }

  // ... rest of auth code
};
```

Then set `DISABLE_AUTH=true` in environment variables.

**⚠️ Warning**: Only do this if Command Center is on a private network!

---

## Troubleshooting

### "Authentication required" popup keeps appearing

- **Cause**: Wrong password or browser didn't save credentials
- **Fix**: Enter the correct password from `.env` (local) or Vercel env vars (production)

### Forgot password

**Local**: Check `.env` file
**Vercel**: Check Vercel Dashboard → Settings → Environment Variables → `PASSWORD`

### Want to change password

**Local**: Edit `.env`, restart server
**Vercel**: Update environment variable, redeploy

---

**Current Status**:

- ✅ Auth implemented in `hooks.server.ts`
- ✅ Default password: `changeme` (local development)
- ⚠️ **CHANGE PASSWORD** before deploying to Vercel!

**Next**: Set a secure password in Vercel environment variables before deploying.
