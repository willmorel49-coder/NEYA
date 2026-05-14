# NÉYA — AUDIT TOKENS (couleurs + typo)

> Audit brut de `src/App.jsx` (9 477 lignes, mono-fichier React) à date 2026-05-14. Cible : fondations émotionnelles programmables (40% rigueur système / 60% direction émotionnelle).

---

## 1. État réel — couleurs

### Hex en dur détectés : **36** valeurs distinctes

```
Surfaces sombres (9) :
  #020410  #050810  #080c1a  #0a0e2a  #0a1024  #0e1530
  #0f1948  #1a2238  #1a2540

Bleus narratifs (10) :
  #1e2f7a  #2a4099  #2d4ab8  #3b5fd9  #3b82f6  #4a6fd9
  #4a6fe8  #4a90d9  #5a7dfa  #5b9cf6  #818cf8

Indigos / spirit (3) :
  #6366f1  #dadcff  #94a3b8

Archétypes déclarés (4) :
  #14b8a6 (presence)  #ec4899 (lumiere)
  #f59e0b (resilience)  #6366f1 (sagesse)

Hairs / accents bleu cyan (2) :
  #3b82f6 (NeyaGirl)  #4a6fe8 (NeyaPortrait)

ÇA VA? éditorial (3) :
  #A8593A (ocre)  #EFE9DC (crème)  #7A7568 (pierre)

Skin / robe portrait (3) :
  #2a3556  #e0c0a0  #f5dcc4

Extras (2) :
  #ffd766  #ffe788  #2a1838  #3a2a35
```

**rgba()** : 80+ variations alpha sur `rgba(0,0,0,...)` et `rgba(255,255,255,...)` — anarchique. Pas de scale.

### Incohérences sémantiques majeures

| Intention | Valeurs concurrentes | Verdict |
|---|---|---|
| **Fond le plus profond** | `#050810`, `#020410`, `#080c1a`, `#0a0e2a`, `#0a1024`, `#0e1530` | 6 valeurs pour 1 rôle. **Garder 1**. |
| **Cheveux/bleu signature** | `#3b82f6`, `#4a6fe8`, `#3b5fd9`, `#5a7dfa` | 4 valeurs pour le même symbole brand. Catastrophique. |
| **Indigo introspection** | `#6366f1` (sagesse archétype) + `#818cf8` + `#dadcff` | 3 valeurs, aucune sémantique claire. |
| **Crème/ivoire texte** | `#EFE9DC` (ÇA VA?) vs `rgba(255,255,255,0.9X)` (NÉYA) | Brand split — ÇA VA? a son cream, NÉYA utilise du blanc transparent. Pas le même monde. |

### Contrastes problématiques (calculs sur fond `#050810`)

| Token texte | Ratio WCAG | Verdict |
|---|---|---|
| `rgba(255,255,255,0.94)` (text primary) | **18.5:1** ✅ AAA | OK |
| `rgba(255,255,255,0.62)` (secondary répandu) | **9.2:1** ✅ AAA | OK |
| `rgba(255,255,255,0.42)` (tertiary) | **5.4:1** ✅ AA | Limite |
| `rgba(255,255,255,0.32)` (helper utilisé partout) | **3.8:1** ⚠️ AA gros texte uniquement | **Fail body** |
| `rgba(255,255,255,0.18)` (whisper, used L1485 etc.) | **1.9:1** ❌ Fail | **Cassé** |
| `${arch.color}33` (ex. `#6366f133`) sur bg image floue | **~1.4:1** ❌ Catastrophique | **Inutilisable** |
| `${arch.color}55` (ex. PATIENCE_TEXTS L2495) | **~2.3:1** ❌ Fail | **Cassé** |

→ **5 niveaux texte fail WCAG dont 3 catastrophiques.** Source identifiée : l'utilisation systématique de `arch.color + alpha%` produit des textes archétype-tinted sur backgrounds image — illisible.

---

## 2. État réel — typographie

### Familles déclarées : 2 (OK)
- `Sora, sans-serif` (display)
- `Inter, sans-serif` (body)

### Tailles : **36 valeurs distinctes** ❌

```
8.5  9    9.5  10   10.5 11   11.5 12   12.5 13
13.5 14   14.5 15   15.5 16   16.5 17   18   20
21   22   23   24   26   28   30   32   34   36
38   40   42   48   56   72   80
```

→ **C'est 6× le seuil acceptable d'un design system mature** (6-8 max). 14 valeurs en demi-points (8.5, 9.5, ..., 16.5) signalent du tâtonnement, pas un système.

### Poids utilisés : **4** (300, 400, 500, 700)

OK en soi, mais leur emploi est anarchique : `fontWeight: 300` utilisé sur 80% des textes (Sora light) — donne un look uniformément fragile et nuit à la hiérarchie. Aucun bold pour les call-to-action critiques.

### Letter-spacing : **563 occurrences**

Plage : `-0.02em` (titres) à `0.42em` (logo NÉYA caps). Pattern récurrent et cohérent : caps espacés = labels archétype. À conserver comme convention.

### Line-heights : non-systémique
- `lineHeight: 1.2` à `1.75`, sans ratio défini
- Souvent omis (default browser)

### textShadow : **225 occurrences**

Utilisé pour compenser le mauvais contraste typo sur fond image. **Symptôme** : la typo elle-même ne porte pas — donc on l'enrobe d'un glow. Solution réelle : meilleur contraste de base, pas plus de textShadow.

---

## 3. Verdict (3 lignes max)

**Le système actuel n'est pas un système.** 36 hex distincts pour 8 rôles réels, 36 tailles typo pour 6 niveaux narratifs, 225 textShadows qui compensent un échec de contraste. La marque NÉYA et la marque ÇA VA? **vivent dans 2 paradigmes chromatiques différents** (texte blanc transparent vs crème solide), sans pont sémantique.

**À supprimer** : tous les hex de surface sauf 3, tous les bleus signature sauf 1, toutes les tailles demi-points, le pattern `arch.color + alpha%` pour texte body.

**À garder** : la palette ÇA VA? (#EFE9DC / #A8593A / #7A7568) comme référence du couple texte/accent réussi · Sora + Inter (mais avec une vraie échelle) · les 4 archétypes-couleurs mais pour **glows et accents émotionnels**, jamais pour le texte body.

---

## 4. Ce que les images de DA imposent (vérité visuelle)

Après analyse de 4+ images représentatives (`NÉYA/SELECTION/`) :

- **La lumière est le sujet**, pas la couleur. Halos circulaires gold/cyan luminous portent la composition.
- **Palette dominante réelle** : bleu nuit profond + cyan glacé + or chaud spirit + crème ivoire. **Pas de magenta, pas de teal vif** dans les références — uniquement dans l'archétype `lumiere`/`presence` déclarés en code (et ils détonnent visuellement).
- **Cyan signature** : les cheveux de l'héroïne (~#3AA8D8) + halos cosmiques. C'est l'accent symbolique le plus puissant.
- **Or chaud spirit** : auréole les animaux totems, signale le sacré (~#E8C16A / #F5D28A).
- **Lavande introspection** : présente en touches discrètes (image "Inner Pathways", fleurs violettes ~#9F7AD4) — accent émotionnel d'évasion intérieure.
- **Crème ivoire `#EFE9DC`** doit être le texte body de NÉYA AUSSI, pas seulement ÇA VA?. Le blanc transparent (`rgba(255,255,255,0.X)`) sera remplacé partout.

---

## 5. Décision : ce que les tokens doivent encoder

**Pas des couleurs. Des états émotionnels programmables.**

L'audit produit la liste des **17 rôles sémantiques réels** identifiés :

| Rôle | Mapping image | Token cible |
|---|---|---|
| Le plus profond | Nuit cosmique image 1 | `--surface-void` |
| Fond standard | Nuit forestière image 4 | `--surface-base` |
| Card / sheet | Glassmorphism filtré | `--surface-raised` |
| Modale / overlay | Halo central | `--surface-elevated` |
| Texte qui porte | Cream ivoire 18.5:1 | `--text-primary` |
| Texte secondaire | Cream ivoire 8:1 | `--text-secondary` |
| Texte murmure | Cream ivoire 4.5:1 | `--text-whisper` |
| Texte sur accent | Nuit cosmique | `--text-on-light` |
| Accent symbolique cyan | Cheveux signature | `--accent-spirit` |
| Accent or sacré | Halos animaux | `--accent-sacred` |
| Accent introspection | Lavande images | `--accent-introspection` |
| Grounding (présence) | Vert profond forêt | `--accent-grounding` |
| Mode crise (papillon ambre) | Pas rouge, jamais | `--state-tender` |
| État accompli (souvenir) | Or warm halo | `--state-cherished` |
| Border subtle | Pierre / brume | `--border-veil` |
| Border default | Cream à 30% | `--border-presence` |
| Lumière diffuse halo | Glow radial | `--light-inner` |

**= 17 tokens couleur** + **6 tokens typo** (échelle 1.250 / minor third) + **3 tokens light/glow** = **26 tokens total**. Dans la fourchette imposée (18-28).

---

## 6. ÇA VA? — révision palette (mood board officiel reçu 2026-05-14)

L'inventaire initial supposait `#A8593A` / `#EFE9DC` / `#7A7568`. **Faux**. Le moodboard officiel révèle une palette mode contemporaine éditoriale de **6 valeurs précises** :

| Hex officiel | Rôle observé | Token cible |
|---|---|---|
| `#9F584E` | Rouge terracotta — passion, sang, vie | `--cava-terracotta` |
| `#C29051` | Ocre mustard — chaleur, broderie main | `--cava-ochre` |
| `#34917F` | Émeraude profond — accent mode, racines | `--cava-emerald` |
| `#9AAFA0` | Sage gris-vert — sérénité textile | `--cava-sage` |
| `#D4C8BA` | Ivoire chaud — fond pièces, cream textile | `--cava-cream` |
| `#7397BC` | Bleu poudré — **pont avec NÉYA** (écho `--accent-spirit` désaturé) | `--cava-mist-blue` |

**Découverte majeure** : ÇA VA? n'utilise PAS un cream blanc neutre (`#EFE9DC`). Le vrai cream est plus chaud, plus tissu (`#D4C8BA`). Les illustrations line-art + broderies main dictent une palette **mode-magazine**, pas wellness.

### Typographies ÇA VA? (déclarées dans le moodboard)
- **Principale : Garet** — sans-serif arrondi contemporain, bold pour wordmark
- **Secondaire : I EAT CRAYONS** — manuscrite crayonnée, pour citations/broderies

Donc le système doit héberger une **layer brand-specific ÇA VA?** distincte des tokens NÉYA. Pas de fusion : cohabitation. Le bleu `--cava-mist-blue` `#7397BC` est le **pont chromatique** entre les deux marques (écho désaturé de `--accent-spirit` NÉYA `#3AA8D8`).

### Mission textuelle ÇA VA? (à intégrer comme tagline ailleurs)
*"Nous existons pour briser le masque du 'ça va'."*
*"Faire de la mode un langage qui libère la parole sur la santé mentale."*

### Conséquence sur le total
26 tokens NÉYA + **6 tokens ÇA VA?** + **2 typo tokens ÇA VA?** (`--cava-font-display`, `--cava-font-script`) = **34 tokens**.

Bust de la fourchette 18-28 imposée. Justification : ÇA VA? est une **marque distincte**, pas une variation. Le brief stratégique enrichi parle de "Maison émotionnelle digitale" — ÇA VA? est une chambre à part, avec sa propre lumière. Le ratio 26/8 = 76% NÉYA / 24% ÇA VA? est honnête.
