/* ============================================================
   Refuge — Fusion des actions de pause (méditer / respirer /
   écrire / personnaliser cocon).
   ============================================================ */

import { useState } from 'react';
import { Header, GlassCard, Eyebrow, HeroTitle, Body, Icon, tokens } from '../../components/ui';
import Blobs from '../../components/Blobs';
import Meditation from './Meditation';
import BreathingPause from './BreathingPause';
import Carnet from './Carnet';
import Cocon from './Cocon';

const ACTIONS = [
  { key: 'meditation', label: 'Méditer',      desc: 'Une séance guidée 90s à 9 min', icon: 'circle',  gradient: 'gradientViolet' },
  { key: 'breath',     label: 'Respirer',     desc: 'Un cycle 4·7·8 doux',           icon: 'sparkle', gradient: 'gradientBlue' },
  { key: 'carnet',     label: 'Écrire libre', desc: 'Laisse poser ce qui passe',      icon: 'book',    gradient: 'gradientRose' },
  { key: 'cocon',      label: 'Mon cocon',    desc: 'Personnaliser mon refuge',       icon: 'home',    gradient: 'gradientViolet' },
];

export default function Refuge({ onClose }) {
  const [active, setActive] = useState(null);

  if (active === 'meditation') return <Meditation mode="free" onClose={() => setActive(null)} />;
  if (active === 'breath')     return <BreathingPause accent="rose" onClose={() => setActive(null)} />;
  if (active === 'carnet')     return <Carnet onClose={() => setActive(null)} />;

  /* Cocon n'accepte pas de prop onClose — on le monte dans un overlay
     superposé et on fournit un bouton retour par-dessus. */
  if (active === 'cocon') {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <Cocon />
        {/* Bouton retour superposé en haut à gauche, hors de la topbar Cocon */}
        <button
          type="button"
          onClick={() => setActive(null)}
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
            left: 12,
            zIndex: 9999,
            width: 48,
            height: 48,
            borderRadius: 24,
            // Background opaque pour bien se distinguer de la TopBar Cocon (« ⋯ » a droite).
            background: 'rgba(238, 243, 248, 0.92)',
            backdropFilter: 'blur(14px) saturate(140%)',
            WebkitBackdropFilter: 'blur(14px) saturate(140%)',
            border: '0.5px solid rgba(26, 90, 127, 0.18)',
            boxShadow: '0 2px 12px rgba(10, 36, 56, 0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-label="Retour au Refuge"
        >
          <Icon name="chevron-left" size={20} color={tokens.blue900} />
        </button>
      </div>
    );
  }

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
      <Blobs variant="rose-violet" />
      <Header title="Refuge" onBack={onClose} />

      <div style={{ position: 'relative', zIndex: 2, padding: '12px 16px 8px', textAlign: 'center' }}>
        <Eyebrow color="rose">Pose-toi</Eyebrow>
        <HeroTitle size="md" style={{ marginTop: 8 }}>Choisis ton refuge.</HeroTitle>
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ACTIONS.map((a) => (
          <GlassCard key={a.key} hoverable onClick={() => setActive(a.key)} padding="18px 20px" radius="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: tokens[a.gradient],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                <Icon name={a.icon} size={22} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 300, fontSize: 19, color: 'var(--blue-900)', margin: 0, lineHeight: 1.2 }}>
                  {a.label}
                </h3>
                <Body variant="body-sm" style={{ marginTop: 3 }}>{a.desc}</Body>
              </div>
              <Icon name="chevron-right" size={18} color={tokens.blue300} />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
