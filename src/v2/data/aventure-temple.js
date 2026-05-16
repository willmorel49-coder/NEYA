/* ============================================================
   ÇA VA ? — Aventure Temple des Parts (parcours narratif interactif)
   ============================================================
   Théme : accepter ses contradictions, tenir ses parts ensemble.
   Totem : Ours polaire.
   ============================================================ */

export const AVENTURE_TEMPLE = {
  key: 'temple',
  name: 'Temple des Parts',
  totem: 'Ours polaire',
  image: '/img/world-temple.png',
  accent: '#7397BC',
  accentRgb: 'rgba(115, 151, 188',
  startScene: 'seuil',
  totalScenes: 14,

  scenes: {
    /* ─── ACTE 1 · LE SEUIL ─── */
    seuil: {
      kind: 'narrative',
      eyebrow: 'TEMPLE DES PARTS · SEUIL',
      title: 'Plusieurs portes',
      body: [
        'Tu pénètres dans un Temple ancien. Le silence est dense, presque liquide.',
        'Devant toi, plusieurs portes. Chacune ouvre sur une partie de toi.',
        'Tu ne sais pas par où commencer. C\'est normal.',
      ],
      quote: 'Les parts de toi ne se combattent pas. Elles se rencontrent.',
      cta: 'Entrer',
      next: 'premier-choix',
    },

    'premier-choix': {
      kind: 'choice',
      eyebrow: 'TEMPLE · LA PREMIÈRE PORTE',
      title: 'Quelle porte t\'appelle ?',
      body: [
        'Tu sens que tu portes des contradictions. Tu peux aimer et en vouloir. Vouloir avancer et stagner. Te trouver fort·e et faible.',
        'Choisis la porte qui t\'attire le plus aujourd\'hui.',
      ],
      choices: [
        { label: 'La porte de ce que je cache',     next: 'porte-cache',   gainKey: 'visibilité' },
        { label: 'La porte de ce que je sur-fais',  next: 'porte-surfaire', gainKey: 'douceur' },
        { label: 'La porte de ce que je n\'ose pas', next: 'porte-osepas',  gainKey: 'courage' },
      ],
    },

    'porte-cache': {
      kind: 'narrative',
      title: 'La porte de ce que je cache',
      body: [
        'Tu ouvres une porte feutrée. Derrière, une pièce remplie de masques. Beaux, soignés, parfaitement ajustés.',
        'Ce sont les masques que tu portes pour ne pas montrer ce qui te traverse vraiment.',
        'Tu en reconnais certains immédiatement. D\'autres te surprennent.',
      ],
      quote: 'Les masques ne sont pas des mensonges. Ce sont des protections qu\'on n\'a plus besoin de garder.',
      cta: 'Continuer',
      next: 'ours-rencontre',
    },

    'porte-surfaire': {
      kind: 'narrative',
      title: 'La porte de ce que je sur-fais',
      body: [
        'La porte est lourde. Derrière, une scène : tu es là, en train de faire mille choses à la fois.',
        'Tu te dis que c\'est nécessaire. Que personne d\'autre ne le fera. Que tu n\'as pas le choix.',
        'Mais tu sens, au fond, que tu te sur-actives pour ne pas sentir autre chose.',
      ],
      quote: 'Être occupé·e n\'est pas être présent·e. Parfois c\'est même le contraire.',
      cta: 'Continuer',
      next: 'ours-rencontre',
    },

    'porte-osepas': {
      kind: 'narrative',
      title: 'La porte de ce que je n\'ose pas',
      body: [
        'Cette porte tremble un peu. Tu hésites. Tu l\'ouvres quand même.',
        'Derrière, des choses que tu rêves de faire, de dire, de devenir. Des envies que tu as enfouies parce qu\'elles te faisaient peur.',
        'Elles sont toutes là, intactes.',
      ],
      quote: 'Ce que tu n\'oses pas faire n\'est pas perdu. C\'est en attente.',
      cta: 'Continuer',
      next: 'ours-rencontre',
    },

    /* ─── ACTE 2 · LA RENCONTRE ─── */
    'ours-rencontre': {
      kind: 'narrative',
      eyebrow: 'TEMPLE · LA RENCONTRE',
      title: 'L\'Ours polaire',
      body: [
        'Au centre du Temple, un Ours polaire est assis. Massif, calme, présent.',
        'Il n\'a peur d\'aucune de tes parts. Il les connaît toutes.',
        'Il te fait signe de t\'asseoir avec lui.',
      ],
      quote: 'Je ne suis pas là pour t\'aider à choisir. Je suis là pour t\'aider à les tenir.',
      cta: 'M\'asseoir',
      next: 'ours-question',
    },

    'ours-question': {
      kind: 'choice',
      title: 'L\'Ours te demande',
      body: [
        '« Quelle contradiction te traverse en ce moment ? »',
        'Il ne te demande pas de la résoudre. Juste de la nommer.',
      ],
      choices: [
        { label: 'Je veux avancer et je ne bouge pas', next: 'tension-paralysie',  gainKey: 'mouvement' },
        { label: 'J\'aime quelqu\'un qui me fait mal',  next: 'tension-amour',       gainKey: 'lucidité' },
        { label: 'Je veux changer et j\'ai peur',       next: 'tension-changement',  gainKey: 'autorisation' },
        { label: 'Je veux être proche et je m\'éloigne', next: 'tension-intimité',   gainKey: 'présence' },
      ],
    },

    'tension-paralysie': {
      kind: 'narrative',
      title: 'L\'Ours répond',
      body: [
        '« Une part de toi veut le changement. L\'autre veut la sécurité. »',
        '« Les deux ont raison. Elles ne se trompent pas. Elles se protègent, chacune à sa manière. »',
        '« Ton travail n\'est pas de choisir laquelle gagne. C\'est de les inviter à parler. »',
      ],
      quote: 'La paralysie n\'est pas l\'absence de mouvement. C\'est un mouvement intérieur que tu n\'as pas encore entendu.',
      cta: 'Continuer',
      next: 'apres-cle-1',
    },

    'tension-amour': {
      kind: 'narrative',
      title: 'L\'Ours répond',
      body: [
        '« Aimer et souffrir peuvent cohabiter. Ce n\'est pas que l\'un est faux. »',
        '« Ce qu\'on apprend, dans ce temple, c\'est qu\'on peut aimer quelqu\'un ET poser des limites. »',
        '« Aimer ne te rend pas responsable de ce que l\'autre te fait. »',
      ],
      quote: 'Tu as le droit d\'aimer quelqu\'un et de te protéger de ce que cette personne te fait.',
      cta: 'Continuer',
      next: 'apres-cle-1',
    },

    'tension-changement': {
      kind: 'narrative',
      title: 'L\'Ours répond',
      body: [
        '« Vouloir changer fait peur. Parce que ça veut dire devenir quelqu\'un que tu ne connais pas encore. »',
        '« La part de toi qui a peur est celle qui te tient en sécurité. Elle a raison de tirer le frein. »',
        '« Tu peux la remercier. Et avancer quand même, doucement. »',
      ],
      quote: 'Peur et désir habitent souvent le même cœur. Apprends à les distinguer.',
      cta: 'Continuer',
      next: 'apres-cle-1',
    },

    'tension-intimité': {
      kind: 'narrative',
      title: 'L\'Ours répond',
      body: [
        '« Tu veux qu\'on te voie. Et quand quelqu\'un s\'approche, tu recules. »',
        '« Une part de toi a appris, jeune, que la proximité fait mal. Elle a raison de se méfier. »',
        '« Mais elle ne sait pas encore qu\'aujourd\'hui, tu peux choisir qui s\'approche. »',
      ],
      quote: 'L\'intimité s\'apprend. Lentement. À ton rythme.',
      cta: 'Continuer',
      next: 'apres-cle-1',
    },

    'apres-cle-1': {
      kind: 'reflection',
      title: 'La table commune',
      body: [
        'L\'Ours te fait imaginer une grande table. Tu y invites les deux parts qui se contredisent.',
        'Pas pour qu\'elles tombent d\'accord. Juste pour qu\'elles soient là, toutes les deux.',
      ],
      prompt: 'Si tu pouvais leur écrire un mot à chacune, que dirais-tu ? Tu peux noter ce qui vient.',
      cta: 'C\'est posé',
      next: 'integration',
      gainKey: 'accueil',
    },

    /* ─── ACTE 3 · L'INTÉGRATION ─── */
    integration: {
      kind: 'narrative',
      eyebrow: 'TEMPLE · L\'INTÉGRATION',
      title: 'Ni l\'une ni l\'autre',
      body: [
        'Quelque chose se détend dans le Temple. La tension entre les deux parts cesse d\'être un combat. Elle devient un dialogue.',
        'Tu n\'as pas eu besoin de choisir laquelle a raison. Tu leur as juste fait de la place.',
        'L\'Ours polaire t\'observe avec ce qui ressemble à de la fierté.',
      ],
      quote: 'Tenir ensemble tes morceaux, c\'est ça l\'unité. Pas être d\'une seule pièce.',
      cta: 'Recevoir',
      next: 'fin-recap',
    },

    /* ─── ACTE 4 · LE PASSAGE ─── */
    'fin-recap': {
      kind: 'keys-recap',
      eyebrow: 'TEMPLE · CE QUE TU EMPORTES',
      title: 'Les clés que tu portes',
      body: [
        'L\'Ours polaire se redresse et marche vers la sortie.',
        'Tu le suis.',
      ],
      cta: 'Sortir du Temple',
      next: 'final',
    },

    final: {
      kind: 'final',
      eyebrow: 'TEMPLE DES PARTS · TRAVERSÉE',
      title: 'Tu sors',
      body: [
        'Tu n\'es pas devenu·e plus simple. Tu es devenu·e plus capable de tenir ta complexité.',
        'L\'Ours polaire reste avec toi. Quand une nouvelle contradiction se présentera, tu sauras l\'inviter à la table plutôt que la combattre.',
      ],
      quote: 'Tu peux être tout ça à la fois. C\'est pour ça que tu es vivant·e.',
      cta: 'Terminer le voyage',
    },
  },
};
