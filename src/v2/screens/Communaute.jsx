/* ============================================================
   NÉYA V3 — Communauté · Espace Vrai (LIGHT MODE)
   ============================================================
   Wash renard (peach + rose) + ink text + cards pearl.
   3 réactions ❤️ 🤝 👀 toggle local. Composer 280 chars.
   + Daily prompt header · Sub-tabs filter · Topic tags · Crisis soft prompt
   ============================================================ */

import { useState, useEffect, useMemo, useRef } from 'react';
import { WORLDS } from '../worlds';
import {
  haptic,
  ls,
  getProfile,
  getDailyPrompt,
  detectCrisisKeywords,
  getBoueeDuJour,
  markBoueeDone,
  isBoueeDoneToday,
  addSouvenir,
  addToCercle,
} from '../state';
import Button from '../../components/Button';
import ActionSheet from '../../components/ActionSheet';
import SegmentedControl from '../../components/SegmentedControl';
import ContextMenu from '../../components/ContextMenu';
import Cercle from './Cercle';
import Aide from './Aide';
import EspacesIRL from './EspacesIRL';
import usePullToRefresh from '../hooks/usePullToRefresh';

const LEVEL_COLORS = {
  corps:  'var(--emerald)',
  lien:   'var(--terracotta)',
  esprit: 'var(--mist-blue)',
  monde:  'var(--ochre)',
};
const LEVEL_LABELS = {
  corps:  'CORPS',
  lien:   'LIEN',
  esprit: 'ESPRIT',
  monde:  'MONDE',
};

const REACTIONS = [
  { key: 'touche',    icon: '♡', label: 'Touché·e' },
  { key: 'comprends', icon: '◇', label: 'Je comprends' },
  { key: 'lis',       icon: '○', label: 'Je te lis' },
];

const TAG_COLORS = {
  'présence':  'var(--mist-blue)',
  'gratitude': 'var(--emerald)',
  'manque':    'var(--terracotta)',
  'tendresse': 'var(--terracotta)',
  'fardeau':   'var(--cava-purple)',
  'joie':      'var(--tilleul)',
  'peur':      'var(--cava-purple)',
  'deuil':     'var(--cava-purple)',
  'ressource': 'var(--emerald)',
  'écoute':    'var(--mist-blue)',
};

const COMPOSER_TAGS = ['présence', 'gratitude', 'tendresse', 'fardeau', 'joie'];

const quickLinkStyle = (accent) => ({
  appearance: 'none',
  flex: 1,
  padding: '12px 14px',
  background: 'rgba(255, 252, 245, 0.78)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: `0.5px solid ${accent}`,
  borderRadius: 'var(--radius-pill)',
  fontFamily: 'var(--font-ui)',
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.04em',
  color: accent,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
  boxShadow: '0 2px 8px rgba(26, 26, 47, 0.04)',
});

const SEEDED = [
  {
    id: 'seed-1',
    pseudo: 'Sève',
    totem: 'ours',
    body: 'Je suis fatiguée depuis si longtemps que j’ai oublié à quoi ressemble la fatigue normale.',
    minutesAgo: 18,
    isShort: false,
    reactions: { touche: 14, comprends: 31, lis: 22 },
    tag: 'fardeau',
  },
  {
    id: 'seed-2',
    pseudo: 'Vega',
    totem: 'daim',
    body: 'Le soir est tombé doucement, j’ai respiré.',
    minutesAgo: 42,
    isShort: true,
    reactions: { touche: 8, comprends: 4, lis: 12 },
    tag: 'gratitude',
  },
  {
    id: 'seed-3',
    pseudo: 'Orme',
    totem: 'lion',
    body: 'Première fois en six mois que j’arrive à dire « non » sans me sentir coupable. C’est petit mais ça compte.',
    minutesAgo: 95,
    isShort: false,
    reactions: { touche: 47, comprends: 19, lis: 34 },
    tag: 'tendresse',
  },
  {
    id: 'seed-4',
    pseudo: 'Mireille',
    totem: 'renard',
    body: 'Personne ne sait que je vais mal et c’est fatigant.',
    minutesAgo: 140,
    isShort: true,
    reactions: { touche: 28, comprends: 41, lis: 17 },
    tag: 'manque',
  },
  {
    id: 'seed-5',
    pseudo: 'Hayat',
    totem: 'baleine',
    body: 'Je crois que ce que je prenais pour de l’anxiété, c’était juste de l’épuisement. Je commence à comprendre la différence et ça change tout.',
    minutesAgo: 240,
    isShort: false,
    reactions: { touche: 22, comprends: 38, lis: 29 },
    tag: 'présence',
  },
  {
    id: 'seed-6',
    pseudo: 'Hélio',
    totem: 'aigle',
    body: 'Tu n’es pas seul·e.',
    minutesAgo: 410,
    isShort: true,
    reactions: { touche: 156, comprends: 89, lis: 124 },
    tag: 'écoute',
  },
];

const TOTEM_GLYPH = {
  lion: '◆', ours: '◇', aigle: '△', daim: '✦', baleine: '○', renard: '▽',
};

const SPIRIT_PHOTO = {
  lion:    '/img/spirit-lion.png',
  ours:    '/img/spirit-ours.png',
  aigle:   '/img/spirit-aigle.png',
  daim:    '/img/spirit-daim.png',
  baleine: '/img/spirit-baleine.png',
  renard:  '/img/spirit-renard.png',
};

function formatTime(min) {
  if (min < 1) return 'à l’instant';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h}h`;
  return 'hier';
}

const loadOwnPosts = () => ls.get('communaute_posts', []);
const saveOwnPosts = (p) => ls.set('communaute_posts', p);
const loadReactions = () => ls.get('communaute_reactions', {});
const saveReactions = (s) => ls.set('communaute_reactions', s);

export default function Communaute() {
  const [ownPosts, setOwnPosts] = useState(() => loadOwnPosts());
  const [reactionState, setReactionState] = useState(() => loadReactions());
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [expandedSet, setExpandedSet] = useState(() => new Set());
  const [subFilter, setSubFilter] = useState('all'); // 'all' | 'reacted' | 'mine'
  const [composerPlaceholder, setComposerPlaceholder] = useState(null);
  const [composerTag, setComposerTag] = useState('présence');
  const [cercleOpen, setCercleOpen] = useState(false);
  const [hideCrisisAlert, setHideCrisisAlert] = useState(false);
  const [aideOpen, setAideOpen] = useState(false);
  const [irlOpen, setIrlOpen] = useState(false);
  const [actionSheet, setActionSheet] = useState(null); // { type: 'delete-post', postId } | null
  const [contextMenu, setContextMenu] = useState(null); // { post, position } | null
  const longPressTimerRef = useRef(null);
  const longPressFiredRef = useRef(false);

  const prompt = useMemo(() => getDailyPrompt(), []);

  // ── Long-press helpers (iOS standard 500ms) ─────────────
  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };
  const openContextMenu = (post, x, y) => {
    haptic(6);
    longPressFiredRef.current = true;
    setContextMenu({ post, position: { x, y } });
  };
  const startLongPress = (post, e) => {
    // Stop propagation so App.jsx global long-press timer never fires
    // on top of our 500ms post long-press (Bug 1 — gesture conflict).
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    longPressFiredRef.current = false;
    const touch = e.touches && e.touches[0];
    const x = touch ? touch.clientX : 0;
    const y = touch ? touch.clientY : 0;
    clearLongPress();
    longPressTimerRef.current = setTimeout(() => {
      openContextMenu(post, x, y);
    }, 500);
  };
  const handleRightClick = (post, e) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(post, e.clientX, e.clientY);
  };

  useEffect(() => () => clearLongPress(), []);

  // Pull-to-refresh : simulate fresh content (no backend yet)
  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    setOwnPosts((prev) => [...prev]); // trigger re-render
    haptic([4, 60, 4]);
  };
  const { bindScroll, pullY, isPulling, isRefreshing, reachedThreshold } = usePullToRefresh({ onRefresh: handleRefresh });

  const toggleExpand = (id) => {
    haptic(3);
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const profile = getProfile();
  const wRenard = WORLDS.communaute;

  // allVoices is always seeded; no empty state needed
  const allVoices = useMemo(() => {
    const withMyTimes = ownPosts.map((p) => ({
      ...p,
      minutesAgo: Math.max(0, Math.floor((Date.now() - p.createdAt) / 60000)),
      mine: true,
    }));
    return [...withMyTimes, ...SEEDED].slice(0, 24);
  }, [ownPosts]);

  const filteredVoices = useMemo(() => {
    if (subFilter === 'mine') return allVoices.filter((v) => v.mine === true);
    if (subFilter === 'reacted') {
      return allVoices.filter((v) => {
        const r = reactionState[v.id];
        if (!r) return false;
        return Object.values(r).some(Boolean);
      });
    }
    return allVoices;
  }, [allVoices, subFilter, reactionState]);

  const totalVoices = allVoices.length;
  const ownCount = ownPosts.length;

  const deletePost = (id) => {
    haptic([4, 60, 4]);
    setActionSheet({ type: 'delete-post', postId: id });
  };

  const toggleReaction = (postId, rKey) => {
    const cur = reactionState[postId] || {};
    const next = { ...cur, [rKey]: !cur[rKey] };
    const updated = { ...reactionState, [postId]: next };
    setReactionState(updated);
    saveReactions(updated);
    haptic(4);
  };

  const openComposer = (placeholder = null, defaultTag = null) => {
    haptic(6);
    setComposerPlaceholder(placeholder);
    if (defaultTag && TAG_COLORS[defaultTag]) setComposerTag(defaultTag);
    setComposerOpen(true);
  };

  const closeComposer = () => {
    setComposerOpen(false);
    setDraft('');
    setComposerPlaceholder(null);
    setHideCrisisAlert(false);
  };

  const submitPost = () => {
    const text = draft.trim();
    if (!text || text.length > 280) return;
    const newPost = {
      id: `own-${Date.now()}`,
      pseudo: profile.pseudo || 'Toi',
      totem: profile.totem || 'lion',
      body: text,
      createdAt: Date.now(),
      isShort: text.length < 80,
      reactions: { touche: 0, comprends: 0, lis: 0 },
      tag: composerTag,
    };
    const next = [newPost, ...ownPosts];
    setOwnPosts(next);
    saveOwnPosts(next);
    setDraft('');
    setComposerOpen(false);
    setComposerPlaceholder(null);
    setHideCrisisAlert(false);
    haptic([6, 30, 6]);
  };

  const switchSubFilter = (key) => {
    haptic(4);
    setSubFilter(key);
  };

  const SUB_TABS = [
    { key: 'all',     label: 'Toutes' },
    { key: 'reacted', label: 'Touchées' },
    { key: 'mine',    label: 'Mes voix' },
  ];

  const promptTagColor = TAG_COLORS[prompt.tag] || 'var(--terracotta)';

  return (
    <div
      className="wash-renard"
      style={{
        position: 'absolute',
        inset: 0,
        color: 'var(--ink)',
      }}
    >
      {/* Atmospheric bg overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${wRenard.bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.06,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />
      <div
        {...bindScroll}
        style={{
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: 'calc(env(safe-area-inset-top, 0px) + 22px) 22px calc(env(safe-area-inset-bottom, 0px) + 170px)',
        }}
      >
        {/* Pull-to-refresh indicator + spinner keyframe injected once */}
        <style>{`@keyframes neya-ptr-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <div
          style={{
            position: 'relative',
            height: pullY,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            pointerEvents: 'none',
            overflow: 'hidden',
            transition: isPulling ? 'none' : 'height 320ms var(--ease-spring-ios)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: `1.5px solid ${reachedThreshold || isRefreshing ? 'var(--tilleul)' : 'var(--hairline-strong)'}`,
              borderTopColor: isRefreshing ? 'transparent' : (reachedThreshold ? 'var(--tilleul)' : 'var(--hairline-strong)'),
              animation: isRefreshing ? 'neya-ptr-spin 800ms linear infinite' : 'none',
              transform: isRefreshing ? 'none' : `scale(${Math.min(1, pullY / 80)}) rotate(${pullY * 3}deg)`,
              marginBottom: 8,
              transition: isPulling ? 'none' : 'transform 240ms var(--ease-spring-ios)',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
            ESPACE VRAI · CHAPITRE 06
          </div>
          <button
            data-press
            onClick={() => { haptic(4); setCercleOpen(true); }}
            style={{
              appearance: 'none',
              background: 'transparent',
              border: 'none',
              padding: '4px 8px',
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--tilleul)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 11 }}>✦</span>
            Mon cercle
          </button>
        </div>
        <h1
          className="neya-h1"
          style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}
        >
          {ownCount > 0 ? (
            <>
              <em className="neya-key">{totalVoices}</em> voix aujourd’hui, dont la <em className="neya-key">tienne</em>.
            </>
          ) : (
            <>
              <em className="neya-key">{totalVoices}</em> voix aujourd’hui.
            </>
          )}
        </h1>
        <p
          className="neya-body-sm"
          style={{
            color: 'var(--content-secondary)',
            marginBottom: 20,
            maxWidth: 360,
          }}
        >
          Personne ne juge. Personne ne compte les likes. Tu peux dire ce que tu veux,
          ce qui est vrai.
        </p>

        {/* Quick links — Aide & ressources + Espaces IRL */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            data-press
            onClick={() => { haptic(4); setAideOpen(true); }}
            style={quickLinkStyle('var(--terracotta)')}
          >
            ♡ Aide & ressources
          </button>
          <button
            data-press
            onClick={() => { haptic(4); setIrlOpen(true); }}
            style={quickLinkStyle('var(--ochre)')}
          >
            ↗ Espaces IRL
          </button>
        </div>

        {/* Bouée du jour — micro-action concrète */}
        <BoueeDuJour />

        {/* Feature 1 — Daily Prompt header */}
        <div
          className="stagger"
          style={{
            background: 'var(--cream-light)',
            border: '0.5px solid var(--terracotta)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            boxShadow: '0 2px 14px rgba(26, 26, 47, 0.04)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: '0.20em',
                textTransform: 'uppercase',
                color: promptTagColor,
                marginBottom: 8,
              }}
            >
              INVITATION DU JOUR · {prompt.tag.toUpperCase()}
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(20px, 5vw, 24px)',
                lineHeight: 1.3,
                color: 'var(--ink)',
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                marginBottom: 8,
              }}
            >
              {prompt.q}
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                color: 'var(--ink-soft)',
                lineHeight: 1.45,
              }}
            >
              Tu peux répondre ici, ou pas. Aucune obligation.
            </p>
          </div>
          <button
            data-press
            onClick={() => openComposer(prompt.q, prompt.tag)}
            style={{
              appearance: 'none',
              background: 'transparent',
              border: '0.5px solid rgba(26, 26, 47, 0.16)',
              borderRadius: 'var(--radius-pill, 999px)',
              padding: '8px 12px',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
              flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
              whiteSpace: 'nowrap',
            }}
            aria-label="Répondre à l'invitation du jour"
          >
            Répondre →
          </button>
        </div>

        {/* Feature 2 — Sub-tabs (Apple iOS Segmented Control) */}
        <div style={{ marginBottom: 18 }}>
          <SegmentedControl
            segments={[
              { value: 'all',     label: 'Toutes' },
              { value: 'reacted', label: 'Touchées' },
              { value: 'mine',    label: 'Mes voix' },
            ]}
            active={subFilter}
            onChange={(v) => setSubFilter(v)}
            accent={wRenard.accent}
          />
        </div>

        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredVoices.length === 0 ? (
            <div
              style={{
                background: 'rgba(255, 252, 245, 0.78)',
                border: '0.5px solid rgba(26, 26, 47, 0.08)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 18px',
                textAlign: 'center',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontStyle: 'italic',
                color: 'var(--content-tertiary)',
              }}
            >
              {subFilter === 'mine'
                ? 'Tu n’as pas encore partagé de voix. C’est quand tu veux.'
                : 'Aucune voix dans ce filtre pour le moment.'}
            </div>
          ) : filteredVoices.map((v) => {
            const my = reactionState[v.id] || {};
            const isDissipated = v.minutesAgo > 1440;
            const hoursLeft = v.mine ? Math.max(0, 24 - Math.floor(v.minutesAgo / 60)) : null;
            const tagColor = v.tag ? (TAG_COLORS[v.tag] || 'var(--content-tertiary)') : null;
            return (
              <div
                key={v.id}
                data-no-crisis-press="true"
                onTouchStart={(e) => startLongPress(v, e)}
                onTouchEnd={clearLongPress}
                onTouchMove={clearLongPress}
                onTouchCancel={clearLongPress}
                onContextMenu={(e) => handleRightClick(v, e)}
                style={{
                  background: 'rgba(255, 252, 245, 0.78)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  border: '0.5px solid rgba(26, 26, 47, 0.08)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 18px',
                  boxShadow: '0 2px 14px rgba(26, 26, 47, 0.04)',
                  opacity: isDissipated ? 0.5 : 1,
                  transition: 'opacity 300ms var(--ease-out)',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  WebkitTouchCallout: 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        fontFamily: 'var(--font-ui)',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--ink)',
                      }}
                    >
                      <button
                        data-press={v.mine ? undefined : true}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (v.mine) return;
                          haptic(4);
                          if (typeof window !== 'undefined' && window.confirm) {
                            if (window.confirm(`Ajouter ${v.pseudo} à ton cercle ?`)) {
                              addToCercle(v.pseudo);
                              haptic([6, 30, 6]);
                            }
                          }
                        }}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                        onContextMenu={(e) => e.stopPropagation()}
                        disabled={v.mine}
                        aria-label={v.mine ? undefined : `Ajouter ${v.pseudo} à ton cercle`}
                        style={{
                          appearance: 'none',
                          background: 'transparent',
                          border: 'none',
                          padding: '2px 4px',
                          margin: '-2px -4px',
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                          fontWeight: 'inherit',
                          color: 'inherit',
                          cursor: v.mine ? 'default' : 'pointer',
                          WebkitTapHighlightColor: 'transparent',
                          lineHeight: 1.2,
                        }}
                      >
                        {v.pseudo}
                      </button>
                      {v.mine && (
                        <span
                          style={{
                            fontSize: 9,
                            color: wRenard.accent,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            fontWeight: 500,
                          }}
                        >
                          · toi
                        </span>
                      )}
                    </span>
                    {SPIRIT_PHOTO[v.totem] ? (
                      <img
                        src={SPIRIT_PHOTO[v.totem]}
                        alt=""
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '0.5px solid rgba(26, 26, 47, 0.10)',
                          verticalAlign: 'middle',
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--content-tertiary)',
                          lineHeight: 1,
                        }}
                      >
                        {TOTEM_GLYPH[v.totem] || '◇'}
                      </span>
                    )}
                    {v.tag && (
                      <span
                        style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: 9,
                          fontWeight: 500,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: tagColor,
                          lineHeight: 1,
                        }}
                      >
                        · {v.tag}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 10,
                      color: 'var(--content-tertiary)',
                      fontStyle: v.mine && !isDissipated ? 'italic' : 'normal',
                    }}
                  >
                    {v.mine && !isDissipated ? `dans ${hoursLeft}h` : formatTime(v.minutesAgo)}
                  </span>
                </div>

                {v.isShort ? (
                  <p
                    style={{
                      margin: 0,
                      fontFamily: 'var(--font-display)',
                      fontSize: 18,
                      fontStyle: 'italic',
                      fontWeight: 400,
                      lineHeight: 1.4,
                      color: 'var(--ink)',
                      fontVariationSettings: 'var(--fraunces-italic-soft)',
                    }}
                  >
                    « {v.body} »
                  </p>
                ) : (
                  (() => {
                    const isLong = v.body.length > 220;
                    const isExpanded = expandedSet.has(v.id);
                    const truncated = isLong && !isExpanded
                      ? v.body.slice(0, 180).trimEnd() + ' …'
                      : v.body;
                    return (
                      <p
                        style={{
                          margin: 0,
                          fontFamily: 'var(--font-body)',
                          fontSize: 14,
                          lineHeight: 1.55,
                          color: 'var(--ink)',
                        }}
                      >
                        <span
                          style={{
                            opacity: isExpanded ? 1 : (isLong ? 1 : 1),
                            transition: 'opacity 280ms var(--ease-out)',
                          }}
                        >
                          {truncated}
                        </span>
                        {isLong && (
                          <>
                            {' '}
                            <button
                              data-press
                              onClick={() => toggleExpand(v.id)}
                              style={{
                                appearance: 'none',
                                background: 'transparent',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                fontFamily: 'var(--font-ui)',
                                fontSize: 9,
                                fontWeight: 500,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                color: 'var(--content-tertiary)',
                                WebkitTapHighlightColor: 'transparent',
                                verticalAlign: 'baseline',
                                lineHeight: 1.55,
                              }}
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? 'réduire' : 'lire plus'}
                            </button>
                          </>
                        )}
                      </p>
                    );
                  })()
                )}

                {isDissipated && (
                  <p
                    style={{
                      margin: '10px 0 0 0',
                      fontFamily: 'var(--font-ui)',
                      fontSize: 9,
                      fontStyle: 'italic',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'var(--content-tertiary)',
                    }}
                  >
                    « Cette voix s’est dissipée. »
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: '0.5px solid rgba(26, 26, 47, 0.08)',
                  }}
                >
                  {REACTIONS.map((r) => {
                    const isOn = !!my[r.key];
                    const count = (v.reactions[r.key] || 0) + (isOn ? 1 : 0);
                    return (
                      <button
                        key={r.key}
                        data-press
                        onClick={() => toggleReaction(v.id, r.key)}
                        style={{
                          appearance: 'none',
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer',
                          color: isOn ? wRenard.accent : 'var(--content-tertiary)',
                          fontFamily: 'var(--font-ui)',
                          fontSize: 11,
                          fontWeight: 500,
                          WebkitTapHighlightColor: 'transparent',
                          transition: 'color 200ms var(--ease-out)',
                        }}
                        aria-label={r.label}
                      >
                        <span style={{ fontSize: 14, lineHeight: 1 }}>{r.icon}</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</span>
                      </button>
                    );
                  })}
                  {v.mine && (
                    <button
                      data-press
                      onClick={() => deletePost(v.id)}
                      style={{
                        marginLeft: 'auto',
                        appearance: 'none',
                        background: 'transparent',
                        border: 'none',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        color: 'var(--content-tertiary)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: 9,
                        fontWeight: 500,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                      aria-label="Supprimer cette voix"
                    >
                      supprimer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 24,
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            fontStyle: 'italic',
            color: 'var(--content-tertiary)',
            lineHeight: 1.55,
            padding: '0 24px',
          }}
        >
          Ce que tu écris ici reste 24h. Aucune note. Aucun classement.
        </div>
      </div>

      {/* Sticky composer CTA */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
          display: 'flex',
          justifyContent: 'center',
          padding: '0 22px',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <Button
            size="md"
            variant="primary"
            onClick={() => openComposer()}
            style={{
              background: 'var(--ink)',
              color: 'var(--cream)',
              boxShadow: '0 8px 24px rgba(26, 26, 47, 0.18)',
            }}
          >
            Partager une voix ↑
          </Button>
        </div>
      </div>

      {composerOpen && (
        <Composer
          draft={draft}
          setDraft={setDraft}
          onSubmit={submitPost}
          onClose={closeComposer}
          pseudo={profile.pseudo || 'Toi'}
          totem={profile.totem || 'lion'}
          placeholder={composerPlaceholder}
          selectedTag={composerTag}
          setSelectedTag={setComposerTag}
          hideCrisisAlert={hideCrisisAlert}
          setHideCrisisAlert={setHideCrisisAlert}
        />
      )}

      {cercleOpen && <Cercle onClose={() => setCercleOpen(false)} />}

      {aideOpen && <Aide onClose={() => setAideOpen(false)} />}

      {irlOpen && <EspacesIRL onClose={() => setIrlOpen(false)} />}

      {actionSheet && actionSheet.type === 'delete-post' && (
        <ActionSheet
          title="Effacer cette voix ?"
          description="Tu ne pourras plus la retrouver. Tes réactions sur d'autres voix restent."
          actions={[
            {
              label: 'Effacer',
              role: 'destructive',
              icon: '⌫',
              onTap: () => {
                const remaining = ownPosts.filter((p) => p.id !== actionSheet.postId);
                setOwnPosts(remaining);
                saveOwnPosts(remaining);
                haptic([6, 30, 6]);
              },
            },
          ]}
          onClose={() => setActionSheet(null)}
        />
      )}

      {/* Long-press context menu on voice cards */}
      {contextMenu && (() => {
        const v = contextMenu.post;
        const userReacted = !!(reactionState[v.id] && reactionState[v.id].touche);
        const items = [];
        items.push({
          label: 'Copier le texte',
          icon: '⎘',
          onTap: () => {
            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(v.body);
              }
            } catch (_) { /* no-op */ }
          },
        });
        if (!userReacted) {
          items.push({
            label: 'Réagir avec ♡',
            icon: '♡',
            onTap: () => toggleReaction(v.id, 'touche'),
          });
        }
        items.push({
          label: 'Signaler cette voix',
          icon: '⚐',
          onTap: () => {
            const ok = typeof window !== 'undefined' && window.confirm
              ? window.confirm('Signaler cette voix au modérateur ?')
              : true;
            if (ok) {
              const flagged = ls.get('flagged_posts', []);
              if (!flagged.includes(v.id)) {
                ls.set('flagged_posts', [...flagged, v.id]);
              }
            }
          },
        });
        if (v.mine) {
          items.push({
            label: 'Effacer ma voix',
            role: 'destructive',
            icon: '⌫',
            onTap: () => setActionSheet({ type: 'delete-post', postId: v.id }),
          });
        }
        return (
          <ContextMenu
            isOpen={true}
            position={contextMenu.position}
            items={items}
            onClose={() => setContextMenu(null)}
          />
        );
      })()}
    </div>
  );
}

function BoueeDuJour() {
  const bouee = useMemo(() => getBoueeDuJour(), []);
  const [done, setDone] = useState(() => isBoueeDoneToday(bouee.id));
  const [dismissed, setDismissed] = useState(false);
  const [pop, setPop] = useState(false);

  const levelColor = LEVEL_COLORS[bouee.level] || 'var(--tilleul)';
  const levelLabel = LEVEL_LABELS[bouee.level] || bouee.level.toUpperCase();

  const onMarkDone = () => {
    haptic([6, 30, 6]);
    markBoueeDone(bouee.id);
    addSouvenir({ type: 'bouee', label: bouee.action, detail: bouee.level });
    setPop(true);
    setTimeout(() => {
      setDone(true);
      setPop(false);
    }, 400);
  };

  const onLater = () => {
    haptic(3);
    setDismissed(true);
  };

  if (dismissed && !done) return null;

  if (done) {
    return (
      <div
        className="stagger"
        style={{
          background: 'var(--cream-light)',
          border: '0.5px solid var(--tilleul)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 20px',
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 2px 14px rgba(26, 26, 47, 0.04)',
        }}
      >
        <span
          style={{
            fontSize: 18,
            color: 'var(--tilleul)',
            lineHeight: 1,
          }}
        >
          ✓
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.222em',
              textTransform: 'uppercase',
              color: 'var(--tilleul)',
            }}
          >
            FAITE AUJOURD’HUI
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: 1.35,
              color: 'var(--ink)',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
            }}
          >
            « Tu es là. »
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="stagger"
      style={{
        background: 'var(--cream-light)',
        border: '0.5px solid var(--tilleul)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 20px',
        marginBottom: 18,
        boxShadow: '0 2px 14px rgba(26, 26, 47, 0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: levelColor,
          }}
        >
          BOUÉE DU JOUR · {levelLabel}
        </div>
        <span
          style={{
            fontSize: 11,
            color: 'var(--tilleul)',
            letterSpacing: '0.18em',
          }}
        >
          ✦
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 28,
            lineHeight: 1,
            color: levelColor,
            flexShrink: 0,
            display: 'inline-block',
            transform: pop ? 'scale(1.4)' : 'scale(1)',
            transition: 'transform 400ms var(--ease-out), color 400ms var(--ease-out)',
          }}
        >
          {pop ? '✓' : bouee.icon}
        </span>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(20px, 5vw, 24px)',
            lineHeight: 1.3,
            color: 'var(--ink)',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            flex: 1,
          }}
        >
          {bouee.action}
        </p>
      </div>

      <p
        style={{
          margin: 0,
          marginBottom: 14,
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          color: 'var(--ink-soft)',
          lineHeight: 1.5,
        }}
      >
        Une petite chose, juste pour aujourd’hui. Tu peux marquer faite quand c’est fait.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          data-press
          onClick={onMarkDone}
          style={{
            appearance: 'none',
            background: 'var(--ink)',
            color: 'var(--cream)',
            border: 'none',
            borderRadius: 'var(--radius-pill, 999px)',
            padding: '8px 14px',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            WebkitTapHighlightColor: 'transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          Marquer faite <span style={{ fontSize: 12 }}>✓</span>
        </button>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            color: 'var(--content-tertiary)',
            letterSpacing: '0.04em',
          }}
        >
          ou
        </span>
        <button
          data-press
          onClick={onLater}
          style={{
            appearance: 'none',
            background: 'transparent',
            color: 'var(--ink-soft)',
            border: '0.5px solid rgba(26, 26, 47, 0.16)',
            borderRadius: 'var(--radius-pill, 999px)',
            padding: '8px 14px',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}

function Composer({
  draft,
  setDraft,
  onSubmit,
  onClose,
  pseudo,
  totem,
  placeholder,
  selectedTag,
  setSelectedTag,
  hideCrisisAlert,
  setHideCrisisAlert,
}) {
  const charsLeft = 280 - draft.length;
  const canSubmit = draft.trim().length > 0 && draft.length <= 280;
  const showCrisis = !hideCrisisAlert && detectCrisisKeywords(draft);

  const openCrisisSpace = () => {
    haptic([6, 40, 6]);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('neya:open-crisis'));
    }
    // TODO (Will) : si App.jsx n'écoute pas encore 'neya:open-crisis', wire le listener côté App.
  };

  return (
    <div
      data-no-crisis-press="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(26, 26, 47, 0.30)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: 'var(--cream-light)',
          borderTop: '0.5px solid rgba(26, 26, 47, 0.10)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          padding: '22px 22px calc(env(safe-area-inset-bottom, 0px) + 22px)',
          boxShadow: '0 -8px 32px rgba(26, 26, 47, 0.14)',
          maxHeight: '90dvh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="drag-handle" style={{ marginBottom: 18 }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
            EN TANT QUE · {pseudo} {TOTEM_GLYPH[totem] || '◇'}
          </div>
          <button
            data-press
            onClick={onClose}
            aria-label="Fermer"
            style={{
              appearance: 'none',
              background: 'rgba(26, 26, 47, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: 'var(--ink)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            ✕
          </button>
        </div>

        {/* Feature 3 — Tag picker chips above textarea */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: 12,
            flexWrap: 'wrap',
          }}
        >
          {COMPOSER_TAGS.map((tag) => {
            const isSelected = selectedTag === tag;
            const color = TAG_COLORS[tag] || 'var(--content-tertiary)';
            return (
              <button
                key={tag}
                data-press
                onClick={() => { haptic(3); setSelectedTag(tag); }}
                style={{
                  appearance: 'none',
                  height: 22,
                  padding: '0 10px',
                  background: 'var(--cream-light)',
                  border: `0.5px solid ${isSelected ? color : 'rgba(26, 26, 47, 0.14)'}`,
                  borderRadius: 'var(--radius-pill, 999px)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 9,
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: isSelected ? color : 'var(--ink-soft)',
                  WebkitTapHighlightColor: 'transparent',
                  display: 'inline-flex',
                  alignItems: 'center',
                  lineHeight: 1,
                  transition: 'color 180ms var(--ease-out), border-color 180ms var(--ease-out)',
                }}
                aria-pressed={isSelected}
              >
                {tag}
              </button>
            );
          })}
        </div>

        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder || 'Dis ce qui est vrai pour toi maintenant…'}
          rows={5}
          maxLength={280}
          style={{
            width: '100%',
            background: 'rgba(26, 26, 47, 0.04)',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            color: 'var(--ink)',
            lineHeight: 1.5,
            padding: 12,
            borderRadius: 8,
          }}
        />

        {/* Feature 4 — Crisis soft prompt */}
        {showCrisis && (
          <div
            style={{
              marginTop: 12,
              background: 'var(--cream-light)',
              border: '0.5px solid var(--terracotta)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 14px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: 1.4,
                color: 'var(--ink)',
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                marginBottom: 4,
              }}
            >
              « Tu n’es pas seul·e. »
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                color: 'var(--ink-soft)',
                lineHeight: 1.5,
                marginBottom: 10,
              }}
            >
              Si tu veux parler à quelqu’un maintenant, l’espace SOS est là pour toi. Tu peux aussi simplement écrire ce qui se passe — on te lit.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                data-press
                onClick={openCrisisSpace}
                style={{
                  appearance: 'none',
                  background: 'transparent',
                  border: '0.5px solid rgba(26, 26, 47, 0.16)',
                  borderRadius: 'var(--radius-pill, 999px)',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--ink)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Ouvrir le SOS
              </button>
              <button
                data-press
                onClick={() => { haptic(3); setHideCrisisAlert(true); }}
                style={{
                  appearance: 'none',
                  background: 'transparent',
                  border: 'none',
                  padding: '4px 6px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 9,
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--content-tertiary)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                OK je l’ai vu
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 16,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontVariantNumeric: 'tabular-nums',
              color: charsLeft < 20 ? 'var(--crisis)' : 'var(--content-tertiary)',
            }}
          >
            {charsLeft} caractères restants
          </span>
          <Button
            size="md"
            variant="primary"
            disabled={!canSubmit}
            onClick={onSubmit}
            style={{
              background: canSubmit ? 'var(--ink)' : 'rgba(26, 26, 47, 0.10)',
              color: canSubmit ? 'var(--cream)' : 'var(--ink-soft)',
            }}
          >
            Partager
          </Button>
        </div>
      </div>
    </div>
  );
}
