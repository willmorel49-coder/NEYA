/* ============================================================
   ToastProvider — Design System V4 (CA VA ?)
   ============================================================
   Provider + hook pour la queue globale de toasts.

   Usage :
     <ToastProvider>
       {children}
     </ToastProvider>

     const toast = useToast();
     toast.show({ message: 'Sauvegarde.', variant: 'success' });
     toast.show({ message: 'Erreur', variant: 'warning', duration: 6000 });
     toast.show({
       message: 'Tu es en mode crise.',
       variant: 'crisis',
       action: { label: 'Appeler 3114', onTap: () => window.location.href = 'tel:3114' }
     });

   - Stack max 3 toasts visibles, gap 8 (les anciens dégagent)
   - Auto-dismiss configurable (default 4000ms)
   - toast.dismiss(id) pour fermer manuellement
   - z-index 300 (au-dessus ActionSheet 200, sous Modal 9999)
   ============================================================ */

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Toast from './Toast';

const MAX_VISIBLE = 3;
const TOAST_GAP = 8;
const TOAST_HEIGHT_APPROX = 64; // ~ 14*2 + 24 + line-height (estimation pour stack)

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]); // [{ id, message, variant, icon, action, duration }]
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((opts) => {
    if (!opts || !opts.message) return null;
    idRef.current += 1;
    const id = `toast-${Date.now()}-${idRef.current}`;
    const next = {
      id,
      message: opts.message,
      variant: opts.variant || 'info',
      icon: opts.icon,
      action: opts.action,
      duration: typeof opts.duration === 'number' ? opts.duration : 4000,
    };
    setToasts((prev) => {
      // Maintenir max 3 visibles : on évince les plus anciens
      const merged = [...prev, next];
      if (merged.length > MAX_VISIBLE) {
        return merged.slice(merged.length - MAX_VISIBLE);
      }
      return merged;
    });
    return id;
  }, []);

  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toasts.map((t, i) => (
        <Toast
          key={t.id}
          message={t.message}
          variant={t.variant}
          icon={t.icon}
          action={t.action}
          duration={t.duration}
          topOffset={i * (TOAST_HEIGHT_APPROX + TOAST_GAP)}
          onDismiss={() => dismiss(t.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback no-op si on est hors provider — évite tout crash
    return {
      show: () => null,
      dismiss: () => {},
    };
  }
  return ctx;
}
