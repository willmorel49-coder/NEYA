# NÉYA — Inner World System

> Système d'attachement émotionnel : cocon vivant, souvenirs, ambiance temporelle.
> Philosophie : « Cet univers me comprend. Cet espace est à moi. »

---

## 1. Architecture

```
src/inner-world.js
  ├── getTimeAmbience()   → { period, primary, secondary, particleOp, rhythm }
  ├── getCoconVitality()  → 0-1 selon activité récente (7j)
  ├── addSouvenir(type)   → ajoute si pas déjà collecté (one-shot par type)
  ├── getSouvenirs()      → array trié chronologique, max 30
  ├── SOUVENIR_LIBRARY    → 20 souvenirs nommables (glyph + titre + sous-titre)
  └── formatSouvenirDate  → "12 mai" en français
```

Tout en localStorage. Aucun backend, aucune fuite de données personnelles.

---

## 2. Ambiance temporelle — 4 périodes

| Période | Heures | Tint primaire | Sous-titre |
|---|---|---|---|
| **dawn** | 5h-9h | orange pêche très doux | "à l'aube" |
| **day** | 9h-17h | lumière blanche claire | "en pleine clarté" |
| **dusk** | 17h-21h | magenta doux | "au crépuscule" |
| **night** | 21h-5h | indigo profond | "sous la nuit" |

Effets dans le cocon :
- Gradient radial coloré (top pour dawn/day/dusk, bottom pour night)
- Layer secondaire en linear-gradient
- Particules opacity ajustée (0.08 day → 0.14 night)
- **`rhythm` multiplicateur** : animations 0.88-1.0× → night plus lent, day rythme normal
- Période affichée sous "Mon Espace" en header

Transition : `background 1.8s cubic-bezier ambient` sur le primaire — quand l'heure bascule, le cocon glisse de couleur.

---

## 3. Vitalité du monde — 0 à 1

Formule pondérée :
- **35 %** sessions de breath récentes (7j) — max 6/sem
- **45 %** jours actifs (1+ routine) sur 7j
- **20 %** mood delta moyen sur 10 dernières sessions

Effets cocon :
- **Particules supplémentaires** : 6 lumières flottantes apparaissent uniquement si vitalité > 0.5
- Bottom gradient archétype intensité 0.04 → 0.10 selon vitalité
- **NeyaGirl rythme respiratoire** : `animalfloat 22-25s` + `animalbreathe 28-56s`, opacité 0.7-0.95
  - Vitalité basse = personnage plus calme, plus lent, plus discret
  - Vitalité haute = personnage qui respire pleinement, plus présent

L'utilisateur ne voit pas le calcul. Il sent que son cocon respire ou se recueille selon son rythme.

---

## 4. Souvenirs — Éclats collectibles

### Philosophie
**Pas des achievements. Des moments.** Aucun compteur, aucun score, aucune comparaison. Juste des éclats que l'utilisateur a vécus, conservés visuellement comme une petite constellation personnelle.

### Bibliothèque (20 types — one-shot par type)

| Type | Glyph | Titre | Sous-titre |
|---|---|---|---|
| `first_visit` | ◈ | Première venue | Tu as poussé la porte. |
| `first_cocon` | ◎ | Ton premier cocon | L'espace t'a accueilli·e. |
| `first_breath` | ◇ | Ton premier souffle | Une respiration intentionnelle. |
| `first_mood_lift` | ✦ | Premier mieux-être | Le souffle a allégé quelque chose. |
| `first_routine` | ◊ | Première routine | Un geste posé pour toi. |
| `first_quete` | ✧ | Première quête | Tu es allé·e plus loin. |
| `first_espace_vrai` | ◯ | Premier Espace Vrai | Tu es resté·e dans la présence. |
| `archetype_revealed` | ◈ | Ton archétype révélé | |
| `milestone_3/7/14/30/60/100` | ✦ | 3 jours d'affilée → 100 jours | … de palier à palier |
| `item_bougie/cristal/plante/totem/portail` | ⊙⟁⚘◈◉ | La X t'a rejoint·e | Élément placé |
| `world_unlock` | ◌ | Un nouveau monde | Ton univers s'élargit. |

### Triggers automatiques (10 points wiré)

| Event | Souvenir |
|---|---|
| 1er `app_open` | `first_visit` |
| `saveProfile(arch)` (fin du quiz) | `archetype_revealed` |
| 1ère ouverture CoconScreen | `first_cocon` |
| `togglePlaced(item, true)` → add | `item_<id>` |
| `breath_complete` (BreathingModal outro) | `first_breath` + `first_mood_lift` si Δ>0 |
| 1ère routine cochée | `first_routine` |
| 1ère quête complétée | `first_quete` |
| EspaceVrai session ≥18s (qualified) | `first_espace_vrai` |
| Streak crosse J3/J7/J14/J30/J60/J100 | `milestone_<N>` |
| WorldUnlockModal `onClose` | `world_unlock` |

Anti-doublon : tous les types `first_*`, `milestone_*`, `item_*`, `archetype_revealed` ne s'enregistrent qu'**une seule fois** dans la vie du compte (vérification list avant insert). Liste rotation max 30.

### Rendu CoconScreen — "Ribbon des éclats"

Ribbon horizontale en haut du contenu scrollable. Cache si zero souvenir.
- Eyebrow "◈ Tes éclats"
- Chips de 44×44 avec glyph 18px + halo + signaturePulse 10-22s
- Titre du souvenir + date courte ("12 mai") sous chaque
- Animation entrée : `chipPop` 480ms spring stagger 70ms entre items
- Scroll horizontal si > 6 souvenirs

### Rendu HomeScreen — "Hint des éclats"

Sous la card "Mon Cocon Néya" : 3 mini-cercles 18×18 avec glyphes + label "tes éclats" italique. Apparaît dès le premier souvenir collecté. Discret — c'est un teaser qui invite à ouvrir le cocon.

---

## 5. Boucles émotionnelles

### Boucle quotidienne
1. User ouvre l'app le matin → cocon en **dawn** (orange doux)
2. Fait sa routine → premier `first_routine` éclat collecté
3. Voit son éclat sur HomeScreen → tap Cocon
4. Ribbon souvenirs visible → contemplation
5. Sort sa routine du soir → cocon en **dusk** (magenta)
6. Met une bougie → `item_bougie` éclat

### Boucle hebdomadaire
1. J3 → MilestoneCelebration + `milestone_3` éclat
2. J7 → "Une semaine entière" + `milestone_7`
3. Cocon montre 3-4 éclats accumulés
4. **Sensation : "j'ai construit quelque chose ici"**

### Boucle d'identité
1. Quiz → archétype révélé → `archetype_revealed` éclat
2. Premier breath → mood delta +2 → `first_mood_lift` éclat
3. Premier EspaceVrai 18s → `first_espace_vrai` éclat
4. **Le cocon devient un livre vivant des moments significatifs**

---

## 6. Anti-patterns refusés

- ❌ Compteur de souvenirs (genre "12/20") — c'est pas un Pokédex
- ❌ Pourcentage de complétion — pas de pression
- ❌ Notifications "il te manque X souvenirs" — JAMAIS
- ❌ Partage de la liste de souvenirs (intime)
- ❌ Comparaison entre utilisateurs (philosophie non-toxique)
- ❌ Achat de souvenirs cosmétiques — ils sont gagnés par présence
- ❌ Animation de "Nouveau souvenir débloqué !" agressive — le ribbon le révèle, c'est tout

---

## 7. Évolution émotionnelle du personnage

NeyaGirl ne parle pas. Elle ne sourit pas (elle est de dos). Mais :
- Sa **respiration** suit la vitalité (lent si peu actif, ample si vivant)
- Son **opacité** module entre 0.70 et 0.95 selon vitalité
- Sa **présence** est plus discrète à basse vitalité, plus claire à haute

C'est un personnage **contemplatif** — pas expressif. Cohérent avec la philosophie NÉYA.

---

## 8. Roadmap d'évolution du monde

### P1 — déjà livré ✅
- 4 ambiances temporelles
- Vitalité 0-1 + particules conditionnelles
- 20 types de souvenirs + 10 triggers automatiques
- Ribbon Cocon + hint HomeScreen
- NeyaGirl rythme respiratoire dynamique
- Période affichée dans header Cocon

### P2 — Futur proche
- **Météo intérieure** : pluie douce / brume / lueurs selon vitalité (effets supplémentaires en plus des particules)
- **Souvenir détail modal** : tap un éclat → ouvre un fragment textuel ("Le 12 mai, tu as posé ta première bougie. Il faisait crépuscule.")
- **Cocon nameable depuis Cocon** (bouton ✎ direct, pas seulement Personalize)
- **Carnet du Voyage** : écrire à côté de chaque souvenir une phrase personnelle
- **Saisonnalité** : automne plus doré, hiver plus bleu, été plus clair

### P3 — Long terme
- **Ambient sounds** : Web Audio API ambiance subtile selon période (matin = oiseaux lointains, nuit = vent doux). Toggle off par défaut.
- **Cocon photographie** : capture screenshot du cocon comme polaroïd à conserver
- **Visitors** : créatures paisibles qui apparaissent rarement (étoile filante de nuit, papillon de jour)
- **Annual ritual** : 21 décembre solstice → un éclat spécial "solstice" temporaire qui n'apparaît qu'1 fois/an

---

## 9. Métriques d'attachement

| Cible | Mesure |
|---|---|
| % users qui ouvrent le Cocon au moins 1× | > 70 % |
| Moyenne souvenirs collectés en J30 | > 8 |
| % users qui placent ≥ 3 items du cocon | > 50 % |
| Temps moyen passé dans le cocon | > 30 s |
| Re-visites du cocon (sessions > 1) | tracking via Posthog `cocon_open` |

Note : ces métriques **ne sont pas montrées à l'utilisateur**. Elles servent uniquement à valider le produit côté Will/équipe.

---

## 10. Sensation finale visée

> *"Je ne joue pas. Je rentre chez moi.*
> *Mes éclats sont là, doucement éclairés.*
> *Cet endroit me connaît.*
> *Il a vu mon J3, mon premier souffle, ma première venue.*
> *Et il est exactement comme je veux qu'il soit, sans rien changer."*

C'est ça qu'on construit. Pas une app. Un refuge avec mémoire.
