# NÉYA — Design System v1

**Direction visuelle finale · Brief exhaustif pour rebuild complet**

> Ce document remplace toutes les versions précédentes du design NÉYA. Il est le brief de référence unique pour reconstruire l'application depuis zéro. Toute incohérence avec d'anciennes décisions doit être tranchée en faveur de ce document.

---

## 0. Comment utiliser ce brief

**Pour Claude Code :** lis ce document en entier avant toute modification. Ne propose pas d'alternative aux choix de palette, typo ou principes de composition — ils sont verrouillés. En cas de doute sur un écran non décrit explicitement, applique les principes de la section 3 (Direction visuelle) et de la section 5 (Système de composition).

**Pour Will :** ce brief est agnostique du framework (React web, React Native, Expo). Les exemples de code sont illustratifs. La cible production reste React Native + Expo telle que définie dans le master brief.

**Ordre de lecture recommandé :** sections 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10. Les sections 11-14 sont des annexes consultables.

---

## 1. Vision produit et positionnement

### 1.1 Identité

**NÉYA** est une application mobile francophone de bien-être émotionnel gamifié, à destination des 18-40 ans qui vivent des difficultés émotionnelles mais ne consultent pas. Le positionnement se situe à l'intersection :

- d'une application de méditation (Calm, Headspace)
- d'un jeu narratif d'aventure (Sky: Children of the Light, Monument Valley)
- d'un coach personnel poétique

Le ton est **adulte, poétique, épique**. Jamais clinique. Jamais enfantin. Jamais "wellness" générique.

**ÇA VA?** est une marque de vêtements intégrée comme boutique au sein de NÉYA, dans une logique de capsule émotionnelle (3 collections, 3 paliers de pass).

### 1.2 Direction visuelle (verrouillée)

La direction est **Studio VØR painterly cinématographique** : illustrations vectorielles painterly avec composition en plans parallaxes, palettes naturalistes (pas de pastel ni de néon), lumière directionnelle forte, sujet humain minuscule devant paysage immense, animal totem habitant la scène.

Référence canonique : le travail de Zak Steele-Eklund (Studio VØR) sur Dribbble — shots `No To`, `Origin`, `Destination`, `Krai`, `S X F`, `All 31`, `Kamui`.

Tout choix visuel se mesure à cette référence : si une scène ne pourrait pas plausiblement être une frame d'un projet Studio VØR, elle n'est pas NÉYA.

### 1.3 Ancres de copywriting

Les phrases suivantes sont des actifs de marque. Elles doivent apparaître intactes dans l'app, à des moments précis (voir section 9) :

- *« Et toi, ça va vraiment ? »* — slogan principal, écran d'accueil et onboarding
- *« T'as pas besoin d'aller bien pour commencer. »* — onboarding question 1
- *« Tu n'es pas seul·e. »* — communauté, mode crise
- *« Le lion blanc s'éveille avec toi. »* — entrée Forêt de la Clarté
- *« Pose-toi. Le daim veille. »* — méditation nocturne

Toute autre formulation doit respecter le tutoiement, la sobriété, et éviter le ton "wellness positif". Bannir : "bonne énergie", "vibes", "rayonner", "manifester", "alignement", "rituel" (sauf usage rare).

---

## 2. Principes anti-gamification toxique

Ces principes priment sur toute considération esthétique ou ergonomique. Si un élément de design contredit l'un des principes ci-dessous, il est rejeté.

1. **Pas de classement, pas de leaderboard, pas de comparaison sociale.** L'utilisateur n'est jamais opposé à d'autres.
2. **Streaks pardonnés.** Une absence ne casse jamais une série de manière brutale. Le système propose toujours une reprise douce ("Tu reviens, c'est ce qui compte").
3. **XP sans plafond visible.** La progression existe mais elle ne crée pas d'anxiété de niveau-up.
4. **Pas de notifications culpabilisantes.** Jamais "Tu n'as pas médité depuis 3 jours". Toujours "Le daim t'attend quand tu veux".
5. **Reward la présence, pas la performance.** Ouvrir l'app et respirer 30 secondes vaut autant que finir une session de 20 min.
6. **Mode crise toujours à 1 tap** — voir section 9.6.
7. **Aucun dark pattern.** Pas de boutons trompeurs, pas de désabonnement caché, pas de compteur de FOMO.

---

## 3. Direction visuelle — principes Studio VØR

Les 6 principes suivants définissent toute scène NÉYA. Ils sont non-négociables.

### 3.1 Composition en plans parallaxes

Toute scène hero est construite en **minimum 7 plans superposés**, du plus lointain au plus proche :

1. **Ciel** — dégradé multi-couleurs vertical (5-7 stops)
2. **Source lumineuse** — soleil, lune, ou aurore avec halo radial
3. **Montagnes lointaines** — opacity 60-70%, couleur dérivée du ciel
4. **Montagnes mid-ground** — opacity 85-95%, plus contrastées
5. **Brume (mist)** — gradient horizontal opacity 35%, entre mid et near
6. **Foreground** — forêt, lac, désert ou autre élément structurant
7. **Sujet narratif** — silhouette humaine + animal totem

À l'animation, chaque plan se déplace à une vitesse différente au scroll ou au tilt du téléphone (gyroscope). Coefficient de parallaxe suggéré : `[0.05, 0.1, 0.2, 0.35, 0.5, 0.7, 1.0]` du plus lointain au plus proche.

### 3.2 Échelle du sujet

- **Silhouette humaine (la fille de dos)** : 2-4% de la hauteur de l'écran. Jamais plus.
- **Animal totem** : 5-8% de la hauteur. Plus grand que la fille mais pas dominant.
- **Paysage** : remplit 100% de l'écran derrière les sujets.

Cette échelle crée l'émotion d'humilité face au monde. Un sujet plus gros transformerait l'app en illustration jeunesse.

### 3.3 Lumière directionnelle

Chaque scène a **une seule source de lumière principale**, clairement identifiable (le soleil levant à droite, la lune en haut-droite, l'aurore en haut-gauche, le feu de camp au centre…).

Cette source crée :
- Des **edges lit** sur les sujets : un trait fin de couleur chaude (ou froide selon la source) sur le côté exposé à la lumière. Stroke 0.5px à 1px, couleur dérivée de la source.
- Des **ombres au sol** : ellipses sombres sous les sujets, opacity 40-60%.
- Des **rayons de lumière (light rays)** optionnels traversant la brume : gradients triangulaires opacity 30-50%.

### 3.4 Animal habitant, pas mascotte

Les 6 totems ne sont **jamais en surimpression sur l'UI**, ni utilisés comme avatars de boutons. Ils vivent dans le paysage à leur place naturelle :

- Lion blanc → sur une éminence, sortant d'un fourré au lever du jour
- Ours polaire → au pied d'une montagne enneigée
- Aigle céleste → en vol, à mi-hauteur du ciel
- Daim lunaire → au bord du lac, regardant la lune
- Baleine sage → dans la mer, dos émergeant
- Renard de l'aube → courant sur la crête, dans la brume

Pour les usages secondaires (notifications, profil, badges), on dessine un **glyph monochrome simplifié** du totem (ligne 1px), jamais une réduction de l'illustration painterly.

### 3.5 Typographie confidente

La typo respecte la hiérarchie suivante sur toute scène painterly :

- **Marque "N É Y A"** : en haut, letter-spacing 2.5px, 8px, opacity 55%, sans-serif. Toujours présente, jamais dominante.
- **Indication de chapitre** (haut-droite) : "CHAPITRE 01 — Forêt de la Clarté", 8-9px, sans-serif, opacity 45-75%.
- **Titre éditorial** (bas) : Fraunces serif, 24-32px, line-height 1.05, max 2 lignes. Inclut systématiquement **une partie en italique** pour les mots-clés émotionnels.
- **Sous-titre** : Inter sans-serif, 11-12px, opacity 65%, max 2 lignes.

**Interdit** : titre plein écran qui couvre 50% de la scène. Texte sur fond entièrement sombre sans gradient de lisibilité. Headline en capitales (sauf les chapitre marks).

### 3.6 Palettes naturalistes (pas de fluo)

Les seules couleurs autorisées sont celles que l'on trouverait dans la nature à un moment précis du jour. Voir section 4 pour les ramps complètes.

Bannir : magenta saturé, cyan électrique, vert pomme, jaune fluo, violet néon, rose fuchsia. Ces couleurs n'existent pas dans un coucher de soleil réel.

---

## 4. Système de couleurs

### 4.1 Philosophie

NÉYA fonctionne avec **deux palettes temporelles** qui se substituent selon le moment et le contexte :

- **Palette Aube** — utilisée pour les écrans d'éveil, d'aventure principale, de progression, d'arrivée
- **Palette Nuit** — utilisée pour méditation, repos, journal du soir, mode crise apaisée

Le changement de palette se fait automatiquement selon l'heure de l'appareil (transition douce entre 18h et 21h), ou manuellement via un toggle dans les paramètres.

### 4.2 Palette Aube (lever de soleil)

```
--neya-aube-bg-deep         #0A0E1F   /* Fond extérieur, encadrement */
--neya-aube-bg-night         #1F2D52   /* Haut du ciel restant */
--neya-aube-bg-twilight      #3D4D85   /* Bleu crépuscule */
--neya-aube-bg-purple        #5D4F8B   /* Pourpre intermédiaire */
--neya-aube-bg-lavender      #7B6FA8   /* Lavande chaude */
--neya-aube-warm-1           #D49880   /* Pêche profonde */
--neya-aube-warm-2           #D4A878   /* Ambre principal */
--neya-aube-warm-3           #F4D4A8   /* Pêche claire */
--neya-aube-light            #FBE8D8   /* Lumière diffuse */
--neya-aube-cream            #FBF6E8   /* Crème, texte principal sur dark */
--neya-aube-accent           #D4E08C   /* Vert tilleul, accent vital */
```

**Usage** :
- `--neya-aube-bg-deep` pour le fond hors-scène (encadrement noir profond)
- `--neya-aube-warm-2` pour les boutons primaires, les accents CTA, les chapitre marks importants
- `--neya-aube-cream` pour tout texte principal sur fond sombre
- `--neya-aube-accent` pour les éléments vitaux/progressifs (XP, présent, validation)

### 4.3 Palette Nuit (lune)

```
--neya-nuit-bg-void          #050810   /* Noir absolu, hors écran */
--neya-nuit-bg-deep          #0A0E1F   /* Fond principal nuit */
--neya-nuit-bg-shadow        #1F1535   /* Pourpre très sombre */
--neya-nuit-bg-purple        #3D2F6B   /* Pourpre profond */
--neya-nuit-mid              #5D4F8B   /* Mauve */
--neya-nuit-blue             #8FA4D4   /* Bleu lunaire */
--neya-nuit-lavender         #C3BEEF   /* Lavande lumineuse */
--neya-nuit-moon             #CADFFD   /* Bleu lune */
--neya-nuit-cream            #FBF6E8   /* Texte principal */
--neya-nuit-fire             #D4E08C   /* Feu/présence vitale (commun avec Aube) */
```

**Usage** :
- `--neya-nuit-moon` pour CTA primaires en mode nuit, edges lit lunaires
- `--neya-nuit-lavender` pour les totems nocturnes (daim, ours polaire la nuit)
- `--neya-nuit-fire` pour les éléments organiques vivants (fireflies, particules d'énergie)

### 4.4 Couleurs sémantiques (communes aux deux palettes)

```
--neya-success      #8AB87A   /* Validation, complétion - vert sauge naturel */
--neya-warning      #D49880   /* Attention - pêche, jamais orange vif */
--neya-crisis       #C97171   /* Urgence, crise - rouille mate, jamais rouge vif */
--neya-info         #8FA4D4   /* Info - bleu lunaire */
```

**Important** : ces couleurs ne sont jamais utilisées en remplissage plein. Elles apparaissent en stroke 1.5px, en texte, ou en glow radial opacity 30%. Jamais en bouton plein vert/rouge/orange.

### 4.5 Mode ÇA VA? (boutique)

La boutique a une palette distincte qui reste cohérente avec NÉYA mais signale visuellement qu'on a changé d'espace :

```
--cava-bg            #F4F0E8   /* Crème chaud, fond boutique */
--cava-ink           #1A1A1F   /* Encre, texte principal */
--cava-warm          #D49880   /* Pêche - capsule "Libre" */
--cava-blue          #5D7BB8   /* Bleu - capsule "Ça Va" */
--cava-purple        #3D2F6B   /* Pourpre - capsule "Vraiment?" */
--cava-accent        #D4E08C   /* Tilleul, partagé avec NÉYA */
```

Le passage NÉYA → ÇA VA? se fait par une transition "rideau" qui révèle le fond crème depuis le bas (voir section 7.6).

---

## 5. Typographie

### 5.1 Familles

- **Fraunces** (variable, opsz 9-144) — serif éditoriale, héritage Garamond rond. Utilisée pour les **titres émotionnels** et les **moments narratifs**. Toujours avec une partie en italique sur les mots émotionnels clés.
- **Sora** (400, 500, 600) — sans-serif géométrique moderne. Utilisée pour les **chapitre marks**, **labels**, **boutons**, **navigation**, **stats**.
- **Inter** (300, 400, 500) — sans-serif neutre. Utilisée pour les **paragraphes**, **descriptions**, **microcopy**, **inputs**.

### 5.2 Échelle typographique

| Token            | Taille | Line-height | Family   | Weight | Usage                                  |
|------------------|--------|-------------|----------|--------|----------------------------------------|
| `--type-hero`    | 32px   | 1.05        | Fraunces | 400    | Titre hero d'écran (rare, 1 par écran) |
| `--type-h1`      | 28px   | 1.05        | Fraunces | 400    | Titre principal de scène                |
| `--type-h2`      | 22px   | 1.1         | Fraunces | 400    | Titre de section                        |
| `--type-h3`      | 18px   | 1.2         | Sora     | 500    | Sous-section, card title                |
| `--type-body`    | 14px   | 1.55        | Inter    | 400    | Paragraphe principal                    |
| `--type-body-sm` | 12px   | 1.5         | Inter    | 400    | Description secondaire                  |
| `--type-label`   | 11px   | 1.3         | Sora     | 500    | Bouton, label, nav                      |
| `--type-mark`    | 9px    | 1           | Sora     | 500    | Chapitre mark, micro-label (uppercase, letter-spacing 2px) |
| `--type-stat`    | 24px   | 1           | Sora     | 600    | Nombre de stats, compteurs              |

### 5.3 Règles typographiques

- **Italique obligatoire** sur 2-4 mots dans chaque hero Fraunces. Toujours sur les mots émotionnels : *vraiment*, *toi*, *avec toi*, *seul·e*, *veille*, *s'éveille*.
- **Letter-spacing** : -0.5px sur titres Fraunces 24px+, +2px sur tous les chapitre marks Sora uppercase, normal partout ailleurs.
- **Pas de bold (700+)** sur le body. Maximum 500 (medium) pour mettre en valeur un mot.
- **Pas de UPPERCASE** sauf chapitre marks (`type-mark`).
- **Tutoiement systématique**. Jamais de vouvoiement.
- **Inclure l'écriture inclusive** discrètement : "seul·e", "prêt·e", "fatigué·e" — utiliser le point milieu, pas le tiret.

### 5.4 Inclusion accessibilité

- Texte minimum body 14px sur tout écran. Body-sm 12px réservé aux microcopies non-critiques.
- Ratio de contraste minimum 4.5:1 sur le body. Sur images, ajouter systématiquement un gradient de lisibilité (linear-gradient noir 0→0.5 opacity de bas en haut sur 40% de la hauteur de l'image).
- Police variable Fraunces : utiliser `font-variation-settings: "opsz" 144` pour les grands titres (>20px) afin d'optimiser le rendu optique.

---

## 6. Système de couleurs et lumière par monde

NÉYA contient 6 mondes émotionnels. Chacun a sa palette spécifique dérivée de la palette globale, son moment de la journée, son totem habitant, et sa direction de lumière.

| # | Monde                       | Totem            | Moment          | Couleur dominante       | Lumière vient de | Émotion        |
|---|-----------------------------|------------------|-----------------|-------------------------|------------------|----------------|
| 1 | Forêt de la Clarté          | Lion blanc       | Aube (5h-8h)    | Ambre `#D4A878`         | Droite, soleil   | L'éveil        |
| 2 | Temple des Parts de Soi     | Ours polaire     | Hiver matinal   | Bleu glacé `#CADFFD`    | Haut, diffuse    | L'introspection|
| 3 | Oasis du Présent            | Aigle céleste    | Plein jour (12h)| Sable `#F4D4A8`         | Au-dessus, zenith| Le présent     |
| 4 | Lac des Émotions            | Daim lunaire     | Nuit (22h-2h)   | Lavande `#C3BEEF`       | Haut-droite, lune| Le ressenti    |
| 5 | Montagne de Vision          | Baleine sage*    | Crépuscule (19h)| Pourpre `#5D4F8B`       | Gauche, sunset   | La direction   |
| 6 | Espace Communautaire        | Renard de l'aube | Première lueur  | Pêche `#D49880`         | Diffuse, partout | L'écho         |

*Note Montagne de Vision : malgré le nom "Montagne", la baleine y apparaît dans un lac d'altitude ou une mer visible depuis le sommet — cohérent avec le maître brief original.

Chaque monde dispose de **5 sous-scènes** (pas juste 1 hero) :
- **Entrée** : on découvre le monde, le totem est lointain
- **Exploration** : on s'approche, le totem est plus visible
- **Question** : un moment textuel important (Fraunces)
- **Action** : exercice ou méditation
- **Sortie/Réflexion** : retour au calme, journal du moment

---

## 7. Système de composition

### 7.1 Layout général d'écran painterly

Tout écran painterly suit cette structure verticale :

```
┌─────────────────────────────────────────┐
│ [SAFE AREA TOP]   12px                  │
│ STATUS BAR    9:41        ●●●  100%     │  ← 14px height, font Sora 10px
│ [PADDING TOP]   4px                     │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │                                      │ │
│ │  N É Y A          CHAPITRE 01       │ │  ← marks, top 16px
│ │                   Forêt de la Clarté│ │
│ │                                      │ │
│ │                                      │ │
│ │        [SCÈNE PAINTERLY              │ │
│ │         7 plans parallaxes           │ │  ← SVG plein écran
│ │         soleil, montagnes,           │ │     ratio 9:16 minimum
│ │         forêt, sujets]               │ │
│ │                                      │ │
│ │                                      │ │
│ │  — L'ÉVEIL                          │ │  ← mark color warm-2
│ │                                      │ │
│ │  Le lion blanc                       │ │  ← H1 Fraunces 28px
│ │  s'éveille *avec toi.*               │ │
│ │                                      │ │
│ │  Une question, une respiration.      │ │  ← body Inter 12px
│ │  Pas besoin d'aller bien.            │ │
│ │                                      │ │
│ └─────────────────────────────────────┘ │
│                                          │
│   ● ○ ○ ○ ○ ○  01/06    [Entrer ↗]      │  ← bottom controls
│                                          │
│ [SAFE AREA BOTTOM]                       │
└─────────────────────────────────────────┘
```

### 7.2 Corner radius système

```
--radius-xs    4px   /* badges inline, particules */
--radius-sm    8px   /* boutons secondaires, mini-cards */
--radius-md    14px  /* cards principales, glass cards */
--radius-lg    22px  /* écrans painterly, scènes full-bleed */
--radius-xl    28px  /* container externe d'écran (phone frame interne) */
--radius-pill  100px /* boutons CTA, pills, chapitre marks badges */
```

### 7.3 Espacements

Système basé sur multiples de 4px :

```
--space-1     4px
--space-2     8px
--space-3     12px
--space-4     16px   /* défaut padding écran */
--space-5     22px   /* padding interne containers majeurs */
--space-6     32px
--space-8     48px
--space-10    64px
```

Padding intérieur d'écran painterly : **horizontal 22px**, **bas 24px**, **haut 16px**.

### 7.4 Glass cards (utilisées en overlay sur painterly)

```css
background: rgba(202, 223, 253, 0.08);  /* couleur dérivée du totem du monde */
backdrop-filter: blur(14px);
-webkit-backdrop-filter: blur(14px);
border: 0.5px solid rgba(202, 223, 253, 0.2);
border-radius: var(--radius-md);
padding: 12px 14px;
```

Les glass cards ne sont utilisées **qu'en overlay sur des scènes painterly**. Hors painterly, on utilise des cards solides (`bg-deep` opaque).

### 7.5 Boutons

**Bouton primaire (CTA principal d'écran)** :
- Background : `--neya-aube-cream` (sur fond sombre) ou `--neya-aube-bg-deep` (sur fond clair)
- Texte : couleur inverse au background
- Padding : `10px 18px`
- Border-radius : `--radius-pill`
- Font : Sora 500, 11-13px
- Icon optionnel à droite : `arrow-up-right` ou `arrow-right`
- Pas d'ombre, pas de gradient

**Bouton secondaire** :
- Background : transparent
- Border : `0.5px solid rgba(cream, 0.25)`
- Texte : `--neya-aube-cream` opacity 80%
- Reste identique au primaire

**Bouton tertiaire (icon-only)** :
- Background : `rgba(cream, 0.08)`
- Border : `0.5px solid rgba(cream, 0.18)`
- Border-radius : 50%
- Size : 40px

### 7.6 Transitions inter-écrans

5 transitions canoniques NÉYA :

1. **Fondu painterly** (90% des transitions) : crossfade 800ms entre deux scènes painterly, avec les plans qui s'animent à des vitesses différentes
2. **Rideau du bas** (NÉYA → ÇA VA?) : le fond crème de la boutique remonte du bas comme un rideau, 600ms ease-out
3. **Zoom du totem** (entrée dans un monde) : on zoome sur le totem qui devient l'horizon, 1200ms ease-in-out
4. **Lever du soleil** (transition aube) : la lumière de la source augmente progressivement sur 1500ms
5. **Plongée dans le lac** (transition vers méditation profonde) : translation verticale descendante, l'eau monte couvrir l'écran, 1000ms

---

## 8. Iconographie

### 8.1 Système

- Bibliothèque : **Tabler Icons outline** (jamais filled)
- Stroke : 1.5px par défaut, 1.2px sur petits formats (<20px)
- Taille standard : 16px (inline), 20px (nav), 24px (decorative), 32px (feature)
- Couleur : héritée du parent (currentColor), jamais hardcodée

### 8.2 Glyphs totems (usage secondaire)

Pour les usages où le totem painterly est trop lourd (notifications, badges, profil), créer 6 glyphs simplifiés ligne 1.5px :

- Lion → tête de lion stylisée vue de face, contour seulement
- Ours → tête d'ours vue de face, oreilles arrondies
- Aigle → ailes déployées vue de dessous
- Daim → tête avec bois branchus
- Baleine → silhouette baleine + jet d'eau
- Renard → tête avec oreilles pointues + museau

Tous les 6 glyphs tiennent dans un canvas 24×24, sont monochromes, et fonctionnent sur fond sombre comme clair.

---

## 9. Spécifications par écran

### 9.1 Onboarding (5 questions immersives)

**Concept** : chaque question d'onboarding est posée dans un monde différent, avec un totem qui apparaît progressivement.

**Question 1 — Forêt de la Clarté (Lion)**
- Scène : aube, lever de soleil, lion à droite
- Texte hero : *« T'as pas besoin d'aller bien pour commencer. »*
- Sous-titre : "Comment tu te sens en ce moment ?"
- Réponses (4 choix) :
  - "Pas terrible, honnêtement"
  - "Ça va, je gère"
  - "Plutôt bien"
  - "Je sais pas trop"
- UI : 4 pills bas écran, hauteur 48px, full-width, espacement 8px, glass cards sur painterly

**Question 2 — Temple des Parts de Soi (Ours)**
- Scène : matin glacé, montagne enneigée, ours au pied
- Texte hero : *« Qu'est-ce qui te ramène ici ? »*
- Réponses : "Le stress", "Le sommeil", "Les émotions difficiles", "Juste curieux·se"

**Question 3 — Oasis du Présent (Aigle)**
- Scène : plein jour, désert, aigle en vol
- Texte hero : *« Combien de minutes par jour ? »*
- Réponses : "5 min", "10 min", "15 min", "Plus si je peux"

**Question 4 — Lac des Émotions (Daim)**
- Scène : crépuscule tombant, lac, daim au bord
- Texte hero : *« Quand préfères-tu te poser ? »*
- Réponses : "Le matin", "À midi", "Le soir", "Avant de dormir"

**Question 5 — Montagne de Vision (Baleine)**
- Scène : crépuscule, sommet, baleine dans la mer en contrebas
- Texte hero : *« Et toi, ça va vraiment ? »*
- C'est la **question signature**. Pas de réponses multiples — un seul bouton "Commencer mon aventure" qui termine l'onboarding et entre dans l'app.

### 9.2 Écran principal — Aventure (la montée)

**Concept** : remplace la grille de mondes par une **carte d'ascension verticale**, métaphore inspirée de "Your Ascent" (Duolingo) mais en painterly Studio VØR.

L'écran défile verticalement de bas (la vallée, point d'arrivée) vers le haut (le sommet, but ultime). L'utilisateur est positionné à un point précis de la montée selon sa progression.

**Structure** :
- **Bas (vallée brumeuse)** : étapes terminées, brume légère
- **Mid (forêt et lac)** : zone actuelle, totems visibles dans le paysage
- **Haut (sommet ennuagé)** : zones verrouillées, scintillent au loin

**Éléments d'UI** :
- Header fixe : "NÉYA" gauche, streak doux (sans flamme agressive — utiliser le glyph feu tilleul `#D4E08C`) + minutes du jour à droite
- Marqueur de position actuelle : silhouette de la fille de dos, taille 4% écran, halo doux autour
- Checkpoints terminés : cercle rempli crème avec checkmark tilleul
- Checkpoint actuel : cercle creux avec border lumineux
- Checkpoints futurs : cercle pointillé, légèrement transparent
- Footer : "Continuer la montée" bouton primaire + "Carte" bouton secondaire

**Comportement scroll** :
- Scroll vertical natif
- Parallaxe sur tous les plans
- Le marqueur "Tu es ici" reste centré écran avec scroll-snap

### 9.3 Habitudes

Section dédiée aux micro-actions quotidiennes (respiration, méditation, journal).

**Liste d'habitudes du jour** :
- Card glass sur fond painterly réduit (50% hauteur écran en haut)
- Chaque habitude = ligne avec : icon totem du monde, nom, durée estimée, badge "fait/en cours/à faire"
- Tap = ouvre l'exercice plein écran

**Types d'exercices** :
- **Respiration 4-7-8** : cercle qui se dilate/contracte sur 12 sec, particules tilleul, voix-off optionnelle (3 voix masculine/féminine/neutre disponibles)
- **Méditation guidée** : audio + visuel painterly statique avec micro-animation de plans (cloud drift, water ripples)
- **Journal libre** : input fullscreen sur fond painterly du monde en cours, max 280 caractères, ton journalistique

### 9.4 Communauté — Espace Vrai

**Concept** (du master brief) : feed semi-anonyme 24h, réactions limitées à ❤️ 🤝 👀.

**Évolutions design Studio VØR** :
- Fond : painterly Espace Communautaire (Renard de l'aube, pêche)
- Chaque post = glass card overlay
- Pseudonyme + animal totem du posteur (juste le glyph 16px, pas l'avatar painterly)
- Texte du post : Fraunces 16px si <20 mots (citation), Inter 14px sinon
- Timestamp relatif (il y a 2h, hier soir...) en Sora 10px opacity 50%
- Réactions : icons Tabler outline + compteur Sora, gap 16px en bas de card
- Pas de commentaires (volonté du master brief)
- Bouton "Partager une voix" en sticky footer bas écran

**Modération** :
- Tout post passe par une modération automatique avant publication (mots-clés crise → ouverture immédiate du mode crise, voir 9.6)
- Bouton "Je suis touché·e par ça" sur chaque post → notifie un modérateur humain

### 9.5 Profil

**Structure** :
- Header painterly Lac des Émotions miniature
- Pseudonyme (modifiable), totem principal (modifiable), animal d'éveil (le premier rencontré, non modifiable)
- Stats discrètes : jours connectés, minutes totales, mondes explorés — Sora 24px stats, Inter 11px labels
- **Pas de XP visible, pas de niveau** (rappel principe anti-gamification)
- Liste de paramètres en lignes simples : Notifications, Mode jour/nuit, Voix de méditation, Langue, Aide
- Footer : Mode crise (bouton rouge mat `#C97171`), Déconnexion, Version

### 9.6 Mode crise

**Toujours accessible en 1 tap** depuis :
- Le profil (bouton dédié en bas)
- Une icône SOS discrète en haut-droite de toute scène (visible seulement après un long press de 1.5s sur n'importe quel élément vide)
- Au moindre mot-clé détecté dans le journal ou la communauté

**Flow** :
1. **Écran 1 — Reconnaissance** : fond Lac des Émotions nuit, daim au premier plan plus grand qu'habituellement (12% écran), texte Fraunces : *« Tu n'es pas seul·e. »* — sous-titre : « Respire avec moi. Une minute. »
2. **Écran 2 — Respiration guidée** : cercle qui se dilate/contracte, sans bouton "fermer", durée 90 sec
3. **Écran 3 — Choix** : 3 boutons
   - "Parler à quelqu'un maintenant" → ouvre 3115 (numéro national prévention suicide en France) + numéros pays utilisateur
   - "Écrire ce que je ressens" → journal protégé non publié
   - "Continuer de respirer" → boucle écran 2
4. **Écran 4 — Sortie douce** : ne ferme jamais brutalement le mode crise. Propose "Je veux revenir à NÉYA" et confirme avec un Fraunces final.

**Important** : aucune des données du mode crise n'est jamais partagée avec la communauté ni utilisée pour la personnalisation marketing.

### 9.7 Boutique ÇA VA?

**Concept** (du master brief) : 3 capsules + 3 paliers de pass.

**Entrée** : tab dédié dans la nav principale avec icon Tabler `shirt` outline. Au tap, transition rideau du bas (voir 7.6) qui révèle l'univers ÇA VA?.

**Structure boutique** :
- Fond : `--cava-bg` crème chaud `#F4F0E8`
- Typo : héritée NÉYA (Fraunces + Sora + Inter)
- Header : logo "ÇA VA?" en Fraunces 24px italique, sélecteur de pass à droite

**Pass system** :

| Pass         | Prix     | Réduction | Couleur capsule           |
|--------------|----------|-----------|---------------------------|
| Libre        | Gratuit  | 0%        | `--cava-warm` pêche       |
| Ça Va        | 9.90€/an | 10%       | `--cava-blue` bleu        |
| Vraiment ?   | 24.90€/an| 25%       | `--cava-purple` pourpre   |

Le pass actif affecte en temps réel les prix affichés sur les produits (animation crossfade).

**Cards produit** :
- Image full-bleed haut, ratio 4/5
- Titre produit Fraunces 16px
- Prix : ancien prix barré + nouveau prix en Sora 14px medium
- Pas d'étoiles, pas d'avis, pas de "nombre vendu" (anti-pression sociale)

**Cart** :
- Slide-in depuis la droite
- Liste articles + total + bouton "Passer commande"
- Pas de "shipping rapide", pas de countdown, pas de FOMO

---

## 10. Animations et micro-interactions

### 10.1 Principes d'animation

1. **Easing par défaut** : `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out doux)
2. **Durée par défaut** : 400ms pour interactions, 800ms pour transitions, 1200ms+ pour transformations narratives
3. **Pas d'animation discontinue.** Tout changement d'état est animé.
4. **Pas d'animation décorative.** Chaque animation sert le contenu (pas de "particules pour la déco" sauf si elles sont la déco narrative du paysage).

### 10.2 Animations à implémenter (priorité haute)

| # | Animation                       | Trigger                    | Durée  | Implémentation                          |
|---|---------------------------------|----------------------------|--------|------------------------------------------|
| 1 | Parallaxe gyroscope             | Tilt téléphone (sensor)    | live   | Translate X/Y des plans selon `[0.05...1.0]` |
| 2 | Parallaxe scroll                | Scroll écran Aventure      | live   | Translate Y des plans selon coefficient  |
| 3 | Respiration cercle              | Exercice respiration       | 12s loop | Scale 1→1.4 sur 4s + 7s hold + 8s exhale |
| 4 | Crossfade scène                 | Navigation entre écrans    | 800ms  | Opacity 0→1                              |
| 5 | Rideau ÇA VA?                   | Tap tab boutique           | 600ms  | TranslateY 100%→0                        |
| 6 | Apparition glass card           | Mount écran                | 500ms  | Opacity 0→1 + translateY 12px→0          |
| 7 | Stagger reveal des CTAs         | Mount écran                | 800ms total | Children staggered delay 80ms       |
| 8 | Pulse douce totem               | Idle on screen             | 4s loop | Scale 1→1.05 ease-in-out                |
| 9 | Lumière source levante          | Transition aube            | 1500ms | Opacity du gradient sun 0→1              |
| 10| Light rays subtil               | Scenes lever de soleil     | 8s loop | Opacity rays oscille 0.3→0.5             |

### 10.3 Animations à éviter

- **Bounce.** Jamais d'effet "spring rebond" sur les boutons.
- **Rotation rapide.** Jamais de spin > 300ms.
- **Confetti.** Jamais. Anti-gamification.
- **Glow pulsant intense.** Le glow existe mais reste statique ou très lent.
- **Notifications "shake".** Jamais.

---

## 11. Stack technique recommandée (annexe)

Pour rappel (cible production) :
- **Framework** : React Native + Expo SDK 50+
- **Animation** : React Native Reanimated 3 + Skia (pour les illustrations painterly)
- **Backend** : Supabase (auth, db, storage, edge functions)
- **AI** : Anthropic API (Claude Sonnet 4.5 pour les voix de coaching et la modération)
- **Paiements** : RevenueCat pour les pass + Stripe pour la boutique ÇA VA?
- **Analytics** : Mixpanel (avec opt-in explicite à l'onboarding)
- **Notifications** : Expo Notifications + backend Supabase edge function

Pour le prototype web actuel :
- React 18+ single-file JSX
- Tailwind CSS avec config personnalisée pour les tokens NÉYA
- Framer Motion pour les animations
- SVG natif pour les scènes painterly (pas de canvas)

---

## 12. Tokens design (CSS variables exhaustives, annexe)

```css
:root {
  /* Couleurs Aube */
  --neya-aube-bg-deep: #0A0E1F;
  --neya-aube-bg-night: #1F2D52;
  --neya-aube-bg-twilight: #3D4D85;
  --neya-aube-bg-purple: #5D4F8B;
  --neya-aube-bg-lavender: #7B6FA8;
  --neya-aube-warm-1: #D49880;
  --neya-aube-warm-2: #D4A878;
  --neya-aube-warm-3: #F4D4A8;
  --neya-aube-light: #FBE8D8;
  --neya-aube-cream: #FBF6E8;
  --neya-aube-accent: #D4E08C;

  /* Couleurs Nuit */
  --neya-nuit-bg-void: #050810;
  --neya-nuit-bg-deep: #0A0E1F;
  --neya-nuit-bg-shadow: #1F1535;
  --neya-nuit-bg-purple: #3D2F6B;
  --neya-nuit-mid: #5D4F8B;
  --neya-nuit-blue: #8FA4D4;
  --neya-nuit-lavender: #C3BEEF;
  --neya-nuit-moon: #CADFFD;
  --neya-nuit-cream: #FBF6E8;
  --neya-nuit-fire: #D4E08C;

  /* Couleurs ÇA VA? */
  --cava-bg: #F4F0E8;
  --cava-ink: #1A1A1F;
  --cava-warm: #D49880;
  --cava-blue: #5D7BB8;
  --cava-purple: #3D2F6B;
  --cava-accent: #D4E08C;

  /* Sémantiques */
  --neya-success: #8AB87A;
  --neya-warning: #D49880;
  --neya-crisis: #C97171;
  --neya-info: #8FA4D4;

  /* Typo */
  --font-serif: 'Fraunces', Georgia, serif;
  --font-sans: 'Sora', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;

  --type-hero: 32px;
  --type-h1: 28px;
  --type-h2: 22px;
  --type-h3: 18px;
  --type-body: 14px;
  --type-body-sm: 12px;
  --type-label: 11px;
  --type-mark: 9px;
  --type-stat: 24px;

  /* Espacements */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 22px;
  --space-6: 32px;
  --space-8: 48px;
  --space-10: 64px;

  /* Rayons */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --radius-xl: 28px;
  --radius-pill: 100px;

  /* Durées */
  --duration-fast: 200ms;
  --duration-base: 400ms;
  --duration-slow: 800ms;
  --duration-narrative: 1200ms;

  /* Easings */
  --ease-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

---

## 13. Structure de fichiers recommandée (annexe)

```
neya/
├── app/                          # screens (React Native ou pages React)
│   ├── onboarding/
│   │   ├── question-1.tsx        # Forêt - Lion
│   │   ├── question-2.tsx        # Temple - Ours
│   │   ├── question-3.tsx        # Oasis - Aigle
│   │   ├── question-4.tsx        # Lac - Daim
│   │   └── question-5.tsx        # Montagne - Baleine
│   ├── aventure/
│   │   └── index.tsx             # carte d'ascension
│   ├── habitudes/
│   │   ├── index.tsx
│   │   ├── respiration.tsx
│   │   ├── meditation.tsx
│   │   └── journal.tsx
│   ├── communaute/
│   │   ├── feed.tsx
│   │   └── partager.tsx
│   ├── profil/
│   │   └── index.tsx
│   ├── crise/
│   │   ├── reconnaissance.tsx
│   │   ├── respiration.tsx
│   │   ├── choix.tsx
│   │   └── sortie.tsx
│   └── boutique/
│       ├── index.tsx
│       ├── produit/[id].tsx
│       └── panier.tsx
├── components/
│   ├── painterly/                # scènes painterly réutilisables
│   │   ├── ForetDeLaClarte.tsx
│   │   ├── TempleDesPartsDeSoi.tsx
│   │   ├── OasisDuPresent.tsx
│   │   ├── LacDesEmotions.tsx
│   │   ├── MontagneDeVision.tsx
│   │   └── EspaceCommunautaire.tsx
│   ├── totems/
│   │   ├── painterly/           # illustrations totems
│   │   └── glyphs/              # versions ligne simplifiées
│   ├── silhouette/
│   │   └── GirlSilhouette.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── GlassCard.tsx
│   │   ├── ChapterMark.tsx
│   │   ├── HeroTitle.tsx
│   │   └── BottomNav.tsx
│   └── animations/
│       ├── ParallaxScene.tsx
│       ├── BreathingCircle.tsx
│       └── SunRiseTransition.tsx
├── design-tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── animations.ts
├── lib/
│   ├── i18n/                    # FR par défaut, anglais en backup
│   ├── analytics.ts
│   ├── crisis-detection.ts      # mots-clés crise
│   └── moderation.ts
└── assets/
    ├── fonts/                   # Fraunces, Sora, Inter
    ├── audio/                   # voix méditation
    └── illustrations/            # exports SVG/PNG des scènes
```

---

## 14. Checklist de validation par écran (annexe)

Pour chaque écran rebuild, vérifier :

- [ ] 7 plans parallaxes au minimum sur les scènes painterly
- [ ] Sujet (silhouette) à 2-4% de la hauteur écran
- [ ] Animal totem à 5-8% de la hauteur écran, *dans* la scène (pas en surimpression)
- [ ] Source lumineuse unique et identifiable, edges lit sur les sujets
- [ ] Typo : Fraunces avec italique sur 2-4 mots clés, Sora pour les marks, Inter pour body
- [ ] Mark "N É Y A" en haut-gauche, chapitre mark en haut-droite
- [ ] Bouton primaire crème sur fond sombre (ou inverse), Sora 11-13px
- [ ] Aucun élément de gamification toxique (leaderboard, streak agressif, FOMO)
- [ ] Mode crise accessible en 1 tap depuis cet écran
- [ ] Transition d'entrée/sortie définie (crossfade par défaut)
- [ ] Palette cohérente avec le moment de la journée (aube/nuit)
- [ ] Contraste minimum 4.5:1 sur tout texte body
- [ ] Tutoiement systématique, écriture inclusive discrète (point milieu)
- [ ] Pas de couleur fluo, néon, ou saturée hors palette définie

---

**Fin du brief NEYA_DESIGN_SYSTEM_v1**

Toute modification future à ce document doit être versionnée (v1.1, v2, etc.) et discutée avant implémentation. Les choix verrouillés (palette, typo, principes Studio VØR) ne sont pas négociables sans une décision explicite de Will.
