/* ============================================================
   NÉYA V3 — Communauté · Espace Vrai (LIGHT MODE)
   ============================================================
   Wash renard (peach + rose) + ink text + cards pearl.
   3 réactions ❤️ 🤝 👀 toggle local. Composer 280 chars.
   ============================================================ */

import { useState, useEffect, useMemo } from 'react';
import { WORLDS } from '../worlds';
import { haptic, ls, getProfile } from '../state';
import Button from '../../components/Button';

const REACTIONS = [
  { key: 'touche',    icon: '♡', label: 'Touché·e' },
  { key: 'comprends', icon: '◇', label: 'Je comprends' },
  { key: 'lis',       icon: '○', label: 'Je te lis' },
];

const SEEDED = [
  {
    id: 'seed-1',
    pseudo: 'Sève',
    totem: 'ours',
    body: 'Je suis fatiguée depuis si longtemps que j’ai oublié à quoi ressemble la fatigue normale.',
    minutesAgo: 18,
    isShort: false,
    reactions: { touche: 14, comprends: 31, lis: 22 },
  },
  {
    id: 'seed-2',
    pseudo: 'Vega',
    totem: 'daim',
    body: 'Le soir est tombé doucement, j’ai respiré.',
    minutesAgo: 42,
    isShort: true,
    reactions: { touche: 8, comprends: 4, lis: 12 },
  },
  {
    id: 'seed-3',
    pseudo: 'Orme',
    totem: 'lion',
    body: 'Première fois en six mois que j’arrive à dire « non » sans me sentir coupable. C’est petit mais ça compte.',
    minutesAgo: 95,
    isShort: false,
    reactions: { touche: 47, comprends: 19, lis: 34 },
  },
  {
    id: 'seed-4',
    pseudo: 'Mireille',
    totem: 'renard',
    body: 'Personne ne sait que je vais mal et c’est fatigant.',
    minutesAgo: 140,
    isShort: true,
    reactions: { touche: 28, comprends: 41, lis: 17 },
  },
  {
    id: 'seed-5',
    pseudo: 'Hayat',
    totem: 'baleine',
    body: 'Je crois que ce que je prenais pour de l’anxiété, c’était juste de l’épuisement. Je commence à comprendre la différence et ça change tout.',
    minutesAgo: 240,
    isShort: false,
    reactions: { touche: 22, comprends: 38, lis: 29 },
  },
  {
    id: 'seed-6',
    pseudo: 'Hélio',
    totem: 'aigle',
    body: 'Tu n’es pas seul·e.',
    minutesAgo: 410,
    isShort: true,
    reactions: { touche: 156, comprends: 89, lis: 124 },
  },
];

const TOTEM_GLYPH = {
  lion: '◆', ours: '◇', aigle: '△', daim: '✦', baleine: '○', renard: '▽',
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
  const profile = getProfile();
  const wRenard = WORLDS.communaute;

  const allVoices = useMemo(() => {
    const withMyTimes = ownPosts.map((p) => ({
      ...p,
      minutesAgo: Math.max(0, Math.floor((Date.now() - p.createdAt) / 60000)),
      mine: true,
    }));
    return [...withMyTimes, ...SEEDED].slice(0, 24);
  }, [ownPosts]);

  const totalVoices = allVoices.length;

  const toggleReaction = (postId, rKey) => {
    const cur = reactionState[postId] || {};
    const next = { ...cur, [rKey]: !cur[rKey] };
    const updated = { ...reactionState, [postId]: next };
    setReactionState(updated);
    saveReactions(updated);
    haptic(4);
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
    };
    const next = [newPost, ...ownPosts];
    setOwnPosts(next);
    saveOwnPosts(next);
    setDraft('');
    setComposerOpen(false);
    haptic([6, 30, 6]);
  };

  return (
    <div
      className="wash-renard"
      style={{
        position: 'absolute',
        inset: 0,
        color: 'var(--ink)',
      }}
    >
      <div
        style={{
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: 'calc(env(safe-area-inset-top, 0px) + 22px) 22px calc(env(safe-area-inset-bottom, 0px) + 170px)',
        }}
      >
        <div className="neya-mark" style={{ color: 'var(--content-tertiary)', marginBottom: 6 }}>
          ESPACE VRAI · CHAPITRE 06
        </div>
        <h1
          className="neya-h1"
          style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}
        >
          <em className="neya-key">{totalVoices}</em> voix aujourd’hui.
        </h1>
        <p
          className="neya-body-sm"
          style={{
            color: 'var(--content-secondary)',
            marginBottom: 24,
            maxWidth: 360,
          }}
        >
          Personne ne juge. Personne ne compte les likes. Tu peux dire ce que tu veux,
          ce qui est vrai.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {allVoices.map((v) => {
            const my = reactionState[v.id] || {};
            return (
              <div
                key={v.id}
                style={{
                  background: 'rgba(255, 252, 245, 0.78)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  border: '0.5px solid rgba(26, 26, 47, 0.08)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 18px',
                  boxShadow: '0 2px 14px rgba(26, 26, 47, 0.04)',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--ink)',
                      }}
                    >
                      {v.pseudo}
                      {v.mine && (
                        <span
                          style={{
                            marginLeft: 8,
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
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--content-tertiary)',
                        lineHeight: 1,
                      }}
                    >
                      {TOTEM_GLYPH[v.totem] || '◇'}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 10,
                      color: 'var(--content-tertiary)',
                    }}
                  >
                    {formatTime(v.minutesAgo)}
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
                  <p
                    style={{
                      margin: 0,
                      fontFamily: 'var(--font-body)',
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: 'var(--ink)',
                    }}
                  >
                    {v.body}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
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
            onClick={() => { haptic(6); setComposerOpen(true); }}
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
          onClose={() => { setComposerOpen(false); setDraft(''); }}
          pseudo={profile.pseudo || 'Toi'}
          totem={profile.totem || 'lion'}
        />
      )}
    </div>
  );
}

function Composer({ draft, setDraft, onSubmit, onClose, pseudo, totem }) {
  const charsLeft = 280 - draft.length;
  const canSubmit = draft.trim().length > 0 && draft.length <= 280;

  return (
    <div
      style={{
        position: 'absolute',
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

        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Dis ce qui est vrai pour toi maintenant…"
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
              background: canSubmit ? 'var(--tilleul)' : 'rgba(26, 26, 47, 0.10)',
              color: 'var(--ink)',
              fontWeight: 600,
            }}
          >
            Partager
          </Button>
        </div>
      </div>
    </div>
  );
}
