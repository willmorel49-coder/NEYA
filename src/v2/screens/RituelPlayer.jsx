/* ============================================================
   RituelPlayer — lecture guidée d'un rituel
   ============================================================
   Format simple : intro · guide narratif · prompts d'écriture ·
   notes optionnelles · closing.
   Sauvegarde dans profile.aventure.rituelsFaits.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { haptic, ls, getProfile, patchProfile } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';

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
      // Sauvegarde silencieuse de la note même si on quitte sans terminer
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
    return () => {
      cancelAnimationFrame(raf);
      aliveRef.current = false;
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

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
          ‹ Retour
        </button>
        <div
          aria-hidden
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            color: 'var(--content-tertiary)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            paddingRight: 14,
          }}
        >
          {rituel.duration} min
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '20px 24px calc(env(safe-area-inset-bottom, 0px) + 100px)',
        }}
      >
        <article style={{ maxWidth: 620, marginInline: 'auto' }}>
          {/* Title */}
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontWeight: 400,
              fontSize: 'clamp(28px, 7vw, 36px)',
              lineHeight: 1.12,
              letterSpacing: '-0.018em',
              color: 'var(--ink)',
            }}
          >
            {rituel.title}
          </h1>
          <div
            className="neya-mark"
            style={{
              marginTop: 10,
              color: 'var(--content-tertiary)',
              fontSize: 9,
            }}
          >
            {rituel.subtitle}
          </div>

          {/* Guide narratif */}
          <div style={{ marginTop: 32 }}>
            {rituel.guide.map((para, i) => (
              <p
                key={i}
                style={{
                  margin: '0 0 16px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: 'var(--ink)',
                }}
              >
                {para}
              </p>
            ))}
          </div>

          {/* Prompts */}
          {rituel.prompts && rituel.prompts.length > 0 && (
            <div style={{ marginTop: 36 }}>
              <div
                className="neya-mark"
                style={{ color: 'var(--content-tertiary)', marginBottom: 14, fontSize: 9 }}
              >
                Questions à te poser
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {rituel.prompts.map((p, i) => (
                  <li
                    key={i}
                    style={{
                      padding: '14px 18px',
                      background: 'rgba(26, 26, 47, 0.04)',
                      borderLeft: '2px solid var(--ink)',
                      borderRadius: 6,
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontVariationSettings: 'var(--fraunces-italic-soft)',
                      fontSize: 16,
                      lineHeight: 1.5,
                      color: 'var(--ink)',
                    }}
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Note textarea */}
          <div style={{ marginTop: 32 }}>
            <div
              className="neya-mark"
              style={{ color: 'var(--content-tertiary)', marginBottom: 10, fontSize: 9 }}
            >
              Tes notes (optionnel · privées · pour toi seul·e)
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Écris ce qui vient. Ce qui te traverse. Rien n\'est obligatoire."
              rows={8}
              maxLength={2000}
              aria-label="Tes notes"
              style={{
                width: '100%',
                padding: '16px 18px',
                minHeight: 180,
                background: 'rgba(26, 26, 47, 0.04)',
                border: '0.5px solid rgba(26, 26, 47, 0.10)',
                borderRadius: 14,
                fontFamily: 'var(--font-body)',
                fontSize: 15,
                lineHeight: 1.6,
                color: 'var(--ink)',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div
              style={{
                marginTop: 6,
                textAlign: 'right',
                fontFamily: 'var(--font-ui)',
                fontSize: 10,
                fontVariantNumeric: 'tabular-nums',
                color: 'var(--content-tertiary)',
              }}
            >
              {2000 - (note || '').length}
            </div>
          </div>

          {/* Closing */}
          <div
            style={{
              marginTop: 48,
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
                fontSize: 'clamp(17px, 4.5vw, 20px)',
                lineHeight: 1.42,
                color: 'var(--ink)',
                maxWidth: 480,
                marginInline: 'auto',
              }}
            >
              « {rituel.closing} »
            </p>
          </div>

          {/* CTA terminer */}
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              data-press
              onClick={() => handleClose(true)}
              style={{
                appearance: 'none',
                width: '100%',
                padding: '16px 24px',
                minHeight: 52,
                background: 'var(--ink)',
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
              Terminer ce rituel
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
                color: 'var(--content-secondary)',
                border: 'none',
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Reprendre plus tard
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
