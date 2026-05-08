# Lessons — NÉYA

> Format daté inline (Format B). Une ligne par lesson.
> `[YYYY-MM-DD] | Erreur : ... | Règle : ...`

[2026-05-08] | Erreur : vite.config.js avec `base: '/NEYA/'` causait écran noir sur Vercel (assets chargés depuis /NEYA/assets/ inexistant) | Règle : sur Vercel, ne pas setter `base` dans vite.config — laisser la valeur par défaut `/`

[2026-05-08] | Erreur : `animalbreathe` (filter: brightness) + inline `filter: drop-shadow(...)` sur même élément = conflit CSS | Règle : sur les petits animaux avec drop-shadow inline (HomeScreen size 74), utiliser `animalfloat` seul sans `animalbreathe`

[2026-05-08] | Erreur : `animation` shorthand avec template literal et `animationDelay` séparé = les deux propriétés coexistent | Règle : préférer les deux propriétés séparées (`animation` + `animationDelay`) plutôt que tout dans le shorthand quand le délai est dynamique

[2026-05-08] | Erreur : TransitionScreen affichait `SpiritAnimal archetype="presence"` hardcodé pour tous les utilisateurs | Règle : toujours utiliser `archetypeKey` (prop) dans TransitionScreen — la prop est disponible depuis App.jsx

[2026-05-08] | Erreur : div wrapper supplémentaire autour du ring HomeScreen sans closing tag = JSX malformé silencieux | Règle : quand on wraps un élément dans un div supplémentaire, vérifier immédiatement le count de closing tags avant de build
