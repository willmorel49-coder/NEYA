/* ============================================================
   Voix — Lire les autres, partager la sienne.
   ============================================================ */

import { useState, useMemo } from 'react';
import { Header, GlassCard, Eyebrow, HeroTitle, Body, CTA, Textarea, tokens } from '../../components/ui';
import Blobs from '../../components/Blobs';
import { haptic, ls } from '../state';

const SEEDED_VOICES = [
  { id: 's1', pseudo: 'Sève',  body: 'Je suis fatiguée depuis si longtemps que j\'ai oublié à quoi ressemble la fatigue normale.', daysAgo: 2 },
  { id: 's2', pseudo: 'Élio',  body: 'Le matin c\'est le plus dur. Sortir du lit demande tout ce que je n\'ai pas.', daysAgo: 1 },
  { id: 's3', pseudo: 'Naïs',  body: 'Aujourd\'hui j\'ai dit non. Pour la première fois depuis longtemps. Et ça m\'a fait pleurer.', daysAgo: 3 },
  { id: 's4', pseudo: 'Rune',  body: 'On m\'a demandé comment j\'allais. J\'ai répondu "ça va" mais j\'avais envie d\'autre chose.', daysAgo: 4 },
  { id: 's5', pseudo: 'Anya',  body: 'Mon corps me parle. Il dit qu\'il a besoin que je l\'écoute. Je commence juste.', daysAgo: 5 },
];

export default function Voix({ onClose }) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const ownPosts = useMemo(() => ls.get('cava_v5_voix', []), [composerOpen]);

  const allVoices = useMemo(() => {
    const ownAsVoices = ownPosts.map((p) => ({
      id: p.id,
      pseudo: 'Toi',
      body: p.body,
      daysAgo: Math.floor((Date.now() - p.createdAt) / 86400000),
      own: true,
    }));
    return [...ownAsVoices, ...SEEDED_VOICES].sort((a, b) => a.daysAgo - b.daysAgo);
  }, [ownPosts]);

  const handleShare = () => {
    if (!draft.trim()) return;
    haptic(6);
    const post = { id: `v-${Date.now()}`, body: draft.trim(), createdAt: Date.now() };
    ls.set('cava_v5_voix', [post, ...ownPosts]);
    setDraft('');
    setComposerOpen(false);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--bg)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 100,
      }}
    >
      <Blobs variant="blue-rose" />
      <Header title="Voix" onBack={onClose} />

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 2, padding: '12px 16px 8px', textAlign: 'center' }}>
        <Eyebrow color="rose">Les voix qui passent</Eyebrow>
        <HeroTitle size="md" style={{ marginTop: 8 }}>Tu n'es pas seul·e.</HeroTitle>
        <Body style={{ marginTop: 8, maxWidth: 320, margin: '8px auto 0' }}>
          Anonyme. Sans like. Sans compteur.
        </Body>
      </div>

      {/* CTA Partager */}
      <div style={{ position: 'relative', zIndex: 2, padding: '16px 16px 8px' }}>
        <CTA variant="rose" size="md" full onClick={() => setComposerOpen(true)}>
          Partager une voix
        </CTA>
      </div>

      {/* Composer inline */}
      {composerOpen && (
        <div style={{ position: 'relative', zIndex: 2, padding: '8px 16px' }}>
          <GlassCard padding="18px 20px" radius="lg">
            <Eyebrow color="rose">Ta voix</Eyebrow>
            <div style={{ marginTop: 12 }}>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ce que tu veux dire, comme tu veux le dire."
                rows={4}
                maxLength={280}
                accent="rose"
                showCounter
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <CTA variant="ghost" size="sm" onClick={() => { setComposerOpen(false); setDraft(''); }}>Annuler</CTA>
              <CTA variant="primary" size="sm" onClick={handleShare} disabled={!draft.trim()}>Envoyer</CTA>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Feed */}
      <div style={{ position: 'relative', zIndex: 2, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {allVoices.map((v, i) => (
          <GlassCard key={v.id} accent={i % 2 === 0 ? 'blue' : 'rose'} padding="18px 20px" radius="lg">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 300, fontSize: 17, color: 'var(--blue-900)', margin: 0 }}>
                {v.pseudo}
              </h3>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11, color: tokens.textMuted }}>
                {v.daysAgo === 0 ? "aujourd'hui" : `il y a ${v.daysAgo}j`}
              </span>
            </div>
            <Body>{v.body}</Body>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
