/* ============================================================
   ÇA VA ? V3.2 — Onboarding (crossfade overlapping 2-layer)
   ============================================================
   Refactor : pendant transition entre 2 questions, les DEUX
   couches sont rendues simultanément avec opacity opposée
   (current 1→0 + next 0→1) — vrai crossfade 900ms ease-narrative.
   Agent B fix.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { WORLDS } from '../worlds';
import { haptic, getProfile, setProfile, ls, calculateTotemFromOnboarding } from '../state';
import Button from '../../components/Button';
import HeroTitle from '../../components/HeroTitle';

const STEPS = [
  {
    world: 'foret',
    eyebrow: 'L’ÉVEIL',
    titleBefore: 'T’as pas besoin ',
    titleEm: 'd’aller bien',
    titleAfter: ' pour commencer.',
    field: 'q1_etat',
    pills: [
      { value: 'pas-terrible',     label: 'Pas terrible' },
      { value: 'ca-va-je-gere',    label: 'Ça va, je gère' },
      { value: 'plutot-bien',      label: 'Plutôt bien' },
      { value: 'je-sais-pas-trop', label: 'Je sais pas trop' },
    ],
  },
  {
    world: 'temple',
    eyebrow: 'LE REFUGE',
    titleBefore: 'Qu’est-ce qui ',
    titleEm: 'te ramène',
    titleAfter: ' ici ?',
    field: 'q2_motif',
    pills: [
      { value: 'stress',   label: 'Le stress' },
      { value: 'sommeil',  label: 'Le sommeil' },
      { value: 'emotions', label: 'Les émotions' },
      { value: 'curieux',  label: 'Curieux·se' },
    ],
  },
  {
    world: 'oasis',
    eyebrow: 'LE TEMPS',
    titleBefore: 'Combien de minutes ',
    titleEm: 'par jour ?',
    titleAfter: '',
    field: 'q3_minutes',
    pills: [
      { value: 5,      label: '5 min' },
      { value: 10,     label: '10 min' },
      { value: 15,     label: '15 min' },
      { value: 'plus', label: 'Plus si je peux' },
    ],
  },
  {
    world: 'lac',
    eyebrow: 'LE RYTHME',
    titleBefore: 'Quand préfères-tu ',
    titleEm: 'te poser ?',
    titleAfter: '',
    field: 'q4_rythme',
    pills: [
      { value: 'matin',        label: 'Le matin' },
      { value: 'midi',         label: 'À midi' },
      { value: 'soir',         label: 'Le soir' },
      { value: 'avant-dormir', label: 'Avant de dormir' },
    ],
  },
  {
    world: 'montagne',
    eyebrow: 'LA QUESTION',
    titleBefore: 'Et toi, ça va ',
    titleEm: 'vraiment ?',
    titleAfter: '',
    field: null,
    cta: 'Commencer mon aventure',
    manifeste: 'Nous existons pour briser le masque du « ça va ».',
  },
];

const CROSSFADE_MS = 900;

export default function Onboarding({ onComplete }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [transitionToIdx, setTransitionToIdx] = useState(null);  // null = pas en transition
  // Hydrate depuis localStorage : reprend l'onboarding si quitté en cours
  const [answers, setAnswers] = useState(() => ls.get('onboarding_draft', {}));
  const [completing, setCompleting] = useState(false);

  // Track pending timers for cleanup on unmount (no orphan setState after unmount)
  const timersRef = useRef([]);
  const queueTimer = (cb, ms) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((x) => x !== id);
      cb();
    }, ms);
    timersRef.current.push(id);
    return id;
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  const skipIntro = () => {
    if (completing) return;
    const ok = typeof window !== 'undefined'
      ? window.confirm("Passer l'introduction et utiliser des réponses par défaut ?")
      : true;
    if (!ok) return;
    haptic(4);
    const defaults = {
      q1_etat: 'je-sais-pas-trop',
      q2_motif: 'curieux',
      q3_minutes: 5,
      q4_rythme: 'soir',
    };
    const merged = { ...defaults, ...answers };
    const profile = getProfile();
    profile.onboarding = {
      ...merged,
      completed: true,
      completedAt: new Date().toISOString(),
    };
    profile.totem = calculateTotemFromOnboarding(merged);
    profile.progress = profile.progress || {};
    profile.progress.currentWorld = 'foret';
    profile.progress.worldsExplored = ['foret'];
    setProfile(profile);
    ls.del('onboarding_draft');
    setCompleting(true);
    onComplete?.();
  };

  const goBack = () => {
    if (transitionToIdx !== null || completing) return;
    if (stepIdx === 0) return;
    haptic(4);
    const prev = stepIdx - 1;
    setTransitionToIdx(prev);
    queueTimer(() => {
      setStepIdx(prev);
      setTransitionToIdx(null);
    }, CROSSFADE_MS);
  };

  const advance = (value) => {
    if (transitionToIdx !== null || completing) return;
    haptic(6);

    const step = STEPS[stepIdx];
    const nextAnswers = step.field ? { ...answers, [step.field]: value } : answers;
    setAnswers(nextAnswers);
    // Persiste le draft à chaque advance (reprise si quit au milieu)
    ls.set('onboarding_draft', nextAnswers);

    if (stepIdx === STEPS.length - 1) {
      // Save + complete
      const profile = getProfile();
      profile.onboarding = {
        ...nextAnswers,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      profile.totem = calculateTotemFromOnboarding(nextAnswers);
      profile.progress.currentWorld = 'foret';
      profile.progress.worldsExplored = ['foret'];
      setProfile(profile);
      ls.del('onboarding_draft');
      setCompleting(true);
      queueTimer(() => {
        haptic([8, 60, 8]);
        onComplete?.();
      }, 700);
      return;
    }

    const next = stepIdx + 1;
    setTransitionToIdx(next);
    queueTimer(() => {
      setStepIdx(next);
      setTransitionToIdx(null);
    }, CROSSFADE_MS);
  };

  // Layer state: current is "exiting" if a transition is in flight, otherwise "stable"
  const currentState = completing ? 'exiting' : (transitionToIdx !== null ? 'exiting' : 'stable');
  const nextStep = transitionToIdx !== null ? STEPS[transitionToIdx] : null;

  return (
    <>
      {/* Current layer */}
      <StepLayer
        key={`step-${stepIdx}`}
        step={STEPS[stepIdx]}
        stepIdx={stepIdx}
        totalSteps={STEPS.length}
        fadeState={currentState}
        onAdvance={advance}
        interactive={transitionToIdx === null && !completing}
      />
      {/* Next layer (only during transition) */}
      {nextStep && (
        <StepLayer
          key={`step-${transitionToIdx}-next`}
          step={nextStep}
          stepIdx={transitionToIdx}
          totalSteps={STEPS.length}
          fadeState="entering"
          onAdvance={advance}
          interactive={false}
        />
      )}

      {/* Back button — apparait à partir de la step 2 (stepIdx >= 1) */}
      {stepIdx > 0 && !completing && (
        <button
          type="button"
          data-press
          onClick={goBack}
          aria-label="Revenir à l'étape précédente"
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
            left: 22,
            width: 44,
            height: 44,
            borderRadius: 22,
            background: 'rgba(251, 246, 232, 0.10)',
            border: '0.5px solid rgba(251, 246, 232, 0.22)',
            color: '#FBF6E8',
            fontSize: 18,
            zIndex: 10,
            appearance: 'none',
            outline: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
            transition: 'opacity 400ms var(--ease-out)',
            opacity: transitionToIdx !== null ? 0.4 : 1,
            pointerEvents: transitionToIdx !== null ? 'none' : 'auto',
          }}
        >
          ‹
        </button>
      )}

      {/* Global skip — above all layers, 44×44 hit zone */}
      <button
        type="button"
        data-press
        onClick={skipIntro}
        aria-label="Passer l'introduction"
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          right: 22,
          zIndex: 10,
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          padding: '12px 14px',
          minWidth: 44,
          minHeight: 44,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-ui, "Sora", system-ui, sans-serif)',
          fontWeight: 500,
          fontSize: 9,
          letterSpacing: '0.222em',
          textTransform: 'uppercase',
          color: 'var(--content-tertiary)',
          opacity: completing ? 0 : 0.85,
          transition: 'opacity 400ms var(--ease-out)',
          WebkitTapHighlightColor: 'transparent',
          pointerEvents: completing ? 'none' : 'auto',
        }}
      >
        Passer l'introduction ›
      </button>
    </>
  );
}

function StepLayer({ step, stepIdx, totalSteps, fadeState, onAdvance, interactive }) {
  const world = WORLDS[step.world];

  // Opacity logic
  // - entering: starts 0, becomes 1 after mount (transition CROSSFADE_MS)
  // - exiting: starts 1, becomes 0 (transition CROSSFADE_MS)
  // - stable: 1
  const [mounted, setMounted] = useState(fadeState !== 'entering');
  useEffect(() => {
    if (fadeState === 'entering') {
      // Trigger entrance opacity after first paint.
      // rAF may not fire when the tab is inactive — setTimeout fallback ensures
      // the layer never stays stuck at opacity 0.
      const r = requestAnimationFrame(() => setMounted(true));
      const t = setTimeout(() => setMounted(true), 50);
      return () => {
        cancelAnimationFrame(r);
        clearTimeout(t);
      };
    }
  }, [fadeState]);

  const opacity = fadeState === 'exiting' ? 0 : (mounted ? 1 : 0);

  return (
    <div
      className={world.wash}
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        transition: `opacity ${CROSSFADE_MS}ms var(--ease-narrative)`,
        zIndex: fadeState === 'entering' ? 2 : 1,
        pointerEvents: interactive ? 'auto' : 'none',
      }}
    >
      {/* Atmospheric bg-photo overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${world.bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.10,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />

      {/* Top mark — chapter info */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 22px)',
          left: 22,
          right: 22,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          zIndex: 2,
        }}
      >
        <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
          {`N É Y A`}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
            {`CHAPITRE ${String(world.chapter).padStart(2, '0')}`}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              fontWeight: 500,
              color: world.accent,
              letterSpacing: 0,
            }}
          >
            {world.name}
          </div>
        </div>
      </div>

      {/* Center totem + emotional cue */}
      <div
        style={{
          position: 'absolute',
          top: '24%',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${world.accent} 0%, transparent 70%)`,
            opacity: 0.45,
            position: 'absolute',
            top: -22,
          }}
        />
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 26,
            fontWeight: 400,
            color: world.accent,
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            zIndex: 1,
            marginBottom: 6,
          }}
        >
          {world.totem}
        </div>
        <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
          {world.moment}
        </div>
      </div>

      {/* Bottom content */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '22px 22px max(48px, calc(env(safe-area-inset-bottom, 0px) + 32px))',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        <HeroTitle
          eyebrow={step.eyebrow}
          paletteMode="dawn"
          size={stepIdx === totalSteps - 1 ? 'hero' : 'h1'}
          title={
            <>
              {step.titleBefore}
              <em className="neya-key">{step.titleEm}</em>
              {step.titleAfter}
            </>
          }
        />

        {step.field ? (
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {step.pills.map((p) => (
              <PillChoice
                key={String(p.value)}
                accent={world.accent}
                accentRgb={world.accentRgb}
                selected={false}
                onClick={() => interactive && onAdvance(p.value)}
              >
                {p.label}
              </PillChoice>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Button
              size="lg"
              variant="primary"
              worldAccent={world.accent}
              onClick={() => interactive && onAdvance(null)}
              style={{
                background: 'var(--ink)',
                color: 'var(--cream)',
                alignSelf: 'flex-start',
              }}
            >
              {step.cta}
            </Button>
            {step.manifeste && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: 'var(--content-secondary)',
                    fontVariationSettings: 'var(--fraunces-italic-soft)',
                  }}
                >
                  — {step.manifeste}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontVariationSettings: 'var(--fraunces-italic-soft)',
                    fontSize: 14,
                    color: 'var(--cream)',
                    opacity: 0.78,
                    lineHeight: 1.5,
                    textAlign: 'center',
                  }}
                >
                  Un espace pour ce que tu ressens vraiment.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progression dots */}
        <div
          role="status"
          aria-live="polite"
          aria-label={`Étape ${stepIdx + 1} sur ${totalSteps}`}
          style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 4 }}
        >
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              style={{
                width: i === stepIdx ? 20 : 5,
                height: 2,
                borderRadius: 1,
                background: i <= stepIdx ? world.accent : 'rgba(26, 26, 47, 0.15)',
                transition: 'all 400ms var(--ease-out)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PillChoice({ children, accent, accentRgb, onClick, selected = false }) {
  return (
    <button
      data-press
      onClick={onClick}
      aria-pressed={selected}
      style={{
        appearance: 'none',
        background: 'rgba(255, 252, 245, 0.62)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: `0.5px solid ${accentRgb}, 0.20)`,
        borderRadius: 'var(--radius-pill)',
        padding: '15px 22px',
        textAlign: 'left',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        fontFamily: 'var(--font-ui)',
        fontSize: 14,
        fontWeight: 500,
        color: 'var(--ink)',
        letterSpacing: 0,
        transition: 'background 200ms var(--ease-out), border-color 200ms var(--ease-out)',
        boxShadow: '0 1px 6px rgba(26, 26, 47, 0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${accentRgb}, 0.12)`;
        e.currentTarget.style.borderColor = `${accentRgb}, 0.40)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 252, 245, 0.62)';
        e.currentTarget.style.borderColor = `${accentRgb}, 0.20)`;
      }}
    >
      {children}
    </button>
  );
}
