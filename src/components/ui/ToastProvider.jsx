import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { ToastContext } from "./ToastContext";

const MAX_TOASTS = 5;

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const styleMap = {
  success: "bg-emerald-600/95 border-emerald-500/60 text-white",
  error: "bg-red-600/95 border-red-500/60 text-white",
  info: "bg-slate-800/95 border-slate-700/60 text-white",
};

const iconColorMap = {
  success: "text-emerald-200",
  error: "text-red-200",
  info: "text-blue-300",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const startDismissTimer = useCallback((id, duration) => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      timersRef.current.delete(id);
      setToasts((t) => t.filter((x) => x.id !== id));
    }, duration);
    timersRef.current.set(id, timer);
  }, []);

  const addToast = useCallback((message, { type = "info", duration = 4000 } = {}) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const toast = { id, message, type, duration };

    setToasts((prev) => {
      const next = [...prev, toast];
      // Enforce max toasts — drop oldest
      if (next.length > MAX_TOASTS) {
        const dropped = next.slice(0, next.length - MAX_TOASTS);
        dropped.forEach((d) => {
          const timer = timersRef.current.get(d.id);
          if (timer) { clearTimeout(timer); timersRef.current.delete(d.id); }
        });
        return next.slice(-MAX_TOASTS);
      }
      return next;
    });

    startDismissTimer(id, duration);
    return id;
  }, [startDismissTimer]);

  const pauseTimer = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const resumeTimer = useCallback((id, duration) => {
    startDismissTimer(id, duration / 2); // resume with half duration
  }, [startDismissTimer]);

  // Cleanup all timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 left-4 right-4 sm:left-auto sm:w-96 z-[60] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type] || iconMap.info;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto max-w-sm w-full rounded-xl p-4 shadow-2xl border backdrop-blur-sm flex items-start gap-3 ${styleMap[toast.type] || styleMap.info}`}
              style={{ animation: "slideInRight 0.3s ease both" }}
              onMouseEnter={() => pauseTimer(toast.id)}
              onMouseLeave={() => resumeTimer(toast.id, toast.duration)}
              role="alert"
            >
              <Icon size={18} className={`flex-shrink-0 mt-0.5 ${iconColorMap[toast.type] || iconColorMap.info}`} />
              <p className="text-sm flex-1 leading-snug">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
