/* ============================================================
   useStandardOverlay — comportement iOS uniforme pour overlays
   ============================================================
   Ajoute aux overlays existants tout ce qu'il manque pour qu'ils
   se comportent comme des fenêtres iOS natives :

     • Body scroll lock (la page derrière reste figée)
     • Touche Escape ferme
     • role="dialog" + aria-modal="true" + aria-labelledby
     • Focus trap basique (Tab reste dans la fenêtre)
     • Restore focus à l'élément déclencheur à la fermeture

   Usage :
     const { dialogProps, titleId } = useStandardOverlay({
       open: !closing,
       onClose: handleClose,
       labelText: 'Mon Carnet',     // ou labelledBy: 'id'
     });
     return <div {...dialogProps} {...bindEdge}>...
   ============================================================ */

import { useEffect, useRef, useId } from 'react';

export default function useStandardOverlay({
  open,
  onClose,
  labelText,           // texte court pour aria-label si pas de titre visible
  labelledBy,          // id d'un élément qui sert de titre
  scrollLock = true,
  escapeCloses = true,
  focusTrap = true,
  restoreFocus = true,
}) {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const titleId = useId();

  // 1. Mémoriser l'élément focused juste avant ouverture (pour restore)
  useEffect(() => {
    if (!open) return;
    triggerRef.current = (typeof document !== 'undefined') ? document.activeElement : null;
    return () => {
      if (!restoreFocus) return;
      const el = triggerRef.current;
      if (el && typeof el.focus === 'function') {
        try { el.focus({ preventScroll: true }); } catch (_) {}
      }
    };
  }, [open, restoreFocus]);

  // 2. Body scroll lock
  useEffect(() => {
    if (!open || !scrollLock || typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open, scrollLock]);

  // 3. Escape handler
  useEffect(() => {
    if (!open || !escapeCloses) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && typeof onClose === 'function') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, escapeCloses, onClose]);

  // 4. Focus trap : auto-focus le 1er élément focusable + cycle Tab
  useEffect(() => {
    if (!open || !focusTrap || !containerRef.current) return;
    const container = containerRef.current;

    // Autofocus 1er élément focusable au mount (sauf si un autoFocus est déjà déclaré)
    const focusables = getFocusable(container);
    if (focusables.length > 0 && !container.contains(document.activeElement)) {
      try { focusables[0].focus({ preventScroll: true }); } catch (_) {}
    }

    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const list = getFocusable(container);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    container.addEventListener('keydown', onKey);
    return () => container.removeEventListener('keydown', onKey);
  }, [open, focusTrap]);

  // Props à étaler sur le conteneur racine. Attacher `containerRef` manuellement
  // via `ref={containerRef}` (les refs ne se spread pas via {...props}).
  const dialogProps = {
    role: 'dialog',
    'aria-modal': 'true',
    ...(labelText
      ? { 'aria-label': labelText }
      : labelledBy
        ? { 'aria-labelledby': labelledBy }
        : { 'aria-labelledby': titleId }),
    tabIndex: -1,
  };

  return { dialogProps, titleId, containerRef };
}

// Liste des éléments focusables dans un container — pour focus trap.
function getFocusable(container) {
  if (!container) return [];
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');
  return Array.from(container.querySelectorAll(selector)).filter((el) => {
    if (el.offsetWidth === 0 && el.offsetHeight === 0) return false;
    if (el.hasAttribute('aria-hidden')) return false;
    return true;
  });
}
