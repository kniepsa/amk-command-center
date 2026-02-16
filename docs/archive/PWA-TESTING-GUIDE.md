# PWA Testing Guide

Complete guide for testing Progressive Web App (PWA) functionality on iOS Safari and Android Chrome.

## Prerequisites

- **iOS Device**: iPhone running iOS 16+ with Safari
- **Android Device**: Android 10+ with Chrome browser
- **Development Server**: App running on accessible URL (use ngrok or deploy to staging)

---

## Phase 1: Installation Testing

### iOS Safari

1. **Open in Safari**
   - Navigate to app URL in Safari (not Chrome/Firefox)
   - Ensure you're NOT in Private Browsing mode

2. **Trigger Install Prompt**
   - Tap the Share button (square with arrow pointing up)
   - Scroll down and tap "Add to Home Screen"
   - Verify icon preview shows correctly (purple gradient with microphone)
   - Customize name if desired (default: "AMK CC")
   - Tap "Add"

3. **Launch Installed App**
   - Find "AMK CC" icon on home screen
   - Tap to launch
   - Verify app opens in standalone mode (no Safari UI)
   - Status bar should match theme color (purple)

4. **Check App Shortcuts** (iOS 13+)
   - Long-press app icon on home screen
   - Verify shortcuts appear:
     - Daily Entry
     - Urgent Tasks
     - People
     - Voice Entry
   - Tap one to verify it opens correct page

### Android Chrome

1. **Open in Chrome**
   - Navigate to app URL in Chrome
   - Wait for automatic install banner OR
   - Tap three-dot menu → "Add to Home screen"

2. **Install Prompt**
   - Banner should show: "AMK Command Center - Add to Home screen"
   - Tap "Add" or "Install"
   - Confirm installation

3. **Launch Installed App**
   - Find "AMK Command Center" icon in app drawer
   - Tap to launch
   - Verify app opens in standalone mode
   - Theme color should be purple (#667eea)

4. **Check App Shortcuts** (Android 7.1+)
   - Long-press app icon
   - Verify shortcuts appear (same 4 as iOS)
   - Tap one to verify navigation

---

## Phase 2: Offline Functionality Testing

### Simulate Offline Mode

**iOS:**

1. Swipe down from top-right → Control Center
2. Tap Airplane mode icon
3. Keep WiFi/Bluetooth off

**Android:**

1. Swipe down from top
2. Tap Airplane mode
3. OR use Chrome DevTools (chrome://inspect → Network throttling)

### Test Offline Features

1. **Cached Pages**
   - Go offline
   - Navigate to: Home, Daily, Urgent, People
   - All should load from cache (no errors)

2. **Offline Fallback**
   - Try navigating to uncached page
   - Should redirect to `/offline` page with:
     - Offline icon
     - Status indicator (red dot)
     - List of available features
     - "Try Again" button

3. **Voice Recording Offline**
   - Go to Daily entry
   - Record a voice note
   - Verify it saves to IndexedDB (check DevTools → Application → IndexedDB)
   - Recording should appear in offline queue indicator (bottom-right)

4. **Draft Entries**
   - Create a text entry while offline
   - Submit form
   - Should save to offline queue (not fail)
   - Indicator shows pending count

5. **Offline Sync Indicator**
   - Bottom-right corner should show:
     - Red badge: "Offline"
     - Pending count: "X pending"
   - Tap to expand details panel
   - Verify shows connection status and pending items

### Test Online Sync

1. **Restore Connection**
   - Turn off Airplane mode
   - Wait 2-3 seconds

2. **Automatic Sync**
   - Offline indicator should change to "Syncing..."
   - After sync: indicator turns blue/green
   - Pending count drops to 0
   - Verify items appear in UI (refresh if needed)

3. **Manual Sync**
   - Create offline item
   - Go back online
   - Tap sync indicator → "Sync Now"
   - Verify immediate sync (not waiting for 30s interval)

---

## Phase 3: Background Sync Testing

### iOS (Limited Support)

iOS Safari does NOT support true Background Sync API. Testing focus:

1. **App Switching**
   - Create offline entry
   - Switch to another app (don't close AMK CC)
   - Restore connection
   - Return to AMK CC
   - Verify sync happens on app return

2. **Periodic Sync (30s interval)**
   - Leave app open with offline items
   - Restore connection
   - Wait 30-60 seconds
   - Verify items sync automatically

### Android (Full Support)

1. **Close App Sync**
   - Create offline entry
   - CLOSE app completely (swipe away)
   - Restore connection
   - Wait 1-2 minutes
   - Reopen app
   - Items should already be synced

2. **Background Periodic Sync**
   - Leave app closed with pending items
   - Restore connection
   - Background sync should trigger within 1-5 minutes
   - Check Chrome → three dots → "Site settings" → "Background sync" (should show activity)

---

## Phase 4: Icon & Manifest Validation

### Automated Tools

1. **Lighthouse PWA Audit**

   ```bash
   # In Chrome DevTools
   1. Open DevTools (F12)
   2. Navigate to "Lighthouse" tab
   3. Select "Progressive Web App" category
   4. Click "Generate report"
   ```

   **Target Score**: 90+/100

2. **PWA Builder**
   - Visit: https://www.pwabuilder.com
   - Enter app URL
   - Review PWA score and recommendations

3. **Manifest Validator**
   - DevTools → Application → Manifest
   - Check for errors (should be 0)
   - Verify icon URLs resolve correctly

### Manual Icon Checks

1. **iOS Safari**
   - DevTools → Application → Manifest
   - Check "apple-touch-icon" shows 180x180 image
   - Verify no broken image icons

2. **Android Chrome**
   - DevTools → Application → Manifest
   - Check icons array has 192x192 and 512x512
   - Verify "purpose: any maskable" works (icons not cropped weird)

3. **Icon Quality**
   - High resolution (no pixelation)
   - Transparent background works
   - Colors match brand (purple gradient)

---

## Phase 5: Service Worker Testing

### Verify Service Worker Registration

1. **DevTools Check**
   - DevTools → Application → Service Workers
   - Should show: "activated and is running"
   - URL: `/service-worker.js`

2. **Console Logs**
   - Open console during page load
   - Should see:
     ```
     [App] Service Worker registered: {...}
     [ServiceWorker] Script loaded
     [ServiceWorker] Installing...
     [ServiceWorker] Activating...
     ```

### Cache Strategy Testing

1. **Network-First Routes** (`/api/*`)
   - Go online
   - Visit page with API call
   - DevTools → Network → Check request goes to network
   - Go offline
   - Refresh page
   - Should load from cache (faster)

2. **Cache-First Routes** (`/assets/*`, `/_app/*`)
   - DevTools → Network
   - First load: network request
   - Second load: served from cache (0ms response time)

### Cache Management

1. **Check Cached Assets**
   - DevTools → Application → Cache Storage
   - Expand `amk-cc-v1`
   - Should contain:
     - `/` (homepage)
     - `/daily`, `/urgent`, `/people`, `/metrics`
     - `/offline`
     - CSS/JS bundles

2. **Cache Updates**
   - Deploy new version
   - Service worker should update (may need refresh)
   - Old cache should be deleted
   - New cache created with updated version

---

## Phase 6: Push Notifications (Optional)

**Note**: Requires backend setup for push notifications.

### iOS (Very Limited)

- iOS Safari does NOT support Web Push API (as of iOS 16.4+)
- Alternative: Use iOS native notifications (requires separate integration)

### Android

1. **Request Permission**
   - App should prompt for notification permission
   - Accept permission

2. **Send Test Notification**
   - Use backend or Firebase Cloud Messaging
   - Verify notification appears in Android notification tray

3. **Notification Click**
   - Tap notification
   - Should open app to correct page

---

## Phase 7: Share Target Testing

### iOS

1. **Share FROM App**
   - Create entry with content
   - Use native Share Sheet
   - Verify AMK CC appears in share targets
   - Share to another app (Notes, Messages)

2. **Share TO App** (iOS 15+)
   - From Safari/Photos/Files
   - Tap Share button
   - Select "AMK Command Center"
   - App should open with shared content

### Android

1. **Share TO App**
   - From Chrome/Photos/Files
   - Tap Share button
   - Select "AMK Command Center"
   - Verify content appears in app

2. **Protocol Handler** (Advanced)
   - Create link: `web+amk://action?data=value`
   - Tap link in another app
   - Should open AMK CC with data

---

## Common Issues & Solutions

### iOS Safari

**Issue**: "Add to Home Screen" option missing

- **Solution**: Must use Safari (not Chrome/Firefox)
- **Solution**: Disable Private Browsing mode
- **Solution**: Visit page at least once first

**Issue**: App opens in Safari instead of standalone

- **Solution**: Verify `apple-mobile-web-app-capable` meta tag is set to `yes`
- **Solution**: Reinstall app from home screen

**Issue**: Icons not showing

- **Solution**: Check `apple-touch-icon` link is absolute path (`/apple-touch-icon.png`)
- **Solution**: Verify PNG file exists and is valid (not corrupted)
- **Solution**: Clear Safari cache and reinstall

### Android Chrome

**Issue**: Install banner doesn't appear

- **Solution**: Ensure manifest.json is valid (DevTools → Application → Manifest)
- **Solution**: Must have HTTPS (http:// won't work, except localhost)
- **Solution**: User must visit site at least twice over 5 minutes

**Issue**: Icons look stretched/cropped

- **Solution**: Use `"purpose": "any maskable"` in manifest
- **Solution**: Ensure icons have safe zone (10% padding from edges)

**Issue**: Offline mode not working

- **Solution**: Check service worker is registered (DevTools → Application)
- **Solution**: Verify cache storage has entries
- **Solution**: Test with DevTools → Network → Offline checkbox

### Both Platforms

**Issue**: Sync not happening automatically

- **Solution**: Check browser console for errors
- **Solution**: Verify `navigator.onLine` detects connection correctly
- **Solution**: Manual sync should always work (tap indicator → "Sync Now")

**Issue**: IndexedDB quota exceeded

- **Solution**: Clear old data (voice recordings, drafts)
- **Solution**: Implement automatic cleanup (remove items older than 30 days)
- **Solution**: Ask user to free space

---

## Success Criteria Checklist

- [ ] **Installation**
  - [ ] iOS: App installs to home screen with correct icon
  - [ ] Android: App installs with install banner
  - [ ] Both: App opens in standalone mode (no browser UI)

- [ ] **Icons**
  - [ ] Home screen icon shows correctly (192x192, 512x512)
  - [ ] iOS touch icon shows correctly (180x180)
  - [ ] App shortcuts work (4 shortcuts visible)

- [ ] **Offline**
  - [ ] Cached pages load offline (/, /daily, /urgent, /people)
  - [ ] Offline page shows when no cache available
  - [ ] Voice recordings save to IndexedDB
  - [ ] Draft entries queue for sync

- [ ] **Sync**
  - [ ] Automatic sync on connection restore
  - [ ] Manual sync button works
  - [ ] Sync indicator shows pending count
  - [ ] Background sync works (Android)

- [ ] **Service Worker**
  - [ ] Registers successfully
  - [ ] Caches critical assets
  - [ ] Updates automatically on new deployment

- [ ] **Performance**
  - [ ] Lighthouse PWA score: 90+/100
  - [ ] App loads in <3s on 3G
  - [ ] Offline mode activates in <1s

---

## Testing Tools

### Browser DevTools

- **Chrome**: F12 → Application tab
- **Safari iOS**: Settings → Safari → Advanced → Web Inspector (requires Mac)
- **Remote Debugging**: chrome://inspect (Android) or Safari Develop menu (iOS)

### Online Tools

- **Lighthouse**: https://web.dev/measure/
- **PWA Builder**: https://www.pwabuilder.com
- **Manifest Generator**: https://www.simicart.com/manifest-generator.html/
- **Icon Generator**: https://realfavicongenerator.net

### Network Simulation

- **Chrome DevTools**: Network tab → Throttling → Offline/Slow 3G
- **iOS Simulator**: Additional Tools → Network Link Conditioner
- **Android**: Settings → Developer Options → Select USB Configuration → Charging only

---

## Deployment Notes

### Production Checklist

Before deploying to production:

1. **HTTPS Required**
   - PWA MUST be served over HTTPS (except localhost)
   - Vercel/Netlify handle this automatically

2. **Update Cache Version**
   - Edit `service-worker.js` → `CACHE_VERSION = "v2"`
   - Forces cache refresh for all users

3. **Test on Real Devices**
   - Don't rely on desktop Chrome emulation
   - Test on actual iOS Safari and Android Chrome

4. **Monitor Service Worker**
   - Add analytics to track SW registration failures
   - Log offline/online events
   - Track sync success/failure rates

5. **Update Frequency**
   - Service workers cache aggressively
   - Users may not see updates immediately
   - Consider versioned assets (`app.v2.js`)

---

## Next Steps

After successful PWA testing:

1. **Analytics Integration**
   - Track install events
   - Monitor offline usage
   - Measure sync success rate

2. **Advanced Features**
   - Push notifications (Android)
   - Periodic background sync
   - File system access API

3. **App Store Distribution** (Optional)
   - iOS: Use PWABuilder to generate App Store package
   - Android: Generate Google Play APK
   - Desktop: Electron wrapper for Windows/Mac

---

**Last Updated**: 2026-02-15
**Version**: 1.0
