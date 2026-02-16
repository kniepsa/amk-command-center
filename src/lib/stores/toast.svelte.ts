type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number; // ms
}

class ToastStore {
  private toasts = $state<Toast[]>([]);

  get items(): Toast[] {
    return this.toasts;
  }

  show(type: ToastType, message: string, duration = 3000): void {
    const id = crypto.randomUUID();
    const toast: Toast = { id, type, message, duration };
    this.toasts = [...this.toasts, toast];

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show("success", message, duration);
  }

  error(message: string, duration?: number): void {
    this.show("error", message, duration);
  }

  info(message: string, duration?: number): void {
    this.show("info", message, duration);
  }

  warning(message: string, duration?: number): void {
    this.show("warning", message, duration);
  }

  dismiss(id: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  clear(): void {
    this.toasts = [];
  }
}

export const toast = new ToastStore();
