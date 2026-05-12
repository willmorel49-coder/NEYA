# NÉYA — Community System

> *Communauté silencieuse, anonyme, asynchrone. Aucun feed, aucun like, aucune réponse.*

---

## 1. Philosophie

NÉYA refuse les codes des réseaux sociaux classiques :
- ❌ Feed scrollable d'autres utilisateurs
- ❌ Likes / reactions / commentaires
- ❌ Threads de discussion
- ❌ Followers / suivis
- ❌ Profils visibles
- ❌ Notifications push d'activité d'autrui
- ❌ Classements / comparaisons
- ❌ Verification / badges sociaux

NÉYA propose **un seul mode de connexion** : la lettre anonyme à un·e inconnu·e. Inspiré directement de Kind Words mais avec une grammaire NÉYA.

> *« Un mot écrit dans le silence, qui voyage. Une lettre reçue, jamais demandée. Pas de fil. Pas de retour. Juste une présence partagée. »*

---

## 2. Mécaniques implémentées (P1, livré)

### Recevoir une lettre
1. User ouvre la modal → bouton "Recevoir une lettre"
2. Modal affiche une enveloppe ✉ + texte *"Une lettre est là. Tu peux choisir de la lire — ou pas."*
3. User tape "Ouvrir" → texte révélé en fadeIn 900ms
4. Signature anonyme par archétype : *"— un Cerf, mai"* / *"— un Phénix, mars"*
5. User tape "Refermer" → marque comme lue, return home
6. Premier reçu → souvenir `first_letter_received` ✉

### Écrire une lettre
1. User tape "Écrire une lettre"
2. Textarea 200 char max avec compteur
3. Placeholder : *"Ce que tu aurais aimé entendre un soir difficile..."*
4. Validation : *"Ta lettre voyagera vers quelqu'un que tu ne connaîtras jamais. Aucune réponse possible. C'est un geste, pas une conversation."*
5. Tape "Envoyer" → confirm "✦ Envoyée dans le silence" 2.4s
6. Premier envoi → souvenir `first_letter_sent` ✉

### Pulse collectif (présence)
- Card discrète sur HomeScreen + dans la modal Lettres
- "X autres {Phénix/Cerfs/Loups/Ours} ce soir"
- Pulse dot archétype-couleur en seedPulse 3.2s
- Period sensitive : *"ce matin / cet après-midi / ce soir / cette nuit"*

---

## 3. Architecture — backend-ready

### Module `src/community.js`

```js
// API contract (stub local → backend réel)
getNextLetter(archetype) → { id, text, signature, archetype }
markLetterReceived(letter)
sendLetter(text, archetype) → { id, ts, text }
getReceivedLetters() / getSentLetters() → array
getCollectiveCount(archetype) → integer
```

### Phase actuelle (P1) — MOCK localStorage
- 40 **seed letters** intégrées dans le code (textes réels, par archétype)
- `getNextLetter` retourne une lettre non lue (priorité archétype matchant)
- `sendLetter` → stocké en `neya_letters_sent` localement (jamais transmis)
- `getCollectiveCount` → sine wave time-of-day + seed déterministe par jour
  - Base par archétype : Phénix 64, Cerf 88, Loup 52, Ours 74
  - Max 21h-22h, min 4h-5h
  - ±10% jitter quotidien

### Phase backend (P2) — endpoints à implémenter

```
GET  /api/letter/random?archetype=X
  → { id, text, signature, archetype }
  Renvoie une lettre aléatoire dans le pool des envoyées non-encore-lues
  par cet utilisateur (deduplication par localStorage anonyme)

POST /api/letter
  body: { text, archetype }
  → { id, queued: true }
  Ajoute la lettre au pool. Modération automatique (filter + ML) + manuelle
  asynchrone avant publication.

GET  /api/pulse/:archetype
  → { count, lastUpdated }
  Compteur d'users actifs (sessions <15min) par archétype.
  Caché par minute pour limiter charge.
```

### Stack backend recommandé
- **Vercel Functions** (déjà sur la plateforme, gratuit jusqu'à 100GB/mois)
- **Vercel KV** (Redis-compat, free tier 256MB) pour pool de lettres + active count
- **Modération** :
  - Pré : regex/blacklist (insultes, URLs, identifiants)
  - Post : équipe humaine via dashboard simple (Notion/Airtable webhook)
  - Auto-flag par ML léger (OpenAI moderation API, free)

---

## 4. Sécurité éthique

| Risque | Mitigation |
|---|---|
| Contenu toxique / triggering | Modération pré-publication systématique. Pas de "publié direct" |
| Identification via texte | Stripping métadata + length limit 200 char + analyse anti-doxxing |
| Spam / vente / lien | Regex anti-URL + filtrage user agent +rate-limit 3 lettres/jour |
| Pression de répondre | **Pas de réponse possible architecturalement** — pas de UI, pas d'endpoint |
| Anxiété de la lettre reçue | Choix explicite "Ouvrir ou pas" + dismiss libre |
| FOMO compteur d'actifs | Pas de notification, pas de "X t'a écrit", just ambient |

---

## 5. Anti-patterns explicitement refusés

- ❌ Liste des lettres reçues / envoyées avec timestamps détaillés
- ❌ Recherche / filtre / tri des lettres
- ❌ Système de "remercier" la lettre
- ❌ Réponse différée même asynchrone
- ❌ "Auteur favori" / suivre quelqu'un même anonyme
- ❌ Compte de lettres reçues par les autres
- ❌ Trending letters / popular this week
- ❌ Push notif "tu as une lettre" (sauf opt-in explicite futur P2)

---

## 6. Roadmap

### P1 — Livré ✅
- 40 seed letters intégrées (10 par archétype)
- LettresInconnusModal 3 stages (home/receive/send)
- PulseCollectif sine-wave time-of-day
- Souvenirs first_letter_received/sent
- Card HomeScreen
- Mock backend localStorage

### P2 — Backend réel
- Vercel Function POST/GET endpoints
- Vercel KV pool de lettres
- Modération auto + manuelle (Airtable dashboard)
- Push notification opt-in 1 lettre/semaine
- Stats privées (combien de lettres dans le pool global)

### P3 — Long terme
- Lettres saisonnières (solstices, équinoxes)
- Lettre quotidienne curatée par l'équipe NÉYA
- Cercles archétype × région (sans identifier — juste matching)
- Voice notes anonymes (waveform visualisé, audio jamais transmis)

---

## 7. Métriques success

| KPI | Cible Q1 | Q2 |
|---|---|---|
| % users qui ouvrent au moins 1 lettre | 40% | 60% |
| Lettres reçues moyennes / user actif | 2/sem | 4/sem |
| Lettres envoyées moyennes / user actif | 0.5/sem | 1.2/sem |
| Pool actif > 200 lettres | n/a | OUI |
| Modération rejection rate | < 8% | < 5% |
| Temps lecture moyen une lettre | > 12s (lit vraiment) | > 18s |

---

## 8. Sensation visée

> *« Je suis seul·e dans ma chambre.*
> *Je touche une icône.*
> *Quelqu'un, ailleurs, hier ou avant-hier, a écrit ces mots pour quelqu'un qu'il ne connaît pas.*
> *Aujourd'hui, c'est moi qui les lis.*
> *Personne ne saura que je les ai lus.*
> *Personne ne me demandera de remercier.*
> *Je peux les garder. Ou les laisser partir.*
>
> *Et plus tard, peut-être, je vais écrire quelque chose.*
> *Pour quelqu'un que je ne connaîtrai jamais.*
> *C'est doux. C'est juste. C'est NÉYA. »*

---

## 9. Pourquoi c'est révolutionnaire

Tous les réseaux sociaux ont un même biais : **ils transforment l'attention en marchandise**. Likes, follows, vues, engagement metrics — tout est conçu pour maximiser le temps utilisateur.

NÉYA Lettres inverse ce paradigme :
- **Aucune métrique sociale visible**
- **Aucune incitation à revenir** liée au contenu d'autrui
- **Aucun engagement loop** (pas de réponse → pas de back-and-forth → pas d'addiction)
- **Aucune comparaison possible** (anonyme + pas de scores)

C'est une communauté qui existe **par l'acte de tendresse, pas par la performance sociale**. Inspiré de Sky: Children of the Light + Kind Words + le concept de message dans une bouteille, adapté à un contexte santé mentale.

**C'est le seul format de communauté qui ne nuise pas.**
