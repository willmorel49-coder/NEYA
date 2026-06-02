/* ============================================================
   CitationKeepModal — Mini-flow "Garder une citation" (mood='ca-va')
   ============================================================ */

import { useEffect, useMemo, useState } from 'react';
import Overlay from './Overlay';
import { pickCitation } from '../../v2/data/citations';
import { hashSeed, dayIndex } from '../../v2/helpers/checkins';
import { haptic } from '../../v2/state';

export default function CitationKeepModal({ open, onDone, onClose }) {
  const [mounted, setMounted] = useState(false);

  const citation = useMemo(() => {
    if (!open) return null;
    const tags = ['gratitude', 'joie'];
    const seed = dayIndex() + hashSeed('keep');
    const tag = tags[seed % tags.length];
    return pickCitation(tag, seed);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setMounted(false);
      return;
    }
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  if (!open || !citation) return null;

  const handleKeep = () => {
    haptic(6);
    onDone?.({ type: 'citation', citationId: citation.id, text: citation.text });
  };

  return (
    <Overlay backdrop="light" onClose={onClose} ariaLabel="Une citation à garder">
      <div style={{
        minHeight: '100dvh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '40px 24px', textAlign: 'center', gap: 28,
      }}>
        {/* Icon ✦ — fade-in 1 */}
        <div
          style={{
            fontSize: 36,
            lineHeight: 1,
            color: 'var(--rose-700, #C87090)',
            opacity: mounted ? 0.7 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-4px)',
            transition: 'opacity 520ms cubic-bezier(0.22, 0.61, 0.36, 1) 80ms, transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1) 80ms',
          }}
        >
          ✦
        </div>

        {/* Écrin glass cream — fade-in 2 */}
        <div
          style={{
            position: 'relative',
            maxWidth: 380,
            width: '100%',
            padding: '28px 24px 24px',
            borderRadius: 18,
            background: 'rgba(255, 255, 255, 0.55)',
            border: '1px solid rgba(200, 112, 144, 0.18)',
            boxShadow: '0 10px 36px rgba(10, 36, 56, 0.06), inset 0 1px 0 rgba(255,255,255,0.72)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
            transition: 'opacity 620ms cubic-bezier(0.22, 0.61, 0.36, 1) 220ms, transform 620ms cubic-bezier(0.22, 0.61, 0.36, 1) 220ms',
          }}
        >
          {/* Guillemets décoratifs */}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 6,
              left: 14,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 44,
              lineHeight: 1,
              color: 'var(--rose-300, #F5C8D8)',
              opacity: 0.7,
            }}
          >
            “
          </span>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 24,
              lineHeight: 1.5,
              color: 'var(--ink, #0A2438)',
              margin: 0,
            }}
          >
            {citation.text}
          </p>
          {citation.author && (
            <p
              style={{
                fontFamily: "'Inter', -apple-system, sans-serif",
                fontSize: 12,
                letterSpacing: '0.06em',
                color: 'var(--ink-soft, #4A6070)',
                opacity: 0.75,
                marginTop: 16,
                marginBottom: 0,
              }}
            >
              — {citation.author}
            </p>
          )}
        </div>

        {/* CTA — fade-in 3 */}
        <button
          onClick={handleKeep}
          style={{
            marginTop: 8,
            minHeight: 56, minWidth: 220,
            padding: '14px 32px',
            background: 'var(--rose-700, #C87090)',
            color: 'white',
            border: 'none',
            borderRadius: 14,
            fontFamily: 'inherit',
            fontSize: 15,
            letterSpacing: '0.01em',
            cursor: 'pointer',
            boxShadow: '0 8px 22px rgba(200, 112, 144, 0.28)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 520ms cubic-bezier(0.22, 0.61, 0.36, 1) 460ms, transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1) 460ms',
          }}
        >
          Je la garde.
        </button>
      </div>
    </Overlay>
  );
}
