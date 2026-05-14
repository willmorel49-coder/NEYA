/* ============================================================
   NÉYA V2 — Aventure (main screen, vertical ascent metaphor)
   ============================================================
   Header fixe : "NÉYA" gauche + "Jour 07 · 12 min" droite
   Scroll vertical : 6 mondes (Forêt → Communauté), avec
   completed / current / locked checkpoints.
   Footer fixe : primary CTA "Continuer la montée →" + secondary "Carte"
   ============================================================ */

import { useState, useEffect, useMemo } from 'react';
import { WORLDS, WORLD_ORDER } from '../worlds';
import { getProfile, greet, recordVisitToday } from '../state';
import Button from '../../components/Button';
import GlassCard from '../../components/GlassCard';

export default function Aventure({ onOpenMeditation, onOpenWorld }) {
  const [profile, setProfile] = useState(() => recordVisitToday());

  useEffect(() => {
    setProfile(recordVisitToday());
  }, []);

  const explored = useMemo(
    () => new Set(profile.progress.worldsExplored || []),
    [profile]
  );
  const currentKey = profile.progress.currentWorld || 'foret';
  const currentWorld = WORLDS[currentKey] || WORLDS.foret;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--void)',
        color: 'var(--content-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Background — current world bg, very dim, atmospheric */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${currentWorld.bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.32,
          filter: 'blur(6px) brightness(0.7)',
          transform: 'scale(1.06)',
          transition: 'background-image 800ms var(--ease-out)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(5,8,16,0.85) 0%, rgba(5,8,16,0.65) 40%, rgba(5,8,16,0.92) 100%)',
        }}
      />

      {/* Header fixe */}
      <div
        style={{
          position: 'relative',
          padding:
            'calc(env(safe-area-inset-top, 0px) + 16px) var(--sp-5) var(--sp-4)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          zIndex: 2,
        }}
      >
        <div>
          <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
            {`N É Y A`}
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--type-h2)',
              fontWeight: 'var(--weight-regular)',
              lineHeight: 'var(--lh-h2)',
              letterSpacing: 'var(--ls-h2)',
              fontVariationSettings: 'var(--fraunces-opsz-large)',
              color: 'var(--content-primary)',
            }}
          >
            {greet()}.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
            JOUR {String(profile.progress.joursConnectes || 1).padStart(2, '0')}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--type-label)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--content-secondary)',
            }}
          >
            {profile.progress.minutesTotales || 0} min
          </div>
        </div>
      </div>

      {/* Scrollable ascent */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          zIndex: 2,
          padding: 'var(--sp-4) var(--sp-5) calc(var(--sp-9) + 60px)',
        }}
      >
        {/* Vertical ascent line behind the worlds */}
        <div style={{ position: 'relative', minHeight: '100%' }}>
          <div
            style={{
              position: 'absolute',
              left: 26,
              top: 12,
              bottom: 12,
              width: 1,
              background:
                'linear-gradient(to bottom, transparent, rgba(251,246,232,0.22) 12%, rgba(251,246,232,0.22) 88%, transparent)',
            }}
          />

          {WORLD_ORDER.map((wKey, i) => {
            const w = WORLDS[wKey];
            const isExplored = explored.has(wKey);
            const isCurrent = wKey === currentKey;
            const isLocked = !isExplored && !isCurrent;

            return (
              <div
                key={wKey}
                style={{
                  position: 'relative',
                  display: 'grid',
                  gridTemplateColumns: '53px 1fr',
                  alignItems: 'center',
                  gap: 14,
                  paddingTop: i === 0 ? 0 : 'var(--sp-4)',
                  paddingBottom: 'var(--sp-4)',
                }}
              >
                {/* Checkpoint */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 53,
                  }}
                >
                  <Checkpoint state={isCurrent ? 'current' : isExplored ? 'done' : 'locked'} accent={w.accent} />
                </div>

                {/* World card */}
                <GlassCard
                  variant={isLocked ? 'default' : 'glass'}
                  worldAccent={w.accentRgb}
                  onClick={isLocked ? undefined : () => onOpenWorld?.(wKey)}
                  style={{
                    opacity: isLocked ? 0.42 : 1,
                    cursor: isLocked ? 'default' : 'pointer',
                    padding: '14px 16px',
                    minHeight: 70,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div className="neya-mark" style={{ color: w.accent }}>
                      CHAPITRE {String(w.chapter).padStart(2, '0')}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 'var(--type-h3)',
                        fontWeight: 'var(--weight-medium)',
                        lineHeight: 'var(--lh-h3)',
                        color: 'var(--content-primary)',
                      }}
                    >
                      {w.name}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--type-body-sm)',
                        fontWeight: 'var(--weight-regular)',
                        color: 'var(--content-secondary)',
                        lineHeight: 'var(--lh-body-sm)',
                      }}
                    >
                      {w.totem} · {w.moment}
                    </div>
                  </div>
                </GlassCard>
              </div>
            );
          })}

          {/* Bottom whisper */}
          <div
            style={{
              marginTop: 'var(--sp-6)',
              padding: '0 var(--sp-5)',
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontStyle: 'italic',
              color: 'var(--content-tertiary)',
              lineHeight: 1.55,
            }}
          >
            {profile.progress.joursConnectes >= 7
              ? `Tu es revenu·e ${profile.progress.joursConnectes} jours d’affilée — c’est ce qui compte.`
              : 'La montée se fait pas à pas. Le daim t’attend.'}
          </div>
        </div>
      </div>

      {/* Footer fixe */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding:
            '12px var(--sp-5) calc(env(safe-area-inset-bottom, 0px) + 12px)',
          background:
            'linear-gradient(to top, rgba(5,8,16,0.95) 0%, rgba(5,8,16,0.85) 60%, rgba(5,8,16,0) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--sp-3)',
          zIndex: 3,
        }}
      >
        <Button
          variant="primary"
          size="md"
          worldAccent={currentWorld.accent}
          onClick={onOpenMeditation}
        >
          Continuer la montée →
        </Button>
        <Button variant="ghost" size="md" onClick={() => onOpenWorld?.(currentKey)}>
          Carte
        </Button>
      </div>
    </div>
  );
}

function Checkpoint({ state, accent }) {
  if (state === 'done') {
    return (
      <div
        style={{
          width: 11,
          height: 11,
          borderRadius: '50%',
          background: 'var(--cream)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            color: 'var(--tilleul)',
            fontSize: 8,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          ✓
        </span>
      </div>
    );
  }
  if (state === 'current') {
    return (
      <div style={{ position: 'relative', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            position: 'absolute',
            inset: -6,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accent}44 0%, transparent 70%)`,
          }}
        />
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: `1.5px solid var(--cream)`,
            background: 'transparent',
            position: 'relative',
          }}
        />
      </div>
    );
  }
  // locked
  return (
    <div
      style={{
        width: 11,
        height: 11,
        borderRadius: '50%',
        border: '1.5px dashed rgba(251, 246, 232, 0.30)',
        background: 'transparent',
      }}
    />
  );
}
