/* ============================================================
   RituelPlayer — lecture guidée d'un rituel (ÇA VA? V3 DA)
   ============================================================
   Refonte selon /NOUVELLE DA/CLAUDE.md section 10
   Glassmorphism · Blobs rose-blue · Cormorant + Inter
   Bug-01 fixé : aucun backslash-apostrophe (template strings)
   Bug-02 fixé : CTA bleu gradient (jamais dark #0A2438)
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { haptic, ls, getProfile, patchProfile } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';
import Blobs from '../../components/Blobs';

/* ─── Couleurs par pilier (temps) ─── */
const PILIER_COLOR = {
  passe: { accent: '#1A5A7F', soft: '#6F9DB5' },     // bleu
  present: { accent: '#C87090', soft: '#E8A0B8' },   // rose
  futur: { accent: '#7F5A8A', soft: '#AF80BA' },     // violet
};

function getPilierColor(rituel) {
  return PILIER_COLOR[rituel?.temps] || PILIER_COLOR.passe;
}

function loadNote(key) {
  const notes = ls.get('rituels_notes', {}) || {};
  return notes[key] || '';
}

function saveNote(key, text) {
  const notes = ls.get('rituels_notes', {}) || {};
  notes[key] = text;
  ls.set('rituels_notes', notes);
}

export default function RituelPlayer({ rituel, onClose }) {
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [note, setNote] = useState(() => loadNote(rituel.key));
  const aliveRef = useRef(true);
  const timersRef = useRef([]);
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const pilier = getPilierColor(rituel);

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => { if (aliveRef.current) fn(); }, ms);
    timersRef.current.push(id);
    return id;
  };

  const handleClose = (markDone = false) => {
    if (closing) return;
    if (markDone) {
      const profile = getProfile();
      const av = profile.aventure || {};
      const rituelsFaits = av.rituelsFaits || {};
      rituelsFaits[rituel.key] = {
        lastDoneAt: Date.now(),
        notesLength: (note || '').length,
      };
      patchProfile({
        aventure: { ...av, rituelsFaits },
      });
      saveNote(rituel.key, note);
      haptic([6, 30, 6]);
    } else {
      if ((note || '').length > 0) saveNote(rituel.key, note);
      haptic(3);
    }
    setClosing(true);
    safeTimeout(() => onClose?.(markDone), 380);
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: () => handleClose(false),
    labelText: rituel.title,
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    haptic(4);
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

  const handleScroll = (e) => {
    const el = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) {
      setScrollProgress(0);
      return;
    }
    const ratio = Math.max(0, Math.min(1, el.scrollTop / max));
    setScrollProgress(ratio);
  };

  /* Sous-titre label — couleur pilier */
  const subtitleColor = pilier.accent;
  const pilierGradient = `linear-gradient(135deg, ${pilier.accent}, ${pilier.soft})`;

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        transform: closing ? 'translateY(100%)' : mounted ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Blobs décoratifs */}
      <Blobs variant="rose-blue" />

      {/* Barre de progression — top 2px couleur pilier */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 'env(safe-area-inset-top, 0px)',
          left: 0,
          right: 0,
          height: 2,
          background: 'rgba(10, 36, 56, 0.06)',
          zIndex: 3,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.round(scrollProgress * 100)}%`,
            background: pilierGradient,
            transition: 'width 120ms linear',
          }}
        />
      </div>

      {/* Top bar */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 16px 10px',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          data-press
          onClick={() => handleClose(false)}
          aria-label="Retour"
          style={{
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '10px 14px 10px 4px',
            minHeight: 44,
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.04em',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {'‹ Retour'}
        </button>
        <div
          aria-hidden
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--text-muted)',
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            paddingRight: 8,
          }}
        >
          {`${rituel.duration} MIN`}
        </div>
      </div>

      {/* Content scrollable */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '12px 20px calc(env(safe-area-inset-bottom, 0px) + 100px)',
        }}
      >
        <article style={{ maxWidth: 620, marginInline: 'auto' }}>
          {/* Titre Cormorant italique */}
          <h1
            style={{
              margin: 0,
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(32px, 8vw, 42px)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              color: 'var(--blue-900)',
            }}
          >
            {rituel.title}
          </h1>

          {/* Sous-titre label uppercase couleur pilier */}
          <div
            style={{
              marginTop: 14,
              fontFamily: "'Inter', sans-serif",
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: subtitleColor,
            }}
          >
            {rituel.subtitle}
          </div>

          {/* Corps texte — Inter 300 / 14 / 1.75 */}
          <div style={{ marginTop: 28 }}>
            {rituel.guide.map((para, i) => (
              <p
                key={i}
                style={{
                  margin: '0 0 18px',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 300,
                  fontSize: 14,
                  lineHeight: 1.75,
                  color: 'var(--text-secondary)',
                }}
              >
                {para}
              </p>
            ))}
          </div>

          {/* Questions — glass cards border-left 3px pilier */}
          {rituel.prompts && rituel.prompts.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div
                style={{
                  marginBottom: 14,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 9,
                  fontWeight: 500,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                {'Questions à te poser'}
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  maxWidth: 343,
                  marginInline: 'auto',
                }}
              >
                {rituel.prompts.map((p, i) => (
                  <li
                    key={i}
                    style={{
                      position: 'relative',
                      padding: '16px 18px 16px 22px',
                      background: 'rgba(255, 255, 255, 0.65)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      border: '1px solid rgba(255, 255, 255, 0.85)',
                      borderLeft: `3px solid ${pilier.accent}`,
                      borderRadius: 18,
                      boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic',
                      fontWeight: 400,
                      fontSize: 18,
                      lineHeight: 1.45,
                      color: 'var(--blue-900)',
                    }}
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Note textarea — glass + border-left 3px pilier */}
          <div style={{ marginTop: 32, maxWidth: 343, marginInline: 'auto' }}>
            <div
              style={{
                marginBottom: 10,
                fontFamily: "'Inter', sans-serif",
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
            >
              {'Tes notes · privées · pour toi seul·e'}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={"Écris ce qui vient. Ce qui te traverse. Rien n'est obligatoire."}
              rows={8}
              maxLength={2000}
              aria-label="Tes notes"
              style={{
                width: '100%',
                padding: '16px 18px 16px 22px',
                minHeight: 180,
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.85)',
                borderLeft: `3px solid ${pilier.accent}`,
                borderRadius: 18,
                boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: 'var(--text-primary)',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div
              style={{
                marginTop: 6,
                textAlign: 'right',
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                fontVariantNumeric: 'tabular-nums',
                color: 'var(--text-muted)',
              }}
            >
              {2000 - (note || '').length}
            </div>
          </div>

          {/* Citation finale — Cormorant italic centrée « » */}
          <div
            style={{
              marginTop: 48,
              paddingTop: 32,
              borderTop: '1px solid rgba(10, 36, 56, 0.08)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 'clamp(19px, 5vw, 22px)',
                lineHeight: 1.45,
                color: 'var(--blue-900)',
                maxWidth: 480,
                marginInline: 'auto',
              }}
            >
              {`« ${rituel.closing} »`}
            </p>
          </div>

          {/* CTA — Terminer (bleu gradient) + Reprendre (ghost) */}
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 343, marginInline: 'auto' }}>
            <button
              type="button"
              data-press
              onClick={() => handleClose(true)}
              style={{
                appearance: 'none',
                width: '100%',
                padding: '15px 24px',
                minHeight: 50,
                background: 'linear-gradient(135deg, #1A5A7F, #2A8ABF)',
                color: 'white',
                border: 'none',
                borderRadius: 50,
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                boxShadow: '0 8px 24px rgba(26, 90, 127, 0.30), 0 2px 12px rgba(200, 112, 144, 0.18)',
              }}
            >
              {'Terminer ce rituel'}
            </button>
            <button
              type="button"
              data-press
              onClick={() => handleClose(false)}
              style={{
                appearance: 'none',
                width: '100%',
                padding: '12px 24px',
                minHeight: 44,
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: 'none',
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 400,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {'Reprendre plus tard'}
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
