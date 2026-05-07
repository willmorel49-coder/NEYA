import { useState, useEffect, useRef, useCallback } from 'react'

// ─── DONNÉES STATIQUES ────────────────────────────────────────────────────────

const RITUAL_COLORS = [
  { hex: '#1e1b4b', label: 'nuit' },
  { hex: '#5b21b6', label: 'violet' },
  { hex: '#7f1d1d', label: 'brique' },
  { hex: '#92400e', label: 'ambre' },
  { hex: '#14532d', label: 'mousse' },
  { hex: '#374151', label: 'perle' },
  { hex: '#0c0c0c', label: 'noir' },
  { hex: '#ece8df', label: 'crème' },
]

const RITUAL_TEXTURES = ['lourd', 'léger', 'rugueux', 'doux', 'chaud', 'froid']
const RITUAL_SOUNDS = ['pluie', 'vent', 'feu', 'silence']

const WORLDS = {
  brume: {
    palette: ['#0d1b2a', '#1b2d4f', '#2e4a7a'],
    bgImage: 'url(/bg-brume.png)',
    animalFilter: 'brightness(1.4) blur(0.3px)',
    animationSpeed: 'slow',
    whisper: 'quelque chose te relie',
    phrases: {
      byTexture: {
        lourd:   [
          "On dirait que tout pèse un peu plus aujourd'hui.",
          "Quelque chose alourdit l'air autour de toi.",
          "Tu portes quelque chose que tu n'as pas nommé.",
          "Ce qui pèse mérite aussi d'être vu.",
        ],
        léger:   [
          "Quelque chose en toi cherche le calme.",
          "Il y a une légèreté qui commence à revenir.",
          "Quelque chose s'allège, doucement.",
          "Il y a une clarté qui revient, peu à peu.",
        ],
        rugueux: [
          "Quelque chose résiste en toi aujourd'hui.",
          "Ça frotte, quelque part. C'est normal.",
          "Il n'y a rien à lisser pour l'instant.",
          "Ça peut être rugueux et vrai en même temps.",
        ],
        doux:    [
          "Tu peux rester ici un moment.",
          "Il y a une douceur possible, même maintenant.",
          "Quelque chose en toi sait se ménager.",
          "La douceur n'est pas une faiblesse ici.",
        ],
        chaud:   [
          "Quelque chose couve, intérieurement.",
          "Il y a de la vie là-dedans, même si c'est tendu.",
          "Tu n'es pas obligé·e de refroidir.",
          "Cette chaleur-là, garde-la.",
        ],
        froid:   [
          "Quelque chose ralentit en toi aujourd'hui.",
          "Tu peux rester ici sans résoudre quoi que ce soit.",
          "Il n'y a rien à résoudre pour l'instant.",
          "Le froid aussi sait tenir compagnie.",
        ],
      },
      default: "Tu peux rester ici un moment.",
    },
  },

  foret: {
    palette: ['#0a1a0e', '#162a18', '#1e3d24'],
    bgImage: 'url(/bg-foret.png)',
    animalFilter: 'hue-rotate(110deg) saturate(0.9) brightness(1.3) blur(0.3px)',
    animationSpeed: 'slow',
    whisper: 'les racines tiennent',
    phrases: {
      byTexture: {
        lourd:   [
          "La forêt accueille aussi ce qui est lourd.",
          "Certaines racines s'enfoncent dans l'obscurité.",
          "Être dense, c'est aussi une forme de vie.",
          "Même les plus vieilles forêts portent leurs morts.",
        ],
        léger:   [
          "Quelque chose pousse ici, silencieusement.",
          "Même l'air entre les arbres a de l'espace.",
          "Il y a une légèreté dans ce qui persiste.",
          "Les arbres poussent lentement. Ça fait partie.",
        ],
        rugueux: [
          "Rugueux, comme l'écorce. Ça tient quand même.",
          "Ce qui résiste a aussi ses textures.",
          "Pas besoin d'être lisse pour traverser.",
          "L'écorce protège ce qui est tendre à l'intérieur.",
        ],
        doux:    [
          "Le sol de la forêt amortit les pas.",
          "Il y a une douceur dans ce qui dure.",
          "Certains endroits existent pour accueillir.",
          "Ici, le temps est différent. Moins exigeant.",
        ],
        chaud:   [
          "Quelque chose grandit en toi, même sous l'ombre.",
          "Une chaleur intérieure, comme la sève qui monte.",
          "Être vivant, ça chauffe parfois.",
          "Ce qui grandit en silence finit par fleurir.",
        ],
        froid:   [
          "Le froid de la forêt est vieux et patient.",
          "Rien n'est pressé ici.",
          "Le calme peut être une forme de force.",
          "Le silence d'hiver prépare quelque chose.",
        ],
      },
      default: "Certains endroits existent pour accueillir.",
    },
  },

  cosmos: {
    palette: ['#0a0818', '#160d3a', '#1e1050'],
    bgImage: 'url(/bg-cosmos.png)',
    animalFilter: 'hue-rotate(270deg) saturate(0.85) brightness(1.6) blur(0.3px)',
    animationSpeed: 'slow',
    whisper: 'tu fais partie de l\'immensité',
    phrases: {
      byTexture: {
        lourd:   [
          "Même les étoiles portent leur propre poids.",
          "Loin du sol, quelque chose reste.",
          "L'espace n'allège pas tout — il donne de la place.",
          "La gravité s'applique aussi aux grandes choses.",
        ],
        léger:   [
          "Quelque chose en toi sait flotter.",
          "Il y a de l'infini dans ce moment.",
          "Léger comme ce qui ne cherche plus à se justifier.",
          "Ce moment existe, et c'est déjà quelque chose.",
        ],
        rugueux: [
          "Même le cosmos a ses aspérités invisibles.",
          "Ce qui accroche peut aussi guider.",
          "La rugosité n'empêche pas le vol.",
          "Même l'espace a ses turbulences.",
        ],
        doux:    [
          "Là-haut, tout est plus silencieux.",
          "L'espace entre les étoiles n'est pas vide.",
          "Il y a une douceur dans l'immensité.",
          "La lumière des étoiles voyage longtemps avant d'arriver.",
        ],
        chaud:   [
          "Quelque chose brûle ici, depuis longtemps.",
          "Il y a de la chaleur même dans l'espace.",
          "Un feu lointain qui dure.",
          "Quelque chose dans l'univers se souvient de toi.",
        ],
        froid:   [
          "Le froid du cosmos est pur, pas hostile.",
          "Quelque chose se cristallise quand tout ralentit.",
          "La distance peut être une forme de clarté.",
          "L'absolu froid de l'espace n'empêche pas d'exister.",
        ],
      },
      default: "Il y a de l'infini dans ce moment.",
    },
  },

  feu: {
    palette: ['#1a0800', '#2e1000', '#4a1c00'],
    bgImage: 'url(/bg-feu.png)',
    animalFilter: 'hue-rotate(30deg) saturate(1.2) brightness(1.6) blur(0.3px)',
    animationSpeed: 'fast',
    whisper: 'cette intensité est toi',
    phrases: {
      byTexture: {
        lourd:   [
          "Ce qui brûle en toi n'est pas un défaut.",
          "Quelque chose est intense aujourd'hui. C'est réel.",
          "Le poids du feu est différent — il consume, il libère.",
          "Le feu aussi porte ses cendres.",
        ],
        léger:   [
          "Le feu peut aussi danser.",
          "Il y a une légèreté dans ce qui brûle vraiment.",
          "Quelque chose se consume pour laisser de la place.",
          "La flamme qui danse n'a pas à se justifier.",
        ],
        rugueux: [
          "Brut, direct, vif — c'est une façon d'être présent.",
          "Ce qui frotte peut s'enflammer.",
          "L'intensité a ses propres textures.",
          "Ce qui est âpre peut aussi être vif.",
        ],
        doux:    [
          "Même le feu a ses braises douces.",
          "Il y a un feu calme dans les choses qui durent.",
          "Ce qui couve n'a pas besoin d'exploser.",
          "Même le feu sait être doux, parfois.",
        ],
        chaud:   [
          "Quelque chose t'habite pleinement en ce moment.",
          "Cette chaleur-là, tu peux lui faire confiance.",
          "Être habité, c'est être vivant.",
          "Tu n'as pas à te refroidir pour les autres.",
        ],
        froid:   [
          "Même quand le froid vient, la braise reste.",
          "Quelque chose résiste sous la surface.",
          "Le froid ne tue pas ce qui est vraiment allumé.",
          "Sous la surface froide, il y a toujours de la chaleur.",
        ],
      },
      default: "Ce qui brûle en toi n'est pas un défaut.",
    },
  },

  eau: {
    palette: ['#04121c', '#081e30', '#0c2e44'],
    bgImage: 'url(/bg-eau.png)',
    animalFilter: 'hue-rotate(190deg) saturate(1.1) brightness(1.5) blur(0.3px)',
    animationSpeed: 'slow',
    whisper: 'tu peux laisser couler',
    phrases: {
      byTexture: {
        lourd:   [
          "L'eau porte aussi ce qui est lourd.",
          "Quelque chose coule mais ne disparaît pas.",
          "Même dense, tu flottes.",
          "Le fond de l'eau est lourd, et c'est normal.",
        ],
        léger:   [
          "L'eau sait comment être légère.",
          "Quelque chose en toi cherche sa surface.",
          "Il y a une fluidité dans les jours qui passent.",
          "Quelque chose en toi trouve sa surface.",
        ],
        rugueux: [
          "L'eau adoucit ce qui résiste, avec le temps.",
          "Même rugueux, le fond peut être traversé.",
          "Quelque chose érode doucement.",
          "L'eau finit par polir ce qui résiste.",
        ],
        doux:    [
          "L'eau se souvient des formes qu'elle a traversées.",
          "Il y a une douceur dans ce qui s'écoule.",
          "Laisser couler n'est pas renoncer.",
          "Ce qui coule s'adapte. C'est une force.",
        ],
        chaud:   [
          "Quelque chose est vivant et en mouvement.",
          "Cette chaleur-là, l'eau la garde longtemps.",
          "Ce qui coule garde sa propre température.",
          "Cette eau-là garde quelque chose de vivant.",
        ],
        froid:   [
          "Une fraîcheur qui réveille sans brusquer.",
          "L'eau froide est honnête.",
          "Ce froid-là nettoie quelque chose.",
          "L'eau froide est franche, directe, réelle.",
        ],
      },
      default: "Laisser couler n'est pas renoncer.",
    },
  },

  vide: {
    palette: ['#0c0c0c', '#141414', '#1e1e1e'],
    bgImage: 'url(/bg-vide.png)',
    animalFilter: 'saturate(0) brightness(1.8) blur(0.3px)',
    animationSpeed: 'slow',
    whisper: 'rien n\'est requis de toi',
    phrases: {
      byTexture: {
        lourd:   [
          "Le vide accueille même ce qui est lourd.",
          "Ici, le poids n'a pas besoin de se justifier.",
          "Silence total. C'est suffisant.",
          "Même dans le vide, tu existes pleinement.",
        ],
        léger:   [
          "Il n'y a rien à faire ici.",
          "Le vide n'est pas une absence — c'est un espace.",
          "Quelque chose respire quand tout s'arrête.",
          "L'absence de bruit est aussi une présence.",
        ],
        rugueux: [
          "Même dans le vide, tu existes.",
          "Ce qui résiste peut aussi se poser.",
          "Pas de lissage nécessaire ici.",
          "Même dans le silence, tu peux être brut.",
        ],
        doux:    [
          "Il n'y a rien à tenir.",
          "La paix n'est pas l'absence de quelque chose.",
          "Tu peux ne rien être pour un moment.",
          "Ce n'est pas vide — c'est espace.",
        ],
        chaud:   [
          "Même dans le silence, quelque chose couve.",
          "Une chaleur intérieure qui n'a pas besoin de se montrer.",
          "Être, simplement.",
          "Quelque chose de chaud résiste dans le calme absolu.",
        ],
        froid:   [
          "Le silence froid est l'un des plus honnêtes.",
          "Rien ne bouge. C'est bien comme ça.",
          "Ce moment ne demande rien.",
          "Ce silence-là est propre, sans résidu.",
        ],
      },
      default: "Il n'y a rien à faire ici.",
    },
  },
}

// sound × texture → monde émotionnel
const WORLD_MAP = {
  pluie:   { lourd:'brume',  léger:'eau',   rugueux:'brume',  doux:'eau',   chaud:'eau',   froid:'brume' },
  vent:    { lourd:'foret',  léger:'cosmos', rugueux:'foret',  doux:'cosmos', chaud:'cosmos', froid:'foret' },
  feu:     { lourd:'feu',    léger:'foret',  rugueux:'feu',    doux:'foret',  chaud:'feu',   froid:'foret' },
  silence: { lourd:'brume',  léger:'vide',   rugueux:'brume',  doux:'vide',  chaud:'vide',  froid:'brume' },
}

const WORLD_NAMES = { brume:'brume', foret:'forêt', cosmos:'cosmos', feu:'feu', eau:'eau', vide:'vide' }

// ─── HISTOIRE SILENCIEUSE ─────────────────────────────────────────────────────

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('neya_history') || '[]') } catch { return [] }
}

function saveToHistory(ritual, worldKey) {
  try {
    const h = loadHistory()
    h.unshift({ ts: Date.now(), color: ritual.color, texture: ritual.texture, sound: ritual.sound, world: worldKey })
    if (h.length > 90) h.splice(90)
    localStorage.setItem('neya_history', JSON.stringify(h))
  } catch {}
}

function selectWorld(ritual) {
  if (!ritual.sound || !ritual.texture) return 'brume'
  return WORLD_MAP[ritual.sound]?.[ritual.texture] ?? 'brume'
}

function selectPhrase(ritual, world) {
  const texture = ritual.texture
  const pool = world.phrases.byTexture[texture]
  if (!pool) return world.phrases.default
  const colorIdx = RITUAL_COLORS.findIndex(c => c.hex === ritual.color)
  return pool[Math.abs(colorIdx) % pool.length]
}

// ─── LOGO NÉYA + SPLASH ───────────────────────────────────────────────────────

function NeyaLogo({ size = 'sm', opacity = 1, className = '' }) {
  const scales = {
    sm: { star: 13, text: 10 },
    md: { star: 18, text: 13 },
    lg: { star: 24, text: 16 },
  }
  const s = scales[size]
  return (
    <div className={`flex flex-col items-center gap-1.5 select-none ${className}`} style={{ opacity }}>
      <svg width={s.star} height={s.star} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 1.5 L13.2 9.8 L20.5 6.2 L15 12 L22 15 L13.8 13.8 L15.5 22 L12 14.8 L8.5 22 L10.2 13.8 L2 15 L9 12 L3.5 6.2 L10.8 9.8 Z"
          fill={`rgba(255,255,255,${0.55 * opacity})`}
        />
      </svg>
      <span
        style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: s.text,
          letterSpacing: '0.38em',
          color: `rgba(255,255,255,${0.5 * opacity})`,
          textTransform: 'uppercase',
        }}
      >
        NÉYA
      </span>
    </div>
  )
}

function NeyaSplash({ onDone, hasHistory, lastWorld, lastTs }) {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const [showReturn, setShowReturn] = useState(false)
  const [showWorld, setShowWorld] = useState(false)

  const hoursSince = lastTs ? (Date.now() - lastTs) / 3600000 : 0
  const returnText = hoursSince < 4 ? 'tu es encore là' : hoursSince < 168 ? 'tu es revenu·e' : 'tu es de retour'

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 200)
    const t2 = setTimeout(() => setShowReturn(hasHistory), 900)
    const t3 = setTimeout(() => setShowWorld(hasHistory && !!lastWorld), 1500)
    const t4 = setTimeout(() => setFading(true), hasHistory ? 3200 : 2200)
    const t5 = setTimeout(() => onDone(), hasHistory ? 4300 : 3100)
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout)
  }, [onDone, hasHistory, lastWorld])

  const splashStars = [
    { x: 12, y: 8,  r: 0.8, op: 0.14, period: 4.2, delay: 0 },
    { x: 28, y: 15, r: 0.5, op: 0.09, period: 6.1, delay: 1.5 },
    { x: 45, y: 6,  r: 0.7, op: 0.11, period: 5.0, delay: 2.8 },
    { x: 67, y: 11, r: 0.6, op: 0.08, period: 7.3, delay: 0.8 },
    { x: 82, y: 19, r: 0.9, op: 0.13, period: 4.8, delay: 3.2 },
    { x: 91, y: 7,  r: 0.5, op: 0.07, period: 6.6, delay: 1.0 },
    { x: 8,  y: 28, r: 0.6, op: 0.10, period: 5.4, delay: 2.2 },
    { x: 55, y: 22, r: 0.4, op: 0.07, period: 8.0, delay: 0.5 },
    { x: 75, y: 30, r: 0.7, op: 0.09, period: 5.7, delay: 4.0 },
    { x: 38, y: 35, r: 0.5, op: 0.08, period: 6.9, delay: 1.8 },
    { x: 22, y: 42, r: 0.4, op: 0.06, period: 7.5, delay: 3.5 },
    { x: 60, y: 38, r: 0.6, op: 0.08, period: 5.3, delay: 2.6 },
  ]

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: '#050810', opacity: fading ? 0 : 1, transition: 'opacity 900ms ease' }}>
      <style>{`
        @keyframes splashpulse {
          0%, 100% { opacity: 0.72; transform: scale(1); }
          50%       { opacity: 1;    transform: scale(1.03); }
        }
        @keyframes splashpulsereturning {
          0%, 100% { opacity: 0.68; transform: scale(1); }
          50%       { opacity: 0.92; transform: scale(1.014); }
        }
        @keyframes returnfade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashtw { 0%,100%{opacity:0.6} 50%{opacity:1} }
      `}</style>
      {/* Champ d'étoiles — l'univers attend */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'hidden' }}>
        {splashStars.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r}
            fill={`rgba(255,255,255,${s.op})`}
            style={{ animation: `splashtw ${s.period}s ${s.delay}s ease-in-out infinite` }} />
        ))}
      </svg>
      <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 1400ms ease', animation: visible ? (hasHistory ? 'splashpulsereturning 4.8s ease-in-out infinite' : 'splashpulse 3.5s ease-in-out infinite') : 'none' }}>
        <NeyaLogo size="lg" />
      </div>
      {showReturn && (
        <p style={{
          fontFamily: 'Sora', fontSize: 9, letterSpacing: '0.3em',
          color: 'rgba(255,255,255,0.18)', marginTop: 28,
          animation: 'returnfade 1000ms ease forwards',
        }}>
          {returnText}
        </p>
      )}
      {showWorld && (
        <p style={{
          fontFamily: 'Sora', fontSize: 7, letterSpacing: '0.45em',
          color: 'rgba(255,255,255,0.07)', marginTop: 10,
          animation: 'returnfade 1200ms ease forwards',
          textTransform: 'uppercase',
        }}>
          {WORLD_NAMES[lastWorld] || lastWorld}
        </p>
      )}
    </div>
  )
}

// ─── COMPOSANT FADE ───────────────────────────────────────────────────────────

function Fade({ children, duration = 800, delay = 0, className = '', style = {}, slide = false }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => {
      requestAnimationFrame(() => setVisible(true))
    }, delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div className={className} style={style}>
      <div style={{
        opacity: visible ? 1 : 0,
        transform: slide ? (visible ? 'translateY(0)' : 'translateY(7px)') : undefined,
        transition: `opacity ${duration}ms ease${slide ? `, transform ${duration}ms ease` : ''}`,
      }}>
        {children}
      </div>
    </div>
  )
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────

function Onboarding({ step, onNext }) {
  return (
    <div
      className="w-full h-full absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
      onClick={onNext}
    >
      {step === 0 && <OnboardingScreen0 />}
      {step === 1 && <OnboardingScreen1 />}
      {step === 2 && <OnboardingScreen2 onEnter={onNext} />}
    </div>
  )
}

function OnboardingScreen0() {
  const [showHint, setShowHint] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 5500)
    return () => clearTimeout(t)
  }, [])
  return (
    <Fade className="w-full h-full relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/bg-onboarding.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      />
      {/* Voile bas pour la question */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(5,8,16,0.92) 0%, rgba(5,8,16,0.5) 45%, rgba(5,8,16,0.12) 100%)',
        }}
      />
      {/* Question centrée en bas */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-24 px-8">
        <p
          style={{
            fontFamily: 'Sora, sans-serif',
            fontWeight: 300,
            fontSize: 20,
            color: 'rgba(255,255,255,0.72)',
            letterSpacing: '0.1em',
            textAlign: 'center',
          }}
        >
          Et toi, ça va vraiment&nbsp;?
        </p>
      </div>
      <div style={{ position: 'absolute', bottom: '9%', left: '50%', transform: 'translateX(-50%)', opacity: showHint ? 1 : 0, transition: 'opacity 1400ms ease' }}>
        <p style={{ fontFamily: 'Sora', fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.15)', whiteSpace: 'nowrap' }}>
          toucher pour continuer
        </p>
      </div>
    </Fade>
  )
}

function OnboardingScreen1() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [showHint, setShowHint] = useState(false)
  useEffect(() => {
    const timers = [
      setTimeout(() => setVisibleLines(1), 500),
      setTimeout(() => setVisibleLines(2), 1600),
      setTimeout(() => setVisibleLines(3), 2700),
      setTimeout(() => setVisibleLines(4), 4000),
      setTimeout(() => setShowHint(true), 5200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const lines = [
    { text: 'Pas une appli de méditation.', dim: true },
    { text: 'Pas un journal.', dim: true },
    { text: 'Pas un thérapeute.', dim: true },
    { text: 'Un espace pour ce que tu ressens vraiment.', dim: false },
  ]

  return (
    <Fade className="w-full h-full flex flex-col items-center justify-center px-10 relative">
      {/* Profondeur — halo central très subtil */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(30,45,90,0.35) 0%, transparent 65%)' }} />
      <div className="flex flex-col items-center gap-5 relative z-10">
        {lines.map((line, i) => (
          <p
            key={i}
            style={{
              fontFamily: i === 3 ? 'Sora, sans-serif' : 'Inter, sans-serif',
              fontWeight: 300,
              fontSize: i === 3 ? 18 : 15,
              color: i === 3 ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.36)',
              letterSpacing: '0.04em',
              textAlign: 'center',
              opacity: visibleLines > i ? 1 : 0,
              transition: 'opacity 700ms ease',
            }}
          >
            {line.text}
          </p>
        ))}
      </div>

      {/* Hint "toucher" — apparaît après que toutes les lignes sont visibles */}
      <div style={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)', opacity: showHint ? 1 : 0, transition: 'opacity 1200ms ease' }}>
        <p style={{ fontFamily: 'Sora', fontSize: 8, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.18)' }}>
          toucher pour continuer
        </p>
      </div>
    </Fade>
  )
}

function OnboardingScreen2({ onEnter }) {
  return (
    <Fade
      className="w-full h-full flex flex-col items-center justify-center px-10 gap-16"
      style={{ background: 'linear-gradient(to bottom, #050810 0%, #060c10 100%)' }}
    >
      <p
        style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 300,
          fontSize: 20,
          color: 'rgba(255,255,255,0.62)',
          lineHeight: 2,
          letterSpacing: '0.04em',
          textAlign: 'center',
        }}
      >
        T'as pas besoin<br />d'aller bien<br />pour commencer.
      </p>
      <button
        onClick={e => { e.stopPropagation(); onEnter() }}
        style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: 11,
          letterSpacing: '0.4em',
          color: 'rgba(255,255,255,0.32)',
          paddingBottom: 4,
          background: 'none',
          border: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          cursor: 'pointer',
          transition: 'color 600ms ease',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.32)'}
        onTouchStart={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
        onTouchEnd={e => e.currentTarget.style.color = 'rgba(255,255,255,0.32)'}
      >
        ENTRER
      </button>
    </Fade>
  )
}

// ─── HAPTIC ───────────────────────────────────────────────────────────────────

function haptic(pattern = [10]) {
  try { navigator.vibrate?.(pattern) } catch {}
}

// ─── AUDIO ───────────────────────────────────────────────────────────────────

function createReverb(ctx) {
  const len = ctx.sampleRate * 2.2
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.6)
  }
  const conv = ctx.createConvolver()
  conv.buffer = buf
  return conv
}

function startAmbience(type, volume = 0.07) {
  const noop = () => {}
  noop.setVolume = () => {}
  if (type === 'silence') return noop
  let ctx
  try { ctx = new (window.AudioContext || window.webkitAudioContext)() } catch { return noop }
  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(0.0001, ctx.currentTime)
  gainNode.gain.setTargetAtTime(volume, ctx.currentTime, 0.7)
  gainNode.connect(ctx.destination)
  // Réverbe atmosphérique — send parallèle 14% wet
  const reverb = createReverb(ctx)
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.14
  gainNode.connect(reverb)
  reverb.connect(reverbGain)
  reverbGain.connect(ctx.destination)

  const bufferSize = ctx.sampleRate * 4
  const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const source = ctx.createBufferSource()
  source.buffer = buf
  source.loop = true

  const filter = ctx.createBiquadFilter()

  if (type === 'pluie') {
    filter.type = 'highpass'
    filter.frequency.value = 2200
    const filter2 = ctx.createBiquadFilter()
    filter2.type = 'lowpass'
    filter2.frequency.value = 9000
    source.connect(filter)
    filter.connect(filter2)
    filter2.connect(gainNode)
    // Basse fréquence — terre mouillée, corps de la pluie
    const bassFilter = ctx.createBiquadFilter()
    bassFilter.type = 'lowpass'
    bassFilter.frequency.value = 110
    const bassGain = ctx.createGain()
    bassGain.gain.value = 0.12
    source.connect(bassFilter)
    bassFilter.connect(bassGain)
    bassGain.connect(gainNode)
  } else if (type === 'vent') {
    filter.type = 'bandpass'
    filter.frequency.value = 380
    filter.Q.value = 0.4
    // LFO qui module la fréquence — vent qui varie
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 0.08
    lfoGain.gain.value = 90
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)
    lfo.start()
    source.connect(filter)
    filter.connect(gainNode)
    // Harmonique — sifflement du vent dans les branches
    const harmFilter = ctx.createBiquadFilter()
    harmFilter.type = 'bandpass'
    harmFilter.frequency.value = 760
    harmFilter.Q.value = 0.3
    const harmGain = ctx.createGain()
    harmGain.gain.value = 0.28
    source.connect(harmFilter)
    harmFilter.connect(harmGain)
    harmGain.connect(gainNode)
  } else if (type === 'feu') {
    filter.type = 'lowpass'
    filter.frequency.value = 320
    // LFO sawtooth pour fluctuations du feu
    const flameLFO = ctx.createOscillator()
    const flameLFOGain = ctx.createGain()
    flameLFO.type = 'sawtooth'
    flameLFO.frequency.value = 0.35
    flameLFOGain.gain.value = 0.38
    const flameGain = ctx.createGain()
    flameGain.gain.value = 0.62
    flameLFO.connect(flameLFOGain)
    flameLFOGain.connect(flameGain.gain)
    flameLFO.start()
    source.connect(filter)
    filter.connect(flameGain)
    flameGain.connect(gainNode)
    // Crépitement — bruit haute fréquence modulé par tremolo irrégulier
    const crackFilter = ctx.createBiquadFilter()
    crackFilter.type = 'bandpass'
    crackFilter.frequency.value = 1900
    crackFilter.Q.value = 5
    const crackTremolo = ctx.createOscillator()
    const crackTremoloGain = ctx.createGain()
    crackTremolo.type = 'sawtooth'
    crackTremolo.frequency.value = 4.6
    crackTremoloGain.gain.value = 0.07
    const crackGain = ctx.createGain()
    crackGain.gain.value = 0.09
    crackTremolo.connect(crackTremoloGain)
    crackTremoloGain.connect(crackGain.gain)
    crackTremolo.start()
    source.connect(crackFilter)
    crackFilter.connect(crackGain)
    crackGain.connect(gainNode)
  }

  source.start()
  const stop = () => {
    gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.3)
    setTimeout(() => { try { ctx.close() } catch (e) {} }, 1500)
  }
  stop.setVolume = (v, dur = 2) => {
    gainNode.gain.setTargetAtTime(v, ctx.currentTime, dur / 4)
  }
  return stop
}

// ─── RITUAL ───────────────────────────────────────────────────────────────────

function RitualFlow({ step, ritual, onChange, onComplete, muted }) {
  const bgColor = ritual.color
    ? `radial-gradient(ellipse at center 38%, ${ritual.color}22 0%, #050810 62%)`
    : '#050810'

  return (
    <div className="w-full h-full absolute inset-0">
      {/* Fond réactif */}
      <div
        className="absolute inset-0 transition-all duration-[1400ms] ease-out"
        style={{ background: bgColor }}
      />
      {/* Vignette — profondeur picturale */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, background: 'radial-gradient(ellipse at 50% 48%, transparent 38%, rgba(5,8,16,0.52) 100%)' }} />

      {/* Indicateur de progression — 3 points */}
      <style>{`@keyframes dotpulse{0%,100%{opacity:0.35}50%{opacity:0.7}}`}</style>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5" style={{ zIndex: 20 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 3, height: 3, borderRadius: '50%',
            background: i <= step ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)',
            transition: 'background 600ms ease',
            animation: i === step ? 'dotpulse 2.8s ease-in-out infinite' : 'none',
          }} />
        ))}
      </div>

      <Fade key={step} duration={600} className="w-full h-full flex items-center justify-center relative z-10">
        {step === 0 && (
          <RitualColor
            selected={ritual.color}
            onSelect={color => onChange({ ...ritual, color })}
            onNext={() => onComplete(0)}
          />
        )}
        {step === 1 && (
          <RitualTexture
            selected={ritual.texture}
            ritualColor={ritual.color}
            onSelect={texture => onChange({ ...ritual, texture })}
            onNext={() => onComplete(1)}
          />
        )}
        {step === 2 && (
          <RitualSound
            selected={ritual.sound}
            onSelect={sound => onChange({ ...ritual, sound })}
            onNext={() => onComplete(2)}
            muted={muted}
          />
        )}
      </Fade>
    </div>
  )
}

function RitualColor({ selected, onSelect, onNext }) {
  const positions = [
    { top: '15%', left: '22%' },
    { top: '12%', left: '60%' },
    { top: '27%', left: '80%' },
    { top: '46%', left: '83%' },
    { top: '62%', left: '70%' },
    { top: '68%', left: '36%' },
    { top: '55%', left: '14%' },
    { top: '34%', left: '9%' },
  ]
  const baseSizes = [40, 36, 48, 38, 44, 42, 34, 46]
  const breathePeriods = [14, 18, 12, 20, 16, 22, 15, 19]
  const [flashLabel, setFlashLabel] = useState(null)

  const handleSelect = (hex, label) => {
    onSelect(hex)
    setFlashLabel(label)
    setTimeout(() => setFlashLabel(null), 1200)
  }

  return (
    <div className="w-full h-full relative">
      <style>{`
        ${RITUAL_COLORS.map((c, i) => `
          @keyframes colorBreathe${i} {
            0%, 100% { box-shadow: none; transform: translate(-50%, -50%) scale(1); }
            50%       { box-shadow: 0 0 18px ${c.hex}44; transform: translate(-50%, -50%) scale(1.08); }
          }
          @keyframes selectedGlow${i} {
            0%, 100% { box-shadow: 0 0 28px ${c.hex}66, 0 0 10px ${c.hex}44; }
            50%       { box-shadow: 0 0 52px ${c.hex}99, 0 0 24px ${c.hex}66; }
          }
        `).join('')}
      `}</style>

      <p
        className="absolute top-14 left-1/2 -translate-x-1/2"
        style={{ fontFamily: 'Sora', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.18)' }}
      >
        UNE COULEUR
      </p>

      {/* Flash du label couleur */}
      {flashLabel && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
          <p style={{ fontFamily: 'Sora', fontSize: 11, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.28)', animation: 'colorlabelfade 1200ms ease forwards' }}>
            {flashLabel}
          </p>
        </div>
      )}
      <style>{`@keyframes colorlabelfade { 0%{opacity:0;transform:translateY(4px)} 20%{opacity:1;transform:translateY(0)} 80%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-4px)} }`}</style>

      {RITUAL_COLORS.map((c, i) => {
        const isSelected = selected === c.hex
        return (
          <button
            key={c.hex}
            onClick={() => handleSelect(c.hex, c.label)}
            aria-label={c.label}
            style={{
              position: 'absolute',
              top: positions[i].top,
              left: positions[i].left,
              width: baseSizes[i],
              height: baseSizes[i],
              borderRadius: '50%',
              background: c.hex,
              opacity: selected && !isSelected ? 0.15 : 0.82,
              boxShadow: isSelected ? `0 0 32px ${c.hex}80, 0 0 12px ${c.hex}50` : 'none',
              transform: `translate(-50%, -50%) scale(${isSelected ? 1.42 : 1})`,
              filter: 'saturate(0.6) brightness(0.88)',
              animation: isSelected
                ? `selectedGlow${i} ${breathePeriods[i] * 0.6}s ease-in-out infinite`
                : !selected ? `colorBreathe${i} ${breathePeriods[i]}s ease-in-out infinite` : 'none',
              transition: 'opacity 0.55s ease, box-shadow 0.55s ease, transform 0.55s ease',
              cursor: 'pointer',
              border: 'none',
            }}
          />
        )
      })}

      {selected && (
        <Fade slide className="absolute bottom-14 left-1/2 -translate-x-1/2">
          <button
            onClick={onNext}
            style={{
              fontFamily: 'Sora',
              fontSize: 10,
              letterSpacing: '0.32em',
              color: 'rgba(255,255,255,0.3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            CONTINUER
          </button>
        </Fade>
      )}
    </div>
  )
}

function RitualTexture({ selected, onSelect, onNext, ritualColor }) {
  const [isolated, setIsolated] = useState(null)

  const handleSelect = (word) => {
    onSelect(word)
    setIsolated(word)
    setTimeout(() => setIsolated(null), 850)
  }

  // Positions spatiales libres — le mot se pose dans l'espace
  const posMap = {
    lourd:   { top: '17%', left: '50%', tx: '-50%' },
    léger:   { top: '30%', left: '74%', tx: '0' },
    rugueux: { top: '43%', left: '22%', tx: '0' },
    doux:    { top: '55%', left: '66%', tx: '0' },
    chaud:   { top: '68%', left: '36%', tx: '0' },
    froid:   { top: '80%', left: '58%', tx: '0' },
  }

  return (
    <div className="w-full h-full relative">
      <p
        className="absolute top-14 left-1/2 -translate-x-1/2"
        style={{ fontFamily: 'Sora', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.18)' }}
      >
        UNE SENSATION
      </p>

      {isolated ? (
        <Fade slide key={isolated} className="absolute inset-0 flex items-center justify-center">
          <p style={{
            fontFamily: 'Sora', fontWeight: 300, fontSize: 40, letterSpacing: '0.2em',
            color: ritualColor ? `color-mix(in srgb, ${ritualColor} 20%, rgba(255,255,255,0.82))` : 'rgba(255,255,255,0.82)',
            textShadow: ritualColor ? `0 0 40px ${ritualColor}55` : 'none',
          }}>
            {isolated}
          </p>
        </Fade>
      ) : (
        RITUAL_TEXTURES.map(word => {
          const pos = posMap[word]
          return (
            <button
              key={word}
              onClick={() => handleSelect(word)}
              onTouchStart={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.88)' }}
              onTouchEnd={e => { e.currentTarget.style.color = selected === word ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.2)' }}
              style={{
                position: 'absolute',
                top: pos.top,
                left: pos.left,
                transform: `translateX(${pos.tx})`,
                fontFamily: 'Sora',
                fontWeight: 300,
                fontSize: 22,
                letterSpacing: '0.18em',
                color: selected === word ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.2)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.4s ease',
                padding: '10px 14px', margin: '-10px -14px',
              }}
            >
              {word}
            </button>
          )
        })
      )}

      {selected && !isolated && (
        <Fade slide className="absolute bottom-14 left-1/2 -translate-x-1/2">
          <button
            onClick={onNext}
            style={{
              fontFamily: 'Sora',
              fontSize: 10,
              letterSpacing: '0.32em',
              color: 'rgba(255,255,255,0.3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            CONTINUER
          </button>
        </Fade>
      )}
    </div>
  )
}

function RitualSound({ selected, onSelect, onNext, muted }) {
  const stopRef = useRef(() => {})

  const handleSelect = (sound) => {
    stopRef.current()
    onSelect(sound)
    if (!muted && sound !== 'silence') {
      stopRef.current = startAmbience(sound, 0.055)
    } else {
      stopRef.current = () => {}
    }
  }

  useEffect(() => () => stopRef.current(), [])

  const soundItems = [
    { key: 'pluie',   symbol: '〰', label: 'pluie' },
    { key: 'vent',    symbol: '∿',  label: 'vent' },
    { key: 'feu',     symbol: '◦',  label: 'feu' },
    { key: 'silence', symbol: '—',  label: 'silence' },
  ]

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <p
        className="absolute top-14 left-1/2 -translate-x-1/2"
        style={{ fontFamily: 'Sora', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.18)' }}
      >
        UN SON
      </p>
      <div className="flex flex-col gap-10 items-center">
        {soundItems.map(({ key, symbol, label }) => {
          const isSelected = selected === key
          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              style={{
                fontFamily: 'Sora',
                fontWeight: 300,
                fontSize: 20,
                letterSpacing: '0.18em',
                color: isSelected ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'baseline',
                gap: 14,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                transition: 'all 0.45s ease',
              }}
            >
              <span style={{ fontSize: 13, opacity: 0.45 }}>{symbol}</span>
              <span>{label}</span>
              {/* Silence — trois points qui respirent */}
              {isSelected && key === 'silence' && (
                <span style={{ display: 'flex', gap: 4, alignItems: 'center', marginLeft: 8 }}>
                  <style>{`@keyframes silencedot{0%,100%{opacity:0.12}50%{opacity:0.38}}`}</style>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 2.5, height: 2.5, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', animation: `silencedot 2.4s ${i * 0.8}s ease-in-out infinite`, display: 'inline-block' }} />
                  ))}
                </span>
              )}
              {/* Indicateur sonore animé */}
              {isSelected && key !== 'silence' && !muted && (
                <span style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 12, marginLeft: 4 }}>
                  {({ pluie: [0.5, 0.9, 0.4, 0.8, 0.6], vent: [0.6, 0.4, 0.9, 0.5, 0.7], feu: [0.9, 0.7, 1.0, 0.8, 0.5] }[key] || [1, 0.6, 0.8, 0.5, 0.9]).map((h, i) => (
                    <span
                      key={i}
                      style={{
                        width: 2,
                        height: `${h * 12}px`,
                        background: 'rgba(255,255,255,0.4)',
                        borderRadius: 1,
                        animation: `soundbar ${0.5 + i * 0.12}s ${i * 0.08}s ease-in-out infinite alternate`,
                      }}
                    />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <style>{`
        @keyframes soundbar {
          from { transform: scaleY(0.3); opacity: 0.3; }
          to   { transform: scaleY(1);   opacity: 0.7; }
        }
      `}</style>
      {selected && (
        <Fade slide className="absolute bottom-14 left-1/2 -translate-x-1/2">
          <button
            onClick={onNext}
            style={{
              fontFamily: 'Sora',
              fontSize: 10,
              letterSpacing: '0.32em',
              color: 'rgba(255,255,255,0.3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ENTRER DANS LE MONDE
          </button>
        </Fade>
      )}
    </div>
  )
}

// ─── OVERLAYS ATMOSPHÉRIQUES ──────────────────────────────────────────────────

function ForetRays() {
  const rays = [
    { x: 15, angle: -10, opacity: 0.07, width: 55,  delay: '0s' },
    { x: 32, angle:  -4, opacity: 0.05, width: 100, delay: '5s' },
    { x: 50, angle:   2, opacity: 0.08, width: 45,  delay: '2s' },
    { x: 67, angle:  -6, opacity: 0.06, width: 80,  delay: '7s' },
    { x: 84, angle:   7, opacity: 0.05, width: 60,  delay: '3.5s' },
    { x: 42, angle:  -2, opacity: 0.03, width: 200, delay: '11s' },
  ]
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
      <style>{`
        @keyframes rayshift {
          0%,100% { opacity: var(--ray-op); }
          50%      { opacity: calc(var(--ray-op) * 1.7); }
        }
      `}</style>
      {rays.map((r, i) => {
        const col = i === 2 ? [255, 210, 100] : [200, 240, 160]
        return (
          <div key={i} style={{
            position: 'absolute', top: '-20%', left: `${r.x}%`,
            width: r.width, height: '140%',
            background: `linear-gradient(to bottom, rgba(${col},0) 0%, rgba(${col},0.22) 35%, rgba(${col},0.12) 65%, rgba(${col},0) 100%)`,
            transform: `rotate(${r.angle}deg) translateX(-50%)`,
            '--ray-op': r.opacity,
            animation: `rayshift ${14 + i * 3}s ${r.delay} ease-in-out infinite`,
            mixBlendMode: 'screen',
            filter: 'blur(3px)',
          }} />
        )
      })}
      {/* Brume de sol — lumière diffuse verte au sol */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
        background: 'linear-gradient(to top, rgba(160,220,140,0.06) 0%, transparent 100%)',
        mixBlendMode: 'screen',
      }} />
    </div>
  )
}

function FeuShimmer() {
  const embers = useRef(
    Array.from({ length: 14 }, () => ({
      x: 20 + Math.random() * 60,
      size: 1.2 + Math.random() * 2.2,
      duration: 4 + Math.random() * 5,
      delay: Math.random() * 6,
      drift: (Math.random() - 0.5) * 40,
      g: 100 + Math.round(Math.random() * 80),
    }))
  ).current

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
      <style>{`
        @keyframes feushimmer {
          0%,100% { transform:scaleX(1) skewX(0deg); opacity:0.04; }
          25%      { transform:scaleX(1.008) skewX(0.4deg); opacity:0.07; }
          75%      { transform:scaleX(0.994) skewX(-0.3deg); opacity:0.05; }
        }
        ${embers.map((e, i) => `
          @keyframes ember${i} {
            0%   { transform:translate(0,0) scale(1); opacity:0.7; }
            60%  { opacity:0.3; }
            100% { transform:translate(${e.drift}px,-120px) scale(0.2); opacity:0; }
          }
        `).join('')}
      `}</style>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 80%, rgba(255,140,0,0.12) 0%, transparent 60%)',
        animation: 'feushimmer 2.8s ease-in-out infinite',
      }} />
      {embers.map((e, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${e.x}%`, bottom: '10%',
          width: e.size, height: e.size,
          borderRadius: '50%',
          background: `rgba(255, ${e.g}, 0, 0.8)`,
          boxShadow: `0 0 ${e.size * 2}px rgba(255,120,0,0.4)`,
          animation: `ember${i} ${e.duration}s ${e.delay}s ease-out infinite`,
        }} />
      ))}
    </div>
  )
}

function EauRipples() {
  const ripples = [
    { cx: 50, cy: 58, delay: '0s',   period: 9,  maxR: 130, sw: 0.6, stroke: 'rgba(80,180,210,0.35)' },
    { cx: 50, cy: 58, delay: '3s',   period: 9,  maxR: 130, sw: 0.4, stroke: 'rgba(80,180,210,0.28)' },
    { cx: 50, cy: 58, delay: '6s',   period: 9,  maxR: 130, sw: 0.3, stroke: 'rgba(80,180,210,0.22)' },
    { cx: 35, cy: 70, delay: '1.5s', period: 12, maxR: 80,  sw: 0.5, stroke: 'rgba(80,200,180,0.30)' },
    { cx: 68, cy: 50, delay: '4.5s', period: 11, maxR: 70,  sw: 0.4, stroke: 'rgba(100,190,220,0.25)' },
  ]
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 3, overflow: 'visible' }}>
      <style>
        {ripples.map((r, i) => `
          @keyframes ripple${i} {
            0%   { r:0;        opacity:0.18; }
            40%  { opacity:0.08; }
            100% { r:${r.maxR}; opacity:0; }
          }
        `).join('')}
      </style>
      {ripples.map((r, i) => (
        <circle key={i} cx={`${r.cx}%`} cy={`${r.cy}%`} r="0"
          fill="none" stroke={r.stroke} strokeWidth={r.sw}
          style={{ animation: `ripple${i} ${r.period}s ${r.delay} ease-out infinite` }} />
      ))}
      {/* Reflet de surface — ligne lumineuse horizontale */}
      <style>{`@keyframes eausurface{0%,100%{opacity:0.5}50%{opacity:1}}`}</style>
      <line x1="8%" y1="54%" x2="92%" y2="54%"
        stroke="url(#eauGrad)" strokeWidth="0.7"
        style={{ animation: 'eausurface 11s ease-in-out infinite' }} />
      <defs>
        <linearGradient id="eauGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(80,200,220,0)" />
          <stop offset="40%" stopColor="rgba(80,200,220,0.18)" />
          <stop offset="60%" stopColor="rgba(80,200,220,0.18)" />
          <stop offset="100%" stopColor="rgba(80,200,220,0)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function VidePulse() {
  const motes = useRef(
    Array.from({ length: 20 }, () => ({
      x: 15 + Math.random() * 70,
      y: 20 + Math.random() * 60,
      r: 0.6 + Math.random() * 0.9,
      duration: 14 + Math.random() * 18,
      delay: Math.random() * 12,
      driftX: (Math.random() - 0.5) * 18,
      driftY: -8 - Math.random() * 20,
      op10: parseFloat((0.04 + Math.random() * 0.06).toFixed(3)),
      op90: parseFloat((0.02 + Math.random() * 0.04).toFixed(3)),
    }))
  ).current

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
      <style>{`
        @keyframes videpulse {
          0%,100% { opacity:0.015; transform:scale(1); }
          50%      { opacity:0.04;  transform:scale(1.08); }
        }
        ${motes.map((m, i) => `
          @keyframes mote${i} {
            0%   { transform:translate(0,0); opacity:0; }
            10%  { opacity:${m.op10}; }
            90%  { opacity:${m.op90}; }
            100% { transform:translate(${m.driftX}px,${m.driftY}px); opacity:0; }
          }
        `).join('')}
      `}</style>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 55%)',
        animation: 'videpulse 12s ease-in-out infinite',
      }} />
      <svg className="absolute inset-0 w-full h-full">
        {motes.map((m, i) => (
          <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r}
            fill="rgba(255,252,240,0.9)"
            style={{ animation: `mote${i} ${m.duration}s ${m.delay}s ease-in-out infinite` }} />
        ))}
      </svg>
    </div>
  )
}

function BrumeMist() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
      <style>{`
        @keyframes mist0 { 0%,100%{transform:translateX(-10px);opacity:0.07} 50%{transform:translateX(18px);opacity:0.12} }
        @keyframes mist1 { 0%,100%{transform:translateX(5px);opacity:0.05}  50%{transform:translateX(-14px);opacity:0.09} }
        @keyframes mist2 { 0%,100%{transform:translateX(-6px);opacity:0.06} 50%{transform:translateX(12px);opacity:0.10} }
        @keyframes mist3 { 0%,100%{transform:translateX(8px);opacity:0.04}  50%{transform:translateX(-10px);opacity:0.07} }
        @keyframes mist4 { 0%,100%{transform:translateX(-14px);opacity:0.03} 50%{transform:translateX(18px);opacity:0.06} }
      `}</style>
      {[
        { left: '5%',  top: '52%', w: 320, h: 90,  anim: 'mist0 20s ease-in-out infinite',      bg: 'rgba(160,190,220,0.18)' },
        { left: '-8%', top: '38%', w: 260, h: 75,  anim: 'mist1 26s 8s ease-in-out infinite',   bg: 'rgba(140,175,215,0.15)' },
        { left: '28%', top: '62%', w: 380, h: 100, anim: 'mist2 18s 3s ease-in-out infinite',   bg: 'rgba(175,200,225,0.16)' },
        { left: '-5%', top: '22%', w: 280, h: 65,  anim: 'mist3 32s 14s ease-in-out infinite',  bg: 'rgba(120,155,200,0.12)' },
        { left: '15%', top: '-4%', w: 360, h: 55,  anim: 'mist4 48s 28s ease-in-out infinite',  bg: 'rgba(100,135,190,0.09)' },
      ].map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: p.left, top: p.top, width: p.w, height: p.h,
          background: `radial-gradient(ellipse at center, ${p.bg} 0%, transparent 70%)`,
          filter: 'blur(14px)', animation: p.anim, mixBlendMode: 'screen',
        }} />
      ))}
    </div>
  )
}

// ─── PARTICULES COSMOS ────────────────────────────────────────────────────────

function CosmosParticles() {
  const stars = useRef(
    Array.from({ length: 38 }, (_, i) => {
      const t = Math.random()
      const color = t < 0.25 ? 'rgba(255,235,180,1)' : t < 0.5 ? 'rgba(180,210,255,1)' : 'rgba(200,220,255,1)'
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: 0.5 + Math.random() * 1.2,
        opacity: 0.1 + Math.random() * 0.35,
        period: 3 + Math.random() * 6,
        delay: Math.random() * 5,
        color,
      }
    })
  ).current

  const shooters = useRef([
    { x: 18, y: 12, period: 32, delay: 6 },
    { x: 55, y:  6, period: 45, delay: 21 },
    { x: 78, y: 18, period: 38, delay: 14 },
  ]).current

  return (
    <>
    {/* Aurora borealis — lumières du nord, très subtiles */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
      <style>{`@keyframes aurorashift{0%,100%{transform:translateY(0) scaleX(1);opacity:0.6}50%{transform:translateY(-10px) scaleX(1.05);opacity:1}}`}</style>
      <div style={{ position: 'absolute', top: '4%', left: '-15%', right: '-15%', height: '28%', background: 'linear-gradient(to bottom, rgba(20,184,166,0.07) 0%, rgba(99,102,241,0.04) 55%, transparent 100%)', animation: 'aurorashift 34s ease-in-out infinite', mixBlendMode: 'screen', filter: 'blur(22px)' }} />
      <div style={{ position: 'absolute', top: '10%', left: '-10%', right: '-10%', height: '18%', background: 'linear-gradient(to bottom, rgba(139,92,246,0.05) 0%, rgba(20,184,166,0.03) 60%, transparent 100%)', animation: 'aurorashift 50s 20s ease-in-out infinite', mixBlendMode: 'screen', filter: 'blur(28px)' }} />
    </div>
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 3, overflow: 'hidden' }}>
      <defs>
        <filter id="starGlow"><feGaussianBlur stdDeviation="0.8"/></filter>
        <filter id="nebulaBlur"><feGaussianBlur stdDeviation="18"/></filter>
        <linearGradient id="shootGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(200,220,255,0)" />
          <stop offset="100%" stopColor="rgba(200,220,255,0.85)" />
        </linearGradient>
      </defs>
      <style>{`@keyframes nebulaPulse{0%,100%{opacity:0.55}50%{opacity:1}}`}</style>
      {/* Nébuleuse — halo violet très doux derrière les étoiles */}
      <ellipse cx="48%" cy="36%" rx="35%" ry="22%"
        fill="rgba(99,102,241,0.07)" filter="url(#nebulaBlur)"
        style={{ animation: 'nebulaPulse 28s ease-in-out infinite' }} />
      <ellipse cx="62%" cy="55%" rx="22%" ry="14%"
        fill="rgba(139,92,246,0.05)" filter="url(#nebulaBlur)"
        style={{ animation: 'nebulaPulse 36s 12s ease-in-out infinite' }} />
      <style>
        {stars.map(s => `
          @keyframes startwinkle${s.id} {
            0%,100% { opacity:${s.opacity * 0.4}; }
            50%      { opacity:${s.opacity}; }
          }
        `).join('')}
        {shooters.map((s, i) => `
          @keyframes shoot${i} {
            0%,90%{ opacity:0; transform:translate(0,0); }
            91%  { opacity:0; transform:translate(0,0); }
            93%  { opacity:0.85; }
            100% { opacity:0; transform:translate(190px,95px); }
          }
        `).join('')}
      </style>
      {stars.map(s => (
        <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r}
          fill={s.color} filter="url(#starGlow)"
          style={{ animation: `startwinkle${s.id} ${s.period}s ${s.delay}s ease-in-out infinite` }} />
      ))}
      {shooters.map((s, i) => (
        <line key={`shoot${i}`}
          x1={`${s.x}%`} y1={`${s.y}%`}
          x2={`${s.x + 3.5}%`} y2={`${s.y + 1.8}%`}
          stroke="url(#shootGrad)" strokeWidth="1.2" strokeLinecap="round"
          style={{ animation: `shoot${i} ${s.period}s ${s.delay}s ease-in infinite` }} />
      ))}
    </svg>
    </>
  )
}

// ─── WORLD REVEAL ─────────────────────────────────────────────────────────────

function WorldReveal({ ritual, world, worldKey, onGoVrai, muted, onAmbienceStart }) {
  const [phase, setPhase] = useState('black') // black → world → name → phrase
  const [displayedPhrase, setDisplayedPhrase] = useState('')
  const fullPhrase = selectPhrase(ritual, world)
  const stopSoundRef = useRef(() => {})

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('world')
      if (!muted && ritual.sound && ritual.sound !== 'silence') {
        const stop = startAmbience(ritual.sound, 0.04)
        stopSoundRef.current = stop
        onAmbienceStart?.(stop)
      }
    }, 1000)
    const t2 = setTimeout(() => setPhase('name'), 2800)
    const t3 = setTimeout(() => setPhase('phrase'), 4600)
    // Ne pas stopper le son à l'unmount — App gère l'arrêt
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, []) // eslint-disable-line

  useEffect(() => {
    if (phase !== 'phrase') return
    const speeds = { feu: 30, cosmos: 38, brume: 44, eau: 46, foret: 50, vide: 64 }
    const msPerChar = speeds[worldKey] ?? 44
    let i = 0
    const interval = setInterval(() => {
      setDisplayedPhrase(fullPhrase.slice(0, i + 1))
      i++
      if (i >= fullPhrase.length) clearInterval(interval)
    }, msPerChar)
    return () => clearInterval(interval)
  }, [phase, fullPhrase, worldKey])

  const textureSpeed = {
    lourd: '18s', léger: '28s', rugueux: '12s', doux: '22s', chaud: '20s', froid: '25s',
  }
  const speed = textureSpeed[ritual.texture] || '20s'

  return (
    <div
      className="w-full h-full absolute inset-0"
      style={{ opacity: phase === 'black' ? 0 : 1, transition: 'opacity 1100ms ease' }}
    >
      {/* Image de fond du monde */}
      <div className="absolute inset-0" style={{ backgroundImage: world.bgImage, backgroundSize: 'cover', backgroundPosition: 'center', animation: `worldBreathe ${speed} ease-in-out infinite` }} />

      {/* Voile coloré selon ritual */}
      <div className="absolute inset-0" style={{ background: ritual.color ? `radial-gradient(ellipse at 50% 75%, ${ritual.color}30 0%, transparent 58%)` : 'transparent', transition: 'background 2s ease' }} />

      {/* Voile monde — palette */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${world.palette[0]}f2 0%, ${world.palette[0]}aa 30%, ${world.palette[1]}66 65%, rgba(13,27,42,0.2) 100%)` }} />

      {/* Overlays atmosphériques par monde */}
      {worldKey === 'cosmos' && phase !== 'black' && <CosmosParticles />}
      {worldKey === 'foret'  && phase !== 'black' && <ForetRays />}
      {worldKey === 'feu'    && phase !== 'black' && <FeuShimmer />}
      {worldKey === 'eau'    && phase !== 'black' && <EauRipples />}
      {worldKey === 'vide'   && phase !== 'black' && <VidePulse />}
      {worldKey === 'brume'  && phase !== 'black' && <BrumeMist />}

      {/* Watermark NÉYA — très transparent, crée de la profondeur */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
        <p style={{ fontFamily: 'Sora', fontSize: '28vw', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.025)', userSelect: 'none', lineHeight: 1 }}>
          NÉYA
        </p>
      </div>

      <style>{`
        @keyframes worldBreathe {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.04); }
        }
        @keyframes cerfdrift {
          0%, 100% { transform: translate(0px,   0px) scale(1)     rotate(0deg); }
          33%       { transform: translate(5px,  -4px) scale(1.016) rotate(0.8deg); }
          66%       { transform: translate(-3px,  4px) scale(0.986) rotate(-0.5deg); }
        }
        @keyframes worldnameappear {
          from { opacity: 0; letter-spacing: 0.65em; }
          to   { opacity: 1; letter-spacing: 0.5em; }
        }
      `}</style>

      {/* Logo NÉYA */}
      {phase !== 'black' && (
        <Fade duration={1600} className="absolute top-12 left-1/2 -translate-x-1/2">
          <NeyaLogo size="sm" />
        </Fade>
      )}

      {/* Nom du monde — révélé au centre avant la phrase */}
      {(phase === 'name' || phase === 'phrase') && (
        <div className="absolute" style={{ top: '30%', left: '50%', transform: 'translateX(-50%)' }}>
          <p style={{
            fontFamily: 'Sora', fontSize: 9, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.20)', whiteSpace: 'nowrap',
            animation: 'worldnameappear 1400ms ease forwards',
          }}>
            {WORLD_NAMES[worldKey] || worldKey}
          </p>
        </div>
      )}

      {/* Cerf — l'animal qui était déjà là */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none" style={{ paddingBottom: '5%', animation: 'cerfdrift 26s ease-in-out infinite' }}>
        <img src="/cerf.svg" alt="" aria-hidden="true" style={{ width: '55vw', maxWidth: 280, opacity: 0.6, filter: world.animalFilter }} />
      </div>

      {/* Phrase */}
      {phase === 'phrase' && (
        <Fade duration={700} slide className="absolute inset-0 flex items-center justify-center px-10" style={{ paddingBottom: '18%' }}>
          <style>{`@keyframes cursorblink{0%,100%{opacity:0}50%{opacity:0.35}}`}</style>
          <p style={{ fontFamily: 'Sora', fontWeight: 300, fontSize: 17, color: 'rgba(255,255,255,0.62)', textAlign: 'center', lineHeight: 1.9, letterSpacing: '0.06em' }}>
            {displayedPhrase}
            {displayedPhrase.length < fullPhrase.length && (
              <span style={{ animation: 'cursorblink 0.75s ease-in-out infinite', fontWeight: 300 }}>|</span>
            )}
          </p>
        </Fade>
      )}

      {/* Lien Espace Vrai */}
      {phase === 'phrase' && displayedPhrase.length === fullPhrase.length && (
        <Fade slide duration={1400} className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <button onClick={onGoVrai} style={{ fontFamily: 'Sora', fontSize: 10, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.18)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 600ms ease', padding: '14px 20px', margin: '-14px -20px' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.48)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.18)'}
            onTouchStart={e => e.currentTarget.style.color = 'rgba(255,255,255,0.48)'}
            onTouchEnd={e => e.currentTarget.style.color = 'rgba(255,255,255,0.18)'}>
            espace vrai →
          </button>
        </Fade>
      )}
    </div>
  )
}

// ─── ESPACE VRAI ──────────────────────────────────────────────────────────────

function getDominantWorld(history) {
  if (history.length < 5) return null
  const counts = {}
  history.forEach(e => { if (e.world) counts[e.world] = (counts[e.world] || 0) + 1 })
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return top && top[1] >= 3 ? top[0] : null
}

function getDominantColor(history) {
  if (history.length < 4) return null
  const counts = {}
  history.forEach(e => { if (e.color) counts[e.color] = (counts[e.color] || 0) + 1 })
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return top && top[1] >= 3 ? top[0] : null
}

function generateFakeFlux(userColor) {
  const colors = RITUAL_COLORS.map(c => c.hex)
  const entries = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: 6 + Math.random() * 88,
    y: 6 + Math.random() * 88,
    size: 4 + Math.random() * 10,
    opacity: 0.12 + Math.random() * 0.38,
    driftX: (Math.random() - 0.5) * 30,
    driftY: (Math.random() - 0.5) * 20,
    period: 14 + Math.random() * 24,
    delay: Math.random() * 14,
    immobile: Math.random() < 0.3,
  }))

  // La présence de l'utilisateur
  entries.push({
    id: 99,
    color: userColor || '#4f46e5',
    x: 32 + Math.random() * 36,
    y: 32 + Math.random() * 36,
    size: 11,
    opacity: 0.62,
    driftX: (Math.random() - 0.5) * 16,
    driftY: (Math.random() - 0.5) * 12,
    period: 18 + Math.random() * 6,
    delay: 2,
    immobile: false,
  })

  return entries
}

function EspaceVrai({ ritual, world, worldKey, history, onRestart, onResetHistory }) {
  const flux = useRef(generateFakeFlux(ritual.color)).current
  const [showRestart, setShowRestart] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showAdieu, setShowAdieu] = useState(false)
  const longPressTimer = useRef()

  useEffect(() => {
    const t1 = setTimeout(() => setShowRestart(true), 12000)
    const t2 = setTimeout(() => { setShowAdieu(true); haptic([8, 60, 8]) }, 90000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Histoire silencieuse — spirale de Fibonacci temporelle (plus récent = centre, plus vieux = bords)
  const historyDots = history.slice(0, 50).map((entry, i) => {
    const angle = i * 2.3998  // angle d'or en radians
    const radius = Math.sqrt(i + 1) * 6.2
    return {
      id: `h${i}`,
      color: entry.color || '#4f46e5',
      x: Math.max(4, Math.min(94, 50 + radius * Math.cos(angle) * 0.88)),
      y: Math.max(8, Math.min(90, 50 + radius * Math.sin(angle) * 0.62)),
      size: Math.max(0.7, 2.2 - i * 0.028),
      opacity: Math.max(0.02, 0.16 - i * 0.003),
    }
  })

  return (
    <Fade className="w-full h-full absolute inset-0" duration={1800}>
      <style>{`@keyframes espacebreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.022)}}`}</style>

      {/* Image de fond du monde — très opacifiée, transcende le monde */}
      <div className="absolute inset-0" style={{ backgroundImage: world.bgImage, backgroundSize: 'cover', backgroundPosition: 'center', animation: 'espacebreathe 38s ease-in-out infinite' }} />

      {/* Voile très épais — l'espace vrai est au-delà du monde */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${world.palette[0]}fd 0%, ${world.palette[0]}ee 35%, ${world.palette[1]}cc 75%, ${world.palette[0]}bb 100%)` }} />

      <style>{`@keyframes dominantShimmer{0%,100%{opacity:0.7}50%{opacity:1}}`}</style>

      {/* Teinte personnelle — couleur dominante de l'histoire, quasi-imperceptible */}
      {getDominantColor(history) && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2, background: `radial-gradient(ellipse at 50% 45%, ${getDominantColor(history)}0a 0%, transparent 65%)`, animation: 'dominantShimmer 28s ease-in-out infinite' }} />
      )}

      <style>{`@keyframes worldnamepulse{0%,100%{color:rgba(255,255,255,0.018)}50%{color:rgba(255,255,255,0.026)}}`}</style>

      {/* Nom du monde en fond géant — présence silencieuse */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
        <p style={{ fontFamily: 'Sora', fontSize: '32vw', fontWeight: 600, color: 'rgba(255,255,255,0.018)', userSelect: 'none', letterSpacing: '0.05em', lineHeight: 1, animation: 'worldnamepulse 45s ease-in-out infinite' }}>
          {WORLD_NAMES[worldKey] || worldKey}
        </p>
      </div>

      {/* Overlays atmosphériques dans l'espace vrai */}
      {worldKey === 'cosmos' && <CosmosParticles />}
      {worldKey === 'foret'  && <ForetRays />}
      {worldKey === 'feu'    && <FeuShimmer />}
      {worldKey === 'eau'    && <EauRipples />}
      {worldKey === 'vide'   && <VidePulse />}
      {worldKey === 'brume'  && <BrumeMist />}

      {/* SVG — histoire silencieuse + flux de présences */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="psoft"><feGaussianBlur stdDeviation="2.2"/></filter>
          <filter id="puser"><feGaussianBlur stdDeviation="3.5"/></filter>
          <filter id="phistory"><feGaussianBlur stdDeviation="1.0"/></filter>
        </defs>

        {/* Présences passées — traces silencieuses */}
        {historyDots.map(p => (
          <circle
            key={p.id}
            cx={`${p.x}%`} cy={`${p.y}%`}
            r={p.size}
            fill={p.color}
            opacity={p.opacity}
            filter="url(#phistory)"
            style={p.id === 'h0' ? { animation: 'h0pulse 3.8s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: 'center' } : undefined}
          />
        ))}

        {/* Flux anonyme live */}
        {flux.map(p => (
          <circle key={p.id} cx={`${p.x}%`} cy={`${p.y}%`} r={p.size} fill={p.color} opacity={p.opacity}
            filter={p.id === 99 ? 'url(#puser)' : 'url(#psoft)'}
            style={{ animation: p.immobile ? 'none' :
              p.id === 99
                ? `drift-${p.id} ${p.period}s ${p.delay}s ease-in-out infinite, userPresencePulse 4.2s ease-in-out infinite`
                : `drift-${p.id} ${p.period}s ${p.delay}s ease-in-out infinite`
            }} />
        ))}
        {/* Ripple émanant de la présence utilisateur */}
        {(() => {
          const u = flux.find(p => p.id === 99)
          if (!u) return null
          return [0, 1].map(i => (
            <circle key={`ur${i}`} cx={`${u.x}%`} cy={`${u.y}%`} r="0"
              fill="none" stroke={u.color} strokeWidth="0.5"
              style={{ animation: `userRipple 7s ${i * 3.5}s ease-out infinite` }} />
          ))
        })()}
        <style>
          {flux.filter(p => !p.immobile).map(p => `
            @keyframes drift-${p.id} {
              0%,100% { transform:translate(0,0); }
              25%     { transform:translate(${p.driftX * 0.35}px,${p.driftY * 0.25}px); }
              50%     { transform:translate(${p.driftX}px,${p.driftY}px); }
              75%     { transform:translate(${p.driftX * 0.55}px,${p.driftY * 0.75}px); }
            }
          `).join('')}
          {`@keyframes userPresencePulse {
            0%, 100% { opacity: 0.50; }
            50%       { opacity: 0.72; }
          }
          @keyframes h0pulse {
            0%, 100% { transform: scale(1);   opacity: 0.16; }
            50%       { transform: scale(2.6); opacity: 0.06; }
          }
          @keyframes userRipple {
            0%   { r: 8px; opacity: 0.22; }
            100% { r: 48px; opacity: 0; }
          }`}
        </style>
      </svg>

      <style>{`@keyframes cerfdrift-ghost{0%,100%{transform:translate(0,0) scale(1) rotate(0deg)}40%{transform:translate(-4px,-3px) scale(1.008) rotate(-0.6deg)}75%{transform:translate(3px,3px) scale(0.993) rotate(0.4deg)}}`}</style>

      {/* Cerf fantôme — l'animal était là avant, il est encore là */}
      <Fade duration={3000} delay={1200} className="absolute inset-0 flex items-end justify-end pointer-events-none" style={{ paddingBottom: '8%', paddingRight: '4%' }}>
        <img src="/cerf.svg" alt="" aria-hidden="true" style={{ width: '28vw', maxWidth: 130, opacity: 0.07, filter: world.animalFilter, animation: 'cerfdrift-ghost 42s ease-in-out infinite' }} />
      </Fade>

      {/* Compteur de présences passées — ultra-discret */}
      {history.length > 1 && (
        <Fade slide duration={2000} delay={5000} className="absolute" style={{ top: '22%', left: '50%', transform: 'translateX(-50%)' }}>
          <p style={{ fontFamily: 'Sora', fontSize: 8, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.07)', whiteSpace: 'nowrap' }}>
            {history.length} présences
          </p>
        </Fade>
      )}

      {/* Première présence — marqueur invisible pour le nouvel utilisateur */}
      {history.length === 1 && (
        <Fade slide duration={2800} delay={7000} className="absolute" style={{ top: '48%', left: '56%' }}>
          <p style={{ fontFamily: 'Sora', fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>
            première présence
          </p>
        </Fade>
      )}

      {/* Message universel */}
      <Fade slide duration={2400} delay={800} className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center">
        <p style={{ fontFamily: 'Sora', fontSize: 11, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.16)' }}>
          tu n'es pas seul·e
        </p>
      </Fade>

      {/* Whisper du monde — spécifique à l'univers */}
      {world.whisper && (
        <Fade slide duration={2000} delay={4500} className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center">
          <p style={{ fontFamily: 'Sora', fontSize: 9, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.09)' }}>
            {world.whisper}
          </p>
        </Fade>
      )}

      {/* Retour au même monde — reconnaissance subtile */}
      {history.length >= 2 && history[1]?.world === worldKey && (
        <Fade slide duration={2200} delay={3200} className="absolute text-center" style={{ top: '18%', left: '50%', transform: 'translateX(-50%)' }}>
          <p style={{ fontFamily: 'Sora', fontSize: 7, letterSpacing: '0.42em', color: 'rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>
            encore ici
          </p>
        </Fade>
      )}

      {/* Insight silencieux — si ce monde est le monde dominant de l'histoire */}
      {getDominantWorld(history) === worldKey && (
        <Fade slide duration={2500} delay={8500} className="absolute text-center" style={{ bottom: '32%', left: '50%', transform: 'translateX(-50%)' }}>
          <p style={{ fontFamily: 'Sora', fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>
            tu reviens souvent ici
          </p>
        </Fade>
      )}

      {/* Résumé du rituel — trace silencieuse */}
      {ritual.color && ritual.texture && ritual.sound && (
        <Fade slide duration={1800} delay={2500} className="absolute" style={{ bottom: '13%', right: '6%' }}>
          <p style={{ fontFamily: 'Sora', fontSize: 7, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.07)', textAlign: 'right', lineHeight: 2 }}>
            {WORLD_NAMES[worldKey] || worldKey}<br />
            {RITUAL_COLORS.find(c => c.hex === ritual.color)?.label}<br />
            {ritual.texture} · {ritual.sound}
          </p>
        </Fade>
      )}

      {/* Voile nocturne — teinté par le monde, descend doucement */}
      {showAdieu && (
        <Fade duration={9000} className="absolute inset-0 pointer-events-none" style={{ zIndex: 24, background: `${world.palette[0]}6e` }} />
      )}

      {/* Message de congé après longue présence — adapté à l'heure */}
      {showAdieu && (() => {
        const h = new Date().getHours()
        const main = (h >= 22 || h < 5) ? 'bonne nuit' : (h < 12) ? 'à tout à l\'heure' : 'à demain'
        const sub = (h >= 22 || h < 5) ? 'le sommeil mérite aussi sa place' : 'tu peux partir maintenant'
        return (
          <Fade slide duration={3000} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 25 }}>
            <p style={{ fontFamily: 'Sora', fontWeight: 300, fontSize: 15, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.28)', textAlign: 'center', marginBottom: 12 }}>
              {main}
            </p>
            <p style={{ fontFamily: 'Sora', fontSize: 8, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.10)', textAlign: 'center' }}>
              {sub}
            </p>
          </Fade>
        )
      })()}

      {/* Bouton nouveau rituel */}
      {showRestart && !showAdieu && (
        <Fade slide duration={1200} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button onClick={onRestart} style={{ fontFamily: 'Sora', fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.14)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 600ms ease', padding: '12px 16px', margin: '-12px -16px' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.14)'}
            onTouchStart={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            onTouchEnd={e => e.currentTarget.style.color = 'rgba(255,255,255,0.14)'}>
            nouveau rituel
          </button>
        </Fade>
      )}

      {/* Logo discret — long-press pour réinitialiser l'histoire */}
      <Fade duration={2000} delay={400} className="absolute top-10 left-1/2 -translate-x-1/2">
        <div
          onMouseDown={() => { longPressTimer.current = setTimeout(() => setShowResetConfirm(true), 1800) }}
          onMouseUp={() => clearTimeout(longPressTimer.current)}
          onMouseLeave={() => clearTimeout(longPressTimer.current)}
          onTouchStart={() => { longPressTimer.current = setTimeout(() => setShowResetConfirm(true), 1800) }}
          onTouchEnd={() => clearTimeout(longPressTimer.current)}
          style={{ cursor: 'default' }}
        >
          <NeyaLogo size="sm" opacity={0.22} />
        </div>
      </Fade>

      {/* Confirmation reset histoire */}
      {showResetConfirm && (
        <Fade className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 30, background: 'rgba(5,8,16,0.88)' }}>
          <p style={{ fontFamily: 'Sora', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>
            effacer toutes les présences ?
          </p>
          <div className="flex gap-8">
            <button onClick={() => setShowResetConfirm(false)} style={{ fontFamily: 'Sora', fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.22)', background: 'none', border: 'none', cursor: 'pointer' }}>
              annuler
            </button>
            <button onClick={() => { onResetHistory(); setShowResetConfirm(false) }} style={{ fontFamily: 'Sora', fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>
              effacer
            </button>
          </div>
        </Fade>
      )}
    </Fade>
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────────

const INITIAL_RITUAL = { color: null, texture: null, sound: null, completedAt: null }

export default function App() {
  const [screen, setScreen] = useState('splash')
  const [step, setStep] = useState(0)
  const [ritual, setRitual] = useState(INITIAL_RITUAL)
  const [muted, setMuted] = useState(false)
  const [history, setHistory] = useState(() => loadHistory())
  const [blackout, setBlackout] = useState(false)
  const blackoutTimer = useRef()
  const stopAmbienceRef = useRef(() => {})

  // Préchargement de toutes les images monde
  useEffect(() => {
    const srcs = ['/bg-onboarding.png', '/bg-brume.png', '/bg-foret.png', '/bg-cosmos.png', '/bg-feu.png', '/bg-eau.png', '/bg-vide.png', '/bg-vrai.png', '/cerf.svg']
    srcs.forEach(src => { const img = new Image(); img.src = src })
  }, [])

  // Transition noire cinématique entre les écrans majeurs
  const goTo = useCallback((nextScreen, nextStep = 0, withBlackout = false) => {
    if (withBlackout) {
      setBlackout(true)
      clearTimeout(blackoutTimer.current)
      blackoutTimer.current = setTimeout(() => {
        setScreen(nextScreen)
        setStep(nextStep)
        setTimeout(() => setBlackout(false), 80)
      }, 380)
    } else {
      setScreen(nextScreen)
      setStep(nextStep)
    }
  }, [])

  const worldKey = selectWorld(ritual)
  const world = WORLDS[worldKey] ?? WORLDS.brume

  const handleRitualChange = useCallback((updated) => setRitual(updated), [])

  const handleRitualStepComplete = useCallback((completedStep) => {
    if (completedStep < 2) {
      haptic([6])
      setStep(s => s + 1)
    } else {
      haptic([12, 60, 18])
      const completed = { ...ritual, completedAt: new Date() }
      const wk = selectWorld(completed)
      saveToHistory(completed, wk)
      setHistory(loadHistory())
      setRitual(completed)
      goTo('world', 0, true)
    }
  }, [ritual, goTo])

  const handleOnboardingNext = useCallback(() => {
    if (step < 2) goTo('onboarding', step + 1, true)
    else goTo('ritual', 0, true)
  }, [step, goTo])

  // Navigation clavier globale
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'm' || e.key === 'M') { setMuted(m => !m); return }
      if (e.key !== 'Enter' && e.key !== ' ') return
      if (screen === 'onboarding') handleOnboardingNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [screen, handleOnboardingNext])

  const handleGoVrai = useCallback(() => { haptic([4]); goTo('vrai', 0, true) }, [goTo])

  const handleAmbienceStart = useCallback((stopFn) => {
    stopAmbienceRef.current = stopFn
  }, [])

  // Mute/unmute affect l'ambiance en cours
  useEffect(() => {
    stopAmbienceRef.current?.setVolume?.(muted ? 0 : 0.04, 0.6)
  }, [muted])

  // Fade ambient sound to near-silence when "à demain" appears after 90s
  useEffect(() => {
    if (screen !== 'vrai') return
    const t = setTimeout(() => {
      stopAmbienceRef.current?.setVolume?.(0.008, 8)
    }, 90000)
    return () => clearTimeout(t)
  }, [screen])

  const handleRestart = useCallback(() => {
    haptic([6])
    stopAmbienceRef.current()
    stopAmbienceRef.current = () => {}
    setRitual(INITIAL_RITUAL)
    goTo('ritual', 0, true)
  }, [goTo])

  const handleResetHistory = useCallback(() => {
    try { localStorage.removeItem('neya_history') } catch {}
    setHistory([])
  }, [])

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: '#050810', fontFamily: 'Inter, sans-serif', color: 'white' }}>

      {/* Grain texture — matière picturale (DA) */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 40,
        opacity: 0.038,
        mixBlendMode: 'overlay',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '300px 300px',
      }} />

      {/* Transition noire cinématique */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 45, background: '#050810', opacity: blackout ? 1 : 0, transition: `opacity ${blackout ? 380 : 700}ms ease` }} />

      {/* Bouton mute */}
      <button
        onClick={() => setMuted(m => !m)}
        aria-label={muted ? 'Activer le son' : 'Couper le son'}
        style={{ position: 'absolute', top: 20, right: 20, zIndex: 50, fontFamily: 'Sora', fontSize: 11, color: 'rgba(255,255,255,0.18)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em', transition: 'color 400ms ease' }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.18)'}
        onTouchStart={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
        onTouchEnd={e => e.currentTarget.style.color = 'rgba(255,255,255,0.18)'}
      >
        {muted ? '○' : '●'}
      </button>

      {screen === 'splash'     && <NeyaSplash hasHistory={history.length > 0} lastWorld={history[0]?.world} lastTs={history[0]?.ts} onDone={() => { if (history.length > 0) { haptic([4]); goTo('ritual', 0, true) } else goTo('onboarding') }} />}
      {screen === 'onboarding' && <Onboarding step={step} onNext={handleOnboardingNext} />}
      {screen === 'ritual'     && <RitualFlow step={step} ritual={ritual} onChange={handleRitualChange} onComplete={handleRitualStepComplete} muted={muted} />}
      {screen === 'world'      && <WorldReveal ritual={ritual} world={world} worldKey={worldKey} muted={muted} onGoVrai={handleGoVrai} onAmbienceStart={handleAmbienceStart} />}
      {screen === 'vrai'       && <EspaceVrai ritual={ritual} world={world} worldKey={worldKey} history={history} onRestart={handleRestart} onResetHistory={handleResetHistory} />}
    </div>
  )
}
