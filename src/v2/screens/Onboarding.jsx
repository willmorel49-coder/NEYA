/* ============================================================
   NÉYA V2 — Onboarding (5 questions immersives)
   ============================================================
   1 question = 1 monde = 1 chapter mark. Pas de progress bar.
   Cross-fade 800ms entre mondes. Tap pill = scale 0.96 + advance.
   Q5 = primary CTA "Commencer mon aventure".
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { WORLDS } from '../worlds';
import { haptic, ls, getProfile, setProfile } from '../state';
import Button from '../../components/Button';
import GlassCard from '../../components/GlassCard';
import ChapterMark from '../../components/ChapterMark';
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
    field: null,                        // single CTA, no pill
    cta: 'Commencer mon aventure',
  },
];

export default function Onboarding({ onComplete }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [show, setShow] = useState(false);
  const [answers, setAnswers] = useState({});
  const [exiting, setExiting] = useState(false);
  const transitioningRef = useRef(false);

  // Enter animation on mount + on step change
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

    const nextAnswers = step.field
      ? { ...answers, [step.field]: value }
      : answers;
    setAnswers(nextAnswers);

    setExiting(true);

    if (stepIdx === STEPS.length - 1) {
      // Save and finish
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
      }, 800);
    } else {
      setTimeout(() => setStepIdx(stepIdx + 1), 800);
    }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--void)' }}>
      {/* Stage — photo + vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${world.bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: exiting ? 0 : (show ? 1 : 0),
          transition: 'opacity 800ms var(--ease-narrative)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(5,8,16,0.88) 0%, rgba(5,8,16,0.55) 28%, rgba(5,8,16,0.18) 60%, rgba(5,8,16,0.04) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Chapter Mark */}
      <div
        style={{
          opacity: exiting ? 0 : (show ? 1 : 0),
          transition: 'opacity 600ms var(--ease-out) 120ms',
        }}
      >
        <ChapterMark brand chapter={world.chapter} world={world.name} />
      </div>

      {/* Bottom content : HeroTitle + pills/CTA */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: 'var(--sp-5) var(--sp-5) calc(env(safe-area-inset-bottom, 0px) + var(--sp-6))',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-6)',
          opacity: exiting ? 0 : (show ? 1 : 0),
          transform: exiting ? 'translateY(8px)' : (show ? 'translateY(0)' : 'translateY(16px)'),
          transition:
            'opacity 800ms var(--ease-out) 180ms, transform 800ms var(--ease-out) 180ms',
        }}
      >
        <HeroTitle
          eyebrow={step.eyebrow}
          paletteMode={world.palette}
          size={stepIdx === STEPS.length - 1 ? 'hero' : 'h1'}
          title={
            <>
              {step.titleBefore}
              <em className="neya-key">{step.titleEm}</em>
              {step.titleAfter}
            </>
          }
        />

        {/* Pills or single CTA */}
        {step.field ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {step.pills.map((p) => (
              <GlassCard
                key={String(p.value)}
                variant="glass"
                worldAccent={world.accentRgb}
                onClick={() => advance(p.value)}
                style={{
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  width: '100%',
                  padding: '0 18px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'var(--type-label)',
                    fontWeight: 'var(--weight-medium)',
                    letterSpacing: 0,
                    color: 'var(--content-primary)',
                  }}
                >
                  {p.label}
                </span>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              size="lg"
              variant="primary"
              worldAccent={world.accent}
              onClick={() => advance(null)}
            >
              {step.cta}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
