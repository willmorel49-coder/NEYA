# NÉYA — Gameplay System (Therapeutic Mini-Games)

> *Game design émotionnel + psychologie comportementale.*
> Pas des jeux mobiles. Des expériences interactives de soin personnel.

---

## 1. Philosophie

NÉYA n'utilise pas la gamification dopamine (streaks à valoir, badges à collectionner, points à dépenser).
Elle utilise la **gamification contemplative** : des interactions tactiles satisfaisantes qui ont un effet psychologique mesurable (régulation émotionnelle, ancrage, défusion cognitive).

### 3 axes de qualité

1. **Bénéfice clinique réel** — chaque jeu repose sur une technique validée (ACT, mindfulness, grounding, breathwork, sensory regulation).
2. **Game feel premium** — interactions douces, organiques, sans dopamine casino.
3. **Esthétique cohérente NÉYA** — animations, palette archétype, sons subtils, philosophie poétique.

### Anti-patterns (refusés)

- ❌ Chronomètre visible qui presse
- ❌ Score affiché en gros / ranking
- ❌ Perte d'élément si échec / vies
- ❌ Achievements à compléter
- ❌ Notification "tu n'as pas joué aujourd'hui"
- ❌ Pop-ups intrusifs / publicités
- ❌ Skin / cosmétiques à acheter
- ❌ Difficulté progressive imposée

---

## 2. Architecture gameplay

```
src/inner-world.js
  └── souvenirs / vitalité / météo / ambient temporelle
        ↓
src/App.jsx — composants jeux (single-file rule)
  ├── BreathingModal             (P1 ✅ déjà existant — souffle guidé)
  ├── LiberationPenseesModal     (P1 ✅ livré — défusion cognitive ACT)
  ├── ApaisementSensorielModal   (P2 — sensory grounding 5-4-3-2-1)
  ├── EquilibreEmotionnelModal   (P2 — balance an inner world)
  ├── ReparationCoconModal       (P3 — repair shattered shapes)
  ├── MeditationActiveModal      (P3 — rhythm + breath sync)
  └── ConcentrationModal         (P3 — focus on single moving dot)
```

Chaque jeu :
- Modal fullscreen (zIndex 880-900)
- 60-180 secondes max
- Pas de sauvegarde / pas de progression visible
- Souvenir(s) automatique si première fois
- Compatible reduced-motion
- Pas de son par défaut (toggle optionnel à venir)

---

## 3. Boucle de gameplay globale

```
Daily ritual (matin / soir)
  ├── BreathingModal (1 cycle)        → mood_delta tracké
  ├── 1 routine cochée                → +XP + souvenir éventuel
  ├── (optionnel) Mini-jeu choisi
  │     ├── Libération si tension     (anxiety)
  │     ├── Apaisement si surcharge   (overstim)
  │     └── Concentration si dispersé (focus)
  └── EspaceVrai (présence ≥18s)      → fragment + souvenir
```

L'utilisateur **choisit** son outil selon son besoin du moment. NÉYA ne lui dit pas "joue à X aujourd'hui". L'app propose, l'utilisateur dispose.

---

## 4. Mini-jeu #1 livré — Libération des pensées (P1)

### Objectif clinique
**Défusion cognitive** (Acceptance & Commitment Therapy, Hayes). Voir ses pensées comme des nuages qui passent, pas comme des vérités absolues. Réduit la rumination + l'identification au flux mental.

### Gameplay
1. 5 pensées négatives **aléatoires** flottent doucement à l'écran (pool de 15 phrases courantes : "Je ne suis pas assez", "J'ai trop à faire", "Personne ne me comprend"...)
2. Chaque pensée = un bouton blob sombre semi-transparent qui dérive lentement (`thoughtFloat` 22-28s)
3. **Tap** sur une pensée → elle se dissout :
   - Haptic 8
   - **10 particules** archétype-colorées explosent radialement (`thoughtBurst` 1.1s + variables CSS `--tx`/`--ty`)
   - Compteur (5 dots en bas) s'allume avec `chipPop` 480ms spring
   - Ambient glow archétype intensifie (background gradient `transition: 1.6s`)
4. Quand les 5 sont libérées :
   - Haptic pattern long `[20, 80, 20, 80, 30]`
   - Titre devient *"L'espace s'est éclairci."*
   - Sous-titre : *"Ces pensées ne sont pas toi. Elles n'étaient que de passage."*
   - Bouton "Continuer ✦" apparaît en `breathExpand` 620ms
   - Souvenirs : `first_liberation` (premier essai) + `liberation_session` (chaque session)

### Pourquoi ça marche
- Le **toucher physique** (tap) crée une séparation cognitive entre soi et la pensée
- La **dissolution visuelle** matérialise le concept "the thought is not me"
- L'**absence de score** retire la pression de performance
- La **palette douce** + ambient glow récompense sans culpabiliser
- 60-90 secondes = doable dans une pause

### Library de pensées (15)
Toutes en français, à la première personne, validées par la pratique ACT :
- Je ne suis pas assez · J'ai trop à faire · Je suis fatigué·e
- Tout va trop vite · J'ai peur · Je n'y arrive pas
- Tout le monde fait mieux · Je dois être parfait·e
- Personne ne me comprend · Demain sera pire
- Je devrais déjà avoir réussi · Je suis seul·e
- Ça ne changera jamais · J'ai honte · Je suis trop lent·e

Choix random de 5 → variété entre sessions.

---

## 5. Roadmap mini-jeux

### P1 — Livré ✅
- **Libération des pensées** (défusion cognitive)
- **Breathing 4 techniques** (déjà flagship)

### P2 — Prochains à coder
- **Apaisement sensoriel** (grounding 5-4-3-2-1)
  - 12 points lumineux dispersés
  - Drag d'une lueur sous le doigt → chaque point touché s'allume
  - Pas de séquence imposée, pas de chrono
  - Effect: ancrage corporel via toucher
- **Équilibre émotionnel** (balance)
  - Un point mobile à maintenir au centre d'un cercle
  - Inclinaison phone (DeviceOrientation) ou doigt (touch)
  - Le cercle pulse au rythme respiration suggérée
  - Effect: focus + coordination + mindful breathing
- **Concentration zen**
  - Un point doré qui se déplace lentement le long d'une courbe
  - Suivre du regard (pas du doigt) — auto-test
  - 60 secondes, transition douce
  - Effect: réduction surcharge cognitive

### P3 — Long terme
- **Réparation du cocon** (mosaïque émotionnelle)
  - Pièces de verre brisé à reconnecter
  - Chaque pièce porte un fragment de phrase poétique
  - Effect: sentiment de reconstruction
- **Méditation active**
  - Rythme tactile à suivre (tap au tempo respiration)
  - Visuel mandala qui se déploie
  - Effect: synchronisation corps-esprit
- **Culture intérieure**
  - Jardin qui pousse selon les habitudes (1 fleur par routine done)
  - Espèces rares débloquées via milestones
  - Effect: visualisation progression long terme

---

## 6. Récompenses émotionnelles (pas de pièces)

Tout passe par les **souvenirs** (déjà système v1).

| Mini-jeu | Souvenir débloqué |
|---|---|
| Libération 1ère fois | `first_liberation` ◍ |
| Libération chaque session | `liberation_session` (compteur silent) |
| Apaisement 1ère fois | `first_apaisement` (à ajouter P2) |
| Équilibre maintenu 30s | `first_balance` (à ajouter P2) |
| Concentration complète | `first_focus` (à ajouter P2) |

Aucun jeu ne donne XP. Le XP est réservé aux **routines** et au **breath** (les actes structurants). Les mini-jeux sont des outils **à la demande**, pas des to-do.

---

## 7. Évolution du monde via gameplay

Le **cocon réagit indirectement** :
- Plus de sessions de libération → vitalité augmente (mood_delta positif après défusion)
- Plus de souvenirs accumulés → ribbon plus dense
- Brume du cocon s'éclaircit naturellement quand l'utilisateur joue régulièrement

Pas de mécanique explicite "joue X fois pour débloquer Y". L'évolution est **organique**.

---

## 8. Game feel — détails techniques

### Touch feedback
- `data-press="true"` sur boutons CTA → scale 0.965 + spring release (déjà global)
- Haptic patterns différenciés par contexte :
  - 6 = micro confirmation (tap chip souvenir)
  - 8 = action douce (libération pensée)
  - [20, 80, 20, 80, 30] = completion session
  - [40, 80, 40, 80, 60] = milestone (3/7/14j)

### Motion organique
- Pensées dérivent en `cubic-bezier(0.45, 0, 0.55, 1)` (sine, jamais ease-in-out)
- Dissolutions en `cubic-bezier(0, 0, 0.2, 1)` (decelerate, naturel)
- Particules avec drop-shadow archétype pour halo lumineux

### Couleurs
- Pensées : `rgba(20,22,32,0.78)` (sombre, ce qui pèse)
- Particules libération : `arch.color` (lumière de l'archétype)
- Ambient glow : intensifie de 0.08 → 0.30 alpha selon progression

---

## 9. Architecture de rétention

NÉYA **ne pousse pas** à revenir. Mais elle **accueille bien** quand on revient.

- Pas de daily streak qui se brise → philosophie "grâce" déjà en place
- Pas de notification de jeu
- L'app rappelle uniquement avec poésie (futur : 1 push/jour, opt-in)
- Le souvenir reste, le cocon respire, l'archétype attend

Si l'utilisateur ouvre l'app après 7 jours → il trouve son cocon avec ses éclats, sa météo en brume (vitalité basse normale), aucun reproche.

---

## 10. Métriques (Posthog events)

| Event | Quand |
|---|---|
| `liberation_open` | Ouverture du mini-jeu |
| `liberation_thought_released` | Chaque tap réussi |
| `liberation_complete` | 5 pensées libérées |
| `liberation_quit` | Quitte avant complétion (pas un échec, juste data) |

Mesures :
- % users qui essayent ≥ 1× : cible > 40 %
- Sessions complètes / ouverture : cible > 75 %
- Temps moyen / session : cible 90-120s
- Mood self-report post-session (futur)

---

## 11. Sensation finale visée

> *« Quand je suis dépassé·e, j'ouvre NÉYA et je tape des pensées qui partent en lumière.*
> *Quand je suis figé·e, je trace une lueur sur des points qui s'allument doucement.*
> *Quand je suis épuisé·e, je respire avec le cercle qui s'élargit.*
> *Chacun de ces gestes est doux. Chacun me rend quelque chose.*
> *Je ne joue pas pour gagner. Je joue pour aller mieux. »*

C'est ça qu'on construit. **L'inverse exact d'un jeu mobile.**
