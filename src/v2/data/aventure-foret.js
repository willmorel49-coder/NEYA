/* ============================================================
   ÇA VA ? — Aventure Forêt de Clarté (parcours narratif interactif)
   ============================================================
   Graph de scènes. Chaque scène a un kind qui détermine son
   comportement dans le AventurePlayer :

     narrative   — texte + image + bouton "Avancer"
     choice      — 2-4 choix de dialogue/action, chacun mène ailleurs
     breathing   — mini-jeu respiration 3 cycles inspire-expire
     reflection  — textarea pour écrire ce qui vient
     keys-recap  — récap des clés collectées
     final       — clôture du monde, marque comme complété

   Le joueur collecte des "clés de clarté" : insights qu'il
   emporte en sortant de la forêt.
   ============================================================ */

export const AVENTURE_FORET = {
  key: 'foret',
  name: 'Forêt de Clarté',
  totem: 'Lion blanc',
  image: '/img/world-foret.png',
  accent: '#C29051',
  accentRgb: 'rgba(194, 144, 81',
  startScene: 'seuil',
  totalScenes: 12, // Approximation pour la progress bar

  scenes: {
    /* ─── ACTE 1 · LE SEUIL ─── */
    seuil: {
      kind: 'narrative',
      eyebrow: 'FORÊT DE CLARTÉ · SEUIL',
      title: 'Le brouillard',
      body: [
        'Tu poses le premier pas dans une forêt que tu ne connais pas encore.',
        'Le brouillard danse entre les arbres. Tu ne vois pas loin devant toi.',
        'C\'est OK. Personne ne voit jamais tout le chemin.',
      ],
      quote: 'On entre dans la forêt parce qu\'on a besoin de quelque chose qu\'on ne sait pas encore.',
      cta: 'Avancer',
      next: 'premier-choix',
    },

    'premier-choix': {
      kind: 'choice',
      eyebrow: 'FORÊT · UN PREMIER PAS',
      title: 'Comment veux-tu marcher ?',
      body: [
        'Le sol est doux sous tes pieds. La forêt t\'invite.',
      ],
      choices: [
        { label: 'Doucement, en respirant', next: 'respire-1' },
        { label: 'Vite, pour passer le brouillard', next: 'vite-1' },
        { label: 'Je m\'assieds d\'abord', next: 'assise-1', gainKey: 'écoute' },
      ],
    },

    'vite-1': {
      kind: 'narrative',
      title: 'Tu cours',
      body: [
        'Tu marches vite. Tu te cognes contre un arbre. Tu t\'arrêtes.',
        'Le brouillard ne se dissipe pas en allant plus vite.',
        'Il se dissipe en restant.',
      ],
      cta: 'Recommencer doucement',
      next: 'respire-1',
    },

    'assise-1': {
      kind: 'reflection',
      title: 'Tu t\'assieds.',
      prompt: 'Qu\'est-ce qui pèse là, maintenant ? Pose-le. Tu peux écrire ou juste respirer.',
      cta: 'J\'ai posé',
      next: 'respire-1',
    },

    'respire-1': {
      kind: 'breathing',
      title: 'Respire avec la forêt',
      subtitle: 'Trois respirations · inspire 4s · expire 6s',
      cycles: 3,
      next: 'lion-rencontre',
      gainKey: 'présence',
    },

    /* ─── ACTE 2 · LA RENCONTRE ─── */
    'lion-rencontre': {
      kind: 'narrative',
      eyebrow: 'FORÊT · LA RENCONTRE',
      title: 'Le Lion blanc',
      body: [
        'Une présence se dessine entre deux troncs. Un lion blanc, immense et calme.',
        'Il te regarde sans te juger.',
        'Il te dit, sans bouger les lèvres :',
      ],
      quote: 'Je t\'attendais. Approche.',
      cta: 'M\'approcher',
      next: 'lion-question',
    },

    'lion-question': {
      kind: 'choice',
      title: 'Le Lion blanc te demande',
      body: [
        '« Qu\'est-ce qui est flou pour toi en ce moment ? »',
      ],
      choices: [
        { label: 'Je ne sais plus ce que je veux', next: 'doute-vouloir', gainKey: 'direction' },
        { label: 'J\'ai peur de me tromper',       next: 'doute-peur',    gainKey: 'permission' },
        { label: 'Tout me semble lourd',           next: 'doute-poids',   gainKey: 'allégement' },
        { label: 'Je ne sais pas mettre de mots',  next: 'doute-silence', gainKey: 'patience' },
      ],
    },

    'doute-vouloir': {
      kind: 'narrative',
      title: 'Une clé de direction',
      body: [
        'Le Lion blanc hoche la tête lentement.',
        '« Ne pas savoir ce qu\'on veut, ce n\'est pas être perdu. C\'est être en train d\'apprendre. »',
        'Une petite lumière dorée naît dans sa patte. Il te la tend.',
      ],
      quote: 'Tu n\'as pas à choisir une direction définitive. Tu as juste à faire un pas dans une direction.',
      cta: 'Prendre la clé',
      next: 'apres-cle-1',
    },

    'doute-peur': {
      kind: 'narrative',
      title: 'Une clé de permission',
      body: [
        'Le Lion blanc ferme les yeux un instant.',
        '« Tu as peur de te tromper. C\'est que tu prends ta vie au sérieux. C\'est précieux. »',
        '« Mais te tromper, ce n\'est pas échouer. C\'est apprendre. »',
        'Une clé de lumière apparaît dans sa patte.',
      ],
      quote: 'Tu as le droit de te tromper. C\'est aussi une forme d\'avancer.',
      cta: 'Prendre la clé',
      next: 'apres-cle-1',
    },

    'doute-poids': {
      kind: 'narrative',
      title: 'Une clé d\'allégement',
      body: [
        'Le Lion blanc s\'allonge à côté de toi.',
        '« Tu portes beaucoup. Tu portes même ce qui n\'est pas à toi. »',
        '« Tu peux poser certaines choses ici. Cette forêt sait les garder. »',
        'Une clé de lumière s\'attache à ton vêtement.',
      ],
      quote: 'Tout ce que tu portes n\'est pas à toi. Apprends à reconnaître ce qui t\'appartient.',
      cta: 'Prendre la clé',
      next: 'apres-cle-1',
    },

    'doute-silence': {
      kind: 'narrative',
      title: 'Une clé de patience',
      body: [
        'Le Lion blanc ne dit rien. Il reste avec toi en silence.',
        'Puis, doucement :',
        '« Tu n\'as pas à mettre des mots pour que ce que tu ressens existe. »',
        'Une clé de lumière apparaît dans tes mains, sans qu\'il ait à te la tendre.',
      ],
      quote: 'Les mots viendront. Pour l\'instant, le silence suffit.',
      cta: 'Prendre la clé',
      next: 'apres-cle-1',
    },

    'apres-cle-1': {
      kind: 'narrative',
      title: 'Tu glisses la clé',
      body: [
        'Tu sens son poids — léger, mais bien réel.',
        'Le Lion blanc se relève et avance.',
        'Tu le suis.',
      ],
      cta: 'Suivre le Lion',
      next: 'clairiere',
    },

    /* ─── ACTE 3 · LA CLAIRIÈRE ─── */
    clairiere: {
      kind: 'narrative',
      eyebrow: 'FORÊT · LA CLAIRIÈRE',
      title: 'Un endroit clair',
      body: [
        'Vous arrivez dans une clairière. La lumière y est posée comme une nappe d\'or.',
        'Le Lion blanc s\'assied. Il te montre une pierre plate au centre.',
        '« Pose ici ce que tu veux laisser dans la forêt. Tu n\'es pas obligé·e. Mais tu peux. »',
      ],
      cta: 'M\'approcher de la pierre',
      next: 'pierre-depose',
    },

    'pierre-depose': {
      kind: 'reflection',
      title: 'Ce que tu déposes',
      prompt: 'Une pensée, une peur, un poids, un masque. Tu peux écrire ce que tu déposes ici. Ou simplement le dire dans ta tête.',
      cta: 'C\'est posé',
      next: 'mantra-recue',
    },

    'mantra-recue': {
      kind: 'choice',
      eyebrow: 'FORÊT · LE DON',
      title: 'Le Lion te confie une phrase',
      body: [
        'Le Lion blanc te regarde longuement.',
        '« Voici une phrase à emporter. Choisis celle qui te ressemble le plus aujourd\'hui. »',
      ],
      choices: [
        { label: 'Je n\'ai pas à tout savoir.',              next: 'fin-recap', gainKey: 'humilité' },
        { label: 'Mon prochain pas suffit.',                  next: 'fin-recap', gainKey: 'cadence' },
        { label: 'Je peux être perdu·e sans être brisé·e.',   next: 'fin-recap', gainKey: 'résilience' },
        { label: 'Le brouillard se lèvera. Pas avant. Pas après.', next: 'fin-recap', gainKey: 'confiance' },
      ],
    },

    /* ─── ACTE 4 · LA SORTIE ─── */
    'fin-recap': {
      kind: 'keys-recap',
      eyebrow: 'FORÊT · CE QUE TU EMPORTES',
      title: 'Les clés que tu portes maintenant',
      body: [
        'Le Lion blanc s\'incline doucement.',
        'Il te raccompagne jusqu\'à l\'orée.',
      ],
      cta: 'Sortir de la forêt',
      next: 'final',
    },

    final: {
      kind: 'final',
      eyebrow: 'FORÊT DE CLARTÉ · TRAVERSÉE',
      title: 'Tu sors',
      body: [
        'Le brouillard ne s\'est pas complètement levé. Mais tu marches avec lui maintenant, plutôt que contre lui.',
        'Le Lion blanc est en toi. Tu peux revenir le voir à tout moment.',
      ],
      quote: 'La clarté n\'est pas l\'absence de doute. C\'est savoir avancer avec lui.',
      cta: 'Terminer le voyage',
    },
  },
};
