# NÉYA — Déploiement (procédure standard)

> Skill lazy-loaded. Invoquer chaque fois qu'on doit mettre en ligne une livraison.

## Quand utiliser

Dès qu'une livraison est prête (build clean local) et qu'on doit la pousser en prod.

## Procédure complète (à suivre dans l'ordre)

### 1. Build clean obligatoire

```bash
cd /Users/williammorel/NÉYA && npm run build 2>&1 | tail -8
```

Conditions de passage :
- Pas d'erreur
- Pas de warning bloquant (chunk size > 500KB est OK, c'est le warning normal)
- "✓ built in Xms" visible

Si KO : revenir en arrière, fixer, retenter.

### 2. Commit avec message structuré

Le message commit DOIT être passé via fichier (pas heredoc — apostrophes cassent bash) :

```bash
# Écrire le message dans /tmp/msg.txt via Write tool
# Puis :
git add -A && git commit -F /tmp/msg.txt 2>&1 | tail -3
```

Format du message commit :

```
feat(vX.Y): <résumé court 1 ligne — 50 chars max>

<paragraphe descriptif court : ce qui change pour Will>

<bullets techniques optionnels pour traçabilité>
- ...
- ...

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

Versions par convention :
- `feat(v4.X)` pour Cocon (sanctuaire vivant)
- `feat(v7.X)` pour ÇA VA?
- `feat(v8.X)` pour fondations système
- `fix(vX.Y)` pour bugs / nettoyage

### 3. Deploy Vercel prod

```bash
vercel --prod --yes 2>&1 | tail -6
```

Vérifie que la sortie contient `"readyState": "READY"` et `"target": "production"`.

### 4. Vérification HTTP

```bash
curl -sI https://neya-kappa.vercel.app | head -2
```

Doit retourner `HTTP/2 200`. Si autre code → blocker, investiguer.

### 5. Push GitHub

```bash
git push origin main 2>&1 | tail -3
```

### 6. Récap à Will

Message court en français simple, sans jargon dev. Format :
- 1 phrase qui dit ce qui change pour lui
- Le lien clickable : https://neya-kappa.vercel.app
- 2-3 puces concrètes max si nécessaire

## Anti-patterns

- ❌ Heredoc bash pour le message commit (apostrophes cassent l'EOF)
- ❌ `git commit --no-verify` ou `--no-gpg-sign` (sauf demande explicite Will)
- ❌ Force push sur main
- ❌ Jargon technique dans le récap user-facing
- ❌ Skip de la vérif HTTP 200
- ❌ Push avant que Vercel soit READY

## Notes

- Mode autonome autorisé : pas de validation intermédiaire requise pour les déploiements (cf. feedback_autonomous_mode dans memory)
- L'utilisateur préfère qu'on parle en français simple, pas dev (cf. feedback_parle_francais_simple)
