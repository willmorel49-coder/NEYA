import { useState, useEffect, useCallback, useRef } from 'react'

const B = import.meta.env.BASE_URL

// ─── ARCHETYPES ───────────────────────────────────────────────────────────────

const ARCHETYPES = {
  resilience: {
    profil: 'Porteur·se de Feu',
    animal: 'Le Phénix intérieur',
    bg: 'bg-feu.png',
    color: '#f59e0b',
    shadow: 'rgba(245,158,11,0.4)',
    rgb: '245,158,11',
    element: 'Feu',
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
    element: 'Eau',
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
    element: 'Brume',
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
    element: 'Forêt',
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
  // ─── Questions tirées du MVP original ────────────────────────────────────────
  {
    bg: 'bg-foret.png',
    title: "Quand une émotion forte surgit...",
    text: "Un geste, une parole ou un regard éveille une émotion forte en toi. Comment choisis-tu de l'accueillir ?",
    choices: [
      { text: "Partager tout de suite — j'ai besoin de connexion", type: 'lumiere' },
      { text: "En parler avec quelques proches de confiance", type: 'resilience' },
      { text: "Garder en moi un moment, l'accueillir intérieurement", type: 'presence' },
      { text: "Vivre pleinement l'émotion, sans besoin de la partager", type: 'sagesse' },
    ],
  },
  {
    bg: 'bg-eau.png',
    title: "Face à une décision importante...",
    text: "La dernière fois que tu as eu une grande décision à prendre, quelle a été ta boussole intérieure ?",
    choices: [
      { text: "Suivre la logique et les faits", type: 'resilience' },
      { text: "Réfléchir rationnellement en écoutant aussi mes ressentis", type: 'presence' },
      { text: "Me fier à mes émotions profondes", type: 'sagesse' },
      { text: "Me laisser guider pleinement par mon cœur", type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-brume.png',
    title: "Dans un endroit nouveau...",
    text: "Quand tu arrives dans un endroit totalement nouveau, que fais-tu en premier ?",
    choices: [
      { text: "Explorer sans attendre — j'ai besoin de découvrir", type: 'resilience' },
      { text: "Prendre mes repères tranquillement", type: 'presence' },
      { text: "Observer discrètement avant de bouger", type: 'sagesse' },
      { text: "Chercher d'abord un espace qui me ressemble", type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-vide.png',
    title: "Face à une échéance...",
    text: "Quand une échéance se profile, quelle est ta manière naturelle de l'aborder ?",
    choices: [
      { text: "Planifier avec clarté, étape par étape", type: 'resilience' },
      { text: "Fixer un cadre souple, prêt à ajuster", type: 'presence' },
      { text: "Avancer en accueillant les imprévus", type: 'sagesse' },
      { text: "Vivre au jour le jour, en adaptant naturellement", type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-eau.png',
    title: "Retrouver son équilibre...",
    text: "Quand tu as besoin de retrouver ton équilibre, que privilégies-tu ?",
    choices: [
      { text: "Mes projets — agir me ressource profondément", type: 'resilience' },
      { text: "Mes liens de cœur et mes proches", type: 'presence' },
      { text: "Ma connexion intérieure, seul·e avec moi-même", type: 'sagesse' },
      { text: "L'aventure et l'imprévu pour retrouver ma vitalité", type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-cosmos.png',
    title: "Quand l'imprévu arrive...",
    text: "Quel est ton réflexe naturel quand les choses ne se passent pas comme prévu ?",
    choices: [
      { text: "Reprendre rapidement la maîtrise", type: 'resilience' },
      { text: "Ajuster le plan en gardant mon objectif", type: 'presence' },
      { text: "Ressentir d'abord, avant d'agir", type: 'sagesse' },
      { text: "Laisser évoluer et m'adapter sereinement", type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-foret.png',
    title: "En arrivant dans un lieu inconnu...",
    text: "Quand tu arrives dans un lieu totalement nouveau, que captes-tu naturellement en premier ?",
    choices: [
      { text: "Les éléments marquants et l'ambiance générale", type: 'resilience' },
      { text: "L'énergie invisible du lieu", type: 'presence' },
      { text: "Les détails précis : sons, couleurs, atmosphère", type: 'sagesse' },
      { text: "Les histoires possibles derrière ce que je perçois", type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-brume.png',
    title: "Une journée libre...",
    text: "Quand tu as une journée entièrement libre, comment la vis-tu naturellement ?",
    choices: [
      { text: "Je planifie pour profiter au maximum", type: 'resilience' },
      { text: "Je garde une idée vague et m'adapte", type: 'presence' },
      { text: "Je me laisse guider par mes envies du moment", type: 'sagesse' },
      { text: "Je me laisse totalement porter", type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-cosmos.png',
    title: "Ton moteur intérieur...",
    text: "Quelle énergie intérieure te pousse à te lever chaque matin ?",
    choices: [
      { text: "L'envie de réaliser mes projets et d'avancer", type: 'resilience' },
      { text: "Le désir de grandir et d'être vraiment présent·e", type: 'presence' },
      { text: "La curiosité — comprendre et observer le monde", type: 'sagesse' },
      { text: "L'élan créatif de partager ce qui m'anime", type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-feu.png',
    title: "Face au besoin de changement...",
    text: "Quand une partie de toi sent qu'il est temps de changer, que fais-tu naturellement ?",
    choices: [
      { text: "Je saisis l'opportunité pour me renouveler", type: 'resilience' },
      { text: "Je fais évoluer les choses à mon rythme", type: 'presence' },
      { text: "Je réfléchis avant d'envisager un changement", type: 'sagesse' },
      { text: "Je me laisse transformer par la vie", type: 'lumiere' },
    ],
  },
  {
    bg: 'bg-foret.png',
    title: "À la rencontre d'une nouvelle personne...",
    text: "Quand tu rencontres quelqu'un pour la première fois, quelle est ton attitude naturelle ?",
    choices: [
      { text: "Créer facilement une connexion — j'aime les gens", type: 'lumiere' },
      { text: "Ressentir et observer tranquillement", type: 'presence' },
      { text: "Garder une certaine distance au début", type: 'sagesse' },
      { text: "Me protéger tant que la confiance n'est pas établie", type: 'resilience' },
    ],
  },
]

// ─── ÉTOILES ──────────────────────────────────────────────────────────────────

const STARS = [
  { x: 7,  y: 9,  r: 1.1, dur: 4.8, del: 0.0 },
  { x: 83, y: 6,  r: 0.7, dur: 6.4, del: 1.2 },
  { x: 63, y: 16, r: 1.3, dur: 5.2, del: 0.6 },
  { x: 30, y: 8,  r: 0.8, dur: 7.0, del: 2.1 },
  { x: 91, y: 29, r: 0.9, dur: 4.5, del: 1.7 },
  { x: 17, y: 39, r: 0.6, dur: 6.8, del: 0.4 },
  { x: 77, y: 53, r: 1.0, dur: 5.9, del: 3.0 },
  { x: 46, y: 69, r: 0.8, dur: 4.9, del: 1.4 },
  { x: 22, y: 63, r: 1.0, dur: 6.6, del: 0.9 },
  { x: 69, y: 80, r: 0.7, dur: 5.6, del: 2.4 },
  { x: 5,  y: 75, r: 0.9, dur: 7.3, del: 1.0 },
  { x: 92, y: 72, r: 0.6, dur: 4.6, del: 2.8 },
  { x: 55, y: 4,  r: 0.8, dur: 5.3, del: 3.5 },
  { x: 38, y: 88, r: 0.7, dur: 6.1, del: 0.3 },
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

function daysSince(ts) {
  return Math.floor((Date.now() - ts) / 86400000)
}

function getWeekDots() {
  const result = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = `neya_routines_${d.toISOString().split('T')[0]}`
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]')
      result.push(data.some(Boolean))
    } catch { result.push(false) }
  }
  return result
}

function getPresenceProgress(savedAt, routinesDone, quetesDone, arch) {
  const dayScore = Math.min((savedAt ? daysSince(savedAt) : 0) / 21, 1) * 0.4
  const rScore = (routinesDone.filter(Boolean).length / Math.max(arch.routines.length, 1)) * 0.35
  const qScore = (quetesDone.filter(Boolean).length / Math.max(arch.quetes.length, 1)) * 0.25
  return Math.min(1, dayScore + rScore + qScore)
}

function getPresenceLabel(p) {
  if (p < 0.25) return 'Présence naissante'
  if (p < 0.5) return 'Lumière qui s\'éveille'
  if (p < 0.75) return 'Flamme qui grandit'
  return 'Éclat intérieur'
}

function loadProfile() {
  try { return JSON.parse(localStorage.getItem('neya_profile') || 'null') } catch { return null }
}
function saveProfile(archetype) {
  localStorage.setItem('neya_profile', JSON.stringify({ archetype, savedAt: Date.now() }))
}
function markTodayVisited() {
  localStorage.setItem(`neya_visited_${todayKey()}`, '1')
}
function isTodayFirstVisit() {
  return !localStorage.getItem(`neya_visited_${todayKey()}`)
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
    setLen(0); setDone(false)
    let i = 0
    const tid = setTimeout(() => {
      const iv = setInterval(() => {
        i++; setLen(i)
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

// ─── GRAIN FILTER ─────────────────────────────────────────────────────────────

function GrainFilter() {
  return (
    <>
      <svg style={{ display: 'none' }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="overlay" />
        </filter>
      </svg>
      <div style={{ position: 'absolute', inset: 0, filter: 'url(#grain)', opacity: 0.04, pointerEvents: 'none', background: 'white' }} />
    </>
  )
}

// ─── SPIRIT ANIMALS ───────────────────────────────────────────────────────────

const PhoenixSpirit = React.memo(function PhoenixSpirit({ size = 120, color = '#f59e0b', style: s }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={s}>
      <ellipse cx="60" cy="68" rx="10" ry="16" fill={color} opacity="0.92" />
      <path d="M50 70 C30 55 8 72 4 56 C12 44 34 52 50 62Z" fill={color} opacity="0.85" />
      <path d="M50 72 C28 68 6 82 2 70 C10 58 32 64 50 68Z" fill={color} opacity="0.55" />
      <path d="M70 70 C90 55 112 72 116 56 C108 44 86 52 70 62Z" fill={color} opacity="0.85" />
      <path d="M70 72 C92 68 114 82 118 70 C110 58 88 64 70 68Z" fill={color} opacity="0.55" />
      <path d="M55 84 C50 100 44 110 48 118 C54 106 58 96 60 86Z" fill={color} opacity="0.70" />
      <path d="M60 84 C58 102 56 114 60 120 C64 114 62 102 60 86Z" fill={color} opacity="0.90" />
      <path d="M65 84 C70 100 76 110 72 118 C66 106 62 96 60 86Z" fill={color} opacity="0.70" />
      <ellipse cx="60" cy="50" rx="8" ry="10" fill={color} opacity="0.96" />
      <path d="M56 42 C52 28 48 18 54 8 C58 20 58 32 60 40Z" fill={color} opacity="0.80" />
      <path d="M60 40 C60 24 62 12 60 2 C62 14 64 28 60 40Z" fill={color} opacity="0.95" />
      <path d="M64 42 C68 28 72 18 66 8 C62 20 62 32 60 40Z" fill={color} opacity="0.80" />
      <ellipse cx="60" cy="60" rx="18" ry="22" fill="white" opacity="0.08" />
    </svg>
  )
})

const WolfSpirit = React.memo(function WolfSpirit({ size = 120, color = '#6366f1', style: s }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={s}>
      <ellipse cx="60" cy="80" rx="24" ry="28" fill={color} opacity="0.18" />
      <path d="M38 62 C38 40 82 40 82 62 C82 78 72 88 60 88 C48 88 38 78 38 62Z" fill={color} opacity="0.82" />
      <path d="M44 52 C40 34 30 26 34 18 C42 28 46 42 48 52Z" fill={color} opacity="0.90" />
      <path d="M76 52 C80 34 90 26 86 18 C78 28 74 42 72 52Z" fill={color} opacity="0.90" />
      <path d="M45 50 C42 36 34 30 37 22 C43 32 46 43 48 50Z" fill="white" opacity="0.10" />
      <path d="M75 50 C78 36 86 30 83 22 C77 32 74 43 72 50Z" fill="white" opacity="0.10" />
      <ellipse cx="60" cy="74" rx="12" ry="8" fill={color} opacity="0.60" />
      <ellipse cx="60" cy="72" rx="5" ry="3" fill={color} opacity="0.90" />
      <ellipse cx="50" cy="60" rx="4" ry="4.5" fill="white" opacity="0.92" />
      <ellipse cx="70" cy="60" rx="4" ry="4.5" fill="white" opacity="0.92" />
      <ellipse cx="51" cy="60" rx="2" ry="2.5" fill={color} opacity="0.20" />
      <ellipse cx="71" cy="60" rx="2" ry="2.5" fill={color} opacity="0.20" />
      <path d="M84 82 C100 72 114 78 116 88 C104 94 92 88 82 84Z" fill={color} opacity="0.60" />
      <rect x="46" y="88" width="10" height="22" rx="5" fill={color} opacity="0.55" />
      <rect x="64" y="88" width="10" height="22" rx="5" fill={color} opacity="0.55" />
    </svg>
  )
})

const BearSpirit = React.memo(function BearSpirit({ size = 120, color = '#ec4899', style: s }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={s}>
      <ellipse cx="60" cy="80" rx="32" ry="30" fill={color} opacity="0.75" />
      <ellipse cx="60" cy="52" rx="26" ry="24" fill={color} opacity="0.88" />
      <circle cx="38" cy="34" r="11" fill={color} opacity="0.90" />
      <circle cx="82" cy="34" r="11" fill={color} opacity="0.90" />
      <circle cx="38" cy="34" r="7" fill="white" opacity="0.08" />
      <circle cx="82" cy="34" r="7" fill="white" opacity="0.08" />
      <ellipse cx="60" cy="60" rx="13" ry="9" fill={color} opacity="0.55" />
      <ellipse cx="60" cy="59" rx="6" ry="4" fill={color} opacity="0.85" />
      <ellipse cx="60" cy="56" rx="3.5" ry="2.5" fill="white" opacity="0.30" />
      <circle cx="50" cy="48" r="5" fill="white" opacity="0.90" />
      <circle cx="70" cy="48" r="5" fill="white" opacity="0.90" />
      <circle cx="51" cy="48" r="2.5" fill={color} opacity="0.25" />
      <circle cx="71" cy="48" r="2.5" fill={color} opacity="0.25" />
      <ellipse cx="60" cy="60" rx="22" ry="20" fill="white" opacity="0.05" />
      <ellipse cx="36" cy="104" rx="12" ry="10" fill={color} opacity="0.60" />
      <ellipse cx="84" cy="104" rx="12" ry="10" fill={color} opacity="0.60" />
    </svg>
  )
})

const DeerSpirit = React.memo(function DeerSpirit({ size = 120, color = '#14b8a6', style: s }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={s}>
      <ellipse cx="60" cy="82" rx="18" ry="26" fill={color} opacity="0.70" />
      <rect x="54" y="56" width="12" height="22" rx="6" fill={color} opacity="0.80" />
      <ellipse cx="60" cy="50" rx="14" ry="16" fill={color} opacity="0.88" />
      <path d="M48 42 C44 28 36 20 30 10 M44 36 C38 26 28 22 22 14 M44 36 C42 24 38 14 36 4" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.80" fill="none"/>
      <path d="M72 42 C76 28 84 20 90 10 M76 36 C82 26 92 22 98 14 M76 36 C78 24 82 14 84 4" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.80" fill="none"/>
      <ellipse cx="60" cy="58" rx="8" ry="6" fill={color} opacity="0.55" />
      <ellipse cx="60" cy="56" rx="3.5" ry="2.5" fill="white" opacity="0.20" />
      <ellipse cx="52" cy="47" rx="4" ry="4.5" fill="white" opacity="0.90" />
      <ellipse cx="68" cy="47" rx="4" ry="4.5" fill="white" opacity="0.90" />
      <rect x="50" y="106" width="7" height="14" rx="3.5" fill={color} opacity="0.55" />
      <rect x="63" y="106" width="7" height="14" rx="3.5" fill={color} opacity="0.55" />
    </svg>
  )
})

const SpiritAnimal = React.memo(function SpiritAnimal({ archetype, size = 120, style: s }) {
  const arch = ARCHETYPES[archetype] || ARCHETYPES.presence
  const props = { size, color: arch.color, style: s }
  if (archetype === 'resilience') return <PhoenixSpirit {...props} />
  if (archetype === 'sagesse')    return <WolfSpirit    {...props} />
  if (archetype === 'lumiere')    return <BearSpirit    {...props} />
  return <DeerSpirit {...props} />
})

// ─── LOGO ─────────────────────────────────────────────────────────────────────

function NeyaLogo({ size = 'md', onTap }) {
  const cfg = { sm: [20, 13], md: [28, 17], lg: [36, 22] }[size]
  return (
    <div onClick={onTap} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: onTap ? 'pointer' : 'default' }}>
      <svg width={cfg[0]} height={cfg[0]} viewBox="0 0 32 32" fill="none" style={{ animation: 'compassbreathe 7s ease-in-out infinite' }}>
        <ellipse cx="16" cy="26" rx="3" ry="6" fill="white" opacity="0.85" />
        <ellipse cx="16" cy="16" rx="3" ry="8" fill="white" opacity="0.85" transform="rotate(-45 16 16)" />
        <ellipse cx="16" cy="16" rx="3" ry="8" fill="white" opacity="0.85" transform="rotate(45 16 16)" />
        <ellipse cx="16" cy="16" rx="3" ry="8" fill="white" opacity="0.85" />
        <ellipse cx="16" cy="16" rx="3" ry="8" fill="white" opacity="0.85" transform="rotate(90 16 16)" />
        <circle cx="16" cy="16" r="3.5" fill="white" />
      </svg>
      <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: cfg[1], letterSpacing: '0.4em', color: 'white', textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>NÉYA</span>
    </div>
  )
}

// ─── BG SCREEN ────────────────────────────────────────────────────────────────

function BgScreen({ bg, overlay = 'rgba(5,8,16,0.48)', breathe = false, children }) {
  return (
    <div style={{ width: '100vw', height: '100dvh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'absolute', top: '-5%', left: '-5%', right: '-5%', bottom: '-5%', backgroundImage: `url(${B}${bg})`, backgroundSize: 'cover', backgroundPosition: 'center', animation: breathe ? 'bgbreathe 26s ease-in-out infinite' : 'none', transformOrigin: 'center center' }} />
      <div style={{ position: 'absolute', inset: 0, background: overlay }} />
      <GrainFilter />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {children}
      </div>
    </div>
  )
}

// ─── PRESENCE RING ────────────────────────────────────────────────────────────

function PresenceRing({ progress, color, size = 130 }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const dash = Math.max(0, Math.min(1, progress)) * circ
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 5px ${color})`, transition: 'stroke-dasharray 1.6s cubic-bezier(0.22,1,0.36,1)' }} />
    </svg>
  )
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────

function SplashScreen({ onStart }) {
  const [vis, setVis] = useState(false)
  const [titleVis, setTitleVis] = useState(false)
  const [subVis, setSubVis] = useState(false)
  const [whisperVis, setWhisperVis] = useState(false)
  const [showBtn, setShowBtn] = useState(false)
  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 100)
    const t2 = setTimeout(() => setTitleVis(true), 500)
    const t3 = setTimeout(() => setSubVis(true), 1400)
    const t4 = setTimeout(() => setWhisperVis(true), 2000)
    const t5 = setTimeout(() => setShowBtn(true), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
  }, [])

  const SPLASH_MOTES = [
    { x: 12, y: 78, size: 2.5, dur: 18, del: 0.0, op: 0.07 },
    { x: 27, y: 65, size: 3.0, dur: 22, del: 2.4, op: 0.05 },
    { x: 41, y: 82, size: 2.0, dur: 16, del: 5.1, op: 0.10 },
    { x: 58, y: 71, size: 3.5, dur: 20, del: 1.3, op: 0.06 },
    { x: 70, y: 88, size: 2.0, dur: 15, del: 7.8, op: 0.08 },
    { x: 83, y: 60, size: 4.0, dur: 19, del: 3.6, op: 0.05 },
    { x: 35, y: 90, size: 2.5, dur: 21, del: 9.2, op: 0.12 },
    { x: 64, y: 76, size: 3.0, dur: 17, del: 4.7, op: 0.07 },
  ]

  return (
    <BgScreen bg="bg-onboarding.png" overlay="rgba(5,8,16,0.40)" breathe>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
        {STARS.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white"
            style={{ animation: `startwinkle ${s.dur}s ease-in-out infinite`, animationDelay: `${s.del}s` }} />
        ))}
        {SPLASH_MOTES.map((m, i) => (
          <circle key={`mote-${i}`} cx={`${m.x}%`} cy={`${m.y}%`} r={m.size}
            fill="rgba(99,102,241,1)"
            style={{ opacity: m.op, animation: `splashmote ${m.dur}s ease-in-out infinite`, animationDelay: `${m.del}s` }} />
        ))}
      </svg>

      <div style={{ padding: '60px 28px 52px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', width: '100%', position: 'relative', zIndex: 3 }}>
        <div style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.8s ease' }}>
          <NeyaLogo size="md" />
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '-60px -80px', background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 68%)', pointerEvents: 'none', zIndex: 0 }} />
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(30px, 8vw, 40px)', color: 'white', lineHeight: 1.25, margin: 0, textShadow: '0 2px 40px rgba(0,0,0,0.55), 0 0 80px rgba(99,102,241,0.18)', letterSpacing: '0.01em', opacity: titleVis ? 1 : 0, transition: 'opacity 1.6s ease', position: 'relative', zIndex: 1 }}>
            Bienvenue dans<br />ton Grand Voyage...
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 15.5, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.7, opacity: subVis ? 1 : 0, transition: 'opacity 1.2s ease', position: 'relative', zIndex: 1 }}>
            Le plus beau chemin<br />commence en toi.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 12, color: 'rgba(255,255,255,0.20)', margin: 0, letterSpacing: '0.04em', fontStyle: 'italic', opacity: whisperVis ? 1 : 0, transition: 'opacity 1.6s ease', position: 'relative', zIndex: 1 }}>
            T'as pas besoin d'aller bien pour commencer.
          </p>
        </div>

        <button onClick={() => { haptic(20); onStart() }} style={{ width: '100%', padding: '17px 0', background: 'linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 14, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 400, letterSpacing: '0.24em', color: 'white', textTransform: 'uppercase', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', opacity: showBtn ? 1 : 0, transition: 'opacity 1.4s ease' }}>
          Commencer
        </button>
      </div>
    </BgScreen>
  )
}

// ─── INTRO ────────────────────────────────────────────────────────────────────

function IntroScreen({ onStart }) {
  const [step, setStep] = useState(0)
  const [vis, setVis] = useState(false)
  const [line1, setLine1] = useState(false)
  const [line2, setLine2] = useState(false)
  const [hintVis, setHintVis] = useState(false)

  const resetAnimations = () => { setVis(false); setLine1(false); setLine2(false); setHintVis(false) }

  useEffect(() => {
    const t = [
      setTimeout(() => setVis(true), 80),
      setTimeout(() => setLine1(true), 700),
      setTimeout(() => setLine2(true), 1700),
      setTimeout(() => setHintVis(true), 3200),
    ]
    return () => t.forEach(clearTimeout)
  }, [step])

  const goStep1 = () => {
    if (step !== 0) return
    haptic(12)
    resetAnimations()
    setTimeout(() => setStep(1), 420)
  }

  if (step === 0) {
    return (
      <BgScreen bg="bg-onboarding.png" overlay="rgba(10,6,2,0.46)" breathe>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
          {[{x:15,y:22,r:1.8,dur:19,del:0.0},{x:82,y:18,r:1.2,dur:24,del:2.8},{x:66,y:72,r:2.2,dur:17,del:1.5},{x:30,y:80,r:1.5,dur:21,del:4.1},{x:90,y:55,r:1.0,dur:26,del:0.8}].map((m,i)=>(
            <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill="rgba(245,158,11,1)" style={{ opacity: 0.06, animation: `splashmote ${m.dur}s ease-in-out infinite`, animationDelay: `${m.del}s` }} />
          ))}
        </svg>
        <div onClick={goStep1} style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 32px', cursor: 'pointer', textAlign: 'center', gap: 22, opacity: vis ? 1 : 0, transition: 'opacity 0.7s ease' }}>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(27px, 7vw, 36px)', color: 'white', lineHeight: 1.3, margin: 0, textShadow: '0 2px 44px rgba(0,0,0,0.6), 0 0 60px rgba(245,158,11,0.12)', opacity: line1 ? 1 : 0, transition: 'opacity 1.5s ease' }}>
            Ici commence<br />ton chemin...
          </h1>
          <div style={{ width: 1, height: 38, background: 'rgba(255,255,255,0.18)', transformOrigin: 'top', animation: line1 ? 'introlineappear 0.9s ease forwards' : 'none', opacity: line1 ? 1 : 0 }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 16, color: 'rgba(255,255,255,0.62)', lineHeight: 1.72, margin: 0, opacity: line2 ? 1 : 0, transition: 'opacity 1.3s ease' }}>
            vers plus de calme,<br />d'équilibre et de clarté intérieure.
          </p>
          <p style={{ position: 'absolute', bottom: '9%', fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.20)', letterSpacing: '0.26em', margin: 0, opacity: hintVis ? 1 : 0, transition: 'opacity 1.2s ease' }}>
            TOUCHER POUR CONTINUER
          </p>
        </div>
      </BgScreen>
    )
  }

  return (
    <BgScreen bg="bg-foret.png" overlay="rgba(4,10,4,0.44)" breathe>
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '72px 32px 52px', opacity: vis ? 1 : 0, transition: 'opacity 0.7s ease' }}>
        {/* Ghost animal — monde forêt = lumière = BearSpirit */}
        <div style={{ position: 'absolute', bottom: '18%', right: '6%', pointerEvents: 'none', opacity: line2 ? 0.055 : 0, transition: 'opacity 2.4s ease', filter: 'blur(2px)', animation: line2 ? 'animalfloat 28s ease-in-out infinite' : 'none' }}>
          <BearSpirit size={140} color="#ec4899" />
        </div>
        <div />
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 400, fontSize: 'clamp(23px, 6vw, 30px)', color: 'white', lineHeight: 1.3, margin: 0, textShadow: '0 2px 32px rgba(0,0,0,0.5)', opacity: line1 ? 1 : 0, transition: 'opacity 1.5s ease' }}>
            Ton monde intérieur<br />est vivant.
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.4em', margin: 0, opacity: line2 ? 1 : 0, transition: 'opacity 1.3s ease' }}>
            ◈
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.78, margin: 0, opacity: line2 ? 1 : 0, transition: 'opacity 1.3s ease' }}>
            À chaque pas, tu t'ouvres<br />un peu plus à toi-même.<br /><br />Continue d'avancer à ton rythme...
          </p>
        </div>
        <button onClick={() => { haptic(20); onStart() }} style={{ width: '100%', padding: '17px 0', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.28)', borderRadius: 14, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 300, letterSpacing: '0.12em', color: 'white', opacity: line2 ? 1 : 0, transition: 'opacity 1s ease 0.5s', boxShadow: '0 0 0 1px rgba(255,255,255,0.08)' }}>
          Poursuivre
        </button>
      </div>
    </BgScreen>
  )
}

// ─── QUIZ INTRO ───────────────────────────────────────────────────────────────

function QuizIntroScreen({ onStart }) {
  const [vis, setVis] = useState(false)
  const [item1, setItem1] = useState(false)
  const [item2, setItem2] = useState(false)
  const [foot, setFoot] = useState(false)
  const [showBtn, setShowBtn] = useState(false)

  useEffect(() => {
    const t = [
      setTimeout(() => setVis(true), 100),
      setTimeout(() => setItem1(true), 800),
      setTimeout(() => setItem2(true), 1500),
      setTimeout(() => setFoot(true), 2100),
      setTimeout(() => setShowBtn(true), 2600),
    ]
    return () => t.forEach(clearTimeout)
  }, [])

  return (
    <BgScreen bg="bg-cosmos.png" overlay="rgba(5,8,16,0.74)" breathe>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
        {STARS.slice(0, 8).map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r * 0.7} fill="white" style={{ animation: `startwinkle ${s.dur}s ease-in-out infinite`, animationDelay: `${s.del}s` }} />
        ))}
      </svg>
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '72px 28px 52px', opacity: vis ? 1 : 0, transition: 'opacity 0.7s ease' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: 72, height: 72, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', animation: 'compassbreathe 7s ease-in-out infinite' }} />
            <div style={{ animation: 'compassbreathe 7s ease-in-out infinite', display: 'flex' }}>
              <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="21" stroke="rgba(255,255,255,0.50)" strokeWidth="1.5"/>
                <path d="M24 6v4M24 38v4M6 24h4M38 24h4" stroke="rgba(255,255,255,0.38)" strokeWidth="1.5" strokeLinecap="round"/>
                <polygon points="24,9 26.4,21.2 24,25 21.6,21.2" fill="white" opacity="0.90"/>
                <polygon points="24,39 21.6,26.8 24,23 26.4,26.8" fill="rgba(255,255,255,0.30)"/>
                <circle cx="24" cy="24" r="2.8" fill="white" opacity="0.88"/>
              </svg>
            </div>
          </div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(22px, 5.5vw, 28px)', color: 'white', lineHeight: 1.32, margin: 0 }}>
            Prêt·e pour ton<br />exploration intérieure ?
          </h1>
          <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 1, margin: '4px auto 0', opacity: item1 ? 1 : 0, transition: 'opacity 1.4s ease' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', opacity: item1 ? 1 : 0, transform: item1 ? 'translateY(0)' : 'translateY(14px)', transition: 'opacity 0.9s ease, transform 0.9s ease' }}>
            <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 11, background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 7, padding: '4px 9px', color: 'rgba(255,255,255,0.72)', flexShrink: 0, marginTop: 3, letterSpacing: '0.04em', boxShadow: '0 0 12px rgba(99,102,241,0.22)' }}>{QUESTIONS.length}</span>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14.5, color: 'rgba(255,255,255,0.72)', margin: 0, lineHeight: 1.65 }}>
              Questions conçues pour révéler ton chemin intérieur unique.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', opacity: item2 ? 1 : 0, transform: item2 ? 'translateY(0)' : 'translateY(14px)', transition: 'opacity 0.9s ease, transform 0.9s ease' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14.5, color: 'rgba(255,255,255,0.72)', margin: 0, lineHeight: 1.65 }}>
              Pas de bonne ou de mauvaise réponse — réponds avec ce qui résonne en toi.
            </p>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13, color: 'rgba(255,255,255,0.36)', textAlign: 'center', lineHeight: 1.72, margin: '4px 0 0', opacity: foot ? 1 : 0, transition: 'opacity 1s ease' }}>
            Chaque réponse t'aidera à mieux te connaître<br />et à révéler ton chemin intérieur.
          </p>
        </div>

        <button onClick={() => { haptic([15, 40, 15]); onStart() }} style={{ width: '100%', padding: '17px 0', background: 'rgba(99,102,241,0.78)', border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 11.5, fontWeight: 500, letterSpacing: '0.28em', color: 'white', textTransform: 'uppercase', boxShadow: '0 6px 32px rgba(99,102,241,0.38)', opacity: showBtn ? 1 : 0, transform: showBtn ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 1s ease, transform 0.3s ease' }}>
          Commencer l'aventure
        </button>
      </div>
    </BgScreen>
  )
}

// ─── CHOICE ICON ─────────────────────────────────────────────────────────────

function ChoiceIcon({ type, active }) {
  const c = active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.42)'
  const s = { width: 16, height: 16, flexShrink: 0, display: 'block' }
  if (type === 'resilience') return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  if (type === 'presence')   return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/></svg>
  if (type === 'sagesse')    return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  if (type === 'lumiere')    return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
  return null
}

// ─── QUIZ ─────────────────────────────────────────────────────────────────────

function QuizScreen({ onComplete }) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null))
  const [selected, setSelected] = useState(null)
  const [rippleIdx, setRippleIdx] = useState(null)
  const [contentVis, setContentVis] = useState(true)
  const [choicesVis, setChoicesVis] = useState(false)

  const [bgMain, setBgMain] = useState(QUESTIONS[0].bg)
  const [bgFade, setBgFade] = useState(null)
  const [bgFadeOp, setBgFadeOp] = useState(0)

  const ARCHETYPE_TINTS = {
    resilience: 'rgba(245,158,11,0.10)',
    presence:   'rgba(20,184,166,0.10)',
    sagesse:    'rgba(99,102,241,0.10)',
    lumiere:    'rgba(236,72,153,0.10)',
  }
  const WORLD_TINTS = {
    'bg-cosmos.png': 'rgba(99,102,241,0.06)',
    'bg-feu.png':    'rgba(245,158,11,0.06)',
    'bg-eau.png':    'rgba(20,184,166,0.05)',
    'bg-foret.png':  'rgba(236,72,153,0.05)',
    'bg-brume.png':  'rgba(120,100,200,0.05)',
    'bg-vide.png':   'rgba(200,200,240,0.04)',
  }

  const q = QUESTIONS[idx]
  const progress = (idx + (selected !== null ? 0.5 : 0)) / QUESTIONS.length

  // Déclenche le stagger d'entrée des choix dès que le contenu devient visible
  useEffect(() => {
    if (contentVis) {
      const t = setTimeout(() => setChoicesVis(true), 60)
      return () => clearTimeout(t)
    } else {
      setChoicesVis(false)
    }
  }, [contentVis])

  const handleContinue = () => {
    if (!selected) return
    const newAnswers = [...answers]
    newAnswers[idx] = selected
    haptic(18)

    if (idx < QUESTIONS.length - 1) {
      const nextIdx = idx + 1
      const oldBg = QUESTIONS[idx].bg
      const newBg = QUESTIONS[nextIdx].bg

      setContentVis(false)

      setTimeout(() => {
        setAnswers(newAnswers)
        setIdx(nextIdx)
        setSelected(null)

        if (oldBg !== newBg) {
          setBgFade(oldBg)
          setBgFadeOp(1)
          setBgMain(newBg)
          requestAnimationFrame(() => requestAnimationFrame(() => setBgFadeOp(0)))
          setTimeout(() => setBgFade(null), 900)
        }

        setTimeout(() => setContentVis(true), 90)
      }, 340)
    } else {
      onComplete(newAnswers)
    }
  }

  return (
    <div style={{ width: '100vw', height: '100dvh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'absolute', top: '-5%', left: '-5%', right: '-5%', bottom: '-5%', backgroundImage: `url(${B}${bgMain})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      {bgFade && (
        <div style={{ position: 'absolute', top: '-5%', left: '-5%', right: '-5%', bottom: '-5%', backgroundImage: `url(${B}${bgFade})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: bgFadeOp, transition: 'opacity 0.8s ease', pointerEvents: 'none' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,16,0.56)' }} />
      <GrainFilter />
      <div style={{ position: 'absolute', inset: 0, background: WORLD_TINTS[q.bg] || 'transparent', transition: 'background 0.6s ease', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: selected ? ARCHETYPE_TINTS[selected] : 'transparent',
        transition: 'background 0.5s ease',
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.07)', zIndex: 10 }}>
        <div style={{ height: '100%', background: `linear-gradient(90deg, ${(WORLD_TINTS[q.bg] || 'rgba(99,102,241,0.7)').replace(/[\d.]+\)$/, '0.85)')}, rgba(255,255,255,0.55))`, filter: 'blur(0.4px)', width: `${progress * 100}%`, transition: 'width 0.5s ease, background 0.6s ease' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '50px 24px 36px', display: 'flex', flexDirection: 'column', height: '100%', width: '100%', opacity: contentVis ? 1 : 0, transition: 'opacity 0.32s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.28em' }}>{idx + 1} · {QUESTIONS.length}</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', gap: 12, marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(22px, 5.5vw, 28px)', color: 'white', margin: 0, lineHeight: 1.2, letterSpacing: '-0.01em', textShadow: '0 2px 24px rgba(0,0,0,0.5), 0 0 60px rgba(99,102,241,0.08)', animation: contentVis ? 'questionEnter 0.38s ease both' : 'none' }}>{q.title}</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14.5, color: 'rgba(255,255,255,0.60)', margin: 0, lineHeight: 1.65, padding: '0 4px', animation: contentVis ? 'questionEnter 0.42s ease 0.05s both' : 'none' }}>{q.text}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {q.choices.map((c, i) => {
            const sel = selected === c.type
            return (
              <button key={i} onClick={() => { if (selected !== null) return; haptic(12); setSelected(c.type); setRippleIdx(i); setTimeout(() => setRippleIdx(null), 620) }} style={{ position: 'relative', overflow: 'hidden', width: '100%', padding: '14px 17px', background: sel ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.05)', border: `1px solid ${sel ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', transform: sel ? 'scale(1.014)' : 'scale(1)', boxShadow: sel ? '0 4px 28px rgba(255,255,255,0.09), inset 0 0 0 1px rgba(255,255,255,0.18)' : 'none', opacity: choicesVis ? 1 : 0, translate: choicesVis ? '0 0px' : '0 10px', transition: `background 0.22s ease, border-color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease, opacity 0.45s ease ${i * 55}ms, translate 0.45s ease ${i * 55}ms` }}>
                {rippleIdx === i && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: ARCHETYPES[c.type]?.color || 'rgba(255,255,255,0.4)', animation: 'choiceripple 0.6s ease-out forwards' }} />
                  </div>
                )}
                <ChoiceIcon type={c.type} active={sel} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13.5, lineHeight: 1.48, color: sel ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.62)', transition: 'color 0.22s ease' }}>{c.text}</span>
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 18, opacity: selected !== null ? 1 : 0, transition: 'opacity 0.4s ease', pointerEvents: selected !== null ? 'all' : 'none' }}>
          <button onClick={handleContinue} style={{ width: '100%', padding: '16px 0', background: selected ? `rgba(${ARCHETYPES[selected]?.rgb || '99,102,241'},0.72)` : 'rgba(99,102,241,0.72)', border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12, fontWeight: 500, letterSpacing: '0.24em', color: 'white', textTransform: 'uppercase', boxShadow: selected ? `0 4px 22px rgba(${ARCHETYPES[selected]?.rgb || '99,102,241'},0.38)` : '0 4px 22px rgba(99,102,241,0.32)', transition: 'all 0.4s ease' }}>
            {idx === QUESTIONS.length - 1 ? 'Terminer' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── TRANSITION ───────────────────────────────────────────────────────────────

function TransitionScreen({ onReveal }) {
  const [vis, setVis] = useState(false)
  const [showBtn, setShowBtn] = useState(false)
  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 300)
    const t2 = setTimeout(() => setShowBtn(true), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  return (
    <BgScreen bg="bg-cosmos-alt.png" overlay="rgba(5,8,16,0.62)" breathe>
      <div style={{ padding: '60px 28px 52px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', width: '100%' }}>
        <NeyaLogo size="sm" />
        <div style={{ textAlign: 'center', opacity: vis ? 1 : 0, transition: 'opacity 1.6s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
          <div style={{ position: 'relative', width: 76, height: 76 }}>
            <div style={{ position: 'absolute', inset: -22, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)', animation: 'pulsering 4.8s ease-in-out infinite 1.6s' }} />
            <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.14)', animation: 'pulsering 3.4s ease-in-out infinite' }} />
            <div style={{ width: 76, height: 76, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 68%)', animation: 'presencePulse 3.2s ease-in-out infinite' }} />
              <SpiritAnimal archetype="presence" size={40} style={{ opacity: 0.78, animation: 'animalfloat 18s ease-in-out infinite, animalbreathe 22s ease-in-out infinite', position: 'relative' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.28em', textTransform: 'uppercase', margin: 0, opacity: vis ? 1 : 0, transition: 'opacity 1.4s ease 0.2s' }}>
              {QUESTIONS.length} questions · Tes réponses ont été entendues.
            </p>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(24px, 6vw, 30px)', color: 'white', margin: 0, lineHeight: 1.3, textShadow: '0 2px 32px rgba(0,0,0,0.5), 0 0 60px rgba(99,102,241,0.1)' }}>
              Ton guide intérieur<br />s'apprête à se révéler...
            </h1>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.14)', borderRadius: 1, margin: '0 auto' }} />
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 15, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.72, opacity: vis ? 1 : 0, transition: 'opacity 1.0s ease 0.4s' }}>
              Il est l'écho de ta lumière unique.<br />Es-tu prêt·e à le rencontrer ?
            </p>
          </div>
        </div>
        <button onClick={() => { haptic([30, 50, 20]); onReveal() }} style={{ width: '100%', padding: '17px 0', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.26)', borderRadius: 14, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 400, letterSpacing: '0.2em', color: 'white', textTransform: 'uppercase', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', opacity: showBtn ? 1 : 0, transform: showBtn ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 1.0s ease, transform 0.8s ease' }}>
          Découvrir mon guide
        </button>
      </div>
    </BgScreen>
  )
}

// ─── PATRONUS REVEAL ──────────────────────────────────────────────────────────

function PatronusReveal({ arch, archetypeKey, onDone }) {
  const [step, setStep] = useState(0)
  // 0: dark  1: point  2: rings  3: animal  4: flash  5: text  6: btn

  useEffect(() => {
    const tt = [
      setTimeout(() => setStep(1), 260),
      setTimeout(() => setStep(2), 960),
      setTimeout(() => setStep(3), 1900),
      setTimeout(() => setStep(4), 2620),
      setTimeout(() => setStep(5), 3600),
      setTimeout(() => setStep(6), 5600),
    ]
    return () => tt.forEach(clearTimeout)
  }, [])

  const rings = [
    { color: arch.color, delay: 0, dur: 1.45 },
    { color: 'rgba(255,255,255,0.88)', delay: 0.14, dur: 1.62 },
    { color: arch.color, delay: 0.28, dur: 1.78 },
    { color: 'rgba(255,255,255,0.65)', delay: 0.44, dur: 1.96 },
    { color: arch.color, delay: 0.62, dur: 2.15 },
  ]

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* Radial bg glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, ${arch.color}14 0%, transparent 65%)`, transition: 'opacity 1s ease', opacity: step >= 3 ? 1 : 0.3 }} />

      {/* White flash on animal arrival */}
      {step >= 4 && (
        <div style={{ position: 'absolute', inset: 0, background: 'white', animation: 'lightFlash 1.6s ease forwards', pointerEvents: 'none', zIndex: 5 }} />
      )}

      {/* Birth particles — 12 radial dots on 3 rings */}
      {step >= 4 && (
        <svg
          width="260" height="260"
          viewBox="0 0 260 260"
          style={{ position: 'absolute', pointerEvents: 'none', zIndex: 7, animation: 'patronusParticles 2.2s ease-out forwards', opacity: 0 }}
        >
          {/* Inner ring — 4 dots, arch color */}
          {[0, 90, 180, 270].map((deg, i) => {
            const rad = (deg * Math.PI) / 180
            const cx = 130 + Math.round(Math.cos(rad) * 52)
            const cy = 130 + Math.round(Math.sin(rad) * 52)
            return <circle key={`i${i}`} cx={cx} cy={cy} r="3" fill={arch.color} opacity="0.95" />
          })}
          {/* Mid ring — 6 dots, white */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180
            const cx = 130 + Math.round(Math.cos(rad) * 82)
            const cy = 130 + Math.round(Math.sin(rad) * 82)
            return <circle key={`m${i}`} cx={cx} cy={cy} r="2.2" fill="white" opacity="0.80" />
          })}
          {/* Outer ring — 2 large accent dots */}
          {[30, 210].map((deg, i) => {
            const rad = (deg * Math.PI) / 180
            const cx = 130 + Math.round(Math.cos(rad) * 114)
            const cy = 130 + Math.round(Math.sin(rad) * 114)
            return <circle key={`o${i}`} cx={cx} cy={cy} r="3.5" fill={arch.color} opacity="0.70" />
          })}
        </svg>
      )}

      {/* Deep glow orb behind animal */}
      {step >= 3 && (
        <div style={{
          position: 'absolute',
          width: 260, height: 260,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${arch.color}42 0%, ${arch.color}18 40%, transparent 70%)`,
          animation: 'presencePulse 2.6s ease-in-out infinite',
          zIndex: 6,
        }} />
      )}

      {/* Patronus rings */}
      {step >= 2 && rings.map((ring, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 110, height: 110,
          borderRadius: '50%',
          border: `1.5px solid ${ring.color}`,
          animation: `patronusRing ${ring.dur}s ease-out ${ring.delay}s forwards`,
          opacity: 0,
          zIndex: 4,
        }} />
      ))}

      {/* Initial light point */}
      {step >= 1 && step < 3 && (
        <div style={{
          width: step >= 2 ? 22 : 7,
          height: step >= 2 ? 22 : 7,
          borderRadius: '50%',
          background: 'white',
          boxShadow: `0 0 24px ${arch.color}, 0 0 60px white, 0 0 120px ${arch.color}`,
          transition: 'all 0.9s ease',
          position: 'absolute',
          zIndex: 8,
        }} />
      )}

      {/* The animal */}
      {step >= 3 && (
        <div style={{ position: 'relative', zIndex: 10, animation: 'patronusAnimal 2.4s ease forwards' }}>
          {/* Inner aura */}
          <div style={{ position: 'absolute', inset: -28, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 65%)`, animation: 'presencePulse 2.8s ease-in-out infinite 0.6s' }} />
          <SpiritAnimal
            archetype={archetypeKey}
            size={210}
            style={{
              display: 'block',
              filter: `drop-shadow(0 0 28px ${arch.color}) drop-shadow(0 0 55px rgba(255,255,255,0.8)) drop-shadow(0 0 90px ${arch.color}99)`,
              animation: 'animalfloat 18s ease-in-out infinite 2.5s, animalbreathe 22s ease-in-out infinite 2.5s',
            }}
          />
        </div>
      )}

      {/* Text reveal */}
      {step >= 5 && (
        <div style={{ position: 'absolute', bottom: '27%', textAlign: 'center', zIndex: 12 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: arch.color, letterSpacing: '0.34em', textTransform: 'uppercase', margin: '0 0 12px', opacity: 0, animation: 'fadeIn 0.8s ease 0.4s both' }}>
            Ton animal guide
          </p>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(22px, 6vw, 28px)', color: 'white', margin: '0 0 7px', textShadow: `0 0 48px ${arch.shadow}, 0 0 24px rgba(255,255,255,0.4)`, opacity: 0, animation: 'fadeIn 1.0s ease 0.8s both' }}>
            {arch.animal}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13.5, color: `${arch.color}99`, margin: 0, fontStyle: 'italic', letterSpacing: '0.06em', opacity: 0, animation: 'fadeIn 1.0s ease 1.2s both' }}>
            {arch.profil}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.28em', textTransform: 'uppercase', margin: '8px 0 0', opacity: 0, animation: 'fadeIn 1.0s ease 1.6s both' }}>
            Élément · {arch.element}
          </p>
        </div>
      )}

      {/* CTA button */}
      {step >= 6 && (
        <button
          onClick={() => { haptic([20, 60, 20]); onDone() }}
          style={{ position: 'absolute', bottom: '9%', left: '7%', right: '7%', padding: '17px 0', background: 'rgba(255,255,255,0.08)', border: `1px solid ${arch.color}88`, borderRadius: 14, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 400, letterSpacing: '0.22em', color: 'white', textTransform: 'uppercase', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', zIndex: 12, animation: 'fadeIn 1.0s ease forwards', boxShadow: `0 4px 28px ${arch.color}44` }}
        >
          Découvrir mon profil
        </button>
      )}
    </div>
  )
}

// ─── RÉSULTAT ─────────────────────────────────────────────────────────────────

function ResultScreen({ archetypeKey, onContinue }) {
  const arch = ARCHETYPES[archetypeKey]
  const [phase, setPhase] = useState(0)
  const [phaseVis, setPhaseVis] = useState(false)
  const [forcesShown, setForcesShown] = useState(0)

  useEffect(() => { const t = setTimeout(() => setPhaseVis(true), 300); return () => clearTimeout(t) }, [])

  useEffect(() => {
    if (phase === 1 && phaseVis) {
      setForcesShown(0)
      arch.forces.forEach((_, i) => {
        setTimeout(() => setForcesShown(prev => Math.max(prev, i + 1)), 200 + i * 240)
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

  // Phase 0 : révélation patronus plein écran
  if (phase === 0) {
    return (
      <BgScreen bg={arch.bg} overlay="rgba(5,8,16,0.28)" breathe>
        <PatronusReveal arch={arch} archetypeKey={archetypeKey} onDone={() => {
          setPhaseVis(false)
          setTimeout(() => { setPhase(1); setPhaseVis(true) }, 300)
        }} />
      </BgScreen>
    )
  }

  return (
    <BgScreen bg={arch.bg} overlay="rgba(5,8,16,0.48)" breathe>
      <div style={{ padding: '52px 28px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', width: '100%', overflowY: 'auto' }}>
        <NeyaLogo size="sm" />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%', textAlign: 'center', opacity: phaseVis ? 1 : 0, transform: phaseVis ? 'scale(1)' : 'scale(0.97)', transition: 'opacity 0.32s ease, transform 0.32s ease', flex: 1, justifyContent: 'center', paddingBlock: 20 }}>

          {phase === 1 && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative', marginBottom: 2 }}>
                  <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', background: `radial-gradient(circle, ${arch.color}18 0%, transparent 70%)`, animation: 'presencePulse 4s ease-in-out infinite' }} />
                  <SpiritAnimal archetype={archetypeKey} size={60} style={{ opacity: 0.70, filter: `drop-shadow(0 0 14px ${arch.color}88)`, animation: 'animalfloat 18s ease-in-out infinite' }} />
                </div>
                <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 22, color: 'white', margin: 0 }}>Tes forces naturelles</h2>
                <div style={{ width: 32, height: 1, background: `${arch.color}55`, borderRadius: 1, margin: '0 auto 8px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
                {arch.forces.map((f, i) => (
                  <div key={i} style={{ background: `radial-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(${arch.rgb},0.04) 100%)`, border: `1px solid ${arch.color}55`, borderRadius: 12, padding: '20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, animation: forcesShown > i ? 'forcespring 0.5s ease forwards' : 'none', animationDelay: forcesShown > i ? `${i * 120}ms` : '0ms', opacity: forcesShown > i ? 1 : 0 }}>
                    <span style={{ fontSize: 13, color: arch.color, textShadow: `0 0 10px ${arch.color}88` }}>◈</span>
                    <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 13.5, color: 'white', textAlign: 'center', lineHeight: 1.3 }}>{f}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {phase === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
              {/* Animal guide label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 2px' }}>
                <SpiritAnimal archetype={archetypeKey} size={34} style={{ opacity: 0.65, filter: `drop-shadow(0 0 10px ${arch.color}66)`, animation: 'animalfloat 20s ease-in-out infinite' }} />
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: arch.color, letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 2px', opacity: 0.8 }}>Ton guide intérieur</p>
                  <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 15, color: 'white', margin: 0 }}>{arch.animal}</p>
                </div>
              </div>

              {/* Description card */}
              <div style={{ background: 'rgba(255,255,255,0.055)', border: `1px solid ${arch.color}44`, borderRadius: 16, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 18, boxShadow: `0 8px 32px rgba(${arch.rgb},0.12), inset 0 1px 0 rgba(255,255,255,0.04)` }}>
                {arch.desc.split('\n\n').map((para, i) => (
                  <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: i === 0 ? 16 : 14, color: i === 0 ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.75, fontStyle: i === 0 ? 'italic' : 'normal', textShadow: i === 0 ? '0 1px 20px rgba(0,0,0,0.3)' : 'none' }}>
                    {i === 0 ? `"${para}"` : para}
                  </p>
                ))}
              </div>

              {/* Intention aperçu */}
              <div style={{ background: `rgba(${arch.rgb},0.07)`, border: `1px solid ${arch.color}33`, borderRadius: 12, padding: '16px 18px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: arch.color, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 9px', opacity: 0.8 }}>Ton intention du jour</p>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14.5, color: 'rgba(255,255,255,0.82)', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>"{arch.intentions[0]}"</p>
              </div>
            </div>
          )}
        </div>

        <button onClick={nextPhase} style={{ width: '100%', padding: '17px 0', background: phase === 2 ? arch.color : 'rgba(255,255,255,0.11)', border: phase === 2 ? 'none' : '1px solid rgba(255,255,255,0.26)', borderRadius: 14, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: phase === 2 ? 500 : 400, letterSpacing: '0.2em', color: phase === 2 ? '#050810' : 'white', textTransform: 'uppercase', backdropFilter: phase === 2 ? 'none' : 'blur(10px)', WebkitBackdropFilter: phase === 2 ? 'none' : 'blur(10px)', boxShadow: phase === 2 ? `0 4px 32px ${arch.shadow}` : 'none', transition: 'all 0.45s ease' }}>
          {['', 'Lire mon message', 'Entrer dans mon espace'][phase]}
        </button>
      </div>
    </BgScreen>
  )
}

// ─── ESPACE VRAI MODAL ────────────────────────────────────────────────────────

const ESPACEACCOMPANY = {
  resilience: 'Continue d\'avancer, une respiration à la fois.',
  presence:   'Tu es exactement là où tu dois être.',
  sagesse:    'Le silence te parle doucement.',
  lumiere:    'Ta lumière est vivante ici.',
}

function EspaceVraiModal({ archetypeKey, onClose }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  const [showText, setShowText] = useState(false)
  const [showSecond, setShowSecond] = useState(false)
  const [showAccompany, setShowAccompany] = useState(false)
  const intention = getDailyIntention(archetypeKey)

  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 30)
    const t2 = setTimeout(() => setShowText(true), 800)
    const t3 = setTimeout(() => setShowSecond(true), 6500)
    const t4 = setTimeout(() => setShowAccompany(true), 10000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 200, opacity: vis ? 1 : 0, transition: 'opacity 0.7s ease', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-5%', left: '-5%', right: '-5%', bottom: '-5%', backgroundImage: `url(${B}bg-vrai.png)`, backgroundSize: 'cover', backgroundPosition: 'center', animation: 'bgbreathe 28s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,16,0.52)' }} />
      <GrainFilter />
      {/* Halo de présence — chaleur colorée très subtile derrière le contenu central */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, ${arch.color}0a 0%, transparent 65%)`, animation: 'presencePulse 5.8s ease-in-out infinite', pointerEvents: 'none' }} />
      {/* Ghost backdrop animal */}
      <div style={{ position: 'absolute', bottom: '-8%', right: '-12%', pointerEvents: 'none', opacity: vis ? 0.048 : 0, transition: 'opacity 3s ease 1s', filter: 'blur(3px)', animation: vis ? 'animalfloat 36s ease-in-out infinite' : 'none' }}>
        <SpiritAnimal archetype={archetypeKey} size={280} />
      </div>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', gap: 24, textAlign: 'center' }}>

        {/* Animal guide flottant — apparaît avant le texte */}
        <div style={{ opacity: vis ? 1 : 0, transition: 'opacity 1.4s ease 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: `radial-gradient(circle, ${arch.color}1a 0%, transparent 70%)`, animation: 'presencePulse 5s ease-in-out infinite' }} />
            <SpiritAnimal
              archetype={archetypeKey}
              size={88}
              style={{ opacity: 0.72, filter: `drop-shadow(0 0 20px ${arch.color}88) drop-shadow(0 0 40px ${arch.color}33)`, animation: 'animalfloat 20s ease-in-out infinite, animalbreathe 24s ease-in-out infinite' }}
            />
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: arch.color, letterSpacing: '0.28em', textTransform: 'uppercase', margin: 0, opacity: 0.8, textShadow: `0 0 16px ${arch.color}44` }}>
            {arch.animal}
          </p>
        </div>

        <div style={{ width: 1, height: 32, background: `linear-gradient(180deg, transparent, ${arch.color}44, transparent)`, borderRadius: 1, margin: '0 auto' }} />

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: arch.color, letterSpacing: '0.3em', textTransform: 'uppercase', margin: 0, opacity: showText ? 1 : 0, transition: 'opacity 0.9s ease', textShadow: `0 0 20px ${arch.color}44` }}>
          Espace de présence
        </p>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(17px, 4.5vw, 22px)', color: 'rgba(255,255,255,0.9)', lineHeight: 1.72, fontStyle: 'italic', opacity: showText ? 1 : 0, transition: 'opacity 0.9s ease 0.2s', maxWidth: 340 }}>
          {showText && <TypingText text={`"${intention}"`} delay={100} speed={44} />}
        </div>
        <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 15, fontStyle: 'italic', color: 'rgba(255,255,255,0.36)', margin: 0, letterSpacing: '0.06em', opacity: showText ? 1 : 0, transition: 'opacity 1.5s ease 3s', textShadow: '0 0 24px rgba(255,255,255,0.1)' }}>
          Tu n'es pas seul·e.
        </p>
        {showSecond && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 11.5, color: `${arch.color}66`, letterSpacing: '0.10em', margin: 0, fontStyle: 'italic', animation: 'fadeIn 1.8s ease forwards' }}>
            {arch.intentions[1]}
          </p>
        )}
        {showAccompany && (
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 12.5, color: `rgba(255,255,255,0.22)`, letterSpacing: '0.04em', margin: 0, fontStyle: 'italic', animation: 'fadeIn 2.2s ease forwards', maxWidth: 280, lineHeight: 1.7 }}>
            {ESPACEACCOMPANY[archetypeKey]}
          </p>
        )}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.14)', margin: 0, position: 'absolute', bottom: 52, paddingBottom: 'env(safe-area-inset-bottom, 0px)', letterSpacing: '0.15em', animation: 'fadeIn 1s ease 4s both' }}>
          Appuie pour revenir
        </p>
      </div>
    </div>
  )
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

function NavIconHome({ active, color }) {
  const c = active ? color : 'rgba(255,255,255,0.26)'
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L14.4 9.6H22L15.8 14.4L18.2 22L12 17.2L5.8 22L8.2 14.4L2 9.6H9.6L12 2Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round" fill={active ? color + '33' : 'none'} />
    </svg>
  )
}

function NavIconRoutines({ active, color }) {
  const c = active ? color : 'rgba(255,255,255,0.26)'
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke={c} strokeWidth="1.4" />
      <path d="M12 8v8M8 12h8" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function NavIconQuetes({ active, color }) {
  const c = active ? color : 'rgba(255,255,255,0.26)'
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L21 12L12 21L3 12L12 3Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round" fill={active ? color + '22' : 'none'} />
    </svg>
  )
}

function NavIconBoutique({ active, color }) {
  const c = active ? color : 'rgba(255,255,255,0.26)'
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={c} strokeWidth="1.4" strokeLinejoin="round" fill={active ? color + '22' : 'none'} />
      <line x1="3" y1="6" x2="21" y2="6" stroke={c} strokeWidth="1.4" />
      <path d="M16 10a4 4 0 01-8 0" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function BottomNav({ tab, onChange, color }) {
  const tabs = [
    { key: 'home',     label: 'Accueil',  Icon: NavIconHome },
    { key: 'routines', label: 'Routines', Icon: NavIconRoutines },
    { key: 'quetes',   label: 'Quêtes',   Icon: NavIconQuetes },
    { key: 'boutique', label: 'Boutique', Icon: NavIconBoutique },
  ]
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'linear-gradient(180deg, rgba(5,8,16,0.80) 0%, rgba(5,8,16,0.95) 100%)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 -8px 32px rgba(5,8,16,0.6)', display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(t => {
        const active = tab === t.key
        return (
          <button key={t.key} onClick={() => onChange(t.key)} style={{ flex: 1, padding: '14px 0 11px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transform: active ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.25s ease' }}>
              <t.Icon active={active} color={color} />
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, letterSpacing: '0.12em', color: active ? color : 'rgba(255,255,255,0.22)', transition: 'color 0.25s ease', textTransform: 'uppercase' }}>{t.label}</span>
            <div style={{ width: active ? 20 : 3, height: 1.5, borderRadius: 1, background: active ? color : 'transparent', transition: 'all 0.3s ease', marginTop: 2, boxShadow: active ? `0 0 8px ${color}, 0 0 16px ${color}66` : 'none' }} />
          </button>
        )
      })}
    </div>
  )
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────

function HomeScreen({ archetypeKey, routinesDone, quetesDone, onRestart, onOpenVrai, savedAt }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  const [intentionReady, setIntentionReady] = useState(false)
  const [ringReady, setRingReady] = useState(false)
  const [intentionIdx, setIntentionIdx] = useState(() => {
    try { return parseInt(localStorage.getItem(`neya_intentionIdx_${archetypeKey}`) || '0', 10) } catch { return 0 }
  })
  const [intentionFade, setIntentionFade] = useState(true)
  const [showPresenceToast, setShowPresenceToast] = useState(false)
  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 80)
    const t2 = setTimeout(() => setIntentionReady(true), 600)
    const t3 = setTimeout(() => setRingReady(true), 350)
    const isFirst = isTodayFirstVisit()
    if (isFirst) {
      markTodayVisited()
      const t4 = setTimeout(() => setShowPresenceToast(true), 1400)
      const t5 = setTimeout(() => setShowPresenceToast(false), 4200)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
    }
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const pool = arch.intentions
  const baseIdx = (() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    return dayOfYear % pool.length
  })()
  const intention = pool[(baseIdx + intentionIdx) % pool.length]

  const cycleIntention = () => {
    haptic(8)
    setIntentionFade(false)
    setTimeout(() => {
      setIntentionIdx(i => {
        const next = (i + 1) % pool.length
        try { localStorage.setItem(`neya_intentionIdx_${archetypeKey}`, String(next)) } catch {}
        return next
      })
      setIntentionFade(true)
    }, 200)
  }
  const today = new Date()
  const dateStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const routinesCount = routinesDone.filter(Boolean).length
  const quetesCount = quetesDone.filter(Boolean).length
  const weekDots = getWeekDots()
  const days = savedAt ? daysSince(savedAt) : 0
  const presenceProgress = ringReady ? getPresenceProgress(savedAt, routinesDone, quetesDone, arch) : 0

  const returningMsg = () => {
    if (days <= 0) return null
    if (days === 1) return 'Tu es revenu·e. C\'est bien.'
    if (days < 7) return `${days} jours avec toi.`
    if (days < 30) return `${days} jours ensemble.`
    return `${days} jours. Ta constance est belle.`
  }
  const msg = returningMsg()

  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '52px 22px 100px', display: 'flex', flexDirection: 'column', gap: 16, opacity: vis ? 1 : 0, transition: 'opacity 0.6s ease', position: 'relative' }}>

      {/* ── Première visite du jour ── */}
      {showPresenceToast && (
        <div style={{ position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)', background: `rgba(${arch.rgb},0.14)`, border: `1px solid ${arch.color}44`, borderRadius: 100, padding: '7px 18px', zIndex: 50, animation: 'fadeIn 0.6s ease both', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: arch.color, letterSpacing: '0.14em', margin: 0 }}>✦ Présence notée</p>
        </div>
      )}

      {/* ── Cocoon header ── */}
      <div style={{ textAlign: 'center', paddingBottom: 6 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', margin: '0 0 2px', textTransform: 'capitalize', textShadow: `0 0 20px ${arch.color}22` }}>{greetingStr()}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.07em', margin: '0 0 18px', textTransform: 'capitalize' }}>{dateStr}</p>

        {/* Presence ring wrapping the animal — tap for espace vrai */}
        <div
          onClick={() => { haptic([6, 80, 6]); onOpenVrai() }}
          style={{ position: 'relative', width: 130, height: 130, margin: '0 auto 16px', cursor: 'pointer' }}
        >
          <div style={{ position: 'absolute', inset: 0 }}>
            <PresenceRing progress={presenceProgress} color={arch.color} size={130} />
          </div>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', pointerEvents: 'none', opacity: 0.15, zIndex: 2 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(transparent 0%, transparent 60%, rgba(255,255,255,0.9) 78%, transparent 84%, transparent 100%)', animation: 'ringshimmer 8s linear infinite' }} />
          </div>
          {/* Soft glow center */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: 76, height: 76, borderRadius: '50%', background: `radial-gradient(circle, ${arch.color}20 0%, transparent 72%)`, animation: 'presencePulse 3.8s ease-in-out infinite' }} />
            <SpiritAnimal
              archetype={archetypeKey}
              size={74}
              style={{ opacity: 0.80, filter: `drop-shadow(0 0 16px ${arch.shadow}) drop-shadow(0 0 32px ${arch.color}44)`, animation: 'animalfloat 18s ease-in-out infinite', position: 'relative', zIndex: 1 }}
            />
          </div>
        </div>

        <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 17, color: 'white', margin: '0 0 4px', textShadow: `0 0 22px ${arch.color}55, 0 2px 40px rgba(0,0,0,0.4)` }}>{arch.profil}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: `${arch.color}99`, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 2px', fontStyle: 'italic' }}>{arch.animal}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 8.5, color: `rgba(255,255,255,0.18)`, letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 6px' }}>Élément · {arch.element}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: arch.color, letterSpacing: '0.24em', textTransform: 'uppercase', margin: '0 0 10px' }}>{getPresenceLabel(presenceProgress)}</p>

        {msg ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 11.5, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', margin: '4px 0 0', fontStyle: 'italic' }}>{msg}</p>
        ) : (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: 'rgba(255,255,255,0.14)', letterSpacing: '0.12em', margin: '4px 0 0' }}>touche · instant de présence</p>
        )}
      </div>

      {/* ── Intention du jour ── */}
      <div style={{ position: 'relative', background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(${arch.rgb},0.06) 100%)`, border: `1px solid ${arch.color}33`, borderRadius: 14, padding: '20px 18px', minHeight: 92, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 2.5, background: `linear-gradient(180deg, transparent, ${arch.color}bb, transparent)`, borderRadius: '0 2px 2px 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', margin: 0, textTransform: 'uppercase' }}>Intention du jour</p>
          <button onClick={cycleIntention} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: `${arch.color}66`, fontSize: 13, lineHeight: 1, transition: 'color 0.2s ease' }} title="Autre intention">↻</button>
        </div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 17, color: 'rgba(255,255,255,0.92)', lineHeight: 1.68, fontStyle: 'italic', opacity: intentionFade ? 1 : 0, transition: 'opacity 0.2s ease' }}>
          {intentionReady && <TypingText key={intentionIdx} text={`"${intention}"`} delay={0} speed={34} />}
        </div>
      </div>

      {/* ── Graines de présence (7 jours) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          {weekDots.map((active, i) => {
            const isToday = i === 6
            return (
              <div key={i} style={{
                width: active ? 8.5 : isToday ? 5 : 4.5,
                height: active ? 8.5 : isToday ? 5 : 4.5,
                borderRadius: '50%',
                background: active ? arch.color : 'rgba(255,255,255,0.07)',
                boxShadow: active ? `0 0 10px ${arch.color}cc, 0 0 22px ${arch.color}44, 0 0 40px ${arch.color}18` : isToday ? `0 0 0 1.5px ${arch.color}66` : 'none',
                transition: 'all 0.5s ease',
                animation: active ? 'seedPulse 3.5s ease-in-out infinite' : 'none',
                animationDelay: `${i * 0.42}s`,
                outline: isToday && !active ? `1.5px solid ${arch.color}55` : 'none',
                outlineOffset: '2px',
              }} />
            )
          })}
        </div>
        {(() => {
          const count = weekDots.filter(Boolean).length
          if (count === 0) return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: 'rgba(255,255,255,0.14)', letterSpacing: '0.14em', margin: 0 }}>ta présence cette semaine</p>
          if (count === 7) return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: arch.color, letterSpacing: '0.14em', margin: 0, opacity: 0.8 }}>7 jours · semaine complète ✦</p>
          return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: 'rgba(255,255,255,0.26)', letterSpacing: '0.14em', margin: 0 }}>{count} jour{count > 1 ? 's' : ''} cette semaine</p>
        })()}
      </div>

      {/* ── Progression du jour ── */}
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', margin: '2px 0 0', textTransform: 'uppercase' }}>Aujourd'hui</p>
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { label: 'Routines', count: routinesCount, total: arch.routines.length, icon: '◈' },
          { label: 'Quêtes', count: quetesCount, total: arch.quetes.length, icon: '◇' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: s.count > 0 ? `linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(${arch.rgb},0.08) 100%)` : 'rgba(255,255,255,0.07)', border: `1px solid ${s.count > 0 ? arch.color + '66' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10, transition: 'border-color 0.4s ease, background 0.4s ease', animation: vis ? 'forcespring 0.55s ease both' : 'none', animationDelay: vis ? `${0.28 + i * 0.1}s` : '0s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: s.count > 0 ? arch.color : 'rgba(255,255,255,0.24)', transition: 'color 0.3s ease' }}>{s.icon}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.26)' }}>{s.count}/{s.total}</span>
            </div>
            <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1 }}>
              <div style={{ height: '100%', background: arch.color, borderRadius: 1, width: `${(s.count / s.total) * 100}%`, transition: 'width 0.5s ease', boxShadow: s.count > 0 ? `0 0 7px ${arch.color}88` : 'none' }} />
            </div>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 12.5, color: 'rgba(255,255,255,0.52)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      <button onClick={() => { haptic(10); onRestart() }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.05em', padding: '10px 0', marginTop: 4 }}>
        Refaire le parcours
      </button>
    </div>
  )
}

// ─── ROUTINES SCREEN ──────────────────────────────────────────────────────────

function RoutinesScreen({ archetypeKey, completed, onToggle }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [])
  const doneCount = completed.filter(Boolean).length
  const allDone = doneCount === arch.routines.length

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '52px 22px 100px', display: 'flex', flexDirection: 'column', gap: 14, opacity: vis ? 1 : 0, transition: 'opacity 0.6s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: arch.color, letterSpacing: '0.24em', margin: '0 0 8px', textTransform: 'uppercase' }}>◈ Routines du jour</p>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 22, color: 'white', margin: 0, lineHeight: 1.2 }}>Tes pratiques<br />quotidiennes</h2>

        {/* Barre de progression globale */}
        <div style={{ margin: '14px auto 0', width: '72%', maxWidth: 220 }}>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(doneCount / arch.routines.length) * 100}%`, background: `linear-gradient(90deg, ${arch.color}88, ${arch.color})`, borderRadius: 2, transition: 'width 0.6s ease', boxShadow: doneCount > 0 ? `0 0 10px ${arch.color}66` : 'none' }} />
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: allDone ? arch.color : 'rgba(255,255,255,0.32)', margin: '7px 0 0', transition: 'color 0.4s ease' }}>
            {allDone ? '✦ Toutes accomplies' : `${doneCount} / ${arch.routines.length} complétées`}
          </p>
        </div>
      </div>

      {arch.routines.map((r, i) => {
        const done = completed[i]
        return (
          <div key={i} style={{ background: done ? `rgba(${arch.rgb},0.1)` : 'rgba(255,255,255,0.05)', border: `1px solid ${done ? arch.color + '55' : 'rgba(255,255,255,0.09)'}`, borderRadius: 14, padding: '18px 16px', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'all 0.35s ease', animation: vis ? 'tabslideIn 0.32s ease both' : 'none', animationDelay: vis ? `${0.18 + i * 0.08}s` : '0s' }}>
            <button onClick={() => { haptic(done ? 6 : 18); onToggle(i) }} style={{ width: 27, height: 27, borderRadius: '50%', border: `1.5px solid ${done ? arch.color : 'rgba(255,255,255,0.22)'}`, background: done ? arch.color : 'transparent', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.28s ease', marginTop: 2, boxShadow: done ? `0 0 14px ${arch.shadow}` : 'none' }}>
              {done && <span style={{ fontSize: 11, color: 'white' }}>✓</span>}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 16, color: done ? arch.color : 'white', margin: 0, transition: 'color 0.3s ease' }}>{r.title}</p>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.22)', flexShrink: 0, marginLeft: 8 }}>{r.duration}</span>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14.5, color: done ? 'rgba(255,255,255,0.36)' : 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.62, textDecoration: done ? 'line-through' : 'none', transition: 'all 0.3s ease' }}>{r.desc}</p>
            </div>
          </div>
        )
      })}

      {allDone && (
        <div style={{ background: `rgba(${arch.rgb},0.1)`, border: `1px solid ${arch.color}44`, borderRadius: 12, padding: '16px', textAlign: 'center', marginTop: 4 }}>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14.5, color: arch.color, margin: '0 0 4px' }}>✦ Routines complètes.</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Ta constance est une force.</p>
        </div>
      )}
    </div>
  )
}

// ─── QUÊTES SCREEN ────────────────────────────────────────────────────────────

function QuetesScreen({ archetypeKey, completed, onComplete }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [])
  const doneCount = completed.filter(Boolean).length
  const allDone = doneCount === arch.quetes.length

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '52px 22px 100px', display: 'flex', flexDirection: 'column', gap: 14, opacity: vis ? 1 : 0, transition: 'opacity 0.6s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: arch.color, letterSpacing: '0.24em', margin: '0 0 8px', textTransform: 'uppercase' }}>◇ Quêtes</p>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 22, color: 'white', margin: 0, lineHeight: 1.2 }}>Tes défis<br />bienveillants</h2>
        <div style={{ margin: '14px auto 0', width: '72%', maxWidth: 220 }}>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(doneCount / arch.quetes.length) * 100}%`, background: `linear-gradient(90deg, ${arch.color}88, ${arch.color})`, borderRadius: 2, transition: 'width 0.6s ease', boxShadow: doneCount > 0 ? `0 0 10px ${arch.color}66` : 'none' }} />
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: allDone ? arch.color : 'rgba(255,255,255,0.32)', margin: '7px 0 0', transition: 'color 0.4s ease' }}>
            {allDone ? '✦ Quêtes accomplies' : `${doneCount} / ${arch.quetes.length} accomplies`}
          </p>
        </div>
      </div>

      {arch.quetes.map((q, i) => {
        const done = completed[i]
        const locked = i > 0 && !completed[i - 1]
        return (
          <div key={i} style={{ background: done ? `rgba(${arch.rgb},0.1)` : locked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', border: `1px solid ${done ? arch.color + '55' : locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 14, padding: '18px 16px', opacity: locked ? 0.35 : 1, filter: locked ? 'blur(0.6px)' : 'none', transform: locked ? 'scale(0.98)' : 'scale(1)', transition: 'all 0.3s ease', animation: vis ? 'tabslideIn 0.32s ease both' : 'none', animationDelay: vis ? `${0.18 + i * 0.1}s` : '0s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16, color: done ? arch.color : locked ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.42)' }}>{locked ? '◻' : q.icon}</span>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 16.5, color: done ? arch.color : locked ? 'rgba(255,255,255,0.26)' : 'white', margin: 0, transition: 'color 0.3s ease' }}>{q.title}</p>
              </div>
              {done && <span style={{ fontSize: 11, color: arch.color, flexShrink: 0, marginLeft: 8 }}>✓</span>}
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14.5, color: locked ? 'rgba(255,255,255,0.18)' : done ? 'rgba(255,255,255,0.36)' : 'rgba(255,255,255,0.78)', margin: '0 0 14px', lineHeight: 1.62 }}>
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
        <div style={{ background: `rgba(${arch.rgb},0.1)`, border: `1px solid ${arch.color}44`, borderRadius: 12, padding: '18px 16px', textAlign: 'center', marginTop: 4 }}>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 15.5, color: arch.color, margin: '0 0 6px' }}>✦ Toutes tes quêtes accomplies.</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.42)', margin: 0 }}>Ta lumière grandit à chaque pas.</p>
        </div>
      )}
    </div>
  )
}

// ─── BOUTIQUE SCREEN ──────────────────────────────────────────────────────────

const CA_VA_COLLECTIONS = [
  {
    key: 'resilience',
    name: 'Collection Braise',
    subtitle: 'Pour les Porteurs de Feu',
    desc: 'Pièces qui incarnent la force tranquille et la transformation intérieure.',
    bg: 'bg-feu.png',
    color: '#f59e0b',
    rgb: '245,158,11',
    tags: ['Force', 'Courage', 'Mouvement'],
  },
  {
    key: 'presence',
    name: 'Collection Marée',
    subtitle: 'Pour les Ancreurs de Présence',
    desc: "Des silhouettes fluides qui épousent l'instant et cultivent la paix intérieure.",
    bg: 'bg-eau.png',
    color: '#14b8a6',
    rgb: '20,184,166',
    tags: ['Douceur', 'Calme', 'Harmonie'],
  },
  {
    key: 'sagesse',
    name: 'Collection Brume',
    subtitle: 'Pour les Éveilleurs de Sens',
    desc: "Des pièces habitées d'une profondeur silencieuse. Celles qui ont quelque chose à dire.",
    bg: 'bg-brume.png',
    color: '#6366f1',
    rgb: '99,102,241',
    tags: ['Profondeur', 'Intuition', 'Mystère'],
  },
  {
    key: 'lumiere',
    name: 'Collection Forêt',
    subtitle: 'Pour les Créateurs de Lumière',
    desc: "De l'éclat, de la joie, de la vie. Des vêtements qui rayonnent autant que toi.",
    bg: 'bg-foret.png',
    color: '#ec4899',
    rgb: '236,72,153',
    tags: ['Joie', 'Créativité', 'Lumière'],
  },
]

function BoutiqueScreen({ archetypeKey }) {
  const [vis, setVis] = useState(false)
  const [expandedKey, setExpandedKey] = useState(null)
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [])

  const myCollection = CA_VA_COLLECTIONS.find(c => c.key === archetypeKey)
  const otherCollections = CA_VA_COLLECTIONS.filter(c => c.key !== archetypeKey)

  const handleDiscover = () => {
    haptic([10, 30, 10])
    window.open('https://cava-brand.com', '_blank')
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '52px 22px 100px', display: 'flex', flexDirection: 'column', gap: 20, opacity: vis ? 1 : 0, transition: 'opacity 0.6s ease' }}>

      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.32em', margin: '0 0 10px', textTransform: 'uppercase' }}>LA MARQUE</p>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 28, color: 'white', margin: '0 0 6px', letterSpacing: '0.22em', textShadow: '0 2px 30px rgba(0,0,0,0.5)' }}>ÇA VA?</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.65 }}>
          Des vêtements qui portent<br />ce que les mots ne disent pas.
        </p>
      </div>

      {myCollection && (
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, border: `1px solid ${myCollection.color}55` }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${B}${myCollection.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,8,16,0.30) 0%, rgba(5,8,16,0.82) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '22px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, background: myCollection.color, color: '#050810', borderRadius: 100, padding: '3px 10px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Ta collection</span>
              <div style={{ opacity: 0.50, filter: `drop-shadow(0 0 12px ${myCollection.color}88)`, animation: 'animalfloat 18s ease-in-out infinite' }}>
                <SpiritAnimal archetype={archetypeKey} size={44} />
              </div>
            </div>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 24, color: 'white', margin: 0, lineHeight: 1.15 }}>{myCollection.name}</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: myCollection.color, letterSpacing: '0.16em', margin: 0, textTransform: 'uppercase' }}>{myCollection.subtitle}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.78)', margin: 0, lineHeight: 1.65 }}>{myCollection.desc}</p>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {myCollection.tags.map(tag => (
                <span key={tag} style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: myCollection.color, border: `1px solid ${myCollection.color}44`, borderRadius: 100, padding: '3px 10px', letterSpacing: '0.08em' }}>{tag}</span>
              ))}
            </div>
            <button onClick={handleDiscover} style={{ marginTop: 4, width: '100%', padding: '15px 0', background: myCollection.color, border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12, fontWeight: 500, letterSpacing: '0.22em', color: '#050810', textTransform: 'uppercase', boxShadow: `0 4px 24px rgba(${myCollection.rgb},0.40)` }}>
              Découvrir la collection
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Autres collections</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
      </div>

      {otherCollections.map((col, colIdx) => (
        <div key={col.key} onClick={() => setExpandedKey(expandedKey === col.key ? null : col.key)} style={{ position: 'relative', overflow: 'hidden', borderRadius: 14, border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer', animation: 'tabslideIn 0.3s ease-out both', animationDelay: `${colIdx * 80}ms` }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${B}${col.bg})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.35 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,16,0.65)' }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: expandedKey === col.key ? 12 : 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 18, color: 'white', margin: 0 }}>{col.name}</h3>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: col.color }}>{expandedKey === col.key ? '▲' : '▼'}</span>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: col.color, letterSpacing: '0.14em', margin: 0, textTransform: 'uppercase' }}>{col.subtitle}</p>
            {expandedKey === col.key && (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ opacity: 0.45, filter: `drop-shadow(0 0 10px ${col.color}66)`, animation: 'animalfloat 20s ease-in-out infinite', flexShrink: 0 }}>
                    <SpiritAnimal archetype={col.key} size={40} />
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13.5, color: 'rgba(255,255,255,0.70)', margin: 0, lineHeight: 1.65 }}>{col.desc}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDiscover() }} style={{ width: '100%', padding: '13px 0', background: `rgba(${col.rgb},0.18)`, border: `1px solid ${col.color}55`, borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 11.5, fontWeight: 400, letterSpacing: '0.2em', color: col.color, textTransform: 'uppercase' }}>
                  Découvrir
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.16)', textAlign: 'center', lineHeight: 1.7, margin: '8px 0 0' }}>
        ÇA VA? × NÉYA<br />
        <span style={{ fontSize: 10, letterSpacing: '0.06em' }}>Chaque vêtement porte une intention.</span>
      </p>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

function MainApp({ archetypeKey, onRestart, savedAt }) {
  const arch = ARCHETYPES[archetypeKey]
  const [tab, setTab] = useState('home')
  const [tabVis, setTabVis] = useState(true)
  const [routinesDone, setRoutinesDone] = useState(() => loadRoutines())
  const [quetesDone, setQuetesDone] = useState(() => loadQuetes(archetypeKey))
  const [vraiOpen, setVraiOpen] = useState(false)

  const changeTab = (newTab) => {
    if (newTab === tab) return
    haptic(8)
    setTabVis(false)
    setTimeout(() => { setTab(newTab); setTabVis(true) }, 190)
  }

  const toggleRoutine = (i) => {
    const next = [...routinesDone]; next[i] = !next[i]
    setRoutinesDone(next); saveRoutines(next)
    const nowAllDone = next.every(Boolean)
    if (nowAllDone) haptic([20, 50, 20, 50, 40])
  }

  const completeQuete = (i) => {
    const next = [...quetesDone]; next[i] = true
    setQuetesDone(next); saveQuetes(archetypeKey, next)
  }

  const overlay = `linear-gradient(180deg, rgba(5,8,16,0.62) 0%, rgba(${arch.rgb},0.09) 100%)`
  const WORLD_GLOW_PERIOD = { 'bg-brume.png': 30, 'bg-feu.png': 8, 'bg-foret.png': 18, 'bg-eau.png': 24, 'bg-cosmos.png': 42, 'bg-vide.png': 60 }
  const glowPeriod = WORLD_GLOW_PERIOD[arch.bg] || 24

  return (
    <BgScreen bg={arch.bg} overlay={overlay} breathe>
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, background: `radial-gradient(ellipse at center, ${arch.color}0f 0%, transparent 65%)`, animation: `worldglow ${glowPeriod}s ease-in-out infinite` }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', opacity: tabVis ? 1 : 0, animation: tabVis ? 'tabslideIn 0.22s ease-out' : 'none', transition: 'opacity 0.19s ease', overflow: 'hidden' }}>
          {tab === 'home' && <HomeScreen archetypeKey={archetypeKey} routinesDone={routinesDone} quetesDone={quetesDone} onRestart={onRestart} onOpenVrai={() => setVraiOpen(true)} savedAt={savedAt} />}
          {tab === 'routines' && <RoutinesScreen archetypeKey={archetypeKey} completed={routinesDone} onToggle={toggleRoutine} />}
          {tab === 'quetes' && <QuetesScreen archetypeKey={archetypeKey} completed={quetesDone} onComplete={completeQuete} />}
          {tab === 'boutique' && <BoutiqueScreen archetypeKey={archetypeKey} />}
        </div>
        <BottomNav tab={tab} onChange={changeTab} color={arch.color} />
        {vraiOpen && <EspaceVraiModal archetypeKey={archetypeKey} onClose={() => setVraiOpen(false)} />}
      </div>
    </BgScreen>
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('splash')
  const [archetype, setArchetype] = useState(null)
  const [savedAt, setSavedAt] = useState(null)
  const [blackout, setBlackout] = useState(false)
  const goTimer = useRef(null)

  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'neya-css'
    style.textContent = `
      @keyframes bgbreathe    { 0%,100%{transform:scale(1)}                   50%{transform:scale(1.04)} }
      @keyframes pulsering    { 0%,100%{transform:scale(1);opacity:0.42}       50%{transform:scale(1.24);opacity:0.88} }
      @keyframes cursorblink  { 0%,100%{opacity:0}                             45%,55%{opacity:1} }
      @keyframes startwinkle  { 0%,100%{opacity:0.18}                         50%{opacity:0.88} }
      @keyframes animalfloat  { 0%,100%{transform:translateY(0) scale(1) translateX(0)}  50%{transform:translateY(-7px) scale(1.028) translateX(3px)} }
      @keyframes animalbreathe{ 0%,100%{filter:brightness(1)}                            50%{filter:brightness(1.10)} }
      @keyframes patronusRing { 0%{transform:scale(0.06);opacity:0.96}        100%{transform:scale(5.8);opacity:0} }
      @keyframes patronusAnimal {
        0%   { opacity:0; transform:scale(0.28); filter:blur(22px) brightness(4.5); }
        52%  { opacity:1; transform:scale(1.12); filter:blur(0px)  brightness(2.8); }
        100% { opacity:0.88; transform:scale(1); filter:blur(0px)  brightness(1.35); }
      }
      @keyframes lightFlash   { 0%{opacity:0} 18%{opacity:0.74} 100%{opacity:0} }
      @keyframes patronusParticles { 0%{opacity:0;transform:scale(0)} 30%{opacity:0.7} 100%{opacity:0;transform:scale(1.8)} }
      @keyframes presencePulse{ 0%,100%{opacity:0.7;transform:scale(1)}       50%{opacity:1;transform:scale(1.07)} }
      @keyframes seedPulse    { 0%,100%{opacity:0.62;transform:scale(1)}      50%{opacity:1;transform:scale(1.32)} }
      @keyframes fadeIn       { 0%{opacity:0}                                  100%{opacity:1} }
      @keyframes introlineappear { 0%{transform:scaleY(0);opacity:0}          100%{transform:scaleY(1);opacity:1} }
      @keyframes compassbreathe  { 0%,100%{transform:scale(1);opacity:0.88}    50%{transform:scale(1.06);opacity:1} }
      @keyframes splashmote      { 0%,100%{transform:translateY(0px)}          50%{transform:translateY(-28px)} }
      @keyframes tabslideIn   { 0%{transform:translateX(10px);opacity:0}        100%{transform:translateX(0);opacity:1} }
      @keyframes worldglow    { 0%,100%{opacity:0.5}                             50%{opacity:1} }
      @keyframes ringshimmer  { 0%{transform:rotate(0deg)}                       100%{transform:rotate(360deg)} }
      @keyframes forcespring  { 0%{transform:translateY(20px);opacity:0} 70%{transform:translateY(-4px);opacity:0.8} 100%{transform:translateY(0);opacity:1} }
      @keyframes choiceripple  { 0%{transform:scale(0);opacity:0.6}               100%{transform:scale(2.5);opacity:0} }
      @keyframes questionEnter { 0%{transform:translateY(12px);opacity:0}          100%{transform:translateY(0);opacity:1} }
    `
    if (!document.getElementById('neya-css')) document.head.appendChild(style)
    return () => { const el = document.getElementById('neya-css'); if (el) el.remove() }
  }, [])

  useEffect(() => {
    const assets = ['bg-onboarding.png','bg-cosmos.png','bg-cosmos-alt.png','bg-feu.png','bg-eau.png','bg-foret.png','bg-brume.png','bg-vide.png','bg-vrai.png']
    assets.forEach(s => { const img = new Image(); img.src = B + s })
    const profile = loadProfile()
    if (profile?.archetype) {
      setArchetype(profile.archetype)
      setSavedAt(profile.savedAt || null)
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
    go('splash', () => { setArchetype(null); setSavedAt(null) })
  }

  return (
    <div style={{ width: '100vw', height: '100dvh', background: '#050810', overflow: 'hidden', position: 'fixed', inset: 0 }}>
      {screen === 'splash'     && <SplashScreen onStart={() => go('intro')} />}
      {screen === 'intro'      && <IntroScreen onStart={() => go('quiz-intro')} />}
      {screen === 'quiz-intro' && <QuizIntroScreen onStart={() => go('quiz')} />}
      {screen === 'quiz'       && <QuizScreen onComplete={(answers) => {
        const result = computeArchetype(answers)
        saveProfile(result)
        const ts = Date.now()
        go('transition', () => { setArchetype(result); setSavedAt(ts) })
      }} />}
      {screen === 'transition' && <TransitionScreen onReveal={() => go('result')} />}
      {screen === 'result'     && archetype && <ResultScreen archetypeKey={archetype} onContinue={() => go('main')} />}
      {screen === 'main'       && archetype && <MainApp archetypeKey={archetype} onRestart={handleRestart} savedAt={savedAt} />}

      <div style={{ position: 'fixed', inset: 0, background: '#050810', zIndex: 9999, opacity: blackout ? 1 : 0, transition: blackout ? 'opacity 0.36s ease' : 'opacity 0.28s ease', pointerEvents: blackout ? 'all' : 'none' }} />
      {archetype && ARCHETYPES[archetype] && (
        <div style={{ position: 'fixed', inset: 0, background: ARCHETYPES[archetype].color, zIndex: 10000, opacity: blackout ? 0.08 : 0, transition: blackout ? 'opacity 0.36s ease' : 'opacity 0.28s ease', pointerEvents: 'none' }} />
      )}
    </div>
  )
}
