/* ============================================================
   Checkin — Écran principal V6
   ============================================================
   State machine 4 états :
     'question'  -> "Et toi, ça va vraiment ?" + 3 choix
     'echo'      -> menu 3 options adaptées au mood
     'action'    -> mini-flow (respiration/écriture/bouée/citation)
     'done'      -> "Tu t'es posé·e aujourd'hui."
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import {
  hasCheckinToday,
  getTodayCheckin,
  addCheckin,
  appendActionToTodayCheckin,
  pickEchoCitation,
  MOOD_COLORS,
  MOOD_LABELS,
} from '../helpers/checkins';
import { greet, getProfile, haptic } from '../state';
import BreathingPause from './BreathingPause';
import Carnet from './Carnet';
import Timeline from './Timeline';
import BoueeModal from '../../components/ui/BoueeModal';
import CitationKeepModal from '../../components/ui/CitationKeepModal';

/* ------------------------------------------------------------ */
/* Mood meta — sublabel + tonalité humaine                      */
/* ------------------------------------------------------------ */
const MOOD_META = {
  'ca-va':          { emoji: '👌', label: 'Ça va',           sublabel: 'Présent·e' },
  'ca-va-pas-trop': { emoji: '😶', label: 'Ça va pas trop',  sublabel: 'Un peu lourd' },
  'pas-terrible':   { emoji: '🌧', label: 'Pas terrible',    sublabel: 'Lourd, vraiment' },
};

/* ------------------------------------------------------------ */
/* Echo header — tonalité douce par mood                        */
/* ------------------------------------------------------------ */
const ECHO_HEADERS = {
  'pas-terrible':   'Reçu.',
  'ca-va-pas-trop': 'Reçu, doucement.',
  'ca-va':          'Reçu, belle énergie.',
};

/* ------------------------------------------------------------ */
/* Echo titres — plus poétique                                  */
/* ------------------------------------------------------------ */
const ECHO_TITLES = {
  'pas-terrible':   { line1: 'Reste là.',      line2: 'On va y aller doucement.' },
  'ca-va-pas-trop': { line1: 'Pose-toi.',      line2: 'Tu veux faire quoi ?' },
  'ca-va':          { line1: 'Garde-la.',      line2: 'Un petit geste pour rester ?' },
};

/* ------------------------------------------------------------ */
/* Action labels — humanisé (pas "breath" / "write")            */
/* ------------------------------------------------------------ */
const ACTION_HUMAN = {
  breath:   'Tu as respiré',
  write:    'Tu as posé tes mots',
  bouee:    'Tu as fait un petit geste',
  citation: 'Tu as gardé une parole',
};

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

/* ------------------------------------------------------------ */
/* Keyframes injectés une seule fois                            */
/* ------------------------------------------------------------ */
const CHECKIN_KEYFRAMES = `
@keyframes checkinFadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes checkinFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes checkinDotPulse {
  0%, 100% { transform: scale(1);   opacity: 0.85; }
  50%      { transform: scale(1.18); opacity: 1; }
}
@keyframes checkinAnchorBreath {
  0%, 100% { transform: scale(1);   opacity: 0.55; }
  50%      { transform: scale(1.4); opacity: 0.95; }
}
@media (prefers-reduced-motion: reduce) {
  .checkin-fade-up, .checkin-fade-in { animation: none !important; opacity: 1 !important; transform: none !important; }
  .checkin-dot-pulse, .checkin-anchor { animation: none !important; }
}
`;

function useCheckinKeyframes() {
  useEffect(() => {
    const id = 'checkin-v6-keyframes';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = CHECKIN_KEYFRAMES;
    document.head.appendChild(style);
    return () => {
      const node = document.getElementById(id);
      if (node) node.remove();
    };
  }, []);
}

/* ------------------------------------------------------------ */
/* Composant racine                                             */
/* ------------------------------------------------------------ */
export default function Checkin() {
  useCheckinKeyframes();

  const [step, setStep] = useState(() => (hasCheckinToday() ? 'done' : 'question'));
  const [currentCheckin, setCurrentCheckin] = useState(() => getTodayCheckin());
  const [activeAction, setActiveAction] = useState(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

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

  const handleBackToMood = () => {
    haptic(2);
    setStep('question');
  };

  const handleContinue = () => {
    haptic(2);
    setStep('echo');
  };

  return (
    <div style={{ minHeight: '100dvh', padding: '40px 20px 100px', display: 'flex', flexDirection: 'column' }}>
      {step === 'question' && <QuestionStep onPick={handlePickMood} />}
      {step === 'echo'     && <EchoStep mood={currentCheckin?.mood} citation={currentCheckin?.citation} onPick={handlePickAction} onBack={handleBackToMood} />}
      {step === 'action'   && <ActionStep option={activeAction} mood={currentCheckin?.mood} onDone={handleActionDone} onCancel={() => setStep('echo')} />}
      {step === 'done'     && <DoneStep checkin={currentCheckin} onContinue={handleContinue} onViewPast={() => setTimelineOpen(true)} />}
      <Timeline open={timelineOpen} onClose={() => setTimelineOpen(false)} />
    </div>
  );
}

/* ============================================================ */
/* État QUESTION                                                */
/* ============================================================ */
function QuestionStep({ onPick }) {
  const profile = getProfile();
  const prenom = profile?.preferences?.prenom;
  const today = new Date();
  const dayName = today.toLocaleDateString('fr-FR', { weekday: 'long' });
  const dateLong = today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  // Citation présence discrète — déterministe par jour
  const citationRef = useRef(null);
  if (citationRef.current === null) {
    try { citationRef.current = pickEchoCitation('ca-va-pas-trop'); } catch { citationRef.current = null; }
  }
  const citation = citationRef.current;

  const subtext = `${greet()}${prenom ? `, ${prenom}` : ''} · ${dayName} ${dateLong}`;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div
        className="checkin-fade-up"
        style={{
          fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
          opacity: 0.55, marginBottom: 10,
          animation: 'checkinFadeUp 420ms ease-out both',
        }}
      >
        {subtext}
      </div>

      <h1
        className="checkin-fade-up"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 32,
          lineHeight: 1.2,
          marginBottom: 8,
          color: 'var(--ink)',
          animation: 'checkinFadeUp 520ms ease-out 80ms both',
        }}
      >
        Et toi,<br/>ça va vraiment ?
      </h1>

      <p
        className="checkin-fade-up"
        style={{
          fontSize: 13, opacity: 0.55, marginBottom: 32, lineHeight: 1.5,
          animation: 'checkinFadeUp 520ms ease-out 160ms both',
        }}
      >
        Prends le temps. Pas de bonne réponse.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {['ca-va', 'ca-va-pas-trop', 'pas-terrible'].map((mood, i) => {
          const opt = MOOD_META[mood];
          return (
            <button
              key={mood}
              onClick={() => onPick(mood)}
              className="checkin-fade-up"
              style={{
                minHeight: 64,
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
                animation: `checkinFadeUp 520ms ease-out ${240 + i * 90}ms both`,
                transition: 'transform 160ms ease, box-shadow 200ms ease, background 200ms ease',
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.985)'; }}
              onMouseUp={(e)   => { e.currentTarget.style.transform = ''; }}
              onMouseLeave={(e)=> { e.currentTarget.style.transform = ''; }}
              onTouchStart={(e)=> { e.currentTarget.style.transform = 'scale(0.985)'; }}
              onTouchEnd={(e)  => { e.currentTarget.style.transform = ''; }}
            >
              <span style={{ fontSize: 24, lineHeight: 1 }} aria-hidden="true">{opt.emoji}</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 16, lineHeight: 1.2 }}>{opt.label}</span>
                <span style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: 'italic',
                  fontSize: 12,
                  opacity: 0.55,
                  marginTop: 3,
                  color: MOOD_COLORS[mood],
                }}>
                  {opt.sublabel}
                </span>
              </div>
              <span aria-hidden="true" style={{ marginLeft: 'auto', opacity: 0.35 }}>→</span>
            </button>
          );
        })}
      </div>

      {citation && (
        <div
          className="checkin-fade-in"
          style={{
            marginTop: 'auto',
            paddingTop: 32,
            opacity: 0.6,
            textAlign: 'center',
            animation: 'checkinFadeIn 800ms ease-out 700ms both',
          }}
        >
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 13,
            lineHeight: 1.55,
            margin: 0,
          }}>
            « {citation.text} »
          </p>
          {citation.author && (
            <p style={{ fontSize: 10, opacity: 0.6, marginTop: 6, letterSpacing: '0.04em' }}>
              — {citation.author}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================ */
/* État ECHO                                                    */
/* ============================================================ */
function EchoStep({ mood, citation, onPick, onBack }) {
  const options = ECHO_MENU[mood] || ECHO_MENU['ca-va-pas-trop'];
  const moodLabel = MOOD_LABELS[mood];
  const moodColor = MOOD_COLORS[mood];
  const header = ECHO_HEADERS[mood] || 'Reçu.';
  const titles = ECHO_TITLES[mood] || ECHO_TITLES['ca-va-pas-trop'];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Bouton retour discret */}
      <button
        onClick={onBack}
        aria-label="Revenir au choix de l'humeur"
        className="checkin-fade-in"
        style={{
          alignSelf: 'flex-start',
          minWidth: 44, minHeight: 44,
          marginLeft: -8, marginBottom: 4,
          padding: 8,
          background: 'transparent',
          border: 'none',
          color: 'var(--ink)',
          opacity: 0.5,
          fontSize: 18,
          fontFamily: 'inherit',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center',
          animation: 'checkinFadeIn 380ms ease-out both',
        }}
      >
        ←
      </button>

      <div
        className="checkin-fade-up"
        style={{
          display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 8,
          padding: '5px 12px',
          background: `${moodColor}20`,
          color: moodColor,
          borderRadius: 999,
          fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
          marginBottom: 14,
          animation: 'checkinFadeUp 420ms ease-out 60ms both',
        }}
      >
        <span
          className="checkin-dot-pulse"
          aria-hidden="true"
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: moodColor,
            animation: 'checkinDotPulse 2.6s ease-in-out infinite',
          }}
        />
        {header} {moodLabel.toLowerCase()}
      </div>

      <h1
        className="checkin-fade-up"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 28,
          lineHeight: 1.2,
          marginBottom: 8,
          color: 'var(--ink)',
          animation: 'checkinFadeUp 520ms ease-out 140ms both',
        }}
      >
        {titles.line1}<br/>{titles.line2}
      </h1>
      <p
        className="checkin-fade-up"
        style={{
          fontSize: 13, opacity: 0.55, marginBottom: 24,
          animation: 'checkinFadeUp 520ms ease-out 220ms both',
        }}
      >
        3 options. Tu peux aussi juste fermer.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((opt, i) => (
          <button
            key={opt.id}
            onClick={() => onPick(opt)}
            className="checkin-fade-up"
            style={{
              minHeight: 64,
              padding: '14px 16px 14px 18px',
              background: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(0,0,0,0.06)',
              borderLeft: `3px solid ${moodColor}aa`,
              borderRadius: 14,
              fontSize: 14,
              fontFamily: 'inherit',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              color: 'var(--ink)',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              animation: `checkinFadeUp 520ms ease-out ${280 + i * 80}ms both`,
              transition: 'transform 160ms ease, background 200ms ease',
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.985)'; }}
            onMouseUp={(e)   => { e.currentTarget.style.transform = ''; }}
            onMouseLeave={(e)=> { e.currentTarget.style.transform = ''; }}
            onTouchStart={(e)=> { e.currentTarget.style.transform = 'scale(0.985)'; }}
            onTouchEnd={(e)  => { e.currentTarget.style.transform = ''; }}
          >
            <span
              aria-hidden="true"
              style={{
                fontSize: 20,
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                background: `${moodColor}18`,
                color: moodColor,
                flexShrink: 0,
              }}
            >
              {opt.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, lineHeight: 1.25 }}>{opt.label}</div>
              <div style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 12,
                opacity: 0.6,
                marginTop: 2,
              }}>
                {opt.sublabel}
              </div>
            </div>
            <span aria-hidden="true" style={{ opacity: 0.35 }}>→</span>
          </button>
        ))}
      </div>

      {citation && (
        <div
          className="checkin-fade-in"
          style={{
            marginTop: 'auto', paddingTop: 28, opacity: 0.7, textAlign: 'center',
            animation: 'checkinFadeIn 800ms ease-out 600ms both',
          }}
        >
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 14, lineHeight: 1.55, margin: 0,
          }}>
            « {citation.text} »
          </p>
          {citation.author && (
            <p style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>— {citation.author}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================ */
/* État ACTION — dispatcher (NE PAS toucher la logique)         */
/* ============================================================ */
function ActionStep({ option, mood, onDone, onCancel }) {
  if (!option) return null;

  if (option.kind === 'respi-478' || option.kind === 'respi-55' || option.kind === 'respi-46') {
    const rhythm = option.kind === 'respi-478' ? '4-7-8' : option.kind === 'respi-46' ? '4-6' : '5-5';
    return (
      <BreathingPause
        rhythm={rhythm}
        accent="rose"
        onComplete={(payload) => onDone(payload)}
        onClose={onCancel}
      />
    );
  }

  if (option.kind === 'write') {
    return (
      <Carnet
        mood={mood}
        onSave={(payload) => onDone(payload)}
        onClose={onCancel}
      />
    );
  }

  if (option.kind === 'bouee') {
    return (
      <BoueeModal
        open={true}
        levels={option.boueeLevel}
        onDone={(payload) => onDone(payload)}
        onClose={onCancel}
      />
    );
  }

  if (option.kind === 'citation') {
    return (
      <CitationKeepModal
        open={true}
        onDone={(payload) => onDone(payload)}
        onClose={onCancel}
      />
    );
  }

  return null;
}

/* ============================================================ */
/* État DONE                                                    */
/* ============================================================ */
function DoneStep({ checkin, onContinue, onViewPast }) {
  const moodColor = checkin?.mood ? MOOD_COLORS[checkin.mood] : '#aac6dd';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Anchor : petit point lumineux qui respire — signe que la journée est posée */}
      <div
        className="checkin-fade-in"
        style={{
          alignSelf: 'flex-start',
          marginBottom: 18,
          width: 22, height: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'checkinFadeIn 600ms ease-out both',
        }}
        aria-hidden="true"
      >
        <span
          className="checkin-anchor"
          style={{
            width: 10, height: 10,
            borderRadius: '50%',
            background: moodColor,
            boxShadow: `0 0 16px ${moodColor}88, 0 0 4px ${moodColor}`,
            animation: 'checkinAnchorBreath 4.2s ease-in-out infinite',
          }}
        />
      </div>

      <h1
        className="checkin-fade-up"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 28,
          lineHeight: 1.2,
          marginBottom: 8,
          color: 'var(--ink)',
          animation: 'checkinFadeUp 520ms ease-out 80ms both',
        }}
      >
        Tu t'es posé·e<br/>aujourd'hui.
      </h1>
      <p
        className="checkin-fade-up"
        style={{
          fontSize: 13, opacity: 0.6, marginBottom: 32,
          animation: 'checkinFadeUp 520ms ease-out 160ms both',
        }}
      >
        À demain. Sauf si tu veux revenir.
      </p>

      {checkin?.actions?.length > 0 && (
        <div
          className="checkin-fade-up"
          style={{
            marginBottom: 32,
            padding: '16px 18px',
            background: 'rgba(255,255,255,0.5)',
            border: `1px solid ${moodColor}22`,
            borderLeft: `3px solid ${moodColor}aa`,
            borderRadius: 14,
            animation: 'checkinFadeUp 520ms ease-out 240ms both',
          }}
        >
          <div style={{
            fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
            opacity: 0.55, marginBottom: 10,
          }}>
            Ce que tu as fait
          </div>
          {checkin.actions.map((a, i) => (
            <div key={i} style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 15,
              lineHeight: 1.4,
              opacity: 0.88,
              marginTop: i === 0 ? 0 : 6,
              display: 'flex', alignItems: 'baseline', gap: 8,
            }}>
              <span style={{
                color: moodColor,
                fontSize: 11,
                fontStyle: 'normal',
                opacity: 0.85,
              }} aria-hidden="true">✦</span>
              {ACTION_HUMAN[a.type] || a.type}
            </div>
          ))}
        </div>
      )}

      {checkin?.citation && (
        <div
          className="checkin-fade-in"
          style={{
            opacity: 0.85,
            animation: 'checkinFadeIn 800ms ease-out 360ms both',
          }}
        >
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 16, lineHeight: 1.55, margin: 0,
          }}>
            « {checkin.citation.text} »
          </p>
          {checkin.citation.author && (
            <p style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>— {checkin.citation.author}</p>
          )}
        </div>
      )}

      {/* CTAs — Voir le passé en primaire calme, Faire autre chose en secondaire */}
      <div
        className="checkin-fade-up"
        style={{
          marginTop: 'auto',
          display: 'flex', flexDirection: 'column', gap: 8,
          animation: 'checkinFadeUp 520ms ease-out 480ms both',
        }}
      >
        {onViewPast && (
          <button
            onClick={onViewPast}
            style={{
              minHeight: 52,
              background: 'rgba(255,255,255,0.6)',
              color: 'var(--ink)',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 14,
              fontFamily: 'inherit',
              fontSize: 14,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'transform 160ms ease, background 200ms ease',
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.985)'; }}
            onMouseUp={(e)   => { e.currentTarget.style.transform = ''; }}
            onMouseLeave={(e)=> { e.currentTarget.style.transform = ''; }}
            onTouchStart={(e)=> { e.currentTarget.style.transform = 'scale(0.985)'; }}
            onTouchEnd={(e)  => { e.currentTarget.style.transform = ''; }}
          >
            Voir le passé →
          </button>
        )}
        <button
          onClick={onContinue}
          style={{
            minHeight: 44,
            background: 'transparent',
            color: 'var(--ink)',
            border: 'none',
            opacity: 0.6,
            fontFamily: 'inherit',
            fontSize: 13,
            cursor: 'pointer',
            transition: 'opacity 180ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
        >
          Faire autre chose
        </button>
      </div>
    </div>
  );
}
