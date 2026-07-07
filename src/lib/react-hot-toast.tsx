import React, { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'blank';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type ToastFunction = (message: string) => void;

interface ToastInterface extends ToastFunction {
  error: ToastFunction;
  success: ToastFunction;
}

let listeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

const notify = (message: string, type: ToastType = 'blank') => {
  const id = Math.random().toString();
  toasts = [...toasts, { id, message, type }];
  listeners.forEach((listener) => listener(toasts));
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((listener) => listener(toasts));
  }, 4000);
};

export const toast: ToastInterface = Object.assign(
  (message: string) => notify(message),
  {
    error: (message: string) => notify(message, 'error'),
    success: (message: string) => notify(message, 'success'),
  }
);

export const Toaster: React.FC = () => {
  const [activeToasts, setActiveToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setActiveToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setActiveToasts);
    };
  }, []);

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {activeToasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200 bg-[#1c1c1e] border-zinc-800 text-white pointer-events-auto"
        >
          {t.type === 'success' && (
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-450 border border-emerald-500/30">
              <span className="text-[10px] font-bold">✓</span>
            </div>
          )}
          {t.type === 'error' && (
            <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-455 border border-rose-500/30">
              <span className="text-[10px] font-bold">✕</span>
            </div>
          )}
          <span className="text-xs font-semibold text-zinc-200">{t.message}</span>
        </div>
      ))}
    </div>
  );
};

export default toast;
