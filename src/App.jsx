import { useState, useEffect, useCallback } from 'react'

const B = import.meta.env.BASE_URL

// ─── ARCHÉTYPES ───────────────────────────────────────────────────────────────

const ARCHETYPES = {
  resilience: {
    profil: 'Porteur·se de Feu',
    animal: 'L\'Aigle intérieur',
    bg: 'bg-feu.png',
    color: '#f59e0b',
    shadow: 'rgba(245,158,11,0.4)',
    forces: ['Courage', 'Transformation', 'Détermination', 'Force intérieure'],
    desc: `Tu avances même quand la route est difficile. En toi vit une flamme que rien n'éteint — une force tranquille qui transforme chaque obstacle en passage vers quelque chose de plus grand.\n\nTon chemin : nourrir ce feu intérieur sans te brûler, et offrir ta lumière à ceux qui en ont besoin.`,
  },
  presence: {
    profil: 'Ancreur·euse de Présence',
    animal: 'Le Cerf des eaux',
    bg: 'bg-eau.png',
    color: '#14b8a6',
    shadow: 'rgba(20,184,166,0.4)',
    forces: ['Douceur', 'Harmonie', 'Ancrage', 'Empathie'],
    desc: `Tu es un·e bâtisseur·se de paix intérieure. Ton calme profond inspire ceux qui t'entourent. Doté·e d'une grande sagesse intuitive, tu sais écouter ce qui est essentiel, même dans le tumulte.\n\nTon chemin : préserver ton espace intérieur, et rayonner naturellement autour de toi.`,
  },
  sagesse: {
    profil: 'Éveilleur·euse de Sens',
    animal: 'Le Loup de la brume',
    bg: 'bg-brume.png',
    color: '#6366f1',
    shadow: 'rgba(99,102,241,0.4)',
    forces: ['Intuition', 'Profondeur', 'Perception', 'Sagesse'],
    desc: `Tu lis ce que les autres ne voient pas. Dans le silence, tu captes des vérités que peu peuvent entendre. Ta profondeur est une forme rare et précieuse de lumière.\n\nTon chemin : faire confiance à ton intelligence intérieure — elle ne t'a jamais vraiment trompé·e.`,
  },
  lumiere: {
    profil: 'Créateur·trice de Lumière',
    animal: 'L\'Ours lumineux',
    bg: 'bg-foret.png',
    color: '#ec4899',
    shadow: 'rgba(236,72,153,0.4)',
    forces: ['Créativité', 'Joie', 'Confiance', 'Abondance'],
    desc: `Tu transformes tout ce que tu touches. Ta joie est contagieuse, ta créativité infinie. Là où tu passes, quelque chose de nouveau et de beau prend vie naturellement.\n\nTon chemin : ne jamais retenir ta lumière — le monde en a profondément besoin.`,
  },
}

// ─── QUESTIONS ────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    bg: 'bg-cosmos.png',
    title: "Avancer dans l'inconnu...",
    text: "Quand tu avances vers l'inconnu, quelle force intérieure te guide naturellement ?",
    choices: [
      { text: "Mon envie d'agir et d'explorer", type: 'resilience' },
      { text: 'Ma capacité à prendre du recul', type: 'presence' },
      { text: 'Ma lecture des signes subtils', type: 'sagesse' },
      { text: 'Ma fidélité à mon intuition profonde', type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-feu.png',
    title: 'Face au changement de cap...',
    text: "Quand la vie t'amène à changer de cap, comment réagis-tu intérieurement ?",
    choices: [
      { text: "Avec enthousiasme et envie de découvrir", type: 'resilience' },
      { text: 'Avec prudence, en analysant ce qui est en jeu', type: 'presence' },
      { text: 'Avec adaptabilité en suivant mon ressenti', type: 'sagesse' },
      { text: "Avec besoin de temps pour intégrer", type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-eau.png',
    title: 'Face au ralentissement...',
    text: "Quand la vie t'invite à ralentir, quelle est ta réponse intérieure ?",
    choices: [
      { text: 'Ressentir une tension et vouloir agir', type: 'resilience' },
      { text: "Accueillir ce temps comme une étape du voyage", type: 'presence' },
      { text: 'Me relier à ce qui mûrit en moi', type: 'sagesse' },
      { text: "M'abandonner avec gratitude au rythme naturel", type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-foret.png',
    title: 'Ta vraie nature...',
    text: 'Si tu pouvais exprimer ta vraie nature sans masque ni peur, quelle version de toi prendrait vie ?',
    choices: [
      { text: 'Celui/celle qui ose créer et réaliser sans retenue', type: 'resilience' },
      { text: 'Celui/celle qui vit en profonde harmonie avec ses valeurs', type: 'presence' },
      { text: 'Celui/celle qui avance avec profondeur et clarté', type: 'sagesse' },
      { text: 'Celui/celle qui suit sa voie avec joie et confiance', type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-brume.png',
    title: 'Dans les moments de doute...',
    text: "Quand le doute s'installe, qu'est-ce qui te recentre ?",
    choices: [
      { text: 'Agir, même imparfaitement', type: 'resilience' },
      { text: 'Revenir à ce qui me stabilise vraiment', type: 'presence' },
      { text: 'Écouter ce que mon corps ressent', type: 'sagesse' },
      { text: 'Chercher le sens caché de ce moment', type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-cosmos.png',
    title: 'Ta relation aux autres...',
    text: 'Dans une relation profonde, quel est ton rôle naturel ?',
    choices: [
      { text: "Inspirer et entraîner les autres vers l'avant", type: 'resilience' },
      { text: "Créer un espace de sécurité et d'écoute", type: 'presence' },
      { text: 'Apporter de la clarté dans les moments complexes', type: 'sagesse' },
      { text: 'Nourrir la connexion avec douceur et constance', type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-feu.png',
    title: "Face à l'adversité...",
    text: "Quand tout semble s'effondrer, qu'est-ce qui reste debout en toi ?",
    choices: [
      { text: 'Ma volonté de me relever coûte que coûte', type: 'resilience' },
      { text: 'Mon calme intérieur que rien ne peut briser', type: 'presence' },
      { text: 'Ma capacité à comprendre ce qui se passe vraiment', type: 'sagesse' },
      { text: 'Ma foi en la vie et en ce qui vient', type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-eau.png',
    title: 'Ta façon de ressentir...',
    text: 'Comment vis-tu principalement tes émotions ?',
    choices: [
      { text: "Elles m'habitent intensément et me mettent en mouvement", type: 'resilience' },
      { text: 'Je les ressens profondément mais les garde souvent pour moi', type: 'presence' },
      { text: "Elles m'informent sur ce qui est vrai pour moi", type: 'sagesse' },
      { text: "Elles sont une musique que j'apprends à danser", type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-foret.png',
    title: 'Ta source de création...',
    text: "Quand tu crées quelque chose, qu'est-ce qui te motive profondément ?",
    choices: [
      { text: "L'impact que ça aura sur le monde", type: 'resilience' },
      { text: "La beauté et l'harmonie de ce que je crée", type: 'presence' },
      { text: "L'authenticité de ce que j'exprime", type: 'sagesse' },
      { text: "La joie que ça m'apporte et que je partage", type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-vide.png',
    title: 'Ta force cachée...',
    text: 'Quelle est la force en toi que les autres remarquent rarement ?',
    choices: [
      { text: "Ma capacité à transformer les obstacles en élan", type: 'resilience' },
      { text: 'Ma profondeur émotionnelle silencieuse', type: 'presence' },
      { text: "Mon sens aigu de l'observation et de la perception", type: 'sagesse' },
      { text: 'Ma résilience lumineuse et ma capacité à rayonner', type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-cosmos.png',
    title: 'Ta vision du bonheur...',
    text: 'Pour toi, le bonheur ressemble à...',
    choices: [
      { text: "Une vie pleine d'aventures et de découvertes", type: 'resilience' },
      { text: 'Une paix intérieure que rien ne peut troubler', type: 'presence' },
      { text: 'Une profonde connexion avec toi-même et le monde', type: 'sagesse' },
      { text: 'Un équilibre lumineux entre joie et sens', type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-brume.png',
    title: 'Ton prochain chapitre...',
    text: "Quand tu imagines le prochain grand chapitre de ta vie, qu'est-ce qui l'anime ?",
    choices: [
      { text: 'Une audace nouvelle et une liberté conquise', type: 'resilience' },
      { text: 'Une harmonie retrouvée et un sens clair', type: 'presence' },
      { text: 'Une connaissance de moi-même toujours plus profonde', type: 'sagesse' },
      { text: "Une paix intérieure rayonnante que je construis chaque jour", type: 'lumiere' },
    ],
  },
]

// ─── UTILS ────────────────────────────────────────────────────────────────────

function haptic(p) {
  try { navigator.vibrate(Array.isArray(p) ? p : [p]) } catch {}
}

function computeArchetype(answers) {
  const counts = { resilience: 0, presence: 0, sagesse: 0, lumiere: 0 }
  answers.forEach(a => { if (a && counts[a] !== undefined) counts[a]++ })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

// ─── LOGO ─────────────────────────────────────────────────────────────────────

function NeyaLogo({ size = 'md' }) {
  const cfg = { sm: [20, 13], md: [28, 17], lg: [36, 22] }[size]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={cfg[0]} height={cfg[0]} viewBox="0 0 32 32" fill="none">
        <ellipse cx="16" cy="26" rx="3" ry="6" fill="white" opacity="0.85" />
        <ellipse cx="16" cy="16" rx="3" ry="8" fill="white" opacity="0.85" transform="rotate(-45 16 16)" />
        <ellipse cx="16" cy="16" rx="3" ry="8" fill="white" opacity="0.85" transform="rotate(45 16 16)" />
        <ellipse cx="16" cy="16" rx="3" ry="8" fill="white" opacity="0.85" />
        <ellipse cx="16" cy="16" rx="3" ry="8" fill="white" opacity="0.85" transform="rotate(90 16 16)" />
        <circle cx="16" cy="16" r="3.5" fill="white" />
      </svg>
      <span style={{
        fontFamily: 'Sora, sans-serif', fontWeight: 300,
        fontSize: cfg[1], letterSpacing: '0.4em', color: 'white',
        textShadow: '0 0 20px rgba(255,255,255,0.3)',
      }}>NÉYA</span>
    </div>
  )
}

// ─── BG SCREEN ────────────────────────────────────────────────────────────────

function BgScreen({ bg, overlay = 'rgba(5,8,16,0.48)', children, style = {} }) {
  return (
    <div style={{
      width: '100vw', height: '100dvh', position: 'relative', overflow: 'hidden',
      backgroundImage: `url(${B}${bg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      ...style,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: overlay }} />
      {/* Grain */}
      <svg style={{ display: 'none' }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="overlay" />
        </filter>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, filter: 'url(#grain)', opacity: 0.035, pointerEvents: 'none',
        background: 'white',
      }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {children}
      </div>
    </div>
  )
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────

function SplashScreen({ onStart }) {
  const [vis, setVis] = useState(false)
  const [showBtn, setShowBtn] = useState(false)
  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 200)
    const t2 = setTimeout(() => setShowBtn(true), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <BgScreen bg="bg-onboarding.png" overlay="rgba(5,8,16,0.4)">
      <div style={{
        padding: '60px 28px 52px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        height: '100%', width: '100%',
      }}>
        <NeyaLogo size="md" />
        <div style={{
          textAlign: 'center',
          opacity: vis ? 1 : 0,
          transition: 'opacity 1.4s ease',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <h1 style={{
            fontFamily: 'Sora, sans-serif', fontWeight: 300,
            fontSize: 'clamp(30px, 8vw, 38px)', color: 'white',
            lineHeight: 1.2, margin: 0,
            textShadow: '0 2px 32px rgba(0,0,0,0.5)',
          }}>
            Ici commence<br />ton chemin...
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 300,
            fontSize: 15.5, color: 'rgba(255,255,255,0.68)',
            margin: 0, lineHeight: 1.65,
          }}>
            vers plus de calme, d'équilibre<br />et de clarté intérieure.
          </p>
        </div>
        <button
          onClick={() => { haptic(20); onStart() }}
          style={{
            width: '100%', padding: '17px 0',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 14, cursor: 'pointer',
            fontFamily: 'Sora, sans-serif', fontSize: 12.5,
            fontWeight: 400, letterSpacing: '0.22em',
            color: 'white', textTransform: 'uppercase',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            opacity: showBtn ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}
        >Commencer</button>
      </div>
    </BgScreen>
  )
}

// ─── INTRO ────────────────────────────────────────────────────────────────────

function IntroScreen({ onStart }) {
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 120); return () => clearTimeout(t) }, [])

  return (
    <BgScreen bg="bg-cosmos.png" overlay="rgba(5,8,16,0.74)">
      <div style={{
        padding: '60px 28px 52px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        height: '100%', width: '100%',
        opacity: vis ? 1 : 0, transition: 'opacity 0.9s ease',
      }}>
        <NeyaLogo size="sm" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%', textAlign: 'center' }}>
          <div style={{
            width: 50, height: 50, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)',
          }}>
            <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)' }}>◇</span>
          </div>
          <h1 style={{
            fontFamily: 'Sora, sans-serif', fontWeight: 300,
            fontSize: 'clamp(24px, 6.5vw, 30px)', color: 'white',
            margin: 0, lineHeight: 1.25,
          }}>
            Prêt·e pour ton<br />exploration intérieure ?
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            {[
              ['◈', `Tu vas répondre à ${QUESTIONS.length} questions spécialement conçues par Néya pour te guider.`],
              ['◎', 'Pas de bonne ou de mauvaise réponse : réponds avec ton cœur, en toute simplicité.'],
            ].map(([icon, text], i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '14px 16px',
                display: 'flex', gap: 13, textAlign: 'left',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, flexShrink: 0, paddingTop: 1 }}>{icon}</span>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontWeight: 300,
                  fontSize: 14, color: 'rgba(255,255,255,0.68)',
                  margin: 0, lineHeight: 1.65,
                }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => { haptic(20); onStart() }}
          style={{
            width: '100%', padding: '17px 0',
            background: 'rgba(99,102,241,0.8)',
            border: 'none', borderRadius: 14, cursor: 'pointer',
            fontFamily: 'Sora, sans-serif', fontSize: 12.5,
            fontWeight: 400, letterSpacing: '0.2em',
            color: 'white', textTransform: 'uppercase',
            boxShadow: '0 4px 28px rgba(99,102,241,0.4)',
          }}
        >Commencer l'aventure</button>
      </div>
    </BgScreen>
  )
}

// ─── QUIZ ─────────────────────────────────────────────────────────────────────

function QuizScreen({ onComplete }) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null))
  const [selected, setSelected] = useState(null)
  const [fading, setFading] = useState(false)

  const q = QUESTIONS[idx]
  const progress = (idx + (selected !== null ? 0.5 : 0)) / QUESTIONS.length

  const handleSelect = (type) => {
    haptic(12)
    setSelected(type)
  }

  const handleContinue = () => {
    if (!selected) return
    const newAnswers = [...answers]
    newAnswers[idx] = selected
    haptic(18)

    if (idx < QUESTIONS.length - 1) {
      setFading(true)
      setTimeout(() => {
        setAnswers(newAnswers)
        setIdx(idx + 1)
        setSelected(null)
        setFading(false)
      }, 380)
    } else {
      onComplete(newAnswers)
    }
  }

  return (
    <BgScreen bg={q.bg} overlay="rgba(5,8,16,0.54)">
      {/* Progress bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.08)', zIndex: 10 }}>
        <div style={{ height: '100%', background: 'rgba(255,255,255,0.5)', width: `${progress * 100}%`, transition: 'width 0.5s ease' }} />
      </div>

      <div style={{
        padding: '50px 24px 36px',
        display: 'flex', flexDirection: 'column',
        height: '100%', width: '100%',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.35s ease',
      }}>
        {/* Counter */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.2em' }}>
            {idx + 1} / {QUESTIONS.length}
          </span>
        </div>

        {/* Question */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', textAlign: 'center', gap: 10, marginBottom: 24,
        }}>
          <h2 style={{
            fontFamily: 'Sora, sans-serif', fontWeight: 300,
            fontSize: 'clamp(22px, 5.5vw, 28px)', color: 'white',
            margin: 0, lineHeight: 1.2,
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}>{q.title}</h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 300,
            fontSize: 14.5, color: 'rgba(255,255,255,0.65)',
            margin: 0, lineHeight: 1.65, padding: '0 4px',
          }}>{q.text}</p>
        </div>

        {/* Choices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {q.choices.map((c, i) => {
            const sel = selected === c.type
            return (
              <button
                key={i}
                onClick={() => handleSelect(c.type)}
                style={{
                  width: '100%', padding: '13px 15px',
                  background: sel ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.055)',
                  border: `1px solid ${sel ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 13,
                  textAlign: 'left',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease',
                  transform: sel ? 'scale(1.012)' : 'scale(1)',
                }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: sel ? 'white' : 'rgba(255,255,255,0.25)',
                  transition: 'background 0.2s ease',
                  boxShadow: sel ? '0 0 8px rgba(255,255,255,0.5)' : 'none',
                }} />
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontWeight: 300,
                  fontSize: 13.5, lineHeight: 1.45,
                  color: sel ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.68)',
                  transition: 'color 0.2s ease',
                }}>{c.text}</span>
              </button>
            )
          })}
        </div>

        {/* Continue */}
        <div style={{
          marginTop: 18,
          opacity: selected !== null ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: selected !== null ? 'all' : 'none',
        }}>
          <button
            onClick={handleContinue}
            style={{
              width: '100%', padding: '16px 0',
              background: 'rgba(255,255,255,0.13)',
              border: '1px solid rgba(255,255,255,0.28)',
              borderRadius: 14, cursor: 'pointer',
              fontFamily: 'Sora, sans-serif', fontSize: 12,
              fontWeight: 400, letterSpacing: '0.22em',
              color: 'white', textTransform: 'uppercase',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >{idx === QUESTIONS.length - 1 ? 'Terminer' : 'Continuer'}</button>
        </div>
      </div>
    </BgScreen>
  )
}

// ─── TRANSITION ───────────────────────────────────────────────────────────────

function TransitionScreen({ onReveal }) {
  const [vis, setVis] = useState(false)
  const [showBtn, setShowBtn] = useState(false)
  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 300)
    const t2 = setTimeout(() => setShowBtn(true), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <BgScreen bg="bg-cosmos.png" overlay="rgba(5,8,16,0.7)">
      <div style={{
        padding: '60px 28px 52px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        height: '100%', width: '100%',
      }}>
        <NeyaLogo size="sm" />
        <div style={{
          textAlign: 'center',
          opacity: vis ? 1 : 0, transition: 'opacity 1.4s ease',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)',
          }}>
            <img src={`${B}cerf.svg`} style={{ width: 34, height: 34, opacity: 0.75 }} alt="" />
          </div>
          <h1 style={{
            fontFamily: 'Sora, sans-serif', fontWeight: 300,
            fontSize: 'clamp(24px, 6vw, 30px)', color: 'white',
            margin: 0, lineHeight: 1.3,
          }}>
            Ton guide intérieur<br />s'apprête à se révéler...
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 300,
            fontSize: 15, color: 'rgba(255,255,255,0.62)',
            margin: 0, lineHeight: 1.7,
          }}>
            Il est l'écho de ta lumière unique.<br />Es-tu prêt·e à le rencontrer ?
          </p>
        </div>
        <button
          onClick={() => { haptic([30, 50, 20]); onReveal() }}
          style={{
            width: '100%', padding: '17px 0',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.28)',
            borderRadius: 14, cursor: 'pointer',
            fontFamily: 'Sora, sans-serif', fontSize: 12.5,
            fontWeight: 400, letterSpacing: '0.2em',
            color: 'white', textTransform: 'uppercase',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            opacity: showBtn ? 1 : 0, transition: 'opacity 0.8s ease',
          }}
        >Découvrir mon guide</button>
      </div>
    </BgScreen>
  )
}

// ─── RÉSULTAT ─────────────────────────────────────────────────────────────────

function ResultScreen({ archetypeKey, onContinue }) {
  const arch = ARCHETYPES[archetypeKey]
  const [phase, setPhase] = useState(0)
  const [phaseVis, setPhaseVis] = useState(true)
  const [screenVis, setScreenVis] = useState(false)

  useEffect(() => { const t = setTimeout(() => setScreenVis(true), 200); return () => clearTimeout(t) }, [])

  const nextPhase = () => {
    haptic(15)
    if (phase < 2) {
      setPhaseVis(false)
      setTimeout(() => { setPhase(p => p + 1); setPhaseVis(true) }, 300)
    } else {
      onContinue()
    }
  }

  const btnLabel = ['Découvrir mes forces', 'Lire mon message', 'Continuer mon voyage'][phase]

  return (
    <BgScreen bg={arch.bg} overlay="rgba(5,8,16,0.52)">
      <div style={{
        padding: '60px 28px 52px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        height: '100%', width: '100%',
        opacity: screenVis ? 1 : 0, transition: 'opacity 0.9s ease',
      }}>
        <NeyaLogo size="sm" />

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 24, width: '100%', textAlign: 'center',
          opacity: phaseVis ? 1 : 0, transition: 'opacity 0.28s ease',
        }}>

          {phase === 0 && (
            <>
              <img
                src={`${B}cerf.svg`}
                alt=""
                style={{
                  width: 80, height: 80, opacity: 0.72,
                  filter: `drop-shadow(0 0 22px ${arch.shadow})`,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 11,
                  color: arch.color, letterSpacing: '0.25em',
                  margin: 0, textTransform: 'uppercase',
                }}>Profil mental</p>
                <h1 style={{
                  fontFamily: 'Sora, sans-serif', fontWeight: 300,
                  fontSize: 'clamp(26px, 6.5vw, 32px)', color: 'white',
                  margin: 0, lineHeight: 1.2,
                  textShadow: `0 0 40px ${arch.shadow}`,
                }}>{arch.profil}</h1>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontWeight: 300,
                  fontSize: 13.5, color: 'rgba(255,255,255,0.48)',
                  margin: 0, letterSpacing: '0.05em',
                }}>{arch.animal}</p>
              </div>
            </>
          )}

          {phase === 1 && (
            <>
              <h2 style={{
                fontFamily: 'Sora, sans-serif', fontWeight: 300,
                fontSize: 22, color: 'white', margin: 0,
              }}>Tes forces naturelles</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
                {arch.forces.map((f, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${arch.color}55`,
                    borderRadius: 12, padding: '18px 12px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: 13, color: arch.color }}>◈</span>
                    <span style={{
                      fontFamily: 'Sora, sans-serif', fontWeight: 300,
                      fontSize: 13.5, color: 'white', textAlign: 'center',
                    }}>{f}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {phase === 2 && (
            <div style={{
              background: 'rgba(255,255,255,0.055)',
              border: `1px solid ${arch.color}44`,
              borderRadius: 16, padding: '24px 20px',
              display: 'flex', flexDirection: 'column', gap: 18,
            }}>
              {arch.desc.split('\n\n').map((para, i) => (
                <p key={i} style={{
                  fontFamily: 'Inter, sans-serif', fontWeight: 300,
                  fontSize: i === 0 ? 15.5 : 14,
                  color: i === 0 ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.55)',
                  margin: 0, lineHeight: 1.72,
                  fontStyle: i === 0 ? 'italic' : 'normal',
                }}>{i === 0 ? `"${para}"` : para}</p>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={nextPhase}
          style={{
            width: '100%', padding: '17px 0',
            background: phase === 2 ? arch.color : 'rgba(255,255,255,0.11)',
            border: phase === 2 ? 'none' : '1px solid rgba(255,255,255,0.28)',
            borderRadius: 14, cursor: 'pointer',
            fontFamily: 'Sora, sans-serif', fontSize: 12.5,
            fontWeight: 400, letterSpacing: '0.2em',
            color: 'white', textTransform: 'uppercase',
            backdropFilter: phase === 2 ? 'none' : 'blur(10px)',
            WebkitBackdropFilter: phase === 2 ? 'none' : 'blur(10px)',
            boxShadow: phase === 2 ? `0 4px 28px ${arch.shadow}` : 'none',
            transition: 'all 0.4s ease',
          }}
        >{btnLabel}</button>
      </div>
    </BgScreen>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function DashboardScreen({ archetypeKey, onRestart }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 200); return () => clearTimeout(t) }, [])

  const features = [
    { icon: '◈', text: 'Explorer tes routines personnalisées' },
    { icon: '◇', text: 'Suivre ton cheminement intérieur' },
    { icon: '✦', text: 'Débloquer des quêtes et défis bienveillants' },
    { icon: '◎', text: 'Évoluer à ton propre rythme, chaque jour' },
  ]

  return (
    <BgScreen bg="bg-cosmos.png" overlay="rgba(5,8,16,0.68)">
      <div style={{
        padding: '60px 28px 52px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        height: '100%', width: '100%',
        opacity: vis ? 1 : 0, transition: 'opacity 0.9s ease',
      }}>
        <NeyaLogo size="md" />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%', textAlign: 'center' }}>
          <div>
            <h1 style={{
              fontFamily: 'Sora, sans-serif', fontWeight: 300,
              fontSize: 'clamp(24px, 6vw, 30px)', color: 'white',
              margin: '0 0 10px', lineHeight: 1.25,
            }}>
              Bienvenue dans<br />ton Grand Voyage...
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 300,
              fontSize: 15, color: 'rgba(255,255,255,0.58)',
              margin: 0, lineHeight: 1.65,
            }}>Le plus beau chemin commence en toi.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 11,
              color: arch.color, letterSpacing: '0.22em',
              margin: '0 0 4px', textTransform: 'uppercase',
            }}>Dans ton espace Néya, tu pourras...</p>
            {features.map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.055)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '13px 16px',
                display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
              }}>
                <span style={{ fontSize: 14, color: arch.color, flexShrink: 0 }}>{f.icon}</span>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontWeight: 300,
                  fontSize: 14, color: 'rgba(255,255,255,0.72)',
                }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button
            onClick={() => haptic(30)}
            style={{
              width: '100%', padding: '17px 0',
              background: arch.color, border: 'none',
              borderRadius: 14, cursor: 'pointer',
              fontFamily: 'Sora, sans-serif', fontSize: 12.5,
              fontWeight: 400, letterSpacing: '0.2em',
              color: 'white', textTransform: 'uppercase',
              boxShadow: `0 4px 28px ${arch.shadow}`,
            }}
          >Commencer l'exploration</button>
          <button
            onClick={() => { haptic(10); onRestart() }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: 13,
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em',
              padding: '6px 0',
            }}
          >Refaire le parcours</button>
        </div>
      </div>
    </BgScreen>
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('splash')
  const [archetype, setArchetype] = useState(null)
  const [blackout, setBlackout] = useState(false)
  const goTimer = useRef(null)

  useEffect(() => {
    const imgs = ['bg-onboarding.png','bg-cosmos.png','bg-feu.png','bg-eau.png','bg-foret.png','bg-brume.png','bg-vide.png','cerf.svg']
    imgs.forEach(s => { const img = new Image(); img.src = B + s })
  }, [])

  const go = useCallback((nextScreen, fn) => {
    setBlackout(true)
    clearTimeout(goTimer.current)
    goTimer.current = setTimeout(() => {
      if (fn) fn()
      setScreen(nextScreen)
      requestAnimationFrame(() => setBlackout(false))
    }, 360)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100dvh', background: '#050810', overflow: 'hidden', position: 'fixed', inset: 0 }}>
      {screen === 'splash' && <SplashScreen onStart={() => go('intro')} />}
      {screen === 'intro'  && <IntroScreen onStart={() => go('quiz')} />}
      {screen === 'quiz'   && <QuizScreen onComplete={(answers) => {
        const result = computeArchetype(answers)
        go('transition', () => setArchetype(result))
      }} />}
      {screen === 'transition' && <TransitionScreen onReveal={() => go('result')} />}
      {screen === 'result' && archetype && <ResultScreen archetypeKey={archetype} onContinue={() => go('dashboard')} />}
      {screen === 'dashboard' && archetype && <DashboardScreen archetypeKey={archetype} onRestart={() => go('splash', () => setArchetype(null))} />}

      {/* Blackout */}
      <div style={{
        position: 'fixed', inset: 0, background: '#050810', zIndex: 9999,
        opacity: blackout ? 1 : 0,
        transition: blackout ? 'opacity 0.36s ease' : 'opacity 0.28s ease',
        pointerEvents: blackout ? 'all' : 'none',
      }} />
    </div>
  )
}
