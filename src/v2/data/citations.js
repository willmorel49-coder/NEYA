/* ============================================================
   ÇA VA? — Base de citations (48 entrées taggées par état)
   ============================================================
   Source : marque ÇA VA? (vêtements + manifeste) + littérature.
   Tags d'état : 'calme' | 'tendre' | 'introspectif' | 'fatigue' | 'orage'
   Mapping couleur étoile → tag prioritaire :
     bleu   → calme
     rose   → tendre
     violet → introspectif
     peche  → fatigue
     orage  → orage
   ============================================================ */

export const CITATIONS = [
  // ── Marque ÇA VA? (vêtements) ──
  { id: 1,  text: "Ma sensibilité est mon super-pouvoir.",                                                              author: null,             tags: ["tendre", "rose"] },
  { id: 2,  text: "Mon anxiété est mon super-pouvoir.",                                                                  author: null,             tags: ["orage", "violet"] },
  { id: 3,  text: "Mon anxiété n'est pas une faiblesse, c'est une cicatrice vivante.",                                  author: null,             tags: ["introspectif", "orage"] },
  { id: 4,  text: "Chaque pas est une victoire.",                                                                         author: null,             tags: ["fatigue", "calme"] },
  { id: 5,  text: "Je combats en silence.",                                                                               author: null,             tags: ["orage", "introspectif"] },
  { id: 6,  text: "J'ai eu le courage de demander de l'aide.",                                                            author: null,             tags: ["tendre", "calme"] },
  { id: 7,  text: "Le soleil reviendra, je le sais.",                                                                     author: null,             tags: ["fatigue", "calme"] },
  { id: 8,  text: "Fatigué d'être fatigué.",                                                                              author: null,             tags: ["fatigue", "orage"] },
  { id: 9,  text: "Pourquoi tu forces un sourire ?",                                                                      author: null,             tags: ["introspectif", "fatigue"] },
  { id: 10, text: "J'ai plus la banane, mais je souris quand même.",                                                      author: null,             tags: ["fatigue", "tendre"] },
  { id: 11, text: "J'garde la pêche en public, je craque en silence.",                                                    author: null,             tags: ["orage", "introspectif"] },
  { id: 12, text: "Le monde avance trop vite pour moi.",                                                                  author: null,             tags: ["fatigue", "introspectif"] },
  { id: 13, text: "Prenez soin de vous.",                                                                                 author: null,             tags: ["tendre", "calme"] },

  // ── Manifeste ÇA VA? ──
  { id: 14, text: "Nous existons pour briser le masque du ça va.",                                                        author: "ÇA VA?",         tags: ["introspectif"] },
  { id: 15, text: "Faire de la mode un langage qui libère la parole sur la santé mentale.",                               author: "ÇA VA?",         tags: ["calme"] },
  { id: 16, text: "« ça va » — la phrase la plus mensongère du monde.",                                                   author: "ÇA VA?",         tags: ["introspectif"] },
  { id: 17, text: "Tu n'es pas seul·e.",                                                                                  author: "ÇA VA?",         tags: ["tendre", "orage"] },
  { id: 18, text: "T'as pas besoin d'aller bien pour commencer.",                                                         author: "ÇA VA?",         tags: ["fatigue", "tendre"] },

  // ── Littérature ──
  { id: 19, text: "Au milieu de l'hiver, j'apprenais enfin qu'il y avait en moi un été invincible.",                      author: "Albert Camus",   tags: ["orage", "introspectif"] },
  { id: 20, text: "L'anxiété est une bête irrationnelle.",                                                                author: "Matt Haig",      tags: ["orage", "violet"] },
  { id: 21, text: "Même si le bonheur vous oublie un peu, ne l'oubliez jamais complètement.",                             author: "Jacques Prévert",tags: ["fatigue", "introspectif"] },
  { id: 22, text: "Le courage n'est pas l'absence de peur, mais la capacité de la vaincre.",                              author: "Nelson Mandela", tags: ["orage", "calme"] },
  { id: 23, text: "On ne voit bien qu'avec le cœur.",                                                                     author: "Saint-Exupéry",  tags: ["tendre", "introspectif"] },
  { id: 24, text: "Le bonheur, c'est de continuer à désirer ce que l'on possède.",                                        author: "Saint Augustin", tags: ["calme", "introspectif"] },
  { id: 25, text: "Il n'y a pas de meilleure thérapie que de courir, marcher, danser, écrire, créer.",                    author: null,             tags: ["calme", "tendre"] },

  // ── Phrases originales (voix anonymes) ──
  { id: 26, text: "Je suis fatiguée depuis si longtemps que j'ai oublié à quoi ressemble la fatigue normale.",            author: "Sève",           tags: ["fatigue", "orage"] },
  { id: 27, text: "Le matin c'est le plus dur. Sortir du lit demande tout ce que je n'ai pas.",                           author: "Élio",           tags: ["fatigue", "orage"] },
  { id: 28, text: "Aujourd'hui j'ai dit non. Pour la première fois depuis longtemps. Et ça m'a fait pleurer.",            author: "Naïs",           tags: ["tendre", "introspectif"] },
  { id: 29, text: "On m'a demandé comment j'allais. J'ai répondu 'ça va' mais j'avais envie d'autre chose.",              author: "Rune",           tags: ["introspectif", "fatigue"] },
  { id: 30, text: "Mon corps me parle. Il dit qu'il a besoin que je l'écoute. Je commence juste.",                        author: "Anya",           tags: ["tendre", "calme"] },

  // ── Phrases anchor ÇA VA? ──
  { id: 31, text: "Et toi, ça va vraiment ?",                                                                             author: "ÇA VA?",         tags: ["introspectif"] },
  { id: 32, text: "Le silence aussi compte.",                                                                             author: "ÇA VA?",         tags: ["calme", "tendre"] },
  { id: 33, text: "Tu peux ne pas savoir.",                                                                               author: "ÇA VA?",         tags: ["introspectif"] },
  { id: 34, text: "Pose-le ici. Juste ça.",                                                                               author: "ÇA VA?",         tags: ["tendre"] },
  { id: 35, text: "Tu n'as rien à prouver à ton ciel.",                                                                   author: "ÇA VA?",         tags: ["calme"] },

  // ── Complément littérature & poésie ──
  { id: 36, text: "Ce qu'il y a de bien avec les coups durs, c'est qu'on apprend qu'on peut les encaisser.",              author: null,             tags: ["orage", "calme"] },
  { id: 37, text: "Tout passe. Les tempêtes aussi.",                                                                       author: null,             tags: ["orage", "calme"] },
  { id: 38, text: "La nuit n'est jamais complète. Il y a toujours, puisque je le dis, puisque je l'affirme, au bout du chagrin, une fenêtre ouverte.", author: "Paul Éluard", tags: ["orage", "introspectif"] },
  { id: 39, text: "On ne guérit pas du temps qui passe, on apprend à danser avec.",                                       author: null,             tags: ["introspectif", "calme"] },
  { id: 40, text: "Aimer, c'est se réjouir.",                                                                              author: "Aristote",       tags: ["tendre", "calme"] },

  // ── Phrases d'apaisement courtes ──
  { id: 41, text: "Respire. Une seule fois suffit.",                                                                       author: "ÇA VA?",         tags: ["orage", "calme"] },
  { id: 42, text: "Tu es là. C'est déjà énorme.",                                                                          author: "ÇA VA?",         tags: ["fatigue", "tendre"] },
  { id: 43, text: "L'instant est plus grand que le drame.",                                                                author: null,             tags: ["orage", "introspectif"] },
  { id: 44, text: "Doucement. Tout va bien.",                                                                              author: "ÇA VA?",         tags: ["tendre", "calme"] },
  { id: 45, text: "Tu n'es pas en retard sur ta propre vie.",                                                              author: null,             tags: ["introspectif", "tendre"] },
  { id: 46, text: "Le repos est productif.",                                                                               author: null,             tags: ["fatigue", "calme"] },
  { id: 47, text: "Reviens-toi.",                                                                                          author: "ÇA VA?",         tags: ["tendre"] },
  { id: 48, text: "C'est ok de ne pas être ok.",                                                                           author: "ÇA VA?",         tags: ["orage", "introspectif"] },
];

/**
 * Récupère une citation selon un tag d'état (color de l'étoile).
 * Si plusieurs match, retourne aléatoire (seed = dayIndex pour stabilité jour).
 */
export function pickCitation(tag, seed = 0) {
  const matching = CITATIONS.filter((c) => c.tags.includes(tag));
  const pool = matching.length > 0 ? matching : CITATIONS;
  const idx = Math.abs(seed) % pool.length;
  return pool[idx];
}
