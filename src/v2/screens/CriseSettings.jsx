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
      <div
        ref={containerRef}
        {...dialogProps}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 201,
          background: 'var(--cream)',
          color: 'var(--ink)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '12px 0 calc(env(safe-area-inset-bottom, 0px) + 24px)',
          transform: closing ? 'translateY(100%)' : mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.18)',
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
            background: 'rgba(26, 26, 47, 0.18)',
            margin: '0 auto 18px',
            flexShrink: 0,
          }}
        />

        {/* Title */}
        <div style={{ padding: '0 22px', textAlign: 'center', marginBottom: 6, flexShrink: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 22,
              color: 'var(--ink)',
            }}
          >
            Mon refuge
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: 'var(--font-body)',
              fontSize: 12.5,
              color: 'var(--content-secondary)',
              maxWidth: 340,
              marginInline: 'auto',
              lineHeight: 1.5,
            }}
          >
            Préparé pour le moment où tu en auras besoin.
          </div>
        </div>

        {/* Tabs */}
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
                  padding: '8px 16px',
                  minHeight: 36,
                  background: active ? 'var(--ink)' : 'transparent',
                  color: active ? 'var(--cream)' : 'var(--content-secondary)',
                  border: active ? 'none' : '0.5px solid rgba(26, 26, 47, 0.14)',
                  borderRadius: 999,
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  flexShrink: 0,
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
              <div className="neya-body-sm" style={{ color: 'var(--content-secondary)', marginBottom: 14 }}>
                Le décor de ton refuge.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
                        border: active ? '2px solid var(--ink)' : '0.5px solid rgba(26, 26, 47, 0.10)',
                        borderRadius: 12,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative',
                        aspectRatio: '4 / 5',
                        background: `#0a0c14 url(${img.src}) center / cover no-repeat`,
                        WebkitTapHighlightColor: 'transparent',
                        boxShadow: active ? '0 4px 14px rgba(0,0,0,0.18)' : 'none',
                      }}
                      aria-pressed={active}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          padding: '28px 12px 12px',
                          background: 'linear-gradient(0deg, rgba(0,0,0,0.78) 0%, transparent 100%)',
                          color: 'var(--blue-900)',
                          textAlign: 'left',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontStyle: 'italic',
                            fontVariationSettings: 'var(--fraunces-italic-soft)',
                            fontSize: 13,
                            lineHeight: 1.2,
                            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                          }}
                        >
                          {img.label}
                        </div>
                        <div
                          style={{
                            marginTop: 2,
                            fontFamily: 'var(--font-ui)',
                            fontSize: 9,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            opacity: 0.78,
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
              <div className="neya-body-sm" style={{ color: 'var(--content-secondary)', marginBottom: 14 }}>
                La musique qui t'accompagne dans la traversée.
              </div>

              {/* Silence */}
              <button
                type="button"
                data-press
                onClick={() => updateCrise({ music: null })}
                style={{
                  appearance: 'none',
                  width: '100%',
                  padding: '14px 16px',
                  minHeight: 56,
                  background: !currentMusic ? 'rgba(26, 26, 47, 0.06)' : 'transparent',
                  border: !currentMusic ? '0.5px solid var(--ink)' : '0.5px solid rgba(26, 26, 47, 0.10)',
                  borderRadius: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                  textAlign: 'left',
                  WebkitTapHighlightColor: 'transparent',
                }}
                aria-pressed={!currentMusic}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                    Silence
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--content-secondary)', marginTop: 2 }}>
                    Juste le souffle.
                  </div>
                </div>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: !currentMusic ? '5px solid var(--ink)' : '1px solid rgba(26, 26, 47, 0.20)',
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* Tracks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {REFUGE_TRACKS.map((t) => {
                  const active = t.key === currentMusic;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      data-press
                      onClick={() => updateCrise({ music: t.key })}
                      style={{
                        appearance: 'none',
                        padding: '14px 16px',
                        minHeight: 56,
                        background: active ? 'rgba(26, 26, 47, 0.06)' : 'transparent',
                        border: active ? '0.5px solid var(--ink)' : '0.5px solid rgba(26, 26, 47, 0.10)',
                        borderRadius: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                      aria-pressed={active}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontStyle: 'italic',
                            fontVariationSettings: 'var(--fraunces-italic-soft)',
                            fontSize: 15,
                            color: 'var(--ink)',
                            lineHeight: 1.2,
                          }}
                        >
                          {t.title}
                        </div>
                        <div
                          style={{
                            marginTop: 4,
                            fontFamily: 'var(--font-body)',
                            fontSize: 12,
                            color: 'var(--content-secondary)',
                          }}
                        >
                          {t.hint}
                        </div>
                      </div>
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: active ? '5px solid var(--ink)' : '1px solid rgba(26, 26, 47, 0.20)',
                          flexShrink: 0,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'rythme' && (
            <div>
              <div className="neya-body-sm" style={{ color: 'var(--content-secondary)', marginBottom: 14 }}>
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
                        padding: '16px 18px',
                        minHeight: 78,
                        background: active ? 'rgba(26, 26, 47, 0.06)' : 'transparent',
                        border: active ? '0.5px solid var(--ink)' : '0.5px solid rgba(26, 26, 47, 0.10)',
                        borderRadius: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 14,
                        textAlign: 'left',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                      aria-pressed={active}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontStyle: 'italic',
                            fontVariationSettings: 'var(--fraunces-italic-soft)',
                            fontSize: 16,
                            color: 'var(--ink)',
                            lineHeight: 1.2,
                          }}
                        >
                          {r.label}
                        </div>
                        <div
                          style={{
                            marginTop: 4,
                            fontFamily: 'var(--font-ui)',
                            fontSize: 10,
                            letterSpacing: '0.222em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            color: 'var(--content-secondary)',
                          }}
                        >
                          {r.desc}
                        </div>
                        <div
                          style={{
                            marginTop: 6,
                            fontFamily: 'var(--font-body)',
                            fontSize: 12.5,
                            color: 'var(--content-secondary)',
                            lineHeight: 1.45,
                          }}
                        >
                          {r.hint}
                        </div>
                      </div>
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: active ? '5px solid var(--ink)' : '1px solid rgba(26, 26, 47, 0.20)',
                          flexShrink: 0,
                          marginTop: 4,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer close */}
        <div style={{ padding: '12px 22px 0', flexShrink: 0 }}>
          <button
            type="button"
            data-press
            onClick={handleClose}
            style={{
              appearance: 'none',
              width: '100%',
              padding: '14px 16px',
              minHeight: 48,
              background: 'var(--gradient-blue)',
              color: 'var(--cream)',
              border: 'none',
              borderRadius: 999,
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            C'est prêt
          </button>
        </div>
      </div>
    </>
  );
}
