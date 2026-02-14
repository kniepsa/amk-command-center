/**
 * Toast notification system
 * Simple, accessible toast messages
 */

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastOptions {
  duration?: number;
  position?: "top-right" | "top-center" | "bottom-right" | "bottom-center";
}

export function showToast(
  message: string,
  type: ToastType = "info",
  options: ToastOptions = {},
): void {
  const { duration = 3000, position = "top-right" } = options;

  // Remove any existing toasts with same message
  const existingToasts = document.querySelectorAll(".toast");
  existingToasts.forEach((toast) => {
    if (toast.textContent?.includes(message)) {
      toast.remove();
    }
  });

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast toast-${type} toast-${position}`;
  toast.textContent = message;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  // Add to DOM
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("toast-visible");
  });

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove("toast-visible");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Add global styles if not already present
if (
  typeof document !== "undefined" &&
  !document.getElementById("toast-styles")
) {
  const style = document.createElement("style");
  style.id = "toast-styles";
  style.textContent = `
    .toast {
      position: fixed;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      opacity: 0;
      transform: translateY(-1rem);
      transition: all 0.3s ease;
    }

    .toast-visible {
      opacity: 1;
      transform: translateY(0);
    }

    .toast-top-right {
      top: 1rem;
      right: 1rem;
    }

    .toast-top-center {
      top: 1rem;
      left: 50%;
      transform: translateX(-50%) translateY(-1rem);
    }

    .toast-top-center.toast-visible {
      transform: translateX(-50%) translateY(0);
    }

    .toast-bottom-right {
      bottom: 1rem;
      right: 1rem;
      transform: translateY(1rem);
    }

    .toast-bottom-right.toast-visible {
      transform: translateY(0);
    }

    .toast-bottom-center {
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%) translateY(1rem);
    }

    .toast-bottom-center.toast-visible {
      transform: translateX(-50%) translateY(0);
    }

    .toast-success {
      background: #10b981;
      color: white;
    }

    .toast-error {
      background: #ef4444;
      color: white;
    }

    .toast-warning {
      background: #f59e0b;
      color: white;
    }

    .toast-info {
      background: #3b82f6;
      color: white;
    }
  `;
  document.head.appendChild(style);
}
