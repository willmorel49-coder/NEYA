// Italique léger sur 2-4 mots-clés par bloc — signature NÉYA (Fraunces italic SOFT).
// Format de paragraphe : array de tokens. Token = string OU { em: string }.

export const ONBOARDING_SCREENS = [
  {
    id: 'merci',
    eyebrow: '01 · ARRIVÉE',
    image: '/cava/brand/cava-007.jpg',
    alt: 'Deux silhouettes de dos contemplant un coucher de soleil',
    title: [{ em: 'Merci' }, '.'],
    body: [
      'Merci d’être ici. Parce que parfois, ',
      { em: 'continuer à avancer' },
      ' demande déjà une force immense.',
    ],
    subBody: [
      'Il y a des douleurs qui ne se voient pas. Des ',
      { em: 'tempêtes silencieuses' },
      ' que certaines personnes apprennent à cacher tellement longtemps qu’elles deviennent invisibles aux yeux des autres. Le monde continue normalement autour. Et pendant ce temps-là, certains essaient juste de ',
      { em: 'survivre à ce qu’ils ressentent' },
      ' à l’intérieur.',
    ],
  },
  {
    id: 'origine',
    eyebrow: '02 · ORIGINE',
    image: '/cava/brand/cava-100.jpg',
    alt: 'Silhouette de dos seule au milieu de la foule, lumières de la ville la nuit',
    title: [{ em: 'D’où' }, ' ça vient.'],
    body: [
      'ÇA VA ? est née d’un vrai ',
      { em: 'mal-être' },
      '. De crises d’angoisse vécues en silence. De nuits passées à attendre que la panique redescende.',
    ],
    subBody: [
      'Mais le plus difficile n’était pas toujours la douleur. Le plus difficile, c’était de continuer à ',
      { em: 'faire semblant' },
      ' que tout allait bien. De sourire automatiquement. De répondre « ça va » alors qu’au fond ',
      { em: 'tout s’effondrait doucement' },
      '.',
    ],
  },
  {
    id: 'pourquoi',
    eyebrow: '03 · REFUGE',
    image: '/cava/brand/cava-040.jpg',
    alt: 'Intérieur calme ouvert sur l’horizon — un refuge à soi',
    title: ['Pourquoi ', { em: 'ÇA VA ?' }],
    body: [
      'Parce qu’un jour, cette question a commencé à ',
      { em: 'faire mal' },
      '. Deux mots simples que tout le monde prononce. Mais pour certaines personnes, ces mots cachent des choses très lourdes.',
    ],
    subBody: [
      'Cette application n’a pas été créée pour rendre les gens plus performants. Elle a été créée pour offrir un endroit calme. ',
      { em: 'Un refuge' },
      '. Un espace où l’on peut respirer quelques minutes sans avoir besoin de ',
      { em: 'prétendre que tout va bien' },
      '.',
    ],
  },
  {
    id: 'qui',
    eyebrow: '04 · CRÉATION',
    image: '/cava/brand/cava-105.jpg',
    alt: 'Deux silhouettes paisibles regardant l’horizon doré',
    title: ['Qui ', { em: 'l’a fait' }, '.'],
    body: [
      'Cette application a été créée par quelqu’un qui ',
      { em: 'connaît réellement' },
      ' ces états-là. Qui sait ce que ça fait d’avoir peur de son propre cerveau. De cacher ses crises.',
    ],
    subBody: [
      'Alors un jour, une idée est née : créer ',
      { em: 'l’endroit qu’on aurait aimé trouver' },
      ' pendant ses pires nuits. Un endroit doux. Humain. Silencieux. Qui ne juge pas. Qui te laisse simplement exister, respirer, et te sentir ',
      { em: 'un peu moins seul' },
      '.',
    ],
    signature: [
      'NÉYA — ',
      { em: 'L’application faite pour ceux qui disent « ça va » quand ça ne va pas.' },
    ],
  },
];
