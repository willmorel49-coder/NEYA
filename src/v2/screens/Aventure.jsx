/* ============================================================
   NÉYA V3 — Aventure (LIGHT MODE, wash pastel + ink text)
   ============================================================
   Vertical ascent : 6 mondes en checkpoints le long d'un chemin.
   Wash dawn par défaut. Cards pearl translucides.
   ============================================================ */

import { useState, useEffect, useMemo } from 'react';
import { WORLDS, WORLD_ORDER } from '../worlds';
import { getProfile, greet, recordVisitToday } from '../state';
import Button from '../../components/Button';

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
      className={currentWorld.wash}
      style={{
        position: 'absolute',
        inset: 0,
        color: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding:
            'calc(env(safe-area-inset-top, 0px) + 22px) 22px var(--sp-4)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
            {`N É Y A`}
          </div>
          <h1
            className="neya-h2"
            style={{
              marginTop: 8,
              fontFamily: 'var(--font-display)',
            }}
          >
            {greet()}.
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
            JOUR {String(profile.progress.joursConnectes || 1).padStart(2, '0')}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 500,
              color: currentWorld.accent,
            }}
          >
            {profile.progress.minutesTotales || 0} min
          </div>
        </div>
      </div>

      {/* Continuer la montée CTA */}
      <div style={{ padding: '0 22px 24px' }}>
        <Button
          variant="primary"
          size="md"
          onClick={onOpenMeditation}
          style={{
            background: 'var(--ink)',
            color: 'var(--cream)',
            width: '100%',
            justifyContent: 'space-between',
            paddingLeft: 22,
            paddingRight: 22,
          }}
        >
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
            <span style={{ fontSize: 9, opacity: 0.65, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Maintenant</span>
            <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: 0, textTransform: 'none' }}>Continuer la montée</span>
          </span>
          <span style={{ fontSize: 14, opacity: 0.65, letterSpacing: 0, textTransform: 'none' }}>→</span>
        </Button>
      </div>

      {/* Scrollable ascent */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '0 22px calc(env(safe-area-inset-bottom, 0px) + 110px)',
        }}
      >
        <div style={{ position: 'relative', minHeight: '100%' }}>
          {/* Ligne d'ascension */}
          <div
            style={{
              position: 'absolute',
              left: 26,
              top: 12,
              bottom: 12,
              width: 1,
              background:
                'linear-gradient(to bottom, transparent, rgba(26, 26, 47, 0.18) 12%, rgba(26, 26, 47, 0.18) 88%, transparent)',
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
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 53,
                  }}
                >
                  <Checkpoint
                    state={isCurrent ? 'current' : isExplored ? 'done' : 'locked'}
                    accent={w.accent}
                  />
                </div>

                <WorldCard
                  world={w}
                  isCurrent={isCurrent}
                  isLocked={isLocked}
                  onClick={isLocked ? undefined : () => onOpenWorld?.(wKey)}
                />
              </div>
            );
          })}

          <div
            style={{
              marginTop: 28,
              padding: '0 24px',
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
    </div>
  );
}

function WorldCard({ world, isCurrent, isLocked, onClick }) {
  const baseBg = isLocked
    ? 'rgba(255, 252, 245, 0.5)'
    : isCurrent
      ? `${world.accentRgb}, 0.12)`
      : 'rgba(255, 252, 245, 0.78)';
  const borderColor = isLocked
    ? 'rgba(26, 26, 47, 0.06)'
    : isCurrent
      ? `${world.accentRgb}, 0.40)`
      : 'rgba(26, 26, 47, 0.10)';

  return (
    <button
      data-press={isLocked ? undefined : true}
      onClick={onClick}
      disabled={isLocked}
      style={{
        appearance: 'none',
        background: baseBg,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: `0.5px solid ${borderColor}`,
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        minHeight: 70,
        textAlign: 'left',
        cursor: isLocked ? 'default' : 'pointer',
        opacity: isLocked ? 0.55 : 1,
        WebkitTapHighlightColor: 'transparent',
        boxShadow: isCurrent ? '0 4px 24px rgba(26, 26, 47, 0.08)' : '0 1px 6px rgba(26, 26, 47, 0.04)',
        transition: 'all 240ms var(--ease-out)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          className="neya-mark"
          style={{ color: world.accent }}
        >
          CHAPITRE {String(world.chapter).padStart(2, '0')}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 18,
            fontWeight: 400,
            lineHeight: 1.15,
            color: 'var(--ink)',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
          }}
        >
          {world.name}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--content-secondary)',
            lineHeight: 1.5,
          }}
        >
          {world.totem} · {world.moment}
        </div>
      </div>
    </button>
  );
}

function Checkpoint({ state, accent }) {
  if (state === 'done') {
    return (
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
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
            background: 'var(--cream)',
            border: `1.5px solid ${accent}`,
            position: 'relative',
          }}
        />
      </div>
    );
  }
  return (
    <div
      style={{
        width: 11,
        height: 11,
        borderRadius: '50%',
        border: '1.5px dashed rgba(26, 26, 47, 0.30)',
        background: 'transparent',
      }}
    />
  );
}
