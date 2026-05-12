import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { initAnalytics, getConsent, setConsent, trackAppOpen, trackQuizComplete, trackBreathComplete, trackRoutineComplete, trackQueteComplete, trackEspaceVraiQualified, trackError } from './analytics'
import { initPressFeedback, easing as EASE, duration as DUR, useExitAnimation, checkStreakMilestone } from './motion'
import { getTimeAmbience, getCoconVitality, getSouvenirs, addSouvenir, SOUVENIR_LIBRARY, formatSouvenirDate, getSeason, getMeteo, getVisitor, checkAstroEclat, getCercle, addToCercle, removeFromCercle, sendLumiere, hasSentLumiereToday, getLumieresTotal, getCarnetEntries, getCarnetEntryToday, saveCarnetEntry, getMoodHistory } from './inner-world'
import { setAudioEnabled, getAudioEnabled, playSouvenir, playChime, playRelease, playBreathIn, playBreathOut, playMilestone, playConfirm, initAudioPressFeedback } from './audio'
import { tokens as T } from './design-tokens'

const B = import.meta.env.BASE_URL

// Performance: limite des particules animées sur petits écrans
const IS_SMALL = typeof window !== 'undefined' && window.innerWidth < 480
const MOTE_LIMIT = IS_SMALL ? 8 : 25

// ─── ARCHETYPES ───────────────────────────────────────────────────────────────

const ARCHETYPES = {
  resilience: {
    profil: 'Porteur·se de Feu',
    animal: 'Le Phénix intérieur',
    bg: 'bg-feu.avif',
    color: '#f59e0b',
    shadow: 'rgba(245,158,11,0.4)',
    rgb: '245,158,11',
    element: 'Feu',
    forces: ['Courage', 'Transformation', 'Détermination', 'Force intérieure'],
    desc: `Tu avances même quand la route est difficile. En toi vit une flamme que rien n'éteint — une force tranquille qui transforme chaque obstacle en passage vers quelque chose de plus grand.\n\nTon chemin : nourrir ce feu intérieur sans te brûler, et offrir ta lumière à ceux qui en ont besoin.`,
    worldInsight: 'Ton feu intérieur ne s\'éteint jamais. Il se transforme.',
    intentions: [
      "Ce que tu ne peux pas changer, transforme-le. Ce que tu peux changer, fais-le maintenant.",
      "Ta force n'est pas dans l'absence de peur, mais dans le choix d'avancer malgré elle.",
      "Chaque obstacle est un passage déguisé. Tu sais les traverser.",
      "L'action, même imparfaite, est toujours plus puissante que l'attente parfaite.",
      "Ta flamme intérieure ne cherche pas à réchauffer le monde. Elle le réchauffe naturellement.",
      "Ce que tu construis chaque jour, même en silence, compte plus que tu ne le crois.",
      "Tu n'as pas besoin d'aller vite. Tu as besoin d'avancer.",
      "Ton courage n'est pas un état. C'est une décision que tu prends, encore et encore.",
      "Même brisé·e, tu reconstruis. C'est ta nature profonde.",
      "L'endurance n'est pas la résignation. C'est le feu qui reste après la tempête.",
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
    bg: 'bg-eau.avif',
    color: '#14b8a6',
    shadow: 'rgba(20,184,166,0.4)',
    rgb: '20,184,166',
    element: 'Eau',
    forces: ['Douceur', 'Harmonie', 'Ancrage', 'Empathie'],
    desc: `Tu es un·e bâtisseur·se de paix intérieure. Ton calme profond inspire ceux qui t'entourent. Doté·e d'une grande sagesse intuitive, tu sais écouter ce qui est essentiel, même dans le tumulte.\n\nTon chemin : préserver ton espace intérieur, et rayonner naturellement autour de toi.`,
    worldInsight: 'Chaque instant porte en lui sa propre profondeur — tu sais la voir.',
    intentions: [
      "Ta paix intérieure est ton plus grand cadeau au monde.",
      "Là où tu es vraiment présent·e, quelque chose de beau peut naître.",
      "Le calme n'est pas l'absence d'émotion. C'est la présence à ce qui est.",
      "Tu crées l'espace où les autres respirent. C'est une force rare.",
      "Ta douceur n'est pas une faiblesse. C'est une intelligence du cœur.",
      "Aujourd'hui, laisse le moment être ce qu'il est, sans vouloir le changer.",
      "Tes racines sont profondes. Rien ne peut vraiment t'emporter.",
      "Ton silence est une forme de sagesse que peu savent reconnaître.",
      "La vraie présence n'exige rien. Elle rayonne simplement.",
      "Prends soin de toi avec la même douceur que tu offres aux autres.",
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
    bg: 'bg-brume.avif',
    color: '#6366f1',
    shadow: 'rgba(99,102,241,0.4)',
    rgb: '99,102,241',
    element: 'Brume',
    forces: ['Intuition', 'Profondeur', 'Perception', 'Sagesse'],
    desc: `Tu lis ce que les autres ne voient pas. Dans le silence, tu captes des vérités que peu peuvent entendre. Ta profondeur est une forme rare et précieuse de lumière.\n\nTon chemin : faire confiance à ton intelligence intérieure — elle ne t'a jamais vraiment trompé·e.`,
    worldInsight: 'Dans le silence de la brume, tu perçois ce que d\'autres ne voient pas.',
    intentions: [
      "Ce que tu vois en silence, peu de gens peuvent le voir. Fais confiance à ta perception.",
      "La vraie connaissance de soi est un voyage sans destination. C'est ça, sa beauté.",
      "Chaque question que tu te poses est déjà une forme de réponse.",
      "Ta profondeur n'est pas un fardeau. C'est ta façon d'être vraiment vivant·e.",
      "Observe. Tout est là, dans les détails que les autres ne remarquent pas.",
      "Ton intuition parle doucement. Apprends à lui faire plus de place aujourd'hui.",
      "Le sens ne se trouve pas. Il se crée, à chaque décision consciente.",
      "Tes questions comptent autant que tes réponses. Parfois plus.",
      "Le doute n'est pas l'opposé de la sagesse. C'en est l'entrée.",
      "Ce que tu as traversé t'a donné une vue que les autres n'ont pas.",
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
    bg: 'bg-foret.avif',
    color: '#ec4899',
    shadow: 'rgba(236,72,153,0.4)',
    rgb: '236,72,153',
    element: 'Forêt',
    forces: ['Créativité', 'Joie', 'Confiance', 'Abondance'],
    desc: `Tu transformes tout ce que tu touches. Ta joie est contagieuse, ta créativité infinie. Là où tu passes, quelque chose de nouveau et de beau prend vie naturellement.\n\nTon chemin : ne jamais retenir ta lumière — le monde en a profondément besoin.`,
    worldInsight: 'Ta forêt intérieure est un sanctuaire vivant — ta lumière y fait pousser quelque chose.',
    intentions: [
      "Ta joie est une forme de résistance. Ne la restreins jamais.",
      "Là où tu passes, quelque chose de beau prend vie. C'est ton don naturel.",
      "Créer n'est pas optionnel pour toi. C'est une façon de respirer.",
      "Le monde a besoin de ta couleur, pas d'une version filtrée de toi.",
      "Ta créativité n'est pas un talent parmi d'autres. C'est une énergie de vie.",
      "Aujourd'hui, laisse quelque chose naître sans jugement ni attente.",
      "Ta lumière n'a pas besoin de permission pour exister. Brille.",
      "Ton éclat ne s'excuse pas. Il illumine.",
      "La créativité n'attend pas l'inspiration — elle la crée.",
      "Quelque chose de beau passe par toi. Laisse-le circuler.",
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
    bg: 'bg-quiz-01.avif',
    tint: 'linear-gradient(160deg, rgba(79,70,229,0.22) 0%, rgba(139,92,246,0.10) 100%)',
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
    bg: 'bg-quiz-02.avif',
    tint: 'linear-gradient(160deg, rgba(251,146,60,0.22) 0%, rgba(245,158,11,0.10) 100%)',
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
    bg: 'bg-quiz-03.avif',
    tint: 'linear-gradient(160deg, rgba(20,184,166,0.22) 0%, rgba(6,182,212,0.10) 100%)',
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
    bg: 'bg-quiz-04.avif',
    tint: 'linear-gradient(160deg, rgba(236,72,153,0.22) 0%, rgba(251,113,133,0.10) 100%)',
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
    bg: 'bg-quiz-05.avif',
    tint: 'linear-gradient(160deg, rgba(139,92,246,0.24) 0%, rgba(109,40,217,0.10) 100%)',
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
    bg: 'bg-quiz-06.avif',
    tint: 'linear-gradient(160deg, rgba(99,102,241,0.26) 0%, rgba(79,70,229,0.12) 100%)',
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
    bg: 'bg-quiz-07.avif',
    tint: 'linear-gradient(160deg, rgba(245,158,11,0.28) 0%, rgba(239,68,68,0.12) 100%)',
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
    bg: 'bg-quiz-08.avif',
    tint: 'linear-gradient(160deg, rgba(13,148,136,0.26) 0%, rgba(20,184,166,0.12) 100%)',
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
    bg: 'bg-quiz-09.avif',
    tint: 'linear-gradient(160deg, rgba(251,113,133,0.24) 0%, rgba(236,72,153,0.10) 100%)',
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
    bg: 'bg-quiz-10.avif',
    tint: 'linear-gradient(160deg, rgba(148,163,184,0.20) 0%, rgba(100,116,139,0.10) 100%)',
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
    bg: 'bg-quiz-11.avif',
    tint: 'linear-gradient(160deg, rgba(109,40,217,0.28) 0%, rgba(139,92,246,0.14) 100%)',
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
    bg: 'bg-quiz-12.avif',
    tint: 'linear-gradient(160deg, rgba(124,58,237,0.26) 0%, rgba(167,139,250,0.12) 100%)',
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
    bg: 'bg-quiz-13.avif',
    tint: 'linear-gradient(160deg, rgba(16,185,129,0.22) 0%, rgba(52,211,153,0.10) 100%)',
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
    bg: 'bg-quiz-14.avif',
    tint: 'linear-gradient(160deg, rgba(6,182,212,0.24) 0%, rgba(34,211,238,0.10) 100%)',
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
    bg: 'bg-quiz-15.avif',
    tint: 'linear-gradient(160deg, rgba(167,139,250,0.24) 0%, rgba(196,181,253,0.10) 100%)',
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
    bg: 'bg-quiz-16.avif',
    tint: 'linear-gradient(160deg, rgba(100,116,139,0.22) 0%, rgba(148,163,184,0.10) 100%)',
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
    bg: 'bg-quiz-17.avif',
    tint: 'linear-gradient(160deg, rgba(34,211,238,0.22) 0%, rgba(20,184,166,0.14) 100%)',
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
    bg: 'bg-quiz-18.avif',
    tint: 'linear-gradient(160deg, rgba(139,92,246,0.26) 0%, rgba(99,102,241,0.14) 100%)',
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
    bg: 'bg-quiz-19.avif',
    tint: 'linear-gradient(160deg, rgba(34,197,94,0.20) 0%, rgba(16,185,129,0.10) 100%)',
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
    bg: 'bg-quiz-20.avif',
    tint: 'linear-gradient(160deg, rgba(244,114,182,0.24) 0%, rgba(236,72,153,0.10) 100%)',
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
    bg: 'bg-quiz-21.avif',
    tint: 'linear-gradient(160deg, rgba(99,102,241,0.30) 0%, rgba(79,70,229,0.16) 100%)',
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
    bg: 'bg-quiz-22.avif',
    tint: 'linear-gradient(160deg, rgba(239,68,68,0.22) 0%, rgba(245,158,11,0.12) 100%)',
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
    bg: 'bg-quiz-23.avif',
    tint: 'linear-gradient(160deg, rgba(236,72,153,0.28) 0%, rgba(251,113,133,0.14) 100%)',
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

// ─── WORLDS ───────────────────────────────────────────────────────────────────

const WORLDS = {
  feu: {
    name: 'Le Monde du Feu', sub: 'Transformation · Courage · Résilience',
    bg: 'bg-feu.avif', color: '#f59e0b', rgb: '245,158,11', animalKey: 'resilience',
    fragments: [
      "Dans le monde du feu, même les cendres portent une promesse. Tu n'avances pas malgré la résistance — tu avances à travers elle.",
      "Le feu ne consume pas ce qui est vrai. Il révèle ce qui est essentiel. Ce que tu traverses forge quelque chose d'indestructible en toi.",
      "Tu as appris à ne pas fuir les flammes intérieures. Peu à peu, tu en fais une lanterne.",
      "Le Phénix ne renaît pas parce qu'il le doit. Il renaît parce que c'est sa nature profonde. La tienne aussi.",
      "Trente jours dans le monde du feu. Ta flamme est devenue une lumière que rien ne peut éteindre — ni les doutes, ni la peur, ni le temps.",
    ],
  },
  eau: {
    name: "Le Monde de l'Eau", sub: 'Présence · Ancrage · Douceur',
    bg: 'bg-eau.avif', color: '#14b8a6', rgb: '20,184,166', animalKey: 'presence',
    fragments: [
      "L'eau ne résiste pas — elle épouse. Dans ce monde, tu apprends que la douceur n'est pas une faiblesse, mais la forme la plus profonde de la force.",
      "Le cerf s'arrête au bord de l'eau. Il regarde. Il sait que voir vraiment est un acte de courage.",
      "Tu as trouvé dans ce monde quelque chose que peu cherchent : le silence habité. Pas l'absence, mais la présence pleine.",
      "Chaque vague se retire pour mieux revenir. Ton ancrage grandit avec chaque retour à toi-même.",
      "L'eau trouve toujours son chemin. Sans forcer, sans bruit. Ton chemin intérieur aussi.",
    ],
  },
  brume: {
    name: 'Le Monde de la Brume', sub: 'Sagesse · Intuition · Profondeur',
    bg: 'bg-brume.avif', color: '#6366f1', rgb: '99,102,241', animalKey: 'sagesse',
    fragments: [
      "La brume cache ce qui est évident pour révéler ce qui est vrai. Ici, ton regard apprend à percer l'apparence.",
      "Le loup marche seul dans la brume non par solitude, mais par clarté. Il sait que certaines vérités se trouvent dans le silence.",
      "Tu as commencé à faire confiance à ce que tu ressens avant de savoir pourquoi. C'est le début de la vraie sagesse.",
      "Dans ce monde, le doute n'est pas l'ennemi de la connaissance — c'en est la porte d'entrée.",
      "Quarante-cinq jours dans la brume. Tu percevais déjà l'invisible. Maintenant, tu sais qu'il te parle.",
    ],
  },
  foret: {
    name: 'Le Monde de la Forêt', sub: 'Lumière · Créativité · Joie',
    bg: 'bg-foret.avif', color: '#ec4899', rgb: '236,72,153', animalKey: 'lumiere',
    fragments: [
      "La forêt garde ses secrets dans la lumière filtrée. Chaque rayon qui perce les feuillages te rappelle que la beauté se trouve dans les espaces entre.",
      "L'ours de lumière n'illumine pas le monde malgré ses blessures — il l'illumine à travers elles.",
      "Tu as découvert dans ce monde que créer n'est pas produire. C'est offrir une partie de ta lumière intérieure.",
      "Chaque pas dans la forêt éveille quelque chose. Tu avances maintenant avec la conscience de ce que tu laisses derrière toi.",
      "La forêt a tout vu. Elle a vu tes doutes, tes élans, tes silences. Et elle te dit : tu es exactement où tu dois être.",
    ],
  },
  cosmos: {
    name: 'Le Monde du Cosmos', sub: 'Mystère · Infini · Perspective',
    bg: 'bg-cosmos.avif', color: '#818cf8', rgb: '129,140,248', animalKey: 'sagesse',
    fragments: [
      "Dans le cosmos, les distances sont si grandes qu'elles rendent l'instant précieux. Tu es une étoile qui ne connaît pas encore sa propre magnitude.",
      "Là-haut, pas de haut, pas de bas. Seulement des directions choisies. Ta liberté intérieure ressemble à ça.",
      "Les étoiles ne se demandent pas si leur lumière compte. Elles brillent, c'est tout. Tu as ce même droit.",
      "Le cosmos ne juge pas ta vitesse. Il observe — avec une patience de milliards d'années.",
      "Tu as traversé assez de silence intérieur pour comprendre que le vide n'est pas l'absence. C'est l'espace où tout peut naître.",
    ],
  },
  vide: {
    name: 'Le Monde du Vide', sub: 'Silence · Essence · Paix profonde',
    bg: 'bg-vide.avif', color: '#94a3b8', rgb: '148,163,184', animalKey: 'presence',
    fragments: [
      "Le vide n'est pas le néant. C'est l'espace d'avant les mots, d'avant les formes. C'est là que tu trouves ce qui est vraiment toi.",
      "Dans ce monde, la lenteur est une pratique. Chaque silence porte plus que tous les bruits du monde réunis.",
      "Tu commences à comprendre que le vide intérieur n'est pas un manque à combler. C'est une capacité à accueillir.",
      "Certaines vérités ne se disent pas. Elles se vivent, dans le silence de ce monde.",
      "Tu as appris à tenir l'espace entre deux pensées. Ce silence-là est le tien, profondément.",
    ],
  },
}

const WORLD_ORDER = {
  resilience: ['feu', 'cosmos', 'foret', 'eau', 'brume', 'vide'],
  presence:   ['eau', 'foret', 'cosmos', 'vide', 'brume', 'feu'],
  sagesse:    ['brume', 'vide', 'cosmos', 'foret', 'eau', 'feu'],
  lumiere:    ['foret', 'cosmos', 'brume', 'eau', 'vide', 'feu'],
}
const WORLD_UNLOCK_DAYS = [0, 5, 12, 20, 30, 45]

// ─── ÉTOILES ──────────────────────────────────────────────────────────────────

const STARS = [
  { x: 7,  y: 9,  r: 1.1, dur: 4.8, del: 0.0, fill: 'rgba(220,235,255,1)' },
  { x: 83, y: 6,  r: 0.7, dur: 6.4, del: 1.2, fill: 'white' },
  { x: 63, y: 16, r: 1.3, dur: 5.2, del: 0.6, fill: 'rgba(255,235,180,1)' },
  { x: 30, y: 8,  r: 0.8, dur: 7.0, del: 2.1, fill: 'white' },
  { x: 91, y: 29, r: 0.9, dur: 4.5, del: 1.7, fill: 'rgba(220,235,255,1)' },
  { x: 17, y: 39, r: 0.6, dur: 6.8, del: 0.4, fill: 'white' },
  { x: 77, y: 53, r: 1.0, dur: 5.9, del: 3.0, fill: 'rgba(255,235,180,1)' },
  { x: 46, y: 69, r: 0.8, dur: 4.9, del: 1.4, fill: 'rgba(220,235,255,1)' },
  { x: 22, y: 63, r: 1.0, dur: 6.6, del: 0.9, fill: 'white' },
  { x: 69, y: 80, r: 0.7, dur: 5.6, del: 2.4, fill: 'rgba(255,235,180,1)' },
  { x: 5,  y: 75, r: 0.9, dur: 7.3, del: 1.0, fill: 'white' },
  { x: 92, y: 72, r: 0.6, dur: 4.6, del: 2.8, fill: 'rgba(220,235,255,1)' },
  { x: 55, y: 4,  r: 0.8, dur: 5.3, del: 3.5, fill: 'white' },
  { x: 38, y: 88, r: 0.7, dur: 6.1, del: 0.3, fill: 'rgba(255,235,180,1)' },
  { x: 73, y: 57, r: 0.85, dur: 5.7, del: 2.2, fill: 'rgba(220,235,255,1)' },
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
  if (h < 5)  return 'Bonne nuit'
  if (h < 9)  return 'Bonjour'
  if (h < 12) return 'Belle matinée'
  if (h < 14) return 'Bon début d\'après-midi'
  if (h < 18) return 'Belle journée'
  if (h < 21) return 'Bonsoir'
  return 'Belle soirée'
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

const PRESENCE_LABELS = {
  resilience: ['Feu naissant', 'Flamme qui s\'éveille', 'Feu en mouvement', 'Éclat du Phénix'],
  presence:   ['Eau naissante', 'Courant qui s\'étire', 'Profondeur en éveil', 'Présence incarnée'],
  sagesse:    ['Brume légère', 'Profondeur qui s\'ouvre', 'Sagesse en éveil', 'Écho intérieur'],
  lumiere:    ['Étincelle naissante', 'Lumière qui s\'éveille', 'Rayonnement en cours', 'Éclat de Lumière'],
}
function getPresenceLabel(p, archetypeKey) {
  const labels = (archetypeKey && PRESENCE_LABELS[archetypeKey]) || ['Présence naissante', 'Lumière qui s\'éveille', 'Flamme qui grandit', 'Éclat intérieur']
  if (p < 0.25) return labels[0]
  if (p < 0.5)  return labels[1]
  if (p < 0.75) return labels[2]
  return labels[3]
}

function loadProfile() {
  try { return JSON.parse(localStorage.getItem('neya_profile') || 'null') } catch { return null }
}
function saveProfile(archetype) {
  localStorage.setItem('neya_profile', JSON.stringify({ archetype, savedAt: Date.now() }))
  try { addSouvenir('archetype_revealed', { archetype }) } catch {}
}
function markTodayVisited() {
  localStorage.setItem(`neya_visited_${todayKey()}`, '1')
}
function isTodayFirstVisit() {
  return !localStorage.getItem(`neya_visited_${todayKey()}`)
}

function getCurrentStreak() {
  const today = new Date()
  const todayDateStr = today.toISOString().split('T')[0]
  let todayDone = false
  try {
    const td = JSON.parse(localStorage.getItem(`neya_routines_${todayDateStr}`) || '[]')
    todayDone = td.some(Boolean)
  } catch {}
  let streak = 0
  for (let i = todayDone ? 0 : 1; i < 366; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const key = `neya_routines_${d.toISOString().split('T')[0]}`
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]')
      if (data.some(Boolean)) { streak++ } else { break }
    } catch { break }
  }
  return streak
}

function getTotalRoutinesDone() {
  let total = 0
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('neya_routines_')) {
        const data = JSON.parse(localStorage.getItem(key) || '[]')
        total += data.filter(Boolean).length
      }
    }
  } catch {}
  return total
}

function getTotalDaysVisited() {
  let count = 0
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('neya_routines_')) {
        if (JSON.parse(localStorage.getItem(key) || '[]').some(Boolean)) count++
      }
    }
  } catch {}
  return count
}

function getUnlockedWorlds(archetypeKey) {
  const totalDays = getTotalDaysVisited()
  const order = WORLD_ORDER[archetypeKey] || WORLD_ORDER.resilience
  return order.filter((_, i) => totalDays >= WORLD_UNLOCK_DAYS[i])
}

function getWorldFragmentCount(archetypeKey) {
  const totalDays = getTotalDaysVisited()
  const thresholds = [0, 7, 14, 21, 30]
  return thresholds.filter(t => totalDays >= t).length
}

function getDaysToNextWorld(archetypeKey) {
  const totalDays = getTotalDaysVisited()
  const nextThreshold = WORLD_UNLOCK_DAYS.find(d => d > totalDays)
  return nextThreshold !== undefined ? nextThreshold - totalDays : 0
}

// ─── GAMIFICATION — XP · NIVEAUX · INVITATIONS · GRÂCE ───────────────────────

const XP_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000]

const ARCHETYPE_LEVELS = {
  resilience: ['Étincelle', 'Flamme', 'Braise', 'Feu Vif', 'Brasier', 'Phénix', 'Soleil'],
  presence:   ['Goutte', 'Ruisseau', 'Rivière', 'Lac', 'Mer', 'Océan', 'Source'],
  sagesse:    ['Brume', 'Voile', 'Mystère', 'Profondeur', 'Loup', 'Silence', 'Sage'],
  lumiere:    ['Luciole', 'Rayon', 'Lumière', 'Éclat', 'Aurore', 'Ours', 'Cosmos'],
}

const DAILY_INVITATIONS = [
  'Pose une main sur ton cœur pendant 30 secondes.',
  'Regarde le ciel au moins une fois aujourd\'hui.',
  'Note le premier mot qui vient quand tu penses à toi.',
  'Bois un grand verre d\'eau lentement, consciemment.',
  'Envoie un message chaleureux à quelqu\'un sans raison.',
  'Prends 3 respirations profondes avant ton prochain repas.',
  'Marche pieds nus sur le sol un moment.',
  'Écoute une chanson qui te touche vraiment.',
  'Ferme les yeux 2 minutes et écoute ce qu\'il y a autour de toi.',
  'Dis à voix haute une chose que tu apprécies en toi.',
  'Ouvre une fenêtre et laisse l\'air entrer.',
  'Note quelque chose que tu voudrais te dire il y a 5 ans.',
  'Prends 1 minute pour ne rien faire — juste être là.',
  'Note une peur que tu portes et accepte-la sans la combattre.',
  'Regarde tes mains et remercie-les pour ce qu\'elles font.',
  'Éteins ton téléphone 30 minutes et observe ce que ça fait.',
  'Fais quelque chose lentement que tu fais toujours vite.',
  'Note 3 choses qui existaient avant toi et existeront après.',
  'Prends un chemin différent de ta route habituelle.',
  'Dis merci à ton corps pour ce qu\'il endure chaque jour.',
  'Lis quelques lignes d\'un livre qui t\'a marqué·e.',
  'Reste 5 minutes sans chercher à changer quoi que ce soit.',
  'Dessine ou gribouille quelque chose sans but précis.',
  'Plante quelque chose — même symbolique, même virtuel.',
  'Souris à quelqu\'un que tu ne connais pas aujourd\'hui.',
]

function getXP() {
  try { return parseInt(localStorage.getItem('neya_xp') || '0', 10) } catch { return 0 }
}

function addXP(amount) {
  try {
    const current = getXP()
    localStorage.setItem('neya_xp', String(current + amount))
  } catch {}
}

function getLevelIndex() {
  const xp = getXP()
  let level = 0
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) { level = i; break }
  }
  return Math.min(level, XP_THRESHOLDS.length - 1)
}

function getLevelName(archetypeKey) {
  const levels = ARCHETYPE_LEVELS[archetypeKey] || ARCHETYPE_LEVELS.presence
  return levels[getLevelIndex()] || levels[levels.length - 1]
}

function getXPProgress() {
  const xp = getXP()
  const lvl = getLevelIndex()
  const base = XP_THRESHOLDS[lvl]
  const next = XP_THRESHOLDS[lvl + 1]
  if (!next) return 1
  return Math.min(1, (xp - base) / (next - base))
}

function getXPToNext() {
  const xp = getXP()
  const lvl = getLevelIndex()
  const next = XP_THRESHOLDS[lvl + 1]
  if (!next) return 0
  return next - xp
}

function getTodayInvitationKey() {
  return `neya_inv_${todayKey()}`
}

function isTodayInvitationDone() {
  try { return !!localStorage.getItem(getTodayInvitationKey()) } catch { return false }
}

function completeTodayInvitation() {
  try { localStorage.setItem(getTodayInvitationKey(), '1') } catch {}
  addXP(20)
}

function getTodayInvitation() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return DAILY_INVITATIONS[dayOfYear % DAILY_INVITATIONS.length]
}

function getGraceAvailable() {
  try {
    const last = localStorage.getItem('neya_grace_last_used')
    if (!last) return true
    const daysSinceLast = Math.floor((Date.now() - new Date(last).getTime()) / 86400000)
    return daysSinceLast >= 7
  } catch { return false }
}

function applyGraceIfNeeded() {
  try {
    const streak = getCurrentStreak()
    if (streak > 0) return false
    if (!getGraceAvailable()) return false
    // Check if yesterday had meaningful streak (> 2)
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    const y2 = new Date(); y2.setDate(y2.getDate() - 2)
    const yKey  = `neya_routines_${yesterday.toISOString().split('T')[0]}`
    const y2Key = `neya_routines_${y2.toISOString().split('T')[0]}`
    const yDone  = (JSON.parse(localStorage.getItem(yKey) || '[]')).some(Boolean)
    const y2Done = (JSON.parse(localStorage.getItem(y2Key) || '[]')).some(Boolean)
    if (!yDone && !y2Done) return false // streak was already broken before
    if (yDone) return false // yesterday was done, no grace needed
    // Yesterday missed but 2 days ago was done — apply grace for yesterday
    localStorage.setItem(yKey, JSON.stringify([true]))
    localStorage.setItem('neya_grace_last_used', new Date().toISOString().split('T')[0])
    return true
  } catch { return false }
}

function getWorldRealFragmentCount(worldKey) {
  try { return Math.min(5, parseInt(localStorage.getItem(`neya_frags_${worldKey}`) || '0', 10)) } catch { return 0 }
}

function addEvraiFragment(archetypeKey) {
  try {
    const dailyKey = `neya_evrai_${todayKey()}`
    const todayCount = parseInt(localStorage.getItem(dailyKey) || '0', 10)
    if (todayCount >= 3) return // max 3 fragments par jour
    const unlocked = getUnlockedWorlds(archetypeKey)
    const worldKey = unlocked.length > 0 ? unlocked[unlocked.length - 1] : (WORLD_ORDER[archetypeKey] || WORLD_ORDER.resilience)[0]
    const current = getWorldRealFragmentCount(worldKey)
    if (current < 5) localStorage.setItem(`neya_frags_${worldKey}`, String(current + 1))
    localStorage.setItem(dailyKey, String(todayCount + 1))
    addXP(50)
  } catch {}
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

function TypingText({ text, delay = 0, speed = 38, style: s, onDone, cursorColor }) {
  const [len, setLen] = useState(0)
  const [done, setDone] = useState(false)
  useEffect(() => {
    setLen(0); setDone(false)
    let i = 0
    const tid = setTimeout(() => {
      const iv = setInterval(() => {
        i++; setLen(i)
        if (i >= text.length) { setDone(true); clearInterval(iv); if (onDone) onDone() }
      }, speed)
      return () => clearInterval(iv)
    }, delay)
    return () => clearTimeout(tid)
  }, [text, delay, speed])
  return (
    <span style={s}>
      {text.slice(0, len)}
      {!done && <span style={{ animation: 'cursorblink 0.75s cubic-bezier(0.45,0,0.55,1) infinite', color: cursorColor || 'inherit', textShadow: cursorColor ? `0 0 8px ${cursorColor}88` : 'none' }}>|</span>}
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
      {/* Halo ambiant très doux */}
      <ellipse cx="60" cy="58" rx="48" ry="52" fill={color} opacity="0.03" />

      {/* === AILE GAUCHE — 5 couches, pointes vers le haut === */}
      {/* Couche principale — grande lame d'aile */}
      <path d="M54,68 C44,58 22,44 2,48 C8,34 36,38 54,60Z" fill={color} opacity="0.88"/>
      {/* Deuxième couche — plume médiane */}
      <path d="M52,72 C38,62 14,52 0,58 C6,44 34,48 52,66Z" fill={color} opacity="0.65"/>
      {/* Troisième couche — plume basse */}
      <path d="M51,78 C36,70 12,64 2,70 C10,56 36,58 51,74Z" fill={color} opacity="0.42"/>
      {/* Quatrième couche — traîne fine */}
      <path d="M50,82 C38,76 18,72 6,78 C14,64 38,66 50,78Z" fill={color} opacity="0.22"/>
      {/* Cinquième couche — reflet lumineux blanc */}
      <path d="M54,62 C44,52 26,40 8,44 C18,36 40,40 54,58Z" fill="white" opacity="0.07"/>
      {/* Glow intérieur aile gauche */}
      <path d="M54,68 C46,60 30,50 14,52 C22,42 44,46 54,62Z" fill={color} opacity="0.08"/>

      {/* === AILE DROITE — 5 couches, pointes vers le haut === */}
      {/* Couche principale */}
      <path d="M66,68 C76,58 98,44 118,48 C112,34 84,38 66,60Z" fill={color} opacity="0.88"/>
      {/* Deuxième couche */}
      <path d="M68,72 C82,62 106,52 120,58 C114,44 86,48 68,66Z" fill={color} opacity="0.65"/>
      {/* Troisième couche */}
      <path d="M69,78 C84,70 108,64 118,70 C110,56 84,58 69,74Z" fill={color} opacity="0.42"/>
      {/* Quatrième couche */}
      <path d="M70,82 C82,76 102,72 114,78 C106,64 82,66 70,78Z" fill={color} opacity="0.22"/>
      {/* Reflet blanc */}
      <path d="M66,62 C76,52 94,40 112,44 C102,36 80,40 66,58Z" fill="white" opacity="0.07"/>
      {/* Glow intérieur aile droite */}
      <path d="M66,68 C74,60 90,50 106,52 C98,42 76,46 66,62Z" fill={color} opacity="0.08"/>

      {/* === CORPS — fusiforme svelte === */}
      <ellipse cx="60" cy="65" rx="9" ry="22" fill={color} opacity="0.92"/>
      {/* Reflet central corps */}
      <ellipse cx="59" cy="62" rx="4" ry="14" fill="white" opacity="0.08"/>

      {/* === TÊTE — petite, fière === */}
      <ellipse cx="60" cy="40" rx="7" ry="8" fill={color} opacity="0.96"/>
      {/* Reflet tête */}
      <ellipse cx="58" cy="38" rx="3" ry="3.5" fill="white" opacity="0.10"/>

      {/* === CRÊTE DE FLAMME — 5 flammes ascendantes, profil 3/4 === */}
      {/* Flamme principale — monte haut */}
      <path d="M59,34 C55,22 54,10 58,2 C62,10 64,22 62,34Z" fill={color} opacity="0.98"/>
      {/* Flamme gauche secondaire haute */}
      <path d="M56,34 C50,24 49,14 52,8 C56,16 58,26 57,34Z" fill={color} opacity="0.82"/>
      {/* Flamme droite secondaire */}
      <path d="M63,34 C68,24 68,16 66,10 C63,18 62,26 63,34Z" fill={color} opacity="0.70"/>
      {/* Flamme gauche basse */}
      <path d="M55,34 C50,28 50,20 53,14 C56,20 57,28 56,34Z" fill={color} opacity="0.48"/>
      {/* Flamme droite basse */}
      <path d="M65,34 C70,28 70,22 67,16 C65,22 64,28 65,34Z" fill={color} opacity="0.38"/>
      {/* Reflet blanc crête centrale */}
      <path d="M59,34 C57,24 57,14 59,6 C60,14 60,24 60,34Z" fill="white" opacity="0.10"/>

      {/* === YEUX — lumineux === */}
      <ellipse cx="56" cy="40" rx="2.8" ry="3" fill="white" opacity="0.96"/>
      <ellipse cx="64" cy="40" rx="2.8" ry="3" fill="white" opacity="0.96"/>

      {/* === QUEUE — 8 flammes descendantes organiques === */}
      {/* Flamme centrale — la plus longue */}
      <path d="M60,86 C58,98 56,110 58,120 C60,112 62,100 60,86Z" fill={color} opacity="0.90"/>
      {/* Flamme légèrement gauche */}
      <path d="M58,86 C54,100 50,112 52,120 C55,110 57,98 58,86Z" fill={color} opacity="0.80"/>
      {/* Flamme légèrement droite */}
      <path d="M62,86 C66,100 70,112 68,120 C65,110 63,98 62,86Z" fill={color} opacity="0.80"/>
      {/* Flamme gauche ample */}
      <path d="M56,86 C50,100 44,114 46,120 C50,112 54,100 56,86Z" fill={color} opacity="0.62"/>
      {/* Flamme droite ample */}
      <path d="M64,86 C70,100 76,114 74,120 C70,112 66,100 64,86Z" fill={color} opacity="0.62"/>
      {/* Flamme gauche longue ondulante */}
      <path d="M55,86 C47,102 40,116 44,120 C48,114 52,102 55,86Z" fill={color} opacity="0.40"/>
      {/* Flamme droite longue ondulante */}
      <path d="M65,86 C73,102 80,116 76,120 C72,114 68,102 65,86Z" fill={color} opacity="0.40"/>
      {/* Flamme extrême gauche — traîne */}
      <path d="M54,87 C44,104 38,118 42,120 C46,116 50,104 54,87Z" fill={color} opacity="0.20"/>
      {/* Flamme extrême droite — traîne */}
      <path d="M66,87 C76,104 82,118 78,120 C74,116 70,104 66,87Z" fill={color} opacity="0.20"/>
      {/* Reflet blanc central queue */}
      <path d="M60,86 C59,100 59,112 60,120 C61,112 61,100 60,86Z" fill="white" opacity="0.09"/>
    </svg>
  )
})

const WolfSpirit = React.memo(function WolfSpirit({ size = 120, color = '#6366f1', style: s }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={s}>
      {/* — LAYER 0 : Aura / brume ambiante — */}
      <ellipse cx="60" cy="78" rx="44" ry="46" fill={color} opacity="0.05" />
      <ellipse cx="60" cy="72" rx="36" ry="40" fill={color} opacity="0.04" />

      {/* — LAYER 1 : Corps / épaules — suggestion de masse — */}
      <path d="M22,120 C20,100 30,84 60,76 C90,84 100,100 98,120Z" fill={color} opacity="0.18"/>

      {/* — LAYER 2 : Fourrure crinière — 7 paths rayonnants depuis le cou — */}
      <path d="M60,90 C48,98 32,102 20,112" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.22"/>
      <path d="M60,90 C44,96 26,96 12,106" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.17"/>
      <path d="M60,90 C50,100 40,108 30,120" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.19"/>
      <path d="M60,90 C72,98 88,102 100,112" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.22"/>
      <path d="M60,90 C76,96 94,96 108,106" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.17"/>
      <path d="M60,90 C70,100 80,108 90,120" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.19"/>
      <path d="M60,90 C60,104 60,112 60,120" stroke={color} strokeWidth="5.5" strokeLinecap="round" fill="none" opacity="0.24"/>

      {/* — LAYER 3 : Tête — fond (background shape) — */}
      <path d="M30,78 C28,52 36,28 46,16 C52,10 60,8 60,8 C60,8 68,10 74,16 C84,28 92,52 90,78 C90,96 78,108 60,108 C42,108 30,96 30,78Z" fill={color} opacity="0.55"/>

      {/* — LAYER 4 : Tête — face principale — */}
      <path d="M34,80 C32,56 38,34 48,22 C53,16 60,14 60,14 C60,14 67,16 72,22 C82,34 88,56 86,80 C86,96 75,106 60,106 C45,106 34,96 34,80Z" fill={color} opacity="0.82"/>

      {/* — LAYER 5 : Highlight central — lumière sculptée — */}
      <path d="M46,52 C46,40 52,30 60,28 C68,30 74,40 74,52 C74,62 68,70 60,72 C52,70 46,62 46,52Z" fill="white" opacity="0.08"/>

      {/* — OREILLE GAUCHE — légèrement tournée vers la gauche — */}
      <path d="M34,52 C30,36 24,16 28,2 C36,14 44,34 46,52Z" fill={color} opacity="0.92"/>
      <path d="M36,50 C33,36 29,20 32,8 C39,18 44,36 46,50Z" fill="white" opacity="0.08"/>

      {/* — OREILLE DROITE — légèrement plus haute (asymétrie vigilante) — */}
      <path d="M86,50 C90,34 96,14 92,0 C84,12 76,32 74,50Z" fill={color} opacity="0.92"/>
      <path d="M84,48 C87,34 91,18 88,6 C81,16 76,34 74,48Z" fill="white" opacity="0.08"/>

      {/* — YEUX — amandes larges, regard direct — */}
      {/* Oeil gauche outer */}
      <path d="M40,56 C42,50 48,48 54,50 C58,52 58,58 54,62 C48,64 42,62 40,56Z" fill="white" opacity="0.95"/>
      {/* Oeil droit outer */}
      <path d="M80,56 C78,50 72,48 66,50 C62,52 62,58 66,62 C72,64 78,62 80,56Z" fill="white" opacity="0.95"/>
      {/* Pupille gauche */}
      <ellipse cx="48" cy="56" rx="3.5" ry="4" fill={color} opacity="0.15"/>
      {/* Pupille droite */}
      <ellipse cx="72" cy="56" rx="3.5" ry="4" fill={color} opacity="0.15"/>
      {/* Reflets — minuscules éclats de lumière */}
      <circle cx="50" cy="53.5" r="1.5" fill="white" opacity="0.35"/>
      <circle cx="74" cy="53.5" r="1.5" fill="white" opacity="0.35"/>

      {/* — SOURCILS — inclinés vers l'intérieur, sagesse et profondeur — */}
      <path d="M38,48 C43,43 51,42 56,46" stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.60"/>
      <path d="M82,48 C77,43 69,42 64,46" stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.60"/>

      {/* — MUSEAU — légèrement projeté en avant — */}
      <path d="M46,78 C44,90 50,102 60,104 C70,102 76,90 74,78 C70,72 65,74 60,74 C55,74 50,72 46,78Z" fill={color} opacity="0.58"/>

      {/* — NEZ — */}
      <ellipse cx="60" cy="72" rx="6" ry="4" fill={color} opacity="0.92"/>
      <ellipse cx="60" cy="71" rx="3" ry="2" fill="white" opacity="0.12"/>

      {/* — LÈVRE SUPÉRIEURE — petit sillon qui divise le museau — */}
      <path d="M60,76 C57,80 54,82 52,84" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.38"/>
      <path d="M60,76 C63,80 66,82 68,84" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.38"/>

      {/* — JOUES / FOURRURE LATÉRALE — masse et présence — */}
      <path d="M34,80 C22,78 12,84 10,96 C24,102 36,94 40,88Z" fill={color} opacity="0.30"/>
      <path d="M86,80 C98,78 108,84 110,96 C96,102 84,94 80,88Z" fill={color} opacity="0.24"/>
    </svg>
  )
})

const BearSpirit = React.memo(function BearSpirit({ size = 120, color = '#ec4899', style: s }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={s}>
      {/* Aura lointaine — présence massive dans la forêt */}
      <ellipse cx="60" cy="82" rx="52" ry="40" fill={color} opacity="0.05" />

      {/* Corps — layer 1: outline large, ancrage au sol */}
      <path d="M8,120 C8,98 16,80 28,68 C36,60 48,56 60,56 C72,56 84,60 92,68 C104,80 112,98 112,120Z" fill={color} opacity="0.42"/>
      {/* Corps — layer 2: masse principale, lourde et vaste */}
      <path d="M14,120 C14,100 22,83 34,72 C42,64 51,60 60,60 C69,60 78,64 86,72 C98,83 106,100 106,120Z" fill={color} opacity="0.78"/>
      {/* Bosse des épaules gauche — caractéristique ours */}
      <ellipse cx="30" cy="66" rx="20" ry="14" fill={color} opacity="0.72"/>
      {/* Bosse des épaules droite */}
      <ellipse cx="90" cy="66" rx="20" ry="14" fill={color} opacity="0.72"/>
      {/* Corps — layer 3: highlight ventral, lumière intérieure */}
      <ellipse cx="60" cy="92" rx="28" ry="24" fill="white" opacity="0.10"/>

      {/* Tête — ronde et puissante, plus petite que le corps */}
      <ellipse cx="60" cy="44" rx="24" ry="22" fill={color} opacity="0.90"/>
      {/* Front légèrement bombé */}
      <ellipse cx="60" cy="36" rx="18" ry="12" fill={color} opacity="0.20"/>

      {/* Oreille gauche — 3 cercles concentriques */}
      <circle cx="40" cy="27" r="11" fill={color} opacity="0.90"/>
      <circle cx="40" cy="27" r="7" fill={color} opacity="0.55"/>
      <circle cx="40" cy="27" r="3.5" fill="white" opacity="0.08"/>
      {/* Oreille droite */}
      <circle cx="80" cy="27" r="11" fill={color} opacity="0.90"/>
      <circle cx="80" cy="27" r="7" fill={color} opacity="0.55"/>
      <circle cx="80" cy="27" r="3.5" fill="white" opacity="0.08"/>

      {/* Museau proéminent — avance vers le spectateur */}
      <ellipse cx="60" cy="57" rx="14" ry="10" fill={color} opacity="0.82"/>
      {/* Nez large */}
      <ellipse cx="60" cy="51" rx="5" ry="3.5" fill={color} opacity="0.95"/>
      {/* Narines suggérées */}
      <circle cx="57.5" cy="52" r="1.5" fill="white" opacity="0.18"/>
      <circle cx="62.5" cy="52" r="1.5" fill="white" opacity="0.18"/>

      {/* Yeux — petits et rapprochés, caractéristique ours */}
      <circle cx="50" cy="44" r="4.5" fill="white" opacity="0.95"/>
      <circle cx="70" cy="44" r="4.5" fill="white" opacity="0.95"/>
      <circle cx="50.8" cy="44.6" r="2" fill={color} opacity="0.18"/>
      <circle cx="70.8" cy="44.6" r="2" fill={color} opacity="0.18"/>
      {/* Paupière gauche suggérée */}
      <path d="M46,41.5 Q50,39.5 54,41.5" stroke={color} strokeWidth="1.2" opacity="0.35" fill="none"/>
      {/* Paupière droite */}
      <path d="M66,41.5 Q70,39.5 74,41.5" stroke={color} strokeWidth="1.2" opacity="0.35" fill="none"/>

      {/* Texture fourrure — épaules gauche */}
      <path d="M22,65 Q25,58 29,62" stroke={color} strokeWidth="2" opacity="0.22" fill="none"/>
      <path d="M28,60 Q32,53 36,57" stroke={color} strokeWidth="1.8" opacity="0.20" fill="none"/>
      <path d="M19,72 Q23,64 27,68" stroke={color} strokeWidth="1.6" opacity="0.18" fill="none"/>
      {/* Texture fourrure — épaules droite */}
      <path d="M98,65 Q95,58 91,62" stroke={color} strokeWidth="2" opacity="0.22" fill="none"/>
      <path d="M92,60 Q88,53 84,57" stroke={color} strokeWidth="1.8" opacity="0.20" fill="none"/>
      <path d="M101,72 Q97,64 93,68" stroke={color} strokeWidth="1.6" opacity="0.18" fill="none"/>
      {/* Texture fourrure — cou */}
      <path d="M50,60 Q53,55 56,59" stroke={color} strokeWidth="1.5" opacity="0.25" fill="none"/>
      <path d="M64,60 Q67,55 70,59" stroke={color} strokeWidth="1.5" opacity="0.25" fill="none"/>

      {/* Patte avant gauche — légèrement en avant */}
      <path d="M22,120 C20,106 22,94 28,88 C32,84 38,84 42,88 C46,92 47,106 46,120Z" fill={color} opacity="0.68"/>
      {/* Griffes patte gauche — suggérées */}
      <ellipse cx="31" cy="118" rx="4" ry="2.5" fill={color} opacity="0.50"/>
      <ellipse cx="37" cy="119" rx="3.5" ry="2" fill={color} opacity="0.50"/>
      {/* Patte avant droite */}
      <path d="M98,120 C100,106 98,94 92,88 C88,84 82,84 78,88 C74,92 73,106 74,120Z" fill={color} opacity="0.62"/>
      {/* Griffes patte droite */}
      <ellipse cx="89" cy="118" rx="4" ry="2.5" fill={color} opacity="0.50"/>
      <ellipse cx="83" cy="119" rx="3.5" ry="2" fill={color} opacity="0.50"/>

      {/* Marque de lumière — phare intérieur sur la poitrine */}
      <ellipse cx="60" cy="80" rx="16" ry="14" fill="white" opacity="0.08"/>
    </svg>
  )
})

const DeerSpirit = React.memo(function DeerSpirit({ size = 120, color = '#14b8a6', style: s }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={s}>
      {/* Aura — halo lointain, présence millénaire */}
      <ellipse cx="58" cy="72" rx="32" ry="46" fill={color} opacity="0.04" />
      <ellipse cx="58" cy="60" rx="20" ry="32" fill={color} opacity="0.05" />

      {/* Corps 3/4 gauche — couche de fond (flanc, ombre) */}
      <path d="M44,112 C42,94 42,76 46,62 C49,53 56,50 63,52 C70,54 74,62 76,76 C78,90 77,104 75,112Z" fill={color} opacity="0.22" />
      {/* Corps — masse principale */}
      <path d="M46,112 C44,95 44,77 48,63 C51,54 57,51 63,53 C69,55 73,63 74,77 C76,91 75,105 73,112Z" fill={color} opacity="0.55" />
      {/* Corps — face avant plus lumineuse (3/4) */}
      <path d="M48,112 C47,97 47,80 50,66 C52,57 57,53 62,55 C67,57 70,65 71,78 C72,91 71,106 70,112Z" fill={color} opacity="0.82" />
      {/* Ventre — arrondi doux */}
      <path d="M55,110 C54,97 55,83 57,70 C58,64 61,63 63,68 C65,78 66,94 65,110Z" fill={color} opacity="0.18" />

      {/* Épaule — suggérée, légère */}
      <path d="M46,68 C44,63 46,58 50,56 C53,55 56,57 57,62" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.38" />

      {/* Highlight épaule — lumière sculptée */}
      <path d="M49,70 C48,64 50,59 53,57 C55,56 57,58 57,62" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.10" />

      {/* Encolure — long, coulant */}
      <path d="M54,63 C52,50 53,38 56,28 C58,22 61,20 63,24 C65,30 65,44 64,63Z" fill={color} opacity="0.78" />
      {/* Encolure highlight — côté lumineux */}
      <path d="M57,61 C56,50 57,39 59,30 C60,26 62,25 63,28 C64,33 64,46 63,61Z" fill={color} opacity="0.22" />

      {/* Tête — petite, noble, légèrement tournée */}
      <ellipse cx="59" cy="18" rx="9.5" ry="11" fill={color} opacity="0.88" />
      {/* Tête — volume 3/4 */}
      <ellipse cx="58" cy="17" rx="7" ry="9" fill={color} opacity="0.20" />

      {/* Museau — pointu, élégant */}
      <path d="M53,25 C52,30 55,34 59,34 C63,34 66,30 65,25Z" fill={color} opacity="0.52" />
      {/* Truffe */}
      <ellipse cx="59" cy="33.5" rx="2.2" ry="1.4" fill={color} opacity="0.70" />

      {/* Oreille gauche */}
      <path d="M51,11 C48,5 50,1 53,3 C55,5 55,10 54,14Z" fill={color} opacity="0.62" />
      {/* Oreille droite */}
      <path d="M67,11 C70,5 68,1 65,3 C63,5 63,10 64,14Z" fill={color} opacity="0.46" />

      {/* BOIS GAUCHE — tige principale, majestueuse */}
      <path d="M53,10 C49,3 42,-3 33,-8" stroke={color} strokeWidth="5.0" strokeLinecap="round" fill="none" opacity="0.88"/>
      {/* Bois gauche — andouiller 1 (haut, vers l'extérieur) */}
      <path d="M44,0 C39,-5 32,-6 26,-4" stroke={color} strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.72"/>
      {/* Bois gauche — andouiller 2 (du milieu tige) */}
      <path d="M39,-3 C35,-8 31,-11 27,-14" stroke={color} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.56"/>
      {/* Bois gauche — andouiller 3 (vers intérieur) */}
      <path d="M35,-6 C31,-4 28,-1 25,2" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.40"/>
      {/* Bois gauche — pointe principale */}
      <path d="M33,-8 C29,-12 25,-14 21,-16" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.28"/>
      {/* Bois gauche — andouiller terminal */}
      <path d="M27,-14 C24,-18 22,-20 20,-22" stroke={color} strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.18"/>

      {/* BOIS DROIT — tige principale */}
      <path d="M65,10 C69,3 76,-3 85,-8" stroke={color} strokeWidth="5.0" strokeLinecap="round" fill="none" opacity="0.72"/>
      {/* Bois droit — andouiller 1 */}
      <path d="M74,0 C79,-5 86,-6 92,-4" stroke={color} strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.58"/>
      {/* Bois droit — andouiller 2 */}
      <path d="M79,-3 C83,-8 87,-11 91,-14" stroke={color} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.44"/>
      {/* Bois droit — andouiller 3 (vers intérieur) */}
      <path d="M83,-6 C87,-4 90,-1 93,2" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.30"/>
      {/* Bois droit — pointe principale */}
      <path d="M85,-8 C89,-12 93,-14 97,-16" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.22"/>
      {/* Bois droit — andouiller terminal */}
      <path d="M91,-14 C94,-18 96,-20 98,-22" stroke={color} strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.14"/>

      {/* Yeux — lumineux, doux, légèrement asymétriques (3/4) */}
      <ellipse cx="54" cy="15" rx="3.2" ry="3.8" fill="white" opacity="0.95"/>
      <ellipse cx="65" cy="15.5" rx="2.8" ry="3.2" fill="white" opacity="0.80"/>
      {/* Pupilles — profondes */}
      <ellipse cx="54.3" cy="15.4" rx="1.5" ry="1.9" fill={color} opacity="0.32"/>
      <ellipse cx="65.2" cy="15.8" rx="1.2" ry="1.5" fill={color} opacity="0.26"/>
      {/* Reflet oeil gauche */}
      <ellipse cx="53.2" cy="14.2" rx="0.7" ry="0.8" fill="white" opacity="0.72"/>

      {/* JAMBES — 4 visibles, effilées, avec genou suggéré */}
      {/* Jambe avant gauche */}
      <path d="M51,112 C51,116 50,118 50,121" stroke={color} strokeWidth="5.0" strokeLinecap="round" fill="none" opacity="0.58"/>
      <path d="M50,119 C49,120 49,121 49,122" stroke={color} strokeWidth="3.8" strokeLinecap="round" fill="none" opacity="0.44"/>
      {/* Jambe avant droite */}
      <path d="M58,113 C58,116 57,118 57,121" stroke={color} strokeWidth="3.8" strokeLinecap="round" fill="none" opacity="0.46"/>
      <path d="M57,119 C56,120 56,121 56,122" stroke={color} strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.34"/>
      {/* Jambe arrière gauche */}
      <path d="M65,113 C66,117 66,119 66,122" stroke={color} strokeWidth="3.8" strokeLinecap="round" fill="none" opacity="0.44"/>
      <path d="M66,119 C67,121 67,122 67,123" stroke={color} strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.32"/>
      {/* Jambe arrière droite */}
      <path d="M72,112 C73,116 73,118 73,121" stroke={color} strokeWidth="5.0" strokeLinecap="round" fill="none" opacity="0.56"/>
      <path d="M73,119 C74,121 74,122 74,123" stroke={color} strokeWidth="3.8" strokeLinecap="round" fill="none" opacity="0.42"/>

      {/* Queue — petite, relevée */}
      <path d="M74,80 C78,77 80,73 78,70" stroke={color} strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.38"/>
      <ellipse cx="78" cy="69" rx="3.5" ry="2.5" fill="white" opacity="0.18"/>
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

function NeyaLogo({ size = 'md', onTap, glowColor = 'rgba(255,255,255,0.32)' }) {
  const cfg = { sm: [20, 13], md: [28, 17], lg: [36, 22] }[size]
  const w = cfg[0], h = Math.round(cfg[0] * 1.28)
  return (
    <div onClick={onTap} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: onTap ? 'pointer' : 'default' }}>
      <svg width={w} height={h} viewBox="0 0 30 38" fill="none" style={{ animation: 'compassbreathe 7s cubic-bezier(0.45,0,0.55,1) infinite', filter: `drop-shadow(0 0 6px ${glowColor})${onTap ? ' drop-shadow(0 0 14px rgba(255,255,255,0.25))' : ''}` }}>
        {/* Leaf/tree crown */}
        <path d="M15 2 C8.5 3.5 4 9.5 4 16.5 C4 22.5 8.5 27.5 15 28.5 C21.5 27.5 26 22.5 26 16.5 C26 9.5 21.5 3.5 15 2Z" fill="white" opacity="0.90"/>
        {/* Central vein */}
        <line x1="15" y1="5.5" x2="15" y2="27" stroke="rgba(5,8,16,0.22)" strokeWidth="0.85" strokeLinecap="round"/>
        {/* Upper branches */}
        <path d="M15 11 L10 15" stroke="rgba(5,8,16,0.17)" strokeWidth="0.75" fill="none" strokeLinecap="round"/>
        <path d="M15 11 L20 15" stroke="rgba(5,8,16,0.17)" strokeWidth="0.75" fill="none" strokeLinecap="round"/>
        {/* Lower branches */}
        <path d="M15 17.5 L11 21.5" stroke="rgba(5,8,16,0.13)" strokeWidth="0.65" fill="none" strokeLinecap="round"/>
        <path d="M15 17.5 L19 21.5" stroke="rgba(5,8,16,0.13)" strokeWidth="0.65" fill="none" strokeLinecap="round"/>
        {/* Trunk */}
        <path d="M14.1 28.5 L14.1 36.5 Q14.1 38 15 38 Q15.9 38 15.9 36.5 L15.9 28.5Z" fill="white" opacity="0.82"/>
      </svg>
      <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: cfg[1], letterSpacing: '0.4em', color: 'white', textShadow: '0 0 20px rgba(255,255,255,0.3)', animation: 'phrasebreathe 55s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 22s ease-in-out 8s infinite' }}>NÉYA</span>
    </div>
  )
}

// ─── BG SCREEN ────────────────────────────────────────────────────────────────

function BgScreen({ bg, overlay = 'rgba(5,8,16,0.48)', breathe = false, breatheAnim = 'bgbreathe 26s cubic-bezier(0.45,0,0.55,1) infinite', bgPosition = 'center', children }) {
  return (
    <div style={{ width: '100vw', height: '100dvh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'absolute', top: '-2.5%', left: '-2.5%', right: '-2.5%', bottom: '-2.5%', backgroundImage: `url(${B}${bg})`, backgroundSize: 'cover', backgroundPosition: bgPosition, animation: breathe ? breatheAnim : 'none', transformOrigin: 'center center', willChange: breathe ? 'transform' : 'auto' }} />
      <div style={{ position: 'absolute', inset: 0, background: overlay }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to top, rgba(5,8,16,0.55) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 1 }} />
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
  const full = progress >= 1
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
      {full && <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="3.5" strokeOpacity="0.22"
        style={{ filter: `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 24px ${color})`, animation: 'worldglow 4s cubic-bezier(0.45,0,0.55,1) infinite' }} />}
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth={full ? '2.5' : '2.5'}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 ${full ? '8px' : '5px'} ${color})${full ? ` drop-shadow(0 0 16px ${color}66)` : ''}`, transition: 'stroke-dasharray 1.6s cubic-bezier(0.22,1,0.36,1)', animation: full ? 'worldglow 4s cubic-bezier(0.45,0,0.55,1) infinite' : 'none' }} />
    </svg>
  )
}

// ─── RETURNING ────────────────────────────────────────────────────────────────

function ReturningScreen({ archetypeKey, onDone }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 80)
    const t2 = setTimeout(() => { haptic(4); onDone() }, 1900)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  if (!arch) { onDone(); return null }

  const ARCH_WHISPERS = {
    resilience: ['Ton feu est intact.', 'La flamme n\'attend que toi.', 'Tu reviens en force.'],
    presence:   ['Ton espace t\'attendait.', 'L\'eau garde ta place.', 'Tu reviens à toi.'],
    sagesse:    ['Le silence t\'a gardé.', 'La brume t\'accueille.', 'Tu retrouves ta voix.'],
    lumiere:    ['Ta lumière revient.', 'Tu es encore là, présent·e.', 'La lumière t\'attendait.'],
  }
  const whisper = (() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0]
      const yesterStr = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const w = ARCH_WHISPERS[archetypeKey] || ['Tu es encore là.', 'Tu es revenu·e.', 'Tu es de retour.']
      if (localStorage.getItem(`neya_visited_${todayStr}`)) return w[0]
      if (localStorage.getItem(`neya_visited_${yesterStr}`)) return w[1]
      return w[2]
    } catch { return (ARCH_WHISPERS[archetypeKey] || ['Tu es encore là.'])[0] }
  })()

  return (
    <BgScreen bg={arch.bg} overlay="rgba(5,8,16,0.55)">
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        {[{x:10,y:20,r:1.6,dur:22,del:0},{x:88,y:14,r:1.2,dur:28,del:3.8},{x:22,y:76,r:2.0,dur:18,del:1.6},{x:82,y:72,r:1.4,dur:32,del:6.2},{x:50,y:88,r:1.8,dur:24,del:4.4},{x:68,y:10,r:1.4,dur:30,del:8.6}].map((m,i)=>(
          <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: 0.06, animation: `splashmote ${m.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
        ))}
      </svg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, position: 'relative', zIndex: 1 }}>
        {/* Spirit animal */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {vis && <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', border: `1px solid ${arch.color}22`, animation: 'pulsering 5.5s cubic-bezier(0.45,0,0.55,1) infinite 0.6s', pointerEvents: 'none' }} />}
          {vis && <div style={{ position: 'absolute', width: 210, height: 210, borderRadius: '50%', border: `1px solid ${arch.color}11`, animation: 'pulsering 7s cubic-bezier(0.45,0,0.55,1) infinite 1.8s', pointerEvents: 'none' }} />}
          <img
            src={`${B}spirit-${archetypeKey}.avif`}
            alt={arch.animal}
            style={{
              width: 130, height: 130,
              borderRadius: '50%',
              objectFit: 'cover',
              objectPosition: 'center 45%',
              display: 'block',
              opacity: vis ? 1 : 0,
              transition: 'opacity 0.7s ease',
              filter: `brightness(1.05) saturate(1.1) drop-shadow(0 0 24px ${arch.color}) drop-shadow(0 0 52px ${arch.color}55)`,
              animation: vis ? 'animalfloat 18s cubic-bezier(0.45,0,0.55,1) infinite, animalbreathe 28s cubic-bezier(0.45,0,0.55,1) infinite' : 'none',
            }}
          />
        </div>
        {/* Time-of-day greeting */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 300,
          fontSize: 10,
          color: `${arch.color}55`,
          letterSpacing: '0.18em',
          margin: 0,
          fontStyle: 'italic',
          opacity: vis ? 1 : 0,
          transition: 'opacity 1s ease 0.2s',
          animation: vis ? 'phrasebreathe 30s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 14s ease-in-out 4s infinite' : 'none',
        }}>
          {(() => { const h = new Date().getHours(); if (h >= 22 || h < 5) return 'cette nuit'; if (h < 9) return 'ce matin'; if (h < 18) return 'cet après-midi'; return 'ce soir' })()}
        </p>
        {/* Animal name */}
        <p style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 300,
          fontSize: 'clamp(16px,5vw,20px)',
          color: 'rgba(255,255,255,0.82)',
          letterSpacing: '0.08em',
          margin: 0,
          opacity: vis ? 1 : 0,
          transition: 'opacity 0.9s ease 0.4s',
          textShadow: `0 0 32px ${arch.shadow}`,
          animation: vis ? 'phrasebreathe 26s ease-in-out 0.8s infinite, milestoneGlow 8s ease-in-out 2s infinite' : 'none',
        }}>
          {arch.animal}
        </p>
        {/* Whisper return text */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 300,
          fontSize: 12,
          color: `${arch.color}88`,
          letterSpacing: '0.12em',
          margin: 0,
          fontStyle: 'italic',
          opacity: vis ? 1 : 0,
          transition: 'opacity 1.1s ease 0.8s',
          animation: vis ? 'phrasebreathe 30s ease-in-out 1.2s infinite, milestoneGlow 12s ease-in-out 3s infinite' : 'none',
          textShadow: vis ? `0 0 14px ${arch.color}44` : 'none',
        }}>
          {whisper}
        </p>
        {/* worldInsight ultra-faint */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 300,
          fontSize: 9.5,
          color: `${arch.color}33`,
          letterSpacing: '0.05em',
          margin: 0,
          fontStyle: 'italic',
          maxWidth: 240,
          textAlign: 'center',
          lineHeight: 1.7,
          opacity: vis ? 1 : 0,
          transition: 'opacity 1.4s ease 1.1s',
          animation: vis ? 'phrasebreathe 44s ease-in-out 2s infinite, milestoneGlow 10s ease-in-out 3s infinite' : 'none',
          textShadow: vis ? `0 0 18px ${arch.color}33` : 'none',
        }}>
          {arch.worldInsight}
        </p>
      </div>
    </BgScreen>
  )
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────

function SplashScreen({ onStart }) {
  const [vis, setVis] = useState(false)
  const [titleVis, setTitleVis] = useState(false)
  const [subVis, setSubVis] = useState(false)
  const [whisperVis, setWhisperVis] = useState(false)
  const [whisper2Vis, setWhisper2Vis] = useState(false)
  const [showBtn, setShowBtn] = useState(false)
  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 100)
    const t2 = setTimeout(() => setTitleVis(true), 500)
    const t3 = setTimeout(() => setSubVis(true), 1400)
    const t4 = setTimeout(() => setWhisperVis(true), 2000)
    const t5 = setTimeout(() => setShowBtn(true), 2800)
    const t6 = setTimeout(() => setWhisper2Vis(true), 3500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6) }
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
    <BgScreen bg="bg-splash.avif" overlay="rgba(5,8,16,0.45)" breathe breatheAnim="ob0breathe 42s cubic-bezier(0.45,0,0.55,1) infinite">
      {/* Ambient vertical light column */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: showBtn ? 240 : 180, height: '70%', background: showBtn ? 'linear-gradient(to bottom, rgba(99,102,241,0.10) 0%, rgba(99,102,241,0.04) 60%, transparent 100%)' : 'linear-gradient(to bottom, rgba(99,102,241,0.07) 0%, rgba(99,102,241,0.02) 60%, transparent 100%)', pointerEvents: 'none', zIndex: 2, animation: 'worldglow 34s cubic-bezier(0.45,0,0.55,1) infinite', transition: 'width 2s ease, background 2s ease' }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }}>
        {STARS.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill={s.fill || 'white'}
            style={{ animation: `startwinkle ${s.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${s.del}s` }} />
        ))}
        {SPLASH_MOTES.map((m, i) => (
          <circle key={`mote-${i}`} cx={`${m.x}%`} cy={`${m.y}%`} r={m.size}
            fill="rgba(99,102,241,1)"
            style={{ opacity: m.op, animation: `splashmote ${m.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
        ))}
      </svg>

      <div style={{ padding: '60px 28px 52px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', width: '100%', position: 'relative', zIndex: 3 }}>
        <div style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.8s ease', animation: showBtn ? 'milestoneGlow 10s ease-in-out 5s infinite' : 'none' }}>
          <NeyaLogo size="md" />
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '-60px -80px', background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 68%)', pointerEvents: 'none', zIndex: 0 }} />
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(30px, 8vw, 40px)', color: 'white', lineHeight: 1.25, margin: 0, textShadow: '0 2px 40px rgba(0,0,0,0.55), 0 0 80px rgba(99,102,241,0.18)', letterSpacing: '0.01em', opacity: titleVis ? 1 : 0, transition: 'opacity 1.6s ease', position: 'relative', zIndex: 1, animation: titleVis ? (showBtn ? 'phrasebreathe 26s ease-in-out 2s infinite, milestoneGlow 12s ease-in-out 5s infinite' : 'phrasebreathe 26s ease-in-out 2s infinite') : 'none' }}>
            Bienvenue dans<br />ton Grand Voyage...
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 17, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.68, opacity: subVis ? 1 : 0, transition: 'opacity 1.2s ease', position: 'relative', zIndex: 1, animation: subVis ? (showBtn ? 'phrasebreathe 34s ease-in-out 2s infinite, milestoneGlow 16s ease-in-out 6s infinite' : 'phrasebreathe 34s ease-in-out 2s infinite') : 'none', textShadow: '0 0 30px rgba(99,102,241,0.14)' }}>
            Le plus beau chemin<br />commence en toi.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.56)', margin: 0, letterSpacing: '0.02em', fontStyle: 'italic', opacity: whisperVis ? 1 : 0, transition: 'opacity 1.6s ease', position: 'relative', zIndex: 1, animation: whisperVis ? (showBtn ? 'phrasebreathe 38s ease-in-out 3s infinite, milestoneGlow 18s ease-in-out 5s infinite' : 'phrasebreathe 38s ease-in-out 3s infinite') : 'none', textShadow: '0 0 20px rgba(99,102,241,0.15)' }}>
            T'as pas besoin d'aller bien pour commencer.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 12, color: 'rgba(255,255,255,0.30)', margin: '8px 0 0', letterSpacing: '0.04em', fontStyle: 'italic', opacity: whisper2Vis ? 1 : 0, transition: 'opacity 2s ease', position: 'relative', zIndex: 1, animation: whisper2Vis ? (showBtn ? 'phrasebreathe 30s ease-in-out 4s infinite, seedPulse 5s ease-in-out 6s infinite, milestoneGlow 24s ease-in-out 10s infinite' : 'phrasebreathe 30s ease-in-out 4s infinite') : 'none', textShadow: whisper2Vis ? '0 0 12px rgba(99,102,241,0.18)' : 'none' }}>
            {(() => { const h = new Date().getHours(); if (h >= 22 || h < 5) return 'cette nuit, commence ici'; if (h < 9) return 'ce matin, commence ici'; if (h < 18) return 'cet après-midi, commence ici'; return 'ce soir, commence ici' })()}
          </p>
        </div>

        <button onClick={() => { haptic(20); onStart() }} style={{ width: '100%', padding: '17px 0', background: 'rgba(99,102,241,0.84)', border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 600, letterSpacing: '0.26em', color: 'white', textTransform: 'uppercase', pointerEvents: showBtn ? 'auto' : 'none', opacity: showBtn ? 1 : 0, transition: 'opacity 1.4s ease', animation: showBtn ? 'milestoneGlow 5s ease-in-out 1.6s infinite' : 'none', boxShadow: showBtn ? '0 6px 40px rgba(99,102,241,0.44)' : 'none', textShadow: showBtn ? '0 0 16px rgba(99,102,241,0.55)' : 'none' }}>
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
      <BgScreen bg="bg-onboarding.avif" overlay="rgba(10,6,2,0.46)" breathe breatheAnim="ob0breathe 42s cubic-bezier(0.45,0,0.55,1) infinite">
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
          {[{x:15,y:22,r:1.8,dur:19,del:0.0},{x:82,y:18,r:1.2,dur:24,del:2.8},{x:66,y:72,r:2.2,dur:17,del:1.5},{x:30,y:80,r:1.5,dur:21,del:4.1},{x:90,y:55,r:1.0,dur:26,del:0.8}].map((m,i)=>(
            <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill="rgba(245,158,11,1)" style={{ opacity: 0.06, animation: `splashmote ${m.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
          ))}
        </svg>
        <div onClick={goStep1} style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 32px', cursor: 'pointer', textAlign: 'center', gap: 22, opacity: vis ? 1 : 0, transition: 'opacity 0.7s ease' }}>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(27px, 7vw, 36px)', color: 'white', lineHeight: 1.3, margin: 0, textShadow: '0 2px 44px rgba(0,0,0,0.6), 0 0 60px rgba(245,158,11,0.12)', opacity: line1 ? 1 : 0, transition: 'opacity 1.5s ease', animation: line1 ? (line2 ? 'phrasebreathe 28s ease-in-out 2s infinite, milestoneGlow 12s ease-in-out 6s infinite' : 'phrasebreathe 28s ease-in-out 2s infinite') : 'none' }}>
            Ici commence<br />ton chemin...
          </h1>
          <div style={{ width: 1, height: 38, background: 'rgba(255,255,255,0.18)', transformOrigin: 'top', animation: line1 ? (line2 ? 'introlineappear 0.9s ease forwards, worldglow 12s ease-in-out 1.2s infinite, milestoneGlow 14s ease-in-out 4s infinite' : 'introlineappear 0.9s ease forwards, worldglow 12s ease-in-out 1.2s infinite') : 'none', opacity: line1 ? 1 : 0 }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 16, color: 'rgba(255,255,255,0.62)', lineHeight: 1.72, margin: 0, opacity: line2 ? 1 : 0, transition: 'opacity 1.3s ease', animation: line2 ? 'phrasebreathe 38s ease-in-out 1.5s infinite, milestoneGlow 16s ease-in-out 5s infinite' : 'none', textShadow: '0 0 28px rgba(245,158,11,0.10)' }}>
            vers plus de calme,<br />d'équilibre et de clarté intérieure.
          </p>
          <p style={{ position: 'absolute', bottom: '9%', fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.20)', letterSpacing: '0.26em', margin: 0, opacity: hintVis ? 1 : 0, transition: 'opacity 1.2s ease', animation: hintVis ? (line2 ? 'phrasebreathe 22s ease-in-out 1.5s infinite, milestoneGlow 12s ease-in-out 4s infinite' : 'phrasebreathe 22s ease-in-out 1.5s infinite') : 'none', textShadow: hintVis ? '0 0 14px rgba(255,255,255,0.18)' : 'none' }}>
            TOUCHER POUR CONTINUER
          </p>
        </div>
      </BgScreen>
    )
  }

  return (
    <BgScreen bg="bg-foret.avif" overlay="rgba(4,10,4,0.44)" breathe>
      {/* Motes forêt — magenta doux */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
        {[{x:14,y:74,size:2.5,dur:22,del:0},{x:78,y:62,size:3,dur:18,del:3.2},{x:54,y:84,size:2,dur:20,del:1.5},{x:36,y:68,size:3.5,dur:25,del:5.1},{x:88,y:78,size:2.2,dur:19,del:2.4}].map((m,i)=>(
          <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.size} fill="rgba(236,72,153,1)" style={{ opacity: 0.07, animation: `splashmote ${m.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
        ))}
      </svg>
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '72px 32px 52px', opacity: vis ? 1 : 0, transition: 'opacity 0.7s ease' }}>
        <div />
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 400, fontSize: 'clamp(23px, 6vw, 30px)', color: 'white', lineHeight: 1.3, margin: 0, textShadow: '0 2px 32px rgba(0,0,0,0.5), 0 0 60px rgba(236,72,153,0.14)', opacity: line1 ? 1 : 0, transition: 'opacity 1.5s ease', animation: line1 ? (line2 ? 'phrasebreathe 34s ease-in-out 2s infinite, milestoneGlow 12s ease-in-out 5s infinite' : 'phrasebreathe 34s ease-in-out 2s infinite') : 'none' }}>
            Ton monde intérieur<br />est vivant.
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.4em', margin: 0, opacity: line2 ? 1 : 0, transition: 'opacity 1.3s ease', animation: line2 ? 'seedPulse 3.5s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 8s ease-in-out 2s infinite' : 'none', textShadow: line2 ? '0 0 10px rgba(236,72,153,0.44)' : 'none' }}>
            ◈
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.78, margin: 0, opacity: line2 ? 1 : 0, transition: 'opacity 1.3s ease', animation: line2 ? 'phrasebreathe 32s ease-in-out 1s infinite, milestoneGlow 14s ease-in-out 6s infinite' : 'none', textShadow: line2 ? '0 0 24px rgba(236,72,153,0.14)' : 'none' }}>
            À chaque pas, tu t'ouvres<br />un peu plus à toi-même.<br /><br />Continue d'avancer à ton rythme...
          </p>
        </div>
        <button onClick={() => { haptic(20); onStart() }} style={{ width: '100%', padding: '17px 0', background: 'rgba(236,72,153,0.80)', border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 600, letterSpacing: '0.26em', color: 'white', textTransform: 'uppercase', opacity: line2 ? 1 : 0, transition: 'opacity 1s ease 0.5s', boxShadow: line2 ? '0 6px 36px rgba(236,72,153,0.42)' : 'none', animation: line2 ? 'milestoneGlow 5s ease-in-out 2s infinite' : 'none', textShadow: line2 ? '0 0 14px rgba(236,72,153,0.5)' : 'none' }}>
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
    <BgScreen bg="bg-cosmos.avif" overlay="rgba(5,8,16,0.74)" breathe>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }}>
        {STARS.slice(0, 8).map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r * 0.7} fill={s.fill || 'white'} style={{ animation: `startwinkle ${s.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${s.del}s` }} />
        ))}
      </svg>
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '72px 28px 52px', opacity: vis ? 1 : 0, transition: 'opacity 0.7s ease' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {showBtn && <div style={{ position: 'absolute', width: 130, height: 130, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.08)', animation: 'pulsering 8s cubic-bezier(0.45,0,0.55,1) infinite 3.2s', opacity: 0 }} />}
            <div style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.12)', animation: 'pulsering 6.5s cubic-bezier(0.45,0,0.55,1) infinite 1.8s' }} />
            <div style={{ position: 'absolute', width: 72, height: 72, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', animation: 'compassbreathe 7s cubic-bezier(0.45,0,0.55,1) infinite' }} />
            <div style={{ animation: showBtn ? 'compassbreathe 7s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 10s ease-in-out 4s infinite' : 'compassbreathe 7s cubic-bezier(0.45,0,0.55,1) infinite', display: 'flex', filter: showBtn ? 'drop-shadow(0 0 14px rgba(99,102,241,0.55)) drop-shadow(0 0 28px rgba(99,102,241,0.22))' : 'none', transition: 'filter 1.4s ease' }}>
              <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="21" stroke="rgba(255,255,255,0.50)" strokeWidth="1.5"/>
                <path d="M24 6v4M24 38v4M6 24h4M38 24h4" stroke="rgba(255,255,255,0.38)" strokeWidth="1.5" strokeLinecap="round"/>
                <polygon points="24,9 26.4,21.2 24,25 21.6,21.2" fill="white" opacity="0.90"/>
                <polygon points="24,39 21.6,26.8 24,23 26.4,26.8" fill="rgba(255,255,255,0.30)"/>
                <circle cx="24" cy="24" r="2.8" fill="white" opacity="0.88"/>
              </svg>
            </div>
          </div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(22px, 5.5vw, 28px)', color: 'white', lineHeight: 1.32, margin: 0, animation: vis ? (showBtn ? 'phrasebreathe 38s ease-in-out 1s infinite, milestoneGlow 12s ease-in-out 5s infinite' : 'phrasebreathe 38s ease-in-out 1s infinite') : 'none', textShadow: '0 2px 32px rgba(0,0,0,0.5), 0 0 60px rgba(99,102,241,0.14)' }}>
            Prêt·e pour ton<br />exploration intérieure ?
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: showBtn ? 'rgba(255,255,255,0.36)' : 'rgba(255,255,255,0.22)', letterSpacing: '0.2em', margin: 0, textTransform: 'uppercase', animation: showBtn ? 'phrasebreathe 18s cubic-bezier(0.45,0,0.55,1) infinite, seedPulse 4s ease-in-out 1s infinite, milestoneGlow 8s ease-in-out 3s infinite' : 'phrasebreathe 24s cubic-bezier(0.45,0,0.55,1) infinite', transition: 'color 1.2s ease, text-shadow 1.2s ease', textShadow: showBtn ? '0 0 10px rgba(99,102,241,0.33)' : 'none' }}>~5 minutes · {QUESTIONS.length} questions</p>
          <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 1, margin: '4px auto 0', opacity: item1 ? 1 : 0, transition: 'opacity 1.4s ease', animation: item1 ? (showBtn ? 'worldglow 10s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 12s ease-in-out 4s infinite' : 'worldglow 10s cubic-bezier(0.45,0,0.55,1) infinite') : 'none' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', opacity: item1 ? 1 : 0, transform: item1 ? 'translateY(0)' : 'translateY(14px)', transition: 'opacity 0.9s ease, transform 0.9s ease' }}>
            <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 11, background: showBtn ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.11)', border: `1px solid ${showBtn ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.22)'}`, borderRadius: 7, padding: '4px 9px', color: showBtn ? 'rgba(180,180,255,0.88)' : 'rgba(255,255,255,0.72)', flexShrink: 0, marginTop: 3, letterSpacing: '0.04em', boxShadow: showBtn ? '0 0 16px rgba(99,102,241,0.38)' : '0 0 12px rgba(99,102,241,0.22)', animation: showBtn ? 'milestoneGlow 4.5s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 26s cubic-bezier(0.45,0,0.55,1) infinite', transition: 'all 0.8s ease' }}>{QUESTIONS.length}</span>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14.5, color: 'rgba(255,255,255,0.72)', margin: 0, lineHeight: 1.65, animation: item1 ? (showBtn ? 'phrasebreathe 32s ease-in-out 1s infinite, milestoneGlow 12s ease-in-out 3s infinite' : 'phrasebreathe 32s ease-in-out 1s infinite') : 'none', textShadow: showBtn ? '0 0 18px rgba(99,102,241,0.22)' : 'none' }}>
              Questions conçues pour révéler ton chemin intérieur unique.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', opacity: item2 ? 1 : 0, transform: item2 ? 'translateY(0)' : 'translateY(14px)', transition: 'opacity 0.9s ease, transform 0.9s ease' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2, filter: showBtn ? 'drop-shadow(0 0 6px rgba(255,255,255,0.28))' : 'none', transition: 'filter 1s ease', animation: showBtn ? 'animalbreathe 8s cubic-bezier(0.45,0,0.55,1) infinite' : 'none' }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14.5, color: 'rgba(255,255,255,0.72)', margin: 0, lineHeight: 1.65, animation: item2 ? (showBtn ? 'phrasebreathe 36s ease-in-out 2s infinite, milestoneGlow 14s ease-in-out 4s infinite' : 'phrasebreathe 36s ease-in-out 2s infinite') : 'none', textShadow: showBtn ? '0 0 18px rgba(99,102,241,0.20)' : 'none' }}>
              Pas de bonne ou de mauvaise réponse — réponds avec ce qui résonne en toi.
            </p>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13, color: 'rgba(255,255,255,0.36)', textAlign: 'center', lineHeight: 1.72, margin: '4px 0 0', opacity: foot ? 1 : 0, transition: 'opacity 1s ease', animation: foot ? (showBtn ? 'phrasebreathe 26s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 16s ease-in-out 4s infinite' : 'phrasebreathe 26s cubic-bezier(0.45,0,0.55,1) infinite') : 'none', textShadow: '0 0 10px rgba(99,102,241,0.12)' }}>
            Chaque réponse t'aidera à mieux te connaître<br />et à révéler ton chemin intérieur.
          </p>
        </div>

        <button onClick={() => { haptic([15, 40, 15]); onStart() }} style={{ width: '100%', padding: '17px 0', background: 'linear-gradient(135deg, rgba(225,168,40,0.92), rgba(200,140,25,0.88))', border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.22em', color: 'rgba(20,12,2,0.90)', textTransform: 'uppercase', boxShadow: showBtn ? '0 6px 36px rgba(225,168,40,0.46), 0 2px 12px rgba(0,0,0,0.3)' : 'none', pointerEvents: showBtn ? 'auto' : 'none', opacity: showBtn ? 1 : 0, transform: showBtn ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 1s ease, transform 0.3s ease', animation: showBtn ? 'milestoneGlow 4s ease-in-out 1.5s infinite' : 'none' }}>
          Commencer l'aventure
        </button>
      </div>
    </BgScreen>
  )
}

// ─── CHOICE ICON ─────────────────────────────────────────────────────────────

function ChoiceIcon({ type, active }) {
  const c = active ? (ARCHETYPES[type]?.color || 'rgba(255,255,255,0.92)') : 'rgba(255,255,255,0.42)'
  const s = { width: 16, height: 16, flexShrink: 0, display: 'block' }
  if (type === 'resilience') return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  if (type === 'presence')   return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/></svg>
  if (type === 'sagesse')    return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  if (type === 'lumiere')    return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
  return null
}

// ─── QUIZ ─────────────────────────────────────────────────────────────────────

function QuizScreen({ onComplete, onQuit }) {
  useEffect(() => { try { localStorage.setItem('neya_quiz_start', String(Date.now())) } catch {} }, [])
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
    'bg-cosmos.avif': 'rgba(99,102,241,0.06)',
    'bg-feu.avif':    'rgba(245,158,11,0.06)',
    'bg-eau.avif':    'rgba(20,184,166,0.05)',
    'bg-foret.avif':  'rgba(236,72,153,0.05)',
    'bg-brume.avif':  'rgba(120,100,200,0.05)',
    'bg-vide.avif':   'rgba(200,200,240,0.04)',
  }
  const WORLD_MOTES = {
    'bg-cosmos.avif': { color: '99,102,241', count: 5, op: 0.07 },
    'bg-feu.avif':    { color: '245,158,11', count: 4, op: 0.06 },
    'bg-eau.avif':    { color: '20,184,166', count: 4, op: 0.05 },
    'bg-foret.avif':  { color: '236,72,153', count: 4, op: 0.05 },
    'bg-brume.avif':  { color: '120,100,200', count: 5, op: 0.06 },
    'bg-vide.avif':   { color: '200,200,240', count: 3, op: 0.04 },
  }
  const worldMote = WORLD_MOTES[bgMain]

  const q = QUESTIONS[idx]
  const progress = (idx + (selected !== null ? 0.5 : 0)) / QUESTIONS.length

  // Dominant archetype from previous answers — builds ambient atmosphere
  const answerTally = {}
  answers.filter(Boolean).forEach(a => { answerTally[a] = (answerTally[a] || 0) + 1 })
  const dominantArch = Object.keys(answerTally).sort((a, b) => answerTally[b] - answerTally[a])[0]
  const dominantCount = dominantArch ? answerTally[dominantArch] : 0
  const dominantRgb = dominantArch ? ARCHETYPES[dominantArch].rgb : null

  // Déclenche le stagger d'entrée des choix dès que le contenu devient visible
  useEffect(() => {
    if (contentVis) {
      const t = setTimeout(() => setChoicesVis(true), 60)
      return () => clearTimeout(t)
    } else {
      setChoicesVis(false)
    }
  }, [contentVis])

  // Sliding-window preload: charge les 2 prochains fonds en arrière-plan
  useEffect(() => {
    for (let i = 1; i <= 2; i++) {
      const next = QUESTIONS[idx + i]
      if (next?.bg) { const img = new Image(); img.src = B + next.bg }
    }
  }, [idx])

  const handleQuit = () => {
    if (window.confirm('Quitter le quiz ? Tes réponses ne seront pas conservées.')) {
      haptic(8)
      if (onQuit) onQuit()
      else window.location.reload()
    }
  }

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
      <div style={{ position: 'absolute', top: '-2.5%', left: '-2.5%', right: '-2.5%', bottom: '-2.5%', backgroundImage: `url(${B}${bgMain})`, backgroundSize: 'cover', backgroundPosition: 'center', animation: `bgbreathe ${idx === QUESTIONS.length - 1 ? '14' : '32'}s cubic-bezier(0.45,0,0.55,1) infinite`, willChange: 'transform', transition: 'animation-duration 1.2s ease' }} />
      {bgFade && (
        <div style={{ position: 'absolute', top: '-2.5%', left: '-2.5%', right: '-2.5%', bottom: '-2.5%', backgroundImage: `url(${B}${bgFade})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: bgFadeOp, transition: 'opacity 0.8s ease', pointerEvents: 'none' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,16,0.38)' }} />
      {/* Bottom gradient to ensure choices are readable */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top, rgba(5,8,16,0.82) 0%, rgba(5,8,16,0.30) 60%, transparent 100%)', pointerEvents: 'none', zIndex: 1 }} />
      <GrainFilter />
      <div style={{ position: 'absolute', inset: 0, background: q.tint || WORLD_TINTS[q.bg] || 'transparent', transition: 'background 0.6s ease', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: selected ? (idx === QUESTIONS.length - 1 ? `rgba(${ARCHETYPES[selected]?.rgb || '99,102,241'},0.16)` : ARCHETYPE_TINTS[selected]) : 'transparent',
        transition: 'background 0.5s ease',
        pointerEvents: 'none',
        zIndex: 2,
      }} />
      {/* Ambient archetype glow — grows as user's profile emerges */}
      {dominantRgb && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 50% 105%, rgba(${dominantRgb},${Math.min(0.13, dominantCount * 0.028)}) 0%, transparent 62%)`,
          transition: 'background 1.4s ease',
          pointerEvents: 'none', zIndex: 3,
        }} />
      )}

      {worldMote && (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 4 }}>
          {Array.from({ length: worldMote.count }, (_, mi) => {
            const motePosX = [8, 26, 52, 74, 90][mi] ?? (10 + mi * 18)
            const motePosY = [14, 32, 8, 22, 18][mi] ?? (10 + mi * 8)
            const moteDur = 16 + mi * 3.5
            const moteDel = mi * 2.8
            return (
              <circle key={mi} cx={`${motePosX}%`} cy={`${motePosY}%`} r={2.2 + (mi % 2) * 0.8}
                fill={`rgba(${worldMote.color},1)`}
                style={{ opacity: worldMote.op, animation: `splashmote ${moteDur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${moteDel}s` }} />
            )
          })}
        </svg>
      )}

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.07)', zIndex: 10 }}>
        <div style={{ height: '100%', background: `linear-gradient(90deg, ${(WORLD_TINTS[q.bg] || 'rgba(99,102,241,0.7)').replace(/[\d.]+\)$/, '0.85)')}, rgba(255,255,255,0.55))`, filter: 'blur(0.4px)', width: `${progress * 100}%`, transition: 'width 0.5s ease, background 0.6s ease', boxShadow: progress >= 0.95 && selected ? `0 0 12px rgba(255,255,255,0.7)` : 'none', animation: progress > 0 ? (selected !== null ? 'worldglow 8s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 12s ease-in-out 3s infinite' : 'worldglow 8s cubic-bezier(0.45,0,0.55,1) infinite') : 'none' }} />
      </div>

      {/* NeyaGirl silhouette — ambient presence during quiz */}
      <div style={{ position: 'absolute', bottom: '27%', left: '50%', transform: 'translateX(-50%)', opacity: 0.15, zIndex: 5, pointerEvents: 'none', transition: 'opacity 1.2s ease', animation: 'animalfloat 20s cubic-bezier(0.45,0,0.55,1) infinite' }}>
        <NeyaGirl size={88} color="#5b9cf6" />
      </div>

      <div style={{ position: 'relative', zIndex: 6, padding: '46px 22px 32px', display: 'flex', flexDirection: 'column', height: '100%', width: '100%', opacity: contentVis ? 1 : 0, transition: 'opacity 0.32s ease' }}>
        {/* Logo top */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 14 }}>
          <NeyaLogo size="sm" glowColor={dominantCount >= 3 ? `${ARCHETYPES[dominantArch]?.color}55` : 'rgba(255,255,255,0.28)'} />
        </div>

        {/* Quit button — discreet top-left */}
        <button data-press="true" onClick={handleQuit} aria-label="Quitter le quiz" style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', left: 18, background: 'rgba(5,8,16,0.42)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 100, width: 40, height: 40, color: 'rgba(255,255,255,0.72)', fontFamily: 'Inter, sans-serif', fontSize: 18, lineHeight: 1, cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>✕</button>

        {/* Progress counter */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 16, color: dominantCount >= 3 ? ARCHETYPES[dominantArch].color : 'rgba(255,255,255,0.60)', letterSpacing: '0.02em', animation: dominantCount >= 3 ? 'phrasebreathe 18s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 6s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 18s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: dominantCount >= 3 ? `0 0 14px ${ARCHETYPES[dominantArch].color}66` : 'none', transition: 'color 1.2s ease, text-shadow 1.2s ease' }}>{idx + 1}</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: dominantCount >= 3 ? `${ARCHETYPES[dominantArch].color}55` : 'rgba(255,255,255,0.40)', letterSpacing: '0.14em', margin: '0 6px', animation: (dominantCount >= 3 || selected !== null) ? 'phrasebreathe 12s cubic-bezier(0.45,0,0.55,1) infinite, seedPulse 2.8s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 6s ease-in-out 1s infinite' : 'phrasebreathe 12s cubic-bezier(0.45,0,0.55,1) infinite', transition: 'color 1.2s ease' }}>·</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.42)', letterSpacing: '0.08em', animation: selected !== null ? 'phrasebreathe 20s cubic-bezier(0.45,0,0.55,1) infinite, seedPulse 3.5s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 8s ease-in-out 2s infinite' : 'phrasebreathe 20s cubic-bezier(0.45,0,0.55,1) infinite' }}>{QUESTIONS.length}</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', gap: 10, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 'clamp(24px, 6vw, 30px)', color: 'white', margin: 0, lineHeight: 1.18, letterSpacing: '-0.01em', textShadow: `0 2px 24px rgba(0,0,0,0.55), 0 0 60px ${(WORLD_TINTS[bgMain] || 'rgba(99,102,241,0.06)').replace(/[\d.]+\)$/, '0.20)')}`, animation: contentVis ? (selected !== null ? 'questionEnter 0.38s ease both, phrasebreathe 34s ease-in-out 0.5s infinite, milestoneGlow 16s ease-in-out 0.5s infinite' : 'questionEnter 0.38s ease both, phrasebreathe 34s ease-in-out 0.5s infinite') : 'none' }}>{q.title}</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 15, color: 'rgba(255,255,255,0.68)', margin: 0, lineHeight: 1.65, padding: '0 6px', animation: contentVis ? (selected !== null ? 'questionEnter 0.42s ease 0.05s both, phrasebreathe 42s ease-in-out 1s infinite, milestoneGlow 18s ease-in-out 2s infinite' : 'questionEnter 0.42s ease 0.05s both, phrasebreathe 42s ease-in-out 1s infinite') : 'none', textShadow: '0 0 20px rgba(255,255,255,0.06)' }}>{q.text}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q.choices.map((c, i) => {
            const sel = selected === c.type
            return (
              <button key={i} onClick={() => { haptic(sel ? 6 : 12); setSelected(c.type); if (!sel) { setRippleIdx(i); setTimeout(() => setRippleIdx(null), 620) } }} style={{ position: 'relative', overflow: 'hidden', width: '100%', padding: '13px 16px', background: sel ? `rgba(${ARCHETYPES[c.type]?.rgb || '255,255,255'},0.22)` : 'rgba(6,18,34,0.78)', border: `1px solid ${sel ? (ARCHETYPES[c.type]?.color + 'cc' || 'rgba(255,255,255,0.32)') : 'rgba(255,255,255,0.11)'}`, borderRadius: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', transform: sel ? 'scale(1.014)' : (selected !== null && !sel ? 'scale(0.990)' : 'scale(1)'), boxShadow: sel ? `0 4px 28px rgba(${ARCHETYPES[c.type]?.rgb || '255,255,255'},0.18), inset 0 0 0 1px ${ARCHETYPES[c.type]?.color + '44' || 'rgba(255,255,255,0.18)'}` : '0 2px 12px rgba(0,0,0,0.3)', opacity: choicesVis ? (selected !== null && !sel ? 0.48 : 1) : 0, translate: choicesVis ? '0 0px' : '0 10px', transition: `background 0.22s ease, border-color 0.22s ease, transform 0.3s ease, box-shadow 0.22s ease, opacity 0.35s ease ${sel ? '0ms' : (i * 55) + 'ms'}, translate 0.45s ease ${i * 55}ms`, animation: sel ? 'milestoneGlow 5s ease-in-out 0.5s infinite' : 'none' }}>
                {rippleIdx === i && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: ARCHETYPES[c.type]?.color || 'rgba(255,255,255,0.4)', animation: 'choiceripple 0.6s ease-out forwards', boxShadow: `0 0 24px ${ARCHETYPES[c.type]?.color}99, 0 0 48px ${ARCHETYPES[c.type]?.color}44` }} />
                  </div>
                )}
                <span style={{ filter: sel ? `drop-shadow(0 0 6px ${ARCHETYPES[c.type]?.color || 'white'}88)` : 'none', transition: 'filter 0.3s ease', flexShrink: 0, display: 'flex' }}><ChoiceIcon type={c.type} active={sel} /></span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13.5, lineHeight: 1.48, color: sel ? (ARCHETYPES[c.type]?.color || 'rgba(255,255,255,0.96)') : 'rgba(255,255,255,0.80)', transition: 'color 0.22s ease, text-shadow 0.22s ease', textShadow: sel ? `0 0 12px ${ARCHETYPES[c.type]?.color}55` : 'none', animation: sel ? 'phrasebreathe 16s cubic-bezier(0.45,0,0.55,1) infinite' : (selected === null ? `phrasebreathe ${50 + i * 8}s ease-in-out ${i * 0.8}s infinite` : 'none') }}>{c.text}</span>
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 14, opacity: selected !== null ? 1 : 0, transition: 'opacity 0.4s ease', pointerEvents: selected !== null ? 'all' : 'none' }}>
          <button onClick={handleContinue} style={{ width: '100%', padding: '15px 0', background: selected ? `rgba(${ARCHETYPES[selected]?.rgb || '14,184,166'},0.90)` : 'rgba(14,100,115,0.80)', border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.26em', color: 'white', textTransform: 'uppercase', boxShadow: selected ? (idx === QUESTIONS.length - 1 ? `0 4px 32px rgba(${ARCHETYPES[selected]?.rgb || '14,184,166'},0.55), 0 0 60px rgba(${ARCHETYPES[selected]?.rgb || '14,184,166'},0.22)` : `0 4px 22px rgba(${ARCHETYPES[selected]?.rgb || '14,184,166'},0.40)`) : '0 4px 22px rgba(14,100,115,0.30)', transition: 'background 240ms cubic-bezier(0.4,0,0.2,1), box-shadow 360ms cubic-bezier(0,0,0.2,1), color 240ms cubic-bezier(0.4,0,0.2,1)', animation: selected ? (idx === QUESTIONS.length - 1 ? 'milestoneGlow 3s cubic-bezier(0.45,0,0.55,1) infinite' : 'milestoneGlow 5s cubic-bezier(0.45,0,0.55,1) infinite') : 'none', textShadow: selected ? `0 0 14px rgba(${ARCHETYPES[selected]?.rgb || '255,255,255'},0.35)` : 'none' }}>
            {idx === QUESTIONS.length - 1 ? 'Terminer' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── WORLD REVEAL BRIDGE ──────────────────────────────────────────────────────

function WorldRevealBridge({ onContinue }) {
  const [vis, setVis] = useState(false)
  const [showBtn, setShowBtn] = useState(false)
  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 380)
    const t2 = setTimeout(() => setShowBtn(true), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  return (
    <BgScreen bg="bg-foret.avif" overlay="rgba(2,5,14,0.74)" breathe>
      {/* Golden star at top */}
      <div style={{ position: 'absolute', top: '9%', left: '50%', transform: 'translateX(-50%)', zIndex: 3, opacity: vis ? 1 : 0, transition: 'opacity 1.6s ease' }}>
        <svg width={48} height={48} viewBox="0 0 48 48" fill="none" style={{ animation: 'seedPulse 3.2s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite', filter: 'drop-shadow(0 0 14px rgba(245,195,60,0.85)) drop-shadow(0 0 32px rgba(245,195,60,0.4))' }}>
          <path d="M24 4 L26.8 19 L42 24 L26.8 29 L24 44 L21.2 29 L6 24 L21.2 19Z" fill="rgba(248,200,70,0.96)"/>
        </svg>
      </div>
      {/* NeyaGirl with golden halo */}
      <div style={{ position: 'absolute', bottom: '22%', left: '50%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'animalfloat 20s cubic-bezier(0.45,0,0.55,1) infinite' }}>
        <div style={{ position: 'absolute', width: 190, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,195,60,0.30) 0%, rgba(245,195,60,0.10) 38%, transparent 68%)', animation: 'presencePulse 4.2s cubic-bezier(0.45,0,0.55,1) infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,195,60,0.10) 0%, transparent 60%)', animation: 'presencePulse 6s ease-in-out 1s infinite', pointerEvents: 'none' }} />
        <NeyaGirl size={96} color="#4a90d9" />
      </div>
      {/* Text block */}
      <div style={{ position: 'absolute', top: '18%', left: 0, right: 0, padding: '0 30px', textAlign: 'center', opacity: vis ? 1 : 0, transition: 'opacity 1.8s ease 0.2s', zIndex: 4 }}>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 'clamp(24px, 6.2vw, 30px)', color: 'white', margin: '0 0 18px', lineHeight: 1.22, textShadow: '0 2px 32px rgba(0,0,0,0.65), 0 0 80px rgba(245,195,60,0.15)', animation: vis ? 'phrasebreathe 28s ease-in-out 1s infinite' : 'none' }}>
          Un monde intérieur<br />vient de s'ouvrir en toi
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 15, color: 'rgba(255,255,255,0.62)', margin: 0, lineHeight: 1.72, animation: vis ? 'phrasebreathe 34s ease-in-out 2s infinite' : 'none' }}>
          Chaque réponse a révélé<br />une part précieuse de ta lumière.
        </p>
      </div>
      {/* CTA */}
      <div style={{ position: 'absolute', bottom: '8%', left: '28px', right: '28px', zIndex: 4, opacity: showBtn ? 1 : 0, transform: showBtn ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 1.1s ease, transform 0.9s ease' }}>
        <button onClick={() => { haptic([20, 50, 20]); onContinue() }} style={{ width: '100%', padding: '17px 0', background: 'linear-gradient(135deg, rgba(225,168,40,0.92), rgba(200,140,25,0.88))', border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 500, letterSpacing: '0.04em', color: 'rgba(20,12,2,0.92)', animation: showBtn ? 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite' : 'none', boxShadow: '0 6px 36px rgba(225,168,40,0.42), 0 2px 12px rgba(0,0,0,0.3)' }}>
          Es-tu prêt·e à rencontrer ton potentiel caché ?
        </button>
      </div>
    </BgScreen>
  )
}

// ─── TRANSITION ───────────────────────────────────────────────────────────────

function TransitionScreen({ archetypeKey, onReveal }) {
  const arch = archetypeKey ? ARCHETYPES[archetypeKey] : null
  const [vis, setVis] = useState(false)
  const [showBtn, setShowBtn] = useState(false)
  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 300)
    const t2 = setTimeout(() => setShowBtn(true), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  const transitionBg = { resilience: 'bg-feu.avif', presence: 'bg-eau.avif', sagesse: 'bg-brume.avif', lumiere: 'bg-foret.avif' }[archetypeKey] || 'bg-cosmos-alt.avif'
  return (
    <BgScreen bg={transitionBg} overlay="rgba(5,8,16,0.58)" breathe>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
        {STARS.slice(0, 10).map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r * 0.75} fill={s.fill || 'white'}
            style={{ animation: `startwinkle ${s.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${s.del + 0.6}s` }} />
        ))}
        {arch && [{x:9,y:24,r:2.0,dur:26,del:0},{x:88,y:18,r:1.6,dur:32,del:4.8},{x:24,y:78,r:2.4,dur:20,del:2.2},{x:76,y:72,r:1.8,dur:36,del:7.6},{x:52,y:90,r:2.2,dur:28,del:5.4}].map((m,i)=>(
          <circle key={`am${i}`} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: 0.05, animation: `splashmote ${m.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
        ))}
        {arch && [{x:14,y:8,r:3.2,dur:22,del:1.4},{x:82,y:34,r:2.8,dur:28,del:6.1},{x:37,y:55,r:4.1,dur:18,del:3.3},{x:61,y:14,r:2.5,dur:34,del:8.7},{x:7,y:67,r:3.8,dur:38,del:0.9},{x:91,y:81,r:2.6,dur:24,del:5.2},{x:48,y:42,r:4.4,dur:30,del:11.5},{x:26,y:92,r:3.0,dur:26,del:2.8}].map((p,i)=>(
          <circle key={`wp${i}`} cx={`${p.x}%`} cy={`${p.y}%`} r={p.r} fill={arch.color} style={{ opacity: 0.09, animation: `splashmote ${p.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${p.del}s` }} />
        ))}
      </svg>
      {arch && (
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 60%, ${arch.color}14 0%, transparent 60%)`, pointerEvents: 'none', zIndex: 1, animation: 'presencePulse 6s cubic-bezier(0.45,0,0.55,1) infinite' }} />
      )}
      <div style={{ padding: '60px 28px 52px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', width: '100%' }}>
        <NeyaLogo size="sm" />
        <div style={{ textAlign: 'center', opacity: vis ? 1 : 0, transition: 'opacity 1.6s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
          <div style={{ position: 'relative', width: 110, height: 110 }}>
            <div style={{ position: 'absolute', inset: -28, borderRadius: '50%', border: `1px solid ${arch ? arch.color + '33' : 'rgba(255,255,255,0.07)'}`, animation: 'pulsering 4.8s cubic-bezier(0.45,0,0.55,1) infinite 1.6s' }} />
            <div style={{ position: 'absolute', inset: -14, borderRadius: '50%', border: `1px solid ${arch ? arch.color + '55' : 'rgba(255,255,255,0.14)'}`, animation: 'pulsering 3.4s cubic-bezier(0.45,0,0.55,1) infinite' }} />
            <div style={{ width: 110, height: 110, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: `radial-gradient(circle, ${arch ? `rgba(${arch.rgb},0.20)` : 'rgba(99,102,241,0.18)'} 0%, transparent 68%)`, animation: 'presencePulse 3.2s cubic-bezier(0.45,0,0.55,1) infinite' }} />
              <SpiritAnimal archetype={archetypeKey || 'presence'} size={72} style={{ opacity: 0.78, animation: 'animalfloat 18s cubic-bezier(0.45,0,0.55,1) infinite, animalbreathe 22s cubic-bezier(0.45,0,0.55,1) infinite', position: 'relative' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: arch ? `${arch.color}55` : 'rgba(255,255,255,0.28)', letterSpacing: '0.28em', textTransform: 'uppercase', margin: 0, opacity: vis ? 1 : 0, transition: 'opacity 1.4s ease 0.2s, color 1.2s ease', animation: vis ? 'phrasebreathe 30s ease-in-out 1.5s infinite, milestoneGlow 12s ease-in-out 3s infinite' : 'none', textShadow: arch ? `0 0 10px ${arch.color}33` : 'none' }}>
              {QUESTIONS.length} questions · Tes réponses ont été entendues.
            </p>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(24px, 6vw, 30px)', color: 'white', margin: 0, lineHeight: 1.3, textShadow: arch ? `0 2px 32px rgba(0,0,0,0.5), 0 0 60px ${arch.color}18, 0 0 40px ${arch.color}33` : '0 2px 32px rgba(0,0,0,0.5), 0 0 60px rgba(99,102,241,0.1)', animation: vis ? (showBtn ? 'phrasebreathe 24s ease-in-out 2s infinite, milestoneGlow 10s ease-in-out 5s infinite' : 'phrasebreathe 24s ease-in-out 2s infinite') : 'none' }}>
              Ton guide intérieur<br />s'apprête à se révéler...
            </h1>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.14)', borderRadius: 1, margin: '0 auto', animation: showBtn ? 'worldglow 8s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 12s ease-in-out 3s infinite' : 'worldglow 8s cubic-bezier(0.45,0,0.55,1) infinite' }} />
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 15, color: showBtn ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.72, opacity: vis ? 1 : 0, transition: 'opacity 1.0s ease 0.4s, color 1.6s ease', animation: showBtn ? 'phrasebreathe 22s ease-in-out 1s infinite, milestoneGlow 8s ease-in-out 2s infinite' : vis ? 'phrasebreathe 28s ease-in-out 1s infinite' : 'none', textShadow: showBtn && arch ? `0 0 20px ${arch.color}22` : arch ? `0 0 12px ${arch.color}10` : 'none' }}>
              {{ resilience: <>Il porte ta flamme dans chaque épreuve.<br />Es-tu prêt·e à le rencontrer ?</>, presence: <>Il veille sur ton espace intérieur.<br />Es-tu prêt·e à le rencontrer ?</>, sagesse: <>Il habite le silence entre tes pensées.<br />Es-tu prêt·e à le rencontrer ?</>, lumiere: <>Il est l'écho de ta lumière unique.<br />Es-tu prêt·e à le rencontrer ?</> }[archetypeKey] || <>Ton guide intérieur t'attend.<br />Es-tu prêt·e à le rencontrer ?</>}
            </p>
          </div>
        </div>
        <button onClick={() => { haptic([30, 50, 20]); onReveal() }} style={{ width: '100%', padding: '17px 0', background: 'linear-gradient(135deg, rgba(225,168,40,0.90), rgba(200,140,25,0.86))', border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 13.5, fontWeight: 500, letterSpacing: '0.12em', color: 'rgba(20,12,2,0.90)', textTransform: 'uppercase', pointerEvents: showBtn ? 'auto' : 'none', opacity: showBtn ? 1 : 0, transform: showBtn ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 1.0s ease, transform 0.8s ease', animation: showBtn ? 'milestoneGlow 4s ease-in-out 1s infinite' : 'none', boxShadow: showBtn ? '0 6px 32px rgba(225,168,40,0.38), 0 2px 12px rgba(0,0,0,0.3)' : 'none' }}>
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
    { color: 'rgba(255,255,255,0.38)', delay: 0.84, dur: 2.40 },
    { color: arch.color + '88', delay: 1.10, dur: 2.68 },
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
          animation: 'presencePulse 2.6s cubic-bezier(0.45,0,0.55,1) infinite',
          zIndex: 6,
        }} />
      )}
      {/* Second outer glow ring on flash */}
      {step >= 4 && (
        <div style={{
          position: 'absolute',
          width: 360, height: 360,
          borderRadius: '50%',
          border: `1px solid ${arch.color}22`,
          animation: 'pulsering 3.2s cubic-bezier(0.45,0,0.55,1) infinite 0.8s',
          zIndex: 3,
          pointerEvents: 'none',
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

      {/* Ambient motes during reveal */}
      {step >= 3 && (
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 8 }}>
          {[{x:12,y:20,r:2.0,dur:22,del:0},{x:88,y:16,r:1.5,dur:28,del:2.4},{x:8,y:72,r:2.4,dur:18,del:1.6},{x:90,y:68,r:1.8,dur:32,del:5.2},{x:50,y:92,r:2.2,dur:24,del:3.8},{x:72,y:10,r:1.6,dur:26,del:7.1}].map((m,i)=>(
            <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: 0.07, animation: `splashmote ${m.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
          ))}
        </svg>
      )}

      {/* The animal */}
      {step >= 3 && (
        <div style={{ position: 'relative', zIndex: 10, animation: 'patronusAnimal 2.4s ease forwards' }}>
          {/* Inner aura */}
          <div style={{ position: 'absolute', inset: -28, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 65%)`, animation: 'presencePulse 2.8s cubic-bezier(0.45,0,0.55,1) infinite 0.6s' }} />
          <img
            src={`${B}spirit-${archetypeKey}.avif`}
            alt={arch.animal}
            style={{
              width: 220, height: 220,
              borderRadius: '50%',
              objectFit: 'cover',
              objectPosition: 'center 45%',
              display: 'block',
              filter: `brightness(1.05) saturate(1.1) drop-shadow(0 0 28px ${arch.color}) drop-shadow(0 0 55px rgba(255,255,255,0.5)) drop-shadow(0 0 90px ${arch.color}99)`,
              animation: 'animalfloat 18s cubic-bezier(0.45,0,0.55,1) infinite 2.5s, animalbreathe 22s cubic-bezier(0.45,0,0.55,1) infinite 2.5s',
              willChange: 'transform',
            }}
          />
        </div>
      )}

      {/* Text reveal */}
      {step >= 5 && (
        <div style={{ position: 'absolute', bottom: '27%', textAlign: 'center', zIndex: 12 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: arch.color, letterSpacing: '0.34em', textTransform: 'uppercase', margin: '0 0 12px', opacity: 0, animation: 'fadeIn 0.8s ease 0.4s both, phrasebreathe 22s ease-in-out 2s infinite, milestoneGlow 5s ease-in-out 2s infinite', textShadow: `0 0 14px ${arch.color}66` }}>
            {{ resilience: 'Ton animal de feu', presence: 'Ton animal de présence', sagesse: 'Ton animal de sagesse', lumiere: 'Ton animal de lumière' }[archetypeKey] || 'Ton animal guide'}
          </p>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(22px, 6vw, 28px)', color: 'white', margin: '0 0 7px', textShadow: `0 0 48px ${arch.shadow}, 0 0 24px rgba(255,255,255,0.4)`, opacity: 0, animation: 'fadeIn 1.0s ease 0.8s both, phrasebreathe 24s ease-in-out 2s infinite, milestoneGlow 6s ease-in-out 2.5s infinite' }}>
            {arch.animal}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13.5, color: `${arch.color}99`, margin: 0, fontStyle: 'italic', letterSpacing: '0.06em', opacity: 0, animation: 'fadeIn 1.0s ease 1.2s both, phrasebreathe 26s ease-in-out 3s infinite, milestoneGlow 10s ease-in-out 5s infinite', textShadow: `0 0 14px ${arch.color}44` }}>
            {arch.profil}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.24em', textTransform: 'uppercase', margin: '8px 0 0', opacity: 0, animation: 'fadeIn 1.0s ease 1.6s both, phrasebreathe 30s ease-in-out 3s infinite, milestoneGlow 14s ease-in-out 6s infinite', textShadow: `0 0 14px ${arch.color}44` }}>
            Élément · {arch.element}
          </p>
        </div>
      )}

      {/* CTA button */}
      {step >= 6 && (
        <button
          onClick={() => { haptic([20, 60, 20]); onDone() }}
          style={{ position: 'absolute', bottom: '9%', left: '7%', right: '7%', padding: '17px 0', background: `rgba(${arch.rgb},0.88)`, border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 600, letterSpacing: '0.22em', color: 'white', textTransform: 'uppercase', zIndex: 12, animation: `fadeIn 1.0s ease forwards, milestoneGlow 4.5s ease-in-out 1.2s infinite`, boxShadow: `0 6px 36px ${arch.color}66, 0 0 60px ${arch.color}33`, textShadow: `0 0 16px ${arch.color}44` }}
        >
          {{ resilience: 'Voir mon profil · feu', presence: 'Voir mon profil · présence', sagesse: 'Voir mon profil · sagesse', lumiere: 'Voir mon profil · lumière' }[archetypeKey] || 'Découvrir mon profil'}
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

  const resultBg = { resilience: 'bg-feu.avif', presence: 'bg-eau.avif', sagesse: 'bg-brume.avif', lumiere: 'bg-foret.avif' }[archetypeKey] || 'bg-cosmos.avif'

  // Phase 0 : révélation patronus plein écran
  if (phase === 0) {
    return (
      <BgScreen bg={resultBg} overlay="rgba(5,8,16,0.28)" breathe>
        <PatronusReveal arch={arch} archetypeKey={archetypeKey} onDone={() => {
          setPhaseVis(false)
          setTimeout(() => { setPhase(1); setPhaseVis(true) }, 300)
        }} />
      </BgScreen>
    )
  }

  return (
    <BgScreen bg={resultBg} overlay="rgba(5,8,16,0.60)" breathe>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 80%, rgba(${arch.rgb},0.10) 0%, transparent 55%)`, pointerEvents: 'none', zIndex: 1, animation: 'worldglow 8s cubic-bezier(0.45,0,0.55,1) infinite' }} />
      <div style={{ padding: '52px 28px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', width: '100%', overflowY: 'auto' }}>
        <NeyaLogo size="sm" />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%', textAlign: 'center', opacity: phaseVis ? 1 : 0, transform: phaseVis ? 'scale(1)' : 'scale(0.97)', transition: 'opacity 0.32s ease, transform 0.32s ease', flex: 1, justifyContent: 'center', paddingBlock: 20 }}>

          {phase === 1 && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative', marginBottom: 2 }}>
                  <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', background: `radial-gradient(circle, ${arch.color}18 0%, transparent 70%)`, animation: 'presencePulse 4s cubic-bezier(0.45,0,0.55,1) infinite' }} />
                  <img src={`${B}spirit-${archetypeKey}.avif`} alt={arch.animal} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 45%', display: 'block', opacity: 0.75, filter: `brightness(1.05) saturate(1.1) drop-shadow(0 0 14px ${arch.color}88)`, animation: 'animalfloat 18s cubic-bezier(0.45,0,0.55,1) infinite, animalbreathe 22s cubic-bezier(0.45,0,0.55,1) infinite', willChange: 'transform' }} />
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: `rgba(${arch.rgb},0.95)`, letterSpacing: '0.26em', textTransform: 'uppercase', margin: '0 0 4px', animation: 'phrasebreathe 24s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: '0 1px 8px rgba(0,0,0,0.55)' }}>Profil mental</p>
                <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 22, margin: 0, background: `linear-gradient(135deg, rgba(255,255,255,0.96), ${arch.color}cc)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: forcesShown === arch.forces.length ? 'milestoneGlow 5s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 32s cubic-bezier(0.45,0,0.55,1) infinite', transition: 'animation 0.4s ease' }}>{arch.profil}</h2>
                <div style={{ width: 32, height: 1, background: `${arch.color}55`, borderRadius: 1, margin: '4px auto 6px', animation: forcesShown === arch.forces.length ? 'worldglow 8s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 6s ease-in-out 2s infinite' : 'worldglow 8s cubic-bezier(0.45,0,0.55,1) infinite' }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.62)', letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0, animation: 'phrasebreathe 28s ease-in-out 1s infinite', textShadow: '0 1px 8px rgba(0,0,0,0.55)' }}>Tes forces naturelles</p>
              </div>
              <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
                {forcesShown === arch.forces.length && <div style={{ position: 'absolute', inset: '-16px -10px', borderRadius: 20, background: `radial-gradient(ellipse at center, ${arch.color}0c 0%, transparent 70%)`, animation: 'presencePulse 5s cubic-bezier(0.45,0,0.55,1) infinite', pointerEvents: 'none', zIndex: 0 }} />}
                {arch.forces.map((f, i) => (
                  <div key={i} style={{ background: forcesShown === arch.forces.length ? `linear-gradient(rgba(5,8,16,0.5), rgba(5,8,16,0.5)) padding-box, linear-gradient(135deg, ${arch.color}55, transparent 40%, ${arch.color}33) border-box` : `radial-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(${arch.rgb},0.04) 100%)`, border: forcesShown === arch.forces.length ? '1px solid transparent' : `1px solid ${arch.color}55`, borderRadius: 12, padding: '20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, animation: forcesShown > i ? `forcespring 0.5s ease forwards${forcesShown === arch.forces.length ? `, presencePulse ${5 + i * 1.2}s ease-in-out ${0.5 + i * 0.3}s infinite` : ''}` : 'none', animationDelay: forcesShown > i ? `${i * 120}ms` : '0ms', opacity: forcesShown > i ? 1 : 0, transition: 'background 0.6s ease, border-color 0.6s ease', boxShadow: forcesShown === arch.forces.length ? `0 4px 20px rgba(${arch.rgb},0.15), inset 0 1px 0 rgba(255,255,255,0.06)` : 'none' }}>
                    <span style={{ fontSize: 13, color: arch.color, textShadow: `0 0 10px ${arch.color}88`, animation: forcesShown > i ? (forcesShown === arch.forces.length ? `seedPulse ${2.8 + i * 0.4}s ease-in-out ${i * 0.3}s infinite, milestoneGlow 8s ease-in-out ${0.5 + i * 1.5}s infinite` : `seedPulse ${2.8 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`) : 'none' }}>◈</span>
                    <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 13.5, color: 'white', textAlign: 'center', lineHeight: 1.3, animation: forcesShown > i ? (forcesShown === arch.forces.length ? `phrasebreathe ${34 + i * 4}s ease-in-out ${i * 1.2}s infinite, milestoneGlow 10s ease-in-out ${1 + i * 2}s infinite` : `phrasebreathe ${34 + i * 4}s ease-in-out ${i * 1.2}s infinite`) : 'none' }}>{f}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {phase === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
              {/* Animal guide label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 2px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', width: 50, height: 50, borderRadius: '50%', border: `1px solid ${arch.color}22`, animation: 'pulsering 5s cubic-bezier(0.45,0,0.55,1) infinite 1.2s', pointerEvents: 'none' }} />
                  <img src={`${B}spirit-${archetypeKey}.avif`} alt={arch.animal} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 45%', display: 'block', opacity: 0.70, filter: `brightness(1.05) saturate(1.1) drop-shadow(0 0 12px ${arch.color}99) drop-shadow(0 0 24px ${arch.color}44)`, animation: 'animalfloat 20s cubic-bezier(0.45,0,0.55,1) infinite, animalbreathe 32s cubic-bezier(0.45,0,0.55,1) infinite', position: 'relative' }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: arch.color, letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 4px', opacity: 1, textShadow: '0 1px 8px rgba(0,0,0,0.55)', animation: 'phrasebreathe 22s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 7s ease-in-out 2s infinite', textShadow: `0 0 12px ${arch.color}44` }}>{{ resilience: 'Ton guide de feu', presence: 'Ton guide d\'ancrage', sagesse: 'Ton guide de sagesse', lumiere: 'Ton guide de lumière' }[archetypeKey] || 'Ton guide intérieur'}</p>
                  <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 15, color: 'white', margin: 0, animation: 'phrasebreathe 28s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 10s ease-in-out 4s infinite', textShadow: `0 0 14px ${arch.color}22` }}>{arch.animal}</p>
                </div>
              </div>

              {/* Description card */}
              <div style={{ position: 'relative', background: 'rgba(255,255,255,0.055)', border: `1px solid ${arch.color}44`, borderRadius: 16, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 18, boxShadow: `0 8px 32px rgba(${arch.rgb},0.12), inset 0 1px 0 rgba(255,255,255,0.04)`, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: '14%', bottom: '14%', width: 2.5, background: `linear-gradient(180deg, transparent, ${arch.color}99, transparent)`, borderRadius: '0 2px 2px 0', animation: 'worldglow 8s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 14s ease-in-out 3s infinite' }} />
                {arch.desc.split('\n\n').map((para, i) => (
                  <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: i === 0 ? 16 : 14, color: i === 0 ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.62)', margin: 0, lineHeight: 1.75, fontStyle: i === 0 ? 'italic' : 'normal', textShadow: i === 0 ? `0 1px 20px rgba(0,0,0,0.3), 0 0 40px ${arch.color}18` : `0 0 12px ${arch.color}0f`, animation: i === 0 ? 'phrasebreathe 36s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 12s ease-in-out 4s infinite' : 'phrasebreathe 40s ease-in-out 2s infinite' }}>
                    {i === 0 ? `"${para}"` : para}
                  </p>
                ))}
              </div>

              {/* Intention aperçu */}
              <div style={{ background: `rgba(${arch.rgb},0.07)`, border: `1px solid ${arch.color}33`, borderRadius: 12, padding: '16px 18px', animation: 'milestoneGlow 18s ease-in-out 4s infinite' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: arch.color, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 9px', opacity: 1, textShadow: '0 1px 8px rgba(0,0,0,0.55)', animation: 'phrasebreathe 22s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 8s ease-in-out 3s infinite', textShadow: `0 0 10px ${arch.color}44` }}>Ton intention du jour</p>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14.5, color: 'rgba(255,255,255,0.82)', margin: 0, lineHeight: 1.7, fontStyle: 'italic', animation: 'phrasebreathe 28s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 9s ease-in-out 3s infinite', textShadow: `0 0 20px ${arch.color}22` }}>"{getDailyIntention(archetypeKey)}"</p>
              </div>

              {/* World insight */}
              {arch.worldInsight && (
                <>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 1, animation: 'worldglow 14s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 10s ease-in-out 4s infinite' }} />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 12, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.06em', margin: '0 4px', lineHeight: 1.75, fontStyle: 'italic', textAlign: 'center', animation: 'phrasebreathe 20s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 9s ease-in-out 2s infinite', textShadow: `0 0 24px ${arch.color}55` }}>
                    {arch.worldInsight}
                  </p>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 1, animation: 'worldglow 14s ease-in-out 7s infinite, milestoneGlow 10s ease-in-out 11s infinite' }} />
                </>
              )}

              {/* Routines preview */}
              <div style={{ position: 'relative', background: 'rgba(255,255,255,0.04)', border: `1px solid ${arch.color}22`, borderRadius: 14, padding: '18px 18px 14px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden', animation: 'milestoneGlow 18s ease-in-out 5s infinite' }}>
                <div style={{ position: 'absolute', left: 0, top: '14%', bottom: '14%', width: 2.5, background: `linear-gradient(180deg, transparent, ${arch.color}77, transparent)`, borderRadius: '0 2px 2px 0', animation: 'worldglow 10s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 16s ease-in-out 4s infinite' }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: `${arch.color}88`, letterSpacing: '0.22em', textTransform: 'uppercase', margin: 0, animation: 'phrasebreathe 22s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 14s ease-in-out 4s infinite', textShadow: `0 0 10px ${arch.color}33` }}>{{ resilience: 'Tes 3 pratiques de feu', presence: 'Tes 3 pratiques d\'ancrage', sagesse: 'Tes 3 pratiques de sagesse', lumiere: 'Tes 3 pratiques lumineuses' }[archetypeKey] || 'Tes 3 pratiques quotidiennes'}</p>
                {arch.routines.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.4, animation: `phrasebreathe ${30 + i * 5}s ease-in-out ${i * 1.5}s infinite`, textShadow: `0 0 8px ${arch.color}18` }}>{r.title}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: `${arch.color}99`, whiteSpace: 'nowrap', flexShrink: 0, animation: `seedPulse ${3.2 + i * 0.6}s ease-in-out ${i * 0.8}s infinite, milestoneGlow ${12 + i * 3}s ease-in-out ${2 + i * 1.5}s infinite`, textShadow: `0 0 8px ${arch.color}44` }}>{r.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button data-press="true" onClick={nextPhase} style={{ width: '100%', padding: '17px 0', background: phase === 2 ? `linear-gradient(135deg, rgba(225,168,40,0.92), rgba(200,140,25,0.88))` : `rgba(${arch.rgb},0.88)`, border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 600, letterSpacing: '0.22em', color: phase === 2 ? 'rgba(20,12,2,0.90)' : 'white', textTransform: 'uppercase', boxShadow: phase === 2 ? `0 6px 32px rgba(225,168,40,0.42)` : (phase === 1 && forcesShown === arch.forces.length) ? `0 4px 36px rgba(${arch.rgb},0.50), 0 0 60px ${arch.color}22` : `0 4px 22px rgba(${arch.rgb},0.35)`, transition: 'background 240ms cubic-bezier(0.4,0,0.2,1), box-shadow 360ms cubic-bezier(0,0,0.2,1), color 240ms cubic-bezier(0.4,0,0.2,1)', animation: (phase === 1 && forcesShown === arch.forces.length) ? 'milestoneGlow 3.5s cubic-bezier(0.45,0,0.55,1) infinite' : 'milestoneGlow 5s cubic-bezier(0.45,0,0.55,1) infinite' }}>
          {phase === 1
            ? 'Continuer mon voyage'
            : phase === 2
              ? ({ resilience: 'Entrer dans mon feu', presence: 'Entrer en présence', sagesse: 'Entrer dans ma sagesse', lumiere: 'Entrer dans ma lumière' }[archetypeKey] || 'Entrer dans mon espace')
              : ''
          }
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

const PATIENCE_TEXTS = {
  resilience: ['Ta force n\'est pas dans la vitesse.', 'Le repos est aussi une forme de feu.', 'Même immobile, tu avances.'],
  presence:   ['L\'eau n\'est pas pressée. Toi non plus.', 'Être là suffit. Vraiment.', 'Tu n\'as rien à faire ici, juste être.'],
  sagesse:    ['Le silence est ta langue native.', 'Dans l\'immobilité, tout devient clair.', 'Ta brume te protège autant qu\'elle te révèle.'],
  lumiere:    ['Rester, c\'est déjà beaucoup.', 'Ta lumière n\'a pas besoin d\'agir pour exister.', 'Parfois la plus belle création, c\'est le silence.'],
}

const DEEP_TEXTS = {
  resilience: ['Quelque chose en toi sait déjà ce qu\'il doit faire.', 'Ta flamme brûle même quand tu ne la vois pas.', 'Tu as traversé plus difficile. Tu traverseras ceci aussi.'],
  presence:   ['Tu habites vraiment cet instant. C\'est rare.', 'Ton ancrage est réel. Il est là, sous tout.', 'Cette profondeur que tu sens — elle t\'appartient.'],
  sagesse:    ['Dans ce silence prolongé, quelque chose se clarifie.', 'Ce que tu perçois là est vrai. Fais confiance.', 'Ton intelligence intérieure parle. Écoute sans traduire.'],
  lumiere:    ['Ta lumière brille même quand tu ne la vois pas.', 'Quelque chose de neuf naît en toi en ce moment.', 'Tu es une source. Et les sources ne s\'épuisent pas.'],
}

const EVRAI_BG_PERIODS    = { resilience: 22, presence: 34, sagesse: 48, lumiere: 28 }
const EVRAI_GHOST_PERIODS = { resilience: 24, presence: 38, sagesse: 54, lumiere: 30 }

function EspaceVraiModal({ archetypeKey, onClose }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  const [showText, setShowText] = useState(false)
  const [showSecond, setShowSecond] = useState(false)
  const [showAccompany, setShowAccompany] = useState(false)
  const [showPatience, setShowPatience] = useState(false)
  const [showEncoreIci, setShowEncoreIci] = useState(false)
  const [showDeep, setShowDeep] = useState(false)
  const [typingDone, setTypingDone] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const longPressTimer = useRef(null)
  const longPressDetected = useRef(false)
  const sessionQualified = useRef(false)
  const intention = getDailyIntention(archetypeKey)
  const secondaryIntention = (() => {
    const pool = ARCHETYPES[archetypeKey]?.intentions || []
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    return pool[(dayOfYear + Math.ceil(pool.length / 2)) % pool.length]
  })()
  const bgPeriod    = EVRAI_BG_PERIODS[archetypeKey]    || 28
  const ghostPeriod = EVRAI_GHOST_PERIODS[archetypeKey] || 36
  const textVariantIdx = new Date().getDate() % 3

  const handlePointerDown = () => {
    longPressDetected.current = false
    longPressTimer.current = setTimeout(() => {
      longPressDetected.current = true
      haptic([2, 40, 2, 40, 2])
      setShowSummary(true)
      setTimeout(() => setShowSummary(false), 4000)
    }, 800)
  }
  const handlePointerUp = () => {
    clearTimeout(longPressTimer.current)
    // Reset après usage pour éviter modale bloquée en ouverture
    setTimeout(() => { longPressDetected.current = false }, 100)
  }
  // Le close se fait UNIQUEMENT via le bouton ✕ (tap-anywhere supprimé pour éviter fermeture accidentelle)
  // const handleClick supprimé — pas utilisé

  useEffect(() => {
    const t0 = setTimeout(() => haptic([3, 50, 3]), 800)
    const t1 = setTimeout(() => setVis(true), 30)
    const t2 = setTimeout(() => setShowText(true), 600)
    const t3 = setTimeout(() => setShowSecond(true), 6000)
    const t4 = setTimeout(() => setShowAccompany(true), 9500)
    const t5 = setTimeout(() => haptic([2, 80, 2]), 12000)
    const t6 = setTimeout(() => setShowPatience(true), 30000)
    const t7 = setTimeout(() => setShowEncoreIci(true), 18000)
    const t8 = setTimeout(() => { setShowDeep(true); haptic([1, 100, 1]) }, 90000)
    const tq = setTimeout(() => { sessionQualified.current = true }, 18000)
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); clearTimeout(t7); clearTimeout(t8); clearTimeout(tq) }
  }, [])

  return (
    <div onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} style={{ position: 'fixed', inset: 0, zIndex: 700, opacity: vis ? 1 : 0, transition: 'opacity 0.7s ease', overflow: 'hidden' }}>
      {showSummary && (() => {
        const routinesDoneToday = loadRoutines().filter(Boolean).length
        const quetesDoneNow = loadQuetes(archetypeKey).filter(Boolean).length
        const streak = getCurrentStreak()
        return (
          <div style={{ position: 'absolute', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,8,16,0.62)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', animation: 'fadeIn 0.5s ease both', pointerEvents: 'none' }}>
            <div style={{ background: `rgba(${arch.rgb},0.12)`, border: `1px solid ${arch.color}55`, borderRadius: 18, padding: '28px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 280, boxShadow: `0 0 32px rgba(${arch.rgb},0.18), 0 0 80px rgba(${arch.rgb},0.08)`, animation: 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: arch.color, letterSpacing: '0.3em', textTransform: 'uppercase', margin: 0, animation: 'phrasebreathe 18s cubic-bezier(0.45,0,0.55,1) infinite' }}>Ton avancée</p>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 20, color: 'white', margin: 0, animation: 'milestoneGlow 3s cubic-bezier(0.45,0,0.55,1) infinite' }}>{routinesDoneToday}/{arch.routines.length} routine{routinesDoneToday !== 1 ? 's' : ''}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14, color: quetesDoneNow > 0 ? `${arch.color}88` : `rgba(255,255,255,0.55)`, margin: 0, transition: 'color 0.5s ease', animation: 'phrasebreathe 20s cubic-bezier(0.45,0,0.55,1) infinite' }}>{quetesDoneNow}/{arch.quetes.length} quête{quetesDoneNow !== 1 ? 's' : ''} accomplie{quetesDoneNow !== 1 ? 's' : ''}</p>
              {streak >= 2 && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: arch.color, margin: 0, opacity: 0.9, animation: 'chipPop 480ms cubic-bezier(0.34,1.56,0.64,1) both, milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) 0.5s infinite', textShadow: `0 0 12px ${arch.color}66` }}>{streak} jours d'affilée ✦</p>}
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 13, color: `${arch.color}88`, margin: 0, fontStyle: 'italic', animation: 'phrasebreathe 22s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 5s ease-in-out 2s infinite', textShadow: `0 0 12px ${arch.color}33` }}>{arch.worldInsight}</p>
            </div>
          </div>
        )
      })()}
      {/* Close hint + button */}
      <button onClick={(e) => { e.stopPropagation(); haptic(6); if (sessionQualified.current) { addEvraiFragment(archetypeKey); try { trackEspaceVraiQualified(18); addSouvenir('first_espace_vrai') } catch {} } onClose() }} style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', right: 22, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, width: 40, height: 40, color: 'rgba(255,255,255,0.72)', fontFamily: 'Inter, sans-serif', fontSize: 18, lineHeight: 1, cursor: 'pointer', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} aria-label="Quitter l'espace">✕</button>
      <div style={{ position: 'absolute', top: '-2.5%', left: '-2.5%', right: '-2.5%', bottom: '-2.5%', backgroundImage: `url(${B}bg-vrai.avif)`, backgroundSize: 'cover', backgroundPosition: 'center', animation: `bgbreathe ${bgPeriod}s cubic-bezier(0.45,0,0.55,1) infinite` }} />
      {(() => { const vraiOverlay = `linear-gradient(to bottom, rgba(5,8,16,0.45) 0%, rgba(${arch.rgb},0.12) 50%, rgba(5,8,16,0.52) 100%)`; return <div style={{ position: 'absolute', inset: 0, background: vraiOverlay }} /> })()}
      {typingDone && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%', background: `linear-gradient(to top, rgba(${arch.rgb},0.08) 0%, transparent 100%)`, pointerEvents: 'none', zIndex: 2, animation: 'fadeIn 3s ease forwards, worldglow 16s ease-in-out 4s infinite' }} />}
      <GrainFilter />
      {/* Halo de présence — chaleur colorée très subtile derrière le contenu central */}
      {(() => {
        const haloSize = { resilience: 320, presence: 260, sagesse: 300, lumiere: 280 }[archetypeKey] || 280
        const haloOp = { resilience: '0e', presence: '09', sagesse: '0b', lumiere: '0a' }[archetypeKey] || '0a'
        return <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: haloSize, height: haloSize, borderRadius: '50%', background: `radial-gradient(circle, ${arch.color}${haloOp} 0%, transparent 65%)`, animation: typingDone ? 'presencePulse 5.8s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 10s ease-in-out 3s infinite' : 'presencePulse 5.8s cubic-bezier(0.45,0,0.55,1) infinite', pointerEvents: 'none' }} />
      })()}
      {/* Per-archetype ambient motes */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
        {[{x:8,y:18,r:2.2,dur:32,del:0},{x:88,y:12,r:1.8,dur:38,del:5.2},{x:22,y:76,r:2.8,dur:28,del:2.1},{x:74,y:68,r:2.0,dur:42,del:8.4},{x:48,y:88,r:1.6,dur:36,del:3.7},{x:91,y:44,r:2.4,dur:26,del:6.6},{x:14,y:54,r:1.4,dur:44,del:1.8},{x:62,y:22,r:1.8,dur:34,del:11.3}].map((m,i) => (
          <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: 0.06, animation: `splashmote ${m.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
        ))}
      </svg>
      {/* World-specific atmospheric effects */}
      {archetypeKey === 'resilience' && (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
          {[{x:28,dx:-6,dur:7.2,del:0,r:2.2},{x:42,dx:4,dur:9.1,del:1.4,r:1.6},{x:55,dx:-3,dur:6.4,del:2.8,r:2.8},{x:65,dx:7,dur:8.3,del:0.7,r:1.8},{x:72,dx:-5,dur:7.8,del:3.5,r:2.0},{x:38,dx:3,dur:10.2,del:1.9,r:1.4},{x:60,dx:-8,dur:6.9,del:4.2,r:2.4},{x:48,dx:5,dur:8.7,del:0.3,r:1.6},{x:78,dx:-4,dur:7.5,del:2.1,r:2.0},{x:32,dx:6,dur:9.4,del:3.8,r:1.8},{x:18,dx:5,dur:8.0,del:5.1,r:2.6},{x:85,dx:-6,dur:7.6,del:6.3,r:1.4}].map((e,i) => (
            <circle key={i} cx={`${e.x}%`} cy="95%" r={e.r} fill={`rgba(245,158,11,1)`}
              style={{ opacity: 0, animation: `emberRise ${e.dur}s ease-out infinite`, animationDelay: `${e.del}s` }} />
          ))}
        </svg>
      )}
      {archetypeKey === 'presence' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {[{dur:6,del:0,size:80},{dur:9,del:2,size:140},{dur:12,del:4,size:200},{dur:15,del:6,size:260},{dur:18,del:8,size:320},{dur:21,del:10,size:380}].map((r,i) => (
            <div key={i} style={{ position: 'absolute', width: r.size, height: r.size, borderRadius: '50%', border: `1px solid rgba(20,184,166,0.72)`, animation: `waterRing ${r.dur}s ease-out infinite`, animationDelay: `${r.del}s` }} />
          ))}
        </div>
      )}
      {archetypeKey === 'sagesse' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}>
          {[{y:'18%',h:60,dur:22,del:0},{y:'36%',h:48,dur:28,del:5},{y:'54%',h:72,dur:19,del:11},{y:'68%',h:44,dur:24,del:7},{y:'80%',h:56,dur:31,del:3},{y:'28%',h:52,dur:25,del:14},{y:'62%',h:40,dur:20,del:9}].map((m,i) => (
            <div key={i} style={{ position: 'absolute', left: '-10%', right: '-10%', top: m.y, height: m.h, background: `linear-gradient(90deg, transparent, rgba(99,102,241,0.18), rgba(99,102,241,0.10), rgba(139,92,246,0.13), transparent)`, borderRadius: 60, animation: `mistDrift ${m.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
          ))}
        </div>
      )}
      {archetypeKey === 'lumiere' && (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
          {[{x:35,w:18,dur:14,del:0},{x:45,w:12,dur:18,del:3},{x:55,w:22,dur:16,del:6},{x:63,w:14,dur:20,del:1.5},{x:72,w:10,dur:12,del:8},{x:28,w:8,dur:22,del:4},{x:50,w:16,dur:15,del:10},{x:40,w:10,dur:19,del:13}].map((r,i) => (
            <path key={i} d={`M${r.x}%,0 L${r.x - r.w/2}%,100% L${r.x + r.w/2}%,100% Z`}
              fill={`rgba(236,72,153,1)`} style={{ opacity: 0, animation: `godRay ${r.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${r.del}s` }} />
          ))}
        </svg>
      )}
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', gap: 24, textAlign: 'center' }}>

        <div style={{ width: 1, height: 32, background: `linear-gradient(180deg, transparent, ${arch.color}44, transparent)`, borderRadius: 1, margin: '0 auto', animation: typingDone ? 'worldglow 6s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 8s ease-in-out 2s infinite' : 'worldglow 6s cubic-bezier(0.45,0,0.55,1) infinite' }} />

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: arch.color, letterSpacing: '0.3em', textTransform: 'uppercase', margin: 0, opacity: showText ? 1 : 0, transition: 'opacity 0.9s ease, text-shadow 1.5s ease', textShadow: typingDone ? `0 0 24px ${arch.color}77, 0 0 52px ${arch.color}33` : `0 0 20px ${arch.color}44, 0 0 44px ${arch.color}22`, animation: typingDone ? 'milestoneGlow 4.2s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 18s cubic-bezier(0.45,0,0.55,1) infinite' }}>
          {{ resilience: 'Espace de feu', presence: 'Espace de présence', sagesse: 'Espace de silence', lumiere: 'Espace de lumière' }[archetypeKey] || 'Espace de présence'}
        </p>
        <div style={{ position: 'relative', fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 'clamp(17px, 4.5vw, 22px)', color: 'rgba(255,255,255,0.9)', lineHeight: 1.72, fontStyle: 'italic', opacity: showText ? 1 : 0, transition: 'opacity 0.9s ease 0.2s', maxWidth: 340, animation: typingDone ? 'phrasebreathe 22s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 12s ease-in-out 2s infinite' : 'none' }}>
          {showText && <TypingText text={`"${intention}"`} delay={100} speed={44} onDone={() => setTypingDone(true)} cursorColor={arch.color} />}
          {typingDone && [0,1,2,3].map(j => (
            <div key={j} style={{ position: 'absolute', bottom: '100%', left: `${22 + j * 18}%`, width: 4, height: 4, borderRadius: '50%', background: arch.color, animation: `milestoneMote ${1.1 + j * 0.22}s ease-out ${j * 0.12}s both`, pointerEvents: 'none', boxShadow: `0 0 6px ${arch.color}bb` }} />
          ))}
        </div>
        <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 15, fontStyle: 'italic', color: 'white', margin: 0, letterSpacing: '0.06em', textShadow: typingDone ? `0 0 28px ${arch.color}44` : `0 0 20px ${arch.color}2a`, transition: 'text-shadow 2.5s ease', animation: showText ? (typingDone ? 'fadeIn 1.5s ease 3s both, solbreathe 22s cubic-bezier(0.45,0,0.55,1) infinite 4.5s, milestoneGlow 10s ease-in-out 8s infinite' : 'fadeIn 1.5s ease 3s both, solbreathe 22s cubic-bezier(0.45,0,0.55,1) infinite 4.5s') : 'none' }}>
          Tu n'es pas seul·e.
        </p>
        {showSecond && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 11.5, color: `${arch.color}66`, letterSpacing: '0.10em', margin: 0, fontStyle: 'italic', animation: typingDone ? 'fadeIn 1.8s ease forwards, phrasebreathe 22s ease-in-out 2s infinite, milestoneGlow 12s ease-in-out 4s infinite' : 'fadeIn 1.8s ease forwards, phrasebreathe 22s ease-in-out 2s infinite', textShadow: `0 0 14px ${arch.color}33` }}>
            {secondaryIntention}
          </p>
        )}
        {showAccompany && (
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 12.5, color: `rgba(255,255,255,0.22)`, letterSpacing: '0.04em', margin: 0, fontStyle: 'italic', animation: typingDone ? 'fadeIn 2.2s ease forwards, phrasebreathe 36s ease-in-out 3s infinite, milestoneGlow 14s ease-in-out 5s infinite' : 'fadeIn 2.2s ease forwards, phrasebreathe 36s ease-in-out 3s infinite', maxWidth: 280, lineHeight: 1.7, textShadow: `0 0 16px ${arch.color}18` }}>
            {ESPACEACCOMPANY[archetypeKey]}
          </p>
        )}
        {showPatience && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 11.5, color: `${arch.color}55`, letterSpacing: '0.08em', margin: 0, fontStyle: 'italic', animation: typingDone ? 'fadeIn 3s ease forwards, phrasebreathe 36s ease-in-out 4s infinite, milestoneGlow 12s ease-in-out 5s infinite' : 'fadeIn 3s ease forwards, phrasebreathe 36s ease-in-out 4s infinite', maxWidth: 260, lineHeight: 1.75, textAlign: 'center', textShadow: `0 0 14px ${arch.color}22` }}>
            {(PATIENCE_TEXTS[archetypeKey] || [])[textVariantIdx] || PATIENCE_TEXTS[archetypeKey]?.[0]}
          </p>
        )}
        {showEncoreIci && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 10, color: typingDone ? `${arch.color}44` : `${arch.color}22`, letterSpacing: '0.28em', margin: 0, fontStyle: 'italic', animation: typingDone ? 'fadeIn 3.5s ease forwards, phrasebreathe 38s ease-in-out 4s infinite, milestoneGlow 20s ease-in-out 8s infinite' : 'fadeIn 3.5s ease forwards, phrasebreathe 38s ease-in-out 4s infinite', textShadow: typingDone ? `0 0 22px ${arch.color}44` : `0 0 14px ${arch.color}18`, transition: 'color 1.8s ease, text-shadow 1.8s ease' }}>
            {{ resilience: 'encore là, en feu', presence: 'encore présent·e', sagesse: 'encore dans le silence', lumiere: 'encore lumineux·se' }[archetypeKey] || 'encore ici'}
          </p>
        )}
        {showDeep && (
          <>
            <div style={{ width: 20, height: 1, background: `${arch.color}33`, borderRadius: 1, animation: 'fadeIn 4s ease forwards, worldglow 14s ease-in-out 6s infinite' }} />
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 13, color: `${arch.color}55`, letterSpacing: '0.05em', margin: 0, fontStyle: 'italic', animation: typingDone ? 'fadeIn 5s ease forwards, phrasebreathe 44s ease-in-out 6s infinite, milestoneGlow 14s ease-in-out 7s infinite' : 'fadeIn 5s ease forwards, phrasebreathe 44s ease-in-out 6s infinite', maxWidth: 280, lineHeight: 1.8, textAlign: 'center', textShadow: `0 0 20px ${arch.color}22` }}>
              {(DEEP_TEXTS[archetypeKey] || [])[textVariantIdx] || DEEP_TEXTS[archetypeKey]?.[0]}
            </p>
          </>
        )}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: `${arch.color}55`, margin: 0, position: 'absolute', bottom: 'calc(52px + env(safe-area-inset-bottom, 0px))', letterSpacing: '0.15em', animation: 'fadeIn 1s ease 4s both, solbreathe 22s ease-in-out 5s infinite, milestoneGlow 8s ease-in-out 6s infinite', textShadow: `0 0 16px ${arch.color}33` }}>
          {(() => {
            const h = new Date().getHours()
            const night = { resilience: 'que le feu garde ta nuit', presence: 'bonne nuit, l\'eau veille', sagesse: 'la brume t\'enveloppe cette nuit', lumiere: 'que ta lumière guide ta nuit' }[archetypeKey] || 'bonne nuit'
            const day = { resilience: 'ta flamme t\'attend dehors', presence: 'le monde t\'accueille doucement', sagesse: 'la journée porte tes insights', lumiere: 'va rayonner dans ta journée' }[archetypeKey] || 'la journée t\'attend doucement'
            const eve = { resilience: 'reviens quand le feu appelle', presence: 'l\'eau est toujours là', sagesse: 'la brume reste en toi', lumiere: 'tu peux revenir quand tu veux' }[archetypeKey] || 'tu peux revenir quand tu veux'
            if (h >= 22 || h < 5) return night
            if (h < 18) return day
            return eve
          })()}
        </p>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: `linear-gradient(to top, rgba(5,8,16,0.62) 0%, transparent 100%)`, pointerEvents: 'none', zIndex: 1 }} />
    </div>
  )
}

// ─── NÉYA GIRL ────────────────────────────────────────────────────────────────

function NeyaGirl({ size = 54, color = '#3b82f6' }) {
  return (
    <svg width={size * 0.7} height={size} viewBox="0 0 38 60" fill="none">
      {/* Tête */}
      <ellipse cx="19" cy="13" rx="7.5" ry="8.5" fill="rgba(255,255,255,0.18)" />
      {/* Cheveux bleus longs */}
      <path d="M11 11 Q8 5 11 2 Q16 0 19 4 Q22 0 27 2 Q30 5 27 11" fill={color} opacity="0.82" />
      <path d="M11 11 Q7 20 9 30 Q11 33 13 28 Q12 20 13 13Z" fill={color} opacity="0.62" />
      <path d="M27 11 Q31 20 29 30 Q27 33 25 28 Q26 20 25 13Z" fill={color} opacity="0.62" />
      {/* Corps / robe */}
      <path d="M13 20 Q8 32 11 48 L27 48 Q30 32 25 20 Q22 23 19 23 Q16 23 13 20Z" fill="rgba(255,255,255,0.14)" />
      {/* Bras */}
      <path d="M13 22 Q8 28 8 35 Q10 36 13 30 L13 22Z" fill="rgba(255,255,255,0.10)" />
      <path d="M25 22 Q30 28 30 35 Q28 36 25 30 L25 22Z" fill="rgba(255,255,255,0.10)" />
    </svg>
  )
}

// ─── COCON SCREEN ─────────────────────────────────────────────────────────────

function SouvenirDetailModal({ souvenir, archetypeKey, onClose }) {
  const arch = ARCHETYPES[archetypeKey] || ARCHETYPES.presence
  const def = SOUVENIR_LIBRARY[souvenir.type] || { glyph: '✦', title: 'Un éclat', subtitle: '' }
  const [vis, setVis] = useState(false)
  const { exiting, close } = useExitAnimation(onClose, 280)
  useEffect(() => { const t = setTimeout(() => setVis(true), 30); return () => clearTimeout(t) }, [])

  const dateLong = (() => {
    try {
      const d = new Date(souvenir.ts)
      const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    } catch { return '' }
  })()
  const timeOfDay = (() => {
    try {
      const h = new Date(souvenir.ts).getHours()
      if (h >= 5 && h < 9)  return "à l'aube"
      if (h >= 9 && h < 17) return 'en pleine clarté'
      if (h >= 17 && h < 21) return 'au crépuscule'
      return 'sous la nuit'
    } catch { return '' }
  })()

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(2,3,8,0.97)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', opacity: (vis && !exiting) ? 1 : 0, transition: 'opacity 280ms cubic-bezier(0.4,0,1,1)', overflowY: 'auto', animation: exiting ? 'sheetExit 280ms cubic-bezier(0.4,0,1,1) both' : (vis ? 'modalEnter 440ms cubic-bezier(0.16,1.36,0.32,1) both' : 'none') }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 38%, rgba(${arch.rgb},0.18) 0%, transparent 60%)`, pointerEvents: 'none' }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {[{x:14,y:22,r:1.6,d:0},{x:82,y:30,r:1.4,d:3.2},{x:24,y:76,r:1.8,d:1.4},{x:78,y:70,r:1.2,d:6.4},{x:52,y:18,r:1.6,d:2.8}].map((m,i) => (
          <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: 0.18, animation: `splashmote ${24 + i * 3}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.d}s` }} />
        ))}
      </svg>

      <button data-press="true" onClick={close} aria-label="Fermer l'éclat" style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', right: 18, background: 'rgba(5,8,16,0.42)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 100, width: 44, height: 44, color: 'rgba(255,255,255,0.78)', fontFamily: 'Inter, sans-serif', fontSize: 18, lineHeight: 1, cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>✕</button>

      <div style={{ position: 'relative', zIndex: 1, padding: 'calc(env(safe-area-inset-top, 0px) + 70px) 32px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, minHeight: '100%', justifyContent: 'center', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: arch.color, letterSpacing: '0.32em', textTransform: 'uppercase', margin: 0, animation: 'signaturePulse 14s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 14px ${arch.color}66` }}>◈ Un éclat</p>

        {/* Glyph central avec halo */}
        <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'cardLiftDone 600ms cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, rgba(${arch.rgb},0.30) 0%, transparent 65%)`, animation: 'presencePulse 4.5s cubic-bezier(0.45,0,0.55,1) infinite' }} />
          <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', border: `1px solid rgba(${arch.rgb},0.55)`, animation: 'pulsering 5.2s cubic-bezier(0.45,0,0.55,1) infinite' }} />
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 64, fontWeight: 200, color: arch.color, lineHeight: 1, textShadow: `0 0 32px ${arch.color}88, 0 0 64px ${arch.color}44` }}>{def.glyph}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320 }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 26, color: 'white', margin: 0, lineHeight: 1.22, letterSpacing: '-0.01em', textShadow: `0 0 28px ${arch.color}33` }}>{def.title}</h2>
          {def.subtitle && <p style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontSize: 14.5, color: 'rgba(255,255,255,0.78)', margin: 0, lineHeight: 1.65 }}>« {def.subtitle} »</p>}
        </div>

        <div style={{ height: 1, width: 32, background: `${arch.color}88`, borderRadius: 1 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: 'rgba(255,255,255,0.62)', margin: 0, letterSpacing: '0.05em' }}>{dateLong}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: `${arch.color}cc`, margin: 0, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{timeOfDay}</p>
        </div>
      </div>
    </div>
  )
}

function CoconScreen({ archetypeKey, onClose }) {
  const arch = ARCHETYPES[archetypeKey] || ARCHETYPES.presence
  const [visible, setVisible] = useState(false)
  const ambience = getTimeAmbience()
  const vitality = getCoconVitality()
  useEffect(() => {
    try { addSouvenir('first_cocon') } catch {}
    try {
      const astro = checkAstroEclat()
      if (astro) addSouvenir(astro)
    } catch {}
    try {
      const v = getVisitor(ambience.period, vitality)
      if (v) {
        setShowVisitor(v)
        const sKey = v === 'shooting_star' ? 'visitor_shooting' : 'visitor_butterfly'
        addSouvenir(sKey)
        setTimeout(() => setShowVisitor(null), 6400)
      }
    } catch {}
  }, [])
  const coconName = (() => { try { return localStorage.getItem('neya_cocon_name') || '' } catch { return '' } })()

  const streak = getCurrentStreak()
  const totalDays = (() => {
    let count = 0
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('neya_routines_')) {
          if (JSON.parse(localStorage.getItem(key) || '[]').some(Boolean)) count++
        }
      }
    } catch {}
    return count
  })()

  const [placed, setPlaced] = useState(() => {
    try { return JSON.parse(localStorage.getItem('neya_cocon_placed') || '[]') } catch { return [] }
  })
  const [selectedSouvenir, setSelectedSouvenir] = useState(null)
  const [coconNameLocal, setCoconNameLocal] = useState(coconName)
  const [editingName, setEditingName] = useState(false)
  const [showVisitor, setShowVisitor] = useState(null)
  const season = getSeason()
  const meteo = getMeteo(vitality)

  const togglePlaced = (id, isUnlocked) => {
    if (!isUnlocked) return
    haptic([6, 40, 6])
    setPlaced(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      try {
        localStorage.setItem('neya_cocon_placed', JSON.stringify(next))
        if (next.includes(id) && !prev.includes(id)) addSouvenir(`item_${id}`)
      } catch {}
      return next
    })
  }

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const COCON_ITEMS = [
    { id: 'bougie',  label: 'La Bougie',   sub: 'Flamme intérieure',  unlockAt: 3,  by: 'streak', icon: 'candle'  },
    { id: 'cristal', label: 'Le Cristal',  sub: 'Clarté et ancrage',  unlockAt: 7,  by: 'total',  icon: 'crystal' },
    { id: 'plante',  label: 'La Plante',   sub: 'Ce qui grandit',     unlockAt: 14, by: 'total',  icon: 'plant'   },
    { id: 'totem',   label: 'Ton Totem',   sub: arch.animal,          unlockAt: 21, by: 'total',  icon: 'totem'   },
    { id: 'portail', label: 'Le Portail',  sub: "Vers l'inconnu",     unlockAt: 30, by: 'total',  icon: 'portal'  },
  ]

  function ItemIcon({ icon, color: icolor, unlocked }) {
    const op = unlocked ? 1 : 0.38
    if (icon === 'candle') return (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <rect x="10" y="14" width="8" height="12" rx="1.5" fill={icolor} opacity={0.72 * op} />
        <path d="M14 14 Q12 8 14 4 Q16 8 14 14Z" fill={icolor} opacity={0.95 * op} />
        <ellipse cx="14" cy="4.5" rx="1.5" ry="2" fill="white" opacity={0.55 * op} />
      </svg>
    )
    if (icon === 'crystal') return (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <path d="M14 3 L22 10 L19 24 L9 24 L6 10 Z" fill={icolor} opacity={0.55 * op} />
        <path d="M14 3 L22 10 L14 7 Z" fill={icolor} opacity={0.85 * op} />
        <path d="M14 3 L6 10 L14 7 Z" fill="white" opacity={0.18 * op} />
      </svg>
    )
    if (icon === 'plant') return (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <path d="M14 25 L14 12" stroke={icolor} strokeWidth="1.8" strokeLinecap="round" opacity={0.72 * op} />
        <path d="M14 18 Q10 14 6 15 Q7 19 14 18Z" fill={icolor} opacity={0.82 * op} />
        <path d="M14 14 Q18 10 22 11 Q21 15 14 14Z" fill={icolor} opacity={0.68 * op} />
        <path d="M14 22 Q11 19 8 20 Q9 23 14 22Z" fill={icolor} opacity={0.55 * op} />
      </svg>
    )
    if (icon === 'totem') return <SpiritAnimal archetype={archetypeKey} size={28} style={{ opacity: op }} />
    if (icon === 'portal') return (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="9" stroke={icolor} strokeWidth="2" opacity={0.80 * op} />
        <circle cx="14" cy="14" r="5" stroke={icolor} strokeWidth="1" opacity={0.50 * op} />
        <circle cx="14" cy="14" r="2" fill={icolor} opacity={0.88 * op} />
      </svg>
    )
    return null
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 800,
      opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Background monde */}
      <div style={{ position: 'absolute', top: '-2.5%', left: '-2.5%', right: '-2.5%', bottom: '-2.5%', backgroundImage: `url(${B}${arch.bg})`, backgroundSize: 'cover', backgroundPosition: 'center', animation: 'bgbreathe 30s cubic-bezier(0.45,0,0.55,1) infinite' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,16,0.72)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, rgba(${arch.rgb},0.12) 0%, transparent 65%)`, pointerEvents: 'none' }} />
      {/* Ambience temporelle — dawn/day/dusk/night */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% ${ambience.period === 'night' ? '70%' : '30%'}, ${ambience.primary} 0%, transparent 60%)`, pointerEvents: 'none', transition: 'background 1.8s cubic-bezier(0.45,0,0.55,1)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${ambience.period === 'night' ? '180deg' : '0deg'}, ${ambience.secondary} 0%, transparent 55%)`, pointerEvents: 'none' }} />
      {/* Saison — tint additionnel doux */}
      <div style={{ position: 'absolute', inset: 0, background: season.tint, pointerEvents: 'none', mixBlendMode: 'overlay' }} />
      {/* Météo intérieure : brume si basse vitalité, lueurs si haute */}
      {meteo.key === 'brume' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {[{y:'18%',h:60,dur:32,del:0},{y:'42%',h:48,dur:38,del:8},{y:'68%',h:72,dur:28,del:14},{y:'82%',h:44,dur:34,del:5}].map((m,i) => (
            <div key={i} style={{ position: 'absolute', left: '-10%', right: '-10%', top: m.y, height: m.h, background: 'linear-gradient(90deg, transparent, rgba(170,180,210,0.08), rgba(140,150,200,0.05), transparent)', borderRadius: 60, animation: `mistDrift ${m.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
          ))}
        </div>
      )}
      {meteo.key === 'lueurs' && (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {[{x:8,y:16,r:1.2,dur:14,del:0},{x:92,y:22,r:1.0,dur:18,del:3},{x:18,y:74,r:1.4,dur:12,del:7},{x:82,y:68,r:1.0,dur:16,del:2},{x:50,y:50,r:1.6,dur:11,del:5},{x:28,y:38,r:0.8,dur:22,del:9},{x:72,y:42,r:1.0,dur:17,del:11}].map((s,i) => (
            <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill={arch.color} style={{ opacity: 0.40 + meteo.intensity * 0.20, animation: `seedPulse ${s.dur}s cubic-bezier(0.45,0,0.55,1) infinite, animalfloat ${s.dur * 2}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${s.del}s`, filter: `drop-shadow(0 0 ${4 + meteo.intensity * 4}px ${arch.color})` }} />
          ))}
        </svg>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: `linear-gradient(to top, rgba(${arch.rgb},${0.04 + vitality * 0.06}) 0%, transparent 100%)`, pointerEvents: 'none', animation: `depthBreath ${Math.round(16 / ambience.rhythm)}s cubic-bezier(0.45,0,0.55,1) infinite` }} />
      {/* Vitalité — petites lueurs flottantes en plus si monde vivant */}
      {vitality > 0.5 && (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {[{x:12,y:22,r:1.6,dur:30,del:0},{x:84,y:28,r:1.2,dur:38,del:5.2},{x:22,y:72,r:2.0,dur:28,del:2.1},{x:78,y:68,r:1.4,dur:42,del:8.4},{x:50,y:88,r:1.6,dur:36,del:3.7},{x:90,y:50,r:1.4,dur:32,del:6.6}].map((m,i) => (
            <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: ambience.particleOp + vitality * 0.04, animation: `splashmote ${Math.round(m.dur / ambience.rhythm)}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
          ))}
        </svg>
      )}
      <GrainFilter />

      {/* Header semi-transparent */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 22px 16px', background: 'rgba(5,8,16,0.28)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: `1px solid rgba(${arch.rgb},0.12)` }}>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '10px 20px', color: 'rgba(255,255,255,0.72)', fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: '0.10em', cursor: 'pointer', minHeight: 40 }} aria-label="Fermer le cocon">← Fermer</button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.78)', letterSpacing: '0.14em', animation: 'phrasebreathe 18s cubic-bezier(0.45,0,0.55,1) infinite' }}>Mon Espace</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: `rgba(${arch.rgb},0.62)`, letterSpacing: '0.20em', textTransform: 'uppercase', textShadow: `0 0 10px ${arch.color}33`, animation: 'signaturePulse 22s cubic-bezier(0.45,0,0.55,1) infinite' }}>{{ dawn: "à l'aube", day: 'en pleine clarté', dusk: 'au crépuscule', night: 'sous la nuit' }[ambience.period]} · {season.label} · {meteo.label}</span>
        </div>
        <div style={{ width: 72 }} />
      </div>

      {/* Contenu scrollable */}
      <div style={{ position: 'relative', zIndex: 5, flex: 1, overflowY: 'auto', scrollBehavior: 'smooth', padding: '24px 22px calc(env(safe-area-inset-bottom, 0px) + 110px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>

        {/* Ambience badge + Souvenirs ribbon */}
        {(() => {
          const souvenirs = getSouvenirs().slice(-6).reverse()
          if (souvenirs.length === 0) return null
          return (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, animation: 'fadeIn 0.8s cubic-bezier(0,0,0.2,1) both' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: `rgba(${arch.rgb},0.62)`, letterSpacing: '0.30em', textTransform: 'uppercase', margin: 0, textShadow: `0 0 12px ${arch.color}44` }}>◈ Tes éclats</p>
              <div style={{ display: 'flex', gap: 14, overflowX: 'auto', overflowY: 'visible', padding: '8px 4px 12px', maxWidth: '100%', justifyContent: souvenirs.length < 4 ? 'center' : 'flex-start', alignSelf: 'stretch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {souvenirs.map((s, i) => {
                  const def = SOUVENIR_LIBRARY[s.type] || { glyph: '✦', title: s.type, subtitle: '' }
                  return (
                    <div key={s.ts} onClick={() => { haptic(6); try { playSouvenir() } catch {} ; setSelectedSouvenir(s) }} role="button" tabIndex={0} aria-label={`Voir l'éclat ${def.title}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 84, animation: `chipPop 480ms cubic-bezier(0.34,1.56,0.64,1) ${i * 70}ms both`, cursor: 'pointer' }}>
                      <div style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', background: `radial-gradient(circle, rgba(${arch.rgb},0.20) 0%, rgba(${arch.rgb},0.04) 70%, transparent 100%)`, border: `1px solid rgba(${arch.rgb},0.42)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 14px rgba(${arch.rgb},0.20), inset 0 0 8px rgba(${arch.rgb},0.10)`, animation: `signaturePulse ${10 + i * 2}s cubic-bezier(0.45,0,0.55,1) ${i * 1.2}s infinite` }}>
                        <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, color: arch.color, lineHeight: 1, textShadow: `0 0 8px ${arch.color}88` }}>{def.glyph}</span>
                      </div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, fontWeight: 300, color: 'rgba(255,255,255,0.75)', textAlign: 'center', margin: 0, lineHeight: 1.3, letterSpacing: '0.02em', maxWidth: 84, textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>{def.title}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 8.5, color: `${arch.color}aa`, margin: 0, letterSpacing: '0.06em' }}>{formatSouvenirDate(s.ts)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* Spirit Animal géant flottant */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
          <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, rgba(${arch.rgb},0.18) 0%, transparent 68%)`, animation: 'presencePulse 5s cubic-bezier(0.45,0,0.55,1) infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 270, height: 270, borderRadius: '50%', border: `1px solid rgba(${arch.rgb},0.14)`, animation: 'pulsering 6s cubic-bezier(0.45,0,0.55,1) infinite 1.2s', pointerEvents: 'none' }} />
          <img
            src={`${B}spirit-${archetypeKey}.avif`}
            alt={arch.animal}
            style={{
              width: 200, height: 200,
              borderRadius: '50%',
              objectFit: 'cover',
              objectPosition: 'center 45%',
              display: 'block',
              filter: `brightness(1.05) saturate(1.1) drop-shadow(0 0 32px ${arch.color}) drop-shadow(0 0 64px ${arch.color}66)`,
              animation: 'animalfloat 18s cubic-bezier(0.45,0,0.55,1) infinite, animalbreathe 26s cubic-bezier(0.45,0,0.55,1) infinite',
            }}
          />
        </div>

        {/* NeyaGirl + titre */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ animation: `animalfloat ${Math.round(22 / ambience.rhythm)}s cubic-bezier(0.45,0,0.55,1) ${3 + (1 - vitality) * 2}s infinite, animalbreathe ${Math.round(28 / Math.max(0.5, vitality))}s cubic-bezier(0.45,0,0.55,1) infinite`, opacity: 0.7 + vitality * 0.25 }}>
            <NeyaGirl size={54} color="#3b82f6" />
          </div>
          {editingName ? (
            <input
              autoFocus
              value={coconNameLocal}
              onChange={(e) => setCoconNameLocal(e.target.value.slice(0, 40))}
              onBlur={() => { try { coconNameLocal.trim() ? localStorage.setItem('neya_cocon_name', coconNameLocal.trim()) : localStorage.removeItem('neya_cocon_name') } catch {} ; setEditingName(false) }}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
              placeholder="Mon Cocon Néya"
              style={{ background: 'transparent', border: 'none', borderBottom: `1px solid ${arch.color}88`, outline: 'none', textAlign: 'center', fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 18, color: 'white', letterSpacing: '0.02em', maxWidth: 240, padding: '2px 0', caretColor: arch.color }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 18, margin: 0, letterSpacing: '0.02em', textAlign: 'center', animation: 'phrasebreathe 24s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 10s ease-in-out 3s infinite', background: `linear-gradient(135deg, ${arch.color}, rgba(255,255,255,0.92) 55%, ${arch.color}bb)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{coconNameLocal || 'Mon Cocon Néya'}</p>
              <button onClick={() => setEditingName(true)} aria-label="Renommer ton cocon" style={{ background: 'none', border: 'none', cursor: 'pointer', color: `${arch.color}88`, fontSize: 13, padding: 6, lineHeight: 1, minWidth: 32, minHeight: 32, animation: 'phrasebreathe 18s cubic-bezier(0.45,0,0.55,1) infinite' }}>✎</button>
            </div>
          )}
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 12, color: `rgba(${arch.rgb},0.65)`, margin: 0, letterSpacing: '0.08em', textAlign: 'center', fontStyle: 'italic', animation: 'phrasebreathe 30s cubic-bezier(0.45,0,0.55,1) infinite' }}>Ton sanctuaire se construit avec ta présence</p>
        </div>

        {/* Stats streak + jours */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 22, color: arch.color, textShadow: `0 0 18px ${arch.color}66`, animation: 'milestoneGlow 6s cubic-bezier(0.45,0,0.55,1) infinite' }}>{streak}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.52)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>jours d'affilée</div>
          </div>
          <div style={{ width: 1, height: 32, background: `rgba(${arch.rgb},0.20)`, borderRadius: 1 }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 22, color: arch.color, textShadow: `0 0 18px ${arch.color}66`, animation: 'milestoneGlow 6s ease-in-out 1.5s infinite' }}>{totalDays}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.52)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>jours visités</div>
          </div>
        </div>

        {/* Séparateur lumineux */}
        <div style={{ width: '100%', height: 1, background: `linear-gradient(90deg, transparent, rgba(${arch.rgb},0.30), transparent)`, animation: 'worldglow 8s cubic-bezier(0.45,0,0.55,1) infinite' }} />

        {/* Objets du cocon */}
        <div style={{ width: '100%' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: `rgba(${arch.rgb},0.55)`, letterSpacing: '0.28em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center', animation: 'phrasebreathe 20s cubic-bezier(0.45,0,0.55,1) infinite' }}>Objets de ton sanctuaire</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {COCON_ITEMS.slice(0, 4).map((item) => {
              const current = item.by === 'streak' ? streak : totalDays
              const unlocked = current >= item.unlockAt
              const itemBoxShadow = (() => {
                if (!unlocked) return 'none'
                if (item.id === 'bougie') return `0 0 28px rgba(245,158,11,0.20), inset 0 0 0 1px rgba(245,158,11,0.12)`
                if (item.id === 'cristal') return `0 0 28px rgba(${arch.rgb},0.18), inset 0 0 8px rgba(${arch.rgb},0.06)`
                if (item.id === 'plante') return `0 0 28px rgba(20,184,166,0.18), inset 0 0 0 1px rgba(20,184,166,0.08)`
                if (item.id === 'totem') return `0 0 28px rgba(${arch.rgb},0.24), inset 0 2px 0 rgba(255,255,255,0.06)`
                return `0 0 22px rgba(${arch.rgb},0.16), inset 0 0 0 1px ${arch.color}18`
              })()
              return (
                <div key={item.id} onClick={() => togglePlaced(item.id, unlocked)} style={{
                  background: unlocked ? (placed.includes(item.id) ? `rgba(${arch.rgb},0.16)` : `rgba(${arch.rgb},0.10)`) : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${unlocked ? (placed.includes(item.id) ? arch.color + '88' : arch.color + '55') : 'rgba(255,255,255,0.09)'}`,
                  cursor: unlocked ? 'pointer' : 'default',
                  borderRadius: 14, padding: '18px 14px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  opacity: unlocked ? 1 : 0.55,
                  boxShadow: itemBoxShadow,
                  animation: unlocked ? 'milestoneGlow 8s cubic-bezier(0.45,0,0.55,1) infinite' : 'none',
                  transition: 'background 240ms cubic-bezier(0.4,0,0.2,1), box-shadow 360ms cubic-bezier(0,0,0.2,1), color 240ms cubic-bezier(0.4,0,0.2,1)',
                  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                }}>
                  <div style={{ filter: placed.includes(item.id) ? `drop-shadow(0 0 12px ${arch.color}cc) drop-shadow(0 0 22px ${arch.color}66)` : (unlocked ? `drop-shadow(0 0 8px ${arch.color}88)` : 'none'), animation: unlocked ? 'animalbreathe 8s cubic-bezier(0.45,0,0.55,1) infinite' : 'none' }}>
                    <ItemIcon icon={item.icon} color={arch.color} unlocked={unlocked} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 13, color: unlocked ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.55)', letterSpacing: '-0.01em', marginBottom: 3, animation: unlocked ? 'phrasebreathe 22s cubic-bezier(0.45,0,0.55,1) infinite' : 'none' }}>{item.label}</div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, letterSpacing: '0.04em', fontStyle: 'italic', color: unlocked ? (placed.includes(item.id) ? arch.color : `rgba(${arch.rgb},0.85)`) : 'rgba(255,255,255,0.48)', ...(placed.includes(item.id) ? { textShadow: `0 0 12px ${arch.color}88`, animation: 'milestoneGlow 3s cubic-bezier(0.45,0,0.55,1) infinite', fontWeight: 400 } : {}) }}>
                      {unlocked ? (placed.includes(item.id) ? '✦ Dans ton cocon' : 'Touche pour placer') : `${item.unlockAt} jours`}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 5e item — Le Portail — centré pleine largeur */}
          {(() => {
            const item = COCON_ITEMS[4]
            const current = item.by === 'streak' ? streak : totalDays
            const unlocked = current >= item.unlockAt
            return (
              <div onClick={() => togglePlaced(item.id, unlocked)} style={{ marginTop: 12, background: unlocked ? `linear-gradient(135deg, rgba(${arch.rgb},0.14) 0%, rgba(255,255,255,0.04) 50%, rgba(${arch.rgb},0.10) 100%)` : 'rgba(255,255,255,0.04)', border: `1px solid ${unlocked ? (placed.includes(item.id) ? arch.color + '88' : arch.color + '66') : 'rgba(255,255,255,0.09)'}`, cursor: unlocked ? 'pointer' : 'default', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 18, opacity: unlocked ? 1 : 0.55, boxShadow: unlocked ? `0 0 40px rgba(${arch.rgb},0.22), inset 0 0 20px rgba(${arch.rgb},0.06)` : 'none', animation: unlocked ? 'auroraHue 8s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 5s cubic-bezier(0.45,0,0.55,1) infinite' : 'none', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', transition: 'background 240ms cubic-bezier(0.4,0,0.2,1), box-shadow 360ms cubic-bezier(0,0,0.2,1), color 240ms cubic-bezier(0.4,0,0.2,1)' }}>
                <div style={{ filter: placed.includes(item.id) ? `drop-shadow(0 0 12px ${arch.color}cc) drop-shadow(0 0 22px ${arch.color}66)` : (unlocked ? `drop-shadow(0 0 12px ${arch.color}cc)` : 'none'), animation: unlocked ? 'animalbreathe 6s cubic-bezier(0.45,0,0.55,1) infinite' : 'none', flexShrink: 0 }}>
                  <ItemIcon icon={item.icon} color={arch.color} unlocked={unlocked} />
                </div>
                <div>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14, color: unlocked ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.38)', letterSpacing: '-0.01em', marginBottom: 4, animation: unlocked ? 'milestoneGlow 5s cubic-bezier(0.45,0,0.55,1) infinite' : 'none' }}>{item.label}</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontStyle: 'italic', letterSpacing: '0.04em', color: unlocked ? (placed.includes(item.id) ? arch.color : `rgba(${arch.rgb},0.92)`) : 'rgba(255,255,255,0.48)', ...(placed.includes(item.id) ? { textShadow: `0 0 12px ${arch.color}88`, animation: 'milestoneGlow 3s cubic-bezier(0.45,0,0.55,1) infinite', fontWeight: 400 } : {}) }}>
                    {unlocked ? (placed.includes(item.id) ? '✦ Dans ton cocon' : 'Touche pour placer') : `${item.unlockAt} jours de présence`}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {selectedSouvenir && <SouvenirDetailModal souvenir={selectedSouvenir} archetypeKey={archetypeKey} onClose={() => setSelectedSouvenir(null)} />}
      {showVisitor && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 6, animation: 'fadeIn 1.2s cubic-bezier(0.45,0,0.55,1) both' }}>
          {showVisitor === 'shooting_star' ? (
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <line x1="-5%" y1="20%" x2="105%" y2="60%" stroke="white" strokeWidth="1.4" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${arch.color}) drop-shadow(0 0 18px white)`, strokeDasharray: '180 9999', animation: 'shootingStar 5.6s cubic-bezier(0.22,1,0.36,1) forwards' }} />
            </svg>
          ) : (
            <div style={{ position: 'absolute', top: '38%', left: '-10%', fontSize: 28, opacity: 0.75, filter: `drop-shadow(0 0 14px ${arch.color}88)`, animation: 'butterflyFlight 6.4s cubic-bezier(0.45,0,0.55,1) forwards' }}>⌒</div>
          )}
          <p style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 22%)', left: 0, right: 0, textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.18em', textTransform: 'uppercase', textShadow: `0 0 14px ${arch.color}44`, animation: 'fadeIn 2s cubic-bezier(0.45,0,0.55,1) 1s both', margin: 0, fontStyle: 'italic' }}>{showVisitor === 'shooting_star' ? 'une étoile filante' : 'un papillon est passé'}</p>
        </div>
      )}

      {/* Message poétique de fin */}
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 11, color: `rgba(${arch.rgb},0.40)`, letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.75, margin: '8px 0 0', fontStyle: 'italic', animation: 'phrasebreathe 36s cubic-bezier(0.45,0,0.55,1) infinite', maxWidth: 280 }}>
          Chaque jour que tu passes ici fait grandir ton sanctuaire.<br />Ta présence est la seule clé.
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

// ─── WORLD UNLOCK MODAL ───────────────────────────────────────────────────────

function WorldUnlockModal({ worldKey, onClose }) {
  const w = WORLDS[worldKey]
  const [vis, setVis] = useState(false)
  const [phase, setPhase] = useState(0)  // 0=animal reveal, 1=text, 2=button

  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 50)
    const t2 = setTimeout(() => setPhase(1), 1200)
    const t3 = setTimeout(() => setPhase(2), 2600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 950, opacity: vis ? 1 : 0, transition: 'opacity 0.6s ease' }}>
      <BgScreen bg={w.bg} overlay={`linear-gradient(180deg, rgba(5,8,16,0.78) 0%, rgba(${w.rgb},0.08) 50%, rgba(5,8,16,0.88) 100%)`}>
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', gap: 28 }}>

          {/* World glow orb */}
          <div style={{ width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, rgba(${w.rgb},0.38) 0%, rgba(${w.rgb},0.10) 55%, transparent 100%)`, border: `1px solid rgba(${w.rgb},0.55)`, boxShadow: `0 0 60px rgba(${w.rgb},0.40), 0 0 120px rgba(${w.rgb},0.18)`, animation: vis ? 'haloOnce 1400ms cubic-bezier(0,0,0.2,1) 0.4s both, presencePulse 3s cubic-bezier(0.45,0,0.55,1) 1.6s infinite' : 'none', opacity: vis ? 1 : 0, transform: vis ? 'scale(1)' : 'scale(0.72)', transition: 'opacity 1s ease, transform 1.2s cubic-bezier(0.22,1,0.36,1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 40, filter: `drop-shadow(0 0 14px rgba(${w.rgb},0.80))`, animation: 'seedPulse 4s cubic-bezier(0.45,0,0.55,1) infinite' }}>{{ brume: '🌫', feu: '🔥', foret: '🌿', eau: '💧', cosmos: '✨', vide: '🌀' }[worldKey] || '✦'}</span>
          </div>

          {/* Textes (phase 1+) */}
          <div style={{ textAlign: 'center', opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? 'translateY(0)' : 'translateY(18px)', transition: 'all 0.8s ease' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: `rgba(${w.rgb},0.75)`, letterSpacing: '0.24em', textTransform: 'uppercase', margin: '0 0 12px', animation: 'phrasebreathe 8s cubic-bezier(0.45,0,0.55,1) infinite' }}>Nouveau monde découvert</p>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 28, color: 'rgba(255,255,255,0.94)', margin: '0 0 12px', letterSpacing: '-0.01em', lineHeight: 1.2, textShadow: `0 0 40px rgba(${w.rgb},0.50)`, animation: 'milestoneGlow 5s cubic-bezier(0.45,0,0.55,1) infinite' }}>{w.name}</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.52)', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>"{w.fragments[0]}"</p>
          </div>

          {/* CTA (phase 2+) */}
          <button onClick={onClose} data-press="true" style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 480ms cubic-bezier(0,0,0.2,1), transform 560ms cubic-bezier(0.22,1,0.36,1)', background: `rgba(${w.rgb},0.88)`, border: 'none', borderRadius: 100, padding: '16px 40px', color: 'white', fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 6px 36px rgba(${w.rgb},0.44), 0 2px 12px rgba(0,0,0,0.3)`, animation: phase >= 2 ? 'breathExpand 620ms cubic-bezier(0.22,1,0.36,1) both, milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) 0.8s infinite' : 'none', pointerEvents: phase >= 2 ? 'auto' : 'none' }}>
            Explorer ce monde →
          </button>
        </div>
      </BgScreen>
    </div>
  )
}

// ─── GRAND VOYAGE SCREEN ──────────────────────────────────────────────────────

function WorldCard({ worldKey, archetypeKey, isUnlocked, isHome, daysToUnlock, onEnter }) {
  const w = WORLDS[worldKey]
  const fragmentCount = isUnlocked ? getWorldRealFragmentCount(worldKey) : 0
  const visibleFragments = Math.min(fragmentCount, w.fragments.length)
  const latestFragment = visibleFragments > 0 ? w.fragments[visibleFragments - 1] : null

  return (
    <div onClick={() => { if (isUnlocked) onEnter(worldKey); else { haptic([6,30,6]) } }}
      style={{
        position: 'relative', borderRadius: 18, overflow: 'hidden', marginBottom: 14,
        minHeight: 160, cursor: isUnlocked ? 'pointer' : 'default',
        border: isHome ? `1.5px solid ${w.color}88` : isUnlocked ? `1px solid ${w.color}44` : '1px solid rgba(255,255,255,0.08)',
        opacity: isUnlocked ? 1 : 0.55,
        boxShadow: isHome ? `0 0 32px rgba(${w.rgb},0.18), 0 4px 24px rgba(0,0,0,0.5)` : isUnlocked ? `0 4px 16px rgba(0,0,0,0.4)` : 'none',
        animation: isHome ? 'fadeIn 0.5s ease both' : 'fadeIn 0.6s ease 0.1s both',
      }}>
      {/* Background image */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${B}${w.bg})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: isUnlocked ? 'none' : 'grayscale(0.8) brightness(0.4)', transition: 'filter 0.5s ease' }} />
      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: isHome ? `linear-gradient(135deg, rgba(5,8,16,0.62), rgba(${w.rgb},0.18))` : 'linear-gradient(135deg, rgba(5,8,16,0.72), rgba(5,8,16,0.50))' }} />
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '18px 18px 16px', height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 16, color: isUnlocked ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.62)', letterSpacing: '0.01em', animation: isHome ? 'phrasebreathe 24s cubic-bezier(0.45,0,0.55,1) infinite' : 'none', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>{w.name}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: isUnlocked ? `rgba(${w.rgb},0.95)` : 'rgba(255,255,255,0.50)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 3, textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>{w.sub}</div>
          </div>
          <div style={{ flexShrink: 0, width: 42, height: 42, borderRadius: '50%', background: isUnlocked ? `radial-gradient(circle, rgba(${w.rgb},0.32) 0%, transparent 70%)` : 'transparent', border: isUnlocked ? `1px solid rgba(${w.rgb},0.44)` : '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isUnlocked ? 1 : 0.25, animation: isHome ? 'presencePulse 6s cubic-bezier(0.45,0,0.55,1) infinite' : 'none', boxShadow: isHome ? `0 0 18px rgba(${w.rgb},0.25)` : 'none' }}>
            <span style={{ fontSize: 18, filter: isUnlocked ? `drop-shadow(0 0 8px rgba(${w.rgb},0.80))` : 'none' }}>{{ brume: '🌫', feu: '🔥', foret: '🌿', eau: '💧', cosmos: '✨', vide: '🌀' }[worldKey] || '✦'}</span>
          </div>
        </div>
        {/* Status */}
        {isUnlocked ? (
          <>
            {isHome && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: w.color, boxShadow: `0 0 8px ${w.color}`, animation: 'seedPulse 3s cubic-bezier(0.45,0,0.55,1) infinite' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: w.color, letterSpacing: '0.14em', textTransform: 'uppercase', animation: 'milestoneGlow 6s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: '0 1px 8px rgba(0,0,0,0.55)' }}>Ton monde natal</span>
              </div>
            )}
            {latestFragment && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 12.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, margin: 0, fontStyle: 'italic', textShadow: '0 1px 8px rgba(0,0,0,0.55)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{latestFragment}"</p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {w.fragments.map((_, i) => (
                  <div key={i} style={{ width: i < visibleFragments ? 8 : 6, height: i < visibleFragments ? 8 : 6, borderRadius: '50%', background: i < visibleFragments ? w.color : 'rgba(255,255,255,0.12)', boxShadow: i < visibleFragments ? `0 0 6px ${w.color}88` : 'none', transition: 'background 240ms cubic-bezier(0.4,0,0.2,1), box-shadow 360ms cubic-bezier(0,0,0.2,1), color 240ms cubic-bezier(0.4,0,0.2,1)', animation: i < visibleFragments ? 'seedPulse 4s cubic-bezier(0.45,0,0.55,1) infinite' : 'none', animationDelay: `${i * 0.4}s` }} />
                ))}
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: `rgba(${w.rgb},0.95)`, letterSpacing: '0.12em', animation: 'phrasebreathe 12s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: '0 1px 8px rgba(0,0,0,0.55)' }}>Explorer →</span>
            </div>
          </>
        ) : (
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, opacity: 0.45 }}>🔒</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.62)', letterSpacing: '0.06em', textShadow: '0 1px 8px rgba(0,0,0,0.55)' }}>Débloque dans {daysToUnlock} jours de pratique</span>
          </div>
        )}
      </div>
      {/* Home world glow ring */}
      {isHome && <div style={{ position: 'absolute', inset: -1, borderRadius: 18, border: `1px solid ${w.color}44`, pointerEvents: 'none', animation: 'worldglow 6s cubic-bezier(0.45,0,0.55,1) infinite' }} />}
    </div>
  )
}

function WorldDetailOverlay({ worldKey, archetypeKey, onClose }) {
  const w = WORLDS[worldKey]
  const fragmentCount = getWorldRealFragmentCount(worldKey)
  const visibleFragments = Math.min(fragmentCount, w.fragments.length)
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 40); return () => clearTimeout(t) }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 850, opacity: vis ? 1 : 0, transition: 'opacity 0.45s ease' }}>
      <BgScreen bg={w.bg} overlay={`linear-gradient(180deg, rgba(5,8,16,0.72) 0%, rgba(${w.rgb},0.12) 50%, rgba(5,8,16,0.85) 100%)`}>
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '0 22px', paddingTop: 'calc(env(safe-area-inset-top) + 52px)', paddingBottom: 40, overflowY: 'auto', gap: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 22, color: 'rgba(255,255,255,0.96)', letterSpacing: '-0.01em', animation: 'phrasebreathe 20s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: '0 2px 14px rgba(0,0,0,0.6)' }}>{w.name}</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: `rgba(${w.rgb},0.95)`, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 6, textShadow: '0 1px 8px rgba(0,0,0,0.55)' }}>{w.sub}</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '10px 20px', color: 'rgba(255,255,255,0.72)', fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: '0.10em', cursor: 'pointer', flexShrink: 0, minHeight: 40 }} aria-label="Fermer">Fermer</button>
          </div>

          {/* Spirit animal */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28, animation: 'animalfloat 18s cubic-bezier(0.45,0,0.55,1) infinite, animalbreathe 10s cubic-bezier(0.45,0,0.55,1) infinite' }}>
            <img
              src={`${B}spirit-${w.animalKey}.avif`}
              alt={w.animalKey}
              style={{
                width: 120, height: 120,
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: 'center 45%',
                display: 'block',
                filter: `brightness(1.05) saturate(1.1) drop-shadow(0 0 32px rgba(${w.rgb},0.55)) drop-shadow(0 0 80px rgba(${w.rgb},0.25))`,
              }}
            />
          </div>

          {/* Story fragments */}
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: `rgba(${w.rgb},0.95)`, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16, textShadow: '0 1px 8px rgba(0,0,0,0.55)' }}>Fragments de ton voyage · {visibleFragments}/{w.fragments.length}</div>
          {w.fragments.map((frag, i) => {
            const unlocked = i < visibleFragments
            return (
              <div key={i} style={{ position: 'relative', marginBottom: 16, opacity: unlocked ? 1 : 0.22 }}>
                <div style={{ position: 'absolute', left: 0, top: '15%', bottom: '15%', width: 2, background: unlocked ? `linear-gradient(180deg, transparent, ${w.color}99, transparent)` : 'rgba(255,255,255,0.08)', borderRadius: 2, animation: unlocked ? 'worldglow 6s cubic-bezier(0.45,0,0.55,1) infinite' : 'none', animationDelay: `${i * 0.8}s` }} />
                <div style={{ paddingLeft: 16, paddingTop: 4, paddingBottom: 4 }}>
                  {unlocked ? (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14.5, color: 'rgba(255,255,255,0.88)', lineHeight: 1.72, margin: 0, fontStyle: 'italic', textShadow: '0 1px 10px rgba(0,0,0,0.5)', animation: 'phrasebreathe 40s cubic-bezier(0.45,0,0.55,1) infinite', animationDelay: `${i * 3}s` }}>"{frag}"</p>
                  ) : (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0, letterSpacing: '0.08em', textShadow: '0 1px 8px rgba(0,0,0,0.55)' }}>Fragment débloqué dans {Math.max(0, [0,7,14,21,30][i] - getTotalDaysVisited())} jours...</p>
                  )}
                </div>
              </div>
            )
          })}
          <div style={{ height: 60 }} />
        </div>
      </BgScreen>
    </div>
  )
}

function GrandVoyageScreen({ archetypeKey }) {
  const arch = ARCHETYPES[archetypeKey]
  const totalDays = getTotalDaysVisited()
  const unlockedWorlds = getUnlockedWorlds(archetypeKey)
  const order = WORLD_ORDER[archetypeKey] || WORLD_ORDER.resilience
  const homeWorldKey = order[0]
  const daysToNext = getDaysToNextWorld(archetypeKey)
  const [vis, setVis] = useState(false)
  const [selectedWorld, setSelectedWorld] = useState(null)
  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t) }, [])

  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '0 20px', paddingBottom: 100, paddingTop: 'calc(env(safe-area-inset-top) + 22px)', opacity: vis ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 24, color: 'rgba(255,255,255,0.90)', letterSpacing: '-0.01em', animation: 'phrasebreathe 28s cubic-bezier(0.45,0,0.55,1) infinite' }}>Mon Grand Voyage</div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 6, lineHeight: 1.5, letterSpacing: '0.02em' }}>
          {unlockedWorlds.length === 6 ? 'Tous les mondes t\'ont été révélés.' : `${unlockedWorlds.length} monde${unlockedWorlds.length > 1 ? 's' : ''} découvert${unlockedWorlds.length > 1 ? 's' : ''} · ${daysToNext} jour${daysToNext > 1 ? 's' : ''} vers le prochain`}
        </div>
      </div>

      {/* Fragment summary bar */}
      {(() => {
        const order = WORLD_ORDER[archetypeKey] || WORLD_ORDER.resilience
        const totalFrags = order.reduce((sum, wk) => sum + getWorldRealFragmentCount(wk), 0)
        const maxFrags = order.length * 5
        return totalFrags > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }}>
              <div style={{ height: '100%', width: `${Math.round((totalFrags / maxFrags) * 100)}%`, background: `linear-gradient(90deg, ${arch.color}66, ${arch.color})`, borderRadius: 1, boxShadow: `0 0 6px ${arch.color}55`, transition: 'width 1s ease' }} />
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: `rgba(${arch.rgb},0.55)`, letterSpacing: '0.16em', whiteSpace: 'nowrap' }}>{totalFrags} fragment{totalFrags !== 1 ? 's' : ''}</span>
          </div>
        ) : null
      })()}

      {/* Progress bar toward next world */}
      {daysToNext > 0 && (() => {
        const prevThreshold = WORLD_UNLOCK_DAYS[unlockedWorlds.length - 1] || 0
        const nextThreshold = WORLD_UNLOCK_DAYS[unlockedWorlds.length] || prevThreshold
        const progress = nextThreshold > prevThreshold ? (totalDays - prevThreshold) / (nextThreshold - prevThreshold) : 1
        const nextWorldKey = order[unlockedWorlds.length]
        const nextWorld = nextWorldKey ? WORLDS[nextWorldKey] : null
        return nextWorld ? (
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Prochain monde</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: `rgba(${nextWorld.rgb},0.60)` }}>{daysToNext} jour{daysToNext > 1 ? 's' : ''}</span>
            </div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>{nextWorld.name}</div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${Math.round(progress * 100)}%`, background: `linear-gradient(90deg, ${nextWorld.color}88, ${nextWorld.color})`, borderRadius: 2, boxShadow: `0 0 8px ${nextWorld.color}66`, transition: 'width 0.8s ease', animation: 'worldglow 4s cubic-bezier(0.45,0,0.55,1) infinite' }} />
            </div>
          </div>
        ) : null
      })()}

      {/* World cards */}
      {order.map((worldKey, idx) => {
        const isUnlocked = unlockedWorlds.includes(worldKey)
        const isHome = worldKey === homeWorldKey
        const daysToUnlock = isUnlocked ? 0 : Math.max(0, WORLD_UNLOCK_DAYS[idx] - totalDays)
        return (
          <WorldCard
            key={worldKey}
            worldKey={worldKey}
            archetypeKey={archetypeKey}
            isUnlocked={isUnlocked}
            isHome={isHome}
            daysToUnlock={daysToUnlock}
            onEnter={setSelectedWorld}
          />
        )
      })}

      {/* Footer */}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 12.5, color: 'rgba(255,255,255,0.55)', fontStyle: 'italic', lineHeight: 1.6, margin: 0, textShadow: '0 1px 8px rgba(0,0,0,0.55)' }}>
          Chaque jour de présence ouvre un peu plus<br />ton univers intérieur.
        </p>
      </div>

      {selectedWorld && <WorldDetailOverlay worldKey={selectedWorld} archetypeKey={archetypeKey} onClose={() => setSelectedWorld(null)} />}
    </div>
  )
}

function NavIconVoyage({ active, color }) {
  const c = active ? color : 'rgba(255,255,255,0.26)'
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M15.5 8.5L13 13l-4.5 2.5 2.5-4.5L15.5 8.5Z" stroke={c} strokeWidth="1.2" strokeLinejoin="round" fill={active ? color + '33' : 'none'} />
    </svg>
  )
}

function BottomNav({ tab, onChange, color, badges = {} }) {
  const tabs = [
    { key: 'home',     label: 'Accueil',  Icon: NavIconHome },
    { key: 'routines', label: 'Routines', Icon: NavIconRoutines },
    { key: 'voyage',   label: 'Voyage',   Icon: NavIconVoyage },
    { key: 'quetes',   label: 'Quêtes',   Icon: NavIconQuetes },
    { key: 'boutique', label: 'Boutique', Icon: NavIconBoutique },
  ]
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'linear-gradient(180deg, rgba(5,8,16,0.65) 0%, rgba(5,8,16,0.92) 100%)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: `1px solid ${color}18`, boxShadow: '0 -12px 40px rgba(5,8,16,0.7), 0 -1px 0 rgba(255,255,255,0.04)', display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(t => {
        const active = tab === t.key
        const badged = !active && !!badges[t.key]
        return (
          <button key={t.key} onClick={() => onChange(t.key)} style={{ flex: 1, padding: '13px 0 11px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, position: 'relative', minHeight: 62 }}>
            {active && <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 44, height: 44, borderRadius: '50%', background: `radial-gradient(circle, rgba(${color.length > 7 ? '99,102,241' : color.replace('#','').match(/.{2}/g).map(x=>parseInt(x,16)).join(',')},0.14) 0%, transparent 70%)`, pointerEvents: 'none', animation: 'presencePulse 4.5s cubic-bezier(0.45,0,0.55,1) infinite' }} />}
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: active ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.25s ease', animation: active ? 'animalbreathe 6s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 8s ease-in-out 3s infinite' : 'none' }}>
              <t.Icon active={active} color={color} />
              {badged && <span style={{ position: 'absolute', top: -1, right: -2, width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, opacity: 0.85, animation: 'seedPulse 3s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 5s ease-in-out 1s infinite' }} />}
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, letterSpacing: '0.09em', color: active ? color : 'rgba(255,255,255,0.42)', transition: 'color 0.25s ease', textTransform: 'uppercase', animation: active ? 'phrasebreathe 18s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 6s ease-in-out 2s infinite' : 'none' }}>{t.label}</span>
            <div style={{ width: active ? 26 : 3, height: active ? 2 : 1.5, borderRadius: 1, background: active ? `linear-gradient(90deg, ${color}88, ${color}, ${color}88)` : 'transparent', transition: 'all 0.3s ease', marginTop: 2, boxShadow: active ? `0 0 10px ${color}, 0 0 20px ${color}88, 0 0 35px ${color}44` : 'none', animation: active ? 'worldglow 5s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 4s ease-in-out 1s infinite' : 'none' }} />
          </button>
        )
      })}
    </div>
  )
}

// ─── BREATHING MODAL ──────────────────────────────────────────────────────────

function MoodSlider({ value, onChange, color, rgb }) {
  const labels = ['😔','😟','😐','🙂','✨']
  const labelTexts = ['Lourd','Bas','Neutre','Bien','Lumineux']
  const segIdx = Math.min(4, Math.floor((value - 1) / 2))
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', marginBottom: 14 }}>
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <button key={n} onClick={() => { haptic(4); onChange(n) }} aria-label={`Niveau ${n}`} style={{ flex: 1, height: 40, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, touchAction: 'manipulation' }}>
            <div style={{ width: n === value ? 16 : 6, height: n === value ? 16 : 6, borderRadius: '50%', background: n <= value ? color : 'rgba(255,255,255,0.18)', boxShadow: n === value ? `0 0 14px ${color}, 0 0 28px ${color}66` : (n <= value ? `0 0 6px ${color}88` : 'none'), transition: 'all 0.25s ease' }} />
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <span style={{ fontSize: 22, filter: `drop-shadow(0 0 10px ${color}88)` }}>{labels[segIdx]}</span>
        <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14, color: 'white', letterSpacing: '0.02em' }}>{labelTexts[segIdx]}</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 12, color: `rgba(${rgb},0.78)`, letterSpacing: '0.05em' }}>{`· ${value}/10`}</span>
      </div>
    </div>
  )
}

function BreathingModal({ archetypeKey, onClose }) {
  const arch = ARCHETYPES[archetypeKey]

  const TECHNIQUES = {
    resilience: {
      name: 'Souffle du Guerrier',
      subtitle: 'Box Breathing · 4·4·4·4',
      benefit: 'Calme le système nerveux. Aiguise la concentration. Utilisé par les Navy SEALs avant action.',
      bestFor: 'Avant un défi · stress aigu · moments tendus',
      phases: [
        { label: 'Inspire', dur: 4, expand: true,  hint: 'Par le nez, lentement' },
        { label: 'Retiens', dur: 4, expand: true,  hint: 'Garde le souffle plein' },
        { label: 'Expire',  dur: 4, expand: false, hint: 'Par la bouche, long' },
        { label: 'Repose',  dur: 4, expand: false, hint: 'Poumons vides, immobile' },
      ],
      totalCycles: 4, xp: 25,
    },
    presence: {
      name: "Souffle d'Ancrage",
      subtitle: '4-7-8 · Calmer · Dormir',
      benefit: "Active le parasympathique. Ralentit le rythme cardiaque. Aide profondément à s'endormir.",
      bestFor: 'Anxiété · ruminations · avant la nuit',
      phases: [
        { label: 'Inspire', dur: 4, expand: true,  hint: 'Par le nez, paisible' },
        { label: 'Retiens', dur: 7, expand: true,  hint: 'Tu es ancré·e' },
        { label: 'Expire',  dur: 8, expand: false, hint: 'Long, libérateur' },
      ],
      totalCycles: 4, xp: 25,
    },
    sagesse: {
      name: 'Cohérence Cardiaque',
      subtitle: '5·5 · Équilibrer',
      benefit: 'Synchronise cœur et respiration. Réduit le cortisol. Clarifie la pensée.',
      bestFor: 'Avant une décision · concentration · clarté',
      phases: [
        { label: 'Inspire', dur: 5, expand: true,  hint: 'Vague qui monte' },
        { label: 'Expire',  dur: 5, expand: false, hint: 'Vague qui descend' },
      ],
      totalCycles: 6, xp: 25,
    },
    lumiere: {
      name: 'Souffle Créateur',
      subtitle: '4·8 · Libérer',
      benefit: "Active la créativité. Détend le diaphragme. Libère l'expression intérieure.",
      bestFor: 'Bloc créatif · avant un projet · réveil',
      phases: [
        { label: 'Inspire', dur: 4, expand: true,  hint: 'Reçois pleinement' },
        { label: 'Expire',  dur: 8, expand: false, hint: 'Donne au monde' },
      ],
      totalCycles: 4, xp: 25,
    },
  }
  const tech = TECHNIQUES[archetypeKey] || TECHNIQUES.sagesse

  const [stage, setStage] = useState('intro')
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [cycle, setCycle] = useState(1)
  const [timeLeft, setTimeLeft] = useState(tech.phases[0].dur)
  const [isExpanded, setIsExpanded] = useState(false)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)
  const [moodStart, setMoodStart] = useState(5)
  const [moodEnd, setMoodEnd] = useState(7)
  const [sessionCount, setSessionCount] = useState(0)
  const stateRef = useRef({ phaseIdx: 0, cycle: 1, timeLeft: tech.phases[0].dur, paused: false })

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30)
    try { setSessionCount(parseInt(localStorage.getItem('neya_breath_count') || '0', 10)) } catch {}
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (stage !== 'active') return
    const interval = setInterval(() => {
      const st = stateRef.current
      if (st.paused) return
      if (st.timeLeft <= 1) {
        const nextIdx = (st.phaseIdx + 1) % tech.phases.length
        const isNewCycle = nextIdx === 0
        const nextCycle = isNewCycle ? st.cycle + 1 : st.cycle
        if (isNewCycle && st.cycle >= tech.totalCycles) {
          stateRef.current = { ...st, timeLeft: 0 }
          haptic([10, 60, 10, 60, 10]); addXP(tech.xp)
          try {
            const cur = parseInt(localStorage.getItem('neya_breath_count') || '0', 10) + 1
            localStorage.setItem('neya_breath_count', String(cur))
            const sessions = JSON.parse(localStorage.getItem('neya_breath_sessions') || '[]')
            sessions.push({ ts: Date.now(), tech: archetypeKey, moodStart, name: tech.name })
            localStorage.setItem('neya_breath_sessions', JSON.stringify(sessions.slice(-50)))
            setSessionCount(cur)
          } catch {}
          setStage('outro'); return
        }
        const np = tech.phases[nextIdx]
        stateRef.current = { ...st, phaseIdx: nextIdx, cycle: nextCycle, timeLeft: np.dur }
        setPhaseIdx(nextIdx); setCycle(nextCycle); setTimeLeft(np.dur); setIsExpanded(np.expand)
        haptic(6)
        try {
          if (np.expand && np.label.toLowerCase().includes('inspire')) playBreathIn(np.dur)
          else if (!np.expand && np.label.toLowerCase().includes('expire')) playBreathOut(np.dur)
        } catch {}
      } else {
        stateRef.current = { ...st, timeLeft: st.timeLeft - 1 }
        setTimeLeft(prev => prev - 1)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [stage])

  const startSession = () => {
    haptic([10, 40, 10])
    setStage('active')
    setTimeout(() => {
      setIsExpanded(tech.phases[0].expand)
      try {
        const p0 = tech.phases[0]
        if (p0.expand && p0.label.toLowerCase().includes('inspire')) playBreathIn(p0.dur)
      } catch {}
    }, 100)
  }
  const togglePause = () => {
    haptic(8)
    setPaused(p => {
      const next = !p
      stateRef.current = { ...stateRef.current, paused: next }
      return next
    })
  }
  const finishOutro = () => {
    haptic(12)
    try {
      const sessions = JSON.parse(localStorage.getItem('neya_breath_sessions') || '[]')
      if (sessions.length > 0) {
        sessions[sessions.length - 1].moodEnd = moodEnd
        localStorage.setItem('neya_breath_sessions', JSON.stringify(sessions))
        localStorage.setItem('neya_mood_last', String(moodEnd))
      }
      const lastSession = sessions[sessions.length - 1]
      if (lastSession) {
        const durS = Math.max(0, Math.round(((lastSession.ts ? Date.now() - lastSession.ts : 0)) / 1000))
        trackBreathComplete(archetypeKey, durS, moodStart, moodEnd)
      }
      addSouvenir('first_breath')
      if (moodEnd > moodStart) addSouvenir('first_mood_lift', { delta: moodEnd - moodStart })
    } catch {}
    onClose()
  }

  const currentPhase = tech.phases[phaseIdx]
  const moodDelta = moodEnd - moodStart

  const backdrop = (
    <>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 38%, rgba(${arch.rgb},0.10) 0%, transparent 65%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 90%, rgba(${arch.rgb},0.07) 0%, transparent 60%)`, pointerEvents: 'none' }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {[{x:8,y:18,r:1.6,dur:30,del:0},{x:90,y:24,r:1.2,dur:36,del:4.2},{x:18,y:78,r:1.8,dur:26,del:2.6},{x:78,y:70,r:1.4,dur:34,del:7.1},{x:48,y:88,r:1.0,dur:32,del:3.4},{x:88,y:46,r:1.6,dur:28,del:5.8}].map((m,i)=>(
          <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: 0.08, animation: `splashmote ${m.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
        ))}
      </svg>
    </>
  )

  if (stage === 'intro') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(5,8,16,0.98)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', opacity: visible ? 1 : 0, transition: 'opacity 360ms cubic-bezier(0,0,0.2,1)', overflowY: 'auto', animation: visible ? 'modalEnter 440ms cubic-bezier(0.16,1.36,0.32,1) both' : 'none' }}>
        {backdrop}
        <button data-press="true" onClick={onClose} style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', right: 22, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '9px 18px', color: 'rgba(255,255,255,0.62)', fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: '0.10em', cursor: 'pointer', zIndex: 10, minHeight: 44 }} aria-label="Fermer">Fermer</button>
        <div style={{ position: 'relative', zIndex: 1, padding: 'calc(env(safe-area-inset-top, 0px) + 72px) 28px 40px', display: 'flex', flexDirection: 'column', gap: 22, minHeight: '100%', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: arch.color, letterSpacing: '0.32em', textTransform: 'uppercase', margin: '0 0 14px', animation: 'signaturePulse 14s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 14px ${arch.color}66` }}>◈ Exercice de souffle</p>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 400, fontSize: 26, color: 'white', margin: 0, lineHeight: 1.22, textShadow: `0 0 32px ${arch.color}33` }}>{tech.name}</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: `rgba(${arch.rgb},0.85)`, margin: '8px 0 0', letterSpacing: '0.05em' }}>{tech.subtitle}</p>
          </div>

          <div style={{ background: `rgba(${arch.rgb},0.08)`, border: `1px solid ${arch.color}33`, borderRadius: 14, padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: arch.color, letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 8px' }}>Ce que tu vas ressentir</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14.5, color: 'rgba(255,255,255,0.86)', margin: 0, lineHeight: 1.6 }}>{tech.benefit}</p>
            </div>
            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${arch.color}33, transparent)` }} />
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: arch.color, letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 8px' }}>Idéal pour</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13.5, color: 'rgba(255,255,255,0.72)', margin: 0, lineHeight: 1.55 }}>{tech.bestFor}</p>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 18px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>Comment tu te sens là ?</p>
            <MoodSlider value={moodStart} onChange={setMoodStart} color={arch.color} rgb={arch.rgb} />
          </div>

          {sessionCount > 0 && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: `${arch.color}aa`, textAlign: 'center', margin: 0, letterSpacing: '0.08em', textShadow: `0 0 14px ${arch.color}33` }}>
              {`✦ ${sessionCount} session${sessionCount > 1 ? 's' : ''} de souffle accomplie${sessionCount > 1 ? 's' : ''}`}
            </p>
          )}

          <button data-press="true" onClick={startSession} style={{ width: '100%', padding: '18px 0', background: `linear-gradient(135deg, rgba(${arch.rgb},0.95), rgba(${arch.rgb},0.78))`, border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 600, letterSpacing: '0.24em', color: 'white', textTransform: 'uppercase', boxShadow: `0 6px 36px rgba(${arch.rgb},0.45), 0 0 60px rgba(${arch.rgb},0.20)`, animation: 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: '0 0 14px rgba(255,255,255,0.35)', minHeight: 54 }}>
            Commencer
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'active') {
    const circleScale = isExpanded ? 1 : 0.36
    const circleDur = currentPhase.dur
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,8,16,0.98)', opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease', overflow: 'hidden' }}>
        {backdrop}
        <button onClick={() => { haptic(6); onClose() }} style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', right: 22, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '9px 18px', color: 'rgba(255,255,255,0.62)', fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: '0.10em', cursor: 'pointer', zIndex: 10, minHeight: 44 }} aria-label="Arrêter la respiration">Arrêter</button>
        <button data-press="true" onClick={togglePause} style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', left: 22, background: paused ? `rgba(${arch.rgb},0.18)` : 'rgba(255,255,255,0.06)', border: `1px solid ${paused ? arch.color + '66' : 'rgba(255,255,255,0.10)'}`, borderRadius: 100, padding: '9px 18px', color: paused ? arch.color : 'rgba(255,255,255,0.62)', fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: '0.10em', cursor: 'pointer', zIndex: 10, minHeight: 36, transition: 'all 0.3s ease' }} aria-label={paused ? 'Reprendre la respiration' : 'Mettre la respiration en pause'}>{paused ? 'Reprendre' : 'Pause'}</button>

        <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 80px)', left: 0, right: 0, textAlign: 'center', padding: '0 80px', zIndex: 4 }}>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 13, color: `rgba(${arch.rgb},0.95)`, letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0, animation: 'phrasebreathe 8s cubic-bezier(0.45,0,0.55,1) infinite' }}>{tech.name}</p>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 78 }}>
          <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: `radial-gradient(circle, rgba(${arch.rgb},0.10) 0%, transparent 65%)`, transform: `scale(${isExpanded ? 1.20 : 0.40})`, transition: `transform ${circleDur}s cubic-bezier(0.4,0,0.2,1)`, pointerEvents: 'none', filter: 'blur(2px)' }} />
          <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', border: `1px solid rgba(${arch.rgb},0.10)`, transform: `scale(${isExpanded ? 1.18 : 0.44})`, transition: `transform ${circleDur}s cubic-bezier(0.4,0,0.2,1)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 230, height: 230, borderRadius: '50%', border: `1px solid rgba(${arch.rgb},0.38)`, transform: `scale(${isExpanded ? 1.10 : 0.40})`, transition: `transform ${circleDur}s cubic-bezier(0.4,0,0.2,1)`, pointerEvents: 'none' }} />
          <div style={{ width: 190, height: 190, borderRadius: '50%', background: `radial-gradient(circle at 50% 40%, rgba(${arch.rgb},0.42) 0%, rgba(${arch.rgb},0.18) 50%, rgba(${arch.rgb},0.05) 85%, transparent 100%)`, border: `1.5px solid rgba(${arch.rgb},0.50)`, transform: `scale(${circleScale})`, transition: `transform ${circleDur}s cubic-bezier(0.4,0,0.2,1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 80px rgba(${arch.rgb},0.22), inset 0 0 38px rgba(${arch.rgb},0.10), inset 0 2px 0 rgba(255,255,255,0.06)`, position: 'relative' }}>
            <div style={{ position: 'absolute', width: 56, height: 56, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,255,255,0.36) 0%, transparent 65%)`, animation: 'animalbreathe 6s cubic-bezier(0.45,0,0.55,1) infinite' }} />
            <svg width="44" height="44" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.85, position: 'relative' }}>
              <circle cx="24" cy="24" r="18" stroke={arch.color} strokeWidth="0.8" opacity="0.45" />
              <path d="M10 24 C14 16, 20 16, 24 24 C28 32, 34 32, 38 24" stroke={arch.color} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.92" />
            </svg>
          </div>
        </div>

        <div style={{ textAlign: 'center', minHeight: 144, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 5, position: 'relative' }}>
          <div key={`${phaseIdx}-${cycle}`} style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 30, color: 'white', letterSpacing: '-0.02em', animation: 'fadeIn 0.45s ease', textShadow: `0 0 24px ${arch.color}55` }}>{currentPhase.label}</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 200, fontSize: 54, color: `rgba(${arch.rgb},0.92)`, marginTop: 2, letterSpacing: '-0.06em', lineHeight: 1, textShadow: `0 0 30px ${arch.color}55` }}>{timeLeft}</div>
          {currentPhase.hint && <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 12.5, color: 'rgba(255,255,255,0.55)', marginTop: 10, fontStyle: 'italic', letterSpacing: '0.04em' }}>{currentPhase.hint}</div>}
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 11, color: 'rgba(255,255,255,0.42)', marginTop: 14, letterSpacing: '0.16em' }}>{`Cycle ${cycle} / ${tech.totalCycles}`}</div>
        </div>

        <div style={{ display: 'flex', gap: 8, position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 60px)', zIndex: 5 }}>
          {tech.phases.map((p, i) => (
            <div key={i} style={{ width: i === phaseIdx ? 22 : 6, height: 6, borderRadius: 3, background: i === phaseIdx ? `rgba(${arch.rgb},0.88)` : 'rgba(255,255,255,0.14)', transition: 'all 0.5s ease', boxShadow: i === phaseIdx ? `0 0 10px ${arch.color}88` : 'none' }} />
          ))}
        </div>

        <div style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 30px)', left: 32, right: 32, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1, overflow: 'hidden', zIndex: 5 }}>
          <div style={{ height: '100%', width: `${((cycle - 1 + (phaseIdx / tech.phases.length)) / tech.totalCycles) * 100}%`, background: `linear-gradient(90deg, ${arch.color}88, ${arch.color})`, borderRadius: 1, transition: 'width 0.5s ease', boxShadow: `0 0 8px ${arch.color}99` }} />
        </div>

        {paused && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,16,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, animation: 'fadeIn 0.3s ease' }}>
            <div style={{ textAlign: 'center', padding: 32, animation: 'phrasebreathe 6s cubic-bezier(0.45,0,0.55,1) infinite' }}>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 22, color: arch.color, margin: 0, letterSpacing: '0.04em' }}>En pause</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.62)', margin: '10px 0 0' }}>Reprends quand tu veux.</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(5,8,16,0.98)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease', overflowY: 'auto' }}>
      {backdrop}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
        {[{x:18,y:24,r:2.4,del:0},{x:82,y:32,r:2.0,del:0.3},{x:30,y:72,r:2.6,del:0.6},{x:74,y:80,r:1.8,del:0.9},{x:50,y:14,r:2.2,del:1.2},{x:88,y:60,r:2.0,del:1.5},{x:12,y:54,r:1.6,del:1.8},{x:60,y:90,r:2.4,del:0.5}].map((m,i)=>(
          <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: 0, animation: `milestoneMote ${2.2 + i * 0.15}s ease-out ${m.del}s both`, filter: `drop-shadow(0 0 6px ${arch.color}99)` }} />
        ))}
      </svg>
      <div style={{ position: 'relative', zIndex: 3, padding: 'calc(env(safe-area-inset-top, 0px) + 56px) 28px 40px', display: 'flex', flexDirection: 'column', gap: 22, minHeight: '100%', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.7s ease' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: arch.color, letterSpacing: '0.32em', textTransform: 'uppercase', margin: '0 0 14px', animation: 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite, phrasebreathe 14s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 16px ${arch.color}88` }}>✦ Souffle accompli</p>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 28, color: 'white', margin: 0, letterSpacing: '-0.01em', textShadow: `0 0 28px ${arch.color}44`, animation: 'phrasebreathe 10s cubic-bezier(0.45,0,0.55,1) infinite' }}>Tu es là, pleinement.</h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', animation: 'fadeIn 1s ease 0.3s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: `rgba(${arch.rgb},0.16)`, border: `1px solid ${arch.color}55`, borderRadius: 100, padding: '9px 20px', animation: 'chipPop 520ms cubic-bezier(0.34,1.56,0.64,1) both, milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) 0.5s infinite', boxShadow: `0 0 24px rgba(${arch.rgb},0.25)` }}>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 13, color: arch.color, letterSpacing: '-0.01em', textShadow: `0 0 14px ${arch.color}88` }}>{`+${tech.xp}`}</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: `${arch.color}cc`, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{`XP · ${sessionCount}${sessionCount === 1 ? 're' : 'e'} session`}</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 18px', animation: 'fadeIn 1s ease 0.6s both' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>Et maintenant ?</p>
          <MoodSlider value={moodEnd} onChange={setMoodEnd} color={arch.color} rgb={arch.rgb} />
          {moodDelta !== 0 && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: moodDelta > 0 ? arch.color : 'rgba(255,255,255,0.55)', textAlign: 'center', margin: '14px 0 0', letterSpacing: '0.05em', textShadow: moodDelta > 0 ? `0 0 14px ${arch.color}66` : 'none' }}>
              {moodDelta > 0 ? `+${moodDelta} · Tu t'es offert un mieux-être` : `${moodDelta} · Reste avec ce qui est`}
            </p>
          )}
        </div>

        <button data-press="true" onClick={finishOutro} style={{ width: '100%', padding: '18px 0', background: `linear-gradient(135deg, rgba(${arch.rgb},0.95), rgba(${arch.rgb},0.78))`, border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 600, letterSpacing: '0.24em', color: 'white', textTransform: 'uppercase', boxShadow: `0 6px 36px rgba(${arch.rgb},0.45), 0 0 60px rgba(${arch.rgb},0.20)`, animation: 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite, fadeIn 1s ease 0.9s both', textShadow: '0 0 14px rgba(255,255,255,0.35)', minHeight: 54 }}>
          Continuer ✦
        </button>
      </div>
    </div>
  )
}

// ─── PERSONALIZATION MODAL ────────────────────────────────────────────────────

function PersonalizationModal({ archetypeKey, onClose }) {
  const arch = ARCHETYPES[archetypeKey]
  const [prenom, setPrenom] = useState(() => { try { return localStorage.getItem('neya_prenom') || '' } catch { return '' } })
  const [mantra, setMantra] = useState(() => { try { return localStorage.getItem('neya_mantra') || '' } catch { return '' } })
  const [coconName, setCoconName] = useState(() => { try { return localStorage.getItem('neya_cocon_name') || '' } catch { return '' } })
  const [audioOn, setAudioOn] = useState(() => getAudioEnabled())
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 40); return () => clearTimeout(t) }, [])

  const save = () => {
    try {
      prenom.trim() ? localStorage.setItem('neya_prenom', prenom.trim()) : localStorage.removeItem('neya_prenom')
      mantra.trim() ? localStorage.setItem('neya_mantra', mantra.trim().slice(0, 120)) : localStorage.removeItem('neya_mantra')
      coconName.trim() ? localStorage.setItem('neya_cocon_name', coconName.trim()) : localStorage.removeItem('neya_cocon_name')
    } catch {}
    haptic([8, 60, 8]); onClose()
  }

  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(${arch.rgb},0.28)`, borderRadius: 12, padding: '14px 16px', color: 'rgba(255,255,255,0.90)', fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 16, outline: 'none', letterSpacing: '0.02em', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.3s ease, box-shadow 0.3s ease' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 820, opacity: vis ? 1 : 0, transition: 'opacity 320ms cubic-bezier(0,0,0.2,1)', background: 'rgba(5,8,16,0.97)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: 'calc(env(safe-area-inset-top, 0px) + 40px) 28px calc(env(safe-area-inset-bottom, 0px) + 40px)', overflowY: 'auto', animation: vis ? 'modalEnter 380ms cubic-bezier(0.16,1.36,0.32,1) both' : 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, rgba(${arch.rgb},0.07) 0%, transparent 65%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: `rgba(${arch.rgb},0.62)`, letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: 10, animation: 'phrasebreathe 12s cubic-bezier(0.45,0,0.55,1) infinite' }}>Mon Cocon</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 23, letterSpacing: '-0.01em', background: `linear-gradient(135deg, rgba(255,255,255,0.95), ${arch.color}cc)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Personnalise ton espace</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: 'rgba(255,255,255,0.46)', marginTop: 8, lineHeight: 1.5 }}>Ces détails ne sont visibles que par toi.</div>
        </div>

        {/* Prénom */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: `rgba(${arch.rgb},0.58)`, letterSpacing: '0.20em', textTransform: 'uppercase' }}>Ton prénom</label>
          <input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Comment tu t'appelles ?" maxLength={30} style={inputStyle} />
        </div>

        {/* Mantra */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: `rgba(${arch.rgb},0.58)`, letterSpacing: '0.20em', textTransform: 'uppercase' }}>Ton mantra <span style={{ opacity: 0.40, fontSize: 8.5 }}>· facultatif</span></label>
          <textarea value={mantra} onChange={e => setMantra(e.target.value)} placeholder="Une phrase qui t'appartient..." maxLength={120} rows={2} style={{ ...inputStyle, fontFamily: 'Inter, sans-serif', fontSize: 14, resize: 'none', lineHeight: 1.65 }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.55)', textAlign: 'right' }}>{mantra.length}/120</span>
        </div>

        {/* Nom du cocon */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: `rgba(${arch.rgb},0.58)`, letterSpacing: '0.20em', textTransform: 'uppercase' }}>Nom de ton cocon</label>
          <input value={coconName} onChange={e => setCoconName(e.target.value)} placeholder="Mon Cocon Néya" maxLength={40} style={inputStyle} />
        </div>

        {/* Sons doux toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: `rgba(${arch.rgb},0.58)`, letterSpacing: '0.20em', textTransform: 'uppercase' }}>Sons doux <span style={{ opacity: 0.40, fontSize: 8.5 }}>· facultatif</span></label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(${arch.rgb},0.28)`, borderRadius: 12, padding: '14px 16px' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.78)', fontStyle: 'italic', lineHeight: 1.4 }}>Toucher, souvenir, souffle. Subtil, jamais envahissant.</span>
            <button onClick={() => { const next = !audioOn; setAudioOn(next); setAudioEnabled(next); if (next) { try { playConfirm() } catch {} } }} aria-label={audioOn ? 'Désactiver les sons' : 'Activer les sons'} role="switch" aria-checked={audioOn} style={{ width: 44, height: 26, borderRadius: 100, background: audioOn ? `rgba(${arch.rgb},0.85)` : 'rgba(255,255,255,0.10)', border: `1px solid ${audioOn ? arch.color + 'aa' : 'rgba(255,255,255,0.15)'}`, position: 'relative', cursor: 'pointer', flexShrink: 0, marginLeft: 14, transition: 'background 240ms cubic-bezier(0.4,0,0.2,1), border-color 240ms cubic-bezier(0.4,0,0.2,1)', boxShadow: audioOn ? `0 0 14px rgba(${arch.rgb},0.40)` : 'none' }}>
              <div style={{ position: 'absolute', top: 2, left: audioOn ? 20 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.3)', transition: 'left 280ms cubic-bezier(0.34,1.56,0.64,1)' }} />
            </button>
          </div>
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px 0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, color: 'rgba(255,255,255,0.42)', fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: '0.10em', cursor: 'pointer' }} aria-label="Annuler les changements">Annuler</button>
          <button onClick={save} style={{ flex: 2, padding: '14px 0', background: `rgba(${arch.rgb},0.18)`, border: `1px solid rgba(${arch.rgb},0.55)`, borderRadius: 100, color: 'rgba(255,255,255,0.92)', fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 13, letterSpacing: '0.16em', cursor: 'pointer', boxShadow: `0 0 24px rgba(${arch.rgb},0.24)`, animation: 'milestoneGlow 4.5s cubic-bezier(0.45,0,0.55,1) infinite', position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'relative', zIndex: 1 }}>Enregistrer</span>
            <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmerPass 3s cubic-bezier(0.45,0,0.55,1) infinite', borderRadius: 'inherit', pointerEvents: 'none' }} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── INVITATION CARD ──────────────────────────────────────────────────────────

function InvitationCard({ archetypeKey, onXp }) {
  const arch = ARCHETYPES[archetypeKey]
  const [done, setDone] = useState(isTodayInvitationDone)
  const invitation = getTodayInvitation()
  return (
    <div style={{ background: done ? `linear-gradient(rgba(5,8,16,0.7),rgba(5,8,16,0.7)) padding-box, linear-gradient(135deg,${arch.color}44,transparent 40%,${arch.color}28) border-box` : `rgba(255,255,255,0.04)`, border: done ? '1px solid transparent' : `1px solid rgba(${arch.rgb},0.18)`, borderRadius: 14, padding: '16px 18px', animation: 'fadeIn 0.6s ease 0.3s both', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', transition: 'all 0.5s ease', boxShadow: done ? `0 0 24px rgba(${arch.rgb},0.12)` : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: `rgba(${arch.rgb},0.65)`, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 7, animation: 'phrasebreathe 18s cubic-bezier(0.45,0,0.55,1) infinite' }}>Invitation du jour</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14, color: done ? `rgba(${arch.rgb},0.75)` : 'rgba(255,255,255,0.80)', lineHeight: 1.6, fontStyle: 'italic', transition: 'color 0.4s ease', animation: 'phrasebreathe 40s cubic-bezier(0.45,0,0.55,1) infinite' }}>"{invitation}"</div>
        </div>
        {!done ? (
          <button onClick={() => { haptic([6,40,6]); completeTodayInvitation(); setDone(true); if (onXp) onXp(20) }} style={{ flexShrink: 0, marginTop: 2, width: 32, height: 32, borderRadius: '50%', background: `rgba(${arch.rgb},0.12)`, border: `1px solid rgba(${arch.rgb},0.35)`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: arch.color, boxShadow: `0 0 14px rgba(${arch.rgb},0.18)`, animation: 'animalbreathe 8s cubic-bezier(0.45,0,0.55,1) infinite' }}>✓</button>
        ) : (
          <span style={{ fontSize: 14, color: arch.color, flexShrink: 0, marginTop: 4, animation: 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 12px ${arch.color}88` }}>✦</span>
        )}
      </div>
      {done && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: `rgba(${arch.rgb},0.45)`, letterSpacing: '0.12em', marginTop: 8, animation: 'fadeIn 0.6s ease both' }}>+20 XP · Invitation accomplie</div>}
    </div>
  )
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────

function HomeScreen({ archetypeKey, routinesDone, quetesDone, onRestart, onOpenVrai, onChangeTab, savedAt, showXpToast }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  const [intentionReady, setIntentionReady] = useState(false)
  const [ringReady, setRingReady] = useState(false)
  const [intentionIdx, setIntentionIdx] = useState(() => {
    try { return parseInt(localStorage.getItem(`neya_intentionIdx_${archetypeKey}`) || '0', 10) } catch { return 0 }
  })
  const [intentionFade, setIntentionFade] = useState(true)
  const [cycleSpin, setCycleSpin] = useState(false)
  const [intentionParticles, setIntentionParticles] = useState(false)
  const [ringTap, setRingTap] = useState(false)
  const [completeBurst, setCompleteBurst] = useState(false)
  const [showPresenceToast, setShowPresenceToast] = useState(false)
  const [restartPending, setRestartPending] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)
  const [showCocon, setShowCocon] = useState(false)
  const [showPersonalize, setShowPersonalize] = useState(false)
  const [showTrace, setShowTrace] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showLiberation, setShowLiberation] = useState(false)
  const [showApaisement, setShowApaisement] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCarnet, setShowCarnet] = useState(false)
  const [prenom, setPrenom] = useState(() => { try { return localStorage.getItem('neya_prenom') || '' } catch { return '' } })
  const [mantra, setMantra] = useState(() => { try { return localStorage.getItem('neya_mantra') || '' } catch { return '' } })
  const [coconName, setCoconName] = useState(() => { try { return localStorage.getItem('neya_cocon_name') || '' } catch { return '' } })
  // Re-sync depuis localStorage quand PersonalizationModal se ferme
  useEffect(() => {
    if (!showPersonalize) {
      try {
        setPrenom(localStorage.getItem('neya_prenom') || '')
        setMantra(localStorage.getItem('neya_mantra') || '')
        setCoconName(localStorage.getItem('neya_cocon_name') || '')
      } catch {}
    }
  }, [showPersonalize])
  const prevJourComplete = useRef(false)
  const restartTimer = useRef(null)

  const handleRestartClick = () => {
    if (restartPending) {
      clearTimeout(restartTimer.current)
      haptic(10); onRestart()
    } else {
      haptic(8); setRestartPending(true)
      restartTimer.current = setTimeout(() => setRestartPending(false), 3000)
    }
  }

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
    setCycleSpin(true)
    setIntentionParticles(true)
    setTimeout(() => setCycleSpin(false), 420)
    setTimeout(() => setIntentionParticles(false), 1100)
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
  const streak = getCurrentStreak()
  const totalDone = getTotalRoutinesDone()
  const presenceProgress = ringReady ? getPresenceProgress(savedAt, routinesDone, quetesDone, arch) : 0

  const MILESTONES_BASE = { 3: 'Trois jours. Quelque chose commence à prendre forme.', 5: 'Cinq jours. Tu es là, et ça compte.', 7: 'Sept jours de présence. Quelque chose prend racine.', 14: 'Deux semaines — tu construis quelque chose de réel.', 21: '21 jours, ton rythme prend forme.', 30: 'Un mois de présence — ta constance est belle.', 45: 'Quarante-cinq jours. Tu t\'ancres en profondeur.', 60: 'Deux mois. Tu avances avec profondeur.', 90: 'Trois mois. Ce que tu construis est vrai.', 100: 'Cent jours. Ta lumière est durable.' }
  const MILESTONES_ARCH = {
    resilience: { 3: 'Trois jours. Ton feu commence à brûler.', 7: 'Sept jours. Ton Phénix prend racine.', 14: 'Deux semaines — ta flamme est réelle.', 30: 'Un mois. Ton feu est devenu une force.', 60: 'Deux mois. Tu as transformé la durée en puissance.', 100: 'Cent jours de feu. Rien ne peut l\'éteindre.' },
    presence:   { 3: 'Trois jours. Ton eau commence à couler.', 7: 'Sept jours. Ton Cerf te guide en profondeur.', 14: 'Deux semaines — ton ancrage est réel.', 30: 'Un mois. Ta présence est devenue une force.', 60: 'Deux mois. Tu vis vraiment ce que tu traverses.', 100: 'Cent jours de présence. Tu es l\'eau qui demeure.' },
    sagesse:    { 3: 'Trois jours. Ta brume commence à parler.', 7: 'Sept jours. Ton Loup te guide dans le silence.', 14: 'Deux semaines — ta profondeur prend forme.', 30: 'Un mois. Ta sagesse est devenue une force.', 60: 'Deux mois. Tu vois ce que peu osent regarder.', 100: 'Cent jours de brume. Tu perçois l\'invisible.' },
    lumiere:    { 3: 'Trois jours. Ta lumière commence à rayonner.', 7: 'Sept jours. Ton Ours illumine ton chemin.', 14: 'Deux semaines — ta créativité est réelle.', 30: 'Un mois. Ta lumière est devenue une force.', 60: 'Deux mois. Tu crées là où tu passes.', 100: 'Cent jours de lumière. Tu es une source.' },
  }
  const MILESTONES = { ...MILESTONES_BASE, ...(MILESTONES_ARCH[archetypeKey] || {}) }
  const FIRST_DAY_MSGS = {
    resilience: 'Ton feu commence ici.',
    presence:   'Ton espace commence ici.',
    sagesse:    'Ta brume commence ici.',
    lumiere:    'Ta lumière commence ici.',
  }
  const returningMsg = () => {
    if (days <= 0) return FIRST_DAY_MSGS[archetypeKey] || 'Ton voyage commence ici.'
    if (MILESTONES[days]) return MILESTONES[days]
    const day1Msg = { resilience: 'Tu es revenu·e. Le feu est intact.', presence: 'Tu es revenu·e. L\'espace t\'attendait.', sagesse: 'Tu es revenu·e. La brume s\'éclaire.', lumiere: 'Tu es revenu·e. La lumière continue.' }[archetypeKey]
    if (days === 1) return day1Msg || 'Tu es revenu·e. C\'est bien.'
    const short = { resilience: `${days} jours. Ton feu brûle.`, presence: `${days} jours. Tu t'ancres.`, sagesse: `${days} jours. Ta brume prend forme.`, lumiere: `${days} jours. Ta lumière grandit.` }[archetypeKey]
    if (days < 7) return short || `${days} jours. Tu construis quelque chose.`
    const mid = { resilience: `${days} jours de feu — tu avances.`, presence: `${days} jours de présence — c'est réel.`, sagesse: `${days} jours de sagesse — c'est réel.`, lumiere: `${days} jours de lumière — c'est réel.` }[archetypeKey]
    if (days < 30) return mid || `${days} jours ensemble — c'est réel.`
    const long = { resilience: `${days} jours. Ton feu est une constance.`, presence: `${days} jours. Ta présence est une constance.`, sagesse: `${days} jours. Ta sagesse est une constance.`, lumiere: `${days} jours. Ta lumière est une constance.` }[archetypeKey]
    return long || `${days} jours. Ta constance est belle.`
  }
  const msg = returningMsg()
  const isMilestone = days > 0 && !!MILESTONES[days]
  const jourComplète = routinesCount === arch.routines.length && quetesCount > 0

  useEffect(() => {
    if (jourComplète && !prevJourComplete.current) {
      haptic([20, 50, 20, 50, 40])
      setCompleteBurst(true)
      setTimeout(() => setCompleteBurst(false), 1800)
    }
    prevJourComplete.current = jourComplète
  }, [jourComplète])

  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '52px 22px calc(env(safe-area-inset-bottom, 0px) + 110px)', display: 'flex', flexDirection: 'column', gap: 16, opacity: vis ? 1 : 0, transition: 'opacity 0.6s ease', position: 'relative' }}>

      {/* World ambient layer */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}>
        {archetypeKey === 'resilience' && [
          { x: 15, del: 0, dur: 14 }, { x: 35, del: 3.2, dur: 18 }, { x: 55, del: 6.8, dur: 12 },
          { x: 72, del: 1.5, dur: 16 }, { x: 88, del: 9.1, dur: 15 },
        ].map((e, i) => (
          <div key={`ha${i}`} style={{ position: 'absolute', bottom: '8%', left: `${e.x}%`, width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', opacity: 0.22, animation: `emberRise ${e.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${e.del}s`, filter: 'blur(0.5px)' }} />
        ))}
        {archetypeKey === 'presence' && [
          { sz: 120, del: 0, dur: 6 }, { sz: 200, del: 2.2, dur: 8 }, { sz: 290, del: 4.8, dur: 10 },
        ].map((r, i) => (
          <div key={`hr${i}`} style={{ position: 'absolute', bottom: '6%', left: '50%', transform: 'translateX(-50%)', width: r.sz, height: r.sz, borderRadius: '50%', border: '1px solid rgba(20,184,166,0.28)', opacity: 0, animation: `waterRing ${r.dur}s ease-out infinite`, animationDelay: `${r.del}s` }} />
        ))}
        {archetypeKey === 'sagesse' && [
          { y: 30, del: 0, dur: 22 }, { y: 55, del: 6, dur: 28 }, { y: 75, del: 13, dur: 24 },
        ].map((m, i) => (
          <div key={`hm${i}`} style={{ position: 'absolute', top: `${m.y}%`, left: 0, right: 0, height: 40, background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.06), transparent)', animation: `mistDrift ${m.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
        ))}
        {archetypeKey === 'lumiere' && [
          { x: 20, del: 0, dur: 14 }, { x: 50, del: 5, dur: 18 }, { x: 78, del: 9, dur: 12 },
        ].map((g, i) => (
          <div key={`hg${i}`} style={{ position: 'absolute', top: 0, left: `${g.x}%`, width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '70px solid rgba(236,72,153,0.05)', opacity: 0, animation: `godRay ${g.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${g.del}s`, filter: 'blur(4px)' }} />
        ))}
      </div>

      {/* Cocon items ambiance — items placés par l'utilisateur */}
      {(() => {
        let coconPlaced = []
        try { coconPlaced = JSON.parse(localStorage.getItem('neya_cocon_placed') || '[]') } catch {}
        if (!coconPlaced.length) return null
        return (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
            {/* Bougie — flamme douce en bas */}
            {coconPlaced.includes('bougie') && [
              { x: 22, del: 0, dur: 8 }, { x: 50, del: 2.8, dur: 11 }, { x: 78, del: 5.4, dur: 9 },
            ].map((e, i) => (
              <div key={`cb${i}`} style={{ position: 'absolute', bottom: '12%', left: `${e.x}%`, width: 4, height: 4, borderRadius: '50%', background: '#f59e0b', opacity: 0.14, animation: `emberRise ${e.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${e.del}s`, filter: 'blur(1px)' }} />
            ))}
            {/* Cristal — rayons légers */}
            {coconPlaced.includes('cristal') && [
              { x: 30, dur: 16, del: 0 }, { x: 65, dur: 20, del: 7 },
            ].map((r, i) => (
              <div key={`cc${i}`} style={{ position: 'absolute', top: 0, left: `${r.x}%`, width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `60px solid rgba(${arch.rgb},1)`, opacity: 0, animation: `godRay ${r.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${r.del}s`, filter: 'blur(6px)' }} />
            ))}
            {/* Plante — motes vertes flottantes */}
            {coconPlaced.includes('plante') && [
              { x: 15, y: 60, dur: 22, del: 0 }, { x: 85, y: 45, dur: 28, del: 6 }, { x: 48, y: 72, dur: 18, del: 11 },
            ].map((p, i) => (
              <div key={`cp${i}`} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, width: 4, height: 4, borderRadius: '50%', background: '#14b8a6', opacity: 0.10, animation: `splashmote ${p.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${p.del}s`, filter: 'blur(0.5px)' }} />
            ))}
            {/* Totem — glow animal fantôme */}
            {coconPlaced.includes('totem') && (
              <div style={{ position: 'absolute', bottom: '-5%', left: '50%', transform: 'translateX(-50%)', opacity: 0.04, filter: `blur(4px) drop-shadow(0 0 20px ${arch.color})`, animation: 'animalfloat 40s cubic-bezier(0.45,0,0.55,1) infinite, animalbreathe 60s cubic-bezier(0.45,0,0.55,1) infinite', pointerEvents: 'none' }}>
                <SpiritAnimal archetype={archetypeKey} size={160} />
              </div>
            )}
            {/* Portail — anneaux d'eau doux */}
            {coconPlaced.includes('portail') && [
              { sz: 200, del: 0, dur: 9 }, { sz: 340, del: 3.5, dur: 12 },
            ].map((r, i) => (
              <div key={`cpr${i}`} style={{ position: 'absolute', bottom: '2%', left: '50%', transform: 'translateX(-50%)', width: r.sz, height: r.sz, borderRadius: '50%', border: `1px solid rgba(${arch.rgb},0.36)`, opacity: 0, animation: `waterRing ${r.dur}s ease-out infinite`, animationDelay: `${r.del}s` }} />
            ))}
          </div>
        )
      })()}

      {/* ── Journée complète burst ── */}
      {completeBurst && [0,1,2,3,4,5,6,7].map(j => (
        <div key={j} style={{ position: 'fixed', top: '38%', left: `${12 + j * 11}%`, width: 5, height: 5, borderRadius: '50%', background: arch.color, animation: `milestoneMote ${1.2 + j * 0.15}s ease-out ${j * 0.08}s both`, pointerEvents: 'none', zIndex: 100, boxShadow: `0 0 8px ${arch.color}cc` }} />
      ))}

      {/* ── Première visite du jour ── */}
      {showPresenceToast && (
        <div style={{ position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)', background: `rgba(${arch.rgb},0.14)`, border: `1px solid ${arch.color}44`, borderRadius: 100, padding: '7px 18px', zIndex: 50, animation: 'fadeIn 0.6s ease both', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: arch.color, letterSpacing: '0.12em', margin: 0, animation: 'milestoneGlow 3.5s cubic-bezier(0.45,0,0.55,1) infinite' }}>✦ {{ resilience: 'Présence de feu notée', presence: 'Présence d\'eau notée', sagesse: 'Présence de brume notée', lumiere: 'Présence de lumière notée' }[archetypeKey] || 'Présence notée'}</p>
        </div>
      )}

      {/* ── Cocoon header ── */}
      <div style={{ textAlign: 'center', paddingBottom: 6, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: '-30px -30px 0 -30px', background: `radial-gradient(ellipse 70% 50% at 50% 30%, rgba(${arch.rgb},0.09) 0%, transparent 70%)`, pointerEvents: 'none', animation: 'depthBreath 12s cubic-bezier(0.45,0,0.55,1) infinite' }} />
        {/* Bouton personnalisation */}
        <button onClick={() => setShowPersonalize(true)} style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', cursor: 'pointer', color: `rgba(${arch.rgb},0.55)`, fontSize: 17, padding: '6px 8px', lineHeight: 1, transition: 'color 0.2s ease', minWidth: 44, minHeight: 44, animation: 'phrasebreathe 22s cubic-bezier(0.45,0,0.55,1) infinite' }} title="Personnaliser" aria-label="Personnaliser ton espace">✎</button>
        <button onClick={() => { haptic(6); setShowShare(true) }} style={{ position: 'absolute', top: 0, right: 48, background: 'none', border: 'none', cursor: 'pointer', color: `rgba(${arch.rgb},0.55)`, fontSize: 15, padding: '6px 8px', lineHeight: 1, transition: 'color 0.2s ease', minWidth: 44, minHeight: 44, animation: 'phrasebreathe 22s ease-in-out 1s infinite' }} title="Partager ton archétype" aria-label="Partager ton archétype">↗</button>
        <button onClick={() => { haptic(6); setShowSettings(true) }} style={{ position: 'absolute', top: 0, right: 96, background: 'none', border: 'none', cursor: 'pointer', color: `rgba(${arch.rgb},0.55)`, fontSize: 15, padding: '6px 8px', lineHeight: 1, transition: 'color 0.2s ease', minWidth: 44, minHeight: 44, animation: 'phrasebreathe 22s ease-in-out 2s infinite' }} title="Réglages" aria-label="Ouvrir les réglages">⚙</button>
        {prenom ? (
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 400, fontSize: 18, background: `linear-gradient(135deg, ${arch.color}, rgba(255,255,255,0.95) 55%, ${arch.color}cc)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '0.02em', margin: '0 0 2px', animation: jourComplète ? 'phrasebreathe 32s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 10s ease-in-out 3s infinite' : 'phrasebreathe 32s cubic-bezier(0.45,0,0.55,1) infinite' }}>{greetingStr()}, {prenom}</p>
        ) : (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.58)', letterSpacing: '0.07em', margin: '0 0 4px', textTransform: 'capitalize', textShadow: `0 0 20px ${arch.color}22`, animation: jourComplète ? 'phrasebreathe 46s ease-in-out 2s infinite, milestoneGlow 18s ease-in-out 8s infinite' : 'phrasebreathe 46s ease-in-out 2s infinite' }}>{greetingStr()}{archetypeKey ? ` · ${({ resilience: 'Phénix', presence: 'Cerf', sagesse: 'Loup', lumiere: 'Ours' }[archetypeKey] || '')}` : ''}</p>
        )}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: 'rgba(255,255,255,0.46)', letterSpacing: '0.05em', margin: '0 0 8px', textTransform: 'capitalize', animation: jourComplète ? 'phrasebreathe 50s ease-in-out 3s infinite, milestoneGlow 22s ease-in-out 10s infinite' : 'phrasebreathe 50s ease-in-out 3s infinite', textShadow: `0 0 12px ${arch.color}18` }}>{dateStr}</p>
        {mantra && <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 12.5, color: `rgba(${arch.rgb},0.52)`, letterSpacing: '0.03em', fontStyle: 'italic', margin: '2px 0 16px', lineHeight: 1.65, animation: 'phrasebreathe 40s cubic-bezier(0.45,0,0.55,1) infinite' }}>"{mantra}"</p>}
        {!mantra && <div style={{ marginBottom: 12 }} />}

        {/* Presence ring wrapping the animal — tap for espace vrai */}
        <div style={{ position: 'relative', width: 130, height: 130, margin: '0 auto 16px' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${arch.color}${Math.round(13 + presenceProgress * 28).toString(16).padStart(2,'0')} 0%, transparent 68%)`, animation: jourComplète ? 'presencePulse 6s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 8s ease-in-out 2s infinite' : 'presencePulse 6s cubic-bezier(0.45,0,0.55,1) infinite', pointerEvents: 'none', zIndex: 0, transition: 'background 1.8s ease' }} />
          {presenceProgress > 0.3 && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle, ${arch.color}${Math.round(presenceProgress * 11).toString(16).padStart(2,'0')} 0%, transparent 58%)`, animation: 'presencePulse 9s ease-in-out 3s infinite', pointerEvents: 'none', zIndex: 0, transition: 'background 1.8s ease' }} />}
          {presenceProgress > 0.6 && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${arch.color}${Math.round(presenceProgress * 7).toString(16).padStart(2,'0')} 0%, transparent 48%)`, animation: 'presencePulse 13s ease-in-out 6s infinite', pointerEvents: 'none', zIndex: 0, transition: 'background 1.8s ease' }} />}
        <div
          onClick={() => { haptic([6, 80, 6]); setRingTap(true); setTimeout(() => setRingTap(false), 700); onOpenVrai() }}
          style={{ position: 'relative', width: 130, height: 130, cursor: 'pointer', zIndex: 1 }}
        >
          <div style={{ position: 'absolute', inset: 0 }}>
            <PresenceRing progress={presenceProgress} color={arch.color} size={130} />
          </div>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', pointerEvents: 'none', opacity: jourComplète ? 0.06 + presenceProgress * 0.32 : 0.06 + presenceProgress * 0.22, transition: 'opacity 1.6s ease', zIndex: 2 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(transparent 0%, transparent 60%, rgba(255,255,255,0.9) 78%, transparent 84%, transparent 100%)', animation: 'ringshimmer 8s linear infinite', willChange: 'transform' }} />
          </div>
          {/* Tap ripple */}
          {ringTap && <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: `1.5px solid ${arch.color}77`, animation: 'pulsering 0.7s ease-out forwards', pointerEvents: 'none', zIndex: 5 }} />}
          {/* Completion aura rings */}
          {jourComplète && <div style={{ position: 'absolute', inset: -18, borderRadius: '50%', border: `1px solid ${arch.color}44`, animation: 'pulsering 4.5s cubic-bezier(0.45,0,0.55,1) infinite 0.3s', pointerEvents: 'none', zIndex: 0 }} />}
          {jourComplète && <div style={{ position: 'absolute', inset: -30, borderRadius: '50%', border: `1px solid ${arch.color}22`, animation: 'pulsering 5.8s cubic-bezier(0.45,0,0.55,1) infinite 1.4s', pointerEvents: 'none', zIndex: 0 }} />}
          {/* Soft glow center */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: 76, height: 76, borderRadius: '50%', background: `radial-gradient(circle, ${arch.color}${jourComplète ? '34' : '20'} 0%, transparent 72%)`, animation: jourComplète ? `presencePulse 2.8s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 6s ease-in-out 1.5s infinite` : 'presencePulse 3.8s cubic-bezier(0.45,0,0.55,1) infinite', transition: 'background 1.4s ease' }} />
            <img
              src={`${B}spirit-${archetypeKey}.avif`}
              alt={arch.animal}
              style={{
                width: 74, height: 74,
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: 'center 45%',
                display: 'block',
                opacity: 0.80,
                filter: `brightness(1.05) saturate(1.1) drop-shadow(0 0 16px ${arch.shadow}) drop-shadow(0 0 32px ${arch.color}44)`,
                animation: 'animalfloat 18s cubic-bezier(0.45,0,0.55,1) infinite, animalbreathe 26s cubic-bezier(0.45,0,0.55,1) infinite',
                position: 'relative', zIndex: 1, willChange: 'transform',
              }}
            />
          </div>
        </div>
        </div>

        <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 18, background: `linear-gradient(135deg, rgba(255,255,255,0.96), ${arch.color}cc)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: '0 0 3px', animation: jourComplète ? 'prismaticPulse 8s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 28s ease-in-out 1s infinite' }}>{arch.profil}</p>
        <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 12, color: arch.color, letterSpacing: '0.06em', margin: '0 0 2px', fontStyle: 'italic', opacity: jourComplète ? 0.88 : 0.72, animation: jourComplète ? 'phrasebreathe 32s ease-in-out 1.5s infinite, milestoneGlow 8s ease-in-out 3s infinite' : 'phrasebreathe 32s ease-in-out 1.5s infinite', textShadow: jourComplète ? `0 0 18px ${arch.color}55` : `0 0 12px ${arch.color}33`, transition: 'text-shadow 0.8s ease, opacity 0.8s ease' }}>{arch.animal}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: jourComplète ? `${arch.color}88` : 'rgba(255,255,255,0.55)', letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 6px', animation: jourComplète ? 'phrasebreathe 40s ease-in-out 2.5s infinite, seedPulse 5s ease-in-out 3s infinite, milestoneGlow 12s ease-in-out 5s infinite' : 'phrasebreathe 40s ease-in-out 2.5s infinite', transition: 'color 0.8s ease', textShadow: jourComplète ? `0 0 10px ${arch.color}22` : 'none' }}>Élément · {arch.element}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: arch.color, letterSpacing: '0.24em', textTransform: 'uppercase', margin: '0 0 10px', textShadow: jourComplète ? `0 0 16px ${arch.color}77` : 'none', animation: jourComplète ? 'milestoneGlow 4.5s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 20s cubic-bezier(0.45,0,0.55,1) infinite', transition: 'text-shadow 0.8s ease' }}>{getPresenceLabel(presenceProgress, archetypeKey)}</p>

        {/* ── Niveau XP ── */}
        {(() => {
          const xp = getXP()
          const progress = getXPProgress()
          const levelName = getLevelName(archetypeKey)
          const toNext = getXPToNext()
          const isMaxLevel = getLevelIndex() === 6
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, margin: '8px 0 4px', width: '100%', maxWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: `rgba(${arch.rgb},0.18)`, border: `1.5px solid ${arch.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: isMaxLevel ? 'milestoneGlow 3s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 18s cubic-bezier(0.45,0,0.55,1) infinite', boxShadow: isMaxLevel ? `0 0 14px ${arch.color}66` : `0 0 8px ${arch.color}33` }}>
                    <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 8.5, fontWeight: 700, color: arch.color, lineHeight: 1 }}>{getLevelIndex() + 1}</span>
                  </div>
                  <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 10, color: `rgba(${arch.rgb},0.88)`, letterSpacing: '0.10em', textTransform: 'uppercase', animation: 'phrasebreathe 22s cubic-bezier(0.45,0,0.55,1) infinite', fontWeight: 500 }}>{levelName}</span>
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: isMaxLevel ? arch.color : 'rgba(255,255,255,0.28)', letterSpacing: '0.06em', animation: isMaxLevel ? 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite' : 'none' }}>{isMaxLevel ? '✦ max' : `+${toNext} xp`}</span>
              </div>
              <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round(progress * 100)}%`, background: `linear-gradient(90deg, ${arch.color}66, ${arch.color})`, borderRadius: 3, boxShadow: `0 0 10px ${arch.color}77`, transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)', animation: 'worldglow 6s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 10s ease-in-out 3s infinite' }} />
              </div>
            </div>
          )
        })()}

        {msg ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {isMilestone && [0,1,2,3,4].map(i => (
              <div key={i} style={{ position: 'absolute', bottom: '100%', left: `${18 + i * 14}%`, width: 4, height: 4, borderRadius: '50%', background: arch.color, animation: `milestoneMote ${1.4 + i * 0.3}s ease-out ${0.8 + i * 0.18}s both` }} />
            ))}
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: isMilestone ? 400 : 300, fontSize: isMilestone ? 12.5 : 11.5, color: isMilestone ? arch.color : 'rgba(255,255,255,0.3)', letterSpacing: isMilestone ? '0.04em' : '0.05em', margin: '4px 0 0', fontStyle: 'italic', animation: isMilestone ? 'fadeIn 1.2s ease both, milestoneGlow 3.8s ease-in-out 1.4s infinite' : 'phrasebreathe 34s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: isMilestone ? `0 0 18px ${arch.color}55` : '0 0 14px rgba(255,255,255,0.12)', transition: 'background 240ms cubic-bezier(0.4,0,0.2,1), box-shadow 360ms cubic-bezier(0,0,0.2,1), color 240ms cubic-bezier(0.4,0,0.2,1)' }}>{msg}</p>
          </div>
        ) : (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: `${arch.color}33`, letterSpacing: '0.12em', margin: '4px 0 0', animation: jourComplète ? 'seedPulse 4s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 8s ease-in-out 2s infinite' : 'seedPulse 4s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 10px ${arch.color}22` }}>{{ resilience: 'touche · entre dans le feu', presence: 'touche · entre en présence', sagesse: 'touche · entre dans la brume', lumiere: 'touche · entre dans ta lumière' }[archetypeKey] || 'touche · instant de présence'}</p>
        )}
      </div>

      {/* ── Intention du jour ── */}
      <div style={{ position: 'relative', background: `linear-gradient(rgba(5,8,16,0.85), rgba(5,8,16,0.85)) padding-box, linear-gradient(135deg, ${arch.color}55, transparent 45%, ${arch.color}33) border-box`, border: '1px solid transparent', borderRadius: 14, padding: '20px 18px', minHeight: 92, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', overflow: 'visible', boxShadow: jourComplète ? `0 0 28px rgba(${arch.rgb},0.18), inset 0 0 0 1px ${arch.color}18` : routinesCount === arch.routines.length ? `0 0 18px rgba(${arch.rgb},0.12)` : 'none', transition: 'box-shadow 0.5s ease' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${arch.color}44, transparent)`, borderRadius: '14px 14px 0 0' }} />
        {intentionParticles && [0,1,2].map(j => (
          <div key={j} style={{ position: 'absolute', top: 0, left: `${30 + j * 20}%`, width: 4, height: 4, borderRadius: '50%', background: arch.color, animation: `milestoneMote ${0.9 + j * 0.2}s ease-out ${j * 0.1}s both`, pointerEvents: 'none', zIndex: 5, boxShadow: `0 0 6px ${arch.color}99` }} />
        ))}
        <div style={{ position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 2.5, background: `linear-gradient(180deg, transparent, ${arch.color}bb, transparent)`, borderRadius: '0 2px 2px 0', animation: jourComplète ? 'worldglow 8s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 12s ease-in-out 3s infinite' : 'worldglow 8s cubic-bezier(0.45,0,0.55,1) infinite' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.50)', letterSpacing: '0.2em', margin: 0, textTransform: 'uppercase', animation: jourComplète ? 'phrasebreathe 40s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 12s ease-in-out 5s infinite' : 'phrasebreathe 40s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: jourComplète ? `0 0 12px ${arch.color}33` : `0 0 8px ${arch.color}22` }}>
            {{ resilience: 'Intention de feu', presence: 'Intention de présence', sagesse: 'Intention de sagesse', lumiere: 'Intention de lumière' }[archetypeKey] || 'Intention du jour'}
            {intentionIdx !== 0 && <span style={{ marginLeft: 8, color: `${arch.color}66`, fontSize: 9, animation: 'seedPulse 3s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 6s ease-in-out 1.5s infinite' }}>◎</span>}
          </p>
          <button onClick={cycleIntention} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: `${arch.color}66`, fontSize: 13, lineHeight: 1, display: 'inline-block', transform: cycleSpin ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.38s ease, color 0.2s ease', animation: jourComplète ? 'phrasebreathe 20s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 6s ease-in-out 2s infinite' : 'phrasebreathe 30s cubic-bezier(0.45,0,0.55,1) infinite' }} title="Autre intention">↻</button>
        </div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 17, color: 'rgba(255,255,255,0.92)', lineHeight: 1.68, fontStyle: 'italic', opacity: intentionFade ? 1 : 0, transition: 'opacity 0.2s ease', animation: intentionFade ? (jourComplète ? 'phrasebreathe 90s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 16s ease-in-out 6s infinite' : 'phrasebreathe 90s cubic-bezier(0.45,0,0.55,1) infinite') : 'none' }}>
          {intentionReady && <TypingText key={intentionIdx} text={`"${intention}"`} delay={0} speed={34} cursorColor={arch.color} />}
        </div>
      </div>

      {/* ── Invitation du jour ── */}
      <InvitationCard archetypeKey={archetypeKey} onXp={showXpToast ? (amt) => showXpToast(amt, false) : undefined} />

      {/* ── Exercice de souffle ── */}
      <div onClick={() => { haptic([6,40,6]); setShowBreathing(true) }} style={{ cursor: 'pointer', background: `linear-gradient(135deg, rgba(${arch.rgb},0.09) 0%, rgba(255,255,255,0.05) 60%, rgba(${arch.rgb},0.04) 100%)`, border: `1px solid rgba(${arch.rgb},0.40)`, borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', transition: 'border-color 0.3s ease', animation: 'fadeIn 0.6s ease 0.4s both', boxShadow: `0 4px 24px rgba(${arch.rgb},0.10), inset 0 1px 0 rgba(255,255,255,0.06)` }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: `radial-gradient(circle, rgba(${arch.rgb},0.20) 0%, transparent 70%)`, border: `1px solid rgba(${arch.rgb},0.30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: 'animalbreathe 8s cubic-bezier(0.45,0,0.55,1) infinite', boxShadow: `0 0 16px rgba(${arch.rgb},0.25), inset 0 0 12px rgba(${arch.rgb},0.10)` }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ opacity: 0.75 }}>
            <path d="M3 11 C5.5 6, 9 6, 11 11 C13 16, 16.5 16, 19 11" stroke={arch.color} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: `rgba(${arch.rgb},0.70)`, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 4 }}>Exercice de souffle</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.82)', letterSpacing: '-0.01em' }}>{{ resilience: 'Respiration du Guerrier', presence: "Respiration de l'Ancrage", sagesse: 'Cohérence Cardiaque', lumiere: 'Souffle Créateur' }[archetypeKey]}</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 3 }}>{{ resilience: '4·4·4·4 — Cohésion corps-esprit', presence: '4·7·8 — Ancrage profond', sagesse: '5·5 — Clarté et équilibre', lumiere: '4·8 — Libération créatrice' }[archetypeKey]}</div>
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: `rgba(${arch.rgb},0.55)`, letterSpacing: '0.08em', flexShrink: 0 }}>→</div>
      </div>

      {showBreathing && <BreathingModal archetypeKey={archetypeKey} onClose={() => setShowBreathing(false)} />}

      {/* ── Libération des pensées (mini-jeu thérapeutique) ── */}
      <div onClick={() => { haptic([6,40,6]); setShowLiberation(true) }} role="button" tabIndex={0} aria-label="Ouvrir Libération des pensées" style={{ cursor: 'pointer', background: `linear-gradient(135deg, rgba(${arch.rgb},0.08) 0%, rgba(255,255,255,0.04) 60%, rgba(${arch.rgb},0.04) 100%)`, border: `1px solid rgba(${arch.rgb},0.38)`, borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', transition: 'border-color 240ms cubic-bezier(0.4,0,0.2,1)', animation: 'fadeIn 0.6s cubic-bezier(0,0,0.2,1) 0.5s both', boxShadow: `0 4px 22px rgba(${arch.rgb},0.10), inset 0 1px 0 rgba(255,255,255,0.06)`, minHeight: 60 }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0, filter: `drop-shadow(0 0 8px ${arch.color}66)`, animation: 'animalbreathe 7s cubic-bezier(0.45,0,0.55,1) infinite' }}>
          <ellipse cx="11" cy="13" rx="5" ry="4" fill={`rgba(120,130,160,0.42)`} />
          <ellipse cx="20" cy="11" rx="4" ry="3" fill={`rgba(120,130,160,0.30)`} />
          <ellipse cx="16" cy="19" rx="4" ry="3" fill={`rgba(120,130,160,0.36)`} />
          <circle cx="24" cy="22" r="1.5" fill={arch.color} opacity="0.85" />
          <circle cx="6" cy="8"  r="1.0" fill={arch.color} opacity="0.65" />
          <circle cx="26" cy="6"  r="0.8" fill={arch.color} opacity="0.55" />
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: `rgba(${arch.rgb},0.70)`, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 4 }}>Mini-jeu doux</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.86)', letterSpacing: '-0.01em' }}>Libération des pensées</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>Touche ce qui pèse pour le laisser partir</div>
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: `rgba(${arch.rgb},0.55)`, letterSpacing: '0.08em', flexShrink: 0 }}>→</div>
      </div>
      {showLiberation && <LiberationPenseesModal archetypeKey={archetypeKey} onClose={() => setShowLiberation(false)} />}

      {/* ── Apaisement sensoriel (mini-jeu) ── */}
      <div onClick={() => { haptic([6,40,6]); setShowApaisement(true) }} role="button" tabIndex={0} aria-label="Ouvrir Apaisement sensoriel" style={{ cursor: 'pointer', background: `linear-gradient(135deg, rgba(${arch.rgb},0.08) 0%, rgba(255,255,255,0.04) 60%, rgba(${arch.rgb},0.04) 100%)`, border: `1px solid rgba(${arch.rgb},0.38)`, borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', transition: 'border-color 240ms cubic-bezier(0.4,0,0.2,1)', animation: 'fadeIn 0.6s cubic-bezier(0,0,0.2,1) 0.6s both', boxShadow: `0 4px 22px rgba(${arch.rgb},0.10), inset 0 1px 0 rgba(255,255,255,0.06)`, minHeight: 60 }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0, filter: `drop-shadow(0 0 8px ${arch.color}66)`, animation: 'signaturePulse 9s cubic-bezier(0.45,0,0.55,1) infinite' }}>
          <circle cx="10" cy="8"  r="1.6" fill={arch.color} opacity="0.85"/>
          <circle cx="22" cy="11" r="1.4" fill={arch.color} opacity="0.70"/>
          <circle cx="6"  cy="18" r="1.2" fill={arch.color} opacity="0.60"/>
          <circle cx="16" cy="16" r="2.2" fill={arch.color} opacity="0.95"/>
          <circle cx="26" cy="20" r="1.4" fill={arch.color} opacity="0.65"/>
          <circle cx="11" cy="25" r="1.6" fill={arch.color} opacity="0.78"/>
          <circle cx="22" cy="26" r="1.2" fill={arch.color} opacity="0.55"/>
          <path d="M16 16 Q14 20 11 25" stroke={arch.color} strokeWidth="0.8" opacity="0.42" strokeLinecap="round" fill="none"/>
          <path d="M16 16 Q19 13 22 11" stroke={arch.color} strokeWidth="0.8" opacity="0.42" strokeLinecap="round" fill="none"/>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: `rgba(${arch.rgb},0.70)`, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 4 }}>Mini-jeu doux</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.86)', letterSpacing: '-0.01em' }}>Apaisement sensoriel</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>Glisse ton doigt sur les douze présences</div>
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: `rgba(${arch.rgb},0.55)`, letterSpacing: '0.08em', flexShrink: 0 }}>→</div>
      </div>
      {showApaisement && <ApaisementSensorielModal archetypeKey={archetypeKey} onClose={() => setShowApaisement(false)} />}

      {/* ── Carnet du Voyage (écriture quotidienne) ── */}
      <div onClick={() => { haptic([6,40,6]); setShowCarnet(true) }} role="button" tabIndex={0} aria-label="Ouvrir mon Carnet du Voyage" style={{ cursor: 'pointer', background: `linear-gradient(135deg, rgba(${arch.rgb},0.08) 0%, rgba(255,255,255,0.04) 60%, rgba(${arch.rgb},0.04) 100%)`, border: `1px solid rgba(${arch.rgb},0.38)`, borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', transition: 'border-color 240ms cubic-bezier(0.4,0,0.2,1)', animation: 'fadeIn 0.6s cubic-bezier(0,0,0.2,1) 0.7s both', boxShadow: `0 4px 22px rgba(${arch.rgb},0.10), inset 0 1px 0 rgba(255,255,255,0.06)`, minHeight: 60 }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0, filter: `drop-shadow(0 0 8px ${arch.color}66)`, animation: 'signaturePulse 10s cubic-bezier(0.45,0,0.55,1) infinite' }}>
          <path d="M7 6 L7 26 L22 26 L25 23 L25 6 Z" fill={`rgba(${arch.rgb},0.18)`} stroke={arch.color} strokeWidth="1.1" strokeLinejoin="round" opacity="0.85"/>
          <line x1="10" y1="11" x2="22" y2="11" stroke={arch.color} strokeWidth="0.8" opacity="0.55" strokeLinecap="round"/>
          <line x1="10" y1="15" x2="22" y2="15" stroke={arch.color} strokeWidth="0.8" opacity="0.45" strokeLinecap="round"/>
          <line x1="10" y1="19" x2="19" y2="19" stroke={arch.color} strokeWidth="0.8" opacity="0.35" strokeLinecap="round"/>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: `rgba(${arch.rgb},0.70)`, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 4 }}>Écriture libre</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.86)', letterSpacing: '-0.01em' }}>Carnet du Voyage</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{getCarnetEntryToday() ? "Tu as déposé un mot aujourd'hui ✦" : 'Une phrase pour ce jour'}</div>
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: `rgba(${arch.rgb},0.55)`, letterSpacing: '0.08em', flexShrink: 0 }}>→</div>
      </div>
      {showCarnet && <CarnetModal archetypeKey={archetypeKey} onClose={() => setShowCarnet(false)} />}

      {/* ── Ta trace ── carte discrète d'accès au sanctuaire temporel */}
      <div onClick={() => { haptic(6); setShowTrace(true) }} role="button" tabIndex={0} aria-label="Voir ta trace des 30 derniers jours" style={{ cursor: 'pointer', background: `linear-gradient(135deg, rgba(${arch.rgb},0.07) 0%, rgba(255,255,255,0.04) 60%, rgba(${arch.rgb},0.03) 100%)`, border: `1px solid rgba(${arch.rgb},0.36)`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', transition: 'border-color 0.3s ease', animation: 'fadeIn 0.6s ease 0.55s both', boxShadow: `0 4px 20px rgba(${arch.rgb},0.08)`, minHeight: 56 }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0, filter: `drop-shadow(0 0 6px ${arch.color}66)`, animation: 'animalbreathe 6s cubic-bezier(0.45,0,0.55,1) infinite' }}>
          <circle cx="8" cy="10" r="1.6" fill={arch.color} opacity="0.85" />
          <circle cx="22" cy="6" r="1.2" fill={arch.color} opacity="0.55" />
          <circle cx="16" cy="14" r="2.2" fill={arch.color} opacity="0.95" />
          <circle cx="26" cy="18" r="1.4" fill={arch.color} opacity="0.65" />
          <circle cx="6" cy="22" r="1.0" fill={arch.color} opacity="0.45" />
          <circle cx="20" cy="24" r="1.6" fill={arch.color} opacity="0.75" />
          <circle cx="12" cy="26" r="1.2" fill={arch.color} opacity="0.55" />
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: `rgba(${arch.rgb},0.70)`, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 4 }}>Ta trace</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.82)', letterSpacing: '-0.01em' }}>Ta constellation des 30 jours</div>
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: `rgba(${arch.rgb},0.55)`, letterSpacing: '0.08em', flexShrink: 0 }}>→</div>
      </div>

      {showTrace && <TraceScreen archetypeKey={archetypeKey} onClose={() => setShowTrace(false)} />}
      {showShare && <ShareArchetype archetypeKey={archetypeKey} onClose={() => setShowShare(false)} />}
      {showSettings && <SettingsScreen archetypeKey={archetypeKey} onClose={() => setShowSettings(false)} onRestart={onRestart} onRetakeQuiz={onRestart} />}

      {/* ── Prochaine découverte ── */}
      {(() => {
        const totalDays = getTotalDaysVisited()
        const daysToNext = getDaysToNextWorld(archetypeKey)
        const unlockedWorlds = getUnlockedWorlds(archetypeKey)
        const order = WORLD_ORDER[archetypeKey] || WORLD_ORDER.resilience
        const nextWorldKey = order[unlockedWorlds.length]
        const nextWorld = nextWorldKey ? WORLDS[nextWorldKey] : null
        if (!nextWorld) return null
        const prevThreshold = WORLD_UNLOCK_DAYS[unlockedWorlds.length - 1] || 0
        const nextThreshold = WORLD_UNLOCK_DAYS[unlockedWorlds.length] || prevThreshold
        const progress = nextThreshold > prevThreshold ? Math.min(1, (totalDays - prevThreshold) / (nextThreshold - prevThreshold)) : 1
        return (
          <div style={{ background: `linear-gradient(135deg, rgba(${nextWorld.rgb},0.10) 0%, rgba(255,255,255,0.03) 60%, rgba(${nextWorld.rgb},0.05) 100%)`, border: `1px solid rgba(${nextWorld.rgb},0.20)`, borderRadius: 14, padding: '16px 18px', animation: 'fadeIn 0.6s ease 0.8s both', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', boxShadow: `0 4px 28px rgba(${nextWorld.rgb},0.12), inset 0 1px 0 rgba(255,255,255,0.06)` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.52)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Prochain monde</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: `rgba(${nextWorld.rgb},0.65)`, letterSpacing: '0.06em' }}>{daysToNext} jour{daysToNext > 1 ? 's' : ''}</span>
            </div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.82)', marginBottom: 10, animation: 'phrasebreathe 20s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 20px ${nextWorld.color}66` }}>{nextWorld.name}</div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${Math.round(progress * 100)}%`, background: `linear-gradient(90deg, ${nextWorld.color}66, ${nextWorld.color})`, borderRadius: 2, boxShadow: `0 0 8px ${nextWorld.color}55`, transition: 'width 1s ease', animation: 'worldglow 5s cubic-bezier(0.45,0,0.55,1) infinite' }} />
            </div>
          </div>
        )
      })()}

      {/* ── Mon Espace Néya ── */}
      <div onClick={() => { haptic([6,40,6]); setShowCocon(true) }}
        style={{ cursor: 'pointer', background: `linear-gradient(rgba(5,8,16,0.7), rgba(5,8,16,0.7)) padding-box, linear-gradient(135deg, ${arch.color}44, transparent 40%, ${arch.color}28) border-box`,
          border: '1px solid transparent', borderRadius: 14, padding: '18px 18px',
          display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)', transition: 'box-shadow 0.3s ease',
          animation: 'fadeIn 0.6s ease 0.6s both',
          boxShadow: `0 0 32px rgba(${arch.rgb},0.14), inset 0 1px 0 rgba(${arch.rgb},0.12)` }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${arch.rgb},0.25) 0%, transparent 70%)`,
          border: `1px solid rgba(${arch.rgb},0.38)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          animation: 'animalbreathe 12s cubic-bezier(0.45,0,0.55,1) infinite',
          boxShadow: `0 0 20px rgba(${arch.rgb},0.30)` }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ opacity: 0.82 }}>
            <path d="M11 2 L19 7 L19 15 L11 20 L3 15 L3 7 Z" stroke={arch.color} strokeWidth="1.2" fill="none"/>
            <path d="M11 2 L11 20 M3 7 L19 7 M3 15 L19 15" stroke={arch.color} strokeWidth="0.6" opacity="0.45"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: `rgba(${arch.rgb},0.75)`,
            letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 4 }}>Mon Espace</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14,
            color: arch.color, letterSpacing: '-0.01em', textShadow: `0 0 16px ${arch.color}55` }}>{coconName || 'Mon Cocon Néya'}</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
            Ton sanctuaire personnel · Objets à débloquer
          </div>
          {/* Souvenirs hint : 3 derniers éclats en mini */}
          {(() => {
            const souvenirs = getSouvenirs().slice(-3).reverse()
            if (souvenirs.length === 0) return null
            return (
              <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                {souvenirs.map((s, i) => {
                  const def = SOUVENIR_LIBRARY[s.type] || { glyph: '✦' }
                  return (
                    <div key={s.ts} style={{ width: 18, height: 18, borderRadius: '50%', background: `rgba(${arch.rgb},0.12)`, border: `1px solid rgba(${arch.rgb},0.40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 6px rgba(${arch.rgb},0.25)`, animation: `signaturePulse ${8 + i * 2}s cubic-bezier(0.45,0,0.55,1) ${i * 0.8}s infinite` }}>
                      <span style={{ fontSize: 10, color: arch.color, lineHeight: 1, textShadow: `0 0 4px ${arch.color}` }}>{def.glyph}</span>
                    </div>
                  )
                })}
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: `rgba(${arch.rgb},0.62)`, letterSpacing: '0.08em', marginLeft: 4, fontStyle: 'italic' }}>tes éclats</span>
              </div>
            )
          })()}
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: arch.color,
          letterSpacing: '0.08em', flexShrink: 0, animation: 'phrasebreathe 8s cubic-bezier(0.45,0,0.55,1) infinite' }}>→</div>
      </div>

      {showCocon && <CoconScreen archetypeKey={archetypeKey} onClose={() => setShowCocon(false)} />}
      {showPersonalize && <PersonalizationModal archetypeKey={archetypeKey} onClose={() => setShowPersonalize(false)} />}

      {/* ── Graines de présence (7 jours) ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 1, animation: jourComplète ? 'worldglow 22s ease-in-out 6s infinite, milestoneGlow 14s ease-in-out 4s infinite' : 'worldglow 22s ease-in-out 6s infinite' }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
        {/* Streak display */}
        {streak >= 2 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: streak >= 30 ? 40 : streak >= 7 ? 36 : 30, background: `linear-gradient(135deg, ${arch.color}, rgba(255,255,255,0.95) 55%, ${arch.color}cc)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1, textShadow: 'none', animation: streak >= 7 ? 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 22s cubic-bezier(0.45,0,0.55,1) infinite' }}>{streak}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: `${arch.color}88`, letterSpacing: '0.06em' }}>jours</span>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: streak >= 14 ? arch.color : `${arch.color}66`, letterSpacing: '0.22em', textTransform: 'uppercase', margin: 0, textShadow: streak >= 14 ? `0 0 14px ${arch.color}77` : `0 0 8px ${arch.color}33`, animation: streak >= 14 ? 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 28s cubic-bezier(0.45,0,0.55,1) infinite' }}>
              {{ resilience: 'de feu', presence: 'de présence', sagesse: 'de sagesse', lumiere: 'de lumière' }[archetypeKey] || 'd\'affilée'}{streak >= 7 ? ' ✦' : ''}
            </p>
            {getGraceAvailable() && <span title="Bouclier de présence disponible" style={{ fontSize: 12, opacity: 0.45, animation: 'phrasebreathe 28s cubic-bezier(0.45,0,0.55,1) infinite', cursor: 'default' }}>🛡</span>}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
            {days > 0 && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: isMilestone ? arch.color : `${arch.color}55`, letterSpacing: '0.26em', textTransform: 'uppercase', margin: 0, textShadow: isMilestone ? `0 0 12px ${arch.color}66` : `0 0 8px ${arch.color}33`, animation: isMilestone ? 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 40s cubic-bezier(0.45,0,0.55,1) infinite' }}>Jour {days}</p>
            )}
          </div>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          {weekDots.filter(Boolean).length === 7 && <div style={{ position: 'absolute', inset: '-8px -16px', borderRadius: 20, background: `radial-gradient(ellipse at center, ${arch.color}14 0%, transparent 70%)`, animation: 'presencePulse 5s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 6s ease-in-out 2s infinite', pointerEvents: 'none' }} />}
          {weekDots.map((active, i) => {
            const isToday = i === 6
            const FR_DOW = ['D','L','M','M','J','V','S']
            const d = new Date(); d.setDate(d.getDate() - (6 - i))
            const letter = FR_DOW[d.getDay()]
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: active ? 11 : isToday ? 7 : 5.5,
                  height: active ? 11 : isToday ? 7 : 5.5,
                  borderRadius: '50%',
                  background: active ? arch.color : 'rgba(255,255,255,0.07)',
                  boxShadow: active ? `0 0 10px ${arch.color}cc, 0 0 22px ${arch.color}44, 0 0 40px ${arch.color}18` : isToday ? `0 0 0 1.5px ${arch.color}66` : 'none',
                  transition: 'all 0.5s ease',
                  animation: active ? (weekDots.filter(Boolean).length === 7 ? 'seedPulse 3.5s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 5s ease-in-out 1s infinite' : 'seedPulse 3.5s cubic-bezier(0.45,0,0.55,1) infinite') : isToday ? (jourComplète ? 'presencePulse 4.2s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 7s ease-in-out 2s infinite' : 'presencePulse 4.2s cubic-bezier(0.45,0,0.55,1) infinite') : 'none',
                  animationDelay: `${i * 0.42}s`,
                  outline: isToday && !active ? `1.5px solid ${arch.color}55` : 'none',
                  outlineOffset: '2px',
                }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: isToday ? arch.color : active ? `${arch.color}88` : 'rgba(255,255,255,0.42)', letterSpacing: '0.04em', lineHeight: 1, transition: 'color 0.5s ease', animation: isToday ? (jourComplète ? 'phrasebreathe 14s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 6s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 14s cubic-bezier(0.45,0,0.55,1) infinite') : active ? (weekDots.filter(Boolean).length === 7 ? 'phrasebreathe 22s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 8s ease-in-out 1s infinite' : 'phrasebreathe 22s cubic-bezier(0.45,0,0.55,1) infinite') : 'phrasebreathe 60s cubic-bezier(0.45,0,0.55,1) infinite' }}>{letter}</span>
              </div>
            )
          })}
        </div>
        {(() => {
          const count = weekDots.filter(Boolean).length
          if (count === 0) return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.50)', letterSpacing: '0.14em', margin: 0, animation: 'phrasebreathe 28s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 10px rgba(0,0,0,0.5), 0 0 10px ${arch.color}22` }}>ta présence cette semaine</p>
          if (count === 7) return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: arch.color, letterSpacing: '0.14em', margin: 0, opacity: 0.9, textShadow: `0 0 14px ${arch.color}88`, animation: 'milestoneGlow 3.8s cubic-bezier(0.45,0,0.55,1) infinite' }}>{{ resilience: '7 jours · flamme constante ✦', presence: '7 jours · présence totale ✦', sagesse: '7 jours · sagesse incarnée ✦', lumiere: '7 jours · semaine de lumière ✦' }[archetypeKey] || '7 jours · semaine complète ✦'}</p>
          return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: count >= 3 ? `${arch.color}cc` : 'rgba(255,255,255,0.55)', letterSpacing: '0.14em', margin: 0, transition: 'color 0.8s ease', animation: count >= 3 ? 'phrasebreathe 28s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 10s ease-in-out 3s infinite' : 'phrasebreathe 32s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: count >= 3 ? `0 0 12px ${arch.color}33` : 'none' }}>{count} jour{count > 1 ? 's' : ''} cette semaine</p>
        })()}
        {totalDone > 0 && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: totalDone >= 100 ? `${arch.color}cc` : 'rgba(255,255,255,0.42)', letterSpacing: '0.12em', margin: 0, animation: totalDone >= 100 ? 'phrasebreathe 32s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 8s ease-in-out 4s infinite' : 'phrasebreathe 40s ease-in-out 3s infinite', transition: 'color 1s ease', textShadow: totalDone >= 100 ? `0 0 12px ${arch.color}33` : `0 0 8px ${arch.color}18` }}>
            {totalDone} présence{totalDone > 1 ? 's' : ''} au total{totalDone >= 100 ? ' ✦' : ''}
          </p>
        )}
        {(() => {
          const STREAK_MSGS = {
            resilience: { 3: 'Tu brûles 3 jours d\'affilée.', 7: '7 jours de feu consécutifs. Tu es en plein élan.', 14: '14 jours — ta flamme est continue.', 21: '21 jours d\'affilée. Ton feu devient constance.', 30: '30 jours consécutifs. Tu es en feu.', 60: '60 jours d\'affilée. Tu as transformé la durée.', 100: '100 jours. Phénix — tu brûles sans t\'arrêter.' },
            presence:   { 3: 'Tu coules 3 jours d\'affilée.', 7: '7 jours de présence consécutifs. Tu t\'ancres en profondeur.', 14: '14 jours — ton eau ne tarit pas.', 21: '21 jours d\'affilée. Ta présence est une force.', 30: '30 jours consécutifs. Tu habites vraiment cet espace.', 60: '60 jours d\'affilée. L\'eau qui demeure transforme tout.', 100: '100 jours. Cerf — tu es l\'eau qui ne s\'arrête plus.' },
            sagesse:    { 3: 'Tu observes 3 jours d\'affilée.', 7: '7 jours de silence consécutifs. Ta brume porte ta sagesse.', 14: '14 jours — ta profondeur prend racine.', 21: '21 jours d\'affilée. Ta sagesse devient une voie.', 30: '30 jours consécutifs. Tu perçois ce que peu voient.', 60: '60 jours d\'affilée. Ta perception est devenue une force.', 100: '100 jours. Loup — tu vois dans le silence total.' },
            lumiere:    { 3: 'Tu rayonnes 3 jours d\'affilée.', 7: '7 jours de lumière consécutifs. Tu illumines la durée.', 14: '14 jours — ta créativité ne s\'arrête pas.', 21: '21 jours d\'affilée. Ta lumière grandit.', 30: '30 jours consécutifs. Tu crées là où tu passes.', 60: '60 jours d\'affilée. Ta lumière est une constance.', 100: '100 jours. Ours — tu illumines sans jamais faiblir.' },
          }
          const msg = (STREAK_MSGS[archetypeKey] || {})[streak]
          if (!msg) return null
          return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: arch.color, letterSpacing: '0.08em', margin: '2px 0 0', fontStyle: 'italic', opacity: 0.8, animation: 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite, phrasebreathe 22s ease-in-out 2s infinite', textShadow: `0 0 14px ${arch.color}55`, textAlign: 'center', maxWidth: 260 }}>{msg}</p>
        })()}
      </div>

      {/* ── Progression du jour ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 1, animation: jourComplète ? 'worldglow 18s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 14s ease-in-out 6s infinite' : 'worldglow 18s cubic-bezier(0.45,0,0.55,1) infinite' }} />
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: jourComplète ? arch.color : 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', margin: '2px 0 0', textTransform: 'uppercase', transition: 'color 0.6s ease', textShadow: jourComplète ? `0 0 14px ${arch.color}66` : `0 0 10px ${arch.color}22`, animation: jourComplète ? 'milestoneGlow 5s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 24s cubic-bezier(0.45,0,0.55,1) infinite' }}>Aujourd'hui</p>
      <div style={{ position: 'relative', display: 'flex', gap: 10 }}>
        {jourComplète && <div style={{ position: 'absolute', inset: '-10px -6px', borderRadius: 18, background: `radial-gradient(ellipse at center, ${arch.color}0d 0%, transparent 68%)`, animation: 'presencePulse 7s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 10s ease-in-out 3s infinite', pointerEvents: 'none', zIndex: 0 }} />}
        {[
          { label: 'Routines', count: routinesCount, total: arch.routines.length, icon: '◈', tab: 'routines', nextHint: routinesCount < arch.routines.length ? arch.routines[routinesCount]?.title : null },
          { label: 'Quêtes', count: quetesCount, total: arch.quetes.length, icon: '◇', tab: 'quetes', nextHint: quetesCount < arch.quetes.length ? arch.quetes.find((q, qi) => !quetesDone[qi])?.title : null },
        ].map((s, i) => (
          <div key={i} onClick={() => { haptic(8); onChangeTab(s.tab) }} style={{ flex: 1, position: 'relative', zIndex: 1, background: s.count === s.total ? `linear-gradient(135deg, rgba(${arch.rgb},0.12) 0%, rgba(${arch.rgb},0.07) 100%)` : s.count > 0 ? `linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(${arch.rgb},0.08) 100%)` : 'rgba(255,255,255,0.07)', border: `1px solid ${s.count === s.total ? arch.color + '88' : s.count > 0 ? arch.color + '66' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10, transition: 'border-color 0.4s ease, background 0.4s ease', animation: vis ? 'forcespring 0.55s ease both' : 'none', animationDelay: vis ? `${0.28 + i * 0.1}s` : '0s', cursor: 'pointer', boxShadow: s.count === s.total ? `0 0 22px rgba(${arch.rgb},0.22), inset 0 0 0 1px ${arch.color}22` : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: s.count > 0 ? arch.color : 'rgba(255,255,255,0.24)', transition: 'color 0.3s ease', textShadow: s.count === s.total ? `0 0 12px ${arch.color}88` : 'none', animation: s.count === s.total ? 'seedPulse 3s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 4.5s ease-in-out 1s infinite' : s.count > 0 ? 'phrasebreathe 22s cubic-bezier(0.45,0,0.55,1) infinite' : 'none' }}>{s.icon}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: s.count === s.total ? arch.color : 'rgba(255,255,255,0.26)', transition: 'color 0.4s ease', textShadow: s.count === s.total ? `0 0 10px ${arch.color}66` : 'none', animation: s.count === s.total ? 'seedPulse 3.4s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 5s ease-in-out 1.5s infinite' : (s.count > 0 ? 'phrasebreathe 26s cubic-bezier(0.45,0,0.55,1) infinite' : 'none') }}>{s.count}/{s.total}</span>
            </div>
            <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1 }}>
              <div style={{ height: '100%', background: arch.color, borderRadius: 1, width: `${(s.count / s.total) * 100}%`, transition: 'width 0.5s ease', boxShadow: s.count === s.total ? `0 0 12px ${arch.color}cc` : s.count > 0 ? `0 0 7px ${arch.color}88` : 'none', animation: s.count > 0 && s.count < s.total ? 'worldglow 10s cubic-bezier(0.45,0,0.55,1) infinite' : 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 12.5, color: s.count === s.total ? arch.color : 'rgba(255,255,255,0.52)', transition: 'color 0.4s ease', animation: s.count === s.total ? 'milestoneGlow 5s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 28s cubic-bezier(0.45,0,0.55,1) infinite' }}>{s.label}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, color: s.count === s.total ? `${arch.color}88` : 'rgba(255,255,255,0.14)', letterSpacing: '0.04em', transition: 'color 0.4s ease', animation: s.count === s.total ? 'seedPulse 3.2s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 5s ease-in-out 1s infinite' : 'none' }}>✦</span>
            </div>
            {s.nextHint && s.count < s.total && (
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: s.count > 0 ? `${arch.color}55` : 'rgba(255,255,255,0.22)', letterSpacing: '0.04em', lineHeight: 1.3, marginTop: -2, animation: s.count > 0 ? 'phrasebreathe 26s cubic-bezier(0.45,0,0.55,1) infinite, seedPulse 4.5s ease-in-out 1.5s infinite, milestoneGlow 10s ease-in-out 2s infinite' : 'phrasebreathe 36s cubic-bezier(0.45,0,0.55,1) infinite', transition: 'color 0.5s ease', textShadow: s.count > 0 ? `0 0 8px ${arch.color}33` : 'none' }}>{s.nextHint}</span>
            )}
          </div>
        ))}
      </div>

      {/* ── Journée complète ── */}
      {jourComplète && (
        <div style={{ position: 'relative', background: `linear-gradient(135deg, rgba(${arch.rgb},0.12) 0%, rgba(${arch.rgb},0.06) 100%)`, border: `1px solid ${arch.color}44`, borderRadius: 14, padding: '18px 20px', textAlign: 'center', animation: 'fadeIn 0.9s ease both, milestoneGlow 6s ease-in-out 1s infinite', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', boxShadow: `0 0 28px rgba(${arch.rgb},0.14), 0 4px 16px rgba(0,0,0,0.2)`, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: '16%', bottom: '16%', width: 2.5, background: `linear-gradient(180deg, transparent, ${arch.color}cc, transparent)`, borderRadius: '0 2px 2px 0', animation: 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite' }} />
          <div>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 15, color: arch.color, margin: '0 0 5px', textShadow: `0 0 18px ${arch.color}66`, letterSpacing: '0.03em', animation: 'milestoneGlow 4.2s cubic-bezier(0.45,0,0.55,1) infinite' }}>✦ Journée complète.</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.36)', margin: 0, fontStyle: 'italic', letterSpacing: '0.03em', animation: 'phrasebreathe 28s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 8s ease-in-out 2s infinite', textShadow: `0 0 12px ${arch.color}22` }}>{{ resilience: 'Tu brûles avec clarté aujourd\'hui.', presence: 'Tu es ancré·e et rayonnant·e.', sagesse: 'Ta sagesse brille dans chaque geste.', lumiere: 'Tu rayonnes aujourd\'hui.' }[archetypeKey] || 'Tu rayonnes aujourd\'hui.'}</p>
          </div>
          <button onClick={() => { haptic([6, 60, 6]); onOpenVrai() }} style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg, rgba(225,168,40,0.94), rgba(200,140,25,0.90))', border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.22em', color: 'rgba(20,12,2,0.90)', textTransform: 'uppercase', animation: 'milestoneGlow 4.5s cubic-bezier(0.45,0,0.55,1) infinite', boxShadow: '0 6px 32px rgba(225,168,40,0.42), 0 2px 12px rgba(0,0,0,0.25)' }}>
            Entrer en Présence ✦
          </button>
        </div>
      )}

      <div style={{ height: 1, background: `rgba(${arch.rgb},0.12)`, borderRadius: 1, animation: jourComplète ? 'worldglow 26s ease-in-out 12s infinite, milestoneGlow 14s ease-in-out 6s infinite' : 'worldglow 26s ease-in-out 12s infinite', marginTop: 4, boxShadow: `0 0 8px ${arch.color}18` }} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 0 }}>
        {typeof navigator !== 'undefined' && navigator.share && (
          <button onClick={() => {
            haptic([8, 20, 8])
            navigator.share({ title: 'Mon profil NÉYA', text: `"${arch.worldInsight}"\n\nJe suis ${arch.profil} — ${arch.animal} · Élément ${arch.element}.${streak >= 2 ? ` ${streak} jours d'affilée.` : ''} Découvre ton guide intérieur sur NÉYA.`, url: 'https://neya-kappa.vercel.app' }).catch(() => {})
          }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: `${arch.color}77`, letterSpacing: '0.05em', padding: '10px 0', animation: 'phrasebreathe 26s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 12s ease-in-out 4s infinite', textShadow: `0 0 18px ${arch.color}33` }}>
            Partager mon profil
          </button>
        )}
        <button onClick={handleRestartClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: restartPending ? 'rgba(236,72,153,0.65)' : 'rgba(255,255,255,0.18)', letterSpacing: '0.05em', padding: '10px 0', transition: 'color 0.3s ease, text-shadow 0.3s ease', textShadow: restartPending ? '0 0 14px rgba(236,72,153,0.4)' : 'none', animation: restartPending ? 'phrasebreathe 8s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 2s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 52s cubic-bezier(0.45,0,0.55,1) infinite' }}>
          {restartPending ? 'Toucher encore pour confirmer' : 'Refaire le parcours'}
        </button>

      </div>
    </div>
  )
}

// ─── ROUTINES SCREEN ──────────────────────────────────────────────────────────

function RoutineGuideModal({ archetypeKey, routine, done, onClose, onComplete }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  const [completing, setCompleting] = useState(false)
  const { exiting, close } = useExitAnimation(onClose, 280)
  useEffect(() => { const t = setTimeout(() => setVis(true), 30); return () => clearTimeout(t) }, [])

  const handleComplete = () => {
    if (done) { close(); return }
    haptic([10, 50, 30, 50, 10])
    setCompleting(true)
    setTimeout(() => { onComplete(); setTimeout(close, 460) }, 1100)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 880, background: 'rgba(5,8,16,0.98)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', opacity: (vis && !exiting) ? 1 : 0, transition: 'opacity 280ms cubic-bezier(0.4,0,1,1)', overflowY: 'auto', animation: exiting ? 'sheetExit 280ms cubic-bezier(0.4,0,1,1) both' : (vis ? 'modalEnter 440ms cubic-bezier(0.16,1.36,0.32,1) both' : 'none') }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 36%, rgba(${arch.rgb},0.12) 0%, transparent 65%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 92%, rgba(${arch.rgb},0.08) 0%, transparent 60%)`, pointerEvents: 'none' }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {[{x:12,y:22,r:1.8,dur:30,del:0},{x:84,y:30,r:1.4,dur:34,del:3.5},{x:22,y:74,r:2.0,dur:28,del:1.8},{x:76,y:80,r:1.4,dur:36,del:6.2},{x:50,y:18,r:1.6,dur:32,del:9.1},{x:88,y:54,r:1.2,dur:38,del:2.4}].map((m,i)=>(
          <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: 0.08, animation: `splashmote ${m.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
        ))}
      </svg>

      {completing && (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }}>
          {[{x:20,y:30,r:3,del:0},{x:80,y:38,r:2.6,del:0.15},{x:32,y:70,r:3.2,del:0.32},{x:70,y:74,r:2.4,del:0.50},{x:50,y:18,r:2.8,del:0.70},{x:88,y:58,r:2.6,del:0.90},{x:14,y:60,r:2.2,del:0.40},{x:62,y:34,r:2.0,del:0.20}].map((m,i)=>(
            <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: 0, animation: `milestoneMote 1.6s ease-out ${m.del}s both`, filter: `drop-shadow(0 0 8px ${arch.color})` }} />
          ))}
        </svg>
      )}

      <button data-press="true" onClick={close} style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', right: 22, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '9px 18px', color: 'rgba(255,255,255,0.62)', fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: '0.10em', cursor: 'pointer', zIndex: 10, minHeight: 44 }} aria-label="Fermer">Fermer</button>

      <div style={{ position: 'relative', zIndex: 1, padding: 'calc(env(safe-area-inset-top, 0px) + 72px) 28px 40px', display: 'flex', flexDirection: 'column', gap: 26, minHeight: '100%', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: `rgba(${arch.rgb},0.14)`, border: `1px solid ${arch.color}55`, borderRadius: 100, padding: '6px 16px', marginBottom: 18, animation: 'phrasebreathe 14s cubic-bezier(0.45,0,0.55,1) infinite' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: arch.color, letterSpacing: '0.24em', textTransform: 'uppercase' }}>{routine.duration}</span>
          </div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 400, fontSize: 28, color: 'white', margin: 0, lineHeight: 1.22, letterSpacing: '-0.01em', textShadow: `0 0 32px ${arch.color}44`, animation: 'phrasebreathe 14s cubic-bezier(0.45,0,0.55,1) infinite' }}>{routine.title}</h2>
        </div>

        <div style={{ background: `rgba(${arch.rgb},0.06)`, border: `1px solid ${arch.color}26`, borderRadius: 18, padding: '26px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: '14%', bottom: '14%', width: 2.5, background: `linear-gradient(180deg, transparent, ${arch.color}99, transparent)`, borderRadius: '0 2px 2px 0', animation: 'worldglow 8s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 12s ease-in-out 3s infinite' }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 17, color: 'rgba(255,255,255,0.92)', margin: 0, lineHeight: 1.72, fontStyle: 'italic', textShadow: `0 0 14px ${arch.color}22`, animation: 'phrasebreathe 28s cubic-bezier(0.45,0,0.55,1) infinite' }}>{routine.desc}</p>
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: 'rgba(255,255,255,0.50)', textAlign: 'center', margin: 0, lineHeight: 1.65, padding: '0 12px', animation: 'phrasebreathe 20s cubic-bezier(0.45,0,0.55,1) infinite' }}>Prends ton temps. Quand c'est fait, marque-le ici — pour toi, pas pour l'app.</p>

        <button onClick={handleComplete} disabled={completing} style={{ width: '100%', padding: '18px 0', background: done ? `rgba(${arch.rgb},0.20)` : `linear-gradient(135deg, rgba(${arch.rgb},0.95), rgba(${arch.rgb},0.78))`, border: done ? `1px solid ${arch.color}66` : 'none', borderRadius: 100, cursor: completing ? 'wait' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 600, letterSpacing: '0.24em', color: done ? arch.color : 'white', textTransform: 'uppercase', boxShadow: done ? 'none' : `0 6px 36px rgba(${arch.rgb},0.42), 0 0 60px rgba(${arch.rgb},0.18)`, animation: completing ? 'milestoneGlow 1.4s cubic-bezier(0.45,0,0.55,1) infinite' : 'milestoneGlow 5s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: done ? 'none' : '0 0 14px rgba(255,255,255,0.35)', minHeight: 54, opacity: completing ? 0.88 : 1, transition: 'opacity 0.3s ease' }}>
          {completing ? '✦ Bien joué' : done ? '✓ Déjà accomplie' : 'Marquer accomplie'}
        </button>
      </div>
    </div>
  )
}

function RoutinesScreen({ archetypeKey, completed, onToggle, onOpenVrai }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  const [flash, setFlash] = useState(false)
  const [celebrateIdx, setCelebrateIdx] = useState(null)
  const [guideIdx, setGuideIdx] = useState(null)
  const prevAllDone = useRef(false)
  const prevCompleted = useRef([...completed])
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [])
  useEffect(() => {
    completed.forEach((done, i) => {
      if (done && !prevCompleted.current[i]) {
        setCelebrateIdx(i)
        setTimeout(() => setCelebrateIdx(c => c === i ? null : c), 1200)
      }
    })
    prevCompleted.current = [...completed]
  }, [completed])
  const doneCount = completed.filter(Boolean).length
  const allDone = doneCount === arch.routines.length

  useEffect(() => {
    if (allDone && !prevAllDone.current) {
      setFlash(true)
      setTimeout(() => setFlash(false), 700)
    }
    prevAllDone.current = allDone
  }, [allDone])

  return (
    <div style={{ flex: 1, overflowY: 'auto', scrollBehavior: 'smooth', padding: '52px 22px calc(env(safe-area-inset-bottom, 0px) + 110px)', display: 'flex', flexDirection: 'column', gap: 14, opacity: vis ? 1 : 0, transition: 'opacity 0.6s ease', position: 'relative' }}>
      {flash && <div style={{ position: 'fixed', inset: 0, background: arch.color, opacity: 0.08, animation: 'lightFlash 0.7s ease forwards', pointerEvents: 'none', zIndex: 50 }} />}
      <div style={{ textAlign: 'center', marginBottom: 6, position: 'relative' }}>
        <div style={{ position: 'absolute', top: -52, left: -22, right: -22, height: 80, background: `linear-gradient(180deg, rgba(${arch.rgb},0.06) 0%, transparent 100%)`, pointerEvents: 'none', animation: 'worldglow 20s cubic-bezier(0.45,0,0.55,1) infinite' }} />
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: arch.color, letterSpacing: '0.20em', margin: '0 0 10px', textTransform: 'uppercase', animation: allDone ? 'phrasebreathe 18s cubic-bezier(0.45,0,0.55,1) infinite, seedPulse 5s ease-in-out 2s infinite, milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 18s cubic-bezier(0.45,0,0.55,1) infinite, seedPulse 5s ease-in-out 2s infinite', textShadow: `0 0 8px ${arch.color}33` }}>◈ Routines du jour</p>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 400, fontSize: 24, color: 'white', margin: 0, lineHeight: 1.2, animation: allDone ? 'milestoneGlow 5s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 30s ease-in-out 1s infinite', textShadow: allDone ? `0 0 28px ${arch.color}55, 0 2px 40px rgba(0,0,0,0.4)` : '0 2px 40px rgba(0,0,0,0.4)', transition: 'text-shadow 0.8s ease' }}>{{ resilience: <>Tes pratiques<br />de feu</>, presence: <>Tes pratiques<br />d'ancrage</>, sagesse: <>Tes pratiques<br />de sagesse</>, lumiere: <>Tes pratiques<br />lumineuses</> }[archetypeKey] || <>Tes pratiques<br />quotidiennes</>}</h2>

        {/* Barre de progression globale */}
        <div style={{ margin: '14px auto 0', width: '72%', maxWidth: 220 }}>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.09)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(doneCount / arch.routines.length) * 100}%`, background: `linear-gradient(90deg, ${arch.color}88, ${arch.color})`, borderRadius: 2, transition: 'width 0.6s ease', boxShadow: allDone ? `0 0 14px ${arch.color}cc, 0 0 28px ${arch.color}44` : doneCount > 0 ? `0 0 10px ${arch.color}66` : 'none', animation: allDone ? 'milestoneGlow 3.8s cubic-bezier(0.45,0,0.55,1) infinite' : doneCount > 0 ? 'worldglow 8s cubic-bezier(0.45,0,0.55,1) infinite' : 'none' }} />
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: allDone ? arch.color : doneCount > 0 ? arch.color : 'rgba(255,255,255,0.48)', margin: '7px 0 0', transition: 'color 0.4s ease', textShadow: allDone ? `0 0 14px ${arch.color}88` : doneCount > 0 ? `0 0 8px ${arch.color}44` : 'none', animation: allDone ? 'milestoneGlow 3.8s cubic-bezier(0.45,0,0.55,1) infinite' : doneCount > 0 ? 'phrasebreathe 24s cubic-bezier(0.45,0,0.55,1) infinite, seedPulse 4.2s ease-in-out 1s infinite' : 'none' }}>
            {allDone ? '✦ Toutes accomplies' : `${doneCount} / ${arch.routines.length} complétées`}
          </p>
        </div>
      </div>

      {arch.routines.map((r, i) => {
        const done = completed[i]
        return (
          <div key={i} style={{ background: done ? `rgba(${arch.rgb},0.1)` : 'rgba(255,255,255,0.05)', border: `1px solid ${done ? arch.color + '55' : 'rgba(255,255,255,0.09)'}`, borderRadius: 14, padding: '18px 16px', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'background 220ms cubic-bezier(0.4,0,0.2,1), border-color 220ms cubic-bezier(0.4,0,0.2,1), box-shadow 320ms cubic-bezier(0,0,0.2,1)', animation: celebrateIdx === i ? 'cardLiftDone 540ms cubic-bezier(0.34,1.56,0.64,1) both' : (vis ? 'tabslideIn 0.32s ease both' : 'none'), animationDelay: vis && celebrateIdx !== i ? `${0.18 + i * 0.08}s` : '0s', position: 'relative', overflow: 'hidden', boxShadow: done ? `0 0 18px rgba(${arch.rgb},0.10), inset 0 0 0 1px ${arch.color}22` : 'none' }}>
            {done && <div style={{ position: 'absolute', left: 0, top: '16%', bottom: '16%', width: 2.5, background: `linear-gradient(180deg, transparent, ${arch.color}cc, transparent)`, borderRadius: '0 2px 2px 0', animation: 'milestoneGlow 4.8s cubic-bezier(0.45,0,0.55,1) infinite', pointerEvents: 'none' }} />}
            {celebrateIdx === i && [0,1,2,3,4].map(j => (
              <div key={j} style={{ position: 'absolute', top: 8, left: `${12 + j * 18}%`, width: 5, height: 5, borderRadius: '50%', background: arch.color, animation: `milestoneMote ${0.9 + j * 0.18}s ease-out ${j * 0.08}s both`, pointerEvents: 'none', zIndex: 10, boxShadow: `0 0 6px ${arch.color}99` }} />
            ))}
            <button onClick={() => { haptic(done ? 6 : 18); onToggle(i) }} style={{ width: 34, height: 34, borderRadius: '50%', border: `2px solid ${done ? arch.color : 'rgba(255,255,255,0.30)'}`, touchAction: 'manipulation', background: done ? arch.color : 'transparent', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.28s ease', marginTop: 2, boxShadow: done ? `0 0 14px ${arch.shadow}` : 'none', transform: done ? 'scale(1.06)' : 'scale(1)', animation: done ? 'seedPulse 2.8s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 5s ease-in-out 1s infinite' : 'none' }}>
              {done && <span style={{ fontSize: 11, color: 'white', animation: 'milestoneGlow 3.6s cubic-bezier(0.45,0,0.55,1) infinite, seedPulse 2.4s ease-in-out 0.5s infinite' }}>✓</span>}
            </button>
            <div onClick={() => { haptic(6); setGuideIdx(i) }} role="button" tabIndex={0} style={{ flex: 1, cursor: 'pointer', minHeight: 44 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 16, color: done ? arch.color : 'white', margin: 0, transition: 'color 0.3s ease', textShadow: done ? `0 0 16px ${arch.color}66` : 'none', animation: done ? 'milestoneGlow 4.8s cubic-bezier(0.45,0,0.55,1) infinite' : (doneCount > 0 ? 'phrasebreathe 36s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 18s ease-in-out 4s infinite' : 'phrasebreathe 36s cubic-bezier(0.45,0,0.55,1) infinite') }}>{r.title}</p>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: done ? `${arch.color}99` : 'rgba(255,255,255,0.48)', flexShrink: 0, marginLeft: 8, animation: done ? 'seedPulse 3.5s cubic-bezier(0.45,0,0.55,1) infinite' : (doneCount > 0 ? 'phrasebreathe 34s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 16s ease-in-out 3s infinite' : 'phrasebreathe 34s cubic-bezier(0.45,0,0.55,1) infinite'), transition: 'color 0.4s ease', textShadow: done ? `0 0 8px ${arch.color}44` : `0 0 6px ${arch.color}18` }}>{r.duration}</span>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14.5, color: done ? 'rgba(255,255,255,0.44)' : 'rgba(255,255,255,0.82)', margin: 0, lineHeight: 1.65, textDecoration: done ? 'line-through' : 'none', transition: 'all 0.3s ease', animation: done ? 'none' : (doneCount > 0 ? 'phrasebreathe 44s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 20s ease-in-out 5s infinite' : 'phrasebreathe 44s cubic-bezier(0.45,0,0.55,1) infinite'), textShadow: done ? 'none' : `0 0 8px ${arch.color}15` }}>{r.desc}</p>
            </div>
          </div>
        )
      })}

      {allDone && (
        <div style={{ position: 'relative', background: `rgba(${arch.rgb},0.1)`, border: `1px solid ${arch.color}44`, borderRadius: 12, padding: '20px 16px', textAlign: 'center', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden', animation: 'forcespring 540ms cubic-bezier(0.34,1.56,0.64,1) both, presencePulse 6s cubic-bezier(0.45,0,0.55,1) 0.6s infinite' }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {[{x:10,y:50,r:1.8,dur:20,del:0},{x:50,y:20,r:1.4,dur:26,del:3.4},{x:88,y:60,r:2.0,dur:22,del:6.8},{x:30,y:80,r:1.6,dur:24,del:1.8},{x:70,y:30,r:1.2,dur:28,del:9.2}].map((m,i)=>(
              <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: 0.09, animation: `splashmote ${m.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
            ))}
          </svg>
          <div>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14.5, color: arch.color, margin: '0 0 4px', animation: 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 18px ${arch.color}55` }}>✦ Routines complètes.</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: `${arch.color}66`, margin: 0, animation: 'phrasebreathe 22s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 6s ease-in-out 2s infinite', textShadow: `0 0 14px ${arch.color}33` }}>{{ resilience: 'Ton feu nourrit chaque geste.', presence: 'Ta régularité est une eau profonde.', sagesse: 'Ta discipline forge ta sagesse.', lumiere: 'Ta constance crée de la lumière.' }[archetypeKey] || 'Ta constance est une force.'}</p>
          </div>
          {onOpenVrai && (
            <button onClick={() => { haptic([6, 60, 6]); onOpenVrai() }} style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg, rgba(225,168,40,0.94), rgba(200,140,25,0.90))', border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.22em', color: 'rgba(20,12,2,0.90)', textTransform: 'uppercase', animation: 'milestoneGlow 4.5s cubic-bezier(0.45,0,0.55,1) infinite', boxShadow: '0 6px 32px rgba(225,168,40,0.42), 0 2px 12px rgba(0,0,0,0.25)' }}>
              Entrer en Présence ✦
            </button>
          )}
        </div>
      )}
      {guideIdx !== null && (
        <RoutineGuideModal
          archetypeKey={archetypeKey}
          routine={arch.routines[guideIdx]}
          done={completed[guideIdx]}
          onClose={() => setGuideIdx(null)}
          onComplete={() => { if (!completed[guideIdx]) onToggle(guideIdx) }}
        />
      )}
    </div>
  )
}

// ─── QUÊTES SCREEN ────────────────────────────────────────────────────────────

function QuetesScreen({ archetypeKey, completed, onComplete, onOpenVrai }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  const [flash, setFlash] = useState(false)
  const [celebrateIdx, setCelebrateIdx] = useState(null)
  const [guideIdx, setGuideIdx] = useState(null)
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [])

  const handleComplete = (i) => {
    haptic([20, 50, 30])
    onComplete(i)
    setFlash(true)
    setTimeout(() => setFlash(false), 700)
    setCelebrateIdx(i)
    setTimeout(() => setCelebrateIdx(c => c === i ? null : c), 1400)
  }
  const doneCount = completed.filter(Boolean).length
  const allDone = doneCount === arch.quetes.length

  return (
    <div style={{ flex: 1, overflowY: 'auto', scrollBehavior: 'smooth', padding: '52px 22px calc(env(safe-area-inset-bottom, 0px) + 110px)', display: 'flex', flexDirection: 'column', gap: 14, opacity: vis ? 1 : 0, transition: 'opacity 0.6s ease', position: 'relative' }}>
      {flash && <div style={{ position: 'fixed', inset: 0, background: arch.color, opacity: 0.08, animation: 'lightFlash 0.7s ease forwards', pointerEvents: 'none', zIndex: 50 }} />}
      <div style={{ textAlign: 'center', marginBottom: 6, position: 'relative' }}>
        <div style={{ position: 'absolute', top: -52, left: -22, right: -22, height: 80, background: `linear-gradient(180deg, rgba(${arch.rgb},0.06) 0%, transparent 100%)`, pointerEvents: 'none', animation: 'worldglow 22s ease-in-out 4s infinite' }} />
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: arch.color, letterSpacing: '0.20em', margin: '0 0 10px', textTransform: 'uppercase', animation: allDone ? 'phrasebreathe 18s cubic-bezier(0.45,0,0.55,1) infinite, seedPulse 5s ease-in-out 2.5s infinite, milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 18s cubic-bezier(0.45,0,0.55,1) infinite, seedPulse 5s ease-in-out 2.5s infinite', textShadow: `0 0 8px ${arch.color}33` }}>◇ Quêtes</p>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 400, fontSize: 24, color: 'white', margin: 0, lineHeight: 1.2, animation: allDone ? 'milestoneGlow 5s cubic-bezier(0.45,0,0.55,1) infinite' : 'phrasebreathe 34s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: allDone ? `0 0 28px ${arch.color}55, 0 2px 40px rgba(0,0,0,0.4)` : '0 2px 40px rgba(0,0,0,0.4)', transition: 'text-shadow 0.8s ease' }}>{{ resilience: <>Tes défis<br />courageux</>, presence: <>Tes défis<br />de présence</>, sagesse: <>Tes défis<br />intérieurs</>, lumiere: <>Tes défis<br />créatifs</> }[archetypeKey] || <>Tes défis<br />bienveillants</>}</h2>
        <div style={{ margin: '14px auto 0', width: '72%', maxWidth: 220 }}>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.09)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(doneCount / arch.quetes.length) * 100}%`, background: `linear-gradient(90deg, ${arch.color}88, ${arch.color})`, borderRadius: 2, transition: 'width 0.6s ease', boxShadow: allDone ? `0 0 14px ${arch.color}cc, 0 0 28px ${arch.color}44` : doneCount > 0 ? `0 0 10px ${arch.color}66` : 'none', animation: allDone ? 'milestoneGlow 3.8s cubic-bezier(0.45,0,0.55,1) infinite' : doneCount > 0 ? 'worldglow 8s cubic-bezier(0.45,0,0.55,1) infinite' : 'none' }} />
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: allDone ? arch.color : doneCount > 0 ? arch.color : 'rgba(255,255,255,0.48)', margin: '7px 0 0', transition: 'color 0.4s ease', textShadow: allDone ? `0 0 14px ${arch.color}88` : doneCount > 0 ? `0 0 8px ${arch.color}44` : 'none', animation: allDone ? 'milestoneGlow 3.8s cubic-bezier(0.45,0,0.55,1) infinite' : doneCount > 0 ? 'phrasebreathe 24s cubic-bezier(0.45,0,0.55,1) infinite, seedPulse 4.2s ease-in-out 1s infinite' : 'none' }}>
            {allDone ? '✦ Quêtes accomplies' : `${doneCount} / ${arch.quetes.length} accomplies`}
          </p>
        </div>
      </div>

      {arch.quetes.map((q, i) => {
        const done = completed[i]
        const locked = i > 0 && !completed[i - 1]
        const isNext = !done && !locked && (i === 0 || completed[i - 1])
        return (
          <div key={i} onClick={() => { if (!locked) { haptic(6); setGuideIdx(i) } }} role={!locked ? "button" : undefined} tabIndex={!locked ? 0 : undefined} aria-label={!locked ? `Voir la quête ${q.title}` : undefined} style={{ background: done ? `rgba(${arch.rgb},0.1)` : locked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', border: `1px solid ${done ? arch.color + '55' : locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 14, padding: '18px 16px', opacity: locked ? 0.35 : 1, filter: locked ? 'blur(0.6px)' : 'none', transform: locked ? 'scale(0.98)' : 'scale(1)', transition: 'all 0.3s ease', animation: vis ? 'tabslideIn 0.32s ease both' : 'none', animationDelay: vis ? `${0.18 + i * 0.1}s` : '0s', position: 'relative', overflow: 'hidden', boxShadow: done ? `0 0 20px rgba(${arch.rgb},0.12), inset 0 0 0 1px ${arch.color}22` : 'none', cursor: !locked ? 'pointer' : 'default' }}>
            {done && <div style={{ position: 'absolute', left: 0, top: '16%', bottom: '16%', width: 2.5, background: `linear-gradient(180deg, transparent, ${arch.color}cc, transparent)`, borderRadius: '0 2px 2px 0', animation: 'milestoneGlow 4.8s cubic-bezier(0.45,0,0.55,1) infinite', pointerEvents: 'none' }} />}
            {celebrateIdx === i && [0,1,2,3,4,5].map(j => (
              <div key={j} style={{ position: 'absolute', top: 10, left: `${8 + j * 16}%`, width: 5, height: 5, borderRadius: '50%', background: arch.color, animation: `milestoneMote ${1.0 + j * 0.2}s ease-out ${j * 0.07}s both`, pointerEvents: 'none', zIndex: 10, boxShadow: `0 0 8px ${arch.color}cc` }} />
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16, color: done ? arch.color : locked ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.42)', animation: (!done && !locked) ? `seedPulse ${3.4 + i * 0.6}s ease-in-out ${i * 0.5}s infinite` : 'none', textShadow: done ? `0 0 12px ${arch.color}66` : (!locked && !done) ? `0 0 8px ${arch.color}33` : 'none' }}>{locked ? '◻' : q.icon}</span>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 16.5, color: done ? arch.color : locked ? 'rgba(255,255,255,0.26)' : 'white', margin: 0, transition: 'color 0.3s ease', textShadow: done ? `0 0 16px ${arch.color}66` : isNext ? `0 0 12px ${arch.color}33` : 'none', animation: done ? 'milestoneGlow 4.6s cubic-bezier(0.45,0,0.55,1) infinite' : isNext ? 'phrasebreathe 20s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 9s ease-in-out 3s infinite' : 'none' }}>{q.title}</p>
              </div>
              {done && <span style={{ fontSize: 11, color: arch.color, flexShrink: 0, marginLeft: 8, animation: 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite' }}>✓</span>}
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14.5, color: locked ? 'rgba(255,255,255,0.18)' : done ? 'rgba(255,255,255,0.56)' : 'rgba(255,255,255,0.78)', margin: '0 0 14px', lineHeight: 1.62, animation: (!done && !locked) ? (isNext ? 'phrasebreathe 46s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 12s ease-in-out 3s infinite' : 'phrasebreathe 46s cubic-bezier(0.45,0,0.55,1) infinite') : 'none', textShadow: done ? `0 0 8px ${arch.color}14` : isNext ? `0 0 10px ${arch.color}22` : 'none' }}>
              {locked ? 'Accomplis la quête précédente pour révéler celle-ci.' : q.desc}
            </p>
            {!done && !locked && (
              <button data-press="true" onClick={(e) => { e.stopPropagation(); handleComplete(i) }} style={{ width: '100%', padding: '12px 0', background: isNext ? `rgba(${arch.rgb},0.88)` : `rgba(${arch.rgb},0.60)`, border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.18em', color: 'white', textTransform: 'uppercase', boxShadow: isNext ? `0 4px 28px rgba(${arch.rgb},0.40)` : `0 2px 16px rgba(${arch.rgb},0.25)`, animation: isNext ? 'milestoneGlow 3.8s cubic-bezier(0.45,0,0.55,1) infinite' : 'milestoneGlow 6s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: isNext ? `0 0 12px ${arch.color}66` : 'none' }}>
                Marquer accomplie
              </button>
            )}
          </div>
        )
      })}

      {guideIdx !== null && (
        <QuetesGuideModal
          archetypeKey={archetypeKey}
          quete={arch.quetes[guideIdx]}
          done={completed[guideIdx]}
          locked={guideIdx > 0 && !completed[guideIdx - 1]}
          onClose={() => setGuideIdx(null)}
          onComplete={() => { if (!completed[guideIdx]) onComplete(guideIdx) }}
        />
      )}
      {allDone && (
        <div style={{ position: 'relative', background: `rgba(${arch.rgb},0.1)`, border: `1px solid ${arch.color}44`, borderRadius: 12, padding: '20px 16px', textAlign: 'center', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden', animation: 'presencePulse 7s ease-in-out 1.5s infinite' }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {[{x:8,y:40,r:1.6,dur:22,del:0},{x:48,y:15,r:1.4,dur:28,del:3.8},{x:90,y:55,r:1.8,dur:20,del:7.1},{x:26,y:78,r:1.2,dur:26,del:1.6},{x:68,y:28,r:2.0,dur:24,del:9.4}].map((m,i)=>(
              <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: 0.09, animation: `splashmote ${m.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
            ))}
          </svg>
          <div>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 15.5, color: arch.color, margin: '0 0 6px', animation: 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 18px ${arch.color}55` }}>✦ Toutes tes quêtes accomplies.</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: `${arch.color}66`, margin: 0, animation: 'phrasebreathe 24s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 8s ease-in-out 2.5s infinite', textShadow: `0 0 14px ${arch.color}33` }}>{{ resilience: 'Tu as transformé l\'intention en action.', presence: 'Tu as tenu ta promesse intérieure.', sagesse: 'Ta quête intérieure avance.', lumiere: 'Ta lumière grandit à chaque pas.' }[archetypeKey] || 'Tu avances avec courage.'}</p>
          </div>
          {onOpenVrai && (
            <button onClick={() => { haptic([6, 60, 6]); onOpenVrai() }} style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg, rgba(225,168,40,0.94), rgba(200,140,25,0.90))', border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.22em', color: 'rgba(20,12,2,0.90)', textTransform: 'uppercase', animation: 'milestoneGlow 4.5s cubic-bezier(0.45,0,0.55,1) infinite', boxShadow: '0 6px 32px rgba(225,168,40,0.42), 0 2px 12px rgba(0,0,0,0.25)' }}>
              Entrer en Présence ✦
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── BOUTIQUE SCREEN ──────────────────────────────────────────────────────────

const CAVA_PIECES = [
  { img: 'cava/shoot-mains.avif',       phrase: 'Moins de jugements,\nplus de mains tendues.' },
  { img: 'cava/shoot-respire.avif',     phrase: 'Respire,\nc\'est résister.' },
  { img: 'cava/shoot-regard.avif',      phrase: 'Un regard, un geste,\nune parole, peuvent sauver.' },
  { img: 'cava/shoot-citron.avif',      phrase: 'À force d\'être pressé,\nj\'ai perdu le goût.' },
  { img: 'cava/shoot-multiplicite.avif',phrase: 'La multiplicité\nest une nécessité.' },
  { img: 'cava/shoot-dos.avif',         phrase: 'Ce que tu portes\nparle pour toi.' },
]

function BoutiqueScreen({ archetypeKey }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  const [activeIdx, setActiveIdx] = useState(null)
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [])

  const openShop = () => {
    haptic([10, 40, 10])
    window.open('https://cava-brand.com', '_blank', 'noopener')
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 100px', display: 'flex', flexDirection: 'column', opacity: vis ? 1 : 0, transition: 'opacity 0.7s ease' }}>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', overflow: 'hidden', flexShrink: 0 }}>
        <img src={`${B}cava/shoot-vraiçava.avif`} alt="ÇA VA?" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,8,16,0.18) 0%, rgba(5,8,16,0.0) 40%, rgba(5,8,16,0.72) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 28, left: 22, right: 22 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: arch.color, letterSpacing: '0.26em', textTransform: 'uppercase', margin: '0 0 8px', animation: 'phrasebreathe 22s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 18px ${arch.color}88` }}>LA MARQUE</p>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 42, color: 'white', margin: '0 0 10px', letterSpacing: '0.08em', lineHeight: 1, textShadow: '0 2px 40px rgba(0,0,0,0.6)' }}>ÇA VA?</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.82)', margin: 0, lineHeight: 1.55, textShadow: '0 1px 20px rgba(0,0,0,0.5)', maxWidth: 260 }}>Des vêtements qui posent<br />la vraie question.</p>
        </div>
      </div>

      {/* ── Manifeste ── */}
      <div style={{ padding: '32px 24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${arch.color}44, transparent)`, animation: 'worldglow 12s cubic-bezier(0.45,0,0.55,1) infinite' }} />
        <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 18, color: 'rgba(255,255,255,0.92)', margin: 0, lineHeight: 1.65, animation: 'phrasebreathe 34s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 30px ${arch.color}22` }}>
          "Ça va ?" — on le dit tous les jours,<br />mais on attend rarement la vraie réponse.
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14.5, color: 'rgba(255,255,255,0.68)', margin: 0, lineHeight: 1.75, animation: 'phrasebreathe 42s cubic-bezier(0.45,0,0.55,1) infinite' }}>
          ÇA VA? est une marque de streetwear émotionnel. Chaque pièce porte une phrase, une question, une vérité qu'on n'ose pas toujours dire à voix haute. Porter ÇA VA?, c'est choisir l'authenticité.
        </p>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${arch.color}22, transparent)`, animation: 'worldglow 16s ease-in-out 4s infinite' }} />
      </div>

      {/* ── Graphisme signature ── */}
      <div style={{ padding: '28px 24px 0', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <img src={`${B}cava/graph-masque.avif`} alt="" style={{ width: 90, height: 90, objectFit: 'contain', objectPosition: 'center', opacity: 0.88, flexShrink: 0, animation: 'animalfloat 22s cubic-bezier(0.45,0,0.55,1) infinite' }} />
        <div style={{ flex: 1, paddingTop: 8 }}>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 13, color: arch.color, letterSpacing: '0.06em', margin: '0 0 6px', animation: 'phrasebreathe 26s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 10s ease-in-out 2s infinite', textShadow: `0 0 16px ${arch.color}66` }}>Et toi, ça va vraiment ?</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13.5, color: 'rgba(255,255,255,0.60)', margin: 0, lineHeight: 1.7, animation: 'phrasebreathe 38s ease-in-out 2s infinite' }}>La question derrière le vêtement. Celle qui change tout quand elle est sincère.</p>
        </div>
      </div>

      {/* ── Grille pièces ── */}
      <div style={{ padding: '28px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: arch.color, letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 6px', animation: 'phrasebreathe 22s cubic-bezier(0.45,0,0.55,1) infinite' }}>— Les pièces</p>

        {/* Rangée 1 : grande + petite */}
        <div style={{ display: 'flex', gap: 10, height: 280 }}>
          <div onClick={() => setActiveIdx(activeIdx === 0 ? null : 0)} style={{ flex: 1.4, position: 'relative', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', border: activeIdx === 0 ? `1px solid ${arch.color}55` : '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.3s ease' }}>
            <img src={`${B}${CAVA_PIECES[0].img}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', transition: 'transform 0.5s ease', transform: activeIdx === 0 ? 'scale(1.04)' : 'scale(1)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 45%, rgba(5,8,16,0.88) 100%)' }} />
            <p style={{ position: 'absolute', bottom: 14, left: 14, right: 14, fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 12.5, color: 'white', margin: 0, lineHeight: 1.45, textShadow: '0 1px 12px rgba(0,0,0,0.7)', whiteSpace: 'pre-line' }}>{CAVA_PIECES[0].phrase}</p>
          </div>
          <div onClick={() => setActiveIdx(activeIdx === 1 ? null : 1)} style={{ flex: 1, position: 'relative', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', border: activeIdx === 1 ? `1px solid ${arch.color}55` : '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.3s ease' }}>
            <img src={`${B}${CAVA_PIECES[1].img}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', transition: 'transform 0.5s ease', transform: activeIdx === 1 ? 'scale(1.04)' : 'scale(1)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(5,8,16,0.90) 100%)' }} />
            <p style={{ position: 'absolute', bottom: 12, left: 12, right: 12, fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 11.5, color: 'white', margin: 0, lineHeight: 1.4, textShadow: '0 1px 12px rgba(0,0,0,0.7)', whiteSpace: 'pre-line' }}>{CAVA_PIECES[1].phrase}</p>
          </div>
        </div>

        {/* Rangée 2 : pleine largeur */}
        <div onClick={() => setActiveIdx(activeIdx === 2 ? null : 2)} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', height: 200, cursor: 'pointer', border: activeIdx === 2 ? `1px solid ${arch.color}55` : '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.3s ease' }}>
          <img src={`${B}${CAVA_PIECES[2].img}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 45%', display: 'block', transition: 'transform 0.5s ease', transform: activeIdx === 2 ? 'scale(1.03)' : 'scale(1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(5,8,16,0.0) 40%, rgba(5,8,16,0.80) 100%)' }} />
          <p style={{ position: 'absolute', bottom: 20, right: 20, fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 13, color: 'white', margin: 0, lineHeight: 1.5, textShadow: '0 1px 12px rgba(0,0,0,0.7)', textAlign: 'right', maxWidth: '55%', whiteSpace: 'pre-line' }}>{CAVA_PIECES[2].phrase}</p>
        </div>

        {/* Rangée 3 : deux égales */}
        <div style={{ display: 'flex', gap: 10, height: 240 }}>
          {[3, 4].map((idx) => (
            <div key={idx} onClick={() => setActiveIdx(activeIdx === idx ? null : idx)} style={{ flex: 1, position: 'relative', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', border: activeIdx === idx ? `1px solid ${arch.color}55` : '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.3s ease' }}>
              <img src={`${B}${CAVA_PIECES[idx].img}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', transition: 'transform 0.5s ease', transform: activeIdx === idx ? 'scale(1.04)' : 'scale(1)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(5,8,16,0.92) 100%)' }} />
              <p style={{ position: 'absolute', bottom: 12, left: 12, right: 12, fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 11, color: 'white', margin: 0, lineHeight: 1.4, textShadow: '0 1px 10px rgba(0,0,0,0.8)', whiteSpace: 'pre-line' }}>{CAVA_PIECES[idx].phrase}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Citation + graphisme ── */}
      <div style={{ padding: '32px 24px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <img src={`${B}cava/graph-equilibre.avif`} alt="" style={{ width: 72, height: 72, objectFit: 'contain', opacity: 0.80, flexShrink: 0, animation: 'animalfloat 28s ease-in-out 4s infinite' }} />
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${arch.color}33, transparent)`, animation: 'worldglow 14s cubic-bezier(0.45,0,0.55,1) infinite' }} />
        </div>
        <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 20, color: 'rgba(255,255,255,0.88)', margin: 0, lineHeight: 1.55, animation: 'phrasebreathe 40s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 40px ${arch.color}18` }}>
          "Un vrai 'ça va'<br />peut tout changer."
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: `${arch.color}88`, letterSpacing: '0.18em', margin: 0, textTransform: 'uppercase', animation: 'phrasebreathe 28s ease-in-out 1s infinite' }}>— ÇA VA? · Collection 2026</p>
      </div>

      {/* ── Photo couple ── */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', aspectRatio: '4/3', border: `1px solid ${arch.color}22` }}>
          <img src={`${B}cava/shoot-couple.avif`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 55%, rgba(5,8,16,0.85) 100%)` }} />
          <div style={{ position: 'absolute', bottom: 20, left: 22, right: 22 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: arch.color, letterSpacing: '0.24em', textTransform: 'uppercase', margin: '0 0 5px', animation: 'phrasebreathe 24s cubic-bezier(0.45,0,0.55,1) infinite' }}>Unisexe · Capsule 2026</p>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 15, color: 'rgba(255,255,255,0.90)', margin: 0, lineHeight: 1.4 }}>Pour ceux qui portent leurs émotions à fleur de peau.</p>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: '32px 22px 0', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <img src={`${B}cava/graph-visages.avif`} alt="" style={{ width: 88, height: 88, objectFit: 'contain', opacity: 0.72, animation: 'animalfloat 20s ease-in-out 2s infinite' }} />
        <button data-press="true" onClick={openShop} style={{ width: '100%', padding: '17px 0', background: `linear-gradient(135deg, ${arch.color}, ${arch.color}cc)`, border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 500, letterSpacing: '0.22em', color: '#050810', textTransform: 'uppercase', boxShadow: `0 6px 32px rgba(${arch.rgb},0.45), 0 0 0 1px ${arch.color}44`, animation: 'milestoneGlow 5s cubic-bezier(0.45,0,0.55,1) infinite' }}>
          Découvrir ÇA VA?
        </button>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.28)', margin: 0, textAlign: 'center', letterSpacing: '0.04em', lineHeight: 1.6 }}>
          cava-brand.com
        </p>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: '28px 24px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${arch.color}22, transparent)` }} />
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: `${arch.color}44`, letterSpacing: '0.28em', textTransform: 'uppercase', margin: 0, animation: 'phrasebreathe 30s cubic-bezier(0.45,0,0.55,1) infinite' }}>ÇA VA? × NÉYA · 2026</p>
      </div>

    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

function ApaisementSensorielModal({ archetypeKey, onClose }) {
  const arch = ARCHETYPES[archetypeKey] || ARCHETYPES.presence
  const [vis, setVis] = useState(false)
  const { exiting, close } = useExitAnimation(onClose, 280)
  const [pointerPos, setPointerPos] = useState(null)
  const [litDots, setLitDots] = useState([])
  const containerRef = useRef(null)
  const dragRef = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => setVis(true), 30)
    return () => clearTimeout(t)
  }, [])

  const DOTS = useMemo(() => {
    const arr = []
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2
      const r = 26 + (i % 3) * 7
      arr.push({ id: i, x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r * 0.78 })
    }
    return arr
  }, [])

  const handlePointer = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const cx = (e.touches ? e.touches[0].clientX : e.clientX)
    const cy = (e.touches ? e.touches[0].clientY : e.clientY)
    const x = ((cx - rect.left) / rect.width) * 100
    const y = ((cy - rect.top) / rect.height) * 100
    setPointerPos({ x, y })

    DOTS.forEach(dot => {
      if (litDots.includes(dot.id)) return
      const dx = dot.x - x
      const dy = (dot.y - y) * 1.25 // compensate ratio
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 7) {
        if (!litDots.includes(dot.id)) {
          haptic(4)
          try { playChime(dot.id) } catch {}
          setLitDots(prev => prev.includes(dot.id) ? prev : [...prev, dot.id])
        }
      }
    })
  }

  const handleStart = (e) => {
    dragRef.current = true
    handlePointer(e)
  }
  const handleMove = (e) => {
    if (!dragRef.current) return
    e.preventDefault && e.preventDefault()
    handlePointer(e)
  }
  const handleEnd = () => {
    dragRef.current = false
    setTimeout(() => setPointerPos(null), 400)
  }

  const allLit = litDots.length === DOTS.length

  useEffect(() => {
    if (allLit) {
      haptic([20, 80, 20, 80, 30])
      try {
        addSouvenir('first_apaisement')
        addSouvenir('apaisement_session', { count: 12 })
      } catch {}
    }
  }, [allLit])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 880, background: 'rgba(2,3,8,0.97)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', opacity: (vis && !exiting) ? 1 : 0, transition: 'opacity 280ms cubic-bezier(0.4,0,1,1)', overflow: 'hidden', animation: exiting ? 'sheetExit 280ms cubic-bezier(0.4,0,1,1) both' : (vis ? 'modalEnter 440ms cubic-bezier(0.16,1.36,0.32,1) both' : 'none'), touchAction: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 48%, rgba(${arch.rgb},${0.08 + (litDots.length / 12) * 0.20}) 0%, transparent 65%)`, transition: 'background 1.2s cubic-bezier(0.45,0,0.55,1)', pointerEvents: 'none' }} />

      <button data-press="true" onClick={close} aria-label="Quitter l'apaisement" style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', right: 18, background: 'rgba(5,8,16,0.42)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 100, width: 44, height: 44, color: 'rgba(255,255,255,0.78)', fontFamily: 'Inter, sans-serif', fontSize: 18, lineHeight: 1, cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>✕</button>

      <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 50px)', left: 0, right: 0, textAlign: 'center', zIndex: 5, padding: '0 32px', pointerEvents: 'none' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: arch.color, letterSpacing: '0.32em', textTransform: 'uppercase', margin: '0 0 14px', animation: 'signaturePulse 14s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 14px ${arch.color}66` }}>◌ Apaisement sensoriel</p>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 22, color: 'white', margin: 0, lineHeight: 1.32, letterSpacing: '-0.01em', textShadow: `0 0 22px ${arch.color}33` }}>{allLit ? 'Le corps est revenu.' : 'Glisse ton doigt sur les points.'}</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13, color: 'rgba(255,255,255,0.62)', margin: '10px 0 0', fontStyle: 'italic', lineHeight: 1.55, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>{allLit ? "Tu as touché à douze présences. Tu es là." : 'Aucune séquence, aucune hâte. Touche, sens, respire.'}</p>
      </div>

      {/* Touch container */}
      <div
        ref={containerRef}
        onPointerDown={handleStart}
        onPointerMove={handleMove}
        onPointerUp={handleEnd}
        onPointerCancel={handleEnd}
        onPointerLeave={handleEnd}
        style={{ position: 'absolute', inset: 0, zIndex: 3, cursor: 'crosshair' }}
      >
        {/* Dots */}
        {DOTS.map((dot) => {
          const lit = litDots.includes(dot.id)
          return (
            <div key={dot.id} style={{
              position: 'absolute',
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              transform: 'translate(-50%, -50%)',
              width: lit ? 28 : 22,
              height: lit ? 28 : 22,
              borderRadius: '50%',
              background: lit ? `radial-gradient(circle, ${arch.color} 0%, rgba(${arch.rgb},0.30) 60%, transparent 100%)` : 'rgba(255,255,255,0.08)',
              border: lit ? `1px solid ${arch.color}88` : `1px solid rgba(255,255,255,0.18)`,
              boxShadow: lit ? `0 0 16px ${arch.color}, 0 0 32px ${arch.color}66` : 'none',
              transition: 'width 380ms cubic-bezier(0.34,1.56,0.64,1), height 380ms cubic-bezier(0.34,1.56,0.64,1), background 480ms cubic-bezier(0,0,0.2,1), box-shadow 480ms cubic-bezier(0,0,0.2,1), border-color 380ms cubic-bezier(0,0,0.2,1)',
              animation: lit ? 'chipPop 480ms cubic-bezier(0.34,1.56,0.64,1) both, signaturePulse 8s cubic-bezier(0.45,0,0.55,1) 0.6s infinite' : 'none',
              pointerEvents: 'none',
            }} />
          )
        })}

        {/* Glow follower */}
        {pointerPos && (
          <div style={{
            position: 'absolute',
            left: `${pointerPos.x}%`,
            top: `${pointerPos.y}%`,
            transform: 'translate(-50%, -50%)',
            width: 80, height: 80,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${arch.rgb},0.42) 0%, rgba(${arch.rgb},0.18) 40%, transparent 75%)`,
            boxShadow: `0 0 32px ${arch.color}99`,
            transition: 'left 80ms cubic-bezier(0.45,0,0.55,1), top 80ms cubic-bezier(0.45,0,0.55,1), opacity 240ms ease',
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* Counter */}
      <div style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 130px)', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 5, flexWrap: 'wrap', padding: '0 32px', maxWidth: 320, margin: '0 auto' }}>
        {DOTS.map((dot) => (
          <div key={`c-${dot.id}`} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: litDots.includes(dot.id) ? arch.color : 'rgba(255,255,255,0.18)',
            boxShadow: litDots.includes(dot.id) ? `0 0 8px ${arch.color}` : 'none',
            transition: 'background 480ms cubic-bezier(0,0,0.2,1), box-shadow 480ms cubic-bezier(0,0,0.2,1)',
          }} />
        ))}
      </div>

      {allLit && (
        <button data-press="true" onClick={close} aria-label="Continuer" style={{
          position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 40px)',
          left: '50%', transform: 'translateX(-50%)',
          padding: '16px 36px',
          background: `linear-gradient(135deg, rgba(${arch.rgb},0.95), rgba(${arch.rgb},0.78))`,
          border: 'none', borderRadius: 100, color: 'white',
          fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 600,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: `0 6px 36px rgba(${arch.rgb},0.45), 0 0 60px rgba(${arch.rgb},0.20)`,
          animation: 'breathExpand 620ms cubic-bezier(0.22,1,0.36,1) both, milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) 0.8s infinite',
          minHeight: 52, zIndex: 5,
          textShadow: '0 0 14px rgba(255,255,255,0.35)',
        }}>
          Continuer ✦
        </button>
      )}
    </div>
  )
}

function LiberationPenseesModal({ archetypeKey, onClose }) {
  const arch = ARCHETYPES[archetypeKey] || ARCHETYPES.presence
  const [vis, setVis] = useState(false)
  const { exiting, close } = useExitAnimation(onClose, 280)
  const [thoughts, setThoughts] = useState([])
  const [released, setReleased] = useState([])
  const [bursts, setBursts] = useState([])

  const POOL = [
    'Je ne suis pas assez',
    "J'ai trop à faire",
    'Je suis fatigué·e',
    'Tout va trop vite',
    "J'ai peur",
    "Je n'y arrive pas",
    'Tout le monde fait mieux',
    'Je dois être parfait·e',
    'Personne ne me comprend',
    'Demain sera pire',
    'Je devrais déjà avoir réussi',
    'Je suis seul·e',
    'Ça ne changera jamais',
    "J'ai honte",
    'Je suis trop lent·e',
  ]

  useEffect(() => {
    const t = setTimeout(() => setVis(true), 30)
    const shuffled = [...POOL].sort(() => Math.random() - 0.5).slice(0, 5)
    setThoughts(shuffled.map((text, i) => ({
      id: `${Date.now()}-${i}`,
      text,
      x: 22 + (i * 14) % 56 + (Math.random() - 0.5) * 8,
      y: 36 + (i * 13) % 32 + (Math.random() - 0.5) * 6,
      driftSeed: i * 1.7,
    })))
    return () => clearTimeout(t)
  }, [])

  const releaseThought = (id, e) => {
    if (released.includes(id)) return
    haptic(8)
    try { playRelease() } catch {}
    let x = 0, y = 0
    try {
      const rect = e.currentTarget.getBoundingClientRect()
      x = rect.left + rect.width / 2
      y = rect.top + rect.height / 2
    } catch {}
    const bid = `b-${Date.now()}-${Math.random()}`
    setBursts(prev => [...prev, { id: bid, x, y }])
    setReleased(prev => [...prev, id])
    setTimeout(() => setBursts(prev => prev.filter(b => b.id !== bid)), 1300)
  }

  const allReleased = thoughts.length > 0 && released.length === thoughts.length

  useEffect(() => {
    if (allReleased) {
      haptic([20, 80, 20, 80, 30])
      try {
        addSouvenir('first_liberation')
        addSouvenir('liberation_session', { releasedCount: released.length })
      } catch {}
    }
  }, [allReleased])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 880, background: 'rgba(2,3,8,0.97)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', opacity: (vis && !exiting) ? 1 : 0, transition: 'opacity 280ms cubic-bezier(0.4,0,1,1)', overflow: 'hidden', animation: exiting ? 'sheetExit 280ms cubic-bezier(0.4,0,1,1) both' : (vis ? 'modalEnter 440ms cubic-bezier(0.16,1.36,0.32,1) both' : 'none') }}>
      {/* Ambient glow that brightens as user releases thoughts */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 45%, rgba(${arch.rgb},${0.08 + (released.length / Math.max(1, thoughts.length)) * 0.22}) 0%, transparent 65%)`, transition: 'background 1.6s cubic-bezier(0.45,0,0.55,1)', pointerEvents: 'none' }} />

      <button data-press="true" onClick={close} aria-label="Quitter la libération" style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', right: 18, background: 'rgba(5,8,16,0.42)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 100, width: 44, height: 44, color: 'rgba(255,255,255,0.78)', fontFamily: 'Inter, sans-serif', fontSize: 18, lineHeight: 1, cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>✕</button>

      <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 50px)', left: 0, right: 0, textAlign: 'center', zIndex: 5, padding: '0 32px', pointerEvents: 'none' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: arch.color, letterSpacing: '0.32em', textTransform: 'uppercase', margin: '0 0 14px', animation: 'signaturePulse 14s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 14px ${arch.color}66` }}>◍ Libération des pensées</p>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 22, color: 'white', margin: 0, lineHeight: 1.32, letterSpacing: '-0.01em', textShadow: `0 0 22px ${arch.color}33` }}>{allReleased ? "L'espace s'est éclairci." : 'Touche ce qui pèse.'}</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13, color: 'rgba(255,255,255,0.62)', margin: '10px 0 0', fontStyle: 'italic', lineHeight: 1.55, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>{allReleased ? 'Ces pensées ne sont pas toi. Elles n\'étaient que de passage.' : 'Chaque pensée est un nuage. Tu peux la laisser passer.'}</p>
      </div>

      {/* Thoughts area */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3 }}>
        {thoughts.map((t) => {
          if (released.includes(t.id)) return null
          return (
            <button key={t.id} onClick={(e) => releaseThought(t.id, e)} aria-label={`Libérer: ${t.text}`} style={{
              position: 'absolute',
              left: `${t.x}%`,
              top: `${t.y}%`,
              transform: 'translate(-50%, -50%)',
              background: 'rgba(20,22,32,0.78)',
              border: '1px solid rgba(120,130,160,0.30)',
              borderRadius: 100,
              padding: '12px 20px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 300,
              fontSize: 13.5,
              color: 'rgba(220,225,240,0.88)',
              letterSpacing: '0.01em',
              cursor: 'pointer',
              boxShadow: '0 4px 22px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
              animation: `thoughtFloat ${22 + t.driftSeed * 3}s cubic-bezier(0.45,0,0.55,1) infinite, fadeIn 1.4s cubic-bezier(0,0,0.2,1) both`,
              animationDelay: `${t.driftSeed * 0.5}s, ${t.driftSeed * 0.4}s`,
              minWidth: 120,
              maxWidth: 220,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}>
              {t.text}
            </button>
          )
        })}
      </div>

      {/* Particle bursts on dissolve */}
      {bursts.map((b) => (
        <div key={b.id} style={{ position: 'fixed', left: b.x, top: b.y, pointerEvents: 'none', zIndex: 10, width: 0, height: 0 }}>
          {[0,1,2,3,4,5,6,7,8,9].map((i) => {
            const angle = (i / 10) * Math.PI * 2
            const dist = 80 + (i % 3) * 20
            const tx = Math.cos(angle) * dist
            const ty = Math.sin(angle) * dist
            return (
              <div key={i} style={{
                position: 'absolute', left: 0, top: 0,
                width: 5, height: 5,
                borderRadius: '50%',
                background: arch.color,
                boxShadow: `0 0 8px ${arch.color}, 0 0 16px ${arch.color}88`,
                opacity: 0,
                '--tx': `${tx}px`,
                '--ty': `${ty}px`,
                animation: `thoughtBurst 1.1s cubic-bezier(0,0,0.2,1) ${i * 0.022}s forwards`,
              }} />
            )
          })}
        </div>
      ))}

      {/* Counter dots */}
      <div style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 130px)', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12, zIndex: 5 }}>
        {thoughts.map((t) => (
          <div key={`dot-${t.id}`} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: released.includes(t.id) ? arch.color : 'rgba(255,255,255,0.18)',
            boxShadow: released.includes(t.id) ? `0 0 10px ${arch.color}, 0 0 18px ${arch.color}66` : 'none',
            transition: 'background 480ms cubic-bezier(0,0,0.2,1), box-shadow 480ms cubic-bezier(0,0,0.2,1)',
            animation: released.includes(t.id) ? 'chipPop 480ms cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
          }} />
        ))}
      </div>

      {allReleased && (
        <button data-press="true" onClick={close} aria-label="Continuer" style={{
          position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 40px)',
          left: '50%', transform: 'translateX(-50%)',
          padding: '16px 36px',
          background: `linear-gradient(135deg, rgba(${arch.rgb},0.95), rgba(${arch.rgb},0.78))`,
          border: 'none', borderRadius: 100, color: 'white',
          fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 600,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: `0 6px 36px rgba(${arch.rgb},0.45), 0 0 60px rgba(${arch.rgb},0.20)`,
          animation: 'breathExpand 620ms cubic-bezier(0.22,1,0.36,1) both, milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) 0.8s infinite',
          minHeight: 52, zIndex: 5,
          textShadow: '0 0 14px rgba(255,255,255,0.35)',
        }}>
          Continuer ✦
        </button>
      )}
    </div>
  )
}

function MoodGraph({ data, archetypeKey }) {
  const arch = ARCHETYPES[archetypeKey] || ARCHETYPES.presence
  if (!data || data.length === 0) return null
  // Plot 14 dots vertically positioned by mood (1-10), x = chronological index
  const W = 320, H = 60, padX = 8, padY = 6
  const n = Math.max(data.length, 2)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }} preserveAspectRatio="none">
      {/* Baseline doux */}
      <line x1={padX} y1={H / 2} x2={W - padX} y2={H / 2} stroke={`rgba(${arch.rgb},0.18)`} strokeWidth="1" strokeDasharray="2 4" />
      {/* Connect dots line */}
      <polyline
        fill="none"
        stroke={`rgba(${arch.rgb},0.55)`}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={data.map((d, i) => {
          const x = padX + (i / Math.max(1, n - 1)) * (W - padX * 2)
          const y = padY + (1 - (d.after - 1) / 9) * (H - padY * 2)
          return `${x.toFixed(1)},${y.toFixed(1)}`
        }).join(' ')}
      />
      {/* Dots */}
      {data.map((d, i) => {
        const x = padX + (i / Math.max(1, n - 1)) * (W - padX * 2)
        const y = padY + (1 - (d.after - 1) / 9) * (H - padY * 2)
        const recency = i / Math.max(1, n - 1)
        const opacity = 0.4 + recency * 0.55
        const r = 2.5 + recency * 1.5
        return (
          <circle key={i} cx={x} cy={y} r={r} fill={arch.color} style={{ opacity, filter: `drop-shadow(0 0 ${4 + recency * 4}px ${arch.color})` }} />
        )
      })}
    </svg>
  )
}

function CarnetModal({ archetypeKey, onClose }) {
  const arch = ARCHETYPES[archetypeKey] || ARCHETYPES.presence
  const [vis, setVis] = useState(false)
  const { exiting, close } = useExitAnimation(onClose, 280)
  const todayEntry = getCarnetEntryToday()
  const [text, setText] = useState(todayEntry ? todayEntry.text : '')
  const [saved, setSaved] = useState(!!todayEntry)
  const [recent, setRecent] = useState(() => getCarnetEntries().slice(-8).reverse())
  useEffect(() => { const t = setTimeout(() => setVis(true), 30); return () => clearTimeout(t) }, [])

  const handleSave = () => {
    haptic([8, 50, 8])
    const entry = saveCarnetEntry(text)
    setSaved(!!entry)
    setRecent(getCarnetEntries().slice(-8).reverse())
    if (entry) {
      try {
        playConfirm()
        addSouvenir('first_carnet')
        if (getCarnetEntries().length >= 7) addSouvenir('carnet_week')
      } catch {}
    }
  }

  const max = 200
  const remaining = max - text.length
  const dateLong = (() => {
    const d = new Date()
    const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
    const days = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi']
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
  })()

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(5,8,16,0.97)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', opacity: (vis && !exiting) ? 1 : 0, transition: 'opacity 280ms cubic-bezier(0.4,0,1,1)', overflowY: 'auto', animation: exiting ? 'sheetExit 280ms cubic-bezier(0.4,0,1,1) both' : (vis ? 'modalEnter 440ms cubic-bezier(0.16,1.36,0.32,1) both' : 'none') }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(${arch.rgb},0.10) 0%, transparent 65%)`, pointerEvents: 'none' }} />

      <button data-press="true" onClick={close} aria-label="Fermer le Carnet" style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', right: 18, background: 'rgba(5,8,16,0.42)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 100, width: 44, height: 44, color: 'rgba(255,255,255,0.78)', fontFamily: 'Inter, sans-serif', fontSize: 18, lineHeight: 1, cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>✕</button>

      <div style={{ position: 'relative', zIndex: 1, padding: 'calc(env(safe-area-inset-top, 0px) + 70px) 24px calc(env(safe-area-inset-bottom, 0px) + 40px)', display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 520, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: arch.color, letterSpacing: '0.32em', textTransform: 'uppercase', margin: '0 0 12px', animation: 'signaturePulse 14s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 14px ${arch.color}66` }}>◊ Carnet du Voyage</p>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 22, color: 'white', margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em', textShadow: `0 0 22px ${arch.color}33` }}>{dateLong}</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 12.5, color: 'rgba(255,255,255,0.55)', margin: '8px 0 0', fontStyle: 'italic' }}>Une phrase, un mot, un silence. Ce que tu veux.</p>
        </div>

        {/* Today entry */}
        <div style={{ background: `rgba(${arch.rgb},0.06)`, border: `1px solid rgba(${arch.rgb},0.30)`, borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: '14%', bottom: '14%', width: 2.5, background: `linear-gradient(180deg, transparent, ${arch.color}aa, transparent)`, borderRadius: '0 2px 2px 0', animation: 'worldglow 8s cubic-bezier(0.45,0,0.55,1) infinite' }} />
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value.slice(0, max)); setSaved(false) }}
            placeholder="Ce qui passe en toi aujourd'hui..."
            rows={5}
            style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.92)', fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 15, lineHeight: 1.7, letterSpacing: '0.01em', resize: 'none', minHeight: 110, caretColor: arch.color }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: `1px solid rgba(${arch.rgb},0.18)` }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: remaining < 30 ? `${arch.color}cc` : 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', transition: 'color 240ms cubic-bezier(0.4,0,0.2,1)' }}>{text.length}/{max}</span>
            <button data-press="true" onClick={handleSave} disabled={saved && text === (todayEntry?.text || '')} style={{ padding: '8px 18px', background: (saved && text === (todayEntry?.text || '')) ? `rgba(${arch.rgb},0.16)` : `rgba(${arch.rgb},0.85)`, border: (saved && text === (todayEntry?.text || '')) ? `1px solid rgba(${arch.rgb},0.40)` : 'none', borderRadius: 100, color: 'white', fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 12, letterSpacing: '0.14em', cursor: 'pointer', minHeight: 36, opacity: (saved && text === (todayEntry?.text || '')) ? 0.7 : 1, transition: 'opacity 240ms cubic-bezier(0.4,0,0.2,1)' }}>{(saved && text === (todayEntry?.text || '')) ? '✓ Déposé' : 'Déposer'}</button>
          </div>
        </div>

        {/* Recent entries */}
        {recent.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: `rgba(${arch.rgb},0.65)`, letterSpacing: '0.24em', textTransform: 'uppercase', margin: 0, textAlign: 'center' }}>Tes dernières pages</p>
            {recent.filter(e => e.date !== new Date().toISOString().split('T')[0]).slice(0, 7).map((e) => {
              const d = new Date(e.ts)
              const months = ['janv.','févr.','mars','avril','mai','juin','juil.','août','sept.','oct.','nov.','déc.']
              const dateShort = `${d.getDate()} ${months[d.getMonth()]}`
              return (
                <div key={e.ts} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 400, fontSize: 11, color: arch.color, letterSpacing: '0.10em' }}>{dateShort}</span>
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13.5, color: 'rgba(255,255,255,0.82)', margin: 0, lineHeight: 1.65, fontStyle: 'italic' }}>« {e.text} »</p>
                </div>
              )
            })}
          </div>
        )}

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.45)', textAlign: 'center', margin: '8px 0 0', fontStyle: 'italic', lineHeight: 1.6 }}>Tes notes restent sur ton appareil.<br />Elles ne sont jamais envoyées nulle part.</p>
      </div>
    </div>
  )
}

function CercleDePresenceModal({ archetypeKey, onClose }) {
  const arch = ARCHETYPES[archetypeKey] || ARCHETYPES.presence
  const [vis, setVis] = useState(false)
  const { exiting, close } = useExitAnimation(onClose, 280)
  const [cercle, setCercle] = useState(() => getCercle())
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [burst, setBurst] = useState(null)

  useEffect(() => { const t = setTimeout(() => setVis(true), 30); return () => clearTimeout(t) }, [])

  const refresh = () => setCercle(getCercle())

  const handleAdd = () => {
    const ok = addToCercle(newName)
    if (ok) {
      haptic([6, 40, 6])
      try { playConfirm(); addSouvenir('first_cercle') } catch {}
      setNewName(''); setAdding(false); refresh()
    } else {
      haptic([10, 30])
    }
  }

  const handleRemove = (prenom) => {
    haptic(8)
    removeFromCercle(prenom)
    refresh()
  }

  const handleLumiere = (prenom) => {
    if (hasSentLumiereToday(prenom)) return
    haptic([4, 50, 4, 50, 8])
    try { playSouvenir(); addSouvenir('first_lumiere', { to: prenom }) } catch {}
    sendLumiere(prenom)
    setBurst(prenom)
    setTimeout(() => setBurst(null), 1800)
    refresh()
  }

  const handleShareLumiere = async (prenom) => {
    const messages = {
      resilience: `Une pensée chaleureuse pour toi, ${prenom}. Si tu veux essayer un refuge intérieur : neya-kappa.vercel.app`,
      presence:   `Je pense à toi en ce moment, ${prenom}. Un espace doux : neya-kappa.vercel.app`,
      sagesse:    `${prenom}, j'avais envie que tu saches que je te porte. Un lieu où je passe : neya-kappa.vercel.app`,
      lumiere:    `${prenom}, une petite lumière depuis là où je suis. Si ça te parle : neya-kappa.vercel.app`,
    }
    const text = messages[archetypeKey] || messages.presence
    try {
      if (navigator.share) {
        await navigator.share({ text })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        haptic([6, 30, 6])
      }
    } catch {}
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(5,8,16,0.97)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', opacity: (vis && !exiting) ? 1 : 0, transition: 'opacity 280ms cubic-bezier(0.4,0,1,1)', overflowY: 'auto', animation: exiting ? 'sheetExit 280ms cubic-bezier(0.4,0,1,1) both' : (vis ? 'modalEnter 440ms cubic-bezier(0.16,1.36,0.32,1) both' : 'none') }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 36%, rgba(${arch.rgb},0.10) 0%, transparent 65%)`, pointerEvents: 'none' }} />

      <button data-press="true" onClick={close} aria-label="Fermer le cercle" style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', right: 18, background: 'rgba(5,8,16,0.42)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 100, width: 44, height: 44, color: 'rgba(255,255,255,0.78)', fontFamily: 'Inter, sans-serif', fontSize: 18, lineHeight: 1, cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>✕</button>

      <div style={{ position: 'relative', zIndex: 1, padding: 'calc(env(safe-area-inset-top, 0px) + 70px) 24px calc(env(safe-area-inset-bottom, 0px) + 40px)', display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: arch.color, letterSpacing: '0.32em', textTransform: 'uppercase', margin: '0 0 14px', animation: 'signaturePulse 14s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 14px ${arch.color}66` }}>◐ Cercle de présence</p>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 24, color: 'white', margin: 0, lineHeight: 1.22, letterSpacing: '-0.01em', textShadow: `0 0 22px ${arch.color}33` }}>Trois personnes,<br />portées en intention</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13, color: 'rgba(255,255,255,0.62)', margin: '12px 0 0', fontStyle: 'italic', lineHeight: 1.55, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>Pas un réseau social. Pas une liste d'amis. Trois prénoms que tu portes dans ta présence.</p>
        </div>

        {/* Liste des proches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cercle.length === 0 && !adding && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: 'rgba(255,255,255,0.50)', textAlign: 'center', fontStyle: 'italic', padding: '24px 0', lineHeight: 1.6 }}>Ton cercle est vide pour l'instant.<br />Tu peux porter jusqu'à trois personnes.</p>
          )}
          {cercle.map((p) => {
            const sent = hasSentLumiereToday(p.prenom)
            return (
              <div key={p.prenom} style={{ background: `rgba(${arch.rgb},0.07)`, border: `1px solid rgba(${arch.rgb},0.30)`, borderRadius: 16, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
                {burst === p.prenom && (
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 4 }}>
                    {[{x:20,y:50,r:2.4,d:0},{x:50,y:30,r:2.0,d:0.1},{x:80,y:50,r:2.2,d:0.2},{x:50,y:70,r:1.8,d:0.3},{x:30,y:30,r:1.6,d:0.4},{x:70,y:30,r:1.8,d:0.5},{x:30,y:70,r:1.6,d:0.6},{x:70,y:70,r:1.4,d:0.7}].map((m,i) => (
                      <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: 0, animation: `milestoneMote 1.6s ease-out ${m.d}s both`, filter: `drop-shadow(0 0 8px ${arch.color})` }} />
                    ))}
                  </svg>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, position: 'relative', zIndex: 5 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 18, color: 'white', letterSpacing: '-0.01em', textShadow: `0 0 14px ${arch.color}33` }}>{p.prenom}</div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: `rgba(${arch.rgb},0.62)`, letterSpacing: '0.10em', marginTop: 4, fontStyle: 'italic' }}>{sent ? 'Lumière partagée aujourd\'hui ✦' : 'En présence'}</div>
                  </div>
                  <button data-press="true" onClick={() => handleRemove(p.prenom)} aria-label={`Retirer ${p.prenom}`} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, width: 30, height: 30, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, position: 'relative', zIndex: 5 }}>
                  <button data-press="true" onClick={() => handleLumiere(p.prenom)} disabled={sent} style={{ flex: 1, padding: '11px 0', background: sent ? 'rgba(255,255,255,0.04)' : `linear-gradient(135deg, rgba(${arch.rgb},0.85), rgba(${arch.rgb},0.65))`, border: sent ? `1px solid rgba(${arch.rgb},0.40)` : 'none', borderRadius: 100, color: sent ? `${arch.color}cc` : 'white', fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 12, letterSpacing: '0.14em', cursor: sent ? 'default' : 'pointer', textTransform: 'uppercase', minHeight: 40, boxShadow: sent ? 'none' : `0 4px 18px rgba(${arch.rgb},0.32)`, opacity: sent ? 0.78 : 1, transition: 'opacity 240ms cubic-bezier(0.4,0,0.2,1)' }}>{sent ? '✦ Lumière envoyée' : 'Envoyer une lumière'}</button>
                  {!sent && navigator && navigator.share && (
                    <button data-press="true" onClick={() => handleShareLumiere(p.prenom)} aria-label={`Partager avec ${p.prenom}`} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 100, width: 40, height: 40, color: 'rgba(255,255,255,0.68)', fontFamily: 'Inter, sans-serif', fontSize: 15, lineHeight: 1, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↗</button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Add new */}
          {adding ? (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(${arch.rgb},0.30)`, borderRadius: 16, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value.slice(0, 30))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
                placeholder="Son prénom"
                style={{ background: 'rgba(0,0,0,0.20)', border: `1px solid rgba(${arch.rgb},0.36)`, borderRadius: 12, padding: '12px 14px', color: 'rgba(255,255,255,0.92)', fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 16, outline: 'none', letterSpacing: '0.02em' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button data-press="true" onClick={() => { setAdding(false); setNewName('') }} style={{ flex: 1, padding: '10px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif', fontSize: 12, cursor: 'pointer', minHeight: 40 }}>Annuler</button>
                <button data-press="true" onClick={handleAdd} disabled={!newName.trim()} style={{ flex: 2, padding: '10px 0', background: newName.trim() ? `rgba(${arch.rgb},0.85)` : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 100, color: 'white', fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 12, letterSpacing: '0.10em', cursor: newName.trim() ? 'pointer' : 'default', minHeight: 40, opacity: newName.trim() ? 1 : 0.5 }}>Ajouter</button>
              </div>
            </div>
          ) : cercle.length < 3 ? (
            <button data-press="true" onClick={() => setAdding(true)} style={{ width: '100%', padding: '16px 0', background: 'rgba(255,255,255,0.03)', border: `1px dashed rgba(${arch.rgb},0.40)`, borderRadius: 16, color: `rgba(${arch.rgb},0.92)`, fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 13, letterSpacing: '0.10em', cursor: 'pointer', minHeight: 48, transition: 'all 240ms cubic-bezier(0.4,0,0.2,1)' }}>+ Ajouter un·e proche</button>
          ) : (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.45)', textAlign: 'center', margin: 0, fontStyle: 'italic' }}>Ton cercle est complet. Trois est suffisant.</p>
          )}
        </div>

        {/* Note de fermeture */}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: 'rgba(255,255,255,0.46)', textAlign: 'center', margin: '8px 0 0', fontStyle: 'italic', lineHeight: 1.6, padding: '0 12px' }}>"Envoyer une lumière" est un geste pour toi.<br />Tu peux choisir de le partager — ou de le garder.</p>
      </div>
    </div>
  )
}

function InviteFriendModal({ archetypeKey, onClose }) {
  const arch = ARCHETYPES[archetypeKey] || ARCHETYPES.presence
  const [vis, setVis] = useState(false)
  const { exiting, close } = useExitAnimation(onClose, 280)
  const [shared, setShared] = useState(false)
  const [copied, setCopied] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 30); return () => clearTimeout(t) }, [])

  const messages = {
    resilience: `Si tu cherches un refuge intérieur pour les jours intenses — NÉYA :\nneya-kappa.vercel.app\n\n"Et toi, ça va vraiment ?"`,
    presence:   `Un espace doux que j'aime — NÉYA :\nneya-kappa.vercel.app\n\n"T'as pas besoin d'aller bien pour commencer."`,
    sagesse:    `Un endroit où je passe pour me poser — NÉYA :\nneya-kappa.vercel.app\n\n"Tu n'es pas seul·e."`,
    lumiere:    `Si ça te parle, un petit refuge poétique — NÉYA :\nneya-kappa.vercel.app\n\n"Et toi, ça va vraiment ?"`,
  }
  const text = messages[archetypeKey] || messages.presence

  const handleShare = async () => {
    haptic([6, 40, 6])
    try {
      if (navigator.share) {
        await navigator.share({ title: 'NÉYA', text })
        try { addSouvenir('first_invite') } catch {}
        setShared(true)
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        try { addSouvenir('first_invite') } catch {}
        setTimeout(() => setCopied(false), 2400)
      }
    } catch {}
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(5,8,16,0.97)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', opacity: (vis && !exiting) ? 1 : 0, transition: 'opacity 280ms cubic-bezier(0.4,0,1,1)', overflowY: 'auto', animation: exiting ? 'sheetExit 280ms cubic-bezier(0.4,0,1,1) both' : (vis ? 'modalEnter 440ms cubic-bezier(0.16,1.36,0.32,1) both' : 'none') }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 38%, rgba(${arch.rgb},0.10) 0%, transparent 65%)`, pointerEvents: 'none' }} />
      <button data-press="true" onClick={close} aria-label="Fermer" style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', right: 18, background: 'rgba(5,8,16,0.42)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 100, width: 44, height: 44, color: 'rgba(255,255,255,0.78)', fontFamily: 'Inter, sans-serif', fontSize: 18, lineHeight: 1, cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>✕</button>
      <div style={{ position: 'relative', zIndex: 1, padding: 'calc(env(safe-area-inset-top, 0px) + 70px) 28px calc(env(safe-area-inset-bottom, 0px) + 40px)', display: 'flex', flexDirection: 'column', gap: 28, minHeight: '100%', justifyContent: 'center', textAlign: 'center', maxWidth: 460, margin: '0 auto' }}>
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: arch.color, letterSpacing: '0.32em', textTransform: 'uppercase', margin: '0 0 14px', animation: 'signaturePulse 14s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 14px ${arch.color}66` }}>◈ Inviter</p>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 26, color: 'white', margin: 0, lineHeight: 1.22, letterSpacing: '-0.01em', textShadow: `0 0 22px ${arch.color}33` }}>Offrir NÉYA<br />à un·e proche</h2>
        </div>
        <div style={{ background: `rgba(${arch.rgb},0.07)`, border: `1px solid rgba(${arch.rgb},0.32)`, borderRadius: 18, padding: '24px 22px', position: 'relative' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14.5, color: 'rgba(255,255,255,0.88)', margin: 0, lineHeight: 1.72, whiteSpace: 'pre-line', textAlign: 'left', fontStyle: 'italic' }}>{text}</p>
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: 'rgba(255,255,255,0.55)', margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>Tu peux modifier le message ensuite, dans l'application de partage.</p>
        <button data-press="true" onClick={handleShare} disabled={shared} style={{ width: '100%', padding: '17px 0', background: shared ? `rgba(${arch.rgb},0.20)` : `linear-gradient(135deg, rgba(${arch.rgb},0.95), rgba(${arch.rgb},0.78))`, border: shared ? `1px solid ${arch.color}66` : 'none', borderRadius: 100, cursor: shared ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 600, letterSpacing: '0.24em', color: shared ? arch.color : 'white', textTransform: 'uppercase', boxShadow: shared ? 'none' : `0 6px 36px rgba(${arch.rgb},0.42), 0 0 60px rgba(${arch.rgb},0.18)`, animation: shared ? 'none' : 'milestoneGlow 5s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: shared ? 'none' : '0 0 14px rgba(255,255,255,0.35)', minHeight: 54 }}>{shared ? '✦ Invitation envoyée' : copied ? '✓ Copié dans le presse-papier' : 'Partager'}</button>
      </div>
    </div>
  )
}

function SettingsScreen({ archetypeKey, onClose, onRestart, onRetakeQuiz }) {
  const arch = ARCHETYPES[archetypeKey] || ARCHETYPES.presence
  const [vis, setVis] = useState(false)
  const { exiting, close } = useExitAnimation(onClose, 280)
  const [audioOn, setAudioOn] = useState(() => getAudioEnabled())
  const [confirmRestart, setConfirmRestart] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [showCercle, setShowCercle] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 30); return () => clearTimeout(t) }, [])

  const totalSouvenirs = getSouvenirs().length
  const totalBreath = (() => { try { return parseInt(localStorage.getItem('neya_breath_count') || '0', 10) } catch { return 0 } })()
  const totalDays = (() => { let n = 0; try { for (const k of Object.keys(localStorage)) { if (k.startsWith('neya_routines_') && JSON.parse(localStorage.getItem(k) || '[]').some(Boolean)) n++ } } catch {} return n })()

  const exportData = () => {
    haptic(10)
    try {
      const data = { exported_at: new Date().toISOString(), app_version: '1.0', archetype: archetypeKey }
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('neya_')) data[key] = localStorage.getItem(key)
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `neya-souvenirs-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch {}
  }

  const handleRetakeQuiz = () => {
    if (confirmRestart) {
      haptic([8, 60, 8])
      try { localStorage.removeItem('neya_profile') } catch {}
      onRetakeQuiz()
    } else {
      haptic(6); setConfirmRestart(true)
      setTimeout(() => setConfirmRestart(false), 4000)
    }
  }

  const handleFullReset = () => {
    if (confirmReset) {
      haptic([12, 80, 12])
      try {
        for (const k of Object.keys(localStorage)) {
          if (k.startsWith('neya_')) localStorage.removeItem(k)
        }
      } catch {}
      onRestart()
    } else {
      haptic(8); setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 4000)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 880, background: 'rgba(5,8,16,0.97)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', opacity: (vis && !exiting) ? 1 : 0, transition: 'opacity 280ms cubic-bezier(0.4,0,1,1)', overflowY: 'auto', animation: exiting ? 'sheetExit 280ms cubic-bezier(0.4,0,1,1) both' : (vis ? 'modalEnter 440ms cubic-bezier(0.16,1.36,0.32,1) both' : 'none') }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 38%, rgba(${arch.rgb},0.08) 0%, transparent 60%)`, pointerEvents: 'none' }} />

      <button data-press="true" onClick={close} aria-label="Fermer les réglages" style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', right: 18, background: 'rgba(5,8,16,0.42)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 100, width: 44, height: 44, color: 'rgba(255,255,255,0.78)', fontFamily: 'Inter, sans-serif', fontSize: 18, lineHeight: 1, cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>✕</button>

      <div style={{ position: 'relative', zIndex: 1, padding: 'calc(env(safe-area-inset-top, 0px) + 70px) 24px calc(env(safe-area-inset-bottom, 0px) + 40px)', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: arch.color, letterSpacing: '0.32em', textTransform: 'uppercase', margin: '0 0 12px', animation: 'signaturePulse 14s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 14px ${arch.color}66` }}>◈ Réglages</p>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 24, color: 'white', margin: 0, lineHeight: 1.22, letterSpacing: '-0.01em', textShadow: `0 0 22px ${arch.color}33` }}>Ton espace, tes règles</h2>
        </div>

        {/* SECTION: Préférences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: `rgba(${arch.rgb},0.70)`, letterSpacing: '0.24em', textTransform: 'uppercase', margin: 0 }}>Préférences</p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(${arch.rgb},0.22)`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, paddingRight: 14 }}>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.92)' }}>Sons doux</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 3, fontStyle: 'italic', lineHeight: 1.4 }}>Toucher, souvenir, souffle. Subtil.</div>
            </div>
            <button onClick={() => { const next = !audioOn; setAudioOn(next); setAudioEnabled(next); if (next) { try { playConfirm() } catch {} } }} aria-label={audioOn ? 'Désactiver les sons' : 'Activer les sons'} role="switch" aria-checked={audioOn} style={{ width: 44, height: 26, borderRadius: 100, background: audioOn ? `rgba(${arch.rgb},0.85)` : 'rgba(255,255,255,0.10)', border: `1px solid ${audioOn ? arch.color + 'aa' : 'rgba(255,255,255,0.15)'}`, position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 240ms cubic-bezier(0.4,0,0.2,1), border-color 240ms cubic-bezier(0.4,0,0.2,1)', boxShadow: audioOn ? `0 0 14px rgba(${arch.rgb},0.40)` : 'none' }}>
              <div style={{ position: 'absolute', top: 2, left: audioOn ? 20 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.3)', transition: 'left 280ms cubic-bezier(0.34,1.56,0.64,1)' }} />
            </button>
          </div>
        </div>

        {/* SECTION: Mémoire */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: `rgba(${arch.rgb},0.70)`, letterSpacing: '0.24em', textTransform: 'uppercase', margin: 0 }}>Ta mémoire</p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(${arch.rgb},0.22)`, borderRadius: 14, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>Souvenirs collectés</span>
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 400, fontSize: 16, color: arch.color, textShadow: `0 0 10px ${arch.color}66` }}>{totalSouvenirs}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>Sessions de souffle</span>
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 400, fontSize: 16, color: arch.color, textShadow: `0 0 10px ${arch.color}66` }}>{totalBreath}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>Jours de présence</span>
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 400, fontSize: 16, color: arch.color, textShadow: `0 0 10px ${arch.color}66` }}>{totalDays}</span>
            </div>
          </div>
          {(() => {
            const moodData = getMoodHistory(14)
            if (moodData.length < 2) return null
            return (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: `rgba(${arch.rgb},0.70)`, letterSpacing: '0.22em', textTransform: 'uppercase' }}>Ton humeur · derniers souffles</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.42)', fontStyle: 'italic' }}>{moodData.length} session{moodData.length > 1 ? 's' : ''}</span>
                </div>
                <MoodGraph data={moodData} archetypeKey={archetypeKey} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.42)', margin: 0, fontStyle: 'italic', textAlign: 'center', letterSpacing: '0.04em' }}>Plus haut = plus léger. Plus bas = plus lourd. Aucun jugement.</p>
              </div>
            )
          })()}
          <button data-press="true" onClick={exportData} style={{ width: '100%', padding: '14px 0', background: `rgba(${arch.rgb},0.14)`, border: `1px solid rgba(${arch.rgb},0.40)`, borderRadius: 100, color: 'rgba(255,255,255,0.92)', fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 13, letterSpacing: '0.16em', cursor: 'pointer', minHeight: 48 }}>↓ Exporter mes souvenirs</button>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.50)', margin: 0, fontStyle: 'italic', textAlign: 'center' }}>Un fichier JSON sur ton appareil. Tu en gardes la trace.</p>
        </div>

        {/* SECTION: Présence partagée */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: `rgba(${arch.rgb},0.70)`, letterSpacing: '0.24em', textTransform: 'uppercase', margin: 0 }}>Présence partagée</p>
          <button data-press="true" onClick={() => { haptic(6); setShowCercle(true) }} style={{ width: '100%', padding: '16px 18px', background: `rgba(${arch.rgb},0.07)`, border: `1px solid rgba(${arch.rgb},0.30)`, borderRadius: 14, color: 'rgba(255,255,255,0.92)', fontFamily: 'inherit', cursor: 'pointer', minHeight: 60, display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
            <span style={{ fontSize: 22, color: arch.color, lineHeight: 1, textShadow: `0 0 12px ${arch.color}` }}>◐</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.01em' }}>Mon cercle de présence</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 3, fontStyle: 'italic' }}>{getCercle().length === 0 ? "Porter quelqu'un en intention" : `${getCercle().length} ${getCercle().length === 1 ? 'personne portée' : 'personnes portées'}`}</div>
            </div>
            <span style={{ fontSize: 14, color: `rgba(${arch.rgb},0.62)` }}>→</span>
          </button>
          <button data-press="true" onClick={() => { haptic(6); setShowInvite(true) }} style={{ width: '100%', padding: '16px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, color: 'rgba(255,255,255,0.88)', fontFamily: 'inherit', cursor: 'pointer', minHeight: 60, display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
            <span style={{ fontSize: 18, color: arch.color, lineHeight: 1 }}>◈</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.01em' }}>Inviter à NÉYA</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 3, fontStyle: 'italic' }}>Offrir un refuge à quelqu'un que tu aimes</div>
            </div>
            <span style={{ fontSize: 14, color: `rgba(${arch.rgb},0.62)` }}>↗</span>
          </button>
        </div>

        {/* SECTION: Recommencer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: `rgba(${arch.rgb},0.70)`, letterSpacing: '0.24em', textTransform: 'uppercase', margin: 0 }}>Recommencer</p>
          <button data-press="true" onClick={handleRetakeQuiz} style={{ width: '100%', padding: '14px 0', background: confirmRestart ? `rgba(${arch.rgb},0.32)` : 'rgba(255,255,255,0.04)', border: `1px solid ${confirmRestart ? arch.color + '88' : 'rgba(255,255,255,0.14)'}`, borderRadius: 100, color: confirmRestart ? arch.color : 'rgba(255,255,255,0.78)', fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 13, letterSpacing: '0.10em', cursor: 'pointer', minHeight: 48, transition: 'all 240ms cubic-bezier(0.4,0,0.2,1)' }}>{confirmRestart ? 'Tape encore pour confirmer' : 'Refaire le quiz'}</button>
          <button data-press="true" onClick={handleFullReset} style={{ width: '100%', padding: '14px 0', background: confirmReset ? 'rgba(236,72,153,0.22)' : 'rgba(255,255,255,0.02)', border: `1px solid ${confirmReset ? 'rgba(236,72,153,0.55)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 100, color: confirmReset ? 'rgba(236,72,153,0.92)' : 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 12, letterSpacing: '0.10em', cursor: 'pointer', minHeight: 44, transition: 'all 240ms cubic-bezier(0.4,0,0.2,1)' }}>{confirmReset ? 'Tape pour effacer toute trace' : 'Tout réinitialiser'}</button>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.50)', margin: 0, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.5 }}>Refaire le quiz garde tes souvenirs.<br />Tout réinitialiser efface tout.</p>
        </div>

        {/* SECTION: À propos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: `rgba(${arch.rgb},0.70)`, letterSpacing: '0.24em', textTransform: 'uppercase', margin: 0 }}>À propos</p>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px' }}>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 14.5, color: 'rgba(255,255,255,0.86)', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>« NÉYA est un refuge.<br />Pas une app de méditation. Pas un journal.<br />Juste un espace pour ce que tu ressens vraiment. »</p>
            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${arch.color}44, transparent)`, margin: '14px 0' }} />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.52)', margin: 0, letterSpacing: '0.04em' }}>Version 1.0 · Une extension de la marque ÇA VA?</p>
          </div>
        </div>
      </div>
      {showCercle && <CercleDePresenceModal archetypeKey={archetypeKey} onClose={() => setShowCercle(false)} />}
      {showInvite && <InviteFriendModal archetypeKey={archetypeKey} onClose={() => setShowInvite(false)} />}
    </div>
  )
}

function QuetesGuideModal({ archetypeKey, quete, done, locked, onClose, onComplete }) {
  const arch = ARCHETYPES[archetypeKey] || ARCHETYPES.presence
  const [vis, setVis] = useState(false)
  const [completing, setCompleting] = useState(false)
  const { exiting, close } = useExitAnimation(onClose, 280)
  useEffect(() => { const t = setTimeout(() => setVis(true), 30); return () => clearTimeout(t) }, [])

  const handleComplete = () => {
    if (done || locked) { close(); return }
    haptic([20, 50, 30, 50, 20])
    setCompleting(true)
    setTimeout(() => { onComplete(); setTimeout(close, 540) }, 1200)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 880, background: 'rgba(5,8,16,0.98)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', opacity: (vis && !exiting) ? 1 : 0, transition: 'opacity 280ms cubic-bezier(0.4,0,1,1)', overflowY: 'auto', animation: exiting ? 'sheetExit 280ms cubic-bezier(0.4,0,1,1) both' : (vis ? 'modalEnter 440ms cubic-bezier(0.16,1.36,0.32,1) both' : 'none') }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 36%, rgba(${arch.rgb},0.14) 0%, transparent 65%)`, pointerEvents: 'none' }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {[{x:12,y:22,r:1.8,dur:30,del:0},{x:84,y:30,r:1.4,dur:34,del:3.5},{x:22,y:74,r:2.0,dur:28,del:1.8},{x:76,y:80,r:1.4,dur:36,del:6.2},{x:50,y:18,r:1.6,dur:32,del:9.1}].map((m,i)=>(
          <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: 0.10, animation: `splashmote ${m.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
        ))}
      </svg>
      {completing && (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }}>
          {[{x:20,y:30,r:3.2,del:0},{x:80,y:38,r:2.8,del:0.15},{x:32,y:70,r:3.4,del:0.32},{x:70,y:74,r:2.6,del:0.50},{x:50,y:18,r:3.0,del:0.70},{x:88,y:58,r:2.8,del:0.90},{x:14,y:60,r:2.4,del:0.40},{x:62,y:34,r:2.2,del:0.20}].map((m,i)=>(
            <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: 0, animation: `milestoneMote 1.8s ease-out ${m.del}s both`, filter: `drop-shadow(0 0 10px ${arch.color})` }} />
          ))}
        </svg>
      )}
      <button data-press="true" onClick={close} aria-label="Fermer" style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', right: 22, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '9px 18px', color: 'rgba(255,255,255,0.62)', fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: '0.10em', cursor: 'pointer', zIndex: 10, minHeight: 44 }}>Fermer</button>

      <div style={{ position: 'relative', zIndex: 1, padding: 'calc(env(safe-area-inset-top, 0px) + 72px) 28px calc(env(safe-area-inset-bottom, 0px) + 40px)', display: 'flex', flexDirection: 'column', gap: 26, minHeight: '100%', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: `rgba(${arch.rgb},0.16)`, border: `1px solid ${arch.color}66`, borderRadius: 100, padding: '8px 20px', marginBottom: 20, animation: 'signaturePulse 14s cubic-bezier(0.45,0,0.55,1) infinite' }}>
            <span style={{ fontSize: 16, color: arch.color, lineHeight: 1, textShadow: `0 0 10px ${arch.color}66` }}>{quete.icon}</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: arch.color, letterSpacing: '0.24em', textTransform: 'uppercase' }}>Quête</span>
          </div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 400, fontSize: 28, color: 'white', margin: 0, lineHeight: 1.22, letterSpacing: '-0.01em', textShadow: `0 0 32px ${arch.color}44`, animation: 'phrasebreathe 14s cubic-bezier(0.45,0,0.55,1) infinite' }}>{quete.title}</h2>
        </div>
        <div style={{ background: `rgba(${arch.rgb},0.08)`, border: `1px solid ${arch.color}33`, borderRadius: 18, padding: '26px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: '14%', bottom: '14%', width: 2.5, background: `linear-gradient(180deg, transparent, ${arch.color}aa, transparent)`, borderRadius: '0 2px 2px 0', animation: 'worldglow 8s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 12s cubic-bezier(0.45,0,0.55,1) 3s infinite' }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 17, color: 'rgba(255,255,255,0.92)', margin: 0, lineHeight: 1.72, fontStyle: 'italic', textShadow: `0 0 14px ${arch.color}22`, animation: 'phrasebreathe 28s cubic-bezier(0.45,0,0.55,1) infinite' }}>{quete.desc}</p>
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: 'rgba(255,255,255,0.50)', textAlign: 'center', margin: 0, lineHeight: 1.65, padding: '0 12px', animation: 'phrasebreathe 20s cubic-bezier(0.45,0,0.55,1) infinite' }}>Une quête n'est pas une obligation. C'est un appel à aller un peu plus loin que d'habitude.</p>
        <button data-press="true" onClick={handleComplete} disabled={completing || locked} style={{ width: '100%', padding: '18px 0', background: done ? `rgba(${arch.rgb},0.20)` : locked ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, rgba(${arch.rgb},0.95), rgba(${arch.rgb},0.78))`, border: (done || locked) ? `1px solid ${done ? arch.color + '66' : 'rgba(255,255,255,0.10)'}` : 'none', borderRadius: 100, cursor: (completing || locked) ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 600, letterSpacing: '0.24em', color: done ? arch.color : locked ? 'rgba(255,255,255,0.30)' : 'white', textTransform: 'uppercase', boxShadow: (done || locked) ? 'none' : `0 6px 36px rgba(${arch.rgb},0.42), 0 0 60px rgba(${arch.rgb},0.18)`, animation: completing ? 'milestoneGlow 1.4s cubic-bezier(0.45,0,0.55,1) infinite' : (!done && !locked) ? 'milestoneGlow 5s cubic-bezier(0.45,0,0.55,1) infinite' : 'none', textShadow: (done || locked) ? 'none' : '0 0 14px rgba(255,255,255,0.35)', minHeight: 54, opacity: completing ? 0.88 : 1, transition: 'opacity 0.3s ease' }}>
          {completing ? '✦ Bien joué' : done ? '✓ Quête accomplie' : locked ? 'Encore verrouillée' : 'Marquer accomplie'}
        </button>
      </div>
    </div>
  )
}

function TraceScreen({ archetypeKey, onClose }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  const { exiting, close } = useExitAnimation(onClose, 280)
  useEffect(() => { const t = setTimeout(() => setVis(true), 30); return () => clearTimeout(t) }, [])

  const days = useMemo(() => {
    const result = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      let routinesCount = 0
      try { routinesCount = JSON.parse(localStorage.getItem(`neya_routines_${dateStr}`) || '[]').filter(Boolean).length } catch {}
      result.push({ idx: 29 - i, dateStr, routinesCount, isToday: i === 0 })
    }
    return result
  }, [])

  const breathSessions = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('neya_breath_sessions') || '[]').slice(-30) } catch { return [] }
  }, [])

  const activeDays = days.filter(d => d.routinesCount > 0).length
  const totalBreath = breathSessions.length

  const footerText =
    activeDays === 0 ? (totalBreath > 0 ? 'Tes premières lueurs apparaissent.' : 'Ton premier passage est à venir.') :
    activeDays < 3   ? "Quelques lueurs. Ainsi commence un voyage." :
    activeDays < 7   ? 'Ta présence dessine quelque chose.' :
    activeDays < 14  ? 'Tu reviens. C\'est un signe.' :
    activeDays < 21  ? 'Une constellation se forme.' :
                       'Ton ciel intérieur est habité.'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 760, background: 'rgba(2,3,8,0.97)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', opacity: (vis && !exiting) ? 1 : 0, transition: 'opacity 280ms cubic-bezier(0.4,0,1,1)', overflow: 'hidden', animation: exiting ? 'sheetExit 280ms cubic-bezier(0.4,0,1,1) both' : 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 50%, rgba(${arch.rgb},0.10) 0%, transparent 65%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 95%, rgba(${arch.rgb},0.06) 0%, transparent 60%)`, pointerEvents: 'none' }} />

      <button data-press="true" onClick={close} aria-label="Fermer ta trace" style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', right: 18, background: 'rgba(5,8,16,0.42)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 100, width: 44, height: 44, color: 'rgba(255,255,255,0.78)', fontFamily: 'Inter, sans-serif', fontSize: 18, lineHeight: 1, cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>✕</button>

      <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 38px)', left: 0, right: 0, textAlign: 'center', padding: '0 32px', zIndex: 5 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: arch.color, letterSpacing: '0.32em', textTransform: 'uppercase', margin: '0 0 12px', animation: 'phrasebreathe 18s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 6s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 14px ${arch.color}66` }}>◈ Ta trace</p>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 24, color: 'white', margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em', textShadow: `0 0 22px ${arch.color}33`, animation: 'phrasebreathe 22s cubic-bezier(0.45,0,0.55,1) infinite' }}>Tes 30 derniers jours</h2>
      </div>

      {/* Constellation des jours */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }}>
        {days.map((d, i) => {
          const angle = (i / 30) * Math.PI * 2 * 1.32 + 0.6
          const radius = 15 + (i / 30) * 30
          const cx = 50 + Math.cos(angle) * radius
          const cy = 52 + Math.sin(angle) * radius * 0.78
          const intensity = Math.min(1, d.routinesCount / 3)
          const r = 1.2 + intensity * 2.8
          const opacity = d.routinesCount > 0 ? (0.30 + intensity * 0.62) : 0.10
          return (
            <g key={i}>
              {d.routinesCount > 0 && intensity > 0.3 && (
                <circle cx={`${cx}%`} cy={`${cy}%`} r={r * 3.5} fill={arch.color}
                  style={{ opacity: opacity * 0.18, animation: `presencePulse ${5 + (i % 4)}s ease-in-out ${(i * 0.18) % 4}s infinite` }} />
              )}
              <circle cx={`${cx}%`} cy={`${cy}%`} r={r}
                fill={d.routinesCount > 0 ? arch.color : 'rgba(255,255,255,0.18)'}
                style={{
                  opacity,
                  animation: d.isToday ? 'seedPulse 2.6s cubic-bezier(0.45,0,0.55,1) infinite, milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite' : `seedPulse ${5 + (i % 4)}s ease-in-out ${(i * 0.18) % 3}s infinite`,
                }}
              />
            </g>
          )
        })}
        {/* Breath sessions — petites étoiles indigo claires */}
        {breathSessions.map((b, i) => {
          const seed = ((b && b.ts) || (i * 137)) % 10000
          const cx = 8 + ((seed * 17) % 84)
          const cy = 22 + ((seed * 31) % 64)
          return (
            <circle key={`b${i}`} cx={`${cx}%`} cy={`${cy}%`} r={1.4}
              fill="#dadcff"
              style={{
                opacity: 0.46,
                animation: `seedPulse ${4 + (i % 3)}s ease-in-out ${(i * 0.22) % 3}s infinite`,
              }}
            />
          )
        })}
      </svg>

      {/* Centre — silhouette NeyaGirl très discrète */}
      <div style={{ position: 'absolute', top: '52%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 4, opacity: 0.32, animation: 'animalfloat 26s cubic-bezier(0.45,0,0.55,1) infinite' }}>
        <NeyaGirl size={92} color={arch.color} />
      </div>

      {/* Footer poétique */}
      <div style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 36px)', left: 0, right: 0, textAlign: 'center', padding: '0 32px', zIndex: 5 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontStyle: 'italic', fontSize: 13.5, color: 'rgba(255,255,255,0.62)', margin: 0, lineHeight: 1.7, textShadow: `0 0 18px ${arch.color}33`, animation: 'phrasebreathe 24s cubic-bezier(0.45,0,0.55,1) infinite' }}>
          {footerText}
        </p>
      </div>
    </div>
  )
}

function ShareArchetype({ archetypeKey, onClose }) {
  const arch = ARCHETYPES[archetypeKey]
  const canvasRef = useRef(null)
  const [vis, setVis] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [building, setBuilding] = useState(true)
  const [sharing, setSharing] = useState(false)
  const { exiting, close } = useExitAnimation(onClose, 280)

  useEffect(() => { const t = setTimeout(() => setVis(true), 30); return () => clearTimeout(t) }, [])

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ')
    let line = ''
    const lines = []
    for (const w of words) {
      const test = line ? `${line} ${w}` : w
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line); line = w
      } else { line = test }
    }
    if (line) lines.push(line)
    const startY = y - ((lines.length - 1) * lineHeight) / 2
    lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight))
  }

  useEffect(() => {
    let cancelled = false
    const build = async () => {
      try { if (document.fonts && document.fonts.ready) await document.fonts.ready } catch {}

      const canvas = canvasRef.current
      if (!canvas || cancelled) return
      const W = 1080, H = 1920
      canvas.width = W; canvas.height = H
      const ctx = canvas.getContext('2d')

      // Fond — dégradé radial sombre
      const bg = ctx.createRadialGradient(W/2, H*0.38, 0, W/2, H*0.5, H*0.85)
      bg.addColorStop(0, `rgba(${arch.rgb}, 0.30)`)
      bg.addColorStop(0.42, '#0a1024')
      bg.addColorStop(1, '#050810')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Halo central
      const halo = ctx.createRadialGradient(W/2, H*0.43, 60, W/2, H*0.43, 560)
      halo.addColorStop(0, `rgba(${arch.rgb}, 0.45)`)
      halo.addColorStop(0.6, `rgba(${arch.rgb}, 0.12)`)
      halo.addColorStop(1, 'rgba(5,8,16,0)')
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, W, H)

      // Particules pseudo-aléatoires déterministes
      const seedRand = (s) => { let x = Math.sin(s) * 10000; return x - Math.floor(x) }
      for (let i = 0; i < 80; i++) {
        const x = seedRand(i * 13.37) * W
        const y = seedRand(i * 71.13) * H
        const r = 0.6 + seedRand(i * 9.91) * 2.6
        ctx.fillStyle = `rgba(${arch.rgb}, ${0.12 + seedRand(i * 17.31) * 0.30})`
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
      }

      // Logo NÉYA
      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      ctx.font = '300 64px Sora, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('NÉYA', W/2, 168)

      // Eyebrow
      ctx.fillStyle = arch.color
      ctx.font = '500 28px Inter, system-ui, sans-serif'
      ctx.fillText('◈   TON ARCHÉTYPE', W/2, 240)

      // Charger l'image spirit (préfère WebP pour Canvas compat)
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        const src = `${B}spirit-${archetypeKey}.webp`
        await new Promise((res, rej) => {
          img.onload = res; img.onerror = rej; img.src = src
        })
        const imgSize = 580
        const cx = W/2, cy = H*0.43
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, imgSize/2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        // Place image with objectPosition center 45% equivalent
        const ratio = Math.max(imgSize / img.width, imgSize / img.height)
        const drawW = img.width * ratio
        const drawH = img.height * ratio
        const offsetY = drawH * 0.05
        ctx.drawImage(img, cx - drawW/2, cy - drawH/2 - offsetY, drawW, drawH)
        ctx.restore()
        // Anneau lumineux
        ctx.shadowColor = arch.color
        ctx.shadowBlur = 32
        ctx.strokeStyle = `${arch.color}aa`
        ctx.lineWidth = 4
        ctx.beginPath(); ctx.arc(cx, cy, imgSize/2 + 4, 0, Math.PI * 2); ctx.stroke()
        ctx.shadowBlur = 0
      } catch (e) {
        // Fallback : cercle plein
        const cx = W/2, cy = H*0.43, r = 290
        const fg = ctx.createRadialGradient(cx, cy - 50, 20, cx, cy, r)
        fg.addColorStop(0, `${arch.color}cc`)
        fg.addColorStop(1, `${arch.color}22`)
        ctx.fillStyle = fg
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
      }

      // Nom de l'animal
      ctx.fillStyle = 'rgba(255,255,255,0.96)'
      ctx.font = '300 84px Sora, system-ui, sans-serif'
      ctx.fillText(arch.animal, W/2, H*0.70)

      // Profil
      ctx.fillStyle = `${arch.color}dd`
      ctx.font = 'italic 300 42px Inter, system-ui, sans-serif'
      ctx.fillText(arch.profil, W/2, H*0.755)

      // Intention rotative — basée sur le jour
      const pool = arch.intentions || ['Tu es là, pleinement.']
      const dayIdx = Math.floor(Date.now() / 86400000) % pool.length
      const intention = pool[dayIdx]
      ctx.fillStyle = 'rgba(255,255,255,0.82)'
      ctx.font = 'italic 300 38px Inter, system-ui, sans-serif'
      wrapText(ctx, `« ${intention} »`, W/2, H*0.86, W * 0.78, 56)

      // Footer
      ctx.fillStyle = 'rgba(255,255,255,0.46)'
      ctx.font = '300 24px Inter, system-ui, sans-serif'
      ctx.fillText('neya-kappa.vercel.app', W/2, H*0.955)

      if (cancelled) return
      canvas.toBlob((blob) => {
        if (cancelled || !blob) return
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        setBuilding(false)
      }, 'image/png', 0.92)
    }
    build()
    return () => { cancelled = true }
  }, [archetypeKey])

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const handleShare = async () => {
    if (!canvasRef.current || sharing) return
    setSharing(true)
    haptic([6, 30, 6])
    canvasRef.current.toBlob(async (blob) => {
      try {
        const file = new File([blob], `neya-${archetypeKey}.png`, { type: 'image/png' })
        if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Mon archétype NÉYA',
            text: `${arch.animal} · ${arch.profil}`,
          })
        } else {
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = `neya-${archetypeKey}.png`
          document.body.appendChild(a); a.click(); document.body.removeChild(a)
          setTimeout(() => URL.revokeObjectURL(a.href), 2000)
        }
      } catch { /* user cancelled */ }
      finally { setSharing(false) }
    }, 'image/png', 0.92)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 780, background: 'rgba(2,3,8,0.97)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', opacity: (vis && !exiting) ? 1 : 0, transition: 'opacity 280ms cubic-bezier(0.4,0,1,1)', overflowY: 'auto', animation: exiting ? 'sheetExit 280ms cubic-bezier(0.4,0,1,1) both' : 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 38%, rgba(${arch.rgb},0.10) 0%, transparent 65%)`, pointerEvents: 'none' }} />

      <button data-press="true" onClick={close} aria-label="Fermer le partage" style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', right: 18, background: 'rgba(5,8,16,0.42)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 100, width: 44, height: 44, color: 'rgba(255,255,255,0.78)', fontFamily: 'Inter, sans-serif', fontSize: 18, lineHeight: 1, cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>✕</button>

      <div style={{ position: 'relative', zIndex: 1, padding: 'calc(env(safe-area-inset-top, 0px) + 70px) 24px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, minHeight: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: arch.color, letterSpacing: '0.32em', textTransform: 'uppercase', margin: '0 0 12px', animation: 'signaturePulse 14s cubic-bezier(0.45,0,0.55,1) infinite', textShadow: `0 0 14px ${arch.color}66` }}>◈ Partage</p>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 24, color: 'white', margin: 0, lineHeight: 1.22, letterSpacing: '-0.01em' }}>Ton archétype, en image</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13, color: 'rgba(255,255,255,0.62)', margin: '8px 0 0', lineHeight: 1.55 }}>Un visuel à partager — pas un score.</p>
        </div>

        <div style={{ width: '78%', maxWidth: 340, aspectRatio: '9 / 16', borderRadius: 20, overflow: 'hidden', boxShadow: `0 16px 56px rgba(0,0,0,0.65), 0 0 60px rgba(${arch.rgb},0.22)`, position: 'relative', background: '#050810' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          {building && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(8px)' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.62)', letterSpacing: '0.2em', textTransform: 'uppercase', animation: 'phrasebreathe 2.4s cubic-bezier(0.45,0,0.55,1) infinite' }}>Composition…</p>
            </div>
          )}
        </div>

        <button onClick={handleShare} disabled={building || sharing} aria-label="Partager ton archétype" style={{ width: '78%', maxWidth: 340, padding: '17px 0', background: building ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, rgba(${arch.rgb},0.95), rgba(${arch.rgb},0.78))`, border: 'none', borderRadius: 100, cursor: (building || sharing) ? 'wait' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 600, letterSpacing: '0.24em', color: 'white', textTransform: 'uppercase', boxShadow: building ? 'none' : `0 6px 36px rgba(${arch.rgb},0.45), 0 0 60px rgba(${arch.rgb},0.18)`, animation: (!building && !sharing) ? 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite' : 'none', textShadow: building ? 'none' : '0 0 14px rgba(255,255,255,0.35)', minHeight: 54, opacity: (building || sharing) ? 0.7 : 1, transition: 'opacity 0.3s ease' }}>
          {sharing ? '…' : building ? 'Composition…' : 'Partager'}
        </button>

        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 11.5, color: 'rgba(255,255,255,0.46)', textAlign: 'center', margin: 0, lineHeight: 1.55, padding: '0 16px' }}>
          Cette image ne contient aucun chiffre, aucun score.<br />Juste ton animal, ton archétype, ta phrase.
        </p>
      </div>
    </div>
  )
}

function MilestoneCelebration({ count, archetypeKey }) {
  const arch = ARCHETYPES[archetypeKey]
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVis(true), 50)
    try { playMilestone() } catch {}
    return () => clearTimeout(t)
  }, [])
  const message = count === 3 ? '3 jours d\'affilée' :
                  count === 7 ? 'Une semaine de présence' :
                  count === 14 ? 'Deux semaines complètes' :
                  count === 30 ? 'Un mois de constance' :
                  count === 60 ? 'Deux mois — phénoménal' :
                  count === 100 ? '100 jours — ta lumière brûle' :
                  `${count} jours`
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at center, rgba(${arch.rgb},0.16) 0%, transparent 65%)`, backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', pointerEvents: 'none', opacity: vis ? 1 : 0, transition: 'opacity 480ms cubic-bezier(0,0,0.2,1)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {[{x:18,y:32,r:3,d:0},{x:78,y:38,r:2.5,d:0.15},{x:30,y:74,r:3.2,d:0.32},{x:68,y:70,r:2.4,d:0.50},{x:48,y:18,r:2.8,d:0.10},{x:88,y:54,r:2.6,d:0.60},{x:14,y:58,r:2.2,d:0.40},{x:62,y:30,r:2.0,d:0.05},{x:42,y:88,r:3.0,d:0.25},{x:80,y:14,r:1.8,d:0.35}].map((m,i)=>(
          <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: 0, animation: `milestoneMote 2.2s cubic-bezier(0,0,0.2,1) ${m.d}s both`, filter: `drop-shadow(0 0 8px ${arch.color})` }} />
        ))}
      </svg>
      <div style={{ textAlign: 'center', animation: vis ? 'streakIgnite 800ms cubic-bezier(0.34,1.56,0.64,1) both' : 'none', padding: '32px 40px' }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 200, fontSize: 96, color: arch.color, lineHeight: 1, letterSpacing: '-0.04em', textShadow: `0 0 48px ${arch.color}99, 0 0 96px ${arch.color}55`, marginBottom: 14 }}>
          {count}
        </div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 18, color: 'rgba(255,255,255,0.96)', letterSpacing: '0.04em', textShadow: `0 0 22px ${arch.color}55`, animation: 'signaturePulse 4s cubic-bezier(0.45,0,0.55,1) 1s infinite' }}>
          {message}
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: `${arch.color}cc`, letterSpacing: '0.30em', textTransform: 'uppercase', marginTop: 14, animation: 'phrasebreathe 12s cubic-bezier(0.45,0,0.55,1) 1.5s infinite' }}>
          ✦ ta constance
        </div>
      </div>
    </div>
  )
}

function MainApp({ archetypeKey, onRestart, savedAt }) {
  const arch = ARCHETYPES[archetypeKey]
  const [tab, setTab] = useState('home')
  const [milestoneCount, setMilestoneCount] = useState(null)
  const [tabVis, setTabVis] = useState(true)
  const [routinesDone, setRoutinesDone] = useState(() => loadRoutines())
  const [quetesDone, setQuetesDone] = useState(() => loadQuetes(archetypeKey))
  const [vraiOpen, setVraiOpen] = useState(false)
  const [pendingWorldUnlock, setPendingWorldUnlock] = useState(null)
  const [seenWorldUnlocks, setSeenWorldUnlocks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('neya_seen_unlocks') || '[]') } catch { return [] }
  })
  const [graceApplied, setGraceApplied] = useState(false)
  const [xpToast, setXpToast] = useState(null)
  const xpToastTimer = useRef(null)

  const showXpToast = (amount, bonus = false) => {
    clearTimeout(xpToastTimer.current)
    setXpToast({ amount, bonus })
    xpToastTimer.current = setTimeout(() => setXpToast(null), 2200)
  }

  const changeTab = (newTab) => {
    if (newTab === tab) return
    haptic(8)
    setTabVis(false)
    setTimeout(() => { setTab(newTab); setTabVis(true) }, 190)
  }

  const toggleRoutine = (i) => {
    const next = [...routinesDone]; next[i] = !next[i]
    setRoutinesDone(next); saveRoutines(next)
    if (!routinesDone[i]) {
      addXP(15)
      try { trackRoutineComplete(i); addSouvenir('first_routine') } catch {}
      const allNowDone = next.every(Boolean)
      showXpToast(15, allNowDone)
      if (allNowDone) {
        haptic([20, 50, 20, 50, 40])
        // Streak milestone check — déclenche overlay si nouveau palier atteint
        setTimeout(() => {
          try {
            const streak = getCurrentStreak()
            const milestone = checkStreakMilestone(streak)
            if (milestone) {
              setMilestoneCount(milestone)
              haptic([40, 80, 40, 80, 60])
              try { addSouvenir(`milestone_${milestone}`) } catch {}
              setTimeout(() => setMilestoneCount(null), 3600)
            }
          } catch {}
        }, 220)
      }
    }
  }

  const completeQuete = (i) => {
    const next = [...quetesDone]; next[i] = true
    setQuetesDone(next); saveQuetes(archetypeKey, next)
    addXP(30)
    try { trackQueteComplete(i); addSouvenir('first_quete') } catch {}
    showXpToast(30, false)
  }

  useEffect(() => {
    if (!archetypeKey) return
    const unlocked = getUnlockedWorlds(archetypeKey)
    const newUnlock = unlocked.find(wk => !seenWorldUnlocks.includes(wk))
    if (newUnlock) {
      const updated = [...seenWorldUnlocks, newUnlock]
      setSeenWorldUnlocks(updated)
      try { localStorage.setItem('neya_seen_unlocks', JSON.stringify(updated)) } catch {}
      setTimeout(() => setPendingWorldUnlock(newUnlock), 1200)
    }
    if (applyGraceIfNeeded()) setGraceApplied(true)
  }, [archetypeKey])

  const mainJourComplète = routinesDone.every(Boolean) && quetesDone.some(Boolean)
  const overlay = `linear-gradient(180deg, rgba(5,8,16,0.62) 0%, rgba(${arch.rgb},${mainJourComplète ? '0.14' : '0.09'}) 100%)`
  const WORLD_GLOW_PERIOD = { 'bg-brume.avif': 30, 'bg-feu.avif': 8, 'bg-foret.avif': 18, 'bg-eau.avif': 24, 'bg-cosmos.avif': 42, 'bg-vide.avif': 60 }
  const glowPeriod = WORLD_GLOW_PERIOD[arch.bg] || 24

  return (
    <BgScreen bg={arch.bg} overlay={overlay} breathe>
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, background: `radial-gradient(ellipse at center, ${arch.color}${mainJourComplète ? '1c' : '0f'} 0%, transparent 65%)`, animation: `worldglow ${glowPeriod}s cubic-bezier(0.45,0,0.55,1) infinite`, transition: 'background 2s ease' }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        {[{x:6,y:22,r:2.0,dur:28,del:0.0},{x:92,y:16,r:1.5,dur:34,del:5.2},{x:18,y:72,r:2.4,dur:22,del:2.4},{x:84,y:68,r:1.8,dur:38,del:8.1},{x:52,y:88,r:2.0,dur:26,del:4.6},{x:76,y:38,r:1.6,dur:44,del:12.3},{x:34,y:44,r:1.2,dur:32,del:7.5},{x:62,y:8,r:2.2,dur:18,del:3.8}].map((m,i)=>(
          <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.r} fill={arch.color} style={{ opacity: 0.038, animation: `splashmote ${m.dur}s cubic-bezier(0.45,0,0.55,1) infinite`, animationDelay: `${m.del}s` }} />
        ))}
      </svg>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, opacity: tabVis ? 1 : 0, animation: tabVis ? 'tabslideIn 320ms cubic-bezier(0.34,1.56,0.64,1)' : 'none', transition: 'opacity 0.19s ease', overflow: 'hidden' }}>
          {tab === 'home' && <HomeScreen archetypeKey={archetypeKey} routinesDone={routinesDone} quetesDone={quetesDone} onRestart={onRestart} onOpenVrai={() => setVraiOpen(true)} onChangeTab={changeTab} savedAt={savedAt} showXpToast={showXpToast} />}
          {tab === 'routines' && <RoutinesScreen archetypeKey={archetypeKey} completed={routinesDone} onToggle={toggleRoutine} onOpenVrai={() => setVraiOpen(true)} />}
          {tab === 'quetes' && <QuetesScreen archetypeKey={archetypeKey} completed={quetesDone} onComplete={completeQuete} onOpenVrai={() => setVraiOpen(true)} />}
          {tab === 'voyage' && <GrandVoyageScreen archetypeKey={archetypeKey} />}
          {tab === 'boutique' && <BoutiqueScreen archetypeKey={archetypeKey} />}
        </div>
        <BottomNav tab={tab} onChange={changeTab} color={arch.color} badges={{ routines: routinesDone.filter(Boolean).length < arch.routines.length, quetes: quetesDone.filter(Boolean).length < arch.quetes.length }} />
        {pendingWorldUnlock && <WorldUnlockModal worldKey={pendingWorldUnlock} onClose={() => { try { addSouvenir('world_unlock', { world: pendingWorldUnlock }) } catch {} ; setPendingWorldUnlock(null); changeTab('voyage') }} />}
        {vraiOpen && <EspaceVraiModal archetypeKey={archetypeKey} onClose={() => setVraiOpen(false)} />}
        {milestoneCount && <MilestoneCelebration count={milestoneCount} archetypeKey={archetypeKey} />}
        {xpToast && (
          <div key={xpToast.amount + xpToast.bonus} style={{ position: 'fixed', top: 22, left: '50%', transform: 'translateX(-50%)', zIndex: 300, pointerEvents: 'none', animation: 'xpToastIn 2.2s ease forwards', whiteSpace: 'nowrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: xpToast.bonus ? 'linear-gradient(135deg, rgba(225,168,40,0.95), rgba(200,140,25,0.92))' : `rgba(${arch.rgb},0.92)`, borderRadius: 100, padding: '9px 20px', boxShadow: xpToast.bonus ? '0 6px 28px rgba(225,168,40,0.55), 0 2px 10px rgba(0,0,0,0.3)' : `0 6px 28px rgba(${arch.rgb},0.50), 0 2px 10px rgba(0,0,0,0.3)`, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, color: xpToast.bonus ? 'rgba(20,12,2,0.92)' : 'white', letterSpacing: '-0.01em', lineHeight: 1 }}>+{xpToast.amount}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: xpToast.bonus ? 'rgba(20,12,2,0.70)' : 'rgba(255,255,255,0.75)', letterSpacing: '0.18em', textTransform: 'uppercase', lineHeight: 1 }}>{xpToast.bonus ? 'XP · Toutes complètes ✦' : 'XP'}</span>
            </div>
          </div>
        )}
        {graceApplied && (
          <div onClick={() => setGraceApplied(false)} style={{ position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)', background: `rgba(${arch.rgb},0.16)`, border: `1px solid ${arch.color}55`, borderRadius: 100, padding: '8px 22px', zIndex: 200, animation: 'fadeIn 0.6s ease both', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', pointerEvents: 'auto', whiteSpace: 'nowrap', cursor: 'pointer' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: arch.color, letterSpacing: '0.12em', margin: 0, animation: 'milestoneGlow 3.5s cubic-bezier(0.45,0,0.55,1) infinite' }}>🛡 Ton bouclier de présence a protégé ta série</p>
          </div>
        )}
      </div>
    </BgScreen>
  )
}

// ─── ERROR BOUNDARY ───────────────────────────────────────────────────────────

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err) { console.error('[NÉYA]', err) }
  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div style={{ width: '100vw', height: '100dvh', background: '#050810', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32 }}>
        <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 22, color: 'white', margin: 0, textAlign: 'center', opacity: 0.88 }}>Une erreur est survenue.</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, textAlign: 'center', lineHeight: 1.6 }}>Ferme et relance l'app pour continuer.</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: 8, background: 'rgba(99,102,241,0.84)', border: 'none', borderRadius: 100, padding: '12px 28px', color: 'white', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer', boxShadow: '0 4px 24px rgba(99,102,241,0.38)' }}>Recharger</button>
      </div>
    )
  }
}

// ─── APP ──────────────────────────────────────────────────────────────────────

function ConsentToast() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!getConsent()) { const t = setTimeout(() => setShow(true), 2400); return () => clearTimeout(t) }
  }, [])
  if (!show) return null
  return (
    <div role="dialog" aria-label="Consentement analytics" style={{ position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)', left: 12, right: 12, zIndex: 9500, background: 'rgba(5,8,16,0.94)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeIn 0.5s ease', boxShadow: '0 8px 32px rgba(0,0,0,0.55)' }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 12.5, color: 'rgba(255,255,255,0.82)', flex: 1, lineHeight: 1.5 }}>
        Pour améliorer NÉYA — un suivi anonyme de ton usage ? Aucun contenu personnel.
      </span>
      <button onClick={() => { setConsent('no'); setShow(false) }} aria-label="Refuser le suivi" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '8px 14px', color: 'rgba(255,255,255,0.62)', fontFamily: 'Inter, sans-serif', fontSize: 12, cursor: 'pointer', minHeight: 36 }}>Non</button>
      <button onClick={() => { setConsent('yes'); setShow(false) }} aria-label="Accepter le suivi anonyme" style={{ background: 'rgba(99,102,241,0.88)', border: 'none', borderRadius: 100, padding: '8px 18px', color: 'white', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 36, boxShadow: '0 4px 14px rgba(99,102,241,0.42)' }}>OK</button>
    </div>
  )
}

function InstallPromptButton({ visible }) {
  const [evt, setEvt] = useState(null)
  const [dismissed, setDismissed] = useState(() => { try { return !!localStorage.getItem('neya_install_dismissed') } catch { return false } })
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setEvt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])
  if (!evt || dismissed || !visible) return null
  const install = async () => {
    try { evt.prompt(); await evt.userChoice } catch {}
    try { localStorage.setItem('neya_install_dismissed', '1') } catch {}
    setDismissed(true)
    setEvt(null)
  }
  const dismiss = () => {
    try { localStorage.setItem('neya_install_dismissed', '1') } catch {}
    setDismissed(true)
  }
  return (
    <div style={{ position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 132px)', right: 14, zIndex: 750, display: 'flex', alignItems: 'center', gap: 6, animation: 'fadeIn 0.6s ease 1.5s both' }}>
      <button onClick={dismiss} aria-label="Masquer la proposition d'installation" style={{ background: 'rgba(5,8,16,0.78)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '50%', width: 28, height: 28, color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1, cursor: 'pointer', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>✕</button>
      <button onClick={install} aria-label="Installer NÉYA sur cet appareil" style={{ background: 'rgba(99,102,241,0.92)', border: 'none', borderRadius: 100, padding: '10px 18px', color: 'white', fontFamily: 'Sora, sans-serif', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 6px 24px rgba(99,102,241,0.45)', animation: 'milestoneGlow 4s cubic-bezier(0.45,0,0.55,1) infinite', minHeight: 40 }}>Installer</button>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState(() => {
    try { const p = JSON.parse(localStorage.getItem('neya_profile') || 'null'); return p?.archetype ? 'returning' : 'splash' } catch { return 'splash' }
  })
  const [archetype, setArchetype] = useState(() => {
    try { return JSON.parse(localStorage.getItem('neya_profile') || 'null')?.archetype || null } catch { return null }
  })
  const [savedAt, setSavedAt] = useState(() => {
    try { return JSON.parse(localStorage.getItem('neya_profile') || 'null')?.savedAt || null } catch { return null }
  })
  const [blackout, setBlackout] = useState(false)
  const goTimer = useRef(null)

  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'neya-css'
    style.textContent = `
      @keyframes bgbreathe    { 0%,100%{transform:scale(1)}                   50%{transform:scale(1.04)} }
      @keyframes ob0breathe   { 0%,100%{transform:scale(1)}                   50%{transform:scale(1.028)} }
      @keyframes pulsering    { 0%,100%{transform:scale(1);opacity:0.42}       50%{transform:scale(1.24);opacity:0.88} }
      @keyframes cursorblink  { 0%,100%{opacity:0}                             45%,55%{opacity:1} }
      @keyframes startwinkle  { 0%,100%{opacity:0.18}                         50%{opacity:0.88} }
      @keyframes animalfloat  { 0%,100%{transform:translateY(0) scale(1) translateX(0)}  50%{transform:translateY(-7px) scale(1.028) translateX(3px)} }
      @keyframes animalbreathe{ 0%,100%{opacity:0.88}                                    50%{opacity:1} }
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
      @keyframes tabslideIn   { 0%{transform:translateX(14px) scale(0.985);opacity:0} 60%{transform:translateX(-1px) scale(1.002);opacity:0.92} 100%{transform:translateX(0) scale(1);opacity:1} }
      @keyframes worldglow    { 0%,100%{opacity:0.5}                             50%{opacity:1} }
      @keyframes ringshimmer  { 0%{transform:rotate(0deg)}                       100%{transform:rotate(360deg)} }
      @keyframes forcespring  { 0%{transform:translateY(20px) scale(0.92);opacity:0} 55%{transform:translateY(-6px) scale(1.035);opacity:0.88} 78%{transform:translateY(2px) scale(0.992);opacity:1} 92%{transform:translateY(-0.5px) scale(1.006);opacity:1} 100%{transform:translateY(0) scale(1);opacity:1} }
      @keyframes choiceripple  { 0%{transform:scale(0);opacity:0.6}               100%{transform:scale(2.5);opacity:0} }
      @keyframes questionEnter { 0%{transform:translateY(12px);opacity:0}          100%{transform:translateY(0);opacity:1} }
      @keyframes milestoneGlow  { 0%,100%{opacity:0.82}                             50%{opacity:1} }
      @keyframes milestoneMote  { 0%{transform:translateY(0) scale(1);opacity:0.7} 100%{transform:translateY(-38px) scale(0.3);opacity:0} }
      @keyframes lightFlash2    { 0%{opacity:0} 15%{opacity:0.06} 100%{opacity:0} }
      @keyframes solbreathe     { 0%,100%{opacity:0.16}                           50%{opacity:0.23} }
      @keyframes phrasebreathe  { 0%,100%{opacity:1}                               50%{opacity:0.86} }
      @keyframes emberRise    { 0%{transform:translateY(0) translateX(0);opacity:0.55} 50%{transform:translateY(-60px) translateX(6px);opacity:0.35} 100%{transform:translateY(-120px) translateX(-4px);opacity:0} }
      @keyframes waterRing    { 0%{transform:scale(0.3);opacity:0.55} 100%{transform:scale(2.4);opacity:0} }
      @keyframes mistDrift    { 0%{transform:translateX(-8%) opacity:0} 15%{opacity:0.28} 85%{opacity:0.18} 100%{transform:translateX(8%);opacity:0} }
      @keyframes godRay       { 0%,100%{opacity:0.04} 50%{opacity:0.11} }
      @keyframes forestMote   { 0%,100%{transform:translateY(0) scale(1);opacity:0.07} 50%{transform:translateY(-18px) scale(1.15);opacity:0.14} }
      @keyframes worldDrift   { 0%,100%{transform:scale(1) translateX(0)}              50%{transform:scale(1.032) translateX(-0.8%)} }
      @keyframes ambientRise  { 0%{transform:translateY(0);opacity:0}                  20%{opacity:0.14} 80%{opacity:0.08} 100%{transform:translateY(-90px);opacity:0} }
      @keyframes breatheScale { 0%,100%{transform:scale(1);opacity:0.72}               50%{transform:scale(1.08);opacity:1} }
      @keyframes shimmerPass  { 0%{background-position:-200% center} 100%{background-position:200% center} }
      @keyframes auroraHue    { 0%,100%{filter:hue-rotate(0deg) brightness(1)} 50%{filter:hue-rotate(25deg) brightness(1.08)} }
      @keyframes borderPulse  { 0%,100%{opacity:0.55} 50%{opacity:1} }
      @keyframes cardDepth    { 0%,100%{transform:translateY(0) scale(1);box-shadow:none} 50%{transform:translateY(-1.5px) scale(1.003)} }
      @keyframes gradientDrift{ 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      @keyframes haloExpand   { 0%{transform:scale(0.85);opacity:0} 40%{opacity:0.55} 100%{transform:scale(1.5);opacity:0} }
      @keyframes sparkle      { 0%,100%{transform:scale(0) rotate(0deg);opacity:0} 50%{transform:scale(1) rotate(180deg);opacity:0.9} }
      @keyframes prismaticPulse{ 0%,100%{filter:brightness(1) saturate(1)} 33%{filter:brightness(1.12) saturate(1.3)} 66%{filter:brightness(0.96) saturate(0.9)} }
      @keyframes floatUp      { 0%{transform:translateY(0) scale(1);opacity:0.6} 50%{opacity:0.35} 100%{transform:translateY(-55px) scale(0.55);opacity:0} }
      @keyframes depthBreath  { 0%,100%{transform:scale(1);opacity:0.88} 50%{transform:scale(1.018);opacity:1} }
      @keyframes xpToastIn    { 0%{opacity:0;transform:translateX(-50%) translateY(-24px) scale(0.84)} 9%{opacity:1;transform:translateX(-50%) translateY(2px) scale(1.05)} 18%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} 72%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} 100%{opacity:0;transform:translateX(-50%) translateY(-14px) scale(0.94)} }
      @keyframes breathExpand  { 0%{transform:scale(0.94);opacity:0;filter:blur(2px)} 60%{transform:scale(1.018);opacity:1;filter:blur(0)} 100%{transform:scale(1);opacity:1;filter:blur(0)} }
      @keyframes streakIgnite  { 0%{transform:scale(1);filter:brightness(1) saturate(1)} 22%{transform:scale(1.18);filter:brightness(1.55) saturate(1.4)} 60%{transform:scale(0.96);filter:brightness(1.15) saturate(1.12)} 100%{transform:scale(1.02);filter:brightness(1) saturate(1)} }
      @keyframes sheetExit     { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(20px) scale(0.96)} }

      /* Premium motion keyframes — Apple/Linear/Arc-grade */
      @keyframes modalEnter    { 0%{opacity:0;transform:translateY(20px) scale(0.96)} 100%{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes modalExit     { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(14px) scale(0.985)} }
      @keyframes chipPop       { 0%{transform:scale(0.6);opacity:0} 60%{transform:scale(1.08);opacity:1} 100%{transform:scale(1);opacity:1} }
      @keyframes cardLiftDone  { 0%{transform:scale(1)} 38%{transform:scale(1.045) translateY(-2px)} 76%{transform:scale(0.992) translateY(0.5px)} 100%{transform:scale(1.018) translateY(0)} }
      @keyframes haloOnce      { 0%{box-shadow:0 0 0 0 rgba(255,255,255,0)} 38%{box-shadow:0 0 0 6px rgba(255,255,255,0.10)} 100%{box-shadow:0 0 0 14px rgba(255,255,255,0)} }
      @keyframes signaturePulse{ 0%,100%{opacity:0.88;transform:scale(1)} 50%{opacity:1;transform:scale(1.012)} }
      @keyframes shootingStar  { 0%{opacity:0;stroke-dashoffset:200} 8%{opacity:1} 80%{opacity:1;stroke-dashoffset:-2200} 100%{opacity:0;stroke-dashoffset:-2400} }
      @keyframes butterflyFlight { 0%{transform:translate(0,0) rotate(0deg);opacity:0} 10%{opacity:1} 25%{transform:translate(28vw,-12vh) rotate(8deg)} 50%{transform:translate(56vw,4vh) rotate(-6deg)} 75%{transform:translate(82vw,-8vh) rotate(10deg)} 100%{transform:translate(116vw,12vh) rotate(0deg);opacity:0} }
      @keyframes thoughtFloat   { 0%,100%{transform:translate(-50%,-50%) translateY(0)} 50%{transform:translate(-50%,-50%) translateY(-7px)} }
      @keyframes thoughtBurst   { 0%{opacity:1;transform:translate(0,0) scale(1)} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0.4)} }

      /* Focus rings accessibles */
      *:focus-visible { outline: 2px solid rgba(255,255,255,0.62); outline-offset: 2px; border-radius: 6px; transition: outline-offset 140ms cubic-bezier(0.4,0,0.2,1); }
      button:focus-visible, [role="button"]:focus-visible { outline-offset: 3px; }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
    `
    if (!document.getElementById('neya-css')) document.head.appendChild(style)
    return () => { const el = document.getElementById('neya-css'); if (el) el.remove() }
  }, [])

  useEffect(() => {
    const assets = ['bg-splash.avif','bg-onboarding.avif']
    assets.forEach(s => { const img = new Image(); img.src = B + s })
  }, [])

  useEffect(() => {
    initAnalytics()
    try {
      const firstKey = 'neya_first_seen'
      const isFirst = !localStorage.getItem(firstKey)
      if (isFirst) { localStorage.setItem(firstKey, String(Date.now())); addSouvenir('first_visit') }
      trackAppOpen(isFirst)
    } catch {}
    try { registerSW({ immediate: true }) } catch {}
    const cleanupPress = initPressFeedback()
    const cleanupAudio = initAudioPressFeedback()
    return () => { cleanupPress && cleanupPress(); cleanupAudio && cleanupAudio() }
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
    <ErrorBoundary>
      <div style={{ width: '100vw', height: '100dvh', background: '#050810', overflow: 'hidden', position: 'fixed', inset: 0 }}>
        {screen === 'returning'  && archetype && <ReturningScreen archetypeKey={archetype} onDone={() => go('main')} />}
        {screen === 'splash'     && <SplashScreen onStart={() => go('intro')} />}
        {screen === 'intro'      && <IntroScreen onStart={() => go('quiz-intro')} />}
        {screen === 'quiz-intro' && <QuizIntroScreen onStart={() => go('quiz')} />}
        {screen === 'quiz'       && <QuizScreen onQuit={() => go('splash')} onComplete={(answers) => {
          const result = computeArchetype(answers)
          saveProfile(result)
          const ts = Date.now()
          try { trackQuizComplete(result, ts - (parseInt(localStorage.getItem('neya_quiz_start') || String(ts), 10))) } catch {}
          go('world-reveal', () => { setArchetype(result); setSavedAt(ts) })
        }} />}
        {screen === 'world-reveal' && <WorldRevealBridge onContinue={() => go('transition')} />}
        {screen === 'transition' && <TransitionScreen archetypeKey={archetype} onReveal={() => go('result')} />}
        {screen === 'result'     && archetype && <ResultScreen archetypeKey={archetype} onContinue={() => go('main')} />}
        {screen === 'main'       && archetype && <MainApp archetypeKey={archetype} onRestart={handleRestart} savedAt={savedAt} />}

        <ConsentToast />
        <InstallPromptButton visible={screen === 'main' || screen === 'returning'} />

        <div style={{ position: 'fixed', inset: 0, background: '#050810', zIndex: 9999, opacity: blackout ? 1 : 0, transition: blackout ? 'opacity 0.36s ease' : 'opacity 0.28s ease', pointerEvents: blackout ? 'all' : 'none' }} />
        {archetype && ARCHETYPES[archetype] && (
          <div style={{ position: 'fixed', inset: 0, background: ARCHETYPES[archetype].color, zIndex: 10000, opacity: blackout ? 0.08 : 0, transition: blackout ? 'opacity 0.36s ease' : 'opacity 0.28s ease', pointerEvents: 'none' }} />
        )}
      </div>
    </ErrorBoundary>
  )
}
