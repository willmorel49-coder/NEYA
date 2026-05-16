/* ============================================================
   ÇA VA ? V4 — Communauté plein écran painterly
   ============================================================
   Hero ÇA VA ? + 4 sections :
     1. Question du jour       (réponses + écho)
     2. Voix qui passent        (fil anonyme + réactions)
     3. Mon cercle proche       (7 max)
     4. Témoignages éditoriaux  (histoires longues)

   Les ressources (Aide / Espaces réels) sont désormais
   accessibles depuis le bouton SOS en haut à droite.
   ============================================================ */

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  haptic,
  ls,
  getProfile,
  getDailyPrompt,
  addToCercle,
} from '../state';
import ActionSheet from '../../components/ActionSheet';
import Cercle from './Cercle';
import useStandardOverlay from '../hooks/useStandardOverlay';
import Blobs from '../../components/Blobs';

/* ─── Données ─── */

const HERO_IMAGE = '/img/world-communaute.png';

const REACTIONS = [
  { key: 'touche',    icon: '♡', label: 'Touché·e' },
  { key: 'comprends', icon: '◇', label: 'Je comprends' },
  { key: 'lis',       icon: '○', label: 'Je te lis' },
];

const SEEDED_POSTS = [
  { id: 'seed-1', pseudo: 'Sève',  totem: 'ours',    body: 'Je suis fatiguée depuis si longtemps que j\'ai oublié à quoi ressemble la fatigue normale.', createdAt: Date.now() - 86400000 * 2, seeded: true },
  { id: 'seed-2', pseudo: 'Élio',  totem: 'aigle',   body: 'Le matin c\'est le plus dur. Sortir du lit demande tout ce que je n\'ai pas.', createdAt: Date.now() - 86400000, seeded: true },
  { id: 'seed-3', pseudo: 'Naïs',  totem: 'daim',    body: 'Aujourd\'hui j\'ai dit non. Pour la première fois depuis longtemps. Et ça m\'a fait pleurer.', createdAt: Date.now() - 86400000 * 3, seeded: true },
  { id: 'seed-4', pseudo: 'Rune',  totem: 'baleine', body: 'On m\'a demandé comment j\'allais. J\'ai répondu "ça va" mais j\'avais envie d\'autre chose.', createdAt: Date.now() - 86400000 * 4, seeded: true },
  { id: 'seed-5', pseudo: 'Anya',  totem: 'lion',    body: 'Mon corps me parle. Il dit qu\'il a besoin que je l\'écoute. Je commence juste.', createdAt: Date.now() - 86400000 * 5, seeded: true },
];

const TEMOIGNAGES = [
  {
    id: 't1',
    initials: 'L',
    name: 'Léa, 28 ans',
    city: 'Marseille',
    accent: 'var(--terracotta)',
    title: 'J\'ai cru longtemps que demander de l\'aide, c\'était abandonner.',
    body: 'Pendant des années, j\'ai porté seule mon anxiété. Je pensais que c\'était ma force, ma manière de tenir.\n\nUn jour, j\'ai accepté de m\'asseoir face à quelqu\'un. Pas pour qu\'on me sauve. Juste pour qu\'on m\'écoute.\n\nCe jour-là, je n\'ai pas perdu. J\'ai posé un poids que je portais depuis l\'enfance, sans même savoir qu\'il était là.\n\nAujourd\'hui je sais : demander de l\'aide, c\'est commencer à se prendre au sérieux.',
  },
  {
    id: 't2',
    initials: 'T',
    name: 'Théo, 34 ans',
    city: 'Lyon',
    accent: 'var(--mist-blue)',
    title: 'Le burn-out ne s\'est pas annoncé. Il est arrivé un mardi matin.',
    body: 'J\'étais en train de me brosser les dents. Et je n\'ai pas pu cracher.\n\nMon corps avait dit stop avant que ma tête comprenne. Pendant six mois je n\'ai pas pu retravailler.\n\nCe que personne ne m\'avait dit, c\'est que reconstruire prend du temps. Pas en semaines. En saisons.\n\nJ\'ai appris à doser. À dire non. À ne pas reprendre tout d\'un coup parce qu\'on me croyait "guéri".\n\nLa fatigue mentale n\'est pas une faiblesse. C\'est un signal que j\'ai mis trente-quatre ans à entendre.',
  },
  {
    id: 't3',
    initials: 'I',
    name: 'Inès, 22 ans',
    city: 'Paris',
    accent: 'var(--emerald)',
    title: 'Mon corps avait essayé de me parler. J\'ai mis cinq ans à l\'entendre.',
    body: 'Migraines. Estomac. Insomnies. Je consultais médecin après médecin. Tout allait "normalement".\n\nC\'est une psy qui m\'a posé la bonne question : "Et qu\'est-ce qui ne va pas, dans ta vie ?"\n\nJ\'ai pleuré pendant une heure. Je ne savais pas que j\'avais autant de choses à dire.\n\nLes symptômes étaient le langage de ce que je n\'osais pas formuler. Le corps tient le sac quand l\'esprit refuse de regarder.\n\nAujourd\'hui j\'écoute. Pas toujours bien. Mais j\'écoute.',
  },
  {
    id: 't4',
    initials: 'M',
    name: 'Marc, 41 ans',
    city: 'Bordeaux',
    accent: 'var(--ochre)',
    title: 'Devenir père m\'a confronté à un vide que je ne savais pas nommer.',
    body: 'On parle beaucoup du baby blues des mères. Personne ne m\'avait préparé à ce que ça pouvait remuer chez le père.\n\nJ\'avais 41 ans. Une vie carrée. Une carrière. Et soudain, face à ce petit être, j\'ai eu peur. Pas peur de mal faire. Peur de moi-même.\n\nDes émotions sont remontées que je croyais réglées depuis longtemps. Mon propre père. Mon enfance.\n\nJ\'ai cherché un homme à qui parler. Ça m\'a pris du temps. On nous a tellement appris à ne pas demander.\n\nJ\'apprends aujourd\'hui à ressentir avant d\'agir. C\'est neuf. C\'est étrange. C\'est juste.',
  },
];

/* ─── Helpers ─── */

const loadOwnPosts = () => ls.get('communaute_posts', []);
const saveOwnPosts = (p) => ls.set('communaute_posts', p);
const loadReactions = () => ls.get('post_reactions', {});
const saveReactions = (r) => ls.set('post_reactions', r);
const loadHiddenSeeds = () => ls.get('hidden_seed_posts', []);
const loadCercle = () => ls.get('cercle', []);

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'à l\'instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

/* ============================================================
   Main
   ============================================================ */

export default function Communaute() {
  const profile = getProfile();
  const DEFAULT_PROMPT = "Qu'est-ce qui t'a fait du bien aujourd'hui, même un petit truc ?";
  const dailyPrompt = useMemo(() => {
    const p = getDailyPrompt();
    return { ...p, text: p?.q || p?.text || DEFAULT_PROMPT };
  }, []);
  const [ownPosts, setOwnPosts] = useState(() => loadOwnPosts());
  const [reactions, setReactions] = useState(() => loadReactions());
  const [hiddenSeeds, setHiddenSeeds] = useState(() => loadHiddenSeeds());
  const [cercle, setCercle] = useState(() => loadCercle());
  const [cercleOpen, setCercleOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [allVoicesOpen, setAllVoicesOpen] = useState(false);
  const [actionSheet, setActionSheet] = useState(null);
  const [openedTemoignage, setOpenedTemoignage] = useState(null);

  // All visible posts (own + seeds non cachés), tri date desc
  const allPosts = useMemo(() => {
    const visibleSeeds = SEEDED_POSTS.filter((s) => !hiddenSeeds.includes(s.id));
    return [...ownPosts, ...visibleSeeds].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [ownPosts, hiddenSeeds]);

  const previewPosts = allPosts.slice(0, 4);
  const cercleCount = cercle.length;

  // Réactions sur question du jour : posts liés au dailyPrompt
  const promptResponses = useMemo(() => {
    return ownPosts.filter((p) => p.promptId === dailyPrompt.id).slice(0, 3);
  }, [ownPosts, dailyPrompt.id]);

  const refresh = () => {
    setOwnPosts(loadOwnPosts());
    setReactions(loadReactions());
    setHiddenSeeds(loadHiddenSeeds());
    setCercle(loadCercle());
  };

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('neya:profile-changed', handler);
    window.addEventListener('focus', handler);
    return () => {
      window.removeEventListener('neya:profile-changed', handler);
      window.removeEventListener('focus', handler);
    };
  }, []);

  const toggleReaction = (postId, reactionKey) => {
    haptic(2);
    const current = reactions[postId] || {};
    const next = { ...current, [reactionKey]: !current[reactionKey] };
    const nextReactions = { ...reactions, [postId]: next };
    setReactions(nextReactions);
    saveReactions(nextReactions);
  };

  const hidePost = (postId) => {
    const seed = SEEDED_POSTS.find((s) => s.id === postId);
    if (seed) {
      const next = [...hiddenSeeds, postId];
      ls.set('hidden_seed_posts', next);
      setHiddenSeeds(next);
    } else {
      const next = ownPosts.filter((p) => p.id !== postId);
      saveOwnPosts(next);
      setOwnPosts(next);
    }
    haptic(3);
  };

  const handleAddToCercle = (post) => {
    if (!post.pseudo) return;
    if (cercle.length >= 7) {
      setActionSheet({ type: 'cercle-full' });
      return;
    }
    setActionSheet({ type: 'add-cercle', pseudo: post.pseudo });
  };

  const submitPost = (body, promptId = null) => {
    const trimmed = (body || '').trim();
    if (!trimmed) return;
    const newPost = {
      id: `own-${Date.now()}`,
      pseudo: profile.pseudo || 'Toi',
      totem: profile.totem || 'lion',
      body: trimmed,
      createdAt: Date.now(),
      promptId,
    };
    const next = [newPost, ...ownPosts];
    saveOwnPosts(next);
    setOwnPosts(next);
    haptic([6, 30, 6]);
    setComposerOpen(false);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        background: 'var(--bg)',
      }}
      data-world="communaute"
    >
      <Blobs variant="blue-rose" />
      {/* HERO painterly */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(55vh, 460px)',
          minHeight: 380,
          overflow: 'hidden',
          background: 'var(--bg)',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${HERO_IMAGE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            animation: 'commu-bg-ken-burns 32s ease-in-out infinite alternate',
            willChange: 'transform',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.28) 45%, rgba(0,0,0,0.62) 100%)',
            pointerEvents: 'none',
          }}
        />
        {/* Lucioles communauté */}
        {[
          { left: '18%', top: '32%', size: 4, delay: 0,   duration: 7.2 },
          { left: '72%', top: '28%', size: 3, delay: 1.4, duration: 8.4 },
          { left: '34%', top: '64%', size: 5, delay: 0.6, duration: 6.8 },
          { left: '82%', top: '58%', size: 3, delay: 2.2, duration: 9.0 },
          { left: '48%', top: '20%', size: 4, delay: 3.0, duration: 7.8 },
        ].map((f, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              position: 'absolute',
              left: f.left,
              top: f.top,
              width: f.size,
              height: f.size,
              borderRadius: '50%',
              background: 'var(--bg)',
              boxShadow: `0 0 ${f.size * 4}px ${f.size}px var(--terracotta)`,
              opacity: 0,
              animation: `commu-firefly ${f.duration}s ease-in-out ${f.delay}s infinite`,
              pointerEvents: 'none',
            }}
          />
        ))}
        {/* Texte hero */}
        <div
          style={{
            position: 'absolute',
            left: 22,
            right: 22,
            bottom: 32,
            color: 'var(--blue-900)',
            zIndex: 2,
          }}
        >
          <div
            className="neya-mark"
            style={{ color: 'var(--blue-900)', opacity: 0.95, marginBottom: 12, fontSize: 9, fontWeight: 600, textShadow: '0 1px 6px rgba(0, 0, 0, 0.5)' }}
          >
            COMMUNAUTÉ ÇA VA ?
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 11vw, 56px)',
              fontWeight: 300,
              lineHeight: 1.0,
              letterSpacing: '-0.022em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
              color: 'var(--blue-900)',
              textShadow: '0 2px 18px rgba(0, 0, 0, 0.38)',
            }}
          >
            Tu n'es pas<br />seul·e.
          </h1>
          <p
            style={{
              margin: '14px 0 0',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 15,
              lineHeight: 1.45,
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              color: 'var(--blue-900)',
              opacity: 0.88,
              maxWidth: 320,
              textShadow: '0 1px 8px rgba(0, 0, 0, 0.32)',
            }}
          >
            D'autres traversent ce que tu traverses. En silence ou en mots.
          </p>
        </div>
      </section>

      {/* Body padded */}
      <div style={{ padding: '0 22px calc(env(safe-area-inset-bottom, 0px) + 130px)' }}>

        {/* ═══ 1. QUESTION DU JOUR ═══ */}
        <section style={{ marginTop: 36 }}>
          <SectionTitle accent="var(--terracotta)">La question du jour</SectionTitle>
          <div
            style={{
              background: 'rgba(255, 252, 245, 0.82)',
              border: '0.5px solid rgba(26, 26, 47, 0.08)',
              borderRadius: 18,
              padding: '20px 22px 18px',
              boxShadow: '0 2px 14px rgba(26, 26, 47, 0.04)',
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 19,
                lineHeight: 1.42,
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                color: 'var(--ink)',
              }}
            >
              « {dailyPrompt.text} »
            </p>

            {promptResponses.length > 0 && (
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: '0.5px solid rgba(26, 26, 47, 0.06)' }}>
                <div
                  className="neya-mark"
                  style={{ color: 'var(--content-tertiary)', marginBottom: 10 }}
                >
                  Ta réponse · {promptResponses.length}
                </div>
                {promptResponses.map((p) => (
                  <p
                    key={p.id}
                    style={{
                      margin: '6px 0',
                      fontFamily: 'var(--font-body)',
                      fontSize: 13,
                      lineHeight: 1.55,
                      color: 'var(--content-secondary)',
                      fontStyle: 'italic',
                    }}
                  >
                    « {p.body} »
                  </p>
                ))}
              </div>
            )}

            <button
              type="button"
              data-press
              onClick={() => { haptic(4); setComposerOpen({ promptId: dailyPrompt.id }); }}
              style={{
                marginTop: 18,
                appearance: 'none',
                width: '100%',
                padding: '14px 18px',
                minHeight: 48,
                background: 'var(--terracotta)',
                color: 'var(--cream)',
                border: 'none',
                borderRadius: 999,
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {promptResponses.length > 0 ? 'Ajouter une réponse' : 'Y répondre'}
            </button>
          </div>
        </section>

        {/* ═══ 2. VOIX QUI PASSENT ═══ */}
        <section style={{ marginTop: 40 }}>
          <SectionTitle
            accent="var(--mist-blue)"
            trailing={
              <button
                type="button"
                data-press
                onClick={() => { haptic(2); setAllVoicesOpen(true); }}
                className="neya-mark"
                style={{
                  appearance: 'none',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--content-secondary)',
                  cursor: 'pointer',
                  padding: '6px 4px',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Toutes ›
              </button>
            }
          >
            Les voix qui passent
          </SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {previewPosts.map((p) => (
              <VoicePost
                key={p.id}
                post={p}
                reactions={reactions[p.id] || {}}
                onReact={(r) => toggleReaction(p.id, r)}
                onMore={() => setActionSheet({ type: 'post-menu', post: p })}
              />
            ))}
            {previewPosts.length === 0 && (
              <div
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--content-tertiary)',
                  fontStyle: 'italic',
                }}
              >
                Les premières voix arrivent.
              </div>
            )}
          </div>

          <button
            type="button"
            data-press
            onClick={() => { haptic(4); setComposerOpen({ promptId: null }); }}
            style={{
              marginTop: 14,
              appearance: 'none',
              width: '100%',
              padding: '12px 16px',
              minHeight: 44,
              background: 'transparent',
              color: 'var(--ink)',
              border: '0.5px solid var(--mist-blue)',
              borderRadius: 999,
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            + Partager une voix
          </button>
        </section>

        {/* ═══ 3. MON CERCLE PROCHE ═══ */}
        <section style={{ marginTop: 40 }}>
          <SectionTitle
            accent="var(--emerald)"
            trailing={
              <span
                className="neya-mark"
                style={{ color: 'var(--content-tertiary)', fontVariantNumeric: 'tabular-nums' }}
              >
                {cercleCount}/7
              </span>
            }
          >
            Mon cercle proche
          </SectionTitle>
          <button
            type="button"
            data-press
            onClick={() => { haptic(2); setCercleOpen(true); }}
            style={{
              appearance: 'none',
              width: '100%',
              padding: '18px 20px',
              minHeight: 72,
              background: 'rgba(255, 252, 245, 0.82)',
              border: '0.5px solid rgba(26, 26, 47, 0.08)',
              borderRadius: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              textAlign: 'left',
              WebkitTapHighlightColor: 'transparent',
              boxShadow: '0 2px 14px rgba(26, 26, 47, 0.04)',
            }}
          >
            {/* Avatars stack */}
            <div style={{ display: 'flex', flexShrink: 0 }}>
              {Array.from({ length: 7 }, (_, i) => {
                const filled = i < cercleCount;
                const member = cercle[i];
                const initials = member ? (member.pseudo || '?').slice(0, 1).toUpperCase() : '·';
                return (
                  <span
                    key={i}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      marginLeft: i === 0 ? 0 : -8,
                      background: filled ? 'var(--emerald)' : 'rgba(26, 26, 47, 0.06)',
                      border: '1.5px solid var(--cream)',
                      color: filled ? 'var(--cream)' : 'rgba(26, 26, 47, 0.20)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: 11,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {initials}
                  </span>
                );
              })}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontVariationSettings: 'var(--fraunces-italic-soft)',
                  fontSize: 16,
                  color: 'var(--ink)',
                  lineHeight: 1.3,
                }}
              >
                {cercleCount === 0
                  ? 'Compose ton cercle proche.'
                  : `${cercleCount} ${cercleCount === 1 ? 'personne' : 'personnes'} qui comptent.`}
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontFamily: 'var(--font-body)',
                  fontSize: 12.5,
                  color: 'var(--content-secondary)',
                }}
              >
                Jusqu'à 7 voix qui te reconnaissent.
              </div>
            </div>
            <span style={{ color: 'var(--content-tertiary)', fontSize: 16, flexShrink: 0 }}>›</span>
          </button>
        </section>

        {/* ═══ 4. TÉMOIGNAGES ═══ */}
        <section style={{ marginTop: 40 }}>
          <SectionTitle accent="var(--ochre)">Témoignages</SectionTitle>
          <div className="neya-body-sm" style={{ color: 'var(--content-secondary)', marginBottom: 14 }}>
            Des histoires vécues, écrites par d'autres.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TEMOIGNAGES.map((t) => (
              <TemoignageCard
                key={t.id}
                temoignage={t}
                onOpen={() => { haptic(2); setOpenedTemoignage(t); }}
              />
            ))}
          </div>
        </section>

        {/* Footer manifesto */}
        <p
          style={{
            margin: '48px 0 0',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            fontSize: 13,
            lineHeight: 1.5,
            color: 'var(--content-secondary)',
            textAlign: 'center',
          }}
        >
          Ce que tu partages reste anonyme.<br />
          Ce que tu lis est offert.
        </p>
      </div>

      {/* Overlays */}
      {cercleOpen && <Cercle onClose={() => { setCercleOpen(false); refresh(); }} />}

      {composerOpen && (
        <Composer
          promptId={composerOpen.promptId}
          promptText={composerOpen.promptId ? dailyPrompt.text : null}
          onSubmit={(body) => submitPost(body, composerOpen.promptId)}
          onClose={() => setComposerOpen(false)}
        />
      )}

      {allVoicesOpen && (
        <AllVoicesOverlay
          posts={allPosts}
          reactions={reactions}
          onReact={toggleReaction}
          onMore={(post) => setActionSheet({ type: 'post-menu', post })}
          onCompose={() => { setAllVoicesOpen(false); setComposerOpen({ promptId: null }); }}
          onClose={() => setAllVoicesOpen(false)}
        />
      )}

      {openedTemoignage && (
        <TemoignageReader
          temoignage={openedTemoignage}
          onClose={() => setOpenedTemoignage(null)}
        />
      )}

      {actionSheet?.type === 'post-menu' && (
        <ActionSheet
          title={actionSheet.post.pseudo}
          actions={[
            {
              label: 'Ajouter à mon cercle',
              icon: '◇',
              onTap: () => { handleAddToCercle(actionSheet.post); setActionSheet(null); },
            },
            {
              label: 'Masquer ce message',
              role: 'destructive',
              icon: '×',
              onTap: () => { hidePost(actionSheet.post.id); setActionSheet(null); },
            },
          ]}
          onClose={() => setActionSheet(null)}
        />
      )}

      {actionSheet?.type === 'add-cercle' && (
        <ActionSheet
          title={`Ajouter ${actionSheet.pseudo} à ton cercle ?`}
          description="Ton cercle reste petit (7 maximum). Ce sont les voix qui te reconnaissent."
          actions={[
            {
              label: 'Oui, ajouter',
              icon: '◇',
              onTap: () => {
                addToCercle({ pseudo: actionSheet.pseudo });
                refresh();
                setActionSheet(null);
                haptic([6, 30, 6]);
              },
            },
          ]}
          onClose={() => setActionSheet(null)}
        />
      )}

      {actionSheet?.type === 'cercle-full' && (
        <ActionSheet
          title="Ton cercle est complet"
          description="Tu peux retirer une voix dans Mon cercle proche pour en ajouter une nouvelle."
          actions={[]}
          onClose={() => setActionSheet(null)}
        />
      )}

      <style>{`
        @keyframes commu-bg-ken-burns {
          0%   { transform: scale(1)    translate3d(0, 0, 0); }
          100% { transform: scale(1.06) translate3d(0, -1%, 0); }
        }
        @keyframes commu-firefly {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.6); }
          15%      { opacity: 0.45; transform: translateY(-6px) scale(1); }
          50%      { opacity: 0.9;  transform: translateY(-14px) scale(1.1); }
          85%      { opacity: 0.4;  transform: translateY(-22px) scale(0.9); }
        }
      `}</style>
    </div>
  );
}

/* ─── Petits composants ─── */

function SectionTitle({ children, accent, trailing }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <span style={{ width: 18, height: 2, background: accent, opacity: 1, borderRadius: 1 }} />
      <span className="neya-mark" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>{children}</span>
      {trailing ? <span style={{ marginLeft: 'auto' }}>{trailing}</span> : null}
    </div>
  );
}

function VoicePost({ post, reactions, onReact, onMore }) {
  return (
    <article
      style={{
        padding: '16px 18px',
        background: 'rgba(255, 252, 245, 0.78)',
        border: '0.5px solid rgba(26, 26, 47, 0.08)',
        borderRadius: 16,
        boxShadow: '0 1px 8px rgba(26, 26, 47, 0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--ink)',
          }}
        >
          {post.pseudo}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10.5,
            color: 'var(--content-secondary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {timeAgo(post.createdAt)}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-body)',
          fontSize: 14.5,
          lineHeight: 1.55,
          color: 'var(--ink)',
        }}
      >
        {post.body}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
        {REACTIONS.map((r) => {
          const active = !!reactions[r.key];
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => onReact(r.key)}
              data-press
              aria-label={r.label}
              aria-pressed={active}
              style={{
                appearance: 'none',
                padding: '8px 12px',
                minHeight: 36,
                background: active ? 'rgba(26, 26, 47, 0.06)' : 'transparent',
                border: active ? '0.5px solid var(--ink)' : '0.5px solid rgba(26, 26, 47, 0.10)',
                borderRadius: 999,
                color: 'var(--ink)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {r.icon}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onMore}
          data-press
          aria-label="Plus d'options"
          style={{
            marginLeft: 'auto',
            appearance: 'none',
            width: 36,
            height: 36,
            background: 'transparent',
            border: 'none',
            color: 'var(--content-secondary)',
            cursor: 'pointer',
            fontSize: 16,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ⋯
        </button>
      </div>
    </article>
  );
}

function TemoignageCard({ temoignage, onOpen }) {
  const t = temoignage;
  return (
    <button
      type="button"
      data-press
      onClick={onOpen}
      style={{
        appearance: 'none',
        width: '100%',
        padding: '18px 20px',
        background: 'rgba(255, 252, 245, 0.82)',
        border: '0.5px solid rgba(26, 26, 47, 0.08)',
        borderRadius: 16,
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        WebkitTapHighlightColor: 'transparent',
        boxShadow: '0 1px 8px rgba(26, 26, 47, 0.03)',
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: t.accent,
          color: 'var(--cream)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontVariationSettings: 'var(--fraunces-italic-soft)',
          fontSize: 18,
        }}
      >
        {t.initials}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="neya-mark"
          style={{
            color: 'var(--ink-soft)',
            marginBottom: 6,
            fontSize: 9,
            fontWeight: 600,
          }}
        >
          {t.name} · {t.city}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            fontSize: 15,
            lineHeight: 1.4,
            color: 'var(--ink)',
          }}
        >
          « {t.title} »
        </div>
        <div
          className="neya-mark"
          style={{
            color: 'var(--ink-soft)',
            marginTop: 10,
            fontSize: 9,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span aria-hidden style={{ width: 8, height: 2, background: t.accent, borderRadius: 1 }} />
          Lire ›
        </div>
      </div>
    </button>
  );
}

/* ─── Composer (sheet) ─── */

function Composer({ promptId, promptText, onSubmit, onClose }) {
  const [body, setBody] = useState('');
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const aliveRef = useRef(true);
  const timersRef = useRef([]);

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => {
      if (aliveRef.current) fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  };

  const handleClose = () => {
    if (closing) return;
    haptic(3);
    setClosing(true);
    safeTimeout(() => onClose?.(), 320);
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: 'Partager une voix',
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(raf);
      aliveRef.current = false;
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const handleSubmit = () => {
    if (!body.trim()) return;
    onSubmit(body);
  };

  return (
    <>
      <div
        aria-hidden
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          background: 'rgba(8, 10, 24, 0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          opacity: closing ? 0 : mounted ? 1 : 0,
          transition: 'opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      <div
        ref={containerRef}
        {...dialogProps}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 151,
          background: 'var(--cream)',
          color: 'var(--ink)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '12px 22px calc(env(safe-area-inset-bottom, 0px) + 24px)',
          transform: closing ? 'translateY(100%)' : mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.18)',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        <div
          aria-hidden
          style={{
            width: 36,
            height: 5,
            borderRadius: 999,
            background: 'rgba(26, 26, 47, 0.18)',
            margin: '0 auto 18px',
          }}
        />

        {promptText && (
          <p
            style={{
              margin: '0 0 18px',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 16,
              lineHeight: 1.4,
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              color: 'var(--ink)',
              padding: '14px 16px',
              background: 'rgba(159, 88, 76, 0.06)',
              borderLeft: '2px solid var(--terracotta)',
              borderRadius: 6,
            }}
          >
            « {promptText} »
          </p>
        )}

        <label
          className="neya-mark"
          style={{ color: 'var(--content-tertiary)', display: 'block', marginBottom: 8 }}
        >
          Ta voix
        </label>
        <textarea
          autoFocus
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Ce que tu portes, ce que tu vis. C'est anonyme."
          rows={5}
          maxLength={280}
          aria-label="Ta voix"
          style={{
            width: '100%',
            padding: '14px 16px',
            minHeight: 110,
            background: 'rgba(26, 26, 47, 0.04)',
            border: '0.5px solid rgba(26, 26, 47, 0.10)',
            borderRadius: 12,
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            lineHeight: 1.5,
            color: 'var(--ink)',
            outline: 'none',
            resize: 'none',
            boxSizing: 'border-box',
            marginBottom: 6,
          }}
        />
        <div
          style={{
            textAlign: 'right',
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            color: body.length >= 260 ? 'var(--crisis)' : 'var(--content-secondary)',
            fontVariantNumeric: 'tabular-nums',
            marginBottom: 18,
          }}
        >
          {280 - body.length}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            data-press
            onClick={handleClose}
            style={{
              appearance: 'none',
              flex: 1,
              padding: '14px 16px',
              minHeight: 48,
              background: 'transparent',
              border: '0.5px solid rgba(26, 26, 47, 0.18)',
              borderRadius: 999,
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: 'var(--ink)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            data-press
            onClick={handleSubmit}
            disabled={!body.trim()}
            style={{
              appearance: 'none',
              flex: 1,
              padding: '14px 16px',
              minHeight: 48,
              background: body.trim() ? 'var(--terracotta)' : 'rgba(26, 26, 47, 0.10)',
              color: body.trim() ? 'var(--cream)' : 'var(--content-secondary)',
              border: 'none',
              borderRadius: 999,
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.04em',
              cursor: body.trim() ? 'pointer' : 'not-allowed',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Partager
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── AllVoicesOverlay (full feed) ─── */

function AllVoicesOverlay({ posts, reactions, onReact, onMore, onCompose, onClose }) {
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const aliveRef = useRef(true);
  const timersRef = useRef([]);

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => {
      if (aliveRef.current) fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  };

  const handleClose = () => {
    if (closing) return;
    haptic(3);
    setClosing(true);
    safeTimeout(() => onClose?.(), 320);
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: 'Toutes les voix',
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(raf);
      aliveRef.current = false;
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(255,255,255,0.65)',
        color: 'var(--ink)',
        transform: closing ? 'translateX(100%)' : mounted ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 22px 14px',
          borderBottom: '0.5px solid rgba(26, 26, 47, 0.08)',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          data-press
          onClick={handleClose}
          aria-label="Retour"
          style={{
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--ink)',
            cursor: 'pointer',
            padding: '10px 12px',
            minHeight: 44,
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.04em',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ‹ Retour
        </button>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            fontSize: 16,
          }}
        >
          Toutes les voix
        </span>
        <span style={{ width: 60 }} />
      </div>

      {/* Feed */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '14px 22px calc(env(safe-area-inset-bottom, 0px) + 100px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {posts.map((p) => (
          <VoicePost
            key={p.id}
            post={p}
            reactions={reactions[p.id] || {}}
            onReact={(r) => onReact(p.id, r)}
            onMore={() => onMore(p)}
          />
        ))}
      </div>

      {/* FAB */}
      <button
        type="button"
        data-press
        onClick={onCompose}
        aria-label="Partager une voix"
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          right: 22,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--terracotta)',
          color: 'var(--cream)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 22px rgba(159, 88, 76, 0.38)',
          fontSize: 22,
          fontWeight: 300,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        +
      </button>
    </div>
  );
}

/* ─── TemoignageReader ─── */

function TemoignageReader({ temoignage, onClose }) {
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const aliveRef = useRef(true);
  const timersRef = useRef([]);
  const t = temoignage;

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => {
      if (aliveRef.current) fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  };

  const handleClose = () => {
    if (closing) return;
    haptic(3);
    setClosing(true);
    safeTimeout(() => onClose?.(), 320);
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: 'Témoignage',
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    haptic(4);
    return () => {
      cancelAnimationFrame(raf);
      aliveRef.current = false;
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(255,255,255,0.65)',
        color: 'var(--ink)',
        transform: closing ? 'translateY(100%)' : mounted ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 22px 14px',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          data-press
          onClick={handleClose}
          aria-label="Retour"
          style={{
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--ink)',
            cursor: 'pointer',
            padding: '10px 12px',
            minHeight: 44,
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.04em',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ‹ Témoignages
        </button>
        <span style={{ width: 60 }} />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '20px 24px calc(env(safe-area-inset-bottom, 0px) + 80px)',
        }}
      >
        {/* Initial avatar large */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <span
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: t.accent,
              color: 'var(--cream)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 26,
            }}
          >
            {t.initials}
          </span>
        </div>

        <div
          className="neya-mark"
          style={{
            textAlign: 'center',
            color: 'var(--ink-soft)',
            marginBottom: 12,
            fontSize: 9,
            fontWeight: 600,
          }}
        >
          {t.name} · {t.city}
        </div>

        <h2
          style={{
            margin: '0 0 28px',
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            fontSize: 'clamp(20px, 5.5vw, 24px)',
            lineHeight: 1.35,
            color: 'var(--ink)',
            fontWeight: 400,
            maxWidth: 540,
            marginInline: 'auto',
          }}
        >
          « {t.title} »
        </h2>

        <div style={{ maxWidth: 580, marginInline: 'auto' }}>
          {t.body.split('\n\n').map((para, i) => (
            <p
              key={i}
              style={{
                margin: '0 0 18px',
                fontFamily: 'var(--font-body)',
                fontSize: 16,
                lineHeight: 1.65,
                color: 'var(--ink)',
              }}
            >
              {para}
            </p>
          ))}
        </div>

        <div
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: '0.5px solid rgba(26, 26, 47, 0.10)',
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            fontSize: 13,
            color: 'var(--content-secondary)',
          }}
        >
          Une voix parmi d'autres. Tu n'es pas seul·e.
        </div>
      </div>
    </div>
  );
}
