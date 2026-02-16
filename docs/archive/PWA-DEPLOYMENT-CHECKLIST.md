# PWA Deployment Checklist

Quick reference for deploying PWA to production.

## Pre-Deployment Verification

### 1. Build Validation

```bash
# Verify build succeeds
npm run build

# Expected: Build completes without errors
# Note: Accessibility warnings (a11y) are OK for PWA functionality
```

### 2. Icon Generation

```bash
# Regenerate icons if icon.svg was modified
npm run generate-icons

# Verify all 10 icons generated
ls -lh static/*.png
```

### 3. Manifest Validation

```bash
# Start dev server
npm run dev

# Open in Chrome
# Press F12 → Application → Manifest
# Expected: No errors, all icons load
```

### 4. Service Worker Test

```bash
# In Chrome DevTools
# Application → Service Workers
# Expected: "activated and is running"
```

### 5. Offline Mode Test

```bash
# In Chrome DevTools
# Network → Offline checkbox
# Navigate to /daily, /urgent, /people
# Expected: Pages load from cache
```

---

## Production Deployment

### Vercel Deployment

```bash
# Install Vercel CLI (if not already)
npm i -g vercel

# Deploy to production
vercel --prod

# Expected output:
# ✅ Production: https://amk-command-center.vercel.app
```

### Environment Variables

Ensure these are set in Vercel dashboard:

- `ANTHROPIC_API_KEY` - Claude API key
- `REPLICATE_API_TOKEN` - Whisper API key (for voice transcription)
- (Add any other secrets your app needs)

### Post-Deployment Checks

1. **HTTPS Enabled** (required for PWA)
   - Visit production URL
   - Verify browser shows padlock icon

2. **Service Worker Registers**
   - Open DevTools
   - Application → Service Workers
   - Should show "activated and is running"

3. **Manifest Loads**
   - DevTools → Application → Manifest
   - All fields populated correctly
   - No icon loading errors

4. **Install Prompt Works**
   - **iOS Safari**: Share → Add to Home Screen
   - **Android Chrome**: Install banner appears OR three-dot menu → Add to Home Screen

---

## Device Testing

### iOS Safari (iPhone/iPad)

1. Open Safari → Navigate to production URL
2. Tap Share button (square with arrow up)
3. Scroll down → Tap "Add to Home Screen"
4. Verify:
   - Icon preview shows correctly
   - App name is "AMK CC"
   - Tap "Add"
5. Launch from home screen
6. Verify:
   - Opens in standalone mode (no Safari UI)
   - Status bar is purple
   - App shortcuts work (long-press icon)

### Android Chrome

1. Open Chrome → Navigate to production URL
2. Wait for install banner OR tap three-dot menu → "Add to Home Screen"
3. Tap "Install" or "Add"
4. Verify:
   - Icon appears in app drawer
   - Launch opens in standalone mode
   - App shortcuts work (long-press icon)

### Desktop Chrome (Optional)

1. Open Chrome → Navigate to production URL
2. Address bar shows install icon (⊕ or computer icon)
3. Click install icon → Install
4. Verify:
   - App opens in separate window
   - Works like native app

---

## Post-Launch Monitoring

### Week 1

- [ ] Check service worker registration errors (analytics)
- [ ] Monitor cache storage usage
- [ ] Review offline sync success rate
- [ ] Test on 3+ iOS devices
- [ ] Test on 3+ Android devices

### Month 1

- [ ] Run Lighthouse PWA audit (target: 90+/100)
- [ ] Check IndexedDB quota warnings
- [ ] Review user feedback on offline functionality
- [ ] Optimize cache size if needed

---

## Troubleshooting Production Issues

### Service Worker Not Updating

**Symptoms**: Users see old version after deployment

**Solutions**:

1. Increment `CACHE_VERSION` in `service-worker.js`
2. Hard refresh: Shift+F5 (desktop) or clear cache (mobile)
3. Worst case: Unregister SW in DevTools → Users auto-update on next visit

### Icons Not Showing

**Symptoms**: Broken image placeholders on home screen

**Solutions**:

1. Verify icons exist: `https://your-domain.com/icon-192.png`
2. Check Content-Type header: Should be `image/png`
3. Verify manifest.json `icons` array has correct paths
4. Clear browser cache and reinstall

### Offline Mode Not Working

**Symptoms**: App shows errors when offline

**Solutions**:

1. Check service worker is active (DevTools → Application)
2. Verify critical pages are cached (DevTools → Cache Storage)
3. Test with DevTools Network → Offline checkbox first
4. Check console for cache errors

### Sync Failing

**Symptoms**: Offline items never sync

**Solutions**:

1. Check browser console for API errors
2. Verify API endpoints return 200 OK when online
3. Test manual sync (tap indicator → "Sync Now")
4. Check IndexedDB has items (DevTools → Application → IndexedDB)

---

## Rollback Procedure

If PWA causes critical issues:

### Option 1: Disable Service Worker (Fast)

```js
// In service-worker.js, add at top:
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
  );
});

// Comment out all other code
```

Redeploy → Service worker clears all caches → Users back to normal mode.

### Option 2: Unregister Service Worker (Nuclear)

```html
<!-- In src/routes/+layout.svelte, replace SW registration with: -->
<script>
  onMount(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }
  });
</script>
```

Redeploy → Service worker removed from all users.

---

## Success Metrics

Track these KPIs after deployment:

### Installation

- **Install Rate**: % of visitors who install to home screen
  - Target: 5-10% (desktop), 10-15% (mobile)
- **Retention**: % still installed after 7/30 days
  - Target: 70% (7 days), 50% (30 days)

### Offline Usage

- **Offline Sessions**: % of sessions that go offline
  - Baseline: Monitor first month
- **Sync Success Rate**: % of queued items that sync successfully
  - Target: 95%+
- **Sync Latency**: Time from online → items synced
  - Target: <30 seconds

### Performance

- **Service Worker Registration Rate**: % of users with active SW
  - Target: 98%+
- **Cache Hit Rate**: % of requests served from cache
  - Target: 60%+ (depends on network quality)
- **Lighthouse PWA Score**: Google's PWA audit score
  - Target: 90+/100

---

## Maintenance Schedule

### Weekly

- Check error logs (service worker, IndexedDB, sync failures)
- Monitor cache storage quota warnings
- Review user feedback on offline functionality

### Monthly

- Run Lighthouse audit
- Update cache version (forces refresh)
- Clean up old cached assets
- Review and optimize icon sizes

### Quarterly

- Update manifest.json (description, screenshots)
- Regenerate icons if branding changes
- Review and implement new PWA features (Web Push, File System Access, etc.)

---

## Version History

| Date       | Version | Changes                               |
| ---------- | ------- | ------------------------------------- |
| 2026-02-15 | 1.0     | Initial PWA setup                     |
|            |         | - Service worker with offline support |
|            |         | - IndexedDB offline queue             |
|            |         | - Sync indicator UI                   |
|            |         | - 10 icon variants                    |
|            |         | - iOS Safari optimizations            |

---

## Emergency Contacts

**If PWA breaks production:**

1. Check GitHub Issues: `amk-command-center/issues`
2. Review service worker console logs
3. Rollback using Option 1 or 2 above
4. File bug report with:
   - Browser/OS version
   - DevTools console screenshot
   - Steps to reproduce

---

**Last Updated**: 2026-02-15
**Next Review**: 2026-03-15 (1 month)
