/* ============================================================
   NÉYA V2 — Carnet (journal privé, LIGHT MODE)
   ============================================================
   Espace d'écriture privé. Une entrée par jour, mergeable.
   Aucune analyse, aucun envoi. localStorage uniquement.
   Storage : neya_v2_carnet_entries = [{ id, date, body }]
   ============================================================ */

import { useState, useEffect, useRef, useMemo } from 'react';
import { ls, haptic } from '../state';
import useSwipeToDismiss from '../hooks/useSwipeToDismiss';
import useEdgeSwipeBack from '../hooks/useEdgeSwipeBack';
import useStandardOverlay from '../hooks/useStandardOverlay';

const STORAGE_KEY = 'carnet_entries';
const MAX_ENTRIES = 30;
const TRUNCATE_BODY = 180;
const TILLEUL = '#D4E08C';

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

function formatPastDateFr(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

function truncate(body) {
  if (!body) return '';
  if (body.length <= TRUNCATE_BODY) return body;
  return body.slice(0, TRUNCATE_BODY).trimEnd() + ' …';
}

export default function Carnet({ onClose }) {
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

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => {
      if (aliveRef.current) fn();
    }, ms);
    timeoutsRef.current.push(id);
    return id;
  };

  const today = todayKey();

  // Find today's entry (if any) to pre-fill
  useEffect(() => {
    const t = entries.find((e) => e?.date?.split('T')[0] === today);
    if (t && typeof t.body === 'string') {
      setBody(t.body);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Slide-up reveal + unmount cleanup
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(id);
      aliveRef.current = false;
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, []);

  const pastEntries = useMemo(() => {
    return entries
      .filter((e) => e?.date?.split('T')[0] !== today)
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, MAX_ENTRIES);
  }, [entries, today]);

  const handleClose = () => {
    haptic(3);
    setClosing(true);
    safeTimeout(() => onClose?.(), 320);
  };

  // Comportement iOS standard (scroll lock body + ESC + focus trap + ARIA)
  const { dialogProps, containerRef, titleId } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: 'Mon carnet',
  });

  // Swipe-to-dismiss (iOS HIG) — vertical handle drag
  const { bindHandle, translateY, isDragging } = useSwipeToDismiss({
    onClose: handleClose,
  });

  // Edge swipe-back (iOS HIG) — horizontal left-edge drag
  const {
    bindContainer: bindEdge,
    translateX: edgeX,
    isDragging: edgeDragging,
  } = useEdgeSwipeBack({ onClose: handleClose });

  const handleSave = () => {
    const trimmed = (body || '').trim();
    if (!trimmed) return;

    const now = Date.now();
    const nowIso = new Date().toISOString();
    const existingIdx = entries.findIndex(
      (e) => e?.date?.split('T')[0] === today
    );

    let next;
    if (existingIdx >= 0) {
      // Merge : concat le nouveau body avec l'ancien si différent
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

    // Cap total entries — sort desc by id, keep MAX_ENTRIES most recent
    if (next.length > MAX_ENTRIES) {
      next = [...next]
        .sort((a, b) => (b.id || 0) - (a.id || 0))
        .slice(0, MAX_ENTRIES);
    }

    ls.set(STORAGE_KEY, next);
    setEntries(next);
    setSaved(true);
    haptic([6, 30, 6]);

    safeTimeout(() => setSaved(false), 800);
    safeTimeout(() => onClose?.(), 700);
  };

  const charCount = body.length;
  const dateLine = formatTodayFr();

  const transform = closing
    ? 'translateY(100%)'
    : mounted
      ? 'translateY(0)'
      : 'translateY(100%)';
  const backdropOpacity = closing ? 0 : mounted ? 1 : 0;

  // Compose translateY : mount/closing transform + live drag offset
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
        ? 'transform 320ms var(--ease-out-ios), opacity 320ms var(--ease-out-ios)'
        : translateY === 0
          ? 'transform 320ms var(--ease-spring-ios), opacity 420ms var(--ease-out-ios)'
          : 'transform 420ms var(--ease-out-ios), opacity 420ms var(--ease-out-ios)';

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      {...bindEdge}
      className="wash-temple"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        background: 'var(--cream)',
        color: 'var(--ink)',
        overflow: 'hidden',
        opacity: backdropOpacity,
        transform: composedTransform,
        transition: composedTransition,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Edge swipe-back hint — discreet left hairline */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: 1,
          height: 80,
          transform: 'translateY(-50%)',
          background: 'var(--ink-faint, rgba(26, 26, 47, 0.18))',
          opacity: edgeDragging ? 0.5 : 0,
          transition: 'opacity 180ms var(--ease-out-ios)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
      {/* Drag handle — grab zone iOS HIG */}
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
          zIndex: 4,
        }}
        aria-hidden
      >
        <div
          style={{
            width: isDragging ? 40 : 36,
            height: isDragging ? 6 : 5,
            borderRadius: 999,
            background: isDragging
              ? 'var(--ink-soft)'
              : 'rgba(26, 26, 47, 0.18)',
            transition: 'width 180ms var(--ease-out-ios), height 180ms var(--ease-out-ios), background 180ms var(--ease-out-ios)',
          }}
        />
      </div>

      {/* Back button — top-left, 44×44 hit zone (iOS HIG nav) */}
      <button
        type="button"
        onClick={handleClose}
        data-press
        aria-label="Retour"
        style={{
          position: 'absolute',
          top: 18,
          left: 12,
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '12px 14px',
          minWidth: 44,
          minHeight: 44,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontFamily: '"Sora", system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--content-tertiary)',
          zIndex: 3,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1, marginRight: 2 }}>‹</span>
        Retour
      </button>

      {/* Close button — 44×44 tap target (Apple HIG) */}
      <button
        type="button"
        onClick={handleClose}
        data-press
        aria-label="Fermer"
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '1px solid var(--hairline)',
          background: 'rgba(251, 246, 232, 0.6)',
          color: 'var(--ink)',
          fontSize: 15,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 3,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        ✕
      </button>

      {/* Scrollable content */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          overflowY: 'auto',
          padding: '32px 22px 48px',
          boxSizing: 'border-box',
          zIndex: 1,
        }}
      >
        {/* Top bar — centered caps + date */}
        <div style={{ marginBottom: 18, textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--content-tertiary)',
              fontWeight: 500,
              marginBottom: 6,
            }}
          >
            Mon Carnet
          </div>
          <div
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 12,
              color: 'var(--content-secondary)',
              fontVariantNumeric: 'tabular-nums',
              textTransform: 'lowercase',
            }}
          >
            {dateLine}
          </div>
        </div>

        {/* Hero zone */}
        <div style={{ marginBottom: 16 }}>
          <h1
            style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(26px, 7vw, 32px)',
              lineHeight: 1.05,
              color: 'var(--ink)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Aujourd’hui.
          </h1>
          <div
            style={{
              marginTop: 8,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 13,
              color: 'var(--ink-soft)',
              lineHeight: 1.45,
            }}
          >
            Tu écris pour toi. Rien ne sort d’ici.
          </div>
        </div>

        {/* Today's entry editor */}
        <div
          style={{
            background: 'var(--cream-light)',
            border: '1px solid var(--hairline)',
            borderRadius: 18,
            padding: '18px 16px',
            boxShadow: 'var(--shadow-soft)',
            marginBottom: 28,
          }}
        >
          <textarea
            ref={textareaRef}
            autoFocus
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="Ce qui me traverse maintenant…"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              resize: 'vertical',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 15,
              lineHeight: 1.55,
              color: 'var(--ink)',
              minHeight: 140,
              padding: 0,
            }}
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
            <div
              style={{
                fontFamily: '"Sora", system-ui, sans-serif',
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--content-tertiary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {charCount} caractère{charCount > 1 ? 's' : ''}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {saved && (
                <span
                  className="tilleul-pop"
                  aria-label="Sauvegardé"
                  style={{
                    fontFamily: '"Fraunces", Georgia, serif',
                    fontStyle: 'italic',
                    fontSize: 18,
                    lineHeight: 1,
                    color: TILLEUL,
                  }}
                >
                  ✓
                </span>
              )}
              <button
                type="button"
                onClick={handleSave}
                data-press
                disabled={!body.trim()}
                style={{
                  appearance: 'none',
                  border: 'none',
                  background: body.trim() ? 'var(--ink)' : 'var(--hairline)',
                  color: body.trim() ? 'var(--cream-light)' : 'var(--content-tertiary)',
                  fontFamily: '"Sora", system-ui, sans-serif',
                  fontWeight: 500,
                  fontSize: 13,
                  letterSpacing: '0.01em',
                  padding: '14px 24px',
                  minHeight: 48,
                  borderRadius: 999,
                  cursor: body.trim() ? 'pointer' : 'default',
                  transition: 'background 240ms var(--ease-out-ios), color 240ms var(--ease-out-ios)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Garder
              </button>
            </div>
          </div>
        </div>

        {/* Past entries section */}
        <div
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--content-tertiary)',
            fontWeight: 500,
            marginBottom: 12,
          }}
        >
          Mes traces
        </div>

        {pastEntries.length === 0 ? (
          <div
            style={{
              fontFamily: '"Sora", system-ui, sans-serif',
              fontStyle: 'italic',
              fontSize: 12,
              color: 'var(--content-secondary)',
              lineHeight: 1.5,
              padding: '8px 4px',
            }}
          >
            Tes traces apparaîtront ici.
          </div>
        ) : (
          <div
            className="stagger"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {pastEntries.map((entry) => {
              const bodyText = (entry.body || '').trim();
              const count = bodyText.length;
              return (
                <div
                  key={entry.id}
                  style={{
                    background: 'var(--cream-light)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 16,
                    padding: '14px 16px',
                    boxShadow: 'var(--shadow-soft)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: '"Sora", system-ui, sans-serif',
                        fontSize: 9,
                        fontWeight: 500,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--ink-soft)',
                      }}
                    >
                      {formatPastDateFr(entry.date)}
                    </span>
                    <span
                      style={{
                        fontFamily: '"Sora", system-ui, sans-serif',
                        fontSize: 9,
                        fontWeight: 500,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--content-tertiary)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {count} car.
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: 'var(--ink)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {truncate(bodyText)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Whisper footer */}
        <div
          style={{
            marginTop: 32,
            textAlign: 'center',
            fontFamily: '"Fraunces", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--content-secondary)',
            lineHeight: 1.5,
            padding: '0 12px',
          }}
        >
          Tu peux écrire chaque jour. Ou pas.
        </div>
      </div>
    </div>
  );
}
