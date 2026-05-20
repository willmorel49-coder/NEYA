/* ============================================================
   ÇA VA ? V4 — Carnet (Design System unifié)
   ============================================================
   Espace d'écriture privé. Une entrée par jour, mergeable.
   Aucune analyse, aucun envoi. localStorage uniquement.
   Storage : carnet_entries = [{ id, date, body }]
   ============================================================ */

import { useState, useEffect, useRef, useMemo } from 'react';
import { ls, haptic } from '../state';
import useSwipeToDismiss from '../hooks/useSwipeToDismiss';
import useEdgeSwipeBack from '../hooks/useEdgeSwipeBack';
import useStandardOverlay from '../hooks/useStandardOverlay';
import {
  Header,
  GlassCard,
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
const TRUNCATE_BODY = 180;

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
    const trimmed = (body || '').trim();
    if (!trimmed) return;

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
    toast.show({ message: 'Entrée du carnet sauvegardée.', variant: 'success' });

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
          <div style={{ marginBottom: 16 }}>
            <HeroTitle size="md">Aujourd’hui.</HeroTitle>
            <div style={{ marginTop: 8 }}>
              <Body variant="body-sm">Tu écris pour toi. Rien ne sort d’ici.</Body>
            </div>
          </div>

          {/* Today's entry editor */}
          <div style={{ marginBottom: 28 }}>
            <Textarea
              ref={textareaRef}
              autoFocus
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Ce qui me traverse maintenant…"
              accent="rose"
              textareaStyle={{ minHeight: 140 }}
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
                  Garder
                </CTA>
              </div>
            </div>
          </div>

          {/* Past entries section */}
          <div style={{ marginBottom: 12 }}>
            <Eyebrow color="muted">Mes traces</Eyebrow>
          </div>

          {pastEntries.length === 0 ? (
            <div
              style={{
                fontFamily: tokens.fonts.display,
                fontStyle: 'italic',
                fontSize: 13,
                color: tokens.textSecondary,
                lineHeight: 1.5,
                padding: '8px 4px',
              }}
            >
              Tes traces apparaîtront ici.
            </div>
          ) : (
            <div
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
                  <GlassCard
                    key={entry.id}
                    radius="md"
                    elevation="soft"
                    padding="14px 16px"
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
                      <Eyebrow color="secondary">{formatPastDateFr(entry.date)}</Eyebrow>
                      <Eyebrow color="muted">{count} car.</Eyebrow>
                    </div>
                    <div
                      style={{
                        fontFamily: tokens.fonts.body,
                        fontSize: 14,
                        lineHeight: 1.55,
                        color: tokens.textPrimary,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {truncate(bodyText)}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}

          {/* Whisper footer */}
          <div
            style={{
              marginTop: 32,
              textAlign: 'center',
              fontFamily: tokens.fonts.display,
              fontStyle: 'italic',
              fontSize: 13,
              color: tokens.textSecondary,
              lineHeight: 1.5,
              padding: '0 12px',
            }}
          >
            Tu peux écrire chaque jour. Ou pas.
          </div>
        </div>
      </div>
    </div>
  );
}
