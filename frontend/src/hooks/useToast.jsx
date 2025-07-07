import { useState, useCallback } from "react";
import { createContext, useContext } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after 3 seconds unless it's an error
    if (toast.variant !== "destructive") {
      setTimeout(() => {
        removeToast(id);
      }, 3000);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (options) => {
      if (typeof options === "string") {
        return addToast({ description: options });
      }
      return addToast(options);
    },
    [addToast]
  );

  // Helper methods
  toast.success = useCallback(
    (description) => {
      return addToast({ description, variant: "success" });
    },
    [addToast]
  );

  toast.error = useCallback(
    (description) => {
      return addToast({ description, variant: "destructive" });
    },
    [addToast]
  );

  toast.dismiss = removeToast;

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
