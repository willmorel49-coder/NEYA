/* ============================================================
   NÉYA — Aventure Oasis du Présent (parcours narratif interactif)
   ============================================================
   Théme : habiter l'instant, sortir de l'esprit en boucle.
   Totem : Aigle céleste.
   ============================================================ */

export const AVENTURE_OASIS = {
  key: 'oasis',
  name: 'Oasis du Présent',
  totem: 'Aigle céleste',
  image: '/img/world-oasis.png',
  accent: '#9F584C',
  accentRgb: 'rgba(159, 88, 76',
  startScene: 'seuil',
  totalScenes: 14,

  scenes: {
    /* ─── ACTE 1 · L'ARRIVÉE ─── */
    seuil: {
      kind: 'narrative',
      eyebrow: 'OASIS DU PRÉSENT · SEUIL',
      title: 'Le sable, l\'eau, la chaleur',
      body: [
        'Tu arrives dans une oasis. Le soleil tape, l\'eau scintille, les palmiers offrent une ombre douce.',
        'Tu portes peut-être un passé qui ne te lâche pas. Ou un futur qui te tient en alerte.',
        'Tu vis souvent ailleurs que là. Dans ce qui s\'est passé. Dans ce qui pourrait arriver.',
      ],
      quote: 'L\'Oasis n\'est ni hier ni demain. C\'est maintenant. Ici.',
      cta: 'M\'arrêter',
      next: 'premier-choix',
    },

    'premier-choix': {
      kind: 'choice',
      eyebrow: 'OASIS · OÙ EST TON ESPRIT ?',
      title: 'Où ton esprit voyage-t-il le plus ?',
      body: [
        'Tu te poses au bord de l\'eau. Avant d\'aller plus loin, l\'Oasis te demande honnêtement.',
      ],
      choices: [
        { label: 'Dans le passé qui revient',        next: 'esprit-passe',  gainKey: 'paix' },
        { label: 'Dans le futur qui m\'inquiète',     next: 'esprit-futur',  gainKey: 'détente' },
        { label: 'Dans des conversations imaginaires', next: 'esprit-dialog', gainKey: 'présence' },
        { label: 'Je ne sais pas',                    next: 'esprit-confus', gainKey: 'curiosité' },
      ],
    },

    'esprit-passe': {
      kind: 'narrative',
      title: 'Ton esprit dans le passé',
      body: [
        'Tu rejoues des scènes. Des conversations. Des décisions. Tu te demandes ce qui se serait passé si.',
        'C\'est humain. C\'est même utile parfois. Mais quand ça devient une boucle, ça t\'empêche de vivre maintenant.',
        'L\'Oasis t\'invite à reconnaître : « Mon esprit voyage dans hier. Et maintenant, je reviens. »',
      ],
      quote: 'Le passé ne se change pas en y retournant. Il se digère en revenant à toi.',
      cta: 'Continuer',
      next: 'aigle-rencontre',
    },

    'esprit-futur': {
      kind: 'narrative',
      title: 'Ton esprit dans le futur',
      body: [
        'Tu anticipes. Tu prépares mentalement ce qui pourrait arriver. Tu scénarises.',
        'C\'est une forme de protection. Mais ça t\'épuise, parce que ton corps réagit comme si les scénarios étaient réels.',
        'L\'Oasis te dit : « Tu peux planifier ce qui dépend de toi. Pour le reste, tu peux laisser venir. »',
      ],
      quote: 'Le futur arrive toujours plus simple qu\'on l\'avait imaginé.',
      cta: 'Continuer',
      next: 'aigle-rencontre',
    },

    'esprit-dialog': {
      kind: 'narrative',
      title: 'Ton esprit dans des dialogues',
      body: [
        'Tu rejoues des conversations. Tu prépares des réponses. Tu argumentes contre quelqu\'un qui n\'est pas là.',
        'Ces dialogues imaginaires sont souvent des combats qu\'on n\'a pas pu mener dans la vraie vie. Ou des choses qu\'on n\'a pas pu dire.',
        'Tu peux les reconnaître. Pas les juger. Et puis, doucement, revenir à toi.',
      ],
      quote: 'Les vraies conversations que tu veux avoir, tu peux les préparer ou les vivre. Pas les ressasser.',
      cta: 'Continuer',
      next: 'aigle-rencontre',
    },

    'esprit-confus': {
      kind: 'narrative',
      title: 'Tu ne sais pas où il est',
      body: [
        'C\'est une réponse honnête. Parfois on est tellement loin du présent qu\'on ne sait même plus où on est.',
        'L\'Oasis t\'accueille comme ça. Sans demander que tu saches.',
        'On va revenir à toi, ensemble, par les sens. Pas par la tête.',
      ],
      quote: 'On revient au présent par le corps, pas par l\'esprit. L\'esprit suit, il ne précède pas.',
      cta: 'Continuer',
      next: 'aigle-rencontre',
    },

    /* ─── ACTE 2 · LA RENCONTRE ─── */
    'aigle-rencontre': {
      kind: 'narrative',
      eyebrow: 'OASIS · LA RENCONTRE',
      title: 'L\'Aigle céleste',
      body: [
        'Un Aigle céleste tourne haut au-dessus de toi. Puis il descend, lentement, et se pose sur une pierre proche.',
        'Il a une vision incroyablement nette. Il peut voir un détail minuscule à grande distance.',
        'C\'est ce qu\'il t\'offre : la capacité de voir clairement ce qui est, maintenant.',
      ],
      quote: 'Voir clair, ce n\'est pas voir loin. C\'est voir ce qui est là.',
      cta: 'Approcher',
      next: 'aigle-respiration',
    },

    'aigle-respiration': {
      kind: 'breathing',
      title: 'Respire avec l\'oasis',
      subtitle: 'Trois respirations · inspire 4s · expire 6s',
      cycles: 3,
      next: 'cinq-quatre-trois',
      gainKey: 'ancrage',
    },

    /* ─── ACTE 3 · L'ANCRAGE 5-4-3-2-1 ─── */
    'cinq-quatre-trois': {
      kind: 'narrative',
      eyebrow: 'OASIS · L\'ANCRAGE',
      title: 'Cinq choses présentes',
      body: [
        'L\'Aigle te demande quelque chose de très simple.',
        'Sans bouger, regarde autour de toi maintenant — l\'écran, la pièce, l\'extérieur si tu peux.',
        'Mentalement, nomme cinq choses que tu vois précisément. Pas des concepts. Des choses concrètes : un objet, une couleur, une texture, un détail. Vraiment cinq.',
      ],
      quote: 'Le corps s\'ancre par les sens. Et le mental suit le corps, pas l\'inverse.',
      cta: 'J\'ai vu',
      next: 'choix-sensoriel',
    },

    'choix-sensoriel': {
      kind: 'choice',
      title: 'Qu\'as-tu remarqué ?',
      body: [
        'L\'Aigle se rapproche un peu. Il veut savoir.',
      ],
      choices: [
        { label: 'Quelque chose de beau que je n\'avais pas vu', next: 'apres-sensoriel', gainKey: 'émerveillement' },
        { label: 'Quelque chose de banal qui m\'a apaisé·e',      next: 'apres-sensoriel', gainKey: 'simplicité' },
        { label: 'Rien de spécial, mais je suis ici',             next: 'apres-sensoriel', gainKey: 'suffisance' },
        { label: 'Mon corps qui est là',                          next: 'apres-sensoriel', gainKey: 'incarnation' },
      ],
    },

    'apres-sensoriel': {
      kind: 'narrative',
      title: 'L\'Aigle hoche la tête',
      body: [
        '« Voilà. Tu es revenu·e. Pas pour toujours. Pour cet instant. »',
        '« Et c\'est suffisant. »',
      ],
      quote: 'Tu n\'as rien d\'autre à faire que d\'être là, maintenant.',
      cta: 'Recevoir',
      next: 'eau-lisse',
    },

    /* ─── ACTE 4 · L'EAU LISSE ─── */
    'eau-lisse': {
      kind: 'reflection',
      eyebrow: 'OASIS · L\'EAU LISSE',
      title: 'L\'eau de l\'oasis',
      body: [
        'L\'Aigle te montre l\'eau de l\'oasis. Lisse. Sans rides. Reflétant le ciel.',
        'Si tu veux qu\'elle reste claire, tu ne la touches pas. Tu ne l\'agites pas. Tu la regardes simplement.',
      ],
      prompt: 'Ton mental est pareil. Qu\'est-ce que tu voudrais arrêter d\'agiter en toi ?',
      cta: 'Laisser reposer',
      next: 'fin-recap',
      gainKey: 'apaisement',
    },

    /* ─── ACTE 5 · LE PASSAGE ─── */
    'fin-recap': {
      kind: 'keys-recap',
      eyebrow: 'OASIS · CE QUE TU EMPORTES',
      title: 'Les clés que tu portes',
      body: [
        'L\'Aigle céleste prend son envol, puis revient se poser à côté de toi.',
        'Tu sens qu\'il restera, à hauteur, à chaque fois que tu auras besoin de revenir au présent.',
      ],
      cta: 'Quitter l\'Oasis',
      next: 'final',
    },

    final: {
      kind: 'final',
      eyebrow: 'OASIS DU PRÉSENT · TRAVERSÉE',
      title: 'Tu reviens',
      body: [
        'Tu ne resteras pas dans le présent en permanence — personne ne peut.',
        'Mais tu sauras y revenir. Plusieurs fois par jour. À chaque fois que tu te sentiras emporté·e par hier ou demain.',
      ],
      quote: 'Maintenant. C\'est ici que tu vis. Nulle part ailleurs.',
      cta: 'Terminer le voyage',
    },
  },
};
