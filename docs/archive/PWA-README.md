# Progressive Web App (PWA) - Quick Start

AMK Command Center is now a fully-featured Progressive Web App that can be installed on your phone's home screen and works offline.

## What This Means

- **Install on home screen**: No app store needed, install directly from Safari/Chrome
- **Works offline**: Voice recordings, drafts, and tasks saved locally when offline
- **Automatic sync**: When you go back online, everything syncs automatically
- **Native feel**: Opens like a native app, no browser UI
- **Fast loading**: Critical pages cached for instant access

---

## How to Install

### iPhone/iPad (iOS 16.4+)

1. Open **Safari** (not Chrome)
2. Navigate to the app URL
3. Tap the **Share** button (square with arrow up)
4. Scroll down → Tap **"Add to Home Screen"**
5. Tap **"Add"**
6. Launch from home screen

**App shortcuts**: Long-press the icon for quick access to Daily, Urgent, People, or Voice Entry.

### Android Phone/Tablet (Chrome)

1. Open **Chrome** browser
2. Navigate to the app URL
3. Wait for install banner OR tap three-dot menu → **"Add to Home Screen"**
4. Tap **"Install"** or **"Add"**
5. Find in app drawer

**App shortcuts**: Long-press the icon for quick access to Daily, Urgent, People, or Voice Entry.

### Desktop (Chrome/Edge)

1. Open Chrome or Edge browser
2. Navigate to the app URL
3. Click the **install icon** in address bar (⊕ or computer icon)
4. Click **"Install"**
5. App opens in separate window

---

## Using Offline Mode

### What Works Offline

- View cached pages (Home, Daily, Urgent, People, Metrics)
- Create voice recordings (saved locally)
- Write draft entries (queued for sync)
- Mark tasks complete (synced later)

### What Requires Internet

- Voice transcription (requires API)
- AI features (Claude integration)
- Real-time collaboration
- Loading uncached pages

### How It Works

1. **Go offline** (Airplane mode, no WiFi)
2. **Offline indicator appears** (bottom-right corner, red badge)
3. **Continue working** (recordings saved to phone storage)
4. **Indicator shows pending count** ("3 pending")
5. **Go back online**
6. **Automatic sync** (indicator shows "Syncing...")
7. **Pending count drops to 0** (all items uploaded)

### Manual Sync

- Tap the offline indicator (bottom-right)
- Tap **"Sync Now"** button
- Wait for sync to complete

---

## Storage & Data

### What's Stored Locally

- **Cache Storage** (2-5 MB): Cached pages and assets
- **IndexedDB** (variable):
  - Voice recordings: ~100 KB per minute
  - Draft entries: ~2 KB each
  - Pending API requests: ~1 KB each

### How Long Is Data Kept

- **Cached pages**: Until you clear browser cache or cache version updates
- **Offline queue**: Until successfully synced
- **Failed items**: Retried for 7 days, then removed

### Clearing Data

**iOS Safari**:

1. Settings → Safari → Advanced → Website Data
2. Find your app domain
3. Swipe left → Delete

**Android Chrome**:

1. Settings → Privacy → Clear browsing data
2. Advanced → Cached images and files
3. Select time range → Clear data

---

## Troubleshooting

### App Won't Install

**iOS**:

- Must use Safari (not Chrome/Firefox)
- Turn off Private Browsing mode
- Visit site at least once before installing

**Android**:

- Must have HTTPS (http:// won't work)
- Visit site twice over 5 minutes for auto-prompt
- Use three-dot menu → "Add to Home Screen" manually

### Offline Mode Not Working

1. Check if service worker is active:
   - Desktop: F12 → Application → Service Workers
   - Should show "activated and is running"

2. Verify cached pages exist:
   - Desktop: F12 → Application → Cache Storage
   - Should have entries for /, /daily, /urgent, etc.

3. Test with browser offline mode first:
   - Desktop: F12 → Network → Offline checkbox
   - If works in browser, should work on phone

### Sync Not Happening

1. **Check connection**:
   - Offline indicator should turn blue/green when online
   - If stays red, check WiFi/cellular

2. **Manual sync**:
   - Tap indicator → "Sync Now"
   - Watch for error messages

3. **Clear and retry**:
   - If sync fails repeatedly, clear offline queue:
   - Desktop: F12 → Application → IndexedDB → Delete database
   - Mobile: Clear browser data

### Icons Not Showing

1. **Clear cache and reinstall**:
   - Delete app from home screen
   - Clear browser cache
   - Reinstall from browser

2. **Check browser console** (desktop only):
   - F12 → Console
   - Look for icon loading errors
   - Report any errors to support

---

## Performance Tips

### For Best Offline Experience

1. **Pre-cache important pages**:
   - Visit all pages you use frequently while online
   - They'll be available offline automatically

2. **Record voice in short clips**:
   - Shorter recordings sync faster
   - Less risk of data loss if sync fails

3. **Draft entries offline, edit online**:
   - Basic entry creation works offline
   - Complex formatting/AI features require internet

### Battery Optimization

- **Background sync uses minimal battery** (<1% per hour)
- **Turn off sync when low battery**:
  - App settings → Disable automatic sync
  - Use manual sync only

---

## Privacy & Security

### What's Stored Locally

- Only YOUR data (no other users)
- Encrypted at rest (iOS/Android handle encryption)
- Cleared when you delete app

### What's Sent to Server

- Voice recordings (for transcription)
- Draft entries (to save to cloud)
- API mutations (task completion, etc.)

### What's NEVER Stored Offline

- API keys or credentials
- Other users' data
- Sensitive payment info

---

## Updates

### Automatic Updates

- Service worker checks for updates every visit
- New version downloads in background
- Installs on next app close/reopen
- Old cached data automatically cleared

### Manual Update

1. Close app completely (swipe away)
2. Reopen app
3. Force refresh:
   - iOS: Pull down to refresh
   - Android: Swipe down from top

### Version History

Check app version:

- Desktop: F12 → Application → Service Workers → Script version
- Shows cache version (e.g., "v1", "v2")

---

## Known Limitations

### iOS Safari

- No background sync (sync only when app open)
- No push notifications
- Limited storage quota (50 MB vs 1 GB on Android)

### Android Chrome

- Full PWA support
- Background sync works even when app closed
- Push notifications supported (not yet implemented)

### Desktop

- All features work
- Better debugging tools (DevTools)
- No background sync when browser closed

---

## Getting Help

### Check These First

1. **PWA Testing Guide**: `/PWA-TESTING-GUIDE.md` (detailed testing procedures)
2. **Setup Summary**: `/PWA-SETUP-SUMMARY.md` (technical implementation details)
3. **Deployment Checklist**: `/PWA-DEPLOYMENT-CHECKLIST.md` (for developers)

### Still Having Issues?

1. **Check browser console** (desktop):
   - F12 → Console
   - Look for red error messages
   - Screenshot and report

2. **Test on desktop first**:
   - Easier to debug with DevTools
   - Most issues reproducible on desktop

3. **File a bug report**:
   - GitHub Issues: `amk-command-center/issues`
   - Include:
     - Device/browser version
     - Steps to reproduce
     - Console screenshot

---

## FAQ

**Q: Does this use my phone's storage?**
A: Yes, but minimal (2-10 MB typically). Much less than native apps.

**Q: Will offline items expire?**
A: Failed items retry for 7 days, then removed. Successful syncs clear immediately.

**Q: Can I use it without installing?**
A: Yes! All features work in browser. Installing just makes it easier to access.

**Q: What happens if I run out of storage?**
A: Browser shows quota warning. Clear old data or reduce offline usage.

**Q: Does it work on old phones?**
A: Requires iOS 16.4+ or Android 10+. Older versions may have limited support.

**Q: Can I install on multiple devices?**
A: Yes! Install on phone, tablet, and desktop. Each syncs independently.

**Q: What if I delete the app?**
A: All local data deleted. Cloud data (server) remains safe.

**Q: Does it use data in background?**
A: Only when syncing (typically <1 MB per sync). No background data on iOS.

---

## Advanced Features (Coming Soon)

- [ ] Push notifications (Android)
- [ ] Periodic background sync
- [ ] File system access for imports
- [ ] Share target (share TO app from other apps)
- [ ] Voice recording compression (smaller file sizes)

---

**Last Updated**: 2026-02-15
**PWA Version**: 1.0
**Supported Browsers**: iOS Safari 16.4+, Android Chrome 80+, Desktop Chrome/Edge 80+
