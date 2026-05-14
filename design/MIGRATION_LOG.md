# NÉYA — Tokens Migration Log

> Trace des migrations effectuées depuis la création des tokens (`design/tokens.css` v1 · 2026-05-14). Document vivant. Chaque entrée = un commit ou un changement structurel.

---

## V1.0 — Fondations posées (2026-05-14)

### Décisions structurantes

1. **Cream ivoire `#EFE9DC` (oklch 0.94 0.020 90) = `--text-primary` partout**, NÉYA + ÇA VA?. Fin du blanc transparent `rgba(255,255,255,0.X)`.
2. **4 accents émotionnels remplacent les 4 archétypes-couleurs.** `--accent-spirit` (cyan signature) / `--accent-sacred` (or animal totem) / `--accent-introspection` (lavande) / `--accent-grounding` (vert forêt). Les archétypes existants seront mappés dessus, pas l'inverse.
3. **3 tokens lumière (`--light-inner`, `--light-sacred`, `--light-veil`)** plutôt que d'enrichir les couleurs. Le sujet NÉYA est la lumière, pas la teinte.
4. **6 tailles typo, ratio 1.250.** Zéro demi-point. Remplace les 36 tailles actuelles.
5. **Extension ÇA VA? avec 6 tokens propres** (palette officielle moodboard 2026-05-14). Cohabite avec NÉYA, ne fusionne pas. Le `--cava-mist-blue` est le pont chromatique.

### Migrations effectuées

| # | Action | Fichier | Statut |
|---|---|---|---|
| 1 | `tokens.css` créé avec 26 tokens NÉYA + 8 tokens ÇA VA? | `design/tokens.css` | ✅ |
| 2 | Copie `design/tokens.css` → `src/tokens.css` (pour bundling Vite) | `src/tokens.css` | ✅ |
| 3 | Import global dans `main.jsx` | `src/main.jsx` | ✅ |
| 4 | `BoutiqueScreen` : palette CAVA corrigée (3 hex faux → 7 hex officiels) | `src/App.jsx:5436-5443` | ✅ |
| 5 | `BoutiqueScreen` : manifeste officiel intégré (« Nous existons pour briser le masque ») | `src/App.jsx:5473-5484` | ✅ |

### Migrations différées (V1.1)

| Domaine | Estimation | Priorité |
|---|---|---|
| Remplacement `#050810` (~80 occurrences) → `var(--surface-void)` ou `var(--surface-base)` | 2h | P0 |
| Remplacement `rgba(255,255,255,0.X)` body text (~120 occurrences) → `var(--text-primary/secondary/whisper)` | 3h | P0 |
| Remplacement `arch.color` archétypes → mapping `--accent-*` | 4h | P1 |
| Refonte 36 `fontSize` distincts → 6 tokens `--text-*` (semi-auto via regex) | 2h | P1 |
| Suppression 225 `textShadow` redondants (compensaient le mauvais contraste) | 1h | P2 |
| Remplacement `boxShadow` ad-hoc → variables élévation | 2h | P2 |
| Migration Inter → Geist ou Söhne (327 occurrences) | 1h | P3 |

**Estimation totale migration complète : 15-20h.** À faire par sprints ciblés, pas en bloc.

### Notes techniques

- Les tokens sont exposés via `:root` dans `src/tokens.css`, importés au boot. Disponibles globalement via `var(--*)` dans les inline styles React.
- `oklch()` supporté nativement Safari 16.4+ et Chrome 111+. Fallback hex en commentaire dans `tokens.css` pour debug.
- ÇA VA? typo `Garet` et `I Eat Crayons` déclarées mais **non chargées encore**. Ajout `<link>` Google Fonts ou self-host à prévoir.
- Les constantes JS `CREAM/OCRE/STONE/MUSTARD/EMERALD/SAGE/MIST` dans `BoutiqueScreen` reflètent la palette CAVA mais sont en hex. À migrer vers `getComputedStyle(document.documentElement).getPropertyValue('--cava-*')` pour la source de vérité unique.

### Risques connus

- Le `oklch()` n'est pas supporté Safari 16.3-. Si l'audience contient des iOS bloqués sur iOS 16.3 ou avant, prévoir un build avec PostCSS oklch-fallback.
- L'audit a identifié **5 niveaux de texte qui fail WCAG** (`rgba(255,255,255,0.32)` etc.). La migration P0 doit les corriger en premier.
- Les archétypes (`resilience`, `presence`, `sagesse`, `lumiere`) ont des couleurs identitaires fortes (`#f59e0b` etc.). Le remapping vers `--accent-*` peut être perçu comme une perte d'identité par les utilisateurs récurrents. Stratégie de migration progressive : conserver les couleurs archétype mais les utiliser uniquement pour les halos/glows (jamais pour le texte body).

---

**État final V1.0** : tokens en place, importés, BoutiqueScreen migré (palette + manifeste). Le reste de l'app utilise toujours les anciens hex inline — fonctionne mais désynchronisé. La migration App.jsx complète est un travail séparé, à planifier par vagues.
