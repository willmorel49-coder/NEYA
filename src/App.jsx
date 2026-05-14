import { useState, useEffect } from 'react';

// ════════════════════════════════════════════════════════════
// NÉYA V1 — Apple-grade pilot deck
// Splash → Onboarding(3) → Quiz → Result → Home + EspaceVrai + Cocon
// ════════════════════════════════════════════════════════════

const B = '/';

const ARCHETYPES = {
  resilience: {
    key: 'resilience',
    name: 'Résilience',
    spirit: 'Phoenix',
    color: '#E8B870',
    bg: B + 'bg-feu.avif',
    photo: B + 'spirit-resilience.avif',
    profil: 'Le Phoenix qui se reconstruit',
    chemin: 'Ton chemin est celui de la traversée',
    forces: [
      'Tu te relèves toujours',
      'Tu transmutes la douleur',
      'Tu trouves la lumière dans la nuit',
    ],
  },
  presence: {
    key: 'presence',
    name: 'Présence',
    spirit: 'Cerf',
    color: '#3AA8D8',
    bg: B + 'bg-eau.avif',
    photo: B + 'spirit-presence.avif',
    profil: 'Le Cerf de la pleine conscience',
    chemin: 'Ton chemin est celui de l’ici et maintenant',
    forces: [
      'Tu habites l’instant',
      'Tu sens avant de penser',
      'Tu offres ta présence en cadeau',
    ],
  },
  sagesse: {
    key: 'sagesse',
    name: 'Sagesse',
    spirit: 'Loup',
    color: '#9F7AD4',
    bg: B + 'bg-cosmos.avif',
    photo: B + 'spirit-sagesse.avif',
    profil: 'Le Loup qui voit clair',
    chemin: 'Ton chemin est celui de la compréhension',
    forces: [
      'Tu observes avec acuité',
      'Tu prends du recul',
      'Tu accompagnes les autres',
    ],
  },
  lumiere: {
    key: 'lumiere',
    name: 'Lumière',
    spirit: 'Ours',
    color: '#4A8B68',
    bg: B + 'bg-foret.avif',
    photo: B + 'spirit-lumiere.avif',
    profil: 'L’Ours ancré dans la lumière',
    chemin: 'Ton chemin est celui de la stabilité douce',
    forces: [
      'Tu ancres ceux qui vacillent',
      'Tu protèges sans bruit',
      'Tu rayonnes par ta seule présence',
    ],
  },
};

const QUIZ = [
  {
    bg: B + 'bg-cosmos.avif',
    q: 'Quand tout vacille, qu’est-ce qui te porte ?',
    choices: [
      { t: 'Je traverse, je me relève toujours.', a: 'resilience' },
      { t: 'Je ressens, je suis là, c’est tout.', a: 'presence' },
      { t: 'Je comprends, je prends de la hauteur.', a: 'sagesse' },
      { t: 'Je m’ancre, je reste stable.', a: 'lumiere' },
    ],
  },
  {
    bg: B + 'bg-feu.avif',
    q: 'Ce qui te fait sentir vivant·e ?',
    choices: [
      { t: 'Renaître après la chute.', a: 'resilience' },
      { t: 'L’instant pur, sans pensée.', a: 'presence' },
      { t: 'Comprendre l’invisible.', a: 'sagesse' },
      { t: 'Sentir mes racines.', a: 'lumiere' },
    ],
  },
  {
    bg: B + 'bg-eau.avif',
    q: 'Ta façon d’accompagner les autres ?',
    choices: [
      { t: 'Leur montrer qu’on peut se relever.', a: 'resilience' },
      { t: 'Être là. Présence pleine.', a: 'presence' },
      { t: 'Écouter, éclairer.', a: 'sagesse' },
      { t: 'Rassurer, rayonner.', a: 'lumiere' },
    ],
  },
  {
    bg: B + 'bg-vide.avif',
    q: 'Le rythme qui te ressemble ?',
    choices: [
      { t: 'Pulsé, intense, brûlant.', a: 'resilience' },
      { t: 'Calme, en suspension.', a: 'presence' },
      { t: 'Lent, méditatif, profond.', a: 'sagesse' },
      { t: 'Stable, doux, continu.', a: 'lumiere' },
    ],
  },
  {
    bg: B + 'bg-foret.avif',
    q: 'Ce que tu offres sans le savoir ?',
    choices: [
      { t: 'La preuve qu’on peut traverser.', a: 'resilience' },
      { t: 'L’invitation à ralentir.', a: 'presence' },
      { t: 'La clarté qui dénoue.', a: 'sagesse' },
      { t: 'La chaleur qui rassure.', a: 'lumiere' },
    ],
  },
];

const COCON_ITEMS = [
  { key: 'bougie', icon: '✺', label: 'Bougie' },
  { key: 'cristal', icon: '◇', label: 'Cristal' },
  { key: 'plante', icon: '❦', label: 'Plante' },
  { key: 'totem', icon: '◈', label: 'Totem' },
  { key: 'portail', icon: '○', label: 'Portail' },
];

const haptic = (p) => { try { navigator.vibrate?.(p); } catch {} };

const greet = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Cette nuit';
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bel après-midi';
  if (h < 22) return 'Bonsoir';
  return 'Bonne nuit';
};

const ls = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ════════════════════════════════════════════════════════════
// Atomes
// ════════════════════════════════════════════════════════════

function Stage({ bg, children, vignetteStrength = 1, dimBg = 0 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: dimBg ? `brightness(${1 - dimBg})` : 'none',
          transition: 'filter 600ms var(--ease-out-ios)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to top, rgba(5,8,16,${0.88 * vignetteStrength}) 0%, rgba(5,8,16,${0.55 * vignetteStrength}) 28%, rgba(5,8,16,${0.18 * vignetteStrength}) 60%, rgba(5,8,16,${0.04 * vignetteStrength}) 100%)`,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
    </div>
  );
}

function CapsLabel({ children, style }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-caption)',
        fontWeight: 600,
        letterSpacing: 'var(--tracking-caps)',
        textTransform: 'uppercase',
        color: 'var(--ink-soft)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Hairline({ width = 22, color, style }) {
  return (
    <span
      style={{
        display: 'block',
        width,
        height: 1,
        background: color || 'var(--line-strong)',
        ...style,
      }}
    />
  );
}

function Action({ children, onClick, primary, style, disabled }) {
  return (
    <button
      data-press
      onClick={onClick}
      disabled={disabled}
      style={{
        appearance: 'none',
        background: primary ? 'var(--ink)' : 'transparent',
        color: primary ? 'var(--void)' : 'var(--ink)',
        border: primary ? 'none' : '1px solid var(--line-strong)',
        borderRadius: 'var(--r-pill)',
        padding: '15px 36px',
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: 'var(--tracking-caps)',
        textTransform: 'uppercase',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'transform 120ms var(--ease-out-ios), background 200ms var(--ease-out-ios)',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ════════════════════════════════════════════════════════════
// SPLASH
// ════════════════════════════════════════════════════════════

function Splash({ onContinue }) {
  const [show, setShow] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 80);
    const t2 = setTimeout(() => setShowHint(true), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handle = () => { haptic(8); onContinue(); };

  return (
    <div onClick={handle} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}>
      <Stage bg={B + 'bg-splash.avif'} vignetteStrength={1.05}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            opacity: show ? 1 : 0,
            transition: 'opacity 1400ms var(--ease-out-ios)',
          }}
        >
          <CapsLabel style={{ marginBottom: 32 }}>NÉYA · MMXXVI</CapsLabel>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(56px, 18vw, 96px)',
              fontWeight: 200,
              letterSpacing: '0.04em',
              color: 'var(--ink)',
              margin: 0,
              textAlign: 'center',
              lineHeight: 0.95,
            }}
          >
            NÉYA
          </h1>

          <Hairline width={48} style={{ margin: '32px 0 28px', background: 'var(--ink-faint)' }} />

          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(17px, 4.5vw, 21px)',
              fontWeight: 300,
              letterSpacing: '-0.012em',
              color: 'var(--ink-soft)',
              margin: 0,
              textAlign: 'center',
              maxWidth: 320,
              lineHeight: 1.4,
            }}
          >
            Et toi, ça va vraiment&nbsp;?
          </p>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 36px)',
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: showHint ? 1 : 0,
            transition: 'opacity 800ms var(--ease-out-ios)',
          }}
        >
          <CapsLabel style={{ color: 'var(--ink-faint)' }}>Touche pour entrer</CapsLabel>
        </div>
      </Stage>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ONBOARDING (3 sub-screens)
// ════════════════════════════════════════════════════════════

const OB_STEPS = [
  {
    bg: B + 'bg-brume.avif',
    label: 'Avant tout',
    title: 'Respire.',
    body: 'Tu n’as pas besoin d’aller bien pour commencer.',
    cta: 'Continuer',
  },
  {
    bg: B + 'bg-cosmos.avif',
    label: 'Cet espace',
    title: 'Pour ce que tu ressens vraiment.',
    body: 'Pas une appli de méditation. Pas un journal. Juste toi.',
    cta: 'Continuer',
  },
  {
    bg: B + 'bg-foret.avif',
    label: 'On commence',
    title: 'Apprenons à nous connaître.',
    body: 'Cinq questions courtes pour reconnaître ta couleur.',
    cta: 'Entrer',
  },
];

function Onboarding({ step, onNext }) {
  const s = OB_STEPS[step - 1];
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(false); const t = setTimeout(() => setShow(true), 120); return () => clearTimeout(t); }, [step]);

  const handle = () => { haptic(8); onNext(); };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Stage bg={s.bg}>
        <div
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 0px) + 24px)',
            left: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 2,
          }}
        >
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              style={{
                width: n === step ? 24 : 6,
                height: 2,
                background: n === step ? 'var(--ink)' : 'var(--ink-faint)',
                borderRadius: 1,
                transition: 'all 300ms var(--ease-out-ios)',
              }}
            />
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '32px 28px calc(env(safe-area-inset-bottom, 0px) + 32px)',
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 900ms var(--ease-out-ios), transform 900ms var(--ease-out-ios)',
          }}
        >
          <CapsLabel style={{ marginBottom: 16 }}>{s.label}</CapsLabel>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(38px, 10vw, 56px)',
              fontWeight: 300,
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--ink)',
              margin: 0,
              lineHeight: 1.05,
              maxWidth: 360,
            }}
          >
            {s.title}
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 17,
              fontWeight: 400,
              color: 'var(--ink-soft)',
              margin: '16px 0 36px',
              lineHeight: 1.5,
              maxWidth: 380,
            }}
          >
            {s.body}
          </p>

          <div style={{ display: 'flex' }}>
            <Action primary onClick={handle}>{s.cta}</Action>
          </div>
        </div>
      </Stage>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// QUIZ
// ════════════════════════════════════════════════════════════

function Quiz({ onComplete }) {
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState({ resilience: 0, presence: 0, sagesse: 0, lumiere: 0 });
  const [selected, setSelected] = useState(null);
  const [show, setShow] = useState(false);

  const q = QUIZ[idx];

  useEffect(() => {
    setShow(false);
    setSelected(null);
    const t = setTimeout(() => setShow(true), 60);
    return () => clearTimeout(t);
  }, [idx]);

  const pick = (i) => {
    if (selected !== null) return;
    setSelected(i);
    haptic(6);
    const choice = q.choices[i];
    const next = { ...scores, [choice.a]: scores[choice.a] + 1 };
    setScores(next);

    setTimeout(() => {
      if (idx === QUIZ.length - 1) {
        const winner = Object.entries(next).sort((a, b) => b[1] - a[1])[0][0];
        onComplete(winner);
      } else {
        setIdx(idx + 1);
      }
    }, 520);
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Stage bg={q.bg} vignetteStrength={1.05} dimBg={0.18}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: 'calc(env(safe-area-inset-top, 0px) + 28px) 24px calc(env(safe-area-inset-bottom, 0px) + 32px)',
            opacity: show ? 1 : 0,
            transition: 'opacity 600ms var(--ease-out-ios)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
            {QUIZ.map((_, i) => (
              <span
                key={i}
                style={{
                  flex: i === idx ? '1 1 auto' : '0 0 6px',
                  height: 2,
                  background: i <= idx ? 'var(--ink)' : 'var(--line)',
                  borderRadius: 1,
                  transition: 'all 400ms var(--ease-out-ios)',
                }}
              />
            ))}
          </div>

          <CapsLabel>Question {idx + 1} / {QUIZ.length}</CapsLabel>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 7vw, 34px)',
              fontWeight: 300,
              letterSpacing: 'var(--tracking-snug)',
              color: 'var(--ink)',
              margin: '20px 0 0',
              lineHeight: 1.20,
              maxWidth: 340,
            }}
          >
            {q.q}
          </h2>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.choices.map((c, i) => {
              const isSelected = selected === i;
              return (
                <button
                  key={i}
                  data-press
                  onClick={() => pick(i)}
                  disabled={selected !== null}
                  style={{
                    appearance: 'none',
                    textAlign: 'left',
                    padding: '18px 22px',
                    background: isSelected ? 'rgba(245,242,236,0.92)' : 'rgba(245,242,236,0.05)',
                    color: isSelected ? 'var(--void)' : 'var(--ink)',
                    border: `1px solid ${isSelected ? 'rgba(245,242,236,0.92)' : 'var(--line-strong)'}`,
                    borderRadius: 'var(--r-lg)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 17,
                    fontWeight: 400,
                    lineHeight: 1.4,
                    cursor: selected !== null ? 'default' : 'pointer',
                    transition: 'background 240ms var(--ease-out-ios), color 240ms var(--ease-out-ios), border-color 240ms var(--ease-out-ios)',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {c.t}
                </button>
              );
            })}
          </div>
        </div>
      </Stage>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// RESULT
// ════════════════════════════════════════════════════════════

function Result({ arch, onEnter }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => { setPhase(1); haptic([4, 80, 4]); }, 1800);
    const t2 = setTimeout(() => setPhase(2), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Stage bg={arch.bg} vignetteStrength={1.1}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '32px 28px calc(env(safe-area-inset-bottom, 0px) + 32px)',
          }}
        >
          <div
            style={{
              width: 132,
              height: 132,
              borderRadius: '50%',
              overflow: 'hidden',
              border: `1px solid ${arch.color}55`,
              boxShadow: `0 0 60px ${arch.color}33`,
              marginBottom: 32,
              opacity: 1,
              animation: 'fade-in 1100ms var(--ease-out-ios) both',
            }}
          >
            <img src={arch.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <CapsLabel style={{ color: arch.color, marginBottom: 14 }}>Ton archétype</CapsLabel>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 11vw, 56px)',
              fontWeight: 300,
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--ink)',
              margin: 0,
              textAlign: 'center',
              lineHeight: 1.05,
            }}
          >
            {arch.name}
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 17,
              color: 'var(--ink-soft)',
              margin: '12px 0 28px',
              textAlign: 'center',
              maxWidth: 320,
              lineHeight: 1.45,
            }}
          >
            {arch.profil} · {arch.spirit}
          </p>

          <Hairline width={32} style={{ background: `${arch.color}77`, marginBottom: 28 }} />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              marginBottom: 36,
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 900ms var(--ease-out-ios), transform 900ms var(--ease-out-ios)',
            }}
          >
            {arch.forces.map((f, i) => (
              <div
                key={i}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 15,
                  color: 'var(--ink)',
                  textAlign: 'center',
                  letterSpacing: '-0.005em',
                  opacity: 0.92,
                }}
              >
                {f}
              </div>
            ))}
          </div>

          <div
            style={{
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 700ms var(--ease-out-ios), transform 700ms var(--ease-out-ios)',
            }}
          >
            <Action primary onClick={() => { haptic(8); onEnter(); }}>
              Entrer dans ton espace
            </Action>
          </div>
        </div>
      </Stage>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// HOME
// ════════════════════════════════════════════════════════════

function Home({ arch, prenom, intention, setIntention, streak, presenceToday, openEspaceVrai, openCocon }) {
  const [editingIntention, setEditingIntention] = useState(false);
  const [tempIntention, setTempIntention] = useState(intention);

  useEffect(() => { setTempIntention(intention); }, [intention]);

  const saveIntention = () => {
    setIntention(tempIntention.trim());
    setEditingIntention(false);
    haptic(4);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--void)' }}>
      <Stage bg={arch.bg} vignetteStrength={1.25} dimBg={0.42}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div
            style={{
              padding: 'calc(env(safe-area-inset-top, 0px) + 16px) 24px 0',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <CapsLabel style={{ color: 'var(--ink-faint)' }}>
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </CapsLabel>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 32,
                  fontWeight: 300,
                  letterSpacing: 'var(--tracking-tight)',
                  color: 'var(--ink)',
                  margin: '6px 0 0',
                  lineHeight: 1.1,
                }}
              >
                {greet()}{prenom ? `, ${prenom}` : ''}
              </h1>
            </div>

            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                overflow: 'hidden',
                border: `1px solid ${arch.color}33`,
                flexShrink: 0,
                marginTop: 4,
              }}
            >
              <img src={arch.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          {/* Scrollable */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '28px 24px 120px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Intention */}
            <Card>
              <CapsLabel style={{ color: arch.color, marginBottom: 10 }}>Intention du jour</CapsLabel>
              {editingIntention ? (
                <div>
                  <textarea
                    autoFocus
                    value={tempIntention}
                    onChange={(e) => setTempIntention(e.target.value)}
                    placeholder="Pose ton intention…"
                    rows={2}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'var(--font-display)',
                      fontSize: 20,
                      fontWeight: 300,
                      letterSpacing: 'var(--tracking-snug)',
                      color: 'var(--ink)',
                      lineHeight: 1.35,
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <Action onClick={saveIntention} style={{ padding: '10px 22px', fontSize: 12 }}>Garder</Action>
                    <Action
                      onClick={() => { setTempIntention(intention); setEditingIntention(false); }}
                      style={{ padding: '10px 22px', fontSize: 12, border: '1px solid var(--line)' }}
                    >Annuler</Action>
                  </div>
                </div>
              ) : (
                <button
                  data-press
                  onClick={() => setEditingIntention(true)}
                  style={{
                    appearance: 'none',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    fontWeight: 300,
                    letterSpacing: 'var(--tracking-snug)',
                    lineHeight: 1.35,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {intention || (
                    <span style={{ color: 'var(--ink-whisper)' }}>
                      Touche pour poser ton intention…
                    </span>
                  )}
                </button>
              )}
            </Card>

            {/* EspaceVrai hero */}
            <button
              data-press
              onClick={() => { haptic(6); openEspaceVrai(); }}
              style={{
                appearance: 'none',
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${arch.color}1A, rgba(5,8,16,0.6))`,
                border: `1px solid ${arch.color}33`,
                borderRadius: 'var(--r-lg)',
                padding: '28px 24px',
                textAlign: 'left',
                color: 'var(--ink)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <CapsLabel style={{ color: arch.color, marginBottom: 12 }}>Maintenant</CapsLabel>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 26,
                  fontWeight: 300,
                  letterSpacing: 'var(--tracking-snug)',
                  lineHeight: 1.15,
                  marginBottom: 8,
                }}
              >
                Espace de présence
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                90 secondes pour revenir à toi. {presenceToday ? 'Tu y es déjà passé·e aujourd’hui.' : 'Touche pour commencer.'}
              </div>
            </button>

            {/* Cocon */}
            <button
              data-press
              onClick={() => { haptic(6); openCocon(); }}
              style={{
                appearance: 'none',
                background: 'rgba(245,242,236,0.04)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-lg)',
                padding: '22px 24px',
                textAlign: 'left',
                color: 'var(--ink)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                WebkitTapHighlightColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--r-md)',
                  background: 'rgba(245,242,236,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  color: arch.color,
                }}
              >
                ◇
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 400, letterSpacing: '-0.01em', marginBottom: 2 }}>
                  Mon Cocon
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)' }}>
                  Ton sanctuaire personnel
                </div>
              </div>
              <div style={{ color: 'var(--ink-whisper)', fontSize: 18 }}>›</div>
            </button>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Stat label="Présences" value={streak} />
              <Stat label="Aujourd’hui" value={presenceToday ? '✓' : '—'} />
              <Stat label="Force" value={arch.name} small />
            </div>

            {/* Coming soon */}
            <div style={{ marginTop: 24 }}>
              <CapsLabel style={{ color: 'var(--ink-faint)', marginBottom: 12 }}>Bientôt — V1.1</CapsLabel>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Routines', 'Quêtes', 'Voyage', 'Pratiques', 'Communauté', 'Boutique'].map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: '8px 14px',
                      background: 'rgba(245,242,236,0.04)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--r-pill)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 12,
                      color: 'var(--ink-faint)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* BottomNav */}
          <BottomNav
            arch={arch}
            onCocon={() => { haptic(4); openCocon(); }}
            onEspaceVrai={() => { haptic(6); openEspaceVrai(); }}
          />
        </div>
      </Stage>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: 'rgba(245,242,236,0.04)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-lg)',
        padding: '22px 24px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Stat({ label, value, small }) {
  return (
    <div
      style={{
        flex: 1,
        background: 'rgba(245,242,236,0.04)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-lg)',
        padding: '14px 16px',
      }}
    >
      <CapsLabel style={{ color: 'var(--ink-faint)', marginBottom: 6, fontSize: 10 }}>{label}</CapsLabel>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: small ? 14 : 22,
          fontWeight: 400,
          letterSpacing: '-0.01em',
          color: 'var(--ink)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function BottomNav({ arch, onCocon, onEspaceVrai }) {
  const tabs = [
    { key: 'home', label: 'Accueil', icon: '○' },
    { key: 'espacevrai', label: 'Présence', icon: '◉', center: true },
    { key: 'cocon', label: 'Cocon', icon: '◇' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
        left: 16,
        right: 16,
        background: 'rgba(11,16,32,0.86)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-pill)',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 10,
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          data-press
          onClick={() => {
            haptic(4);
            if (t.key === 'cocon') return onCocon();
            if (t.key === 'espacevrai') return onEspaceVrai();
          }}
          style={{
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            padding: '8px 14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            color: t.key === 'home' ? arch.color : 'var(--ink-soft)',
            fontFamily: 'var(--font-body)',
            WebkitTapHighlightColor: 'transparent',
            transition: 'color 200ms var(--ease-out-ios)',
          }}
        >
          <span style={{ fontSize: t.center ? 20 : 16, lineHeight: 1 }}>{t.icon}</span>
          <span style={{ fontSize: 10, letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase' }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ESPACE VRAI — bottom sheet 90s
// ════════════════════════════════════════════════════════════

function EspaceVrai({ arch, onClose, onComplete }) {
  const [phase, setPhase] = useState('intro');
  const [remaining, setRemaining] = useState(90);
  const [show, setShow] = useState(false);

  useEffect(() => { const t = setTimeout(() => setShow(true), 30); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (phase !== 'active') return;
    if (remaining <= 0) {
      setPhase('done');
      onComplete();
      haptic([8, 80, 8]);
      return;
    }
    const t = setTimeout(() => setRemaining(remaining - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, remaining]);

  const start = () => { haptic(6); setPhase('active'); };
  const close = () => { setShow(false); setTimeout(onClose, 280); };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(5,8,16,0.6)',
        zIndex: 100,
        opacity: show ? 1 : 0,
        transition: 'opacity 280ms var(--ease-out-ios)',
      }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '92dvh',
          background: 'var(--void)',
          borderRadius: 'var(--r-sheet) var(--r-sheet) 0 0',
          overflow: 'hidden',
          transform: show ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 420ms var(--ease-out-ios)',
        }}
      >
        <Stage bg={arch.bg} vignetteStrength={1.4} dimBg={0.55}>
          <div className="drag-handle" />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 24px calc(env(safe-area-inset-bottom, 0px) + 32px)',
              textAlign: 'center',
            }}
          >
            {phase === 'intro' && (
              <>
                <CapsLabel style={{ color: arch.color, marginBottom: 16 }}>Espace de présence</CapsLabel>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(30px, 8vw, 38px)',
                    fontWeight: 300,
                    letterSpacing: 'var(--tracking-tight)',
                    color: 'var(--ink)',
                    margin: 0,
                    lineHeight: 1.15,
                    maxWidth: 320,
                  }}
                >
                  90 secondes.<br />Juste être là.
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-soft)', margin: '20px 0 36px', maxWidth: 280, lineHeight: 1.5 }}>
                  Pas de respiration imposée. Pas de musique. Juste toi, pendant 90 secondes.
                </p>
                <Action primary onClick={start}>Commencer</Action>
              </>
            )}

            {phase === 'active' && (
              <>
                <div
                  style={{
                    width: 220,
                    height: 220,
                    borderRadius: '50%',
                    border: `1px solid ${arch.color}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 32,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: -16,
                      borderRadius: '50%',
                      border: `1px solid ${arch.color}22`,
                      animation: 'pulse-soft 6s ease-in-out infinite',
                    }}
                  />
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 64,
                      fontWeight: 200,
                      color: 'var(--ink)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {remaining}
                  </div>
                </div>
                <CapsLabel style={{ color: arch.color }}>Tu es là</CapsLabel>
              </>
            )}

            {phase === 'done' && (
              <>
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `${arch.color}22`,
                    border: `1px solid ${arch.color}66`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 24,
                    fontSize: 32,
                    color: arch.color,
                  }}
                >
                  ✓
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 28,
                    fontWeight: 300,
                    letterSpacing: 'var(--tracking-snug)',
                    color: 'var(--ink)',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Tu es passé·e par là.
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)', margin: '14px 0 32px' }}>
                  À demain peut-être.
                </p>
                <Action primary onClick={close}>Fermer</Action>
              </>
            )}

            <button
              data-press
              onClick={close}
              style={{
                position: 'absolute',
                top: 24,
                right: 20,
                appearance: 'none',
                background: 'rgba(245,242,236,0.08)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                color: 'var(--ink)',
                fontSize: 17,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              ×
            </button>
          </div>
        </Stage>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// COCON
// ════════════════════════════════════════════════════════════

function Cocon({ arch, prenom, setPrenom, onClose }) {
  const [show, setShow] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(prenom);
  const [placed, setPlaced] = useState(() => ls.get('neya_v1_cocon_placed', {}));

  useEffect(() => { const t = setTimeout(() => setShow(true), 30); return () => clearTimeout(t); }, []);
  useEffect(() => { setTempName(prenom); }, [prenom]);

  const close = () => { setShow(false); setTimeout(onClose, 320); };

  const togglePlaced = (k) => {
    const next = { ...placed, [k]: !placed[k] };
    setPlaced(next);
    ls.set('neya_v1_cocon_placed', next);
    haptic(4);
  };

  const saveName = () => {
    setPrenom(tempName.trim());
    setEditingName(false);
    haptic(4);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 200,
        background: 'var(--void)',
        opacity: show ? 1 : 0,
        transition: 'opacity 320ms var(--ease-out-ios)',
      }}
    >
      <Stage bg={arch.bg} vignetteStrength={1.35} dimBg={0.55}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 24px calc(env(safe-area-inset-bottom, 0px) + 28px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <button
              data-press
              onClick={close}
              style={{
                appearance: 'none',
                background: 'rgba(245,242,236,0.06)',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                color: 'var(--ink)',
                fontSize: 18,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              ‹
            </button>
            <CapsLabel style={{ color: 'var(--ink-soft)' }}>Sanctuaire</CapsLabel>
            <div style={{ width: 36 }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                overflow: 'hidden',
                border: `1px solid ${arch.color}55`,
                boxShadow: `0 0 48px ${arch.color}33`,
                marginBottom: 18,
              }}
            >
              <img src={arch.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {editingName ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <input
                  autoFocus
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Ton prénom"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--line-strong)',
                    outline: 'none',
                    fontFamily: 'var(--font-display)',
                    fontSize: 26,
                    fontWeight: 300,
                    letterSpacing: 'var(--tracking-tight)',
                    color: 'var(--ink)',
                    textAlign: 'center',
                    padding: '4px 8px',
                    width: 200,
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Action onClick={saveName} style={{ padding: '8px 18px', fontSize: 11 }}>Garder</Action>
                  <Action onClick={() => { setTempName(prenom); setEditingName(false); }} style={{ padding: '8px 18px', fontSize: 11, border: '1px solid var(--line)' }}>Annuler</Action>
                </div>
              </div>
            ) : (
              <button
                data-press
                onClick={() => setEditingName(true)}
                style={{
                  appearance: 'none',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  fontFamily: 'var(--font-display)',
                  fontSize: 26,
                  fontWeight: 300,
                  letterSpacing: 'var(--tracking-tight)',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {prenom || (
                  <span style={{ color: 'var(--ink-whisper)', fontSize: 18, fontWeight: 400 }}>
                    Touche pour poser ton prénom
                  </span>
                )}
              </button>
            )}

            <CapsLabel style={{ color: arch.color, marginTop: 12 }}>{arch.name}</CapsLabel>
          </div>

          <Hairline width={48} style={{ alignSelf: 'center', marginBottom: 28, background: 'var(--line-strong)' }} />

          <CapsLabel style={{ color: 'var(--ink-faint)', marginBottom: 16, textAlign: 'center' }}>
            Ton sanctuaire
          </CapsLabel>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {COCON_ITEMS.map((item, i) => {
              const isPlaced = placed[item.key];
              return (
                <button
                  key={item.key}
                  data-press
                  onClick={() => togglePlaced(item.key)}
                  style={{
                    gridColumn: i === 4 ? '1 / -1' : 'auto',
                    appearance: 'none',
                    background: isPlaced ? `${arch.color}1A` : 'rgba(245,242,236,0.04)',
                    border: `1px solid ${isPlaced ? arch.color + '55' : 'var(--line)'}`,
                    borderRadius: 'var(--r-lg)',
                    padding: '20px 18px',
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: 'inherit',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'background 240ms var(--ease-out-ios), border-color 240ms var(--ease-out-ios)',
                  }}
                >
                  <div style={{ fontSize: 26, color: isPlaced ? arch.color : 'var(--ink-soft)' }}>{item.icon}</div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 15,
                      fontWeight: 400,
                      letterSpacing: '-0.005em',
                      color: isPlaced ? 'var(--ink)' : 'var(--ink-soft)',
                    }}
                  >
                    {item.label}
                  </div>
                  <CapsLabel style={{ color: isPlaced ? arch.color : 'var(--ink-faint)', fontSize: 9, marginTop: 2 }}>
                    {isPlaced ? '✓ Posé' : 'Toucher'}
                  </CapsLabel>
                </button>
              );
            })}
          </div>

          <div style={{ height: 32 }} />

          <CapsLabel style={{ color: 'var(--ink-faint)', marginBottom: 12, textAlign: 'center' }}>Souvenir</CapsLabel>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 300,
              letterSpacing: '-0.01em',
              color: 'var(--ink-soft)',
              textAlign: 'center',
              lineHeight: 1.45,
              margin: 0,
              maxWidth: 320,
              alignSelf: 'center',
            }}
          >
            {arch.chemin}.
          </p>

          <div style={{ height: 24 }} />
        </div>
      </Stage>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════

export default function App() {
  const [screen, setScreen] = useState(() => {
    const arch = ls.get('neya_v1_archetype', null);
    return arch ? 'home' : 'splash';
  });
  const [archetype, setArchetype] = useState(() => ls.get('neya_v1_archetype', null));
  const [prenom, setPrenom] = useState(() => ls.get('neya_v1_prenom', ''));
  const [intention, setIntention] = useState(() => ls.get('neya_v1_intention', ''));
  const [streak, setStreak] = useState(() => ls.get('neya_v1_streak', 0));
  const [presenceToday, setPresenceToday] = useState(() => {
    const last = ls.get('neya_v1_last_presence', '');
    return last === new Date().toDateString();
  });
  const [espaceVraiOpen, setEspaceVraiOpen] = useState(false);
  const [coconOpen, setCoconOpen] = useState(false);

  const arch = archetype ? ARCHETYPES[archetype] : null;

  const completeQuiz = (winner) => {
    setArchetype(winner);
    ls.set('neya_v1_archetype', winner);
    setScreen('result');
    haptic([8, 60, 8]);
  };

  const enterApp = () => {
    setScreen('home');
    haptic(8);
  };

  const markPresence = () => {
    const today = new Date().toDateString();
    if (presenceToday) return;
    setPresenceToday(true);
    ls.set('neya_v1_last_presence', today);
    const prev = ls.get('neya_v1_last_presence_prev', '');
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = prev === yesterday ? streak + 1 : 1;
    setStreak(newStreak);
    ls.set('neya_v1_streak', newStreak);
    ls.set('neya_v1_last_presence_prev', today);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {screen === 'splash' && <Splash onContinue={() => setScreen('ob1')} />}
      {screen === 'ob1' && <Onboarding step={1} onNext={() => setScreen('ob2')} />}
      {screen === 'ob2' && <Onboarding step={2} onNext={() => setScreen('ob3')} />}
      {screen === 'ob3' && <Onboarding step={3} onNext={() => setScreen('quiz')} />}
      {screen === 'quiz' && <Quiz onComplete={completeQuiz} />}
      {screen === 'result' && arch && <Result arch={arch} onEnter={enterApp} />}
      {screen === 'home' && arch && (
        <Home
          arch={arch}
          prenom={prenom}
          intention={intention}
          setIntention={(v) => { setIntention(v); ls.set('neya_v1_intention', v); }}
          streak={streak}
          presenceToday={presenceToday}
          openEspaceVrai={() => setEspaceVraiOpen(true)}
          openCocon={() => setCoconOpen(true)}
        />
      )}

      {espaceVraiOpen && arch && (
        <EspaceVrai arch={arch} onClose={() => setEspaceVraiOpen(false)} onComplete={markPresence} />
      )}

      {coconOpen && arch && (
        <Cocon
          arch={arch}
          prenom={prenom}
          setPrenom={(v) => { setPrenom(v); ls.set('neya_v1_prenom', v); }}
          onClose={() => setCoconOpen(false)}
        />
      )}
    </div>
  );
}
