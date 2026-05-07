import { useState, useEffect, useCallback, useRef } from 'react'

const B = import.meta.env.BASE_URL

// ─── ARCHETYPES ───────────────────────────────────────────────────────────────

const ARCHETYPES = {
  resilience: {
    profil: 'Porteur·se de Feu',
    animal: 'L\'Aigle intérieur',
    bg: 'bg-feu.png',
    color: '#f59e0b',
    shadow: 'rgba(245,158,11,0.4)',
    rgb: '245,158,11',
    forces: ['Courage', 'Transformation', 'Détermination', 'Force intérieure'],
    desc: `Tu avances même quand la route est difficile. En toi vit une flamme que rien n'éteint — une force tranquille qui transforme chaque obstacle en passage vers quelque chose de plus grand.\n\nTon chemin : nourrir ce feu intérieur sans te brûler, et offrir ta lumière à ceux qui en ont besoin.`,
    intentions: [
      "Ce que tu ne peux pas changer, transforme-le. Ce que tu peux changer, fais-le maintenant.",
      "Ta force n'est pas dans l'absence de peur, mais dans le choix d'avancer malgré elle.",
      "Chaque obstacle est un passage déguisé. Tu sais les traverser.",
      "L'action, même imparfaite, est toujours plus puissante que l'attente parfaite.",
      "Ta flamme intérieure ne cherche pas à réchauffer le monde. Elle le réchauffe naturellement.",
      "Ce que tu construis chaque jour, même en silence, compte plus que tu ne le crois.",
      "Tu n'as pas besoin d'aller vite. Tu as besoin d'avancer.",
    ],
    routines: [
      { title: 'La Minute de Feu', desc: 'Prends 60 secondes pour noter UNE chose que tu vas transformer aujourd\'hui. Une seule.', duration: '1 min' },
      { title: 'Le Corps en Mouvement', desc: '3 respirations profondes + une intention de mouvement pour la journée. Ton corps est ton alliée.', duration: '3 min' },
      { title: 'L\'Ancrage du Soir', desc: 'Ce soir, note une chose que tu as surmontée. Petite ou grande — chaque victoire compte.', duration: '5 min' },
    ],
    quetes: [
      { title: 'Le Premier Pas', desc: 'Fais quelque chose que tu remettais depuis plus de 2 semaines. Une seule action suffit.', icon: '◈' },
      { title: 'La Transformation', desc: 'Identifie une peur et fais UNE action en sa direction, même minuscule. C\'est ça, le courage.', icon: '◆' },
      { title: 'Le Phare', desc: 'Guide quelqu\'un vers quelque chose de positif cette semaine, par ton exemple ou tes mots.', icon: '✦' },
    ],
  },
  presence: {
    profil: 'Ancreur·euse de Présence',
    animal: 'Le Cerf des eaux',
    bg: 'bg-eau.png',
    color: '#14b8a6',
    shadow: 'rgba(20,184,166,0.4)',
    rgb: '20,184,166',
    forces: ['Douceur', 'Harmonie', 'Ancrage', 'Empathie'],
    desc: `Tu es un·e bâtisseur·se de paix intérieure. Ton calme profond inspire ceux qui t'entourent. Doté·e d'une grande sagesse intuitive, tu sais écouter ce qui est essentiel, même dans le tumulte.\n\nTon chemin : préserver ton espace intérieur, et rayonner naturellement autour de toi.`,
    intentions: [
      "Ta paix intérieure est ton plus grand cadeau au monde.",
      "Là où tu es vraiment présent·e, quelque chose de beau peut naître.",
      "Le calme n'est pas l'absence d'émotion. C'est la présence à ce qui est.",
      "Tu crées l'espace où les autres respirent. C'est une force rare.",
      "Ta douceur n'est pas une faiblesse. C'est une intelligence du cœur.",
      "Aujourd'hui, laisse le moment être ce qu'il est, sans vouloir le changer.",
      "Tes racines sont profondes. Rien ne peut vraiment t'emporter.",
    ],
    routines: [
      { title: 'Le Silence du Matin', desc: '3 minutes sans écran, juste ta respiration et ce que tu ressens en ce moment précis.', duration: '3 min' },
      { title: 'L\'Écoute Profonde', desc: 'Aujourd\'hui, offre une vraie écoute à quelqu\'un sans donner de conseil. Juste être là.', duration: 'Dans la journée' },
      { title: 'La Gratitude Douce', desc: 'Note 2 choses simples et belles pour lesquelles tu es reconnaissant·e aujourd\'hui.', duration: '5 min' },
    ],
    quetes: [
      { title: 'L\'Île de Paix', desc: 'Crée un espace dans ta vie entièrement dédié à ton ressourcement. Préserve-le jalousement.', icon: '◎' },
      { title: 'Le Gardien', desc: 'Dis non à quelque chose qui épuise ton énergie. Protéger ton espace intérieur, c\'est un acte d\'amour.', icon: '◇' },
      { title: 'La Connexion', desc: 'Crée un moment de vraie présence avec quelqu\'un que tu aimes. Sans écran, sans agenda.', icon: '✦' },
    ],
  },
  sagesse: {
    profil: 'Éveilleur·euse de Sens',
    animal: 'Le Loup de la brume',
    bg: 'bg-brume.png',
    color: '#6366f1',
    shadow: 'rgba(99,102,241,0.4)',
    rgb: '99,102,241',
    forces: ['Intuition', 'Profondeur', 'Perception', 'Sagesse'],
    desc: `Tu lis ce que les autres ne voient pas. Dans le silence, tu captes des vérités que peu peuvent entendre. Ta profondeur est une forme rare et précieuse de lumière.\n\nTon chemin : faire confiance à ton intelligence intérieure — elle ne t'a jamais vraiment trompé·e.`,
    intentions: [
      "Ce que tu vois en silence, peu de gens peuvent le voir. Fais confiance à ta perception.",
      "La vraie connaissance de soi est un voyage sans destination. C'est ça, sa beauté.",
      "Chaque question que tu te poses est déjà une forme de réponse.",
      "Ta profondeur n'est pas un fardeau. C'est ta façon d'être vraiment vivant·e.",
      "Observe. Tout est là, dans les détails que les autres ne remarquent pas.",
      "Ton intuition parle doucement. Apprends à lui faire plus de place aujourd'hui.",
      "Le sens ne se trouve pas. Il se crée, à chaque décision consciente.",
    ],
    routines: [
      { title: 'L\'Observation', desc: 'Observe une chose que tu n\'avais jamais vraiment regardée. Laisse-toi surprendre par l\'évidence.', duration: '5 min' },
      { title: 'La Question du Jour', desc: 'Pose-toi UNE question profonde et laisse-la infuser toute la journée sans chercher de réponse.', duration: 'Dans la journée' },
      { title: 'Le Journal de l\'Âme', desc: 'Écris 5 lignes libres, sans filtre ni jugement. Laisse parler ce qui vit en toi.', duration: '10 min' },
    ],
    quetes: [
      { title: 'La Cartographie', desc: 'Dessine ou écris en quelques mots la carte de ton monde intérieur tel qu\'il est aujourd\'hui.', icon: '◇' },
      { title: 'Le Mentor', desc: 'Transmets une sagesse que tu as acquise à quelqu\'un qui pourrait en avoir besoin maintenant.', icon: '◈' },
      { title: 'La Vision', desc: 'Définis en 3 mots le sens profond que tu veux donner à ta vie en ce moment. Note-les.', icon: '✦' },
    ],
  },
  lumiere: {
    profil: 'Créateur·trice de Lumière',
    animal: 'L\'Ours lumineux',
    bg: 'bg-foret.png',
    color: '#ec4899',
    shadow: 'rgba(236,72,153,0.4)',
    rgb: '236,72,153',
    forces: ['Créativité', 'Joie', 'Confiance', 'Abondance'],
    desc: `Tu transformes tout ce que tu touches. Ta joie est contagieuse, ta créativité infinie. Là où tu passes, quelque chose de nouveau et de beau prend vie naturellement.\n\nTon chemin : ne jamais retenir ta lumière — le monde en a profondément besoin.`,
    intentions: [
      "Ta joie est une forme de résistance. Ne la restreins jamais.",
      "Là où tu passes, quelque chose de beau prend vie. C'est ton don naturel.",
      "Créer n'est pas optionnel pour toi. C'est une façon de respirer.",
      "Le monde a besoin de ta couleur, pas d'une version filtrée de toi.",
      "Ta créativité n'est pas un talent parmi d'autres. C'est une énergie de vie.",
      "Aujourd'hui, laisse quelque chose naître sans jugement ni attente.",
      "Ta lumière n'a pas besoin de permission pour exister. Brille.",
    ],
    routines: [
      { title: 'L\'Étincelle', desc: 'Crée quelque chose, n\'importe quoi, en 10 minutes. Dessine, écris, chante — sans objectif.', duration: '10 min' },
      { title: 'Le Partage', desc: 'Partage quelque chose de beau avec quelqu\'un aujourd\'hui — une image, un mot, un sourire.', duration: 'Dans la journée' },
      { title: 'La Joie Consciente', desc: 'Identifie UN moment de joie pure dans ta journée et savoure-le pleinement, sans te presser.', duration: '5 min' },
    ],
    quetes: [
      { title: 'L\'Œuvre', desc: 'Crée quelque chose et partage-le avec au moins une personne. Ton œuvre mérite d\'exister.', icon: '✦' },
      { title: 'La Générosité', desc: 'Offre ton talent à quelqu\'un sans rien attendre en retour. La joie de donner est infinie.', icon: '◇' },
      { title: 'La Source', desc: 'Identifie ce qui nourrit vraiment ta créativité et crée l\'espace pour le cultiver chaque jour.', icon: '◈' },
    ],
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
    text: "Quand le doute s'installe profondément, qu'est-ce qui te recentre ?",
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

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function getDailyIntention(archetypeKey) {
  const pool = ARCHETYPES[archetypeKey].intentions
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return pool[dayOfYear % pool.length]
}

function greetingStr() {
  const h = new Date().getHours()
  if (h < 5) return 'Bonne nuit'
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bonne journée'
  return 'Bonsoir'
}

function loadProfile() {
  try { return JSON.parse(localStorage.getItem('neya_profile') || 'null') } catch { return null }
}
function saveProfile(archetype) {
  localStorage.setItem('neya_profile', JSON.stringify({ archetype, savedAt: Date.now() }))
}
function loadRoutines() {
  try { return JSON.parse(localStorage.getItem(`neya_routines_${todayKey()}`) || '[]') } catch { return [] }
}
function saveRoutines(completed) {
  localStorage.setItem(`neya_routines_${todayKey()}`, JSON.stringify(completed))
}
function loadQuetes(archetypeKey) {
  try { return JSON.parse(localStorage.getItem(`neya_quetes_${archetypeKey}`) || '[]') } catch { return [] }
}
function saveQuetes(archetypeKey, completed) {
  localStorage.setItem(`neya_quetes_${archetypeKey}`, JSON.stringify(completed))
}

// ─── TYPING TEXT ──────────────────────────────────────────────────────────────

function TypingText({ text, delay = 0, speed = 38, style: s }) {
  const [len, setLen] = useState(0)
  const [done, setDone] = useState(false)
  useEffect(() => {
    setLen(0)
    setDone(false)
    let i = 0
    const tid = setTimeout(() => {
      const iv = setInterval(() => {
        i++
        setLen(i)
        if (i >= text.length) { setDone(true); clearInterval(iv) }
      }, speed)
      return () => clearInterval(iv)
    }, delay)
    return () => clearTimeout(tid)
  }, [text, delay, speed])
  return (
    <span style={s}>
      {text.slice(0, len)}
      {!done && <span style={{ animation: 'cursorblink 0.75s ease-in-out infinite' }}>|</span>}
    </span>
  )
}

// ─── LOGO ─────────────────────────────────────────────────────────────────────

function NeyaLogo({ size = 'md', onTap }) {
  const cfg = { sm: [20, 13], md: [28, 17], lg: [36, 22] }[size]
  return (
    <div
      onClick={onTap}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: onTap ? 'pointer' : 'default' }}
    >
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

function BgScreen({ bg, overlay = 'rgba(5,8,16,0.48)', breathe = false, children }) {
  return (
    <div style={{
      width: '100vw', height: '100dvh', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{
        position: 'absolute',
        top: '-5%', left: '-5%', right: '-5%', bottom: '-5%',
        backgroundImage: `url(${B}${bg})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        animation: breathe ? 'bgbreathe 26s ease-in-out infinite' : 'none',
        transformOrigin: 'center center',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: overlay }} />
      <svg style={{ display: 'none' }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="overlay" />
        </filter>
      </svg>
      <div style={{ position: 'absolute', inset: 0, filter: 'url(#grain)', opacity: 0.038, pointerEvents: 'none', background: 'white' }} />
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
    const t2 = setTimeout(() => setShowBtn(true), 2000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  return (
    <BgScreen bg="bg-onboarding.png" overlay="rgba(5,8,16,0.42)" breathe>
      <div style={{ padding: '60px 28px 52px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', width: '100%' }}>
        <NeyaLogo size="md" />
        <div style={{ textAlign: 'center', opacity: vis ? 1 : 0, transition: 'opacity 1.6s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <h1 style={{
            fontFamily: 'Sora, sans-serif', fontWeight: 300,
            fontSize: 'clamp(30px, 8vw, 40px)', color: 'white',
            lineHeight: 1.25, margin: 0,
            textShadow: '0 2px 40px rgba(0,0,0,0.6)',
            letterSpacing: '-0.01em',
          }}>
            Et toi, ça va<br />vraiment ?
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 300,
            fontSize: 15.5, color: 'rgba(255,255,255,0.58)',
            margin: 0, lineHeight: 1.7,
          }}>
            Un espace pour ce que tu ressens.<br />Vraiment.
          </p>
        </div>
        <button
          onClick={() => { haptic(20); onStart() }}
          style={{
            width: '100%', padding: '17px 0',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.28)',
            borderRadius: 14, cursor: 'pointer',
            fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 400,
            letterSpacing: '0.22em', color: 'white', textTransform: 'uppercase',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            opacity: showBtn ? 1 : 0, transition: 'opacity 0.9s ease',
          }}
        >
          Commencer
        </button>
      </div>
    </BgScreen>
  )
}

// ─── INTRO ────────────────────────────────────────────────────────────────────

function IntroScreen({ onStart }) {
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 120); return () => clearTimeout(t) }, [])
  return (
    <BgScreen bg="bg-cosmos.png" overlay="rgba(5,8,16,0.72)" breathe>
      <div style={{ padding: '60px 28px 52px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', width: '100%', opacity: vis ? 1 : 0, transition: 'opacity 0.9s ease' }}>
        <NeyaLogo size="sm" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.65)' }}>◇</span>
          </div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(24px, 6.5vw, 30px)', color: 'white', margin: 0, lineHeight: 1.25 }}>
            Prêt·e pour ton<br />exploration intérieure ?
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            {[
              ['◈', `Tu vas répondre à ${QUESTIONS.length} questions conçues pour te guider vers toi-même.`],
              ['◎', 'Pas de bonne ou de mauvaise réponse. Réponds avec ton cœur, simplement.'],
            ].map(([icon, text], i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 13, textAlign: 'left' }}>
                <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, flexShrink: 0, paddingTop: 1 }}>{icon}</span>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.65 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => { haptic(20); onStart() }} style={{ width: '100%', padding: '17px 0', background: 'rgba(99,102,241,0.75)', border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 400, letterSpacing: '0.2em', color: 'white', textTransform: 'uppercase', boxShadow: '0 4px 28px rgba(99,102,241,0.35)' }}>
          Commencer l'aventure
        </button>
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

  const handleContinue = () => {
    if (!selected) return
    const newAnswers = [...answers]
    newAnswers[idx] = selected
    haptic(18)
    if (idx < QUESTIONS.length - 1) {
      setFading(true)
      setTimeout(() => { setAnswers(newAnswers); setIdx(idx + 1); setSelected(null); setFading(false) }, 380)
    } else {
      onComplete(newAnswers)
    }
  }

  return (
    <BgScreen bg={q.bg} overlay="rgba(5,8,16,0.56)">
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.07)', zIndex: 10 }}>
        <div style={{ height: '100%', background: 'rgba(255,255,255,0.48)', width: `${progress * 100}%`, transition: 'width 0.5s ease' }} />
      </div>
      <div style={{ padding: '50px 24px 36px', display: 'flex', flexDirection: 'column', height: '100%', width: '100%', opacity: fading ? 0 : 1, transition: 'opacity 0.35s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.32)', letterSpacing: '0.2em' }}>{idx + 1} / {QUESTIONS.length}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', gap: 10, marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(22px, 5.5vw, 28px)', color: 'white', margin: 0, lineHeight: 1.2, textShadow: '0 2px 24px rgba(0,0,0,0.5)' }}>{q.title}</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14.5, color: 'rgba(255,255,255,0.62)', margin: 0, lineHeight: 1.65, padding: '0 4px' }}>{q.text}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {q.choices.map((c, i) => {
            const sel = selected === c.type
            return (
              <button key={i} onClick={() => { haptic(12); setSelected(c.type) }} style={{ width: '100%', padding: '13px 15px', background: sel ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.05)', border: `1px solid ${sel ? 'rgba(255,255,255,0.36)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', transition: 'all 0.2s ease', transform: sel ? 'scale(1.012)' : 'scale(1)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: sel ? 'white' : 'rgba(255,255,255,0.22)', transition: 'background 0.2s ease', boxShadow: sel ? '0 0 8px rgba(255,255,255,0.5)' : 'none' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13.5, lineHeight: 1.45, color: sel ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)', transition: 'color 0.2s ease' }}>{c.text}</span>
              </button>
            )
          })}
        </div>
        <div style={{ marginTop: 18, opacity: selected !== null ? 1 : 0, transition: 'opacity 0.4s ease', pointerEvents: selected !== null ? 'all' : 'none' }}>
          <button onClick={handleContinue} style={{ width: '100%', padding: '16px 0', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.26)', borderRadius: 14, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12, fontWeight: 400, letterSpacing: '0.22em', color: 'white', textTransform: 'uppercase', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
            {idx === QUESTIONS.length - 1 ? 'Terminer' : 'Continuer'}
          </button>
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
    const t2 = setTimeout(() => setShowBtn(true), 2600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  return (
    <BgScreen bg="bg-cosmos-alt.png" overlay="rgba(5,8,16,0.62)" breathe>
      <div style={{ padding: '60px 28px 52px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', width: '100%' }}>
        <NeyaLogo size="sm" />
        <div style={{ textAlign: 'center', opacity: vis ? 1 : 0, transition: 'opacity 1.5s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{ position: 'relative', width: 72, height: 72 }}>
            <div style={{
              position: 'absolute', inset: -8,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.15)',
              animation: 'pulsering 3.2s ease-in-out infinite',
            }} />
            <div style={{ width: 72, height: 72, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)' }}>
              <img src={`${B}cerf.svg`} style={{ width: 38, height: 38, opacity: 0.78 }} alt="" />
            </div>
          </div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(24px, 6vw, 30px)', color: 'white', margin: 0, lineHeight: 1.3 }}>
            Ton guide intérieur<br />s'apprête à se révéler...
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 15, color: 'rgba(255,255,255,0.58)', margin: 0, lineHeight: 1.72 }}>
            Il est l'écho de ta lumière unique.<br />Es-tu prêt·e à le rencontrer ?
          </p>
        </div>
        <button onClick={() => { haptic([30, 50, 20]); onReveal() }} style={{ width: '100%', padding: '17px 0', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.26)', borderRadius: 14, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 400, letterSpacing: '0.2em', color: 'white', textTransform: 'uppercase', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', opacity: showBtn ? 1 : 0, transition: 'opacity 0.9s ease' }}>
          Découvrir mon guide
        </button>
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
  const [forcesShown, setForcesShown] = useState(0)

  useEffect(() => { const t = setTimeout(() => setScreenVis(true), 200); return () => clearTimeout(t) }, [])

  useEffect(() => {
    if (phase === 1 && phaseVis) {
      setForcesShown(0)
      arch.forces.forEach((_, i) => {
        setTimeout(() => setForcesShown(prev => Math.max(prev, i + 1)), 180 + i * 200)
      })
    }
  }, [phase, phaseVis])

  const nextPhase = () => {
    haptic(15)
    if (phase < 2) {
      setPhaseVis(false)
      setTimeout(() => { setPhase(p => p + 1); setPhaseVis(true) }, 300)
    } else { onContinue() }
  }

  return (
    <BgScreen bg={arch.bg} overlay="rgba(5,8,16,0.50)" breathe>
      <div style={{ padding: '60px 28px 52px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', width: '100%', opacity: screenVis ? 1 : 0, transition: 'opacity 0.9s ease' }}>
        <NeyaLogo size="sm" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%', textAlign: 'center', opacity: phaseVis ? 1 : 0, transition: 'opacity 0.28s ease' }}>

          {phase === 0 && (
            <>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 100, height: 100 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${arch.color}55`, animation: 'pulsering 3s ease-in-out infinite' }} />
                <img src={`${B}cerf.svg`} alt="" style={{ width: 76, height: 76, opacity: 0.8, filter: `drop-shadow(0 0 30px ${arch.shadow})`, position: 'relative', zIndex: 1 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: arch.color, letterSpacing: '0.28em', margin: 0, textTransform: 'uppercase' }}>Profil mental</p>
                <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(26px, 6.5vw, 32px)', color: 'white', margin: 0, lineHeight: 1.2, textShadow: `0 0 40px ${arch.shadow}` }}>{arch.profil}</h1>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13.5, color: 'rgba(255,255,255,0.42)', margin: 0, letterSpacing: '0.05em' }}>{arch.animal}</p>
              </div>
            </>
          )}

          {phase === 1 && (
            <>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 22, color: 'white', margin: 0 }}>Tes forces naturelles</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
                {arch.forces.map((f, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${arch.color}55`,
                    borderRadius: 12, padding: '18px 12px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    opacity: forcesShown > i ? 1 : 0,
                    transform: forcesShown > i ? 'translateY(0)' : 'translateY(14px)',
                    transition: 'opacity 0.42s ease, transform 0.42s ease',
                  }}>
                    <span style={{ fontSize: 13, color: arch.color }}>◈</span>
                    <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 13.5, color: 'white', textAlign: 'center' }}>{f}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {phase === 2 && (
            <div style={{ background: 'rgba(255,255,255,0.055)', border: `1px solid ${arch.color}44`, borderRadius: 16, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {arch.desc.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: i === 0 ? 15.5 : 14, color: i === 0 ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.52)', margin: 0, lineHeight: 1.75, fontStyle: i === 0 ? 'italic' : 'normal' }}>
                  {i === 0 ? `"${para}"` : para}
                </p>
              ))}
            </div>
          )}
        </div>

        <button onClick={nextPhase} style={{ width: '100%', padding: '17px 0', background: phase === 2 ? arch.color : 'rgba(255,255,255,0.11)', border: phase === 2 ? 'none' : '1px solid rgba(255,255,255,0.26)', borderRadius: 14, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 400, letterSpacing: '0.2em', color: 'white', textTransform: 'uppercase', backdropFilter: phase === 2 ? 'none' : 'blur(10px)', WebkitBackdropFilter: phase === 2 ? 'none' : 'blur(10px)', boxShadow: phase === 2 ? `0 4px 28px ${arch.shadow}` : 'none', transition: 'all 0.4s ease' }}>
          {['Découvrir mes forces', 'Lire mon message', 'Entrer dans mon espace'][phase]}
        </button>
      </div>
    </BgScreen>
  )
}

// ─── ESPACE VRAI MODAL ────────────────────────────────────────────────────────

function EspaceVraiModal({ archetypeKey, onClose }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  const [showText, setShowText] = useState(false)
  const intention = getDailyIntention(archetypeKey)

  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 30)
    const t2 = setTimeout(() => setShowText(true), 700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        opacity: vis ? 1 : 0, transition: 'opacity 0.7s ease',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        top: '-5%', left: '-5%', right: '-5%', bottom: '-5%',
        backgroundImage: `url(${B}bg-vrai.png)`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        animation: 'bgbreathe 28s ease-in-out infinite',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,16,0.52)' }} />
      <div style={{ position: 'absolute', inset: 0, filter: 'url(#grain)', opacity: 0.035, pointerEvents: 'none', background: 'white' }} />
      <div style={{
        position: 'relative', zIndex: 1,
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 32px', gap: 28, textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 10.5,
          color: arch.color, letterSpacing: '0.28em', textTransform: 'uppercase', margin: 0,
          opacity: showText ? 1 : 0, transition: 'opacity 0.8s ease',
        }}>
          Espace de présence
        </p>

        <div style={{
          fontFamily: 'Sora, sans-serif', fontWeight: 300,
          fontSize: 'clamp(17px, 4.5vw, 22px)',
          color: 'rgba(255,255,255,0.9)',
          lineHeight: 1.72, fontStyle: 'italic',
          opacity: showText ? 1 : 0, transition: 'opacity 0.8s ease 0.2s',
          maxWidth: 340,
        }}>
          {showText && (
            <TypingText
              text={`"${intention}"`}
              delay={100}
              speed={44}
            />
          )}
        </div>

        <p style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 300,
          fontSize: 14, color: 'rgba(255,255,255,0.32)',
          margin: 0, letterSpacing: '0.06em',
          opacity: showText ? 1 : 0,
          transition: 'opacity 1.4s ease 3s',
        }}>
          Tu n'es pas seul·e.
        </p>

        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 10.5,
          color: 'rgba(255,255,255,0.16)', margin: 0,
          position: 'absolute', bottom: 48,
          letterSpacing: '0.14em',
        }}>
          Appuie pour revenir
        </p>
      </div>
    </div>
  )
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

function BottomNav({ tab, onChange, color }) {
  const tabs = [
    { key: 'home', icon: '✦', label: 'Accueil' },
    { key: 'routines', icon: '◈', label: 'Routines' },
    { key: 'quetes', icon: '◇', label: 'Quêtes' },
  ]
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(5,8,16,0.9)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => { haptic(8); onChange(t.key) }} style={{
          flex: 1, padding: '13px 0 11px', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <span style={{
            fontSize: 16,
            color: tab === t.key ? color : 'rgba(255,255,255,0.28)',
            transition: 'color 0.2s ease',
            display: 'block',
            animation: tab === t.key ? 'tabpulse 0.35s ease' : 'none',
          }}>{t.icon}</span>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: 9.5, letterSpacing: '0.12em',
            color: tab === t.key ? color : 'rgba(255,255,255,0.24)',
            transition: 'color 0.2s ease', textTransform: 'uppercase',
          }}>{t.label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────

function HomeScreen({ archetypeKey, routinesDone, quetesDone, onRestart, onOpenVrai }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  const [intentionReady, setIntentionReady] = useState(false)
  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 100)
    const t2 = setTimeout(() => setIntentionReady(true), 650)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  const intention = getDailyIntention(archetypeKey)
  const today = new Date()
  const dateStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const routinesCount = routinesDone.filter(Boolean).length
  const quetesCount = quetesDone.filter(Boolean).length

  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '52px 22px 100px', display: 'flex', flexDirection: 'column', gap: 16, opacity: vis ? 1 : 0, transition: 'opacity 0.6s ease' }}>

      <div style={{ textAlign: 'center', marginBottom: 2 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', margin: '0 0 2px', textTransform: 'capitalize' }}>{greetingStr()}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', margin: '0 0 14px', textTransform: 'capitalize' }}>{dateStr}</p>
        <NeyaLogo size="sm" onTap={() => { haptic(8); onOpenVrai() }} />
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: 'rgba(255,255,255,0.14)', letterSpacing: '0.1em', margin: '7px 0 0' }}>touche le logo · instant de présence</p>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.055)', border: `1px solid ${arch.color}44`, borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src={`${B}cerf.svg`} alt="" style={{ width: 40, height: 40, opacity: 0.62, filter: `drop-shadow(0 0 12px ${arch.shadow})` }} />
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: arch.color, letterSpacing: '0.22em', margin: '0 0 3px', textTransform: 'uppercase' }}>Ton profil</p>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 16, color: 'white', margin: 0 }}>{arch.profil}</p>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '20px 18px', minHeight: 88 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.2em', margin: '0 0 12px', textTransform: 'uppercase' }}>Intention du jour</p>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 15.5, color: 'rgba(255,255,255,0.86)', lineHeight: 1.68, fontStyle: 'italic' }}>
          {intentionReady && <TypingText text={`"${intention}"`} delay={0} speed={34} />}
        </div>
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.2em', margin: '4px 0 0', textTransform: 'uppercase' }}>Aujourd'hui</p>
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { label: 'Routines', count: routinesCount, total: arch.routines.length, icon: '◈' },
          { label: 'Quêtes', count: quetesCount, total: arch.quetes.length, icon: '◇' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: `1px solid ${s.count > 0 ? arch.color + '44' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10, transition: 'border-color 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: s.count > 0 ? arch.color : 'rgba(255,255,255,0.25)', transition: 'color 0.3s ease' }}>{s.icon}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.28)' }}>{s.count}/{s.total}</span>
            </div>
            <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1 }}>
              <div style={{ height: '100%', background: arch.color, borderRadius: 1, width: `${(s.count / s.total) * 100}%`, transition: 'width 0.5s ease', boxShadow: s.count > 0 ? `0 0 6px ${arch.color}88` : 'none' }} />
            </div>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      <button onClick={() => { haptic(10); onRestart() }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.05em', padding: '10px 0', marginTop: 6 }}>
        Refaire le parcours
      </button>
    </div>
  )
}

// ─── ROUTINES SCREEN ──────────────────────────────────────────────────────────

function RoutinesScreen({ archetypeKey, completed, onToggle }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 100); return () => clearTimeout(t) }, [])
  const doneCount = completed.filter(Boolean).length
  const allDone = doneCount === arch.routines.length

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '52px 22px 100px', display: 'flex', flexDirection: 'column', gap: 14, opacity: vis ? 1 : 0, transition: 'opacity 0.6s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: arch.color, letterSpacing: '0.22em', margin: '0 0 8px', textTransform: 'uppercase' }}>◈ Routines du jour</p>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 22, color: 'white', margin: 0, lineHeight: 1.2 }}>Tes pratiques<br />quotidiennes</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: 'rgba(255,255,255,0.35)', margin: '10px 0 0' }}>
          {allDone ? '✦ Toutes accomplies aujourd\'hui' : `${doneCount} / ${arch.routines.length} complétées`}
        </p>
      </div>

      {arch.routines.map((r, i) => {
        const done = completed[i]
        return (
          <div key={i} style={{ background: done ? `rgba(${arch.rgb},0.1)` : 'rgba(255,255,255,0.05)', border: `1px solid ${done ? arch.color + '55' : 'rgba(255,255,255,0.09)'}`, borderRadius: 14, padding: '18px 16px', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'all 0.32s ease' }}>
            <button onClick={() => { haptic(done ? 6 : 18); onToggle(i) }} style={{ width: 26, height: 26, borderRadius: '50%', border: `1.5px solid ${done ? arch.color : 'rgba(255,255,255,0.22)'}`, background: done ? arch.color : 'transparent', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s ease', marginTop: 2, boxShadow: done ? `0 0 12px ${arch.shadow}` : 'none' }}>
              {done && <span style={{ fontSize: 11, color: 'white' }}>✓</span>}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 15, color: done ? arch.color : 'white', margin: 0, transition: 'color 0.3s ease' }}>{r.title}</p>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.25)', flexShrink: 0, marginLeft: 8 }}>{r.duration}</span>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13.5, color: done ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.62, textDecoration: done ? 'line-through' : 'none', transition: 'all 0.3s ease' }}>{r.desc}</p>
            </div>
          </div>
        )
      })}

      {allDone && (
        <div style={{ background: `rgba(${arch.rgb},0.1)`, border: `1px solid ${arch.color}44`, borderRadius: 12, padding: '16px', textAlign: 'center', marginTop: 6 }}>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14.5, color: arch.color, margin: '0 0 4px' }}>✦ Routines complètes.</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: 'rgba(255,255,255,0.42)', margin: 0 }}>Ta constance est une force.</p>
        </div>
      )}
    </div>
  )
}

// ─── QUÊTES SCREEN ────────────────────────────────────────────────────────────

function QuetesScreen({ archetypeKey, completed, onComplete }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 100); return () => clearTimeout(t) }, [])
  const doneCount = completed.filter(Boolean).length
  const allDone = doneCount === arch.quetes.length

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '52px 22px 100px', display: 'flex', flexDirection: 'column', gap: 14, opacity: vis ? 1 : 0, transition: 'opacity 0.6s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: arch.color, letterSpacing: '0.22em', margin: '0 0 8px', textTransform: 'uppercase' }}>◇ Quêtes</p>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 22, color: 'white', margin: 0, lineHeight: 1.2 }}>Tes défis<br />bienveillants</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: 'rgba(255,255,255,0.35)', margin: '10px 0 0' }}>{doneCount} / {arch.quetes.length} accomplies</p>
      </div>

      {arch.quetes.map((q, i) => {
        const done = completed[i]
        const locked = i > 0 && !completed[i - 1]
        return (
          <div key={i} style={{
            background: done ? `rgba(${arch.rgb},0.1)` : locked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${done ? arch.color + '55' : locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.09)'}`,
            borderRadius: 14, padding: '18px 16px',
            opacity: locked ? 0.38 : 1,
            filter: locked ? 'blur(0.5px)' : 'none',
            transform: locked ? 'scale(0.98)' : 'scale(1)',
            transition: 'all 0.3s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16, color: done ? arch.color : locked ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.45)' }}>{locked ? '◻' : q.icon}</span>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 15.5, color: done ? arch.color : locked ? 'rgba(255,255,255,0.28)' : 'white', margin: 0, transition: 'color 0.3s ease' }}>{q.title}</p>
              </div>
              {done && <span style={{ fontSize: 11, color: arch.color, flexShrink: 0, marginLeft: 8 }}>✓</span>}
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13.5, color: locked ? 'rgba(255,255,255,0.2)' : done ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.62)', margin: '0 0 14px', lineHeight: 1.62 }}>
              {locked ? 'Accomplis la quête précédente pour révéler celle-ci.' : q.desc}
            </p>
            {!done && !locked && (
              <button onClick={() => { haptic([20, 50, 30]); onComplete(i) }} style={{ width: '100%', padding: '12px 0', background: `rgba(${arch.rgb},0.14)`, border: `1px solid ${arch.color}55`, borderRadius: 10, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 11.5, fontWeight: 400, letterSpacing: '0.18em', color: arch.color, textTransform: 'uppercase' }}>
                Marquer accomplie
              </button>
            )}
          </div>
        )
      })}

      {allDone && (
        <div style={{ background: `rgba(${arch.rgb},0.1)`, border: `1px solid ${arch.color}44`, borderRadius: 12, padding: '18px 16px', textAlign: 'center', marginTop: 6 }}>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 15.5, color: arch.color, margin: '0 0 6px' }}>✦ Toutes tes quêtes accomplies.</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Ta lumière grandit à chaque pas.</p>
        </div>
      )}
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

function MainApp({ archetypeKey, onRestart }) {
  const arch = ARCHETYPES[archetypeKey]
  const [tab, setTab] = useState('home')
  const [routinesDone, setRoutinesDone] = useState(() => loadRoutines())
  const [quetesDone, setQuetesDone] = useState(() => loadQuetes(archetypeKey))
  const [vraiOpen, setVraiOpen] = useState(false)

  const toggleRoutine = (i) => {
    const next = [...routinesDone]
    next[i] = !next[i]
    setRoutinesDone(next)
    saveRoutines(next)
  }

  const completeQuete = (i) => {
    const next = [...quetesDone]
    next[i] = true
    setQuetesDone(next)
    saveQuetes(archetypeKey, next)
  }

  const overlay = `linear-gradient(180deg, rgba(5,8,16,0.62) 0%, rgba(${arch.rgb},0.08) 100%)`

  return (
    <BgScreen bg={arch.bg} overlay={overlay} breathe>
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {tab === 'home' && (
          <HomeScreen
            archetypeKey={archetypeKey}
            routinesDone={routinesDone}
            quetesDone={quetesDone}
            onRestart={onRestart}
            onOpenVrai={() => setVraiOpen(true)}
          />
        )}
        {tab === 'routines' && <RoutinesScreen archetypeKey={archetypeKey} completed={routinesDone} onToggle={toggleRoutine} />}
        {tab === 'quetes' && <QuetesScreen archetypeKey={archetypeKey} completed={quetesDone} onComplete={completeQuete} />}
        <BottomNav tab={tab} onChange={setTab} color={arch.color} />
        {vraiOpen && <EspaceVraiModal archetypeKey={archetypeKey} onClose={() => setVraiOpen(false)} />}
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
    const style = document.createElement('style')
    style.id = 'neya-css'
    style.textContent = `
      @keyframes bgbreathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
      @keyframes pulsering { 0%,100%{transform:scale(1);opacity:0.45} 50%{transform:scale(1.22);opacity:0.85} }
      @keyframes cursorblink { 0%,100%{opacity:0} 45%,55%{opacity:1} }
      @keyframes tabpulse { 0%{transform:scale(1)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }
    `
    if (!document.getElementById('neya-css')) document.head.appendChild(style)
    return () => { const el = document.getElementById('neya-css'); if (el) el.remove() }
  }, [])

  useEffect(() => {
    const imgs = ['bg-onboarding.png','bg-cosmos.png','bg-cosmos-alt.png','bg-feu.png','bg-eau.png','bg-foret.png','bg-brume.png','bg-vide.png','bg-vrai.png','cerf.svg']
    imgs.forEach(s => { const img = new Image(); img.src = B + s })
    const profile = loadProfile()
    if (profile?.archetype) {
      setArchetype(profile.archetype)
      setScreen('main')
    }
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

  const handleRestart = () => {
    localStorage.removeItem('neya_profile')
    go('splash', () => setArchetype(null))
  }

  return (
    <div style={{ width: '100vw', height: '100dvh', background: '#050810', overflow: 'hidden', position: 'fixed', inset: 0 }}>
      {screen === 'splash'     && <SplashScreen onStart={() => go('intro')} />}
      {screen === 'intro'      && <IntroScreen onStart={() => go('quiz')} />}
      {screen === 'quiz'       && <QuizScreen onComplete={(answers) => {
        const result = computeArchetype(answers)
        saveProfile(result)
        go('transition', () => setArchetype(result))
      }} />}
      {screen === 'transition' && <TransitionScreen onReveal={() => go('result')} />}
      {screen === 'result'     && archetype && <ResultScreen archetypeKey={archetype} onContinue={() => go('main')} />}
      {screen === 'main'       && archetype && <MainApp archetypeKey={archetype} onRestart={handleRestart} />}

      <div style={{
        position: 'fixed', inset: 0, background: '#050810', zIndex: 9999,
        opacity: blackout ? 1 : 0,
        transition: blackout ? 'opacity 0.36s ease' : 'opacity 0.28s ease',
        pointerEvents: blackout ? 'all' : 'none',
      }} />
    </div>
  )
}
