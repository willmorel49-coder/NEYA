# ÇA VA? V6 — Check-in du jour (refonte charpente)

**Date** : 2026-06-01
**Branche cible** : `feat/v6-checkin`
**Statut** : Spec validé, prêt pour writing-plans
**Cycle précédent** : V5 Constellation (prod live `https://neya-kappa.vercel.app`) + cavalry post-audit (branche `fix/v5-fonctionnel`, 23 fixes, en attente promote prod)

---

## 1. Objectif

Rendre l'app **comprehensible dès le premier contact**. La métaphore Constellation V5 est élégante mais opaque — utilisateurs ne s'approprient pas « poser une étoile » et ne comprennent pas à quoi sert l'app. Réponse : **remplacer la charpente** par un check-in quotidien direct, sans poésie structurelle.

### Promesse produit nouvelle

> « ÇA VA? est l'application pour ceux qui disent ça va quand ça ne va pas. On te demande chaque jour comment tu vas. On te répond avec quelque chose d'utile. »

La poésie reste dans le **ton** (italiques Cormorant, citations Camus/Prévert/Matt Haig, copy anchors) — elle quitte la **structure**.

---

## 2. Architecture (2 onglets)

| Onglet | Rôle | Fichier principal |
|---|---|---|
| **Check-in** (1er) | Charpente — flow du jour + historique narratif | `src/v2/screens/Checkin.jsx` (nouveau) |
| **Marque** (2e) | Philosophie ÇA VA?, manifeste, photos brand (inchangé) | `src/v2/screens/CaVa.jsx` (existant, conservé) |

### Suppressions massives V5

Supprimés du code et du runtime :
- `src/v2/screens/Ciel.jsx` (constellation)
- `src/v2/screens/Espaces.jsx` (router sub-onglets)
- `src/v2/screens/Refuge.jsx` (absorbé)
- `src/v2/screens/Voix.jsx` (feed anonyme — fonctionnalité retirée)
- `src/v2/screens/Cocon.jsx` (sanctuaire — retiré)
- `src/v2/screens/Meditation.jsx` (long-form retiré)
- `src/v2/screens/EspacesIRL.jsx`
- `src/v2/screens/Manifeste.jsx`, `Tour.jsx`, `Patronus.jsx`, `Aide.jsx`
- `src/v2/screens/CriseSettings.jsx` (paramètres crise retirés ; overlay direct sans config)
- `src/v2/screens/RituelPlayer.jsx`, `Musique.jsx`, `Souvenirs.jsx`
- `src/v2/screens/Onboarding.jsx` (réécrit court — voir §6)
- `src/components/ui/StarField.jsx`, `Star.jsx`, `CielChapter.jsx`, `PoseEtoileModal.jsx`, `PersonAvatar.jsx`
- `src/v2/data/star-positions.js`, `aventure-foret.js`, `aventure-oasis.js`, `aventure-temple.js`, `mondes.js`, `worlds.js`, `lecons.js`, `rituels-temps.js`
- `src/v2/helpers/chapter-generator.js`, `stars.js` (lecture-seule conservée pour migration uniquement — voir §8)
- `src/v2/hooks/useDailyStarStatus.js`, `useCitation.js`, `useSeasonalPalette.js` (saison-color dropped)
- `src/v2/community.js` (helpers cercle/lumières/keywords crise) — `detectCrisisKeywords` retiré : pas de scan automatique du texte utilisateur, le FAB Crise (§5.5) suffit comme entry point

### Conservés (réutilisés ou inchangés)

- `src/v2/screens/CaVa.jsx` (Marque) — intact
- `src/v2/screens/BreathingPause.jsx` — réutilisé comme mini-flow respi
- `src/v2/screens/Carnet.jsx` — réutilisé comme mini-flow écriture
- `src/v2/screens/Crise.jsx` — réutilisé en overlay safety, ouvert par FAB global (§5.5)
- `src/components/ui/{Overlay, Sheet, Modal, CTA, Body, Textarea, Toast, ToastProvider, Icon, GlassCard, Header, BackButton, Eyebrow, HeroTitle, SectionTitle, Stat, Badge, EmptyState, Skeleton, Spinner, Choice, Toggle, Input, FormField}.jsx`
- `src/v2/state.js` — refactoré (voir §8) ; `mutateProfile`, `addSouvenir`, `BOUEES`, `pickCitation`, helpers utiles conservés
- `src/v2/data/citations.js` — intégral, source des écho citations
- `src/v2/data/marque-manifest.js` — intact (utilisé par CaVa)

---

## 3. Flow du jour (4 états)

```
[ouverture app]
      ↓
┌─────────────────┐
│ 1. Question     │  "Et toi, ça va vraiment ?"
│    + 3 choix    │  → Ça va | Ça va pas trop | Pas terrible
└────────┬────────┘
         ↓ (mood enregistré, 1 fois/jour)
┌─────────────────┐
│ 2. Écho menu    │  3 options adaptées au mood (voir §4)
│    3 options    │  + citation contextuelle
└────────┬────────┘
         ↓ (choix optionnel — peut juste fermer)
┌─────────────────┐
│ 3. Mini-flow    │  Respirer | Écrire | Bouée — plein écran
└────────┬────────┘
         ↓ (action terminée)
┌─────────────────┐
│ 4. État fait    │  "Tu t'es posé·e aujourd'hui."
│                 │  + "Continuer / Faire autre chose"
│                 │  + lien "Voir le passé →"
└─────────────────┘
```

### État 1 — Question (Home par défaut si pas de check-in du jour)

- **Question fixe** : « Et toi, ça va vraiment ? » (titre Cormorant italic, ~32px)
- **Sub-text dynamique** : `{greet()}, {prenom || ''} · {jour} {date}` (ex : « Bonjour Will · mardi 1er juin »)
- **3 boutons-choix** verticaux, hit-zone ≥ 44×44 :
  - 👌 Ça va
  - 😶 Ça va pas trop
  - 🌧 Pas terrible
- **Citation contextuelle** en bas (italic Cormorant, opacity 0.65, `pickCitation('présence', seed)`)

### État 2 — Écho menu

- **Header** : tag pâle « Tu m'as dit : pas terrible » (mood écho)
- **Titre** Cormorant italic : adapté au mood (voir §4)
- **3 lignes-cards** : icône + label + sub-label + flèche
- **Citation** en bas, choisie selon le mood (tagging dans `citations.js`)

### État 3 — Mini-flow

Plein écran. Cf. §5 pour chaque type.

### État 4 — Fait

- Titre Cormorant : « Tu t'es posé·e aujourd'hui. »
- Sub : « À demain. Sauf si tu veux revenir. »
- Récap visuel : pastille couleur du mood + label action faite + durée si applicable
- CTA primaire : « Faire autre chose » (renvoie au menu écho — actions multiples permises)
- CTA secondaire : « Voir le passé → » (ouvre Timeline §6)

---

## 4. Mapping humeur → menu écho

Le menu écho est **adapté à l'humeur** pour donner le sentiment que l'app répond, pas qu'elle propose une checklist statique.

| Mood (rép. 1) | Couleur dot | Option 1 | Option 2 | Option 3 | Tonalité citation |
|---|---|---|---|---|---|
| **Pas terrible** | `#aac6dd` (bleu nuit) | Respirer 4·7·8 (3 min) | Écrire ce qui pèse | Une bouée douce (subset BOUEES `level: corps` ou `lien`) | « fardeau », « peur », « manque » |
| **Ça va pas trop** | `#e8a0b8` (rose tendre) | Respirer cohérence 5·5 (2 min) | Écrire (texte libre) | Une bouée (n'importe quel level) | « présence », « tendresse » |
| **Ça va** | `#7dc8a0` (vert tendre) | Une citation à garder (juste citation pleine page) | Écrire un mot pour toi | Une bouée légère (`level: esprit` ou `monde`) | « gratitude », « joie » |

### Implementation note

- Le composant `Checkin.jsx` détient l'état `step ∈ {'question', 'echo', 'done'}` et le mood courant.
- Le menu écho lit un objet `ECHO_MENU` mappant `mood → [{ id, label, sublabel, icon, kind: 'respi-478' | 'respi-55' | 'carnet' | 'bouee' | 'citation-only' }]`.
- Au clic d'une option, on lance le mini-flow correspondant via overlay (cf. §5).

---

## 5. Mini-flows (réutilisent l'existant)

### 5.1 Respirer

- **Composant** : `BreathingPause.jsx` (existant, conservé)
- **Adaptations mineures** : prop `rhythm = '4-7-8' | '5-5'` (défaut `'5-5'`), `accent='rose'` (déjà couvert par cavalry C3)
- À la fin du cycle (ou tap « Terminer ») → callback `onComplete()` → check-in passe à état `'done'`
- Souvenir enregistré : `{ type: 'breath', rhythm, duration, mood }` dans `profile.checkins[i].action`

### 5.2 Écrire

- **Composant** : `Carnet.jsx` (existant, conservé, déjà patché par cavalry C2+C5)
- **Adaptation** : prop `mood` propagée pour pre-fill le placeholder selon humeur (« ce qui pèse… » / « un mot pour toi… »)
- Au save → callback `onSave(noteText)` → check-in écrit `action: { type: 'write', text: noteText }`
- Pas d'auto-close immédiat — le toast « Gardé. » s'affiche, l'utilisateur ferme via le bouton retour du Carnet, on retourne à l'état `'done'`.

### 5.3 Bouée

- **Nouveau composant** : `src/components/ui/BoueeModal.jsx` (~80 lignes)
- Pioche aléatoire dans le subset filtré par mood (selon level)
- Affichage plein écran : icône bouée + action complète Cormorant italic + bouton « Fait ✓ »
- Au clic « Fait » → callback `onDone(boueeId)` → check-in écrit `action: { type: 'bouee', boueeId }` + appelle `markBoueeDone(id)` (existant `state.js`)

### 5.4 Citation à garder (mood « Ça va » uniquement)

- **Composant inline** dans `Checkin.jsx`
- Affiche `pickCitation('gratitude' | 'joie', seed)` en plein écran avec un fond cream/ink
- Bouton « Garder » → check-in écrit `action: { type: 'citation', citationId }`

### 5.5 FAB Crise (safety, toujours accessible)

- **Composant** : `Crise.jsx` (existant V5, conservé, simplifié — retire les paramètres `CriseSettings`)
- **FAB** rouge discret position fixed bottom-right, hit-zone 56×56, toujours visible (sur les 2 onglets Check-in et Marque), z-index élevé. Label `aria-label="Aide en cas de crise"`. Icône `◉` ou symbole croix médicale, opacity 0.85.
- **Tap** → overlay plein écran avec :
  - Titre Cormorant italic : « Tu n'es pas seul·e. »
  - Respiration apaisante 4·6 (BreathingPause `rhythm='4-6'`)
  - Bloc ressources France : `3114` (suicide écoute, gratuit 24/7), `15` (SAMU urgence vitale)
  - Bloc texte court : « Si tu es en danger immédiat, appelle. Si tu veux juste parler, le 3114 t'écoute, sans jugement. »
  - Bouton « Sortir » discret
- **Tracking** : `recordCrisisEntry()` / `recordCrisisExit()` (helpers existants conservés dans `state.js`)
- **Pas de scan auto** des textes utilisateur (suppression de `detectCrisisKeywords`) — l'entry point est volontaire (tap FAB), pas algorithmique. Évite faux-positifs et sentiment d'être surveillé.

---

## 6. Historique — Timeline narrative

### 6.1 Vue

- **Accès** : tap « Voir le passé → » depuis état `'done'`, ou icône calendrier dans header Check-in
- **Layout** : overlay plein écran ou sub-route `/passé`, liste verticale scrollable, plus récent en haut
- **Header** : « Ton mois » (Cormorant italic)

### 6.2 Format ligne

```
[dot 10×10 couleur mood]  [date 11px opacity 0.5]
                          [mood + action 13px]      → cliquable
                          [bout de citation italic 11px opacity 0.5]
```

Exemples :
- 🟢 1er juin · Pas terrible · respiration · « Tu n'es pas seul·e. »
- 🟣 31 mai · Ça va pas trop · écrit · « Le silence aussi compte. »
- ⚫ 29 mai · Pas terrible · bouée · « T'as pas besoin… »

### 6.3 Détail (tap sur ligne)

Overlay glass : date complète + heure + mood + action faite + citation entière + note si écrite. Pas d'édition.

### 6.4 Profondeur

- Affichage : 90 derniers jours max (cap pour perf + quota localStorage)
- Pas de filtre, pas de recherche, pas de groupement par mois — la timeline narrative scrolle naturellement
- Au-delà de 90 jours, message bas : « Plus de 3 mois. Tu es revenu·e souvent. »

---

## 7. Onboarding (1 écran)

Drastiquement raccourci par rapport au V5 (8 étapes → 1).

### Contenu

```
ÇA VA?                                  [tag top, letterspacing]

Cette app te demande
chaque jour comment tu vas.
Et te répond.

C'est tout.

— 3 options pour répondre.
  Tu décides ce qui suit.

[ Commencer → ]                         [CTA primaire glass cream]
```

- **Fond** : pearl glass cream/ink, peut-être 1 photo brand floue en background (`/cava/brand/marque-001.jpg` ou similaire)
- **Pas de quiz**, pas de calcul d'archétype, pas de mantra, pas de couleur favorite, pas d'heure de rituel, pas de pose 1ère étoile
- **Prénom** : optionnel, demandé plus tard via Paramètres (icône ⚙ dans le header Check-in)
- **Clic Commencer** → `patchProfile({ onboarding: { completed: true } })` + landing direct sur état 1 (Question)

### Migration utilisateurs V5

- Si `profile.onboarding.completed === true` → skip onboarding (déjà fait)
- Si `profile.stars.length > 0` → migration (§8) puis skip onboarding aussi (l'utilisateur a déjà utilisé l'app)
- Sinon → onboarding V6 affiché

---

## 8. Migration data V5 → V6

### 8.1 Schéma profil

**Avant (V5)** :
```js
profile = {
  ...,
  stars: [{ id, date, time, color, note, citation, type, x, y }],
}
```

**Après (V6)** :
```js
profile = {
  ...,
  checkins: [{
    id,                              // string unique
    date,                            // 'YYYY-MM-DD'
    time,                            // 'HH:mm' (1er check-in du jour)
    mood,                            // 'ca-va' | 'ca-va-pas-trop' | 'pas-terrible'
    citation,                        // { id, text, author, tags } — l'écho citation
    actions: [                       // array — l'utilisateur peut enchaîner plusieurs actions/jour (§9.2)
      { type, ...args, doneAt }      // ex: { type: 'breath', rhythm: '4-7-8', doneAt }
    ],
  }],
  // stars conservé en lecture-seule pour rétro-compat / rollback éventuel
}
```

### 8.2 Mapping star → checkin

```js
const STAR_COLOR_TO_MOOD = {
  bleu:   'ca-va',          // calme, présent
  rose:   'ca-va',          // doux, sensible (cap haut)
  violet: 'ca-va-pas-trop', // introspectif, lourd
  peche:  'ca-va-pas-trop', // fatigue
  orage:  'pas-terrible',   // crise
};
```

### 8.3 Mapping star.type → checkin.actions[]

Pour chaque star migrée, génère un checkin avec un `actions` array contenant **0 ou 1 action** :

```js
const STAR_TYPE_TO_ACTION = {
  mood:   null,                                      // pose étoile sans action concrète → actions: []
  breath: { type: 'breath', legacy: true },
  voice:  { type: 'voice-legacy' },                  // Voix supprimé mais l'historique reste
  write:  (star) => ({ type: 'write', text: star.note || null }),
};
```

Si deux stars existent le même jour, on fusionne en 1 checkin : mood = celui de la première (chronologique), `actions` = concat des actions résultantes.

### 8.4 Helper

Nouveau `src/v2/helpers/migrate-v5-to-v6.js` :

- Lit `profile.stars`, génère `profile.checkins` correspondants, supprime les doublons par date (1 check-in/jour, prend le premier de la journée).
- Drapeau : `cava_v6_migrated` (ls.get/set).
- Conserve `profile.stars` intact pour rollback.

Appelé une fois au boot dans le nouveau `V2App` (ex-`src/v2/App.jsx`).

### 8.5 Helpers V6 nouveaux

Nouveau `src/v2/helpers/checkins.js` :

```js
hasCheckinToday()                   // boolean
addCheckin({ mood, action, citation }) // idempotent (1/jour), retourne existant si déjà fait
getTodayCheckin()                   // l'objet ou null
updateTodayCheckinAction(action)    // utilisé quand user enchaîne une 2e action sans nouveau mood
getCheckinsRange(fromIso, toIso)
getAllCheckins()                    // tri desc
getLatestCheckin()
getDominantMood(days = 7)
```

Toutes les mutations passent par `mutateProfile()` (atomique, foundation cavalry Groupe E).

---

## 9. État dégradé / cas limites

### 9.1 Pas de citation pour le tag (mood « ça va » + tag « gratitude » vide)

Fallback : `pickCitation('présence', seed)` (universel).

### 9.2 Re-check-in même jour

L'utilisateur peut faire 1 check-in du jour (mood enregistré), mais peut enchaîner plusieurs actions. La toolbar bas de l'état `'done'` propose « Faire autre chose » qui renvoie au menu écho — sans changer le mood.

Schéma : `profile.checkins[i].actions = [...]` (array). La timeline groupe les actions du même check-in en une ligne (« Pas terrible · respiration + écriture »).

### 9.3 Mode hors-ligne

Tout est local (`localStorage`), pas de réseau requis. Citations + bouées + texts embarqués dans le bundle.

### 9.4 Quota localStorage

Cap `checkins` à 500 entrées max (LRU des plus récents). Pas de souci à court terme (1 check-in/jour = ~16 mois de capacité).

---

## 10. DA & ton (inchangés)

- Cream/ink pearl glass, Cormorant Garamond italic pour les titres
- Couleurs accent existantes : `--rose-700`, `--cava-warm`, etc.
- Copy anchors conservés : « Et toi, ça va vraiment ? » · « T'as pas besoin d'aller bien pour commencer » · « Tu n'es pas seul·e » · « Le silence aussi compte »
- Pas de bibliothèques UI externes — porter les composants à la main, conformément à `ROBOT.md`

---

## 11. Acceptance criteria

- [ ] Premier launch : onboarding 1 écran → état Question directement
- [ ] Tap sur un choix mood → menu écho s'affiche avec 3 options adaptées
- [ ] Tap option Respirer → BreathingPause s'ouvre, à la fin retour à état `done`
- [ ] Tap option Écrire → Carnet s'ouvre, save → retour à état `done` avec note enregistrée
- [ ] Tap option Bouée → BoueeModal s'ouvre, tap Fait → retour à état `done`
- [ ] Lien « Voir le passé » → timeline narrative scrollable, lignes cliquables
- [ ] Tap ligne timeline → overlay détail
- [ ] Re-ouverture même jour : état `done` directement, pas re-demandé le mood
- [ ] Migration V5 → V6 : utilisateur avec 15 stars retrouve 15 lignes dans timeline (mapping correct)
- [ ] Onglet Marque inchangé, accessible via BottomNav
- [ ] Bundle taille : < 250 kB JS (V5 = 292 kB, on devrait gagner avec les suppressions massives)
- [ ] Build clean `npm run build`, pas de console.log
- [ ] Aucune référence orpheline à `Star`/`Constellation`/`Voix`/`Refuge`/`Cocon` dans le code restant
- [ ] FAB Crise présent sur les 2 onglets, toujours accessible (hit-zone ≥ 56×56, z-index supérieur au BottomNav)
- [ ] Tap FAB Crise → overlay safety s'ouvre avec respi 4·6 + 3114/15 + bouton sortir

---

## 12. Hors scope (cycle ultérieur V6.1)

- Paramètres : édition prénom, mantra (mantra peut disparaître complètement)
- Notifications push (« on te demandera comment tu vas à 21h »)
- Stats / graphe humeur sur N jours
- Export timeline (CSV / texte)
- Multi-langue
- Thème sombre (V6 est cream/ink uniquement)
- Bouées personnalisables ou ajoutables par l'utilisateur

---

## 13. Risques connus

- **Régression utilisateurs V5 fidèles** : ceux qui adoraient la constellation peuvent percevoir V6 comme un appauvrissement. Mitigation : la timeline narrative montre leur historique converti, ils ne perdent rien — au contraire, le récit jour par jour est plus lisible.
- **Migration cas limites** : un utilisateur avec 2 stars le même jour. Solution : on garde la première, la seconde devient une `action` du même check-in (cf. §9.2).
- **Cleanup de code volumineux** : ~10 écrans supprimés + composants UI + helpers. Risque d'imports cassés. Mitigation : suppression progressive avec `npm run build` après chaque batch, ou via cavalry implémentation (cf. plan).
- **Confiance dans le mapping color→mood** : le mapping est subjectif. Mitigation : revue empirique sur quelques utilisateurs test (Will lui-même), ajustement possible.

---

## 14. Documents liés

- **Spec V5 Constellation** : `docs/superpowers/specs/2026-05-25-ca-va-v5-constellation-design.md` (refonte précédente, à archiver mais conservé)
- **Spec post-audit cavalerie** : `docs/superpowers/specs/2026-06-01-ca-va-v5-fonctionnel-design.md` (23 fixes en cours sur `fix/v5-fonctionnel`)
- **ROBOT.md** : ton, DA, anti-patterns, mode autonome
- **SAVEPOINT.md** : état actuel V5 prod

---

## 15. Relation au cycle cavalerie en cours

Branche `fix/v5-fonctionnel` (23 fixes post-audit V5) est en preview Vercel (`neya-qrb4efhnh-willmorel49-coders-projects.vercel.app`).

**Décision** : avant de démarrer V6, **promote le preview cavalry sur prod** pour livrer les bug fixes (Groupes A-F bénéficient à V6 aussi — notamment `mutateProfile`, `BreathingPause` accent, `Carnet` momentum iOS, etc. qui sont réutilisés). V6 partira de `main` avec le cavalry mergé.

Ordre d'exécution recommandé :
1. Promote `fix/v5-fonctionnel` → `main` → prod (cycle court, 23 fixes shippés)
2. Créer `feat/v6-checkin` depuis `main` (qui contient les fixes)
3. Implémenter V6 selon le plan à venir (writing-plans skill suivant)
