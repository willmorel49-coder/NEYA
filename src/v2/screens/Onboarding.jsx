/* ============================================================
   NÉYA V3 — Onboarding (5 questions immersives, LIGHT MODE)
   ============================================================
   Wash pastel par monde + ink text + cards pearl translucides.
   Aligné palette ÇA VA? + inspirations soft/inviting.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { WORLDS } from '../worlds';
import { haptic, getProfile, setProfile } from '../state';
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
      { value: 'pas-terrible',    label: 'Pas terrible' },
      { value: 'ca-va-je-gere',   label: 'Ça va, je gère' },
      { value: 'plutot-bien',     label: 'Plutôt bien' },
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
      { value: 'matin',         label: 'Le matin' },
      { value: 'midi',          label: 'À midi' },
      { value: 'soir',          label: 'Le soir' },
      { value: 'avant-dormir',  label: 'Avant de dormir' },
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
  },
];

export default function Onboarding({ onComplete }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [show, setShow] = useState(false);
  const [answers, setAnswers] = useState({});
  const [exiting, setExiting] = useState(false);
  const transitioningRef = useRef(false);

  useEffect(() => {
    setShow(false);
    setExiting(false);
    transitioningRef.current = false;
    const t = setTimeout(() => setShow(true), 60);
    return () => clearTimeout(t);
  }, [stepIdx]);

  const step = STEPS[stepIdx];
  const world = WORLDS[step.world];

  const advance = (value) => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    haptic(6);

    const nextAnswers = step.field ? { ...answers, [step.field]: value } : answers;
    setAnswers(nextAnswers);

    setExiting(true);

    if (stepIdx === STEPS.length - 1) {
      const profile = getProfile();
      profile.onboarding = {
        ...nextAnswers,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      profile.progress.currentWorld = 'foret';
      profile.progress.worldsExplored = ['foret'];
      setProfile(profile);

      setTimeout(() => {
        haptic([8, 60, 8]);
        onComplete?.();
      }, 700);
    } else {
      setTimeout(() => setStepIdx(stepIdx + 1), 700);
    }
  };

  return (
    <div
      className={world.wash}
      style={{
        position: 'absolute',
        inset: 0,
        opacity: exiting ? 0 : (show ? 1 : 0),
        transition: 'opacity 700ms var(--ease-narrative)',
      }}
    >
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
          {`N É Y A`}
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

      {/* Center totem glyph + emotional cue */}
      <div
        style={{
          position: 'absolute',
          top: '24%',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: show && !exiting ? 1 : 0,
          transform: show && !exiting ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 800ms var(--ease-out) 100ms, transform 800ms var(--ease-out) 100ms',
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

      {/* Bottom content : HeroTitle + pills/CTA */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '22px 22px calc(env(safe-area-inset-bottom, 0px) + 32px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          opacity: show && !exiting ? 1 : 0,
          transform: show && !exiting ? 'translateY(0)' : 'translateY(16px)',
          transition:
            'opacity 800ms var(--ease-out) 180ms, transform 800ms var(--ease-out) 180ms',
        }}
      >
        <HeroTitle
          eyebrow={step.eyebrow}
          paletteMode="dawn"
          size={stepIdx === STEPS.length - 1 ? 'hero' : 'h1'}
          title={
            <>
              {step.titleBefore}
              <em className="neya-key">{step.titleEm}</em>
              {step.titleAfter}
            </>
          }
        />

        {step.field ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {step.pills.map((p) => (
              <PillChoice
                key={String(p.value)}
                accent={world.accent}
                accentRgb={world.accentRgb}
                onClick={() => advance(p.value)}
              >
                {p.label}
              </PillChoice>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              size="lg"
              variant="primary"
              worldAccent={world.accent}
              onClick={() => advance(null)}
              style={{
                background: 'var(--ink)',
                color: 'var(--cream)',
              }}
            >
              {step.cta}
            </Button>
          </div>
        )}

        {/* Progression dots — chapter mark IS the progression */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 4 }}>
          {STEPS.map((_, i) => (
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

function PillChoice({ children, accent, accentRgb, onClick }) {
  return (
    <button
      data-press
      onClick={onClick}
      style={{
        appearance: 'none',
        background: 'rgba(255, 255, 255, 0.55)',
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
        e.currentTarget.style.background = `${accentRgb}, 0.10)`;
        e.currentTarget.style.borderColor = `${accentRgb}, 0.40)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.55)';
        e.currentTarget.style.borderColor = `${accentRgb}, 0.20)`;
      }}
    >
      {children}
    </button>
  );
}
