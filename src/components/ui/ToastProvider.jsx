import { useCallback, useMemo, useState } from "react";
import Toast from "./Toast";
import { ToastContext } from "./toastContext";

const DEFAULT_DURATION = 3200;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title, message, duration = DEFAULT_DURATION, closable = true }) => {
      const id = crypto.randomUUID();
      const toast = { id, type, title, message, closable };

      setToasts((current) => [toast, ...current].slice(0, 4));

      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }

      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      dismiss,
      error: (message, options = {}) =>
        showToast({ ...options, message, type: "error" }),
      info: (message, options = {}) =>
        showToast({ ...options, message, type: "info" }),
      success: (message, options = {}) =>
        showToast({ ...options, message, type: "success" }),
      warning: (message, options = {}) =>
        showToast({ ...options, message, type: "warning" }),
      showToast,
    }),
    [dismiss, showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[10000] mx-auto flex w-full max-w-[430px] flex-col gap-2 px-3 sm:top-5">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
