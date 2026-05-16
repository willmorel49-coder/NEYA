/* ============================================================
   NÉYA — Contenu des 8 leçons (bibliothèque pédagogique)
   ============================================================
   Chaque leçon : lead + 4 sections + note de fin.
   Ton : pas clinique, pas développement perso cliché.
   Poétique mais accessible. Reconnaît la complexité.
   ============================================================ */

export const LECONS = [
  /* ─── 01. L'ANXIÉTÉ ─── */
  {
    key: 'anxiete',
    title: 'L\'anxiété',
    subtitle: 'Comment elle se cache',
    accent: '#7397BC', // mist-blue
    duration: 4,
    lead: 'L\'anxiété ne crie pas toujours. Elle chuchote sous la table, déguisée en autre chose.',
    sections: [
      {
        title: 'Ce qu\'on croit en savoir',
        body: [
          'On l\'imagine comme une grande émotion visible. Le souffle court, le cœur qui s\'emballe, les paumes moites. Une crise qu\'on identifie.',
          'C\'est parfois vrai. Mais c\'est sa version la plus bruyante. La plus reconnaissable. Pas la plus fréquente.',
        ],
      },
      {
        title: 'Ce que c\'est vraiment',
        body: [
          'L\'anxiété chronique se déguise. Elle s\'appelle "perfectionnisme", "responsabilité", "contrôle", "anticipation". Elle se cache derrière des qualités qu\'on nous félicite d\'avoir.',
          'C\'est un système d\'alarme qui s\'est mis en route un jour pour une bonne raison — et qui n\'a jamais réussi à s\'éteindre. Ton corps continue à scanner le danger, longtemps après que le danger soit passé.',
          'Tu peux fonctionner. Tu peux même très bien fonctionner. Mais quelque chose en toi est en alerte permanente.',
        ],
      },
      {
        title: 'Les signaux à reconnaître',
        body: [
          'Tu rejoues mentalement des conversations passées.',
          'Tu prépares des scénarios pour des choses qui n\'arriveront probablement jamais.',
          'Tu te sens fatigué·e dès le réveil, sans avoir mal dormi.',
          'Tu ne peux pas vraiment te poser. Il y a toujours "encore quelque chose à faire".',
          'Tu as du mal à recevoir un compliment sans le minimiser.',
        ],
      },
      {
        title: 'Comment vivre avec',
        body: [
          'On ne "guérit" pas l\'anxiété comme on guérit d\'une grippe. On apprend à la reconnaître, à la nommer, à dialoguer avec elle.',
          'Le souffle long, le mouvement lent, le contact avec son corps — tout ce qui parle au système nerveux sans passer par la tête — sont des langages qu\'elle entend.',
          'Et surtout : tu n\'es pas ton anxiété. Elle est une partie de toi qui essaie de te protéger. Maladroitement, souvent. Mais elle essaie.',
        ],
      },
    ],
    closing: 'L\'anxiété n\'est pas ton ennemie. C\'est une partie de toi qui n\'a pas encore appris à se reposer.',
  },

  /* ─── 02. LA DÉPRESSION ─── */
  {
    key: 'depression',
    title: 'La dépression',
    subtitle: 'Au-delà du cliché',
    accent: '#7B6FA8',
    duration: 4,
    lead: 'Ce n\'est pas une grande tristesse. C\'est l\'absence de couleur.',
    sections: [
      {
        title: 'Ce qu\'on croit en savoir',
        body: [
          'On l\'associe à la tristesse, aux larmes, au désespoir visible. À quelqu\'un qui ne peut pas se lever.',
          'C\'est parfois cela. Mais la dépression a mille visages. Et beaucoup d\'entre eux sourient au quotidien.',
        ],
      },
      {
        title: 'Ce que c\'est vraiment',
        body: [
          'C\'est moins une émotion qu\'une absence d\'émotion. Le monde devient gris, plat, lointain. Tu vois les choses, mais elles ne te touchent plus comme avant.',
          'Tu peux rire à une blague et te sentir rien. Tu peux recevoir une bonne nouvelle et la noter mentalement comme "bonne", sans qu\'elle ne te réchauffe.',
          'C\'est aussi une fatigue qui ne se répare pas avec le sommeil. Une lourdeur dans tout le corps. Une impression de marcher sous l\'eau.',
          'Et souvent, une honte. La honte de ne pas réussir à "aller mieux", alors que tout va "bien" extérieurement.',
        ],
      },
      {
        title: 'Les signaux à reconnaître',
        body: [
          'Les choses que tu aimais ne te font plus rien.',
          'Tu reportes des décisions simples (manger, t\'habiller, répondre à un message).',
          'Tu te juges sévèrement, sans relâche.',
          'Tu te sens loin des autres, même quand ils sont là.',
          'Tu te demandes parfois à quoi bon — pas dans le sens dramatique, juste comme une question qui revient.',
        ],
      },
      {
        title: 'Comment vivre avec',
        body: [
          'La dépression ment. Elle te dit que c\'est de ta faute, que tu es seul·e, que ça ne passera pas. Aucune de ces phrases n\'est vraie.',
          'Le premier acte n\'est pas de "se reprendre en main". C\'est d\'oser dire à quelqu\'un — un proche, un soignant, une ligne d\'écoute — que ça ne va pas. Vraiment pas.',
          'Le mouvement aide, même tout petit. La lumière aide. Le contact humain aide. Les mots qu\'on pose aident.',
        ],
      },
    ],
    closing: 'Tu n\'es pas un échec. Tu traverses une période où ton cerveau te ment sur ta valeur.',
  },

  /* ─── 03. LE BURN-OUT ─── */
  {
    key: 'burnout',
    title: 'Le burn-out',
    subtitle: 'Les signaux qu\'on ignore',
    accent: '#C29051',
    duration: 4,
    lead: 'Le burn-out ne s\'annonce pas. Il arrive un mardi matin. Tu te brosses les dents et tu ne peux plus cracher.',
    sections: [
      {
        title: 'Ce qu\'on croit en savoir',
        body: [
          'On le confond avec "trop de travail". Comme si c\'était une question d\'heures. Comme si dormir un week-end pouvait le réparer.',
          'C\'est plus profond. C\'est un épuisement qui s\'est installé pendant des mois, parfois des années, sans qu\'on ne l\'écoute.',
        ],
      },
      {
        title: 'Ce que c\'est vraiment',
        body: [
          'C\'est ton corps qui dit stop pour ta tête. Tu ne peux plus mobiliser tes ressources. Plus envie. Plus capable. Plus rien.',
          'Trois dimensions le composent : l\'épuisement (physique et mental), le cynisme (tu te détaches émotionnellement de ce que tu faisais), et la perte de sens (rien ne semble plus avoir d\'utilité ou de saveur).',
          'Ce n\'est pas une faiblesse. C\'est un système qui a tourné trop longtemps sans qu\'on l\'entretienne.',
        ],
      },
      {
        title: 'Les signaux à reconnaître',
        body: [
          'Tu reportes des choses simples (un appel, un mail) qui te semblent insurmontables.',
          'Tu te lèves déjà fatigué·e, comme si tu avais couru toute la nuit.',
          'Tu ressens du dégoût ou de l\'indifférence pour des choses que tu aimais.',
          'Tu as des douleurs sans cause médicale (dos, ventre, tête).',
          'Tu pleures pour des choses minuscules, ou tu ne pleures plus du tout.',
        ],
      },
      {
        title: 'Comment vivre avec',
        body: [
          'Reconstruire prend du temps. Pas en semaines. En saisons.',
          'L\'erreur classique est de reprendre dès qu\'on se sent "un peu mieux". Le burn-out demande un véritable retrait, puis une reprise très progressive — avec une vigilance permanente à ce qui t\'a mené là.',
          'Ce n\'est pas seulement le travail. C\'est le rapport au travail. À la performance. À ta valeur. C\'est ce rapport qu\'il faut soigner, pas juste la fatigue.',
        ],
      },
    ],
    closing: 'Ce n\'est pas une panne. C\'est un signal. Ton corps te demande de revoir le contrat.',
  },

  /* ─── 04. LE PERFECTIONNISME ─── */
  {
    key: 'perfectionnisme',
    title: 'Le perfectionnisme',
    subtitle: 'La peur déguisée',
    accent: '#9F584C',
    duration: 4,
    lead: 'On le porte comme une qualité. On l\'écrit sur les CV. Sauf qu\'il pèse plus lourd qu\'on ne le pense.',
    sections: [
      {
        title: 'Ce qu\'on croit en savoir',
        body: [
          'On le confond avec l\'exigence, le souci du détail, la rigueur. Des qualités qu\'on apprécie.',
          'Sauf que le perfectionnisme n\'est pas l\'exigence. L\'exigence te pousse à bien faire. Le perfectionnisme te dit que ça ne sera jamais assez bien.',
        ],
      },
      {
        title: 'Ce que c\'est vraiment',
        body: [
          'C\'est une peur. La peur de ne pas être aimé·e si tu n\'es pas parfait·e. La peur d\'être jugé·e, rejeté·e, démasqué·e.',
          'Quelque part dans ton histoire, tu as appris (ou cru) que ta valeur dépendait de ta performance. Pas de qui tu es. De ce que tu produis.',
          'Alors tu tiens. Tu te dépasses. Tu peaufines. Tu vérifies trois fois. Tu reportes les choses parce qu\'elles ne sont "pas encore prêtes". Tu te juges plus durement que personne ne le ferait.',
          'Et tu es épuisé·e. Parce qu\'on ne peut pas être parfait·e tout le temps.',
        ],
      },
      {
        title: 'Les signaux à reconnaître',
        body: [
          'Tu procrastines parce que tu as peur de mal faire.',
          'Tu refais plusieurs fois la même chose pour qu\'elle soit "vraiment bien".',
          'Tu reçois mal les compliments — tu vois toujours ce qui aurait pu être mieux.',
          'Tu as du mal à finir, parce que finir = livrer = être jugé·e.',
          'Tu te sens fraude quand on te valorise.',
        ],
      },
      {
        title: 'Comment vivre avec',
        body: [
          'L\'antidote n\'est pas le laxisme. C\'est l\'humanité.',
          'Apprendre à livrer du "suffisamment bien". Apprendre à recevoir un retour sans s\'effondrer. Apprendre que tu vaux quelque chose même quand tu te trompes.',
          'C\'est un long chemin. Souvent un travail thérapeutique. Mais le premier pas, c\'est de reconnaître que ce n\'est pas une qualité. C\'est une protection. Et tu peux en sortir.',
        ],
      },
    ],
    closing: 'Tu n\'as pas à être parfait·e pour mériter d\'être aimé·e.',
  },

  /* ─── 05. L'ESTIME DE SOI ─── */
  {
    key: 'estime',
    title: 'L\'estime de soi',
    subtitle: 'La racine',
    accent: '#34917F',
    duration: 4,
    lead: 'L\'estime de soi n\'est pas une opinion qu\'on a sur soi. C\'est une relation qu\'on entretient avec soi.',
    sections: [
      {
        title: 'Ce qu\'on croit en savoir',
        body: [
          'On la confond avec la confiance en soi. Comme si c\'était une affaire de réussites accumulées.',
          'Mais on rencontre tous les jours des gens brillants, beaux, accomplis — et qui se détestent. La performance ne nourrit pas l\'estime. Elle la masque parfois.',
        ],
      },
      {
        title: 'Ce que c\'est vraiment',
        body: [
          'L\'estime de soi, c\'est le rapport intime que tu entretiens avec toi-même. C\'est la voix que tu utilises pour te parler quand personne n\'écoute.',
          'Pour beaucoup, cette voix est sévère. Critique. Méprisante, parfois. Elle a souvent été apprise — dans l\'enfance, dans des moments où on n\'a pas reçu ce dont on avait besoin.',
          'Une bonne estime de soi n\'est pas se trouver génial·e. C\'est se traiter avec la même bienveillance qu\'on offrirait à un ami proche en souffrance.',
        ],
      },
      {
        title: 'Les signaux à reconnaître',
        body: [
          'Tu te parles intérieurement avec une dureté que tu n\'utiliserais jamais avec quelqu\'un d\'autre.',
          'Tu attribues tes réussites à la chance, et tes échecs à toi-même.',
          'Tu acceptes mal les marques d\'affection, comme si tu ne les méritais pas.',
          'Tu cherches sans cesse l\'approbation extérieure.',
          'Tu te sens en faute quand tu te reposes, prends soin de toi, dis non.',
        ],
      },
      {
        title: 'Comment vivre avec',
        body: [
          'Reconstruire son estime, c\'est apprendre une nouvelle langue intérieure. Lente. Progressive.',
          'Cela passe par la conscience (entendre la voix critique sans la croire), la compassion (se parler comme on parlerait à un proche), et la cohérence (agir selon ses valeurs, pas selon ses peurs).',
          'C\'est aussi accepter qu\'on n\'a pas à être impeccable pour valoir quelque chose. Que la valeur d\'un humain n\'est pas conditionnelle. La tienne non plus.',
        ],
      },
    ],
    closing: 'Tu n\'as rien à prouver pour exister. Tu es déjà là.',
  },

  /* ─── 06. LE SOMMEIL ─── */
  {
    key: 'sommeil',
    title: 'Le sommeil',
    subtitle: 'Le miroir du mental',
    accent: '#7397BC',
    duration: 4,
    lead: 'On le néglige comme une perte de temps. C\'est probablement la seule chose qui nous rend tout ce qu\'on lui donne.',
    sections: [
      {
        title: 'Ce qu\'on croit en savoir',
        body: [
          'On le voit comme une pause. Une parenthèse entre deux journées. Quelque chose qu\'on "rattrape" le week-end.',
          'C\'est en réalité une fonction biologique active. Pendant que tu dors, ton cerveau classe, range, répare, consolide. Ce que tu vis le jour, il le digère la nuit.',
        ],
      },
      {
        title: 'Ce que c\'est vraiment',
        body: [
          'Le sommeil est divisé en cycles d\'environ 90 minutes. Chaque cycle comporte des phases lentes (récupération physique) et des phases paradoxales (récupération mentale, rêves).',
          'On a besoin de 4 à 6 cycles par nuit. Pas seulement de "fermer les yeux 7h". La qualité compte autant que la quantité.',
          'Le sommeil est aussi le miroir de ce que tu vis. Quand tu dors mal, ce n\'est presque jamais "à cause du sommeil". C\'est à cause de ce que ton mental porte. Le sommeil est le révélateur, pas la cause.',
        ],
      },
      {
        title: 'Les signaux à reconnaître',
        body: [
          'Tu mets plus de 30 minutes à t\'endormir plusieurs soirs par semaine.',
          'Tu te réveilles entre 3h et 5h, et tu ne peux plus te rendormir.',
          'Tu rêves intensément (parfois cauchemars répétés).',
          'Tu te lèves fatigué·e, même après 8h de "sommeil".',
          'Tu somnoles dans la journée, surtout après le repas.',
        ],
      },
      {
        title: 'Comment vivre avec',
        body: [
          'Le rythme régulier compte plus que la durée parfaite. Couche-toi et lève-toi à des heures stables, même le week-end.',
          'Une heure sans écran avant le sommeil change tout. La lumière bleue bloque la mélatonine, l\'hormone qui te dit "il est temps de dormir".',
          'Et surtout : quand le sommeil va mal, ne traque pas le sommeil. Va voir ce qu\'il essaie de te dire sur ta vie éveillée.',
        ],
      },
    ],
    closing: 'Le sommeil ne te demande pas de l\'optimiser. Il te demande de l\'écouter.',
  },

  /* ─── 07. LA COLÈRE ─── */
  {
    key: 'colere',
    title: 'La colère',
    subtitle: 'Ce qu\'elle essaie de dire',
    accent: '#9F584C',
    duration: 4,
    lead: 'On nous a appris à la cacher. Elle est pourtant l\'une des émotions les plus précieuses qu\'on porte.',
    sections: [
      {
        title: 'Ce qu\'on croit en savoir',
        body: [
          'On la considère comme une émotion négative. Quelque chose qu\'on devrait apprendre à "gérer", à "calmer", à faire taire.',
          'Cette vision est culturelle, pas biologique. Dans d\'autres cultures, la colère est reconnue comme un signal sacré. Un message du corps qui dit : "quelque chose ne va pas".',
        ],
      },
      {
        title: 'Ce que c\'est vraiment',
        body: [
          'La colère n\'est pas une mauvaise émotion. C\'est une émotion d\'alerte. Elle se déclenche quand une limite est franchie. Quand quelque chose qui compte est menacé. Quand on s\'est tu trop longtemps.',
          'Le problème n\'est pas la colère elle-même. Le problème, c\'est de ne pas savoir quoi faire avec. La refouler la rend toxique (elle devient ressentiment, dépression, somatisations). L\'exploser la rend destructrice.',
          'Apprendre à la rencontrer — ni la fuir, ni la déverser — est un travail profond, et libérateur.',
        ],
      },
      {
        title: 'Les signaux à reconnaître',
        body: [
          'Tu réagis trop fort à des choses mineures (parce qu\'une colère ancienne remonte).',
          'Tu ne te mets jamais en colère — et tu tombes malade régulièrement.',
          'Tu te sens irritable sans pouvoir dire pourquoi.',
          'Tu détestes certaines personnes intensément, et ça t\'épuise.',
          'Tu sens parfois une "chaleur" dans la poitrine ou le ventre que tu cherches à étouffer.',
        ],
      },
      {
        title: 'Comment vivre avec',
        body: [
          'La première étape, c\'est de la reconnaître. La nommer. "Je suis en colère parce que…"',
          'Ensuite, en explorer la racine. La colère du jour cache souvent une douleur plus ancienne. Une frustration cumulée. Un besoin qui n\'a jamais été entendu.',
          'Et enfin, la transformer en action. Pas en explosion. En parole posée, en limite affirmée, en décision concrète. La colère bien utilisée est une boussole. Elle te montre ce qui compte vraiment pour toi.',
        ],
      },
    ],
    closing: 'Ta colère n\'est pas un défaut. C\'est ton corps qui te dit que tu mérites mieux.',
  },

  /* ─── 08. L'ATTACHEMENT ─── */
  {
    key: 'attachement',
    title: 'L\'attachement',
    subtitle: 'Comment on apprend à aimer',
    accent: '#D49880',
    duration: 5,
    lead: 'La façon dont on aime à 30 ans, on l\'a apprise à 2 ans. La bonne nouvelle, c\'est qu\'on peut la désapprendre.',
    sections: [
      {
        title: 'Ce qu\'on croit en savoir',
        body: [
          'On pense que nos relations amoureuses ou amicales sont le fruit du hasard. Du timing. De la chance.',
          'En vérité, on reproduit. Souvent inconsciemment. Les schémas qu\'on a appris très tôt avec nos figures d\'attachement (parents, proches) déterminent comment on aime et comment on est aimé·e plus tard.',
        ],
      },
      {
        title: 'Ce que c\'est vraiment',
        body: [
          'La théorie de l\'attachement (John Bowlby) identifie 4 styles principaux, formés dans les premières années de la vie :',
          '**Sécure** — tu te sens à l\'aise dans la proximité. Tu peux faire confiance. Tu reviens, tu poses des limites, sans drame.',
          '**Anxieux** — tu as peur d\'être abandonné·e. Tu cherches la confirmation constante d\'être aimé·e. Tu peux te perdre dans l\'autre.',
          '**Évitant** — tu te méfies de l\'intimité. Tu fuis quand ça devient trop proche. Tu valorises ton indépendance.',
          '**Désorganisé** — tu oscilles. Tu veux la proximité et tu en as peur en même temps.',
          'Aucun style n\'est "mauvais". Mais certains te font souffrir, et reproduisent des schémas qui ne te servent plus.',
        ],
      },
      {
        title: 'Les signaux à reconnaître',
        body: [
          'Tu retombes sur le même type de personne, encore et encore.',
          'Tu paniques quand quelqu\'un met du temps à te répondre.',
          'Tu mets fin aux relations dès que ça devient sérieux.',
          'Tu te sens "trop" ou "pas assez" en permanence dans tes liens.',
          'Tu joues des rôles avec différentes personnes — sans savoir lequel est vraiment toi.',
        ],
      },
      {
        title: 'Comment vivre avec',
        body: [
          'L\'attachement n\'est pas figé. Il peut évoluer, à condition d\'être conscient·e.',
          'On parle d\'**attachement gagné** — l\'évolution d\'un style insécure vers un style plus sécure, à travers des relations réparatrices (amitiés saines, thérapie, partenaires qui ne reproduisent pas le schéma) et un travail personnel.',
          'Ce travail commence par l\'observation. Comment je réagis quand l\'autre s\'éloigne ? Quand il/elle se rapproche ? Qu\'est-ce que je projette ? Qu\'est-ce qui appartient à l\'autre, et qu\'est-ce qui appartient à mon histoire ?',
          'Aimer mieux, c\'est d\'abord se connaître mieux dans le lien.',
        ],
      },
    ],
    closing: 'Tu n\'es pas condamné·e à reproduire. Tu peux apprendre une nouvelle façon d\'aimer. Et d\'être aimé·e.',
  },
];

export function getLecon(key) {
  return LECONS.find((l) => l.key === key);
}
