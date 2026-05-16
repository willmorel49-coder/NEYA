/* ============================================================
   ÇA VA ? — Rituels des 3 temps du soi
   ============================================================
   12 rituels (4 par temps) : lecture guidée + notes optionnelles.
   Ton ÇA VA ?, jamais clinique, jamais injonctif.
   ============================================================ */

export const TEMPS_GROUPS = [
  {
    key: 'passe',
    label: 'Soi du passé',
    glyph: '◀',
    accent: '#9F584C',
    hint: 'Réconcilier hier',
    intro: 'Aller voir ce qui te porte sans te peser. Ce qui s\'est passé n\'est pas toi. C\'est ce qui t\'a traversé·e.',
  },
  {
    key: 'present',
    label: 'Soi présent',
    glyph: '●',
    accent: '#34917F',
    hint: 'Habiter maintenant',
    intro: 'Revenir là, dans cet instant. Sans le juger, sans le fuir. Juste y être.',
  },
  {
    key: 'futur',
    label: 'Soi du futur',
    glyph: '▶',
    accent: '#7397BC',
    hint: 'Construire demain',
    intro: 'Pas une obsession, pas une projection. Juste une direction. Le soi que tu deviens, choisi.',
  },
];

export const RITUELS = [
  /* ─────── SOI DU PASSÉ ─────── */
  {
    key: 'lettre-enfant',
    temps: 'passe',
    title: 'Lettre à ton soi enfant',
    subtitle: 'Lui dire ce que personne ne lui a dit.',
    duration: 8,
    guide: [
      'Ferme les yeux un instant. Imagine-toi enfant, vers 6 ou 8 ans. À quoi ressemblais-tu ? Comment marchais-tu ? Que rêvais-tu ?',
      'Cet enfant est encore en toi. Il porte ce que les adultes autour n\'ont pas vu, ou n\'ont pas pu donner.',
      'Ce n\'est pas une accusation. C\'est juste la vérité de ce moment-là.',
      'Tu vas lui écrire. Avec la voix de l\'adulte que tu es devenu·e. Avec la tendresse qu\'on aurait aimé recevoir.',
    ],
    prompts: [
      'Qu\'est-ce que tu voudrais lui dire en premier ?',
      'De quoi avait-il besoin que personne ne lui a donné ?',
      'Qu\'est-ce que tu sais aujourd\'hui qu\'il aurait aimé entendre ?',
    ],
    closing: 'Cet enfant est en sécurité avec toi maintenant. Tu es l\'adulte qu\'il attendait.',
  },
  {
    key: 'pardons',
    temps: 'passe',
    title: 'Ce que je pardonne aujourd\'hui',
    subtitle: 'Pas oublier. Déposer.',
    duration: 6,
    guide: [
      'Pardonner ne veut pas dire excuser. Ni oublier. Ni cautionner.',
      'Pardonner, c\'est arrêter de porter la dette de l\'autre — ou de soi-même.',
      'C\'est libérer une part d\'énergie qui était bloquée à attendre des excuses qui ne viendront peut-être jamais.',
      'Tu vas nommer trois pardons. Ils peuvent être grands ou petits. À toi ou à quelqu\'un d\'autre.',
    ],
    prompts: [
      'Qu\'est-ce que je me reproche depuis trop longtemps ?',
      'Qui ai-je porté en moi comme un poids ?',
      'Qu\'est-ce que je suis prêt·e à déposer, là, maintenant — même imparfaitement ?',
    ],
    closing: 'Tu ne fais pas de cadeau à ceux qui t\'ont blessé·e. Tu te fais de la place.',
  },
  {
    key: 'mon-recit',
    temps: 'passe',
    title: 'Mon récit',
    subtitle: 'Raconter sans se rapetisser.',
    duration: 10,
    guide: [
      'Il y a une histoire que tu te racontes sur ton passé. Souvent, elle est partielle. Ou trop dure avec toi.',
      'Aujourd\'hui, tu vas raconter un événement difficile de ton parcours. Mais avec une consigne : ne pas te placer en victime ni en héros.',
      'Juste en humain qui a fait ce qu\'il pouvait avec ce qu\'il savait, à ce moment-là.',
      'Ce n\'est pas un effacement. C\'est une réappropriation de ton histoire.',
    ],
    prompts: [
      'Quel moment de ma vie revient souvent dans ma tête ?',
      'Qu\'est-ce que je n\'ai jamais eu le droit de dire à propos de ce moment ?',
      'Avec mes yeux d\'aujourd\'hui, qu\'est-ce que je vois que je ne voyais pas ?',
    ],
    closing: 'Tu n\'es pas la somme de ce qui t\'est arrivé. Tu es la façon dont tu as continué.',
  },
  {
    key: 'racines-force',
    temps: 'passe',
    title: 'Mes racines de force',
    subtitle: 'Les moments qui t\'ont construit·e.',
    duration: 7,
    guide: [
      'On parle souvent de ce qui nous a blessé·e. Rarement de ce qui nous a construit·e.',
      'Pourtant, tu portes des moments-ressources. Des instants où tu t\'es senti·e à ta place. Aimé·e. Capable. Vivant·e.',
      'Ces moments sont des racines. Ils tiennent quand tout vacille.',
      'Aujourd\'hui, tu vas en honorer trois.',
    ],
    prompts: [
      'Un moment où je me suis senti·e vraiment moi-même ?',
      'Une personne qui m\'a vu·e quand personne d\'autre ne voyait ?',
      'Une chose que j\'ai faite, et dont je suis encore fier·e, en silence ?',
    ],
    closing: 'Ces racines te tiennent. Tu peux y revenir à chaque fois que tu te perds.',
  },

  /* ─────── SOI PRÉSENT ─────── */
  {
    key: 'scan-moment',
    temps: 'present',
    title: 'Scan du moment',
    subtitle: 'Revenir au corps, ici, maintenant.',
    duration: 5,
    guide: [
      'Pose les pieds par terre. Respire une fois lentement.',
      'Sans bouger, regarde autour de toi et nomme cinq choses que tu vois. Vraiment cinq.',
      'Ensuite, écoute. Quatre sons. Même les plus discrets.',
      'Puis touche. Trois textures sous tes doigts ou tes pieds.',
      'Sens. Deux odeurs présentes, ou de la mémoire.',
      'Enfin, goûte. Une saveur dans ta bouche, ou la dernière chose que tu as mangée.',
    ],
    prompts: [
      'Comment te sens-tu après ces quelques instants ?',
      'Qu\'est-ce qui a changé entre le début et la fin du scan ?',
    ],
    closing: 'Le présent est toujours là. C\'est notre attention qui voyage.',
  },
  {
    key: 'inventaire-emotions',
    temps: 'present',
    title: 'Inventaire émotionnel',
    subtitle: 'Nommer ce qui traverse.',
    duration: 6,
    guide: [
      'Les émotions sont des informations, pas des problèmes.',
      'Quand on les nomme précisément, elles cessent de nous habiter en aveugle.',
      'Aujourd\'hui, tu vas faire l\'inventaire de ce qui te traverse à cet instant. Sans rien filtrer.',
      'Plusieurs émotions peuvent cohabiter — contradictoires, même. C\'est normal.',
    ],
    prompts: [
      'Quelle émotion principale est présente là, maintenant ?',
      'Quelles autres, plus discrètes, accompagnent celle-là ?',
      'À quel endroit dans mon corps je les sens ?',
    ],
    closing: 'Tu n\'es pas tes émotions. Tu es l\'espace qui les accueille.',
  },
  {
    key: 'porter-aujourdhui',
    temps: 'present',
    title: 'Ce que je porte aujourd\'hui',
    subtitle: 'Déposer le sac, voir ce qu\'il y a dedans.',
    duration: 7,
    guide: [
      'On porte tous un sac invisible. Plein de choses pas réglées, de petites tensions, de pensées en boucle.',
      'On le porte sans le savoir. Et parfois, on se demande pourquoi on est si fatigué·e.',
      'Aujourd\'hui, tu vas ouvrir le sac. Juste regarder ce qu\'il y a dedans, sans rien y faire.',
      'Voir, c\'est déjà commencer à alléger.',
    ],
    prompts: [
      'Qu\'est-ce qui me pèse là, sans que je m\'en sois rendu compte ?',
      'Qu\'est-ce qui n\'est pas à moi, dans ce que je porte ?',
      'Qu\'est-ce que je pourrais déposer juste pour aujourd\'hui ?',
    ],
    closing: 'Tu peux reprendre ton sac demain. Pour ce soir, tu peux le poser.',
  },
  {
    key: 'la-ou-je-suis',
    temps: 'present',
    title: 'Je suis là où je suis',
    subtitle: 'Acceptation radicale.',
    duration: 6,
    guide: [
      'L\'acceptation radicale, c\'est arrêter de lutter contre la réalité telle qu\'elle est. Sans la cautionner. Sans s\'y résigner. Juste arrêter le combat intérieur.',
      'On dépense énormément d\'énergie à vouloir que les choses soient autres. À nier où on en est.',
      'Aujourd\'hui, tu vas reconnaître. Sans cherchera changer encore. Juste : c\'est là.',
      'C\'est le point de départ de toute transformation. On ne peut partir que d\'où on est vraiment.',
    ],
    prompts: [
      'Qu\'est-ce que je refuse de voir en ce moment ?',
      'Qu\'est-ce qui me prendrait moins d\'énergie si je l\'acceptais comme c\'est ?',
      'Comment je me sens à l\'idée de juste accueillir ça, sans rien y faire ?',
    ],
    closing: 'Accepter, ce n\'est pas abandonner. C\'est arrêter de se battre contre soi-même.',
  },

  /* ─────── SOI DU FUTUR ─────── */
  {
    key: 'mes-valeurs',
    temps: 'futur',
    title: 'Mes valeurs',
    subtitle: 'Choisir ce qui te porte.',
    duration: 8,
    guide: [
      'Les valeurs, ce ne sont pas des objectifs. Un objectif s\'atteint et s\'arrête. Une valeur, on la vit en permanence.',
      'Tes valeurs sont les boussoles qui te disent si tu vis en cohérence — ou si tu vis pour faire plaisir, par peur, par habitude.',
      'Aujourd\'hui, tu vas en identifier cinq. Pas dix. Cinq. Celles qui comptent vraiment.',
      'Exemples : authenticité, liberté, douceur, justice, créativité, présence, intégrité, courage, honnêteté, beauté, sagesse, transmission, jeu...',
    ],
    prompts: [
      'Quelles cinq valeurs me ressemblent le plus aujourd\'hui ?',
      'Quelle valeur, si elle était bafouée, me rendrait furieux·se ou triste ?',
      'Quelle valeur j\'aimerais incarner davantage ?',
    ],
    closing: 'Tes valeurs ne sont pas figées. Elles évoluent avec toi. Mais elles te ramènent toujours à l\'essentiel.',
  },
  {
    key: 'lettre-futur',
    temps: 'futur',
    title: 'Lettre à toi dans un an',
    subtitle: 'Une projection bienveillante.',
    duration: 9,
    guide: [
      'Imagine-toi dans un an, jour pour jour. Pas dans une version idéalisée. Juste un peu plus avancé·e que là où tu es maintenant.',
      'Cette personne future te ressemble. Elle a vécu les douze mois qui te séparent d\'elle. Elle a peut-être traversé des choses dures. Elle a aussi traversé des moments lumineux.',
      'Tu vas lui écrire. Pas pour lui demander des résultats. Pour lui dire ce que tu espères qu\'elle aura compris.',
    ],
    prompts: [
      'Qu\'est-ce que tu lui souhaites d\'avoir appris à propos d\'elle-même ?',
      'Qu\'est-ce que tu espères qu\'elle aura osé ?',
      'Qu\'est-ce que tu lui dis pour la rassurer, depuis aujourd\'hui ?',
    ],
    closing: 'Cette personne future te lit. Elle est en chemin vers toi, à chaque pas que tu fais aujourd\'hui.',
  },
  {
    key: 'prochain-pas',
    temps: 'futur',
    title: 'Mon prochain pas',
    subtitle: 'Une action concrète, aujourd\'hui.',
    duration: 5,
    guide: [
      'Les grands changements paraissent inatteignables. Et c\'est normal — on ne peut pas y aller d\'un coup.',
      'Mais il y a toujours un prochain pas. Petit. Concret. Possible aujourd\'hui.',
      'Pas demain. Pas quand tu seras prêt·e. Aujourd\'hui.',
      'Tu vas en choisir un. Un seul. Et tu vas le faire avant de te coucher.',
    ],
    prompts: [
      'Quel grand changement j\'aimerais voir dans ma vie ?',
      'Quel pas, tout petit, je peux faire aujourd\'hui dans cette direction ?',
      'Qu\'est-ce qui m\'empêcherait de le faire ? Comment je peux contourner cet obstacle ?',
    ],
    closing: 'Le futur ne se construit pas en pensant. Il se construit en faisant. Même un petit pas.',
  },
  {
    key: 'coherence',
    temps: 'futur',
    title: 'Cohérence',
    subtitle: 'Mes actes face à mes valeurs.',
    duration: 8,
    guide: [
      'Vivre en cohérence, c\'est faire en sorte que ce que tu fais ressemble à ce que tu portes.',
      'Quand il y a un écart trop grand, on s\'épuise. Le corps proteste. L\'esprit se brouille.',
      'Aujourd\'hui, tu vas regarder honnêtement. Pas pour te juger. Pour voir.',
      'Là où tu es aligné·e : c\'est ta force. Là où tu ne l\'es pas : c\'est ta prochaine invitation.',
    ],
    prompts: [
      'Dans quel domaine de ma vie je sens que je suis cohérent·e avec mes valeurs ?',
      'Où, à l\'inverse, je sens un écart ? Quelle valeur n\'est pas honorée ?',
      'Quelle décision je pourrais prendre cette semaine pour me rapprocher de moi-même ?',
    ],
    closing: 'La cohérence n\'est pas un état parfait. C\'est une direction. Chaque retour à toi compte.',
  },
];

export function getRituelsForTemps(tempsKey) {
  return RITUELS.filter((r) => r.temps === tempsKey);
}

export function getRituel(key) {
  return RITUELS.find((r) => r.key === key);
}
