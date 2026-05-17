/* ============================================================
   ÇA VA ? V4 — Bilan du soir (overlay contemplatif)
   ============================================================
   Glassmorphism · Blobs rose-blue · Cormorant + Inter
   5 questions séquentielles, posées une à une.
   Pas d'analyse externe. Pas de comparaison. Pas de musique.
   Daily-lock : un seul bilan par soir.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { ls, getProfile, haptic } from '../state';
import useSwipeToDismiss from '../hooks/useSwipeToDismiss';
import useStandardOverlay from '../hooks/useStandardOverlay';
import Blobs from '../../components/Blobs';

const BILAN_QUESTIONS = [
  {
    id: 'mood',
    eyebrow: "L'ÉTAT",
    title: 'Comment ça allait, vraiment ?',
    type: 'choice',
    choices: [
      { value: 'lourd',  label: 'Lourd',   glyph: '◐' },
      { value: 'mitige', label: 'Mitigé',  glyph: '◑' },
      { value: 'leger',  label: 'Léger',   glyph: '◓' },
      { value: 'fort',   label: 'Fort',    glyph: '◒' },
    ],
  },
  {
    id: 'moment',
    eyebrow: 'LE MOMENT',
    title: 'Un instant qui a compté ?',
    type: 'text',
    placeholder: 'Une seule phrase suffit…',
  },
  {
    id: 'soi',
    eyebrow: 'TOI',
    title: "Tu as été quoi pour toi aujourd'hui ?",
    type: 'choice',
    choices: [
      { value: 'dur',     label: 'Dur·e' },
      { value: 'doux',    label: 'Doux·ce' },
      { value: 'absent',  label: 'Absent·e' },
      { value: 'present', label: 'Présent·e' },
    ],
  },
  {
    id: 'reste',
    eyebrow: 'CE QUI RESTE',
    title: 'Une chose à laisser ce soir ?',
    type: 'text',
    placeholder: 'Tu peux laisser ici.',
  },
  {
    id: 'demain',
    eyebrow: 'DEMAIN',
    title: 'Que veux-tu apporter à demain ?',
    type: 'choice',
    choices: [
      { value: 'douceur',  label: 'De la douceur' },
      { value: 'courage',  label: 'Du courage' },
      { value: 'silence',  label: 'Du silence' },
      { value: 'curieuse', label: 'De la curiosité' },
    ],
  },
];

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

function hasSeenBilanToday(date) {
  const hist = ls.get('bilan_history', []) || [];
  return Array.isArray(hist) && hist.some((e) => e && e.date === date);
}

export default function Bilan({ onClose }) {
  // Profile lu pour compat (props préservés)
  // eslint-disable-next-line no-unused-vars
  const profile = getProfile();

  const today = todayKey();
  const alreadyDone = hasSeenBilanToday(today);

  // In-progress draft restoration
  const draftKey = `bilan_${today}`;
  const draft = ls.get(draftKey, null);

  const [qIdx, setQIdx] = useState(draft?.qIdx || 0);
  const [answers, setAnswers] = useState(draft?.answers || {});
  const [currentText, setCurrentText] = useState('');
  const [reveal, setReveal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [fadingQ, setFadingQ] = useState(false);
  const textRef = useRef(null);
  const aliveRef = useRef(true);
  const timeoutsRef = useRef([]);

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => {
      if (aliveRef.current) fn();
    }, ms);
    timeoutsRef.current.push(id);
    return id;
  };

  const q = BILAN_QUESTIONS[qIdx];
  const isLast = qIdx === BILAN_QUESTIONS.length - 1;

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

  // Autofocus textarea when text question appears
  useEffect(() => {
    if (!alreadyDone && !reveal && q?.type === 'text') {
      const existing = answers[q.id];
      setCurrentText(typeof existing === 'string' ? existing : '');
      const t = setTimeout(() => {
        try { textRef.current?.focus(); } catch {}
      }, 480);
      return () => clearTimeout(t);
    }
  }, [qIdx, reveal, alreadyDone]); // eslint-disable-line

  // Auto-close after reveal
  useEffect(() => {
    if (!reveal) return;
    const t = setTimeout(() => doClose(), 3500);
    return () => clearTimeout(t);
  }, [reveal]); // eslint-disable-line

  const doClose = () => {
    if (closing) return;
    haptic(3);
    setClosing(true);
    safeTimeout(() => onClose?.(), 420);
  };

  // Swipe-to-dismiss
  const { bindHandle, translateY, isDragging } = useSwipeToDismiss({
    onClose: doClose,
  });

  // Comportement iOS standard
  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: doClose,
    labelText: 'Bilan du jour',
  });

  const persistDraft = (nextAnswers, nextIdx) => {
    ls.set(draftKey, { qIdx: nextIdx, answers: nextAnswers });
  };

  const commitAnswers = (finalAnswers) => {
    const hist = ls.get('bilan_history', []) || [];
    const filtered = (Array.isArray(hist) ? hist : []).filter(
      (e) => e && e.date !== today
    );
    filtered.push({ date: today, answers: finalAnswers });
    ls.set('bilan_history', filtered);
    ls.del?.(draftKey);
    try { localStorage.removeItem('neya_v2_' + draftKey); } catch {}
  };

  const advanceFrom = (value) => {
    const nextAnswers = { ...answers, [q.id]: value };
    setAnswers(nextAnswers);
    haptic([4, 30, 4]);

    if (isLast) {
      commitAnswers(nextAnswers);
      setFadingQ(true);
      safeTimeout(() => setReveal(true), 320);
      return;
    }

    setFadingQ(true);
    safeTimeout(() => {
      const ni = qIdx + 1;
      setQIdx(ni);
      setCurrentText('');
      persistDraft(nextAnswers, ni);
      setFadingQ(false);
    }, 220);
  };

  const handleChoice = (val) => {
    if (q.type !== 'choice') return;
    advanceFrom(val);
  };

  const handleNextText = () => {
    if (q.type !== 'text') return;
    const val = (currentText || '').trim();
    advanceFrom(val);
  };

  const handleResumeLater = () => {
    haptic(2);
    persistDraft(answers, qIdx);
    doClose();
  };

  // ============================================================
  // Daily lock screen
  // ============================================================
  if (alreadyDone && !reveal) {
    return (
      <div
        ref={containerRef}
        {...dialogProps}
        style={overlayStyle({ mounted, closing, dragY: translateY, isDragging })}
      >
        <Blobs variant="rose-blue" />
        <DragHandle bind={bindHandle} isDragging={isDragging} />

        <TopBar onBack={doClose} />

        <div style={centerWrap}>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--blue-700)',
              marginBottom: 14,
              position: 'relative',
              zIndex: 1,
            }}
          >
            CE SOIR
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 28,
              lineHeight: 1.25,
              color: 'var(--blue-900)',
              maxWidth: 320,
              margin: '0 auto 14px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Tu as déjà posé ce soir.
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              position: 'relative',
              zIndex: 1,
            }}
          >
            À demain.
          </div>
          <button
            type="button"
            data-press
            onClick={doClose}
            style={{
              ...primaryButtonStyle,
              marginTop: 32,
              maxWidth: 220,
            }}
          >
            FERMER
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // Main flow
  // ============================================================
  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={overlayStyle({ mounted, closing, dragY: translateY, isDragging })}
    >
      <Blobs variant="rose-blue" />
      <DragHandle bind={bindHandle} isDragging={isDragging} />

      {/* Top bar : back + titre Cormorant italique */}
      <TopBar onBack={doClose} />

      {/* Progression dots */}
      {!reveal && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 0px) + 88px)',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            zIndex: 2,
          }}
        >
          {BILAN_QUESTIONS.map((_, i) => {
            const isCurrent = i === qIdx;
            const isPast = i < qIdx;
            return (
              <span
                key={i}
                aria-hidden
                style={{
                  display: 'inline-block',
                  height: 3,
                  width: isCurrent ? 22 : 8,
                  borderRadius: 999,
                  background: isPast
                    ? 'var(--blue-500)'
                    : isCurrent
                      ? 'var(--blue-700)'
                      : 'transparent',
                  border: isPast || isCurrent ? 'none' : '1px solid var(--blue-300)',
                  transition: 'width 320ms cubic-bezier(0.16, 1, 0.3, 1), background 320ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            );
          })}
        </div>
      )}

      {/* Main zone */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: 'calc(env(safe-area-inset-top, 0px) + 130px) 20px calc(env(safe-area-inset-bottom, 0px) + 150px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
          zIndex: 1,
        }}
      >
        {!reveal && q && (
          <div
            style={{
              opacity: fadingQ ? 0 : 1,
              transform: fadingQ ? 'translateY(6px)' : 'translateY(0)',
              transition: 'opacity 220ms cubic-bezier(0.16, 1, 0.3, 1), transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
              width: '100%',
              maxWidth: 420,
            }}
          >
            {/* Eyebrow */}
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--blue-700)',
                marginBottom: 14,
              }}
            >
              {q.eyebrow}
            </div>

            {/* Title — Cormorant italic */}
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 'clamp(26px, 7vw, 32px)',
                lineHeight: 1.2,
                color: 'var(--blue-900)',
                margin: '0 0 28px',
                letterSpacing: '-0.005em',
              }}
            >
              {q.title}
            </h1>

            {/* Choice or text */}
            {q.type === 'choice' ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 10,
                  marginTop: 8,
                }}
              >
                {q.choices.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    data-press
                    onClick={() => handleChoice(c.value)}
                    style={{
                      appearance: 'none',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      padding: '16px 14px',
                      borderRadius: 18,
                      border: '1px solid rgba(255, 255, 255, 0.85)',
                      borderLeft: '3px solid var(--blue-700)',
                      background: 'rgba(255, 255, 255, 0.65)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
                      color: 'var(--blue-900)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      minHeight: 64,
                      transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), background 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    {c.glyph && (
                      <span
                        aria-hidden
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 18,
                          lineHeight: 1,
                          color: 'var(--blue-700)',
                        }}
                      >
                        {c.glyph}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        letterSpacing: '0.005em',
                      }}
                    >
                      {c.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ position: 'relative', width: '100%' }}>
                <textarea
                  ref={textRef}
                  rows={4}
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value.slice(0, 200))}
                  placeholder={q.placeholder}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '16px 18px 16px 22px',
                    minHeight: 120,
                    borderRadius: 16,
                    border: '1px solid rgba(255, 255, 255, 0.85)',
                    borderLeft: '3px solid var(--blue-700)',
                    background: 'rgba(255, 255, 255, 0.65)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 300,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: 'var(--blue-900)',
                    resize: 'none',
                    outline: 'none',
                    textAlign: 'left',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 14,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    fontVariantNumeric: 'tabular-nums',
                    pointerEvents: 'none',
                  }}
                >
                  {(currentText || '').length}/200
                </div>
              </div>
            )}
          </div>
        )}

        {/* Final reveal */}
        {reveal && (
          <div
            style={{
              opacity: 1,
              animation: 'fadeIn 600ms cubic-bezier(0.16, 1, 0.3, 1) both',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 56,
                lineHeight: 1,
                background: 'var(--gradient-blue)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ✓
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 28,
                lineHeight: 1.2,
                color: 'var(--blue-900)',
                margin: 0,
              }}
            >
              «&nbsp;Bonne nuit.&nbsp;»
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                maxWidth: 280,
              }}
            >
              Ton bilan est posé. Tu peux dormir.
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      {!reveal && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px 24px calc(env(safe-area-inset-bottom, 0px) + 28px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            zIndex: 2,
            background: 'linear-gradient(to top, rgba(238, 243, 248, 0.92), rgba(238, 243, 248, 0))',
          }}
        >
          {q?.type === 'text' && (
            <button
              type="button"
              data-press
              onClick={handleNextText}
              disabled={fadingQ}
              style={{
                ...primaryButtonStyle,
                opacity: fadingQ ? 0.6 : 1,
                width: '100%',
                maxWidth: 360,
              }}
            >
              {isLast ? 'TERMINER' : 'SUIVANT'}
            </button>
          )}

          <button
            type="button"
            data-press
            onClick={handleResumeLater}
            style={{
              appearance: 'none',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              border: 'none',
              background: 'transparent',
              padding: '12px 18px',
              minHeight: 44,
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 400,
              color: 'var(--text-secondary)',
              letterSpacing: '0.02em',
            }}
          >
            Reprendre plus tard
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Helpers
   ============================================================ */

function overlayStyle({ mounted, closing, dragY = 0, isDragging = false }) {
  let transform;
  if (closing) transform = 'translateY(100%)';
  else if (!mounted) transform = 'translateY(100%)';
  else if (isDragging || dragY !== 0) transform = `translateY(${dragY}px)`;
  else transform = 'translateY(0)';

  const opacity = closing ? 0 : mounted ? 1 : 0;
  const transition = isDragging
    ? 'opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)'
    : closing
      ? 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)'
      : dragY === 0
        ? 'transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)'
        : 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)';
  return {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    background: 'var(--bg)',
    color: 'var(--text-primary)',
    overflow: 'hidden',
    opacity,
    transform,
    transition,
    WebkitFontSmoothing: 'antialiased',
  };
}

const primaryButtonStyle = {
  appearance: 'none',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
  padding: '15px 24px',
  minHeight: 50,
  background: 'var(--gradient-blue)',
  color: 'white',
  border: 'none',
  borderRadius: 50,
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  boxShadow: '0 8px 24px rgba(26, 90, 127, 0.30), 0 2px 12px rgba(200, 112, 144, 0.18)',
  transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)',
};

function DragHandle({ bind, isDragging }) {
  return (
    <div
      {...bind}
      aria-hidden
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
        zIndex: 5,
      }}
    >
      <div
        style={{
          width: isDragging ? 40 : 36,
          height: isDragging ? 6 : 5,
          borderRadius: 999,
          background: isDragging
            ? 'rgba(10, 36, 56, 0.35)'
            : 'rgba(10, 36, 56, 0.18)',
          transition:
            'width 180ms cubic-bezier(0.16, 1, 0.3, 1), height 180ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  );
}

const centerWrap = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '60px 28px',
  boxSizing: 'border-box',
  zIndex: 1,
};

function TopBar({ onBack }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: 'calc(env(safe-area-inset-top, 0px) + 22px) 16px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 3,
      }}
    >
      <button
        type="button"
        data-press
        onClick={onBack}
        aria-label="Retour"
        style={{
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '10px 14px 10px 4px',
          minHeight: 44,
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '0.04em',
          color: 'var(--text-primary)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {'‹ Retour'}
      </button>
      <h1
        style={{
          margin: 0,
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 'clamp(28px, 7vw, 32px)',
          lineHeight: 1.1,
          color: 'var(--blue-900)',
          letterSpacing: '-0.01em',
        }}
      >
        Bilan du soir
      </h1>
      <span aria-hidden style={{ width: 44, height: 44 }} />
    </div>
  );
}
