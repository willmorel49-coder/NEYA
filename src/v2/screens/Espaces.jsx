/* ============================================================
   Espaces — 3 verbes : Refuge · Voix · Marque
   ============================================================
   Shell avec sous-navigation par état React. Sync avec hash
   routing global (App.jsx) pour deeplink + back Android :
     #espaces           → liste
     #espaces/refuge    → Refuge
     #espaces/voix      → Voix
     #espaces/cava      → CaVa (clé hash 'cava' pour url courte)
   Le state interne reste 'refuge' | 'voix' | 'marque' (compat).
   ============================================================ */

import { useState, useEffect } from 'react';
import { GlassCard, Eyebrow, HeroTitle, Body, Icon, tokens } from '../../components/ui';
import Refuge from './Refuge';
import Voix from './Voix';
import CaVa from './CaVa';
import Blobs from '../../components/Blobs';

const SPACES = [
  { key: 'refuge', label: 'Refuge', icon: 'sparkle', subtitle: 'Se poser, respirer, écrire.' },
  { key: 'voix',   label: 'Voix',   icon: 'message', subtitle: 'Lire ce que les autres ressentent.' },
  { key: 'marque', label: 'Marque ÇA VA?', icon: 'heart', subtitle: 'L\'univers, les pièces, le manifeste.' },
];

// Mapping state ↔ hash sub-route (hash 'cava' plus naturel que 'marque' en URL)
const STATE_TO_HASH = { refuge: 'refuge', voix: 'voix', marque: 'cava' };
const HASH_TO_STATE = { refuge: 'refuge', voix: 'voix', cava: 'marque' };

function parseSubroute(rawHash) {
  if (!rawHash || typeof rawHash !== 'string') return null;
  const h = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
  const [tab, sub] = h.split('/');
  if (tab !== 'espaces' || !sub) return null;
  return HASH_TO_STATE[sub] || null;
}

export default function Espaces() {
  const [active, setActive] = useState(() => {
    try { return parseSubroute(window.location.hash); } catch { return null; }
  });

  // Push hash quand sub-route change (anti-loop : compare au hash courant)
  useEffect(() => {
    try {
      const current = window.location.hash || '';
      if (active) {
        const target = '#espaces/' + STATE_TO_HASH[active];
        if (current !== target) {
          window.history.pushState({ tab: 'espaces', subroute: STATE_TO_HASH[active] }, '', target);
        }
      } else {
        // Retour à la liste — assurer que le hash est bien #espaces
        // (ne pas push si on est déjà sur #espaces ou un autre tab,
        // c'est App.jsx qui pilote la tab en racine).
        if (current.startsWith('#espaces/')) {
          window.history.pushState({ tab: 'espaces' }, '', '#espaces');
        }
      }
    } catch {}
  }, [active]);

  // Écoute popstate pour re-sync sub-route depuis le hash
  useEffect(() => {
    const onPop = () => {
      try {
        const sub = parseSubroute(window.location.hash);
        setActive(sub);
      } catch {}
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (active === 'refuge') return <Refuge onClose={() => setActive(null)} />;
  if (active === 'voix')   return <Voix   onClose={() => setActive(null)} />;
  if (active === 'marque') return <CaVa onClose={() => setActive(null)} />;

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
      <Blobs variant="rose-blue" />

      <div style={{ position: 'relative', zIndex: 2, padding: 'calc(env(safe-area-inset-top, 0px) + 32px) 16px 24px', textAlign: 'center' }}>
        <Eyebrow color="rose">Espaces</Eyebrow>
        <HeroTitle size="md" style={{ marginTop: 8 }}>Trois refuges.</HeroTitle>
        <Body style={{ marginTop: 10, maxWidth: 320, margin: '10px auto 0' }}>
          Choisis où tu veux aller maintenant.
        </Body>
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {SPACES.map((s) => (
          <GlassCard key={s.key} hoverable onClick={() => setActive(s.key)} padding="20px 22px" radius="xl">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: s.key === 'refuge' ? tokens.gradientBlue : s.key === 'voix' ? tokens.gradientRose : tokens.gradientViolet,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                <Icon name={s.icon} size={24} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <HeroTitle size="sm" style={{ fontSize: 22, lineHeight: 1.2 }}>{s.label}</HeroTitle>
                <Body variant="body-sm" style={{ marginTop: 4 }}>{s.subtitle}</Body>
              </div>
              <Icon name="chevron-right" size={20} color={tokens.blue300} />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
