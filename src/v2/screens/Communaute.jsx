/* ============================================================
   ÇA VA ? V7 — Communauté · Design System V4 unifié
   ============================================================
   Migration vers les composants atomiques de
   src/components/ui : Header / GlassCard / Eyebrow / HeroTitle
   / SectionTitle / Body / CTA / tokens.

   Structure :
     1. Topbar glass sticky (titre ÇA VA ?)
     2. Hero glass card 343×280 image + gradient overlay
     3. Question du jour + 3 réponses preview glass mini-cards
     4. Les voix qui passent (GlassCard accent bleu/rose alterné)
     5. Mon cercle horizontal scroll-snap + avatars gradient
     6. Témoignages cards éditoriales avec initiales 56×56
     7. Composer modal premium glass overlay
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
import {
  GlassCard,
  Eyebrow,
  HeroTitle,
  SectionTitle,
  Body,
  CTA,
  Textarea,
  tokens,
  useToast,
} from '../../components/ui';

/* ─── Données ─── */

const HERO_IMAGE = '/img/world-communaute.png';

const REACTIONS = [
  { key: 'touche',    icon: '♡', label: 'Touché·e' },
  { key: 'comprends', icon: '◇', label: 'Comprends' },
  { key: 'lis',       icon: '○', label: 'Lis' },
];

const SEEDED_POSTS = [
  { id: 'seed-1', pseudo: 'Sève',  totem: 'ours',    body: "Je suis fatiguée depuis si longtemps que j’ai oublié à quoi ressemble la fatigue normale.", createdAt: Date.now() - 86400000 * 2, seeded: true },
  { id: 'seed-2', pseudo: 'Élio',  totem: 'aigle',   body: "Le matin c’est le plus dur. Sortir du lit demande tout ce que je n’ai pas.", createdAt: Date.now() - 86400000, seeded: true },
  { id: 'seed-3', pseudo: 'Naïs',  totem: 'daim',    body: "Aujourd’hui j’ai dit non. Pour la première fois depuis longtemps. Et ça m’a fait pleurer.", createdAt: Date.now() - 86400000 * 3, seeded: true },
  { id: 'seed-4', pseudo: 'Rune',  totem: 'baleine', body: "On m’a demandé comment j’allais. J’ai répondu “ça va” mais j’avais envie d’autre chose.", createdAt: Date.now() - 86400000 * 4, seeded: true },
  { id: 'seed-5', pseudo: 'Anya',  totem: 'lion',    body: "Mon corps me parle. Il dit qu’il a besoin que je l’écoute. Je commence juste.", createdAt: Date.now() - 86400000 * 5, seeded: true },
];

const TEMOIGNAGES = [
  {
    id: 't1',
    initials: 'L',
    name: 'Léa, 28 ans',
    city: 'Marseille',
    accent: 'blue',
    accentColor: 'var(--blue-700)',
    avatarGradient: 'var(--gradient-blue)',
    title: "J’ai cru longtemps que demander de l’aide, c’était abandonner.",
    body: "Pendant des années, j’ai porté seule mon anxiété. Je pensais que c’était ma force, ma manière de tenir.\n\nUn jour, j’ai accepté de m’asseoir face à quelqu’un. Pas pour qu’on me sauve. Juste pour qu’on m’écoute.\n\nCe jour-là, je n’ai pas perdu. J’ai posé un poids que je portais depuis l’enfance, sans même savoir qu’il était là.\n\nAujourd’hui je sais : demander de l’aide, c’est commencer à se prendre au sérieux.",
  },
  {
    id: 't2',
    initials: 'T',
    name: 'Théo, 34 ans',
    city: 'Lyon',
    accent: 'rose',
    accentColor: 'var(--rose-700)',
    avatarGradient: 'var(--gradient-rose)',
    title: "Le burn-out ne s’est pas annoncé. Il est arrivé un mardi matin.",
    body: "J’étais en train de me brosser les dents. Et je n’ai pas pu cracher.\n\nMon corps avait dit stop avant que ma tête comprenne. Pendant six mois je n’ai pas pu retravailler.\n\nCe que personne ne m’avait dit, c’est que reconstruire prend du temps. Pas en semaines. En saisons.\n\nJ’ai appris à doser. À dire non. À ne pas reprendre tout d’un coup parce qu’on me croyait “guéri”.\n\nLa fatigue mentale n’est pas une faiblesse. C’est un signal que j’ai mis trente-quatre ans à entendre.",
  },
  {
    id: 't3',
    initials: 'I',
    name: 'Inès, 22 ans',
    city: 'Paris',
    accent: 'violet',
    accentColor: 'var(--violet)',
    avatarGradient: 'var(--gradient-violet)',
    title: "Mon corps avait essayé de me parler. J’ai mis cinq ans à l’entendre.",
    body: "Migraines. Estomac. Insomnies. Je consultais médecin après médecin. Tout allait “normalement”.\n\nC’est une psy qui m’a posé la bonne question : “Et qu’est-ce qui ne va pas, dans ta vie ?”\n\nJ’ai pleuré pendant une heure. Je ne savais pas que j’avais autant de choses à dire.\n\nLes symptômes étaient le langage de ce que je n’osais pas formuler. Le corps tient le sac quand l’esprit refuse de regarder.\n\nAujourd’hui j’écoute. Pas toujours bien. Mais j’écoute.",
  },
  {
    id: 't4',
    initials: 'M',
    name: 'Marc, 41 ans',
    city: 'Bordeaux',
    accent: 'rose',
    accentColor: 'var(--rose-500)',
    avatarGradient: 'linear-gradient(135deg, var(--rose-500), var(--rose-700))',
    title: "Devenir père m’a confronté à un vide que je ne savais pas nommer.",
    body: "On parle beaucoup du baby blues des mères. Personne ne m’avait préparé à ce que ça pouvait remuer chez le père.\n\nJ’avais 41 ans. Une vie carrée. Une carrière. Et soudain, face à ce petit être, j’ai eu peur. Pas peur de mal faire. Peur de moi-même.\n\nDes émotions sont remontées que je croyais réglées depuis longtemps. Mon propre père. Mon enfance.\n\nJ’ai cherché un homme à qui parler. Ça m’a pris du temps. On nous a tellement appris à ne pas demander.\n\nJ’apprends aujourd’hui à ressentir avant d’agir. C’est neuf. C’est étrange. C’est juste.",
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
  if (m < 1) return "à l’instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

function wordCount(s = '') {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

const SECTION_GAP = 48;

/* ============================================================
   Main
   ============================================================ */

export default function Communaute() {
  const toast = useToast();
  const profile = getProfile();
  // BUG-03 fix : prompt par défaut si le store ne renvoie rien d’exploitable.
  const DEFAULT_PROMPT = "Qu’est-ce qui t’a fait du bien aujourd’hui, même un petit truc ?";
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

  // Réponses preview pour la question du jour : 3 propositions (propres + seeds en fallback)
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
    toast.show({ message: 'Ta voix est partagée.', variant: 'success' });
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
        background: tokens.bg,
      }}
      data-world="communaute"
    >
      <Blobs variant="blue-rose" />

      {/* ═══ 1. TOPBAR GLASS STICKY ═══ */}
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
        <HeroTitle size="sm" color="primary" style={{ fontSize: 22, lineHeight: 1 }}>
          ÇA VA ?
        </HeroTitle>
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
            borderRadius: tokens.radius.xxl,
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(10,36,56,0.12)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
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
              zIndex: 2,
              textAlign: 'center',
            }}
          >
            <HeroTitle
              color="white"
              size="md"
              style={{
                textShadow: '0 2px 14px rgba(0,0,0,0.40)',
              }}
            >
              Tu n’es pas seul·e.
            </HeroTitle>
            <Body
              variant="body-sm"
              style={{
                marginTop: 12,
                color: 'rgba(255,255,255,0.85)',
                textAlign: 'center',
              }}
            >
              On peut tout porter, mais pas tout seuls.
            </Body>
          </div>
        </section>

        {/* ═══ 3. QUESTION DU JOUR ═══ */}
        <section style={{ marginBottom: SECTION_GAP }}>
          <Eyebrow color="rose" style={{ marginBottom: 12 }}>
            Question du jour
          </Eyebrow>

          <SectionTitle style={{ marginBottom: 24 }}>
            {dailyPrompt.text}
          </SectionTitle>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {promptPreviewCards.map((p) => (
              <GlassCard key={p.id} radius="md" padding="14px 16px">
                <Body
                  italic
                  style={{
                    fontFamily: tokens.fonts.display,
                    fontSize: 14,
                    lineHeight: 1.2,
                    color: tokens.blue700,
                    marginBottom: 6,
                  }}
                >
                  {p.pseudo}
                </Body>
                <Body variant="body-sm">{p.body}</Body>
              </GlassCard>
            ))}
          </div>

          <CTA
            variant="primary"
            size="md"
            full
            onClick={() => setComposerOpen({ promptId: dailyPrompt.id })}
          >
            {promptResponses.length > 0 ? 'Ajouter une réponse' : 'Répondre'}
          </CTA>
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
            <Eyebrow color="blue">Les voix qui passent</Eyebrow>
            <CTA
              variant="ghost"
              size="sm"
              haptic={false}
              onClick={() => { haptic(2); setAllVoicesOpen(true); }}
              style={{
                padding: '6px 4px',
                minHeight: 'auto',
                color: tokens.blue700,
                letterSpacing: '0.18em',
              }}
            >
              Toutes ›
            </CTA>
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
              <GlassCard radius="xl" padding="32px 24px">
                <Body
                  italic
                  style={{
                    fontFamily: tokens.fonts.display,
                    fontSize: 18,
                    lineHeight: 1.4,
                    textAlign: 'center',
                  }}
                >
                  Les premières voix arrivent.
                </Body>
              </GlassCard>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <CTA
              variant="outline"
              size="md"
              full
              onClick={() => setComposerOpen({ promptId: null })}
            >
              + Partager une voix
            </CTA>
          </div>
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
            <Eyebrow color="violet">Mon cercle</Eyebrow>
            <span
              style={{
                fontFamily: tokens.fonts.ui,
                fontSize: 12,
                fontWeight: 600,
                color: tokens.textSecondary,
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
          <Eyebrow color="rose" style={{ marginBottom: 12 }}>
            Témoignages
          </Eyebrow>
          <Body style={{ marginBottom: 24 }}>
            Des histoires vécues, écrites par d’autres.
          </Body>
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
        <Body
          italic
          style={{
            fontFamily: tokens.fonts.display,
            fontSize: 18,
            lineHeight: 1.5,
            textAlign: 'center',
            marginTop: 32,
          }}
        >
          Ce que tu partages reste anonyme.
          <br />
          Ce que tu lis est offert.
        </Body>
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
            const grad = i % 2 === 0 ? tokens.gradientBlue : tokens.gradientRose;
            const initial = (m.pseudo || '?').charAt(0).toUpperCase();
            return (
              <GlassCard
                key={i}
                radius="lg"
                hoverable
                padding="16px 14px"
                style={{
                  minWidth: 116,
                  scrollSnapAlign: 'start',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  flexShrink: 0,
                  width: 'auto',
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
                    fontFamily: tokens.fonts.display,
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
                    fontFamily: tokens.fonts.display,
                    fontStyle: 'italic',
                    fontWeight: 400,
                    fontSize: 16,
                    color: tokens.blue900,
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
                    fontFamily: tokens.fonts.ui,
                    fontWeight: 500,
                    fontSize: 11,
                    color: tokens.textMuted,
                  }}
                >
                  proche
                </span>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <GlassCard
          radius="xl"
          padding="24px 20px"
          style={{ marginBottom: 16, textAlign: 'center' }}
        >
          <Body
            italic
            style={{
              fontFamily: tokens.fonts.display,
              fontSize: 18,
              textAlign: 'center',
            }}
          >
            Ton cercle est encore vide.
          </Body>
        </GlassCard>
      )}

      <CTA variant="outline" size="md" full onClick={onComposeOpen} haptic={false}>
        {cercle.length === 0 ? 'Composer mon cercle' : 'Voir tout le cercle'}
      </CTA>
    </div>
  );
}

/* ─── VoicePost — GlassCard accent bleu/rose alterné ─── */

function VoicePost({ post, index, reactions, onReact, onMore }) {
  const accent = index % 2 === 1 ? 'rose' : 'blue';
  const isShort = wordCount(post.body) < 20;

  return (
    <GlassCard
      radius="lg"
      accent={accent}
      hoverable
      padding="18px 20px 16px 24px"
    >
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
            fontFamily: tokens.fonts.display,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 18,
            lineHeight: 1.2,
            color: tokens.blue900,
          }}
        >
          {post.pseudo}
        </span>
        <span
          style={{
            fontFamily: tokens.fonts.ui,
            fontWeight: 500,
            fontSize: 11,
            color: tokens.textMuted,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {timeAgo(post.createdAt)}
        </span>
      </div>
      <p
        style={{
          margin: '8px 0 14px',
          fontFamily: isShort ? tokens.fonts.display : tokens.fonts.body,
          fontStyle: isShort ? 'italic' : 'normal',
          fontWeight: 400,
          fontSize: isShort ? 16 : 15,
          lineHeight: 1.6,
          color: tokens.textSecondary,
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
                color: active ? tokens.rose700 : tokens.blue300,
                fontFamily: tokens.fonts.ui,
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
          aria-label="Plus d’options"
          style={{
            marginLeft: 'auto',
            appearance: 'none',
            width: 32,
            height: 32,
            background: 'transparent',
            border: 'none',
            color: tokens.textMuted,
            cursor: 'pointer',
            fontSize: 14,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ⋯
        </button>
      </div>
    </GlassCard>
  );
}

/* ─── TemoignageCard — GlassCard accent + initiales 56×56 ─── */

function TemoignageCard({ temoignage, onOpen }) {
  const t = temoignage;

  return (
    <GlassCard
      radius="xl"
      accent={t.accent}
      hoverable
      onClick={onOpen}
      padding="22px 24px"
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
            fontFamily: tokens.fonts.display,
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
              fontFamily: tokens.fonts.ui,
              fontSize: 12,
              fontWeight: 600,
              color: tokens.blue900,
              lineHeight: 1.3,
            }}
          >
            {t.name}
          </div>
          <div
            style={{
              marginTop: 2,
              fontFamily: tokens.fonts.ui,
              fontSize: 10,
              fontWeight: 500,
              color: tokens.textMuted,
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
          fontFamily: tokens.fonts.display,
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 20,
          lineHeight: 1.3,
          color: tokens.blue900,
          letterSpacing: 0,
        }}
      >
        {t.title}
      </div>

      <div
        style={{
          marginTop: 12,
          fontFamily: tokens.fonts.body,
          fontWeight: 400,
          fontSize: 14,
          lineHeight: 1.6,
          color: tokens.textSecondary,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {t.body.split('\n\n')[0]}
      </div>

      <Eyebrow style={{ marginTop: 14, color: t.accentColor }}>
        Lire ›
      </Eyebrow>
    </GlassCard>
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
          color: tokens.blue900,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          border: '1px solid rgba(255, 255, 255, 0.85)',
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

        <SectionTitle style={{ marginBottom: 20, fontSize: 24, lineHeight: 1.2 }}>
          Partager une voix
        </SectionTitle>

        {promptText && (
          <p
            style={{
              margin: '0 0 20px',
              fontFamily: tokens.fonts.display,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 18,
              lineHeight: 1.35,
              color: tokens.blue900,
              padding: '14px 16px',
              background: 'rgba(255, 255, 255, 0.55)',
              borderLeft: '3px solid var(--rose-700)',
              borderRadius: 12,
            }}
          >
            {promptText}
          </p>
        )}

        <Eyebrow color="secondary" style={{ display: 'block', marginBottom: 10 }}>
          Ta voix
        </Eyebrow>
        <Textarea
          autoFocus
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Ce que tu portes, ce que tu vis. C’est anonyme."
          rows={5}
          maxLength={280}
          accent="blue"
          showCounter
          aria-label="Ta voix"
          textareaStyle={{ minHeight: 120, fontSize: 16 }}
          style={{ marginBottom: 20 }}
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <CTA
            variant="ghost"
            size="md"
            onClick={handleClose}
            style={{ flex: 1 }}
          >
            Annuler
          </CTA>
          <CTA
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!body.trim()}
            style={{ flex: 1 }}
          >
            Envoyer
          </CTA>
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
        background: tokens.bg,
        color: tokens.blue900,
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
        <CTA
          variant="ghost"
          size="sm"
          haptic={false}
          onClick={handleClose}
          aria-label="Retour"
          style={{
            color: tokens.blue700,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: 0,
            textTransform: 'none',
            padding: '10px 12px',
          }}
        >
          ‹ Retour
        </CTA>
        <span
          style={{
            fontFamily: tokens.fonts.display,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 22,
            color: tokens.blue900,
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
          background: tokens.gradientBlue,
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
        background: tokens.bg,
        color: tokens.blue900,
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
        <CTA
          variant="ghost"
          size="sm"
          haptic={false}
          onClick={handleClose}
          aria-label="Retour"
          style={{
            color: tokens.blue700,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: 0,
            textTransform: 'none',
            padding: '10px 12px',
          }}
        >
          ‹ Témoignages
        </CTA>
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
              fontFamily: tokens.fonts.display,
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
                fontFamily: tokens.fonts.ui,
                fontSize: 12,
                fontWeight: 600,
                color: tokens.blue900,
                lineHeight: 1.3,
              }}
            >
              {t.name}
            </div>
            <div
              style={{
                marginTop: 2,
                fontFamily: tokens.fonts.ui,
                fontSize: 10,
                fontWeight: 500,
                color: tokens.textMuted,
              }}
            >
              {t.city}
            </div>
          </div>
        </div>

        <HeroTitle
          size="md"
          color="primary"
          style={{
            margin: '0 auto 32px',
            maxWidth: 540,
            textAlign: 'center',
            fontSize: 'clamp(26px, 6.5vw, 34px)',
            lineHeight: 1.2,
          }}
        >
          {t.title}
        </HeroTitle>

        <div style={{ maxWidth: 580, marginInline: 'auto' }}>
          {t.body.split('\n\n').map((para, i) => (
            <Body
              key={i}
              style={{
                marginBottom: 20,
                fontSize: 16,
                lineHeight: 1.7,
              }}
            >
              {para}
            </Body>
          ))}
        </div>

        <Body
          italic
          style={{
            fontFamily: tokens.fonts.display,
            fontSize: 18,
            lineHeight: 1.5,
            textAlign: 'center',
            marginTop: 48,
            paddingTop: 32,
            borderTop: '1px solid rgba(10, 36, 56, 0.10)',
          }}
        >
          Une voix parmi d’autres. Tu n’es pas seul·e.
        </Body>
      </div>
    </div>
  );
}
