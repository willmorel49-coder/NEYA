/* ============================================================
   NÉYA V2 — Bilan de la semaine (overlay contemplatif hebdo)
   ============================================================
   4 questions plus profondes que le Bilan du soir.
   Posées une à une, sans analyse, sans comparaison.
   Weekly-lock : un seul bilan par semaine (lundi → dimanche).
   Persist via saveBilanSemaine() (state.js).
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import {
  haptic,
  saveBilanSemaine,
  hasSeenBilanSemaineThisWeek,
} from '../state';

const TILLEUL = '#d4e08c';
const TERRACOTTA = '#c29051';

const QUESTIONS = [
  {
    id: 'highlight',
    eyebrow: "L'INSTANT",
    title: 'Un moment de la semaine qui t’a touché·e ?',
    type: 'text',
    placeholder: 'Une scène, un visage, une lumière…',
  },
  {
    id: 'difficulty',
    eyebrow: 'CE QUI A PESÉ',
    title: 'Qu’est-ce qui a été difficile ?',
    type: 'text',
    placeholder: 'Sans masque. Pour toi.',
  },
  {
    id: 'learning',
    eyebrow: 'CE QUE TU AS APPRIS',
    title: 'Une chose que tu portes différemment maintenant ?',
    type: 'text',
    placeholder: 'Petite ou grande, peu importe.',
  },
  {
    id: 'next',
    eyebrow: 'LA SEMAINE QUI VIENT',
    title: 'Que veux-tu offrir à la semaine prochaine ?',
    type: 'choice',
    choices: [
      { value: 'douceur',   label: 'De la douceur',   glyph: '✿' },
      { value: 'courage',   label: 'Du courage',      glyph: '✦' },
      { value: 'patience',  label: 'De la patience',  glyph: '◯' },
      { value: 'curiosite', label: 'De la curiosité', glyph: '△' },
    ],
  },
];

export default function BilanSemaine({ onClose }) {
  const alreadyDone = hasSeenBilanSemaineThisWeek();

  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentText, setCurrentText] = useState('');
  const [reveal, setReveal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [fadingQ, setFadingQ] = useState(false);
  const textRef = useRef(null);

  const q = QUESTIONS[qIdx];
  const isLast = qIdx === QUESTIONS.length - 1;

  // Slide-up reveal
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Autofocus textarea when a text question appears
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
    const t = setTimeout(() => doClose(), 4000);
    return () => clearTimeout(t);
  }, [reveal]); // eslint-disable-line

  const doClose = () => {
    if (closing) return;
    haptic(3);
    setClosing(true);
    setTimeout(() => onClose?.(), 420);
  };

  const commitAnswers = (finalAnswers) => {
    try { saveBilanSemaine(finalAnswers); } catch {}
  };

  const advanceFrom = (value) => {
    const nextAnswers = { ...answers, [q.id]: value };
    setAnswers(nextAnswers);
    haptic([4, 30, 4]);

    if (isLast) {
      commitAnswers(nextAnswers);
      setFadingQ(true);
      setTimeout(() => setReveal(true), 320);
      return;
    }

    setFadingQ(true);
    setTimeout(() => {
      const ni = qIdx + 1;
      setQIdx(ni);
      setCurrentText('');
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

  const handleSkipWeek = () => {
    haptic(2);
    commitAnswers(answers);
    setFadingQ(true);
    setTimeout(() => setReveal(true), 280);
  };

  // ============================================================
  // Weekly lock screen
  // ============================================================
  if (alreadyDone && !reveal) {
    return (
      <div className="wash-montagne" style={overlayStyle({ mounted, closing })}>
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
            BILAN DE LA SEMAINE
          </div>
          <div
            style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 24,
              lineHeight: 1.3,
              color: 'var(--ink)',
              maxWidth: 320,
              margin: '0 auto 14px',
            }}
          >
            «&nbsp;Tu as déjà posé ta semaine.&nbsp;»
          </div>
          <div
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 13,
              color: 'var(--content-soft, var(--content-tertiary))',
              lineHeight: 1.5,
            }}
          >
            À dimanche prochain.
          </div>
          <button
            type="button"
            data-press
            onClick={doClose}
            style={{
              marginTop: 32,
              appearance: 'none',
              border: 'none',
              background: 'transparent',
              color: 'var(--content-tertiary)',
              padding: '14px 22px',
              minHeight: 44,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 13,
              fontWeight: 400,
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationColor: 'var(--hairline)',
              textUnderlineOffset: '3px',
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
    <div className="wash-montagne" style={overlayStyle({ mounted, closing })}>
      {/* Halo terracotta — recul, perspective */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '140%',
          height: '65%',
          background:
            'radial-gradient(ellipse at center, rgba(194, 144, 81, 0.10) 0%, transparent 65%)',
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
          BILAN DE LA SEMAINE
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
          {QUESTIONS.map((_, i) => {
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
                  transition:
                    'width 320ms var(--ease-out-ios), background 320ms var(--ease-out-ios)',
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
          padding: '100px 24px 150px',
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
              transition:
                'opacity 220ms var(--ease-out-ios), transform 220ms var(--ease-out-ios)',
              width: '100%',
              maxWidth: 440,
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
                marginBottom: 16,
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
                lineHeight: 1.22,
                color: 'var(--ink)',
                margin: '0 0 30px',
                letterSpacing: '-0.005em',
              }}
            >
              {q.title}
            </h1>

            {/* Choice grid (2x2) or text */}
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
                      padding: '18px 14px',
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
                      gap: 8,
                      minHeight: 72,
                      transition:
                        'transform 200ms var(--ease-out-ios), background 200ms var(--ease-out-ios)',
                    }}
                  >
                    {c.glyph && (
                      <span
                        aria-hidden
                        style={{
                          fontFamily: '"Sora", system-ui, sans-serif',
                          fontSize: 22,
                          lineHeight: 1,
                          color: TERRACOTTA,
                        }}
                      >
                        {c.glyph}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: '"Sora", system-ui, sans-serif',
                        fontSize: 14,
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
                  autoFocus
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value.slice(0, 280))}
                  placeholder={q.placeholder}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '16px 18px',
                    borderRadius: 16,
                    border: '1px solid var(--hairline)',
                    background: 'rgba(255, 252, 245, 0.62)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: 'var(--ink)',
                    resize: 'none',
                    outline: 'none',
                    textAlign: 'left',
                    boxShadow: '0 1px 2px rgba(26, 26, 47, 0.04)',
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
                  {(currentText || '').length}/280
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
              maxWidth: 340,
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
                lineHeight: 1.25,
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              «&nbsp;Tu peux laisser la semaine se déposer.&nbsp;»
            </div>
            <div
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 14,
                color: 'var(--content-soft, var(--content-tertiary))',
                lineHeight: 1.55,
              }}
            >
              Ta semaine est posée. Le prochain dimanche, on recommencera.
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: '"Sora", system-ui, sans-serif',
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.222em',
                textTransform: 'uppercase',
                color: TERRACOTTA,
              }}
            >
              BONNE SEMAINE
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
            padding: '20px 24px 30px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            zIndex: 2,
            background:
              'linear-gradient(to top, rgba(251, 246, 232, 0.88), rgba(251, 246, 232, 0))',
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
                transition:
                  'transform 200ms var(--ease-out-ios), opacity 200ms var(--ease-out-ios)',
                opacity: fadingQ ? 0.6 : 1,
              }}
            >
              {isLast ? 'Garder ma semaine' : 'Suivant →'}
            </button>
          )}

          <button
            type="button"
            data-press
            onClick={handleSkipWeek}
            style={{
              appearance: 'none',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              border: 'none',
              background: 'transparent',
              padding: '12px 18px',
              minHeight: 44,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 12,
              color: 'var(--content-tertiary)',
              textDecoration: 'underline',
              textDecorationColor: 'var(--hairline)',
              textUnderlineOffset: '3px',
            }}
          >
            Passer cette semaine
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Helpers
   ============================================================ */

function overlayStyle({ mounted, closing }) {
  const transform = closing
    ? 'translateY(100%)'
    : mounted
      ? 'translateY(0)'
      : 'translateY(100%)';
  const opacity = closing ? 0 : mounted ? 1 : 0;
  return {
    position: 'absolute',
    inset: 0,
    zIndex: 80,
    background: 'var(--cream, #FBF6E8)',
    color: 'var(--ink)',
    overflow: 'hidden',
    opacity,
    transform,
    transition:
      'transform 420ms var(--ease-out-ios), opacity 420ms var(--ease-out-ios)',
    WebkitFontSmoothing: 'antialiased',
  };
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
