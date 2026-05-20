/* ============================================================
   ÇA VA ? V7 — Communauté · Premium Apple/Calm/Threads
   ============================================================
   Structure :
     1. Topbar glass sticky premium
     2. Hero glass card 343×280 image + gradient overlay
     3. Question du jour + 3 réponses preview glass mini-cards
     4. Les voix qui passent (feed glass + accent border-left 4px)
     5. Mon cercle horizontal scroll-snap + avatars gradient
     6. Témoignages cards éditoriales avec initiales 56×56
     7. Composer modal premium glass overlay
     8. Spacing géométrique strict (4,8,12,16,24,32,48,64)
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
  { key: 'comprends', icon: '◇', label: 'Comprends' },
  { key: 'lis',       icon: '○', label: 'Lis' },
];

const SEEDED_POSTS = [
  { id: 'seed-1', pseudo: 'Sève',  totem: 'ours',    body: "Je suis fatiguée depuis si longtemps que j'ai oublié à quoi ressemble la fatigue normale.", createdAt: Date.now() - 86400000 * 2, seeded: true },
  { id: 'seed-2', pseudo: 'Élio',  totem: 'aigle',   body: "Le matin c'est le plus dur. Sortir du lit demande tout ce que je n'ai pas.", createdAt: Date.now() - 86400000, seeded: true },
  { id: 'seed-3', pseudo: 'Naïs',  totem: 'daim',    body: "Aujourd'hui j'ai dit non. Pour la première fois depuis longtemps. Et ça m'a fait pleurer.", createdAt: Date.now() - 86400000 * 3, seeded: true },
  { id: 'seed-4', pseudo: 'Rune',  totem: 'baleine', body: "On m'a demandé comment j'allais. J'ai répondu \"ça va\" mais j'avais envie d'autre chose.", createdAt: Date.now() - 86400000 * 4, seeded: true },
  { id: 'seed-5', pseudo: 'Anya',  totem: 'lion',    body: "Mon corps me parle. Il dit qu'il a besoin que je l'écoute. Je commence juste.", createdAt: Date.now() - 86400000 * 5, seeded: true },
];

const TEMOIGNAGES = [
  {
    id: 't1',
    initials: 'L',
    name: 'Léa, 28 ans',
    city: 'Marseille',
    accent: 'var(--blue-700)',
    avatarGradient: 'var(--gradient-blue)',
    title: "J'ai cru longtemps que demander de l'aide, c'était abandonner.",
    body: "Pendant des années, j'ai porté seule mon anxiété. Je pensais que c'était ma force, ma manière de tenir.\n\nUn jour, j'ai accepté de m'asseoir face à quelqu'un. Pas pour qu'on me sauve. Juste pour qu'on m'écoute.\n\nCe jour-là, je n'ai pas perdu. J'ai posé un poids que je portais depuis l'enfance, sans même savoir qu'il était là.\n\nAujourd'hui je sais : demander de l'aide, c'est commencer à se prendre au sérieux.",
  },
  {
    id: 't2',
    initials: 'T',
    name: 'Théo, 34 ans',
    city: 'Lyon',
    accent: 'var(--rose-700)',
    avatarGradient: 'var(--gradient-rose)',
    title: "Le burn-out ne s'est pas annoncé. Il est arrivé un mardi matin.",
    body: "J'étais en train de me brosser les dents. Et je n'ai pas pu cracher.\n\nMon corps avait dit stop avant que ma tête comprenne. Pendant six mois je n'ai pas pu retravailler.\n\nCe que personne ne m'avait dit, c'est que reconstruire prend du temps. Pas en semaines. En saisons.\n\nJ'ai appris à doser. À dire non. À ne pas reprendre tout d'un coup parce qu'on me croyait \"guéri\".\n\nLa fatigue mentale n'est pas une faiblesse. C'est un signal que j'ai mis trente-quatre ans à entendre.",
  },
  {
    id: 't3',
    initials: 'I',
    name: 'Inès, 22 ans',
    city: 'Paris',
    accent: 'var(--violet)',
    avatarGradient: 'var(--gradient-violet)',
    title: "Mon corps avait essayé de me parler. J'ai mis cinq ans à l'entendre.",
    body: "Migraines. Estomac. Insomnies. Je consultais médecin après médecin. Tout allait \"normalement\".\n\nC'est une psy qui m'a posé la bonne question : \"Et qu'est-ce qui ne va pas, dans ta vie ?\"\n\nJ'ai pleuré pendant une heure. Je ne savais pas que j'avais autant de choses à dire.\n\nLes symptômes étaient le langage de ce que je n'osais pas formuler. Le corps tient le sac quand l'esprit refuse de regarder.\n\nAujourd'hui j'écoute. Pas toujours bien. Mais j'écoute.",
  },
  {
    id: 't4',
    initials: 'M',
    name: 'Marc, 41 ans',
    city: 'Bordeaux',
    accent: 'var(--rose-500)',
    avatarGradient: 'linear-gradient(135deg, var(--rose-500), var(--rose-700))',
    title: "Devenir père m'a confronté à un vide que je ne savais pas nommer.",
    body: "On parle beaucoup du baby blues des mères. Personne ne m'avait préparé à ce que ça pouvait remuer chez le père.\n\nJ'avais 41 ans. Une vie carrée. Une carrière. Et soudain, face à ce petit être, j'ai eu peur. Pas peur de mal faire. Peur de moi-même.\n\nDes émotions sont remontées que je croyais réglées depuis longtemps. Mon propre père. Mon enfance.\n\nJ'ai cherché un homme à qui parler. Ça m'a pris du temps. On nous a tellement appris à ne pas demander.\n\nJ'apprends aujourd'hui à ressentir avant d'agir. C'est neuf. C'est étrange. C'est juste.",
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
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

function wordCount(s = '') {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

/* ─── Styles glass partagés ─── */

const GLASS_CARD = {
  background: 'var(--glass-bg)',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: '1px solid var(--glass-border)',
  borderRadius: 24,
  boxShadow: 'var(--glass-shadow)',
};

const GLASS_MINI = {
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.75)',
  borderRadius: 16,
};

const EYEBROW_BASE = {
  fontFamily: 'var(--font-ui)',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
};

const SECTION_GAP = 48;

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

  const allPosts = useMemo(() => {
    const visibleSeeds = SEEDED_POSTS.filter((s) => !hiddenSeeds.includes(s.id));
    return [...ownPosts, ...visibleSeeds].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [ownPosts, hiddenSeeds]);

  const previewPosts = allPosts.slice(0, 4);
  const cercleCount = cercle.length;

  const promptResponses = useMemo(() => {
    return ownPosts.filter((p) => p.promptId === dailyPrompt.id).slice(0, 3);
  }, [ownPosts, dailyPrompt.id]);

  // Réponses preview pour la question du jour : 3 propositions (les propres + seeds en fallback)
  const promptPreviewCards = useMemo(() => {
    const fromOwn = promptResponses.slice(0, 3);
    if (fromOwn.length >= 3) return fromOwn;
    const seeds = SEEDED_POSTS.slice(0, 3 - fromOwn.length);
    return [...fromOwn, ...seeds];
  }, [promptResponses]);

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

      {/* ═══ 1. TOPBAR GLASS STICKY PREMIUM ═══ */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          padding: 'calc(env(safe-area-inset-top, 0px) + 16px) 16px 16px',
          background: 'rgba(238, 243, 248, 0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(10, 36, 56, 0.06)',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 22,
            lineHeight: 1,
            letterSpacing: 0,
            color: 'var(--blue-900)',
          }}
        >
          ÇA VA ?
        </h1>
      </header>

      {/* Body */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: `24px 16px calc(env(safe-area-inset-bottom, 0px) + 130px)`,
        }}
      >

        {/* ═══ 2. HERO GLASS CARD 343×280 ═══ */}
        <section
          aria-label="Communauté"
          style={{
            position: 'relative',
            height: 280,
            margin: '0 0 32px',
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(10,36,56,0.12)',
            border: '1px solid var(--glass-border)',
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
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom, transparent 30%, rgba(10,36,56,0.78) 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 24,
              right: 24,
              bottom: 24,
              color: '#FFFFFF',
              zIndex: 2,
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(28px, 7vw, 36px)',
                lineHeight: 1.1,
                letterSpacing: 0,
                color: '#FFFFFF',
                textShadow: '0 2px 14px rgba(0,0,0,0.40)',
              }}
            >
              Tu n'es pas seul·e.
            </h2>
            <p
              style={{
                margin: '12px 0 0',
                fontFamily: 'var(--font-ui)',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              On peut tout porter, mais pas tout seuls.
            </p>
          </div>
        </section>

        {/* ═══ 3. QUESTION DU JOUR ═══ */}
        <section style={{ marginBottom: SECTION_GAP }}>
          <div style={{ ...EYEBROW_BASE, color: 'var(--rose-700)', marginBottom: 12 }}>
            Question du jour
          </div>

          <p
            style={{
              margin: '0 0 24px',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(22px, 5.5vw, 28px)',
              lineHeight: 1.25,
              color: 'var(--blue-900)',
              letterSpacing: 0,
            }}
          >
            {dailyPrompt.text}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {promptPreviewCards.map((p) => (
              <div
                key={p.id}
                style={{
                  ...GLASS_MINI,
                  padding: '14px 16px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: 1.2,
                    color: 'var(--blue-700)',
                    marginBottom: 6,
                  }}
                >
                  {p.pseudo}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400,
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {p.body}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            data-press
            onClick={() => { haptic(4); setComposerOpen({ promptId: dailyPrompt.id }); }}
            style={{
              appearance: 'none',
              width: '100%',
              padding: '14px 24px',
              minHeight: 48,
              background: 'var(--gradient-blue)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 50,
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(26,90,127,0.30)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {promptResponses.length > 0 ? 'Ajouter une réponse' : 'Répondre'}
          </button>
        </section>

        {/* ═══ 4. LES VOIX QUI PASSENT ═══ */}
        <section style={{ marginBottom: SECTION_GAP }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div style={{ ...EYEBROW_BASE, color: 'var(--blue-500)' }}>
              Les voix qui passent
            </div>
            <button
              type="button"
              data-press
              onClick={() => { haptic(2); setAllVoicesOpen(true); }}
              style={{
                appearance: 'none',
                background: 'transparent',
                border: 'none',
                color: 'var(--blue-700)',
                cursor: 'pointer',
                padding: '6px 4px',
                ...EYEBROW_BASE,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Toutes ›
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {previewPosts.map((p, i) => (
              <VoicePost
                key={p.id}
                post={p}
                index={i}
                reactions={reactions[p.id] || {}}
                onReact={(r) => toggleReaction(p.id, r)}
                onMore={() => setActionSheet({ type: 'post-menu', post: p })}
              />
            ))}
            {previewPosts.length === 0 && (
              <div
                style={{
                  ...GLASS_CARD,
                  padding: '32px 24px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 18,
                  lineHeight: 1.4,
                  color: 'var(--text-secondary)',
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
              marginTop: 16,
              appearance: 'none',
              width: '100%',
              padding: '13px 24px',
              minHeight: 44,
              background: 'transparent',
              color: 'var(--blue-700)',
              border: '1.5px solid var(--blue-300)',
              borderRadius: 50,
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            + Partager une voix
          </button>
        </section>

        {/* ═══ 5. MON CERCLE ═══ */}
        <section style={{ marginBottom: SECTION_GAP }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div style={{ ...EYEBROW_BASE, color: 'var(--violet)' }}>
              Mon cercle
            </div>
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {cercleCount}/7
            </span>
          </div>

          <CercleRow
            cercle={cercle}
            onComposeOpen={() => { haptic(2); setCercleOpen(true); }}
          />
        </section>

        {/* ═══ 6. TÉMOIGNAGES ═══ */}
        <section style={{ marginBottom: SECTION_GAP }}>
          <div style={{ ...EYEBROW_BASE, color: 'var(--rose-700)', marginBottom: 12 }}>
            Témoignages
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              fontSize: 15,
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginBottom: 24,
            }}
          >
            Des histoires vécues, écrites par d'autres.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
            margin: '32px 0 0',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 18,
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
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
    </div>
  );
}

/* ─── CercleRow — horizontal scroll-snap + avatars gradient ─── */

function CercleRow({ cercle, onComposeOpen }) {
  const preview = cercle.slice(0, 5);

  return (
    <div>
      {preview.length > 0 ? (
        <div
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            paddingBottom: 8,
            marginBottom: 16,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {preview.map((m, i) => {
            const grad = i % 2 === 0 ? 'var(--gradient-blue)' : 'var(--gradient-rose)';
            const initial = (m.pseudo || '?').charAt(0).toUpperCase();
            return (
              <div
                key={i}
                style={{
                  ...GLASS_CARD,
                  borderRadius: 20,
                  padding: '16px 14px',
                  minWidth: 116,
                  scrollSnapAlign: 'start',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <div
                  aria-hidden
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: grad,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    fontSize: 20,
                    boxShadow: '0 4px 12px rgba(10,36,56,0.15)',
                  }}
                >
                  {initial}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    fontSize: 16,
                    color: 'var(--blue-900)',
                    textAlign: 'center',
                    lineHeight: 1.1,
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {m.pseudo}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 500,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                  }}
                >
                  proche
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            ...GLASS_CARD,
            padding: '24px 20px',
            textAlign: 'center',
            marginBottom: 16,
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 18,
            color: 'var(--text-secondary)',
          }}
        >
          Ton cercle est encore vide.
        </div>
      )}

      <button
        type="button"
        data-press
        onClick={onComposeOpen}
        style={{
          appearance: 'none',
          width: '100%',
          padding: '13px 24px',
          minHeight: 44,
          background: 'transparent',
          color: 'var(--blue-700)',
          border: '1.5px solid var(--blue-300)',
          borderRadius: 50,
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {cercle.length === 0 ? 'Composer mon cercle' : 'Voir tout le cercle'}
      </button>
    </div>
  );
}

/* ─── VoicePost — feed glass + accent border-left 4px ─── */

function VoicePost({ post, index, reactions, onReact, onMore }) {
  const [hover, setHover] = useState(false);
  const isRose = index % 2 === 1;
  const accentGradient = isRose ? 'var(--gradient-rose)' : 'var(--gradient-blue)';
  const isShort = wordCount(post.body) < 20;

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        padding: '18px 20px 16px 24px',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 20,
        boxShadow: hover ? '0 12px 32px rgba(10,36,56,0.14)' : 'var(--glass-shadow)',
        overflow: 'hidden',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 240ms cubic-bezier(0.16,1,0.3,1), box-shadow 240ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Accent border-left 4px */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: accentGradient,
          borderRadius: '0 2px 2px 0',
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 18,
            lineHeight: 1.2,
            color: 'var(--blue-900)',
          }}
        >
          {post.pseudo}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 500,
            fontSize: 11,
            color: 'var(--text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {timeAgo(post.createdAt)}
        </span>
      </div>
      <p
        style={{
          margin: '8px 0 14px',
          fontFamily: isShort ? 'var(--font-display)' : 'var(--font-body)',
          fontStyle: isShort ? 'italic' : 'normal',
          fontWeight: 400,
          fontSize: isShort ? 16 : 15,
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
        }}
      >
        {post.body}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                padding: '6px 12px',
                minHeight: 32,
                background: active ? 'rgba(200,112,144,0.10)' : 'rgba(255,255,255,0.5)',
                border: 'none',
                borderRadius: 50,
                color: active ? 'var(--rose-700)' : 'var(--blue-300)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 500,
                fontSize: 11,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                transition: 'color 200ms ease, background 200ms ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span aria-hidden style={{ fontSize: 12 }}>{r.icon}</span>
              <span>{r.label}</span>
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
            width: 32,
            height: 32,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 14,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ⋯
        </button>
      </div>
    </article>
  );
}

/* ─── TemoignageCard — éditorial avec initiales 56×56 ─── */

function TemoignageCard({ temoignage, onOpen }) {
  const [hover, setHover] = useState(false);
  const t = temoignage;

  return (
    <button
      type="button"
      data-press
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
      style={{
        appearance: 'none',
        width: '100%',
        padding: '22px 24px',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderLeft: `4px solid ${t.accent}`,
        borderRadius: 24,
        boxShadow: hover ? '0 12px 32px rgba(10,36,56,0.14)' : 'var(--glass-shadow)',
        cursor: 'pointer',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 240ms cubic-bezier(0.16,1,0.3,1), box-shadow 240ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          aria-hidden
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: t.avatarGradient,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 22,
            boxShadow: '0 4px 12px rgba(10,36,56,0.18)',
          }}
        >
          {t.initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--blue-900)',
              lineHeight: 1.3,
            }}
          >
            {t.name}
          </div>
          <div
            style={{
              marginTop: 2,
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              fontWeight: 500,
              color: 'var(--text-muted)',
              letterSpacing: '0.04em',
            }}
          >
            {t.city}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 20,
          lineHeight: 1.3,
          color: 'var(--blue-900)',
          letterSpacing: 0,
        }}
      >
        {t.title}
      </div>

      <div
        style={{
          marginTop: 12,
          fontFamily: 'var(--font-body)',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {t.body.split('\n\n')[0]}
      </div>

      <div
        style={{
          marginTop: 14,
          ...EYEBROW_BASE,
          color: t.accent,
        }}
      >
        Lire ›
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
          background: 'rgba(10, 36, 56, 0.45)',
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
          background: 'rgba(238, 243, 248, 0.96)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          color: 'var(--blue-900)',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          border: '1px solid var(--glass-border)',
          borderBottom: 'none',
          padding: '12px 24px calc(env(safe-area-inset-bottom, 0px) + 24px)',
          transform: closing ? 'translateY(100%)' : mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 -8px 32px rgba(10, 36, 56, 0.18)',
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
            background: 'rgba(10, 36, 56, 0.18)',
            margin: '0 auto 18px',
          }}
        />

        <h3
          style={{
            margin: '0 0 20px',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 24,
            lineHeight: 1.2,
            color: 'var(--blue-900)',
            letterSpacing: 0,
          }}
        >
          Partager une voix
        </h3>

        {promptText && (
          <p
            style={{
              margin: '0 0 20px',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 18,
              lineHeight: 1.35,
              color: 'var(--blue-900)',
              padding: '14px 16px',
              background: 'rgba(255, 255, 255, 0.55)',
              borderLeft: '3px solid var(--rose-700)',
              borderRadius: 12,
            }}
          >
            {promptText}
          </p>
        )}

        <label
          style={{
            display: 'block',
            marginBottom: 10,
            ...EYEBROW_BASE,
            color: 'var(--text-secondary)',
          }}
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
            padding: 18,
            minHeight: 120,
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
            borderLeft: '4px solid var(--blue-700)',
            borderRadius: 16,
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            fontSize: 16,
            lineHeight: 1.6,
            color: 'var(--blue-900)',
            outline: 'none',
            resize: 'none',
            boxSizing: 'border-box',
            marginBottom: 8,
          }}
        />
        <div
          style={{
            textAlign: 'right',
            fontFamily: 'var(--font-ui)',
            fontWeight: 500,
            fontSize: 11,
            color: body.length >= 260 ? 'var(--rose-700)' : 'var(--text-muted)',
            fontVariantNumeric: 'tabular-nums',
            marginBottom: 20,
          }}
        >
          {280 - body.length}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
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
              border: 'none',
              borderRadius: 50,
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
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
              background: body.trim() ? 'var(--gradient-blue)' : 'rgba(10, 36, 56, 0.10)',
              color: body.trim() ? '#FFFFFF' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 50,
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: body.trim() ? 'pointer' : 'not-allowed',
              boxShadow: body.trim() ? '0 8px 24px rgba(26,90,127,0.30)' : 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Envoyer
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
        background: 'var(--bg)',
        color: 'var(--blue-900)',
        transform: closing ? 'translateX(100%)' : mounted ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Blobs variant="blue-rose" />
      {/* Header */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 24px 14px',
          borderBottom: '1px solid rgba(10, 36, 56, 0.06)',
          flexShrink: 0,
          background: 'rgba(238, 243, 248, 0.78)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
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
            color: 'var(--blue-700)',
            cursor: 'pointer',
            padding: '10px 12px',
            minHeight: 44,
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: 0,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ‹ Retour
        </button>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 22,
            color: 'var(--blue-900)',
          }}
        >
          Toutes les voix
        </span>
        <span style={{ width: 60 }} />
      </div>

      {/* Feed */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '16px 16px calc(env(safe-area-inset-bottom, 0px) + 100px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {posts.map((p, i) => (
          <VoicePost
            key={p.id}
            post={p}
            index={i}
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
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--gradient-blue)',
          color: '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(26,90,127,0.38)',
          fontSize: 22,
          fontWeight: 300,
          zIndex: 2,
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
      timersRef.current.forEach((tm) => clearTimeout(tm));
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
        background: 'var(--bg)',
        color: 'var(--blue-900)',
        transform: closing ? 'translateY(100%)' : mounted ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Blobs variant="blue-rose" />
      {/* Header */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 24px 14px',
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
            color: 'var(--blue-700)',
            cursor: 'pointer',
            padding: '10px 12px',
            minHeight: 44,
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: 0,
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
          position: 'relative',
          zIndex: 1,
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '20px 24px calc(env(safe-area-inset-bottom, 0px) + 80px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            marginBottom: 24,
          }}
        >
          <div
            aria-hidden
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: t.avatarGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 22,
              boxShadow: '0 4px 12px rgba(10,36,56,0.18)',
              flexShrink: 0,
            }}
          >
            {t.initials}
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--blue-900)',
                lineHeight: 1.3,
              }}
            >
              {t.name}
            </div>
            <div
              style={{
                marginTop: 2,
                fontFamily: 'var(--font-ui)',
                fontSize: 10,
                fontWeight: 500,
                color: 'var(--text-muted)',
              }}
            >
              {t.city}
            </div>
          </div>
        </div>

        <h2
          style={{
            margin: '0 0 32px',
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(26px, 6.5vw, 34px)',
            lineHeight: 1.2,
            letterSpacing: 0,
            color: 'var(--blue-900)',
            maxWidth: 540,
            marginInline: 'auto',
          }}
        >
          {t.title}
        </h2>

        <div style={{ maxWidth: 580, marginInline: 'auto' }}>
          {t.body.split('\n\n').map((para, i) => (
            <p
              key={i}
              style={{
                margin: '0 0 20px',
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                fontSize: 16,
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
              }}
            >
              {para}
            </p>
          ))}
        </div>

        <div
          style={{
            marginTop: 48,
            paddingTop: 32,
            borderTop: '1px solid rgba(10, 36, 56, 0.10)',
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 18,
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
          }}
        >
          Une voix parmi d'autres. Tu n'es pas seul·e.
        </div>
      </div>
    </div>
  );
}
