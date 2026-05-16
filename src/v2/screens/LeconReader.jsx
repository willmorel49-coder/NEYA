/* ============================================================
   LeconReader — lecture éditoriale d'une leçon
   ============================================================
   Plein écran cream avec typographie magazine.
   Marque automatiquement la leçon comme lue à la fin du scroll.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { haptic, getProfile, patchProfile } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';

export default function LeconReader({ lecon, onClose }) {
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [readProgress, setReadProgress] = useState(0); // 0..1
  const scrollerRef = useRef(null);
  const aliveRef = useRef(true);
  const timersRef = useRef([]);
  const markedReadRef = useRef(false);

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => { if (aliveRef.current) fn(); }, ms);
    timersRef.current.push(id);
    return id;
  };

  const handleClose = () => {
    if (closing) return;
    haptic(3);
    setClosing(true);
    safeTimeout(() => onClose?.(), 380);
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: lecon.title,
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    haptic(4);
    return () => {
      cancelAnimationFrame(raf);
      aliveRef.current = false;
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  // Track scroll progress + marquage "lu"
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      const pct = max > 0 ? Math.min(1, el.scrollTop / max) : 0;
      setReadProgress(pct);
      // Marque comme lu quand on a dépassé 85% du contenu
      if (pct > 0.85 && !markedReadRef.current) {
        markedReadRef.current = true;
        const profile = getProfile();
        const av = profile.aventure || {};
        const lues = Array.isArray(av.leconsLues) ? av.leconsLues : [];
        if (!lues.includes(lecon.key)) {
          patchProfile({
            aventure: { ...av, leconsLues: [...lues, lecon.key] },
          });
          haptic(2);
        }
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [lecon.key]);

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: '#FFFCF5',
        color: 'var(--ink)',
        transform: closing ? 'translateY(100%)' : mounted ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 14px 12px',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <button
          type="button"
          data-press
          onClick={handleClose}
          aria-label="Retour"
          style={{
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--ink)',
            cursor: 'pointer',
            padding: '10px 14px',
            minHeight: 44,
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.04em',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ‹ Bibliothèque
        </button>
        <div
          aria-hidden
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            color: 'var(--ink-soft)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            paddingRight: 8,
          }}
        >
          <span>{lecon.duration} min</span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 2,
          background: 'rgba(26, 26, 47, 0.06)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.round(readProgress * 100)}%`,
            background: lecon.accent,
            transition: 'width 280ms ease-out',
          }}
        />
      </div>

      {/* Content scrollable */}
      <div
        ref={scrollerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '32px 24px calc(env(safe-area-inset-bottom, 0px) + 80px)',
        }}
      >
        <article style={{ maxWidth: 620, marginInline: 'auto' }}>
          {/* Eyebrow */}
          <div
            className="neya-mark"
            style={{
              color: 'var(--ink-soft)',
              marginBottom: 16,
              fontSize: 9,
            }}
          >
            La connaissance
          </div>

          {/* Title */}
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontWeight: 400,
              fontSize: 'clamp(34px, 9vw, 44px)',
              lineHeight: 1.08,
              letterSpacing: '-0.022em',
              color: 'var(--ink)',
            }}
          >
            {lecon.title}
          </h1>

          {/* Subtitle */}
          <div
            style={{
              marginTop: 8,
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              letterSpacing: '0.222em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'var(--ink-soft)',
            }}
          >
            {lecon.subtitle}
          </div>

          {/* Lead */}
          <p
            style={{
              margin: '32px 0 0',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 'clamp(19px, 5vw, 22px)',
              lineHeight: 1.4,
              color: 'var(--ink)',
              opacity: 0.92,
              paddingLeft: 18,
              borderLeft: `2px solid ${lecon.accent}`,
            }}
          >
            « {lecon.lead} »
          </p>

          {/* Sections */}
          {lecon.sections.map((sec, i) => (
            <section key={i} style={{ marginTop: 40 }}>
              <h2
                style={{
                  margin: '0 0 14px',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontVariationSettings: 'var(--fraunces-italic-soft)',
                  fontWeight: 400,
                  fontSize: 'clamp(20px, 5vw, 24px)',
                  lineHeight: 1.25,
                  color: 'var(--ink)',
                  letterSpacing: '-0.014em',
                }}
              >
                {sec.title}
              </h2>
              {sec.body.map((para, j) => (
                <p
                  key={j}
                  style={{
                    margin: '0 0 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: 'var(--ink)',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: para
                      .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600">$1</strong>')
                      .replace(/\*(.+?)\*/g, '<em style="font-style:italic">$1</em>'),
                  }}
                />
              ))}
            </section>
          ))}

          {/* Closing */}
          <div
            style={{
              marginTop: 56,
              paddingTop: 32,
              borderTop: '0.5px solid rgba(26, 26, 47, 0.10)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                fontSize: 'clamp(18px, 5vw, 22px)',
                lineHeight: 1.4,
                color: 'var(--ink)',
                maxWidth: 480,
                marginInline: 'auto',
              }}
            >
              « {lecon.closing} »
            </p>
            <div
              style={{
                marginTop: 28,
                fontFamily: 'var(--font-ui)',
                fontSize: 9,
                letterSpacing: '0.222em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: 'var(--ink-soft)',
              }}
            >
              NÉYA · La connaissance
            </div>
          </div>

          {/* Bouton retour en bas */}
          <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              data-press
              onClick={handleClose}
              style={{
                appearance: 'none',
                padding: '14px 32px',
                minHeight: 48,
                background: lecon.accent,
                color: '#FBF6E8',
                border: 'none',
                borderRadius: 999,
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.222em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Retour à la bibliothèque
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
