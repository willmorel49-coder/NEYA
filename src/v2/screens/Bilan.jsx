/* ============================================================
   NÉYA V2 — Bilan du soir (overlay contemplatif nocturne)
   ============================================================
   5 questions séquentielles, posées une à une.
   Pas d'analyse externe. Pas de comparaison. Pas de musique.
   Daily-lock : un seul bilan par soir.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { ls, getProfile, haptic } from '../state';
import { WORLDS } from '../worlds';
import useSwipeToDismiss from '../hooks/useSwipeToDismiss';
import useStandardOverlay from '../hooks/useStandardOverlay';

const TOTEM_HOME = {
  lion: 'foret',
  ours: 'temple',
  aigle: 'oasis',
  daim: 'lac',
  baleine: 'montagne',
  renard: 'communaute',
};

const TILLEUL = '#d4e08c';
// Le vrai terracotta D.A. (#9F584C → 4.7:1 sur cream). #c29051 = ochre (FAIL 2.7:1).
const TERRACOTTA = '#9F584C';

const BILAN_QUESTIONS = [
  {
    id: 'mood',
    eyebrow: "L'ÉTAT",
    title: 'Comment ça allait, vraiment ?',
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
    title: 'Un instant qui a compté ?',
    type: 'text',
    placeholder: 'Une seule phrase suffit…',
  },
  {
    id: 'soi',
    eyebrow: 'TOI',
    title: 'Tu as été quoi pour toi aujourd’hui ?',
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
    title: 'Une chose à laisser ce soir ?',
    type: 'text',
    placeholder: 'Tu peux laisser ici.',
  },
  {
    id: 'demain',
    eyebrow: 'DEMAIN',
    title: 'Que veux-tu apporter à demain ?',
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
  const profile = getProfile();
  const totemKey = profile?.totem || 'lion';
  const worldKey = TOTEM_HOME[totemKey] || 'lac';
  const world = WORLDS[worldKey] || WORLDS.lac;
  const accent = world.accent;

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
      // Pre-fill currentText from existing answer if present
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

  // Swipe-to-dismiss (iOS HIG : drag-handle down)
  const { bindHandle, translateY, isDragging } = useSwipeToDismiss({
    onClose: doClose,
  });

  // Comportement iOS standard (scroll lock body + ESC + focus trap + ARIA)
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
      // Fade then reveal
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

  const handleSkip = () => {
    // "Passer ce soir" — saves what's filled so far, marks date
    haptic(2);
    commitAnswers(answers);
    setFadingQ(true);
    safeTimeout(() => setReveal(true), 280);
  };

  // ============================================================
  // Daily lock screen
  // ============================================================
  if (alreadyDone && !reveal) {
    return (
      <div
        ref={containerRef}
        {...dialogProps}
        className="wash-lac"
        style={overlayStyle({ mounted, closing, dragY: translateY, isDragging })}
      >
        <DragHandle bind={bindHandle} isDragging={isDragging} />
        <BackButton onClick={doClose} absolute />
        <CloseButton onClick={doClose} />
        <div style={centerWrap}>
          <div
            style={{
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.222em',
              textTransform: 'uppercase',
              color: TERRACOTTA,
              marginBottom: 14,
            }}
          >
            BILAN DU SOIR
          </div>
          <div
            style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 26,
              lineHeight: 1.25,
              color: 'var(--ink)',
              maxWidth: 320,
              margin: '0 auto 14px',
            }}
          >
            Tu as déjà posé ce soir.
          </div>
          <div
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 14,
              color: 'var(--content-secondary)',
              lineHeight: 1.5,
            }}
          >
            À demain.
          </div>
          <button
            type="button"
            data-press
            onClick={doClose}
            style={{
              marginTop: 32,
              appearance: 'none',
              border: '1px solid var(--hairline)',
              background: 'var(--ink, #1a1a2f)',
              color: 'var(--cream, #FBF6E8)',
              padding: '14px 28px',
              minHeight: 48,
              borderRadius: 999,
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Fermer
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
      className="wash-lac"
      style={overlayStyle({ mounted, closing, dragY: translateY, isDragging })}
    >
      <DragHandle bind={bindHandle} isDragging={isDragging} />
      {/* Halo accent */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '130%',
          height: '60%',
          background: `radial-gradient(ellipse at center, ${world.accentRgb || 'rgba(123, 111, 168'}, 0.12) 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '6px 12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 3,
        }}
      >
        <BackButton onClick={doClose} />
        <div
          style={{
            fontFamily: '"Sora", system-ui, sans-serif',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: 'var(--content-tertiary)',
          }}
        >
          BILAN DU SOIR
        </div>
        <CloseButton onClick={doClose} inline />
      </div>

      {/* Progression dots */}
      {!reveal && (
        <div
          style={{
            position: 'absolute',
            top: 52,
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
                  width: isCurrent ? 20 : 8,
                  borderRadius: 999,
                  background: isPast
                    ? TILLEUL
                    : isCurrent
                      ? 'var(--ink)'
                      : 'transparent',
                  border: isPast || isCurrent ? 'none' : '1px solid var(--hairline)',
                  transition: 'width 320ms var(--ease-out-ios), background 320ms var(--ease-out-ios)',
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
          padding: '100px 24px 140px',
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
              transition: 'opacity 220ms var(--ease-out-ios), transform 220ms var(--ease-out-ios)',
              width: '100%',
              maxWidth: 420,
            }}
          >
            {/* Eyebrow */}
            <div
              style={{
                fontFamily: '"Sora", system-ui, sans-serif',
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.222em',
                textTransform: 'uppercase',
                color: TERRACOTTA,
                marginBottom: 14,
              }}
            >
              {q.eyebrow}
            </div>

            {/* Title */}
            <h1
              style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(24px, 6vw, 30px)',
                lineHeight: 1.2,
                color: 'var(--ink)',
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
                      border: '1px solid var(--hairline)',
                      background: 'rgba(255, 252, 245, 0.55)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      boxShadow: '0 1px 2px rgba(26, 26, 47, 0.04)',
                      color: 'var(--ink)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      minHeight: 64,
                      transition: 'transform 200ms var(--ease-out-ios), background 200ms var(--ease-out-ios)',
                    }}
                  >
                    {c.glyph && (
                      <span
                        aria-hidden
                        style={{
                          fontFamily: '"Sora", system-ui, sans-serif',
                          fontSize: 18,
                          lineHeight: 1,
                          color: accent,
                        }}
                      >
                        {c.glyph}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
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
                  rows={3}
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value.slice(0, 200))}
                  placeholder={q.placeholder}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '14px 16px',
                    borderRadius: 16,
                    border: '1px solid var(--hairline)',
                    background: 'rgba(255, 252, 245, 0.62)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: 'var(--ink)',
                    resize: 'none',
                    outline: 'none',
                    textAlign: 'left',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 12,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 10,
                    color: 'var(--content-tertiary)',
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
              animation: 'fadeIn 600ms var(--ease-out-ios) both',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <div
              className="tilleul-pop"
              style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontStyle: 'italic',
                fontSize: 56,
                lineHeight: 1,
                color: TILLEUL,
              }}
            >
              ✓
            </div>
            <div
              style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 26,
                lineHeight: 1.2,
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              «&nbsp;Bonne nuit.&nbsp;»
            </div>
            <div
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 14,
                color: 'var(--content-secondary)',
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
            padding: '20px 24px 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            zIndex: 2,
            background: 'linear-gradient(to top, rgba(251, 246, 232, 0.85), rgba(251, 246, 232, 0))',
          }}
        >
          {q?.type === 'text' && (
            <button
              type="button"
              data-press
              onClick={handleNextText}
              disabled={fadingQ}
              style={{
                appearance: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                width: '100%',
                maxWidth: 360,
                padding: '14px 22px',
                borderRadius: 999,
                border: 'none',
                background: 'var(--ink, #1a1a2f)',
                color: 'var(--cream, #FBF6E8)',
                fontFamily: '"Sora", system-ui, sans-serif',
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '0.01em',
                transition: 'transform 200ms var(--ease-out-ios), opacity 200ms var(--ease-out-ios)',
                opacity: fadingQ ? 0.6 : 1,
              }}
            >
              {isLast ? 'Garder ce soir' : 'Suivant →'}
            </button>
          )}

          <button
            type="button"
            data-press
            onClick={handleSkip}
            style={{
              appearance: 'none',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              border: 'none',
              background: 'transparent',
              padding: '12px 18px',
              minHeight: 44,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 13,
              color: 'var(--content-secondary)',
              textDecoration: 'underline',
              textDecorationColor: 'var(--hairline-strong)',
              textUnderlineOffset: '3px',
            }}
          >
            Passer ce soir
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
    ? 'opacity 420ms var(--ease-out-ios)'
    : closing
      ? 'transform 420ms var(--ease-out-ios), opacity 420ms var(--ease-out-ios)'
      : dragY === 0
        ? 'transform 320ms var(--ease-spring-ios), opacity 420ms var(--ease-out-ios)'
        : 'transform 420ms var(--ease-out-ios), opacity 420ms var(--ease-out-ios)';
  return {
    position: 'absolute',
    inset: 0,
    zIndex: 80,
    background: 'var(--cream, #FBF6E8)',
    color: 'var(--ink)',
    overflow: 'hidden',
    opacity,
    transform,
    transition,
    WebkitFontSmoothing: 'antialiased',
  };
}

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
            ? 'var(--ink-soft)'
            : 'rgba(26, 26, 47, 0.18)',
          transition:
            'width 180ms var(--ease-out-ios), height 180ms var(--ease-out-ios), background 180ms var(--ease-out-ios)',
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
};

function BackButton({ onClick, absolute = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-press
      aria-label="Retour"
      style={{
        position: absolute ? 'absolute' : 'relative',
        top: absolute ? 18 : 'auto',
        left: absolute ? 12 : 'auto',
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
        zIndex: 4,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1, marginRight: 2 }}>‹</span>
      Retour
    </button>
  );
}

function CloseButton({ onClick, inline = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-press
      aria-label="Fermer"
      style={{
        position: inline ? 'relative' : 'absolute',
        top: inline ? 'auto' : 12,
        right: inline ? 'auto' : 12,
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
        zIndex: 4,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      ✕
    </button>
  );
}
