/* ============================================================
   Checkin — Écran principal V6
   ============================================================
   State machine 4 états :
     'question'  -> "Et toi, ça va vraiment ?" + 3 choix
     'echo'      -> menu 3 options adaptées au mood
     'action'    -> mini-flow (respiration/écriture/bouée/citation)
     'done'      -> "Tu t'es posé·e aujourd'hui."
   ============================================================ */

import { useState, useEffect } from 'react';
import {
  hasCheckinToday,
  getTodayCheckin,
  addCheckin,
  appendActionToTodayCheckin,
  MOOD_COLORS,
  MOOD_LABELS,
} from '../helpers/checkins';
import { greet, getProfile, haptic } from '../state';

const ECHO_MENU = {
  'pas-terrible': [
    { id: 'respi-478', label: 'Respirer 4·7·8', sublabel: 'Calme le système', icon: '◯', kind: 'respi-478' },
    { id: 'write',     label: 'Écrire ce qui pèse', sublabel: 'Vider la tête', icon: '✎', kind: 'write' },
    { id: 'bouee',     label: 'Une bouée douce', sublabel: 'Action concrète', icon: '◐', kind: 'bouee', boueeLevel: ['corps', 'lien'] },
  ],
  'ca-va-pas-trop': [
    { id: 'respi-55',  label: 'Respirer 5·5', sublabel: 'Cohérence cardiaque', icon: '◯', kind: 'respi-55' },
    { id: 'write',     label: 'Écrire (texte libre)', sublabel: 'Pose tes mots', icon: '✎', kind: 'write' },
    { id: 'bouee',     label: 'Une bouée', sublabel: 'Petit pas concret', icon: '◐', kind: 'bouee' },
  ],
  'ca-va': [
    { id: 'citation',  label: 'Une citation à garder', sublabel: "Pour aujourd'hui", icon: '✦', kind: 'citation' },
    { id: 'write',     label: 'Un mot pour toi', sublabel: 'Gratitude, joie', icon: '✎', kind: 'write' },
    { id: 'bouee',     label: 'Une bouée légère', sublabel: 'Continue ton élan', icon: '◐', kind: 'bouee', boueeLevel: ['esprit', 'monde'] },
  ],
};

export default function Checkin({ onOpenTimeline }) {
  const [step, setStep] = useState(() => (hasCheckinToday() ? 'done' : 'question'));
  const [currentCheckin, setCurrentCheckin] = useState(() => getTodayCheckin());
  const [activeAction, setActiveAction] = useState(null);

  useEffect(() => {
    const onChange = () => {
      setCurrentCheckin(getTodayCheckin());
      if (hasCheckinToday() && step === 'question') setStep('done');
    };
    window.addEventListener('cava:profile-changed', onChange);
    return () => window.removeEventListener('cava:profile-changed', onChange);
  }, [step]);

  const handlePickMood = (mood) => {
    haptic(4);
    const c = addCheckin({ mood });
    setCurrentCheckin(c);
    setStep('echo');
  };

  const handlePickAction = (option) => {
    haptic(4);
    setActiveAction(option);
    setStep('action');
  };

  const handleActionDone = (actionPayload) => {
    appendActionToTodayCheckin(actionPayload);
    setCurrentCheckin(getTodayCheckin());
    setActiveAction(null);
    setStep('done');
  };

  const handleContinue = () => {
    haptic(2);
    setStep('echo');
  };

  return (
    <div style={{ minHeight: '100dvh', padding: '40px 20px 100px', display: 'flex', flexDirection: 'column' }}>
      {step === 'question' && <QuestionStep onPick={handlePickMood} />}
      {step === 'echo'     && <EchoStep mood={currentCheckin?.mood} citation={currentCheckin?.citation} onPick={handlePickAction} />}
      {step === 'action'   && <ActionStep option={activeAction} mood={currentCheckin?.mood} onDone={handleActionDone} onCancel={() => setStep('echo')} />}
      {step === 'done'     && <DoneStep checkin={currentCheckin} onContinue={handleContinue} onViewPast={onOpenTimeline} />}
    </div>
  );
}

function QuestionStep({ onPick }) {
  const profile = getProfile();
  const prenom = profile?.preferences?.prenom;
  const today = new Date();
  const dayName = today.toLocaleDateString('fr-FR', { weekday: 'long' });
  const dateLong = today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 8 }}>
        {greet()}{prenom ? `, ${prenom}` : ''} · {dayName} {dateLong}
      </div>
      <h1 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontSize: 32,
        lineHeight: 1.2,
        marginBottom: 32,
        color: 'var(--ink)',
      }}>
        Et toi,<br/>ça va vraiment ?
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { mood: 'ca-va',           emoji: '👌', label: 'Ça va' },
          { mood: 'ca-va-pas-trop',  emoji: '😶', label: 'Ça va pas trop' },
          { mood: 'pas-terrible',    emoji: '🌧', label: 'Pas terrible' },
        ].map((opt) => (
          <button
            key={opt.mood}
            onClick={() => onPick(opt.mood)}
            style={{
              minHeight: 56,
              padding: '14px 18px',
              background: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 16,
              fontSize: 16,
              fontFamily: 'inherit',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              color: 'var(--ink)',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ fontSize: 22 }}>{opt.emoji}</span>
            <span>{opt.label}</span>
            <span style={{ marginLeft: 'auto', opacity: 0.4 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EchoStep({ mood, citation, onPick }) {
  const options = ECHO_MENU[mood] || ECHO_MENU['ca-va-pas-trop'];
  const moodLabel = MOOD_LABELS[mood];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'inline-block', alignSelf: 'flex-start',
        padding: '4px 10px',
        background: `${MOOD_COLORS[mood]}30`,
        color: MOOD_COLORS[mood],
        borderRadius: 10,
        fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: 12,
      }}>
        Tu m'as dit : {moodLabel}
      </div>
      <h1 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontSize: 28,
        lineHeight: 1.2,
        marginBottom: 8,
        color: 'var(--ink)',
      }}>
        {mood === 'pas-terrible' ? 'Reste là.' : mood === 'ca-va' ? 'Belle énergie.' : 'Pose-toi.'}
        <br/>Tu veux faire quoi ?
      </h1>
      <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 24 }}>3 options. Tu peux aussi juste fermer.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onPick(opt)}
            style={{
              minHeight: 56,
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 14,
              fontSize: 14,
              fontFamily: 'inherit',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: 'var(--ink)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 18, opacity: 0.8 }}>{opt.icon}</span>
            <div style={{ flex: 1 }}>
              <div>{opt.label}</div>
              <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>{opt.sublabel}</div>
            </div>
            <span style={{ opacity: 0.4 }}>→</span>
          </button>
        ))}
      </div>

      {citation && (
        <div style={{ marginTop: 'auto', paddingTop: 24, opacity: 0.7 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: 14, lineHeight: 1.5 }}>« {citation.text} »</p>
          {citation.author && <p style={{ fontSize: 11, opacity: 0.55, marginTop: 4 }}>— {citation.author}</p>}
        </div>
      )}
    </div>
  );
}

function ActionStep({ option, mood, onDone, onCancel }) {
  // Phase 3 remplace ce stub par les vrais mini-flows.
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' }}>
        [Stub] Mini-flow : {option?.label}
      </h2>
      <button
        onClick={() => onDone({ type: option?.kind || 'unknown' })}
        style={{ padding: '12px 24px', background: 'var(--rose-700, #BE185D)', color: 'white', border: 'none', borderRadius: 12 }}
      >
        Terminer (stub)
      </button>
      <button onClick={onCancel} style={{ background: 'transparent', border: 'none', opacity: 0.5 }}>
        Annuler
      </button>
    </div>
  );
}

function DoneStep({ checkin, onContinue, onViewPast }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h1 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontSize: 28,
        lineHeight: 1.2,
        marginBottom: 8,
        color: 'var(--ink)',
      }}>
        Tu t'es posé·e<br/>aujourd'hui.
      </h1>
      <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 32 }}>
        À demain. Sauf si tu veux revenir.
      </p>

      {checkin?.actions?.length > 0 && (
        <div style={{ marginBottom: 32, padding: 16, background: 'rgba(255,255,255,0.4)', borderRadius: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 8 }}>Ce que tu as fait</div>
          {checkin.actions.map((a, i) => (
            <div key={i} style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
              ✓ {a.type === 'breath' ? 'Respiration' : a.type === 'write' ? 'Écriture' : a.type === 'bouee' ? 'Bouée' : a.type === 'citation' ? 'Citation gardée' : a.type}
            </div>
          ))}
        </div>
      )}

      {checkin?.citation && (
        <div style={{ opacity: 0.8 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: 16, lineHeight: 1.5 }}>« {checkin.citation.text} »</p>
          {checkin.citation.author && <p style={{ fontSize: 11, opacity: 0.55, marginTop: 4 }}>— {checkin.citation.author}</p>}
        </div>
      )}

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={onContinue}
          style={{ minHeight: 48, background: 'rgba(232,160,184,0.16)', color: '#BE185D', border: 'none', borderRadius: 12, fontFamily: 'inherit', fontSize: 14, cursor: 'pointer' }}
        >
          Faire autre chose
        </button>
        {onViewPast && (
          <button
            onClick={onViewPast}
            style={{ minHeight: 40, background: 'transparent', border: 'none', opacity: 0.6, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}
          >
            Voir le passé →
          </button>
        )}
      </div>
    </div>
  );
}
