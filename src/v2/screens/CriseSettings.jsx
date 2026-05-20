/* ============================================================
   CriseSettings — personnaliser le refuge pour la prochaine crise
   ============================================================
   3 sections : Image · Musique · Rythme respiration.
   Préparé en avance, prêt pour le moment critique.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { getProfile, patchProfile, haptic } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';

const REFUGE_IMAGES = [
  { key: 'oasis',  label: 'Oasis du Souffle',  hint: 'Palmiers · eau dorée',     src: '/img/world-oasis.png' },
  { key: 'lac',    label: 'Lac des Émotions',  hint: 'Eau calme · nuit douce',   src: '/img/world-lac.png' },
  { key: 'foret',  label: 'Forêt de Clarté',   hint: 'Verdure · lumière dorée',  src: '/img/world-foret.png' },
  { key: 'temple', label: 'Temple intérieur',  hint: 'Bleu mystique · profond',  src: '/img/world-temple.png' },
];

const REFUGE_TRACKS = [
  { key: 'sunrise-breath',           title: 'Sunrise Breath',           hint: 'Lever de soleil · respiration' },
  { key: 'douce-nuit',               title: 'Douce nuit',               hint: 'Sommeil · apaisement' },
  { key: 'guéris',                   title: 'Guéris',                   hint: 'Réparation · douceur' },
  { key: 'tethered-to-the-wreckage', title: 'Tethered to the Wreckage', hint: 'Ancrage · contemplation' },
];

const RHYTHMS = [
  { key: '4-6',   label: 'Apaisant',   desc: 'Inspire 4s · Expire 6s',                hint: 'Le plus simple pour calmer une crise.' },
  { key: '5-5',   label: 'Cohérence',  desc: 'Inspire 5s · Expire 5s',                hint: 'Cohérence cardiaque, équilibre du rythme.' },
  { key: '4-7-8', label: 'Profond',    desc: 'Inspire 4s · Retiens 7s · Expire 8s',   hint: 'Relaxation profonde. Demande un peu d\'entraînement.' },
];

export default function CriseSettings({ onClose }) {
  const [profile, setLocalProfile] = useState(() => getProfile());
  const [tab, setTab] = useState('image'); // image | musique | rythme
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const aliveRef = useRef(true);
  const timersRef = useRef([]);

  const crise = profile.crise || {};
  const currentImage  = crise.image  || 'oasis';
  const currentMusic  = crise.music  || 'sunrise-breath';
  const currentRhythm = crise.rhythm || '4-6';

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => {
      if (aliveRef.current) fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  };

  const handleClose = () => {
    if (closing) return;
    haptic(3);
    setClosing(true);
    safeTimeout(() => onClose?.(), 320);
  };

  const updateCrise = (patch) => {
    haptic(2);
    const nextCrise = { ...(profile.crise || {}), ...patch };
    const next = patchProfile({ crise: nextCrise });
    setLocalProfile(next);
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: 'Personnaliser mon refuge',
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: true } }));
    }
    return () => {
      cancelAnimationFrame(raf);
      aliveRef.current = false;
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: false } }));
      }
    };
  }, []);

  const TABS = [
    { key: 'image',   label: 'Image' },
    { key: 'musique', label: 'Musique' },
    { key: 'rythme',  label: 'Rythme' },
  ];

  return (
    <>
      <div
        aria-hidden
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(8, 10, 24, 0.62)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          opacity: closing ? 0 : mounted ? 1 : 0,
          transition: 'opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      {/* Glass pill back button — fixed top-left, z-index 80 (le bottom sheet est zIndex 201,
          mais le back doit être visible et tap-able pour fermer le sheet) */}
      <button
        type="button"
        data-press
        onClick={handleClose}
        aria-label="Retour"
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
          left: 16,
          zIndex: 202,
          appearance: 'none',
          display: closing ? 'none' : 'inline-flex',
          alignItems: 'center',
          gap: 6,
          minHeight: 44,
          padding: '10px 14px',
          borderRadius: 999,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          color: 'var(--blue-700)',
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.02em',
          lineHeight: 1,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(10, 36, 56, 0.10)',
          WebkitTapHighlightColor: 'transparent',
          opacity: mounted && !closing ? 1 : 0,
          transition: 'opacity 280ms cubic-bezier(0.16, 1, 0.3, 1), transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        Retour
      </button>

      <div
        ref={containerRef}
        {...dialogProps}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 201,
          background: 'var(--bg)',
          color: 'var(--blue-900)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '12px 0 calc(env(safe-area-inset-bottom, 0px) + 24px)',
          transform: closing ? 'translateY(100%)' : mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 -8px 32px rgba(10, 36, 56, 0.18)',
          borderTop: '0.5px solid rgba(255, 255, 255, 0.85)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Drag handle */}
        <div
          aria-hidden
          style={{
            width: 36,
            height: 5,
            borderRadius: 999,
            background: 'rgba(10, 36, 56, 0.18)',
            margin: '0 auto 18px',
            flexShrink: 0,
          }}
        />

        {/* Title */}
        <div style={{ padding: '0 22px', textAlign: 'center', marginBottom: 6, flexShrink: 0 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(22px, 5.5vw, 26px)',
              lineHeight: 1.1,
              color: 'var(--blue-900)',
              letterSpacing: '-0.01em',
            }}
          >
            Mon refuge
          </h1>
          <div
            style={{
              marginTop: 8,
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 400,
              color: 'var(--text-secondary)',
              maxWidth: 340,
              marginInline: 'auto',
              lineHeight: 1.55,
            }}
          >
            Préparé pour le moment où tu en auras besoin.
          </div>
        </div>

        {/* Tabs — glass pills, rose accent for active (mode crise) */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '18px 22px 16px',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => { haptic(2); setTab(t.key); }}
                data-press
                style={{
                  appearance: 'none',
                  padding: '10px 18px',
                  minHeight: 38,
                  background: active ? 'var(--gradient-rose)' : 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  color: active ? '#FFFFFF' : 'var(--blue-700)',
                  border: active ? '1px solid var(--rose-700)' : '1px solid rgba(255, 255, 255, 0.85)',
                  borderRadius: 999,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  flexShrink: 0,
                  boxShadow: active ? '0 4px 14px rgba(200, 112, 144, 0.25)' : 'none',
                  transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), background 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div
          style={{
            padding: '4px 22px 8px',
            overflowY: 'auto',
            flex: 1,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {tab === 'image' && (
            <div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 400,
                  color: 'var(--text-secondary)',
                  marginBottom: 14,
                  lineHeight: 1.55,
                }}
              >
                Le décor de ton refuge.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {REFUGE_IMAGES.map((img) => {
                  const active = img.key === currentImage;
                  return (
                    <button
                      key={img.key}
                      type="button"
                      data-press
                      onClick={() => updateCrise({ image: img.key })}
                      style={{
                        appearance: 'none',
                        padding: 0,
                        border: active ? '2px solid var(--rose-700)' : '1px solid rgba(255, 255, 255, 0.85)',
                        borderRadius: 16,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative',
                        aspectRatio: '4 / 5',
                        background: `#0a0c14 url(${img.src}) center / cover no-repeat`,
                        WebkitTapHighlightColor: 'transparent',
                        boxShadow: active
                          ? '0 4px 18px rgba(200, 112, 144, 0.30)'
                          : '0 4px 24px rgba(10, 36, 56, 0.07)',
                        transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                      aria-pressed={active}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          padding: '28px 14px 14px',
                          background: 'linear-gradient(0deg, rgba(10, 36, 56, 0.78) 0%, transparent 100%)',
                          color: '#FFFFFF',
                          textAlign: 'left',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontStyle: 'italic',
                            fontWeight: 300,
                            fontSize: 16,
                            lineHeight: 1.2,
                            textShadow: '0 1px 4px rgba(10, 36, 56, 0.5)',
                          }}
                        >
                          {img.label}
                        </div>
                        <div
                          style={{
                            marginTop: 4,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 9,
                            fontWeight: 500,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            opacity: 0.85,
                          }}
                        >
                          {img.hint}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'musique' && (
            <div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 400,
                  color: 'var(--text-secondary)',
                  marginBottom: 14,
                  lineHeight: 1.55,
                }}
              >
                La musique qui t’accompagne dans la traversée.
              </div>

              {/* Silence */}
              <RefugeRow
                active={!currentMusic}
                onClick={() => updateCrise({ music: null })}
                title="Silence"
                hint="Juste le souffle."
                titleSerif={false}
                style={{ marginBottom: 10 }}
              />

              {/* Tracks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {REFUGE_TRACKS.map((t) => (
                  <RefugeRow
                    key={t.key}
                    active={t.key === currentMusic}
                    onClick={() => updateCrise({ music: t.key })}
                    title={t.title}
                    hint={t.hint}
                    titleSerif
                  />
                ))}
              </div>
            </div>
          )}

          {tab === 'rythme' && (
            <div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 400,
                  color: 'var(--text-secondary)',
                  marginBottom: 14,
                  lineHeight: 1.55,
                }}
              >
                Ta façon de respirer.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {RHYTHMS.map((r) => {
                  const active = r.key === currentRhythm;
                  return (
                    <button
                      key={r.key}
                      type="button"
                      data-press
                      onClick={() => updateCrise({ rhythm: r.key })}
                      style={{
                        appearance: 'none',
                        padding: '18px 20px',
                        minHeight: 84,
                        background: 'rgba(255, 255, 255, 0.65)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255, 255, 255, 0.85)',
                        borderLeft: active ? '3px solid var(--rose-700)' : '3px solid var(--blue-700)',
                        boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
                        borderRadius: 20,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 14,
                        textAlign: 'left',
                        WebkitTapHighlightColor: 'transparent',
                        transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), border 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                      aria-pressed={active}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontStyle: 'italic',
                            fontWeight: 300,
                            fontSize: 20,
                            color: 'var(--blue-900)',
                            lineHeight: 1.2,
                            letterSpacing: '-0.005em',
                          }}
                        >
                          {r.label}
                        </div>
                        <div
                          style={{
                            marginTop: 6,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 10,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            color: 'var(--blue-700)',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {r.desc}
                        </div>
                        <div
                          style={{
                            marginTop: 6,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 13,
                            fontWeight: 400,
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                          }}
                        >
                          {r.hint}
                        </div>
                      </div>
                      <RadioDot active={active} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer close — gradient rose (mode crise) */}
        <div style={{ padding: '14px 22px 0', flexShrink: 0 }}>
          <button
            type="button"
            data-press
            onClick={handleClose}
            style={{
              appearance: 'none',
              width: '100%',
              padding: '15px 24px',
              minHeight: 50,
              background: 'var(--gradient-rose)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 50,
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              boxShadow: '0 8px 24px rgba(200, 112, 144, 0.30)',
              transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            C’est prêt
          </button>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   RefugeRow — glass card with title + hint + radio dot
   ============================================================ */
function RefugeRow({ active, onClick, title, hint, titleSerif = true, style }) {
  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      aria-pressed={active}
      style={{
        appearance: 'none',
        width: '100%',
        padding: '16px 18px',
        minHeight: 64,
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        borderLeft: active ? '3px solid var(--rose-700)' : '3px solid var(--blue-700)',
        boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
        borderRadius: 20,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
        transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), border 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        ...(style || {}),
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={titleSerif ? {
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 18,
            color: 'var(--blue-900)',
            lineHeight: 1.2,
            letterSpacing: '-0.005em',
          } : {
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--blue-900)',
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 4,
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            fontWeight: 400,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {hint}
        </div>
      </div>
      <RadioDot active={active} />
    </button>
  );
}

function RadioDot({ active }) {
  return (
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        border: active ? '5px solid var(--rose-700)' : '1px solid var(--blue-300)',
        flexShrink: 0,
        marginTop: 2,
        transition: 'border 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    />
  );
}
