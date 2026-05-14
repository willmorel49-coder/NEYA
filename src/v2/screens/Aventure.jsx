/* ============================================================
   NÉYA V3 — Aventure (LIGHT MODE, wash pastel + ink text)
   ============================================================
   Vertical ascent : 6 mondes en checkpoints le long d'un chemin.
   Wash dawn par défaut. Cards pearl translucides.
   ============================================================ */

import { useState, useEffect, useMemo, useRef } from 'react';
import { WORLDS, WORLD_ORDER } from '../worlds';
import { getProfile, greet, recordVisitToday, getMotifCTA, getEtatLine, getPaletteMode } from '../state';
import Button from '../../components/Button';

// Animate a number from `from` to `to` over `duration` ms with ease-out cubic
function animateValue(from, to, duration, onUpdate) {
  const start = performance.now();
  let raf;
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    onUpdate(Math.round(from + (to - from) * eased));
    if (t < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

// Totem → home world mapping (per spec)
const TOTEM_HOME = {
  lion: 'foret', ours: 'temple', aigle: 'oasis',
  daim: 'lac', baleine: 'montagne', renard: 'communaute',
};
const TOTEM_GLYPH = {
  lion: '◆', ours: '◇', aigle: '△', daim: '✦', baleine: '○', renard: '▽',
};

// Soft whisper rotation — daily quote from ÇA VA? D.A. + NÉYA voice
const WHISPERS = [
  'La montée se fait pas à pas. Le daim t’attend.',
  '« When the power of love overcomes the love of power, the world will know peace. »',
  'T’as pas besoin d’aller bien pour commencer.',
  'Le lion blanc s’éveille avec toi.',
  'Pose-toi. Le daim veille.',
  'Tu n’es pas seul·e.',
];
function whisperOfDay(joursConnectes) {
  return WHISPERS[(joursConnectes || 0) % WHISPERS.length];
}

// Ambient witnesses — items placés du Cocon (Agent C #5)
const COCON_AMBIENT_POSITIONS = {
  bougie:  { glyph: '✺', top: '14%',  right: '12%', size: 22 },
  cristal: { glyph: '◇', top: '40%',  left:  '8%',  size: 18 },
  plante:  { glyph: '❦', top: '64%',  right: '18%', size: 20 },
  totem:   { glyph: '◈', top: '82%',  left: '14%',  size: 18 },
  portail: { glyph: '○', top: '26%',  left: '74%',  size: 16 },
};

export default function Aventure({ onOpenMeditation, onOpenWorld, onOpenHabitudes }) {
  const [profile, setProfile] = useState(() => recordVisitToday());
  const [scrollY, setScrollY] = useState(0);
  const [celebrating, setCelebrating] = useState(null); // { worldKey } | null
  const [celebrationLeaving, setCelebrationLeaving] = useState(false);
  const [displayedMinutes, setDisplayedMinutes] = useState(
    () => profile.progress.minutesTotales || 0
  );
  const prevExploredRef = useRef(profile.progress.worldsExplored || []);
  const prevMinutesRef = useRef(profile.progress.minutesTotales || 0);
  const motifCTA = getMotifCTA();
  const etatLine = getEtatLine();
  const paletteMode = getPaletteMode();

  useEffect(() => {
    setProfile(recordVisitToday());
  }, []);

  // Detect newly unlocked world by diffing worldsExplored against previous ref
  useEffect(() => {
    const current = profile.progress.worldsExplored || [];
    const prev = prevExploredRef.current || [];
    if (current.length > prev.length) {
      const justUnlocked = current.find((k) => !prev.includes(k));
      if (justUnlocked) {
        setCelebrating({ worldKey: justUnlocked });
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate([8, 60, 8]); } catch (_) {}
        }
      }
    }
    prevExploredRef.current = current;
  }, [profile]);

  // Animate minutesTotales when it changes (return from Meditation)
  useEffect(() => {
    const target = profile.progress.minutesTotales || 0;
    const from = prevMinutesRef.current || 0;
    if (target === from) {
      setDisplayedMinutes(target);
      return;
    }
    const cancel = animateValue(from, target, 800, setDisplayedMinutes);
    prevMinutesRef.current = target;
    return cancel;
  }, [profile.progress.minutesTotales]);

  // Auto-dismiss celebration after 4.5s
  useEffect(() => {
    if (!celebrating) return;
    const t = setTimeout(() => dismissCelebration(), 4500);
    return () => clearTimeout(t);
  }, [celebrating]);

  function dismissCelebration() {
    setCelebrationLeaving(true);
    setTimeout(() => {
      setCelebrating(null);
      setCelebrationLeaving(false);
    }, 280);
  }

  const onScroll = (e) => {
    setScrollY(e.currentTarget.scrollTop);
  };

  const explored = useMemo(
    () => new Set(profile.progress.worldsExplored || []),
    [profile]
  );
  const placedItems = profile.coconPlaced || {};
  const currentKey = profile.progress.currentWorld || 'foret';
  const currentWorld = WORLDS[currentKey] || WORLDS.foret;
  const totemKey = profile.totem || 'lion';
  const totemHomeKey = TOTEM_HOME[totemKey] || 'foret';
  const totemHome = WORLDS[totemHomeKey];
  const totemGlyph = TOTEM_GLYPH[totemKey] || '◆';

  return (
    <div
      className={currentWorld.wash}
      style={{
        position: 'absolute',
        inset: 0,
        color: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
        filter: paletteMode === 'night' ? 'brightness(0.96)' : undefined,
      }}
    >
      {/* Atmospheric bg-photo overlay (Agent D) + scroll parallax 0.4 (Agent B) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${currentWorld.bg})`,
          backgroundSize: 'cover',
          backgroundPosition: `center calc(50% + ${scrollY * -0.4}px)`,
          opacity: 0.08,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
          zIndex: 0,
          willChange: 'background-position',
        }}
      />

      {/* Ambient witnesses — items du Cocon placés (Agent C) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.16,
        }}
      >
        {Object.entries(placedItems)
          .filter(([_, isPlaced]) => isPlaced)
          .map(([key]) => {
            const pos = COCON_AMBIENT_POSITIONS[key];
            if (!pos) return null;
            return (
              <span
                key={key}
                style={{
                  position: 'absolute',
                  top: pos.top,
                  left: pos.left,
                  right: pos.right,
                  fontSize: pos.size,
                  color: 'var(--ink)',
                  transform: `translateY(${scrollY * -0.2}px)`,
                  transition: 'transform 0.1s linear',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {pos.glyph}
              </span>
            );
          })}
      </div>
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
        <div style={{ maxWidth: '70%' }}>
          <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
            {`N É Y A`}
          </div>
          <h1
            className="neya-h2"
            style={{
              marginTop: 8,
              fontFamily: 'var(--font-display)',
              display: 'flex',
              alignItems: 'baseline',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <span>
              {greet()}
              {profile.pseudo && (
                <>, <em className="neya-key">{profile.pseudo}</em></>
              )}
              .
            </span>
            <span
              style={{
                fontSize: 20,
                color: totemHome.accent,
                animation: 'totem-idle 4s var(--ease-in-out) infinite',
                display: 'inline-block',
              }}
              aria-label={`Totem ${totemKey}`}
            >
              {totemGlyph}
            </span>
          </h1>
          {profile.mantra && (
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 14,
                color: 'var(--content-secondary)',
                marginTop: 6,
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                lineHeight: 1.45,
              }}
            >
              « {profile.mantra} »
            </div>
          )}
          {etatLine && !profile.mantra && (
            <div style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13,
              color: 'var(--content-secondary)', marginTop: 6, lineHeight: 1.45,
              fontVariationSettings: 'var(--fraunces-italic-soft)',
            }}>{etatLine}</div>
          )}
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
            {displayedMinutes} min
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
            <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: 0, textTransform: 'none' }}>{motifCTA.replace(/\s*→\s*$/, '')}</span>
          </span>
          <span style={{ fontSize: 14, opacity: 0.65, letterSpacing: 0, textTransform: 'none' }}>→</span>
        </Button>
      </div>

      {/* Habitudes du jour entry */}
      <div style={{ padding: '0 22px 20px' }}>
        <button
          data-press={true}
          onClick={onOpenHabitudes}
          style={{
            appearance: 'none',
            display: 'block',
            width: '100%',
            textAlign: 'left',
            background: 'rgba(255, 252, 245, 0.82)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '0.5px solid rgba(26, 26, 47, 0.10)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            boxShadow: 'var(--shadow-soft)',
            transition: 'all 240ms var(--ease-out)',
          }}
        >
          <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
            HABITUDES DU JOUR
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 18,
              fontWeight: 400,
              lineHeight: 1.15,
              color: 'var(--ink)',
              marginTop: 4,
              fontVariationSettings: 'var(--fraunces-italic-soft)',
            }}
          >
            Tes rituels du moment
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--content-secondary)',
              lineHeight: 1.5,
              marginTop: 2,
            }}
          >
            Touche pour ouvrir
          </div>
        </button>
      </div>

      {/* Scrollable ascent — onScroll drives parallax */}
      <div
        onScroll={onScroll}
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

          <div className="stagger" style={{ display: 'contents' }}>
          {WORLD_ORDER.map((wKey, i) => {
            const w = WORLDS[wKey];
            const isExplored = explored.has(wKey);
            const isCurrent = wKey === currentKey;
            const isLocked = !isExplored && !isCurrent;
            const isHome = wKey === totemHomeKey;

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
                  isHome={isHome}
                  onClick={isLocked ? undefined : () => onOpenWorld?.(wKey)}
                />
              </div>
            );
          })}
          </div>

          <div
            style={{
              marginTop: 28,
              padding: '0 24px',
              textAlign: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              fontStyle: 'italic',
              color: 'var(--content-tertiary)',
              lineHeight: 1.6,
              fontVariationSettings: 'var(--fraunces-italic-soft)',
            }}
          >
            {profile.progress.joursConnectes >= 7
              ? `Tu es revenu·e ${profile.progress.joursConnectes} jours d’affilée — c’est ce qui compte.`
              : whisperOfDay(profile.progress.joursConnectes)}
          </div>
        </div>
      </div>

      {celebrating && (() => {
        const unlockedWorld = WORLDS[celebrating.worldKey];
        if (!unlockedWorld) return null;
        return (
          <div
            role="dialog"
            aria-label="Monde débloqué"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 50,
              background: 'rgba(255, 252, 245, 0.55)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              animation: celebrationLeaving
                ? 'aventureCelebrationOut 280ms var(--ease-out) forwards'
                : 'aventureCelebrationIn 420ms var(--ease-out) both',
            }}
            onClick={dismissCelebration}
          >
            <style>{`
              @keyframes aventureCelebrationIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes aventureCelebrationOut { from { opacity: 1; } to { opacity: 0; } }
            `}</style>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--cream-light, #FFFCF5)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 22px',
                boxShadow: 'var(--shadow-card)',
                maxWidth: 320,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 12,
              }}
            >
              <span
                className="tilleul-pop"
                style={{
                  color: 'var(--tilleul)',
                  fontSize: 56,
                  lineHeight: 1,
                  fontFamily: 'var(--font-display)',
                  display: 'inline-block',
                }}
                aria-hidden="true"
              >
                ✓
              </span>
              <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
                MONDE DÉBLOQUÉ
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 28,
                  lineHeight: 1.2,
                  color: 'var(--ink)',
                  fontVariationSettings: 'var(--fraunces-italic-soft)',
                }}
              >
                « Tu as découvert le{' '}
                <em className="neya-key">{unlockedWorld.name}</em>. »
              </div>
              {unlockedWorld.emotion && (
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    color: 'var(--content-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  {unlockedWorld.emotion}
                </div>
              )}
              <button
                data-press={true}
                onClick={dismissCelebration}
                style={{
                  appearance: 'none',
                  marginTop: 8,
                  background: 'var(--ink)',
                  color: 'var(--cream)',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '12px 28px',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Continuer
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function WorldCard({ world, isCurrent, isLocked, isHome, onClick }) {
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
        outline: isHome ? `1px dashed ${world.accent}` : 'none',
        outlineOffset: isHome ? 3 : 0,
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        minHeight: 70,
        textAlign: 'left',
        cursor: isLocked ? 'default' : 'pointer',
        opacity: isLocked ? 0.55 : 1,
        WebkitTapHighlightColor: 'transparent',
        boxShadow: isCurrent ? 'var(--shadow-card)' : 'var(--shadow-soft)',
        transition: 'all 240ms var(--ease-out)',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="neya-mark" style={{ color: world.accent }}>
            CHAPITRE {String(world.chapter).padStart(2, '0')}
          </span>
          {isHome && (
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 8,
                fontWeight: 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: world.accent,
                opacity: 0.85,
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                background: `${world.accentRgb}, 0.14)`,
              }}
            >
              Ton monde
            </span>
          )}
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
