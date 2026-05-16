---
description: Écrit/met à jour SAVEPOINT.md à la racine du projet NÉYA avec l'état courant (commit HEAD, dernière action, prochains pas, URL prod). Permet reprise instantanée à la session suivante.
---

# /savepoint — État du projet en 1 commande

## Tâche

Lis l'état courant du repo NÉYA et écris/mets à jour `/Users/williammorel/NÉYA/SAVEPOINT.md` avec :

1. **Date & commit HEAD** — `git log -1 --pretty=format:'%h · %s'` + date du jour
2. **URL prod** — https://neya-kappa.vercel.app (HTTP status check)
3. **Dernière action** — résumé 1 ligne de ce qui vient d'être livré dans la session
4. **État Aventure / Cocon / Communauté / CaVa** — version courante de chaque onglet (1 ligne par tab)
5. **Fondations** — version courante des tokens, primitives partagées (Dialog, Sheet…), workflows Claude
6. **Backlog priorisé** — 3-5 prochains pas concrets en bullet, ordonnés par ROI
7. **Décisions en attente** — questions ouvertes nécessitant Will

## Format

```markdown
# SAVEPOINT — NÉYA

**Date** : YYYY-MM-DD
**Commit HEAD** : `<short-sha>` · <message>
**Prod** : https://neya-kappa.vercel.app · [HTTP 200 | ERREUR]

## Dernière action
<1-2 lignes>

## État des onglets
- **Aventure** — V<X>
- **Cocon** — V<X>
- **Communauté** — V<X>
- **ça va ♡** — V<X>

## Fondations
- tokens.css — <statut>
- Dialog primitive — <oui/non>
- ...

## Backlog priorisé
1. <action concrète>
2. ...

## Décisions en attente
- <question>
```

## Procédure

1. `cd /Users/williammorel/NÉYA && git log -1 --pretty=format:'%h · %s'` pour le HEAD
2. `curl -sI https://neya-kappa.vercel.app | head -1` pour vérif prod
3. Relire le SAVEPOINT.md précédent (s'il existe) pour comprendre l'état précédent
4. Mettre à jour avec un diff minimal — ne pas réécrire ce qui n'a pas changé
5. Écrire le fichier

## Quand utiliser

- À la fin d'une session de travail substantielle
- Avant un commit important ("savepoint avant refacto X")
- Quand Will demande "où on en est ?"
- À chaque déploiement prod

Ne pas créer un nouveau commit pour cette mise à jour seule, sauf demande explicite.
