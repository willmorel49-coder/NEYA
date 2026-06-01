/* ============================================================
   CitationKeepModal — Mini-flow "Garder une citation" (mood='ca-va')
   ============================================================ */

import { useMemo } from 'react';
import Overlay from './Overlay';
import { pickCitation } from '../../v2/data/citations';
import { hashSeed, dayIndex } from '../../v2/helpers/checkins';
import { haptic } from '../../v2/state';

export default function CitationKeepModal({ open, onDone, onClose }) {
  const citation = useMemo(() => {
    if (!open) return null;
    const tags = ['gratitude', 'joie'];
    const seed = dayIndex() + hashSeed('keep');
    const tag = tags[seed % tags.length];
    return pickCitation(tag, seed);
  }, [open]);

  if (!open || !citation) return null;

  const handleKeep = () => {
    haptic(6);
    onDone?.({ type: 'citation', citationId: citation.id, text: citation.text });
  };

  return (
    <Overlay backdrop="dark" onClose={onClose} ariaLabel="Une citation à garder">
      <div style={{
        minHeight: '100dvh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '40px 24px', textAlign: 'center', gap: 32,
      }}>
        <div style={{ fontSize: 40, opacity: 0.5 }}>✦</div>
        <div>
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 24,
            lineHeight: 1.5,
            color: 'var(--ink)',
            maxWidth: 360,
          }}>
            « {citation.text} »
          </p>
          {citation.author && <p style={{ fontSize: 13, opacity: 0.6, marginTop: 12 }}>— {citation.author}</p>}
        </div>
        <button
          onClick={handleKeep}
          style={{
            marginTop: 24,
            minHeight: 56, minWidth: 200,
            padding: '14px 32px',
            background: 'var(--rose-700, #BE185D)',
            color: 'white',
            border: 'none',
            borderRadius: 14,
            fontFamily: 'inherit',
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Garder
        </button>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', opacity: 0.5, fontSize: 13, padding: 12, cursor: 'pointer' }}
        >
          Fermer
        </button>
      </div>
    </Overlay>
  );
}
