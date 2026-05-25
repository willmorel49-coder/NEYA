# ÇA VA? V5 — Le Ciel Intérieur

> Spec de refonte · 2026-05-25
> Statut : design validé en brainstorming, attente revue spec avant plan d'implémentation
> Auteur : Will + Claude

---

## 1. Le cœur

> **« ÇA VA? est l'application faite pour ceux qui disent ça va quand ça ne va pas. »**

Cette phrase ne décrit pas l'app — **elle est l'app**. Tout ce qui ne sert pas ce cœur doit être coupé.

Trois corollaires :

- **Pas de masque.** Aucun écran ne doit demander de performer. L'utilisateur n'a pas besoin d'« aller mieux » pour ouvrir.
- **Une présence, pas une performance.** On compte les instants posés, jamais les streaks. Aucun leaderboard.
- **L'app respire avec ton silence.** Les moments où on n'écrit rien comptent autant que les autres.

---

## 2. La métaphore — Le Ciel Intérieur

L'app est une **constellation** qui se dessine au fil du temps. Chaque moment posé devient une **étoile** dans ton ciel personnel. Les étoiles se relient, forment des motifs, racontent ton parcours.

**Pourquoi cette métaphore fonctionne pour ÇA VA?** :

- Le ciel est universel, intime, libre.
- Les étoiles ne se classent pas — elles existent, et ça suffit.
- Une constellation n'est jamais « finie » : elle s'enrichit toute la vie.
- Le ciel a sa propre temporalité (nuit profonde / aube douce) qui matche les états traversés.

**Inspiration D.A directe** : *« nous existons pour briser le masque du ça va »* — le ciel intérieur est ce qu'on voit quand on enlève le masque.

---

## 3. La structure — 2 onglets

L'app n'a que **deux portes** :

### 🌌 Ciel (onglet principal, dark)

Ton ciel intérieur. La vue centrale, sacrée. Fond nuit profond (`linear-gradient(180deg, #050810 0%, #0A2438 45%, #1F1535 100%)`). Tu y déposes ta présence du jour, tu y relis ton histoire.

### ◇ Espaces (onglet secondaire, clair)

Trois refuges, accessibles depuis un menu lisible (fond `#EEF3F8`) :

- **Refuge** — se poser (respirer 90s, écrire, méditer guidé)
- **Voix** — lire ce que les autres ressentent (anonyme, sans like, sans compteur)
- **Marque** — l'univers ÇA VA? (manifeste, collections « Ma belle anxiété » + « Fruits & métaphores », 122 photos, pièces qui parlent)

Une seule barre de navigation en bas (glass pill), deux onglets.

---

## 4. Le Ciel — anatomie détaillée

### 4.1 Hero constellation (au-dessus du scroll)

**Format** : hauteur viewport ~50dvh, SVG full-width.

**Composants** :

- **Fond cosmique** : `linear-gradient` deep navy → violet sombre + 2 glows radial (rose top-right `rgba(200,112,144,0.20)` blur 100px, violet bottom-left `rgba(127,90,138,0.25)` blur 100px) qui pulsent très lentement (12-18s).
- **Étoiles** : 1 étoile par instant posé. Position calculée via algorithme déterministe (seed = userId + timestamp jour) — chaque user a SA constellation unique, jamais deux pareilles.
- **Étoile aujourd'hui** : si pas encore déposée, c'est un cercle en pointillés blanc qui pulse doucement (« pose ton étoile »). Si déjà déposée : étoile pleine, plus grosse, halo coloré selon l'état.
- **Fils** : SVG `<path>` tracés à la main entre étoiles de la même semaine. Apparition séquentielle (animation `stroke-dashoffset` 1200ms). Opacity 0.20-0.30.
- **Citation du jour** flottante : Cormorant italic 14px white opacity 0.7, position basse-droite. Tirée de la base citations marque (Camus, Prévert, Matt Haig, etc.) selon l'état du jour. Change chaque jour, même sans interaction. **C'est une signature magie.**
- **Salutation personnelle** : `« {greeting time-of-day}, {prénom}. »` Cormorant italic 22px white. Greeting : « Bonsoir » 18h-2h, « Bonjour » 6h-12h, « Cet après-midi » 12h-18h, « Cette nuit » 2h-6h.

### 4.2 Scroll narratif (sous la constellation)

L'utilisateur scrolle vers le bas → la constellation se réduit, laisse place à des **chapitres** qui racontent son histoire.

**Format chapitre** : glass card sur fond nuit (`rgba(255,255,255,0.06)` + blur 24) + border-left 4px couleur du chapitre + radius 18, padding 16×18.

**Types de chapitres** (auto-générés depuis les étoiles) :

| Type | Quand | Contenu | Couleur accent |
|---|---|---|---|
| **Hier** | toujours si étoile hier | « Hier soir, tu as posé : *« {mot} »* » | rose-500 |
| **Cette semaine** | si ≥ 3 étoiles dans 7 j | Couleur dominante + texture (« plus de fatigue », « plus calme ») | rose-700 |
| **Ce mois** | tous les 1ers du mois | Synthèse mois : « 18 étoiles posées en mai. Tendance : violet (introspection). » | violet |
| **Saison** | tous les 90 jours | « Tu as traversé le printemps. » | gradient-main |
| **Citation revisitée** | aléatoire 1/semaine | Tu retrouves une de tes propres notes du passé. | blue-700 |
| **Pièce qui résonne** | si état marqué = match avec citation marque | « Cette pièce te ressemble aujourd'hui. » + photo `/cava/marque/marque-XXX` | rose-700 |
| **Voix** | 1-2× / semaine | Voix anonyme d'un autre user qui résonne avec ton état récent | blue-500 |

**Le scroll est infini vers le bas** : on remonte le temps. Plus on descend, plus on voit loin dans ton histoire.

### 4.3 Poser son étoile (le geste sacré)

**Trigger** : tap sur l'étoile pulsante d'aujourd'hui, OU bouton flottant rose `+` en bas si déjà passé.

**Flow** (modal qui slide-up depuis le bas, fond nuit `rgba(5,8,16,0.92)` + blur 30) :

1. **Étape 1 — La couleur** : *« Et toi, ça va vraiment ? »* (Cormorant italic 28px). 5 grandes pastilles colorées :
   - 🔵 **Bleu** — calme, présent
   - 🌸 **Rose tendre** — doux, sensible
   - 🟣 **Violet** — introspectif, lourd
   - 🌅 **Pêche** — fatigue, plat
   - 🌧 **Bleu-gris** — orage, crise
   Choix en 1 tap. Haptic.

2. **Étape 2 — Un mot libre (optionnel)** : *« Si tu veux, dis-le. »* (Cormorant italic 22px). Textarea glass, placeholder « un mot, une phrase, ou rien. ». Skip = OK.

3. **Étape 3 — L'étoile naît** : animation 2s. La pastille couleur se transforme en étoile lumineuse, monte vers le ciel, rejoint la constellation. Halo pulse 2 cycles. Citation tirée du tag matched : *« Ton anxiété n'est pas une faiblesse, c'est une cicatrice vivante. »* + nom auteur si applicable. **Toast subtil** : *« Posé. »*

4. **Retour au Ciel** : la constellation est mise à jour. L'étoile pulse encore quelques secondes pour l'attention.

---

## 5. Personnalisation — comment chaque user a SA magie

### 5.1 Données collectées (onboarding pré-app, déjà existant)

- Prénom (déjà demandé)
- Mantra perso (nouveau — choix parmi 8 citations marque OU libre)
- Couleur favorite (nouveau — bleu / rose / violet : influence les accents perso)
- Heure de rituel préférée (nouveau — matin / soir → notification douce optionnelle)

### 5.2 Constellation unique par user

- L'algorithme de placement des étoiles utilise `hash(userId + index_jour)` comme seed → carte du ciel **différente pour chaque user**.
- Couleur dominante du ciel évolue avec les états récents : si majorité rose, halos roses plus présents. Si majorité bleu, le ciel devient plus deep navy.

### 5.3 Citations adaptées

Base de **48 citations** stockée dans `src/v2/data/citations.js` (Camus, Prévert, Matt Haig, manifeste marque, citations vêtements, anonymes user). Chaque citation a un tag d'état (`calme | tendre | introspectif | fatigue | orage`). L'app affiche prioritairement les citations matchant l'état dominant des 7 derniers jours.

### 5.4 Saisons du ciel

La palette du Ciel évolue subtilement avec la saison du calendrier :

- **Printemps (mar-mai)** : halos rose poudré, étoiles + chaleureuses
- **Été (juin-août)** : touches dorées, étoiles + lumineuses
- **Automne (sep-nov)** : ambre, violet profond, étoiles + douces
- **Hiver (déc-fév)** : bleu glacier, étoiles + pures

### 5.5 Mémoire forte

L'app **se souvient** :

- Tes mots écrits il y a 30, 90, 365 jours peuvent ressurgir comme chapitre.
- Si tu cliques une étoile passée, tu revis ce moment (couleur + ton mot, ta citation reçue).
- Les pièces de la marque vues + likées influencent les recommandations.

---

## 6. Magie — les moments qui touchent

Liste exhaustive des touches de magie à embarquer (chacune = 1 ticket implémentation distinct) :

| # | Magie | Où | Comment |
|---|---|---|---|
| M1 | **Étoile qui naît** | Modal pose | Animation 2s : pastille → trajectoire vers ciel → halo pulse |
| M2 | **Citation contextuelle** | Hero ciel + chapitres | 48 citations taggées, match état dominant |
| M3 | **Constellation unique** | Hero | Hash(userId+jour) → positions déterministes & uniques |
| M4 | **Mémoire qui ressurgit** | Chapitres | Étoile aléatoire des 30/90/365 jours passés revient |
| M5 | **Salutation personnalisée** | Top hero | Prénom + greeting time-of-day |
| M6 | **Pièce qui résonne** | Chapitre | Match état → pièce marque avec citation correspondante |
| M7 | **Saisons du ciel** | Palette dynamique | Halos + accents évoluent selon saison réelle |
| M8 | **Fils tracés à la main** | SVG ciel | Animation `stroke-dashoffset` 1200ms, jamais identique |
| M9 | **Halo cheveux teal** | Petit avatar coin | Personnage signature ÇA VA? en coin haut-gauche, halo `#12C4B0` pulsant |
| M10 | **Mot du jour manuscrit** | Hero | Une citation différente chaque jour, écrite en Cormorant italic comme manuscrite (touche cœur ✎ à côté) |
| M11 | **Ambiance sonore optionnelle** | Toggle profil | Drone subtil + vent doux quand on est dans le Ciel (≤ 12 dB, opt-in) |
| M12 | **Pose silencieuse** | Modal pose | Si on choisit la couleur mais skip le mot, l'app dit *« Le silence aussi compte. »* |

---

## 7. Architecture technique

### 7.1 Composants UI à créer (`src/components/ui/`)

Tous les nouveaux composants étendent le **Design System V4** existant (`src/components/ui/index.js`).

- `StarField.jsx` — SVG constellation responsive (props : `stars[]`, `connections[]`, `seed`)
- `Star.jsx` — étoile individuelle (props : `color`, `size`, `pulse`, `onTap`)
- `CielChapter.jsx` — chapitre scroll (props : `type`, `eyebrow`, `text`, `accent`, `media`)
- `PoseEtoileModal.jsx` — flow 3 étapes pose étoile (uses `Modal` primitive + custom inner)
- `CitationFlow.jsx` — citation flottante avec apparition douce
- `SeasonalPalette.jsx` — hook `useSeasonalPalette()` → tokens dynamiques saison
- `PersonAvatar.jsx` — petit avatar cheveux teal coin haut

### 7.2 Composants à supprimer / archiver

Pour atteindre le « 3 espaces minimal » :

- `Aventure.jsx` (3 piliers) — supprimé, contenus utiles migrés vers Refuge
- `Habitudes.jsx` — supprimé (les étoiles remplacent)
- `MoodTracker.jsx` — supprimé (étape 1 du flow pose étoile)
- `Bilan.jsx` / `BilanSemaine.jsx` — supprimés (chapitres auto)
- `Lookbook.jsx` / `ProductDetail.jsx` — fusionnés dans CaVa
- `EspaceVrai.jsx` — fusionné dans Refuge
- `AventurePlayer.jsx` / `AventureOnboarding.jsx` — supprimés
- `LeconReader.jsx` / `MondeReader.jsx` — supprimés
- `Cercle.jsx` — fusionné dans Voix

À garder (intégrés aux 3 espaces) :

- `Cocon.jsx` → devient écran principal de **Refuge**
- `Meditation.jsx` → action de **Refuge**
- `BreathingPause.jsx` → action de **Refuge**
- `Carnet.jsx` → action de **Refuge** (écrire libre)
- `Communaute.jsx` → devient **Voix** (refondu pour intégrer témoignages + cercle)
- `CaVa.jsx` → devient **Marque** (déjà structuré 9 chapitres)
- `Crise.jsx` + `Aide.jsx` + `EspacesIRL.jsx` + `CriseSettings.jsx` → restent overlays accessibles depuis SOS button

### 7.3 Data model

**`src/v2/state.js`** étendu :

```js
profile.stars = [
  {
    id: "star-2026-05-25",
    date: "2026-05-25",
    time: "22:47",
    color: "violet",  // 'bleu' | 'rose' | 'violet' | 'peche' | 'orage'
    note: "Je n'ai pas dormi. Mais j'ai posé.",  // optionnel
    citation: { tag: "introspectif", text: "...", author: "Camus" },
    type: "mood"  // 'mood' | 'breath' | 'voice' | 'write'
  },
  // ...
]

profile.preferences = {
  prenom: "Will",
  mantra: "Ma sensibilité est mon super-pouvoir",
  couleurFavorite: "violet",
  heureRituel: "soir",  // 'matin' | 'midi' | 'soir' | 'libre'
  ambianceSonore: false,
}
```

**`src/v2/data/citations.js`** (nouveau fichier) :

```js
export const CITATIONS = [
  { id: 1, text: "Au milieu de l'hiver j'apprenais enfin qu'il y avait en moi un été invincible.", author: "Albert Camus", tags: ["orage", "introspectif"] },
  { id: 2, text: "Ma sensibilité est mon super-pouvoir.", author: null, tags: ["tendre", "rose"] },
  { id: 3, text: "L'anxiété est une bête irrationnelle.", author: "Matt Haig", tags: ["orage", "violet"] },
  { id: 4, text: "Chaque pas est une victoire.", author: null, tags: ["fatigue", "calme"] },
  { id: 5, text: "Même si le bonheur vous oublie un peu, ne l'oubliez jamais complètement.", author: "Jacques Prévert", tags: ["fatigue", "introspectif"] },
  // ... 48 au total, extraits de la marque + littérature
];
```

### 7.4 Routing

`src/v2/App.jsx` allégé :

```jsx
<Ciel />          // par défaut, onglet actif
<Espaces />       // 3 sous-vues Refuge / Voix / Marque
<PoseEtoileModal /> // overlay
<Crise overlay />   // accessible depuis SOS
```

Tabs : `['ciel', 'espaces']` (au lieu de 4).

### 7.5 Palette CSS

`src/tokens.css` étendu :

```css
:root {
  /* Existing V4 palette stays */

  /* Ciel-specific (dark theme) */
  --ciel-bg: linear-gradient(180deg, #050810 0%, #0A2438 45%, #1F1535 100%);
  --ciel-text: #FBF6E8;
  --ciel-text-secondary: rgba(251, 246, 232, 0.65);
  --ciel-text-muted: rgba(251, 246, 232, 0.40);
  --ciel-glow-rose: rgba(200, 112, 144, 0.20);
  --ciel-glow-violet: rgba(127, 90, 138, 0.25);
  --ciel-glow-blue: rgba(26, 90, 127, 0.18);
  --ciel-glass: rgba(255, 255, 255, 0.06);
  --ciel-glass-border: rgba(255, 255, 255, 0.10);

  /* Star colors (mood states) */
  --star-bleu: #6F9DB5;       /* calme, présent */
  --star-rose: #E8A0B8;       /* tendre, sensible */
  --star-violet: #AF80BA;     /* introspectif, lourd */
  --star-peche: #D4A878;      /* fatigue, plat */
  --star-orage: #4A6070;      /* orage, crise */
}

/* Saisons (overrides dynamiques via JS) */
[data-season="printemps"] { --ciel-glow-accent: var(--ciel-glow-rose); }
[data-season="ete"]       { --ciel-glow-accent: rgba(212, 168, 120, 0.28); }
[data-season="automne"]   { --ciel-glow-accent: rgba(127, 90, 138, 0.30); }
[data-season="hiver"]     { --ciel-glow-accent: rgba(143, 164, 212, 0.25); }
```

---

## 8. Migration — phases d'implémentation

### Phase 1 — Foundation (avant toute UI)

- [ ] Étendre `tokens.css` avec palette Ciel (dark) + saisons
- [ ] Créer `src/v2/data/citations.js` (48 citations)
- [ ] Étendre `state.js` schema (stars[], preferences{})
- [ ] Helpers : `addStar()`, `getStarsRange(from, to)`, `getCitationForState(color)`, `useSeasonalPalette()`
- [ ] Hook `useDailyStarStatus()` (a-t-on déjà posé aujourd'hui ?)

### Phase 2 — Ciel (l'écran central)

- [ ] `StarField.jsx` SVG responsive + algorithme placement déterministe
- [ ] `Star.jsx` (pulse, halo, color, tap)
- [ ] `Ciel.jsx` hero + scroll narratif
- [ ] `CielChapter.jsx` (7 types) + générateur auto depuis stars
- [ ] `PoseEtoileModal.jsx` (3 étapes : couleur / mot / étoile-naît)
- [ ] `PersonAvatar.jsx` cheveux teal coin
- [ ] Animation fils SVG entre étoiles

### Phase 3 — Espaces (refonte 3 verbes)

- [ ] `Espaces.jsx` shell + 3 sous-routes
- [ ] **Refuge** : merge Cocon + Méditation + BreathingPause + Carnet en 1 écran avec 4 actions
- [ ] **Voix** : refonte Communauté (1 hero + feed voix anonymes + bouton « Partager une voix »)
- [ ] **Marque** : CaVa déjà fait → light polish + lien vers chapitres « Pièces qui résonnent » du Ciel

### Phase 4 — Nettoyage + suppressions

- [ ] Supprimer Aventure / Habitudes / MoodTracker / Bilan / BilanSemaine / Lookbook / ProductDetail / EspaceVrai / AventurePlayer / AventureOnboarding / LeconReader / MondeReader / Cercle
- [ ] Migrer données existantes utiles (anciens états mood → étoiles rétroactives)
- [ ] Mettre à jour `BottomNav` (2 tabs au lieu de 4)
- [ ] Mettre à jour menu hamburger
- [ ] Update SAVEPOINT.md

### Phase 5 — Magie (touches finales)

- [ ] M2 Citations contextuelles
- [ ] M4 Mémoire qui ressurgit
- [ ] M6 Pièce qui résonne (matching state → pièce marque)
- [ ] M7 Saisons du ciel (`useSeasonalPalette()`)
- [ ] M11 Ambiance sonore optionnelle (Web Audio API)
- [ ] M12 Pose silencieuse (message si skip mot)

### Phase 6 — Onboarding amplifié

- [ ] Ajouter étape « Choisis ton mantra » (8 citations + libre)
- [ ] Ajouter étape « Ta couleur favorite » (3 pastilles bleu/rose/violet)
- [ ] Ajouter étape « Heure de rituel préférée »
- [ ] Première étoile posée pendant l'onboarding (= naissance du ciel)

---

## 9. Out of scope (volontairement écarté)

- **Notifications push** — pas dans cette version (la magie doit être dans l'app, pas dans les rappels)
- **Mode hors-ligne avancé** — PWA actuelle suffit
- **Comptes utilisateurs / sync cloud** — reste local-only (`localStorage`)
- **Statistiques avancées / graphiques** — anti-gamification
- **Partage social externe** — la marque ÇA VA? est le canal externe
- **Theming custom complet** — la palette saison suffit
- **Multi-langue** — français only pour cette version

---

## 10. Critères de succès (Definition of Done refonte V5)

- [ ] Au premier lancement, l'utilisateur voit son ciel vide et est invité à poser sa première étoile en 1 geste émotionnel (couleur).
- [ ] Au 7e jour d'usage, sa constellation contient 5-7 étoiles qui s'affichent avec des fils, et il peut scroller pour voir 2-3 chapitres de son histoire.
- [ ] L'app a 2 onglets visibles. Plus aucun écran « Aventure ».
- [ ] Aucune mention de XP, streak, niveau, leaderboard nulle part.
- [ ] La phrase manifeste « ÇA VA? est l'app pour ceux qui disent ça va quand ça ne va pas » est lisible dans l'onboarding ET dans la marque.
- [ ] Au moins 1 citation littéraire / marque apparaît visible chaque jour (M2).
- [ ] La constellation est unique par user (test : 2 users différents = 2 ciels différents).
- [ ] Le bundle final reste ≤ 500 kB JS (113 kB gzip).
- [ ] Build clean. Aucun `console.log`. `prefers-reduced-motion` respecté pour toute la magie.
- [ ] Déployé en prod sur `neya-kappa.vercel.app`, HTTP 200.

---

## 11. Risques + mitigations

| Risque | Mitigation |
|---|---|
| **Effet « gimmick »** — la métaphore constellation peut paraître superficielle | Renforcer la dimension littéraire (citations, mots libres, chapitres). Ne JAMAIS afficher le nombre d'étoiles comme un score. |
| **Performance SVG sur mobile bas de gamme** | Limiter à 200 étoiles max affichées simultanément (LRU des plus récentes). Throttle animations. |
| **Suppression Aventure brutale** | Backup data dans `localStorage` avant migration. Possibilité de réafficher l'ancien comportement via `?legacy=true` URL param pour les beta. |
| **Magie qui devient pesante** | M11 (audio), M4 (mémoire), M6 (pièce qui résonne) doivent rester optionnels / discrets. Toutes les touches magiques sont désactivables via Settings. |
| **Onboarding trop long** | Limiter à 5 étapes max. Skip possible à chaque étape (sauf prénom). |

---

## 12. Notes implémentation

- **Modèle Opus** recommandé pour la cavalerie (la nuance émotionnelle des copys + le rythme des animations sont critiques)
- **Foreground sub-agents** (les background sont bloqués sandbox — vu en session précédente)
- **Branche** : `feat/v5-constellation` (la prod V4 reste live sur `main` jusqu'au merge final)
- **Photos marque** : déjà toutes copiées dans `/public/cava/marque/` et `/public/cava/selection/`
- **Composants UI existants** : tous les `src/components/ui/` (Header, GlassCard, CTA, etc.) restent utilisés tels quels. On ajoute. On ne casse pas.

---

**Fin du design doc. Direction validée en brainstorming. Prochaine étape : revue user → writing-plans skill → plan d'implémentation.**
