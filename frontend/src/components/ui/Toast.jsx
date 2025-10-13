/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const ToastContext = createContext(null);

function Icon({ type }) {
  if (type === 'success') return (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
  if (type === 'error') return (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
  return (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  // timers refs: { [id]: timeoutId }
  const timers = useRef({});

  // push a toast; returns id
  const push = useCallback((message, type = 'info', timeout = 5000) => {
    const id = Date.now() + Math.random();
    const expiresAt = timeout ? Date.now() + timeout : null;
    setToasts((t) => [...t, { id, message, type, expiresAt }]);

    if (timeout) {
      const tid = setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
        delete timers.current[id];
      }, timeout);
      timers.current[id] = tid;
    }
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  // pause timer for a toast
  const pause = useCallback((id) => {
    if (!timers.current[id]) return;
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  // resume timer, calculating remaining time
  const resume = useCallback((id) => {
    const t = toasts.find((x) => x.id === id);
    if (!t || !t.expiresAt) return;
    const remaining = t.expiresAt - Date.now();
    if (remaining <= 0) {
      remove(id);
      return;
    }
    const tid = setTimeout(() => {
      setToasts((arr) => arr.filter((x) => x.id !== id));
      delete timers.current[id];
    }, remaining);
    timers.current[id] = tid;
  }, [toasts, remove]);

  // cleanup on unmount
  useEffect(() => () => {
    Object.values(timers.current).forEach((tid) => clearTimeout(tid));
    timers.current = {};
  }, []);

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
  <div aria-live="polite" aria-atomic="true" className="fixed right-4 top-4 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            onMouseEnter={() => pause(t.id)}
            onMouseLeave={() => resume(t.id)}
            className={`px-4 py-2 rounded shadow text-sm flex items-start gap-2 ${t.type === 'error' ? 'bg-red-600 text-white' : t.type === 'success' ? 'bg-green-600 text-white' : 'bg-slate-800 text-white'}`}
          >
            <div className="flex items-center">
              <Icon type={t.type} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate">{t.message}</div>
            </div>
            <button onClick={() => remove(t.id)} className="ml-2 opacity-80 hover:opacity-100">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
