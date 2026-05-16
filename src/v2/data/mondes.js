/* ============================================================
   NÉYA — Mondes émotionnels (parcours initiatique)
   ============================================================
   6 mondes, chacun = un voyage à étapes narratives.
   3 mondes complets en V1 (Forêt, Temple, Oasis).
   3 mondes "bientôt" (Lac, Montagne, Refuge).

   Structure de chaque étape :
     - key                 (identifiant)
     - eyebrow             (étape 1/5 etc.)
     - title               (titre court italique)
     - body                (paragraphes narratifs)
     - quote (optionnel)   (citation finale en exergue)
     - cta                 (bouton de passage)
     - kind ('intro' | 'rencontre' | 'epreuve' | 'integration' | 'passage')
   ============================================================ */

export const MONDES = [
  /* ═══════════════ 01 · FORÊT DE CLARTÉ ═══════════════ */
  {
    key: 'foret',
    order: 1,
    name: 'Forêt de Clarté',
    totem: 'Lion blanc',
    image: '/img/world-foret.png',
    accent: '#C29051',
    accentRgb: 'rgba(194, 144, 81',
    emotion: 'Sortir du brouillard',
    pitch: 'Quand tout devient flou et qu\'on ne sait plus ce qu\'on veut, on entre dans la forêt.',
    available: true,
    etapes: [
      {
        key: 'seuil',
        kind: 'intro',
        eyebrow: 'Le seuil',
        title: 'Une forêt sans chemin',
        body: [
          'Tu poses le premier pas. La lumière filtre à travers les feuilles, douce et incertaine.',
          'Tu ne sais pas vraiment ce qui t\'amène ici. Une fatigue, peut-être. Une question qui revient sans réponse. L\'impression que les choses ont perdu leur netteté.',
          'C\'est exactement pour ça que tu es là. La Forêt de Clarté n\'est pas un endroit qu\'on traverse en ligne droite. C\'est un endroit où on apprend à voir mieux.',
        ],
        quote: 'Le brouillard n\'est pas dehors. Il est en toi. Et c\'est pour ça qu\'il peut se dissiper.',
        cta: 'Avancer',
      },
      {
        key: 'rencontre',
        kind: 'rencontre',
        eyebrow: 'Le Lion blanc',
        title: 'Une présence qui t\'attendait',
        body: [
          'Une silhouette se dessine entre deux troncs. Un lion blanc, immense et calme. Il ne te regarde pas comme une proie. Il te regarde comme on regarde quelqu\'un qu\'on connaît depuis longtemps.',
          'Le Lion blanc est ton totem dans ce monde. Il n\'est pas extérieur à toi. C\'est la partie de toi qui sait, même quand ta tête doute. Celle qui voit clair, même quand tu te sens perdu·e.',
          'Il ne te demande rien. Il te tient compagnie.',
        ],
        quote: 'Tu as déjà tout ce qu\'il faut. C\'est juste recouvert.',
        cta: 'Continuer',
      },
      {
        key: 'epreuve',
        kind: 'epreuve',
        eyebrow: 'La question du brouillard',
        title: 'Qu\'est-ce qui est flou pour toi en ce moment ?',
        body: [
          'Le Lion blanc s\'assied. Tu peux poser quelque chose qui te trouble. Une décision que tu n\'arrives pas à prendre. Un sentiment que tu n\'arrives pas à nommer. Une situation qui te paraît embrouillée.',
          'Tu n\'as pas besoin de trouver la réponse maintenant. Juste de formuler ce qui est flou.',
          'Le brouillard se dissipe d\'abord par les mots qu\'on met dessus. Avant d\'être résolu, un problème doit être nommé.',
        ],
        cta: 'J\'ai posé ma question',
      },
      {
        key: 'integration',
        kind: 'integration',
        eyebrow: 'La clairière',
        title: 'Un endroit clair, juste un instant',
        body: [
          'Tu arrives à une clairière. La lumière est là, posée comme une nappe d\'or.',
          'Le Lion blanc te dit quelque chose, sans bouger les lèvres : tu n\'auras pas tout compris en sortant de cette forêt. Mais tu auras vu un peu plus clair. C\'est déjà beaucoup.',
          'Prends un instant. Respire. Reconnais ce qui est là maintenant : ce que tu peux voir, ce que tu ne vois pas encore, et le fait que c\'est OK.',
        ],
        quote: 'La clarté n\'est pas l\'absence de doute. C\'est savoir avancer avec lui.',
        cta: 'Recevoir',
      },
      {
        key: 'passage',
        kind: 'passage',
        eyebrow: 'Le passage',
        title: 'Ce que tu emportes',
        body: [
          'Tu repars de la Forêt de Clarté. Le Lion blanc reste en toi, comme une présence calme à laquelle revenir quand tu te sentiras à nouveau dans le brouillard.',
          'Tu as appris que la clarté ne vient pas en pensant plus fort. Elle vient en s\'arrêtant. En nommant. En laissant le brouillard se dissiper à son rythme.',
          'Le Temple t\'attend. Mais tu peux revenir ici à chaque fois que tu en as besoin.',
        ],
        quote: 'Tu n\'as plus besoin de voir tout le chemin. Juste le prochain pas.',
        cta: 'Terminer le monde',
      },
    ],
  },

  /* ═══════════════ 02 · TEMPLE DES PARTS DE SOI ═══════════════ */
  {
    key: 'temple',
    order: 2,
    name: 'Temple des Parts',
    totem: 'Ours polaire',
    image: '/img/world-temple.png',
    accent: '#7397BC',
    accentRgb: 'rgba(115, 151, 188',
    emotion: 'Accepter ses contradictions',
    pitch: 'Quand on se sent multiple et qu\'on aimerait être d\'une seule pièce, on entre dans le Temple.',
    available: true,
    etapes: [
      {
        key: 'seuil',
        kind: 'intro',
        eyebrow: 'Le seuil',
        title: 'Plusieurs portes',
        body: [
          'Tu pénètres dans un Temple ancien. Le silence est dense, presque liquide. Devant toi, plusieurs portes. Chacune ouvre sur une partie de toi.',
          'Tu portes en toi des contradictions. Tu peux aimer quelqu\'un et lui en vouloir. Tu peux vouloir avancer et avoir envie de ne rien faire. Tu peux te trouver fort·e et faible le même jour.',
          'Tu n\'es pas brisé·e. Tu es multiple. Et c\'est le Temple qui te l\'apprend.',
        ],
        quote: 'Les parts de toi ne se combattent pas. Elles se rencontrent.',
        cta: 'Entrer',
      },
      {
        key: 'rencontre',
        kind: 'rencontre',
        eyebrow: 'L\'Ours polaire',
        title: 'Une force tranquille',
        body: [
          'Au centre du Temple, un Ours polaire est assis. Massif, calme, présent. Il n\'a peur d\'aucune de tes parts. Il les connaît toutes.',
          'L\'Ours est ton totem ici. Il représente la part de toi qui peut tenir TOUT ce que tu portes, sans avoir besoin de trier, de juger, de réparer. La part de toi qui peut juste regarder, et accueillir.',
          'Il te fait signe de t\'asseoir avec lui.',
        ],
        quote: 'Tu n\'as pas à choisir entre tes parts. Tu as juste à apprendre à les écouter.',
        cta: 'M\'asseoir',
      },
      {
        key: 'epreuve',
        kind: 'epreuve',
        eyebrow: 'Les parts qui se battent',
        title: 'Quelle contradiction te traverse en ce moment ?',
        body: [
          'L\'Ours te montre deux des portes. À gauche, une part de toi qui veut une chose. À droite, une part qui veut son contraire.',
          'On grandit en croyant qu\'il faut "se décider". Que les contradictions sont un défaut. C\'est faux. Les deux parts ont raison, chacune à sa façon. L\'une protège quelque chose. L\'autre désire quelque chose. Les deux sont valables.',
          'Nomme l\'une des contradictions qui t\'habite. Qu\'est-ce qui en toi tire dans deux directions opposées ?',
        ],
        cta: 'J\'ai nommé la tension',
      },
      {
        key: 'integration',
        kind: 'integration',
        eyebrow: 'La table commune',
        title: 'Faire de la place aux deux',
        body: [
          'L\'Ours te fait imaginer une table. Tu invites les deux parts à s\'y asseoir. Pas pour qu\'elles se réconcilient. Juste pour qu\'elles aient toutes les deux une place.',
          'Tu n\'as pas à choisir laquelle a raison. Tu peux juste reconnaître : voilà, j\'ai cette partie de moi qui veut ça. Et celle-là qui veut autre chose. Les deux sont moi.',
          'Quand on fait ça, quelque chose se détend. La tension intérieure cesse d\'être un combat. Elle devient un dialogue.',
        ],
        quote: 'L\'unité, ce n\'est pas être d\'une seule pièce. C\'est tenir ensemble tes morceaux.',
        cta: 'Accepter',
      },
      {
        key: 'passage',
        kind: 'passage',
        eyebrow: 'Le passage',
        title: 'Ce que tu emportes',
        body: [
          'Tu sors du Temple. Tu n\'es pas devenu·e plus simple. Tu es devenu·e plus capable de tenir ta complexité.',
          'L\'Ours polaire reste avec toi. Quand une nouvelle contradiction se présentera, tu sauras l\'inviter à la table plutôt que la combattre.',
          'L\'Oasis t\'attend. Mais le Temple est ouvert dès que tu en as besoin.',
        ],
        quote: 'Tu peux être tout ça à la fois. C\'est pour ça que tu es vivant·e.',
        cta: 'Terminer le monde',
      },
    ],
  },

  /* ═══════════════ 03 · OASIS DU PRÉSENT ═══════════════ */
  {
    key: 'oasis',
    order: 3,
    name: 'Oasis du Présent',
    totem: 'Aigle céleste',
    image: '/img/world-oasis.png',
    accent: '#9F584C',
    accentRgb: 'rgba(159, 88, 76',
    emotion: 'Habiter l\'instant',
    pitch: 'Quand on vit dans le passé qui pèse ou le futur qui inquiète, on entre dans l\'Oasis.',
    available: true,
    etapes: [
      {
        key: 'seuil',
        kind: 'intro',
        eyebrow: 'Le seuil',
        title: 'Le sable, l\'eau, la chaleur',
        body: [
          'Tu arrives dans une oasis. Le soleil tape, l\'eau scintille, les palmiers offrent une ombre douce.',
          'Tu portes peut-être un passé qui ne te lâche pas. Ou un futur qui te tient en alerte. Tu vis souvent ailleurs que là. Dans ce qui s\'est passé. Dans ce qui pourrait arriver.',
          'L\'Oasis n\'est ni hier ni demain. C\'est maintenant. Ici. Cet instant.',
        ],
        quote: 'Le présent n\'est pas une destination. C\'est le seul endroit où tu peux vraiment être.',
        cta: 'M\'arrêter',
      },
      {
        key: 'rencontre',
        kind: 'rencontre',
        eyebrow: 'L\'Aigle céleste',
        title: 'Une vision claire',
        body: [
          'Un Aigle céleste tourne haut au-dessus de toi. Puis il descend, lentement, et se pose sur une pierre proche.',
          'L\'Aigle est ton totem ici. Il représente la partie de toi qui peut prendre de la hauteur. Qui peut regarder le moment présent depuis un peu plus loin, sans s\'y noyer.',
          'L\'Aigle a une particularité : il a une vision incroyablement nette. Il peut voir un détail minuscule à grande distance. C\'est ce qu\'il t\'offre : la capacité de voir clairement ce qui est, maintenant.',
        ],
        quote: 'Voir clair, ce n\'est pas voir loin. C\'est voir ce qui est là.',
        cta: 'Continuer',
      },
      {
        key: 'epreuve',
        kind: 'epreuve',
        eyebrow: 'L\'ancrage',
        title: 'Cinq choses présentes',
        body: [
          'L\'Aigle te demande quelque chose de très simple. Lève la tête. Regarde autour de toi maintenant — l\'écran, la pièce, l\'extérieur si tu peux.',
          'Nomme cinq choses que tu vois précisément. Pas des concepts. Des choses concrètes : un objet, une couleur, une texture, un détail. Vraiment cinq.',
          'C\'est l\'exercice le plus simple et le plus puissant pour revenir au présent. Le corps s\'ancre par les sens. Et le mental suit le corps, pas l\'inverse.',
        ],
        cta: 'J\'ai posé mon regard',
      },
      {
        key: 'integration',
        kind: 'integration',
        eyebrow: 'Le souffle',
        title: 'Maintenant, juste maintenant',
        body: [
          'L\'Aigle te montre l\'eau de l\'oasis. Lisse. Sans rides. Reflétant le ciel.',
          'Si tu veux qu\'elle reste claire, tu ne la touches pas. Tu ne l\'agites pas. Tu la regardes simplement.',
          'Ton mental est pareil. Quand tu cesses de l\'agiter — en revenant dans le présent — il se calme. Pas instantanément. Mais sûrement. Une respiration à la fois.',
        ],
        quote: 'Tu n\'as rien d\'autre à faire que d\'être là, maintenant.',
        cta: 'Respirer',
      },
      {
        key: 'passage',
        kind: 'passage',
        eyebrow: 'Le passage',
        title: 'Ce que tu emportes',
        body: [
          'Tu quittes l\'Oasis. Tu ne resteras pas dans le présent en permanence — personne ne peut. Mais tu sauras y revenir. Plusieurs fois par jour. À chaque fois que tu te sentiras emporté·e par hier ou demain.',
          'L\'Aigle est en toi. Sa vision claire est devenue la tienne, par moments.',
          'Le Lac t\'attend. Mais l\'Oasis reste, accessible à tout instant.',
        ],
        quote: 'Maintenant. C\'est ici que tu vis. Nulle part ailleurs.',
        cta: 'Terminer le monde',
      },
    ],
  },

  /* ═══════════════ 04 · LAC DES ÉMOTIONS (bientôt) ═══════════════ */
  {
    key: 'lac',
    order: 4,
    name: 'Lac des Émotions',
    totem: 'Daim lunaire',
    image: '/img/world-lac.png',
    accent: '#7B6FA8',
    accentRgb: 'rgba(123, 111, 168',
    emotion: 'Traverser ses ressentis',
    pitch: 'Quand les émotions submergent et qu\'on voudrait juste qu\'elles s\'arrêtent.',
    available: false,
    etapes: [],
  },

  /* ═══════════════ 05 · MONTAGNE DE VISION (bientôt) ═══════════════ */
  {
    key: 'montagne',
    order: 5,
    name: 'Montagne de Vision',
    totem: 'Baleine sage',
    image: '/img/world-montagne.png',
    accent: '#34917F',
    accentRgb: 'rgba(52, 145, 127',
    emotion: 'Clarifier sa direction',
    pitch: 'Quand on ne sait plus où on va et que l\'horizon a disparu.',
    available: false,
    etapes: [],
  },

  /* ═══════════════ 06 · REFUGE PARTAGÉ (bientôt) ═══════════════ */
  {
    key: 'communaute',
    order: 6,
    name: 'Refuge partagé',
    totem: 'Renard de l\'aube',
    image: '/img/world-communaute.png',
    accent: '#9F584C',
    accentRgb: 'rgba(159, 88, 76',
    emotion: 'Apprendre à recevoir',
    pitch: 'Quand on s\'est trop habitué·e à donner sans demander.',
    available: false,
    etapes: [],
  },
];

export function getMonde(key) {
  return MONDES.find((m) => m.key === key);
}
