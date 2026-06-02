/* ============================================================
   ÇA VA ? V4 — Carnet (Design System unifié)
   ============================================================
   Espace d'écriture privé. Une entrée par jour, mergeable.
   Aucune analyse, aucun envoi. localStorage uniquement.
   Storage : carnet_entries = [{ id, date, body }]
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { ls, haptic } from '../state';
import useSwipeToDismiss from '../hooks/useSwipeToDismiss';
import useEdgeSwipeBack from '../hooks/useEdgeSwipeBack';
import useStandardOverlay from '../hooks/useStandardOverlay';
import {
  Header,
  Eyebrow,
  HeroTitle,
  Body,
  CTA,
  Textarea,
  tokens,
  useToast,
} from '../../components/ui';

const STORAGE_KEY = 'carnet_entries';
const MAX_ENTRIES = 30;

function formatTodayFr() {
  try {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

const PLACEHOLDER_BY_MOOD = {
  'pas-terrible':   'Ce qui pèse, sans filtre…',
  'ca-va-pas-trop': 'Ce qui te traverse…',
  'ca-va':          "Un mot pour toi, pour aujourd'hui…",
};

export default function Carnet({ onClose, onSave, mood }) {
  const toast = useToast();
  const [entries, setEntries] = useState(() => {
    const raw = ls.get(STORAGE_KEY, []);
    return Array.isArray(raw) ? raw : [];
  });
  const [body, setBody] = useState('');
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const textareaRef = useRef(null);
  const aliveRef = useRef(true);
  const timeoutsRef = useRef([]);
  const savingRef = useRef(false);

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => {
      if (aliveRef.current) fn();
    }, ms);
    timeoutsRef.current.push(id);
    return id;
  };

  const today = todayKey();

  useEffect(() => {
    const t = entries.find((e) => e?.date?.split('T')[0] === today);
    if (t && typeof t.body === 'string') {
      setBody(t.body);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(id);
      aliveRef.current = false;
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, []);

  const handleClose = () => {
    haptic(3);
    setClosing(true);
    safeTimeout(() => onClose?.(), 320);
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: 'Mon carnet',
  });

  const { bindHandle, translateY, isDragging } = useSwipeToDismiss({
    onClose: handleClose,
  });

  const {
    bindContainer: bindEdge,
    translateX: edgeX,
    isDragging: edgeDragging,
  } = useEdgeSwipeBack({ onClose: handleClose });

  const handleSave = () => {
    if (savingRef.current) return; // guard double-tap dans le delai d'auto-close
    const trimmed = (body || '').trim();
    if (!trimmed) return;
    savingRef.current = true;

    const now = Date.now();
    const nowIso = new Date().toISOString();
    const existingIdx = entries.findIndex(
      (e) => e?.date?.split('T')[0] === today
    );

    let next;
    if (existingIdx >= 0) {
      const prev = entries[existingIdx];
      const prevBody = (prev.body || '').trim();
      let mergedBody = trimmed;
      if (prevBody && prevBody !== trimmed && !trimmed.startsWith(prevBody)) {
        mergedBody = `${prevBody}\n\n${trimmed}`;
      }
      next = entries.map((e, i) =>
        i === existingIdx ? { ...e, body: mergedBody, date: nowIso } : e
      );
    } else {
      next = [
        ...entries,
        { id: now, date: nowIso, body: trimmed },
      ];
    }

    if (next.length > MAX_ENTRIES) {
      next = [...next]
        .sort((a, b) => (b.id || 0) - (a.id || 0))
        .slice(0, MAX_ENTRIES);
    }

    ls.set(STORAGE_KEY, next);
    setEntries(next);
    setSaved(true);
    haptic([6, 30, 6]);
    toast.show({ message: 'Gardé.', variant: 'success' });

    safeTimeout(() => setSaved(false), 1200);
    // Auto-close laisse le temps de lire le toast (1400ms vs 700ms initial).
    // Si onSave fourni (Checkin V6), on l'appelle au moment du close pour propager l'action.
    safeTimeout(() => {
      onSave?.({ type: 'write', text: trimmed });
      onClose?.();
    }, 1400);
  };

  const charCount = body.length;
  const dateLine = formatTodayFr();

  const transform = closing
    ? 'translateY(100%)'
    : mounted
      ? 'translateY(0)'
      : 'translateY(100%)';
  const backdropOpacity = closing ? 0 : mounted ? 1 : 0;

  const verticalTranslate =
    isDragging || translateY !== 0
      ? `translateY(${translateY}px)`
      : transform;
  const composedTransform = `translateX(${edgeX}px) ${verticalTranslate}`;
  const composedTransition = edgeDragging
    ? 'none'
    : isDragging
      ? 'none'
      : closing
        ? 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1), opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)'
        : translateY === 0
          ? 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1), opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)'
          : 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)';

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      {...bindEdge}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 240,
        background: tokens.bg,
        color: tokens.textPrimary,
        overflow: 'hidden',
        opacity: backdropOpacity,
        transform: composedTransform,
        transition: composedTransition,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Edge swipe-back hint */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: 1,
          height: 80,
          transform: 'translateY(-50%)',
          background: 'rgba(26, 90, 127, 0.20)',
          opacity: edgeDragging ? 0.5 : 0,
          transition: 'opacity 180ms cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
      {/* Drag handle */}
      <div
        {...bindHandle}
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: 64,
          height: 24,
          paddingTop: 8,
          cursor: 'grab',
          touchAction: 'none',
          WebkitTapHighlightColor: 'transparent',
          zIndex: 90,
        }}
        aria-hidden
      >
        <div
          style={{
            width: isDragging ? 40 : 36,
            height: isDragging ? 6 : 5,
            borderRadius: 999,
            background: isDragging
              ? 'rgba(10, 36, 56, 0.32)'
              : 'rgba(10, 36, 56, 0.18)',
            transition: 'width 180ms cubic-bezier(0.16, 1, 0.3, 1), height 180ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* Scrollable content with sticky Header */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          boxSizing: 'border-box',
          zIndex: 1,
        }}
      >
        <Header title="Mon carnet" onBack={handleClose} />

        <div
          style={{
            padding: '8px 22px calc(env(safe-area-inset-bottom, 0px) + 48px)',
            boxSizing: 'border-box',
          }}
        >
          {/* Top date */}
          <div style={{ marginBottom: 18, textAlign: 'center' }}>
            <div
              style={{
                fontFamily: tokens.fonts.ui,
                fontSize: 12,
                color: tokens.textSecondary,
                fontVariantNumeric: 'tabular-nums',
                textTransform: 'lowercase',
              }}
            >
              {dateLine}
            </div>
          </div>

          {/* Hero zone */}
          <div
            style={{
              marginBottom: 16,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 520ms cubic-bezier(0.22, 0.61, 0.36, 1) 80ms, transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1) 80ms',
            }}
          >
            <HeroTitle size="md">Pose-toi.</HeroTitle>
            <div style={{ marginTop: 8 }}>
              <Body variant="body-sm">
                <span style={{ fontFamily: tokens.fonts.display, fontStyle: 'italic' }}>
                  Ce que tu écris reste ici.
                </span>
              </Body>
            </div>
          </div>

          {/* Today's entry editor */}
          <div
            style={{
              marginBottom: 28,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 600ms cubic-bezier(0.22, 0.61, 0.36, 1) 200ms, transform 600ms cubic-bezier(0.22, 0.61, 0.36, 1) 200ms',
            }}
          >
            <Textarea
              ref={textareaRef}
              autoFocus
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder={PLACEHOLDER_BY_MOOD[mood] || 'Ce qui me traverse maintenant…'}
              accent="rose"
              textareaStyle={{ minHeight: 160 }}
            />

            {/* Bottom row : counter + save */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 14,
                gap: 12,
              }}
            >
              <Eyebrow color="muted">
                {charCount} caractère{charCount > 1 ? 's' : ''}
              </Eyebrow>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {saved && (
                  <span
                    aria-label="Sauvegardé"
                    style={{
                      fontFamily: tokens.fonts.display,
                      fontStyle: 'italic',
                      fontSize: 18,
                      lineHeight: 1,
                      color: tokens.rose700,
                    }}
                  >
                    ✓
                  </span>
                )}
                <CTA
                  variant="rose"
                  size="sm"
                  onClick={handleSave}
                  disabled={!body.trim()}
                  haptic={false}
                >
                  Garder ce moment
                </CTA>
              </div>
            </div>
          </div>

          {/* Whisper footer */}
          <div
            style={{
              marginTop: 24,
              textAlign: 'center',
              fontFamily: tokens.fonts.display,
              fontStyle: 'italic',
              fontSize: 13,
              color: tokens.textSecondary,
              lineHeight: 1.5,
              padding: '0 12px',
              opacity: mounted ? 0.85 : 0,
              transition: 'opacity 700ms cubic-bezier(0.22, 0.61, 0.36, 1) 360ms',
            }}
          >
            Tu peux écrire chaque jour. Ou pas.
          </div>
        </div>
      </div>
    </div>
  );
}
