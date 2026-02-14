/**
 * Platform detection utilities for iOS PWA support
 */

/**
 * Detect if the user is on iOS
 */
export function isIOS(): boolean {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

/**
 * Detect if the app is running as a standalone PWA (installed)
 */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;

  // iOS
  if ("standalone" in window.navigator) {
    return (
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
    );
  }

  // Android/Chrome
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }

  return false;
}

/**
 * Detect if the device supports PWA installation
 */
export function isPWACapable(): boolean {
  if (typeof window === "undefined") return false;

  // Check for iOS
  if (isIOS()) {
    return true; // iOS supports PWA via "Add to Home Screen"
  }

  // Check for beforeinstallprompt event (Chrome/Edge)
  if ("BeforeInstallPromptEvent" in window) {
    return true;
  }

  // Check for service worker support
  if ("serviceWorker" in navigator) {
    return true;
  }

  return false;
}

/**
 * Check if we should show the iOS install prompt
 */
export function shouldShowIOSInstallPrompt(): boolean {
  if (typeof window === "undefined") return false;

  // Only show on iOS Safari, not in standalone mode
  if (!isIOS() || isStandalone()) {
    return false;
  }

  // Check if user has dismissed the prompt
  const dismissed = localStorage.getItem("ios-install-prompt-dismissed");
  if (dismissed === "true") {
    return false;
  }

  return true;
}

/**
 * Mark the iOS install prompt as dismissed
 */
export function dismissIOSInstallPrompt(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("ios-install-prompt-dismissed", "true");
}

/**
 * Reset the iOS install prompt dismissal (for testing)
 */
export function resetIOSInstallPrompt(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("ios-install-prompt-dismissed");
}
