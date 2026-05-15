/* ============================================================
   NÉYA V2 — Cercle (overlay : private circle of close voices)
   ============================================================
   Cercle privé de max 7 personnes pour leur envoyer une "lumière"
   chaque jour — geste discret de présence. Anti-toxic : aucun
   compteur public, aucun classement, pas de comparaison.
   Localstorage uniquement (entièrement privé).
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import {
  haptic,
  getCercle,
  addToCercle,
  removeFromCercle,
  sendLumiere,
  hasSentLumiereToday,
  getLumieresTotal,
  getRituels,
  logRituel,
  isRituelDoneToday,
  addSouvenir,
} from '../state';
import ActionSheet from '../../components/ActionSheet';

const TILLEUL = 'var(--tilleul)';

export default function Cercle({ onClose }) {
  const [cercle, setCercle] = useState(() => getCercle());
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [popIds, setPopIds] = useState(new Set());
  const [rituelPopIds, setRituelPopIds] = useState(new Set());
  const [, setNowTick] = useState(0);
  const [removeTarget, setRemoveTarget] = useState(null);
  const inputRef = useRef(null);

  // Tick every minute to refresh "dans Xh / Xmin" time hints
  useEffect(() => {
    const id = setInterval(() => setNowTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  // Slide-up reveal
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Autofocus when composer opens
  useEffect(() => {
    if (composerOpen) {
      const t = setTimeout(() => { try { inputRef.current?.focus(); } catch {} }, 80);
      return () => clearTimeout(t);
    }
  }, [composerOpen]);

  const doClose = () => {
    if (closing) return;
    haptic(3);
    setClosing(true);
    setTimeout(() => onClose?.(), 320);
  };

  const refresh = () => setCercle(getCercle());

  const handleAdd = () => {
    const v = (draft || '').trim();
    if (!v) return;
    if (cercle.length >= 7) {
      haptic(2);
      return;
    }
    // Prevent silent duplicate (case-insensitive)
    const exists = cercle.some(
      (m) => (m.pseudo || '').toLowerCase() === v.toLowerCase()
    );
    if (exists) {
      haptic(2);
      setDraft('');
      setComposerOpen(false);
      return;
    }
    haptic(4);
    addToCercle(v);
    setDraft('');
    setComposerOpen(false);
    refresh();
  };

  const handleRemove = (pseudo) => {
    haptic(4);
    setRemoveTarget(pseudo);
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    const pseudo = removeTarget;
    haptic([4, 60, 4]);
    removeFromCercle(pseudo);
    setRemoveTarget(null);
    refresh();
  };

  const handleSendLumiere = (pseudo) => {
    if (hasSentLumiereToday(pseudo)) return;
    haptic([6, 30, 6]);
    sendLumiere(pseudo);
    refresh();
    // Trigger tilleul-pop animation on the counter
    setPopIds((prev) => {
      const next = new Set(prev);
      next.add(pseudo);
      return next;
    });
    setTimeout(() => {
      setPopIds((prev) => {
        const next = new Set(prev);
        next.delete(pseudo);
        return next;
      });
    }, 420);
  };

  const handleRituel = (rituel) => {
    if (isRituelDoneToday(rituel.id)) return;
    haptic([6, 30, 6]);
    logRituel(rituel.id);
    addSouvenir({
      type: 'rituel',
      label: rituel.label,
      detail: rituel.hint,
    });
    setRituelPopIds((prev) => {
      const next = new Set(prev);
      next.add(rituel.id);
      return next;
    });
    setTimeout(() => {
      setRituelPopIds((prev) => {
        const next = new Set(prev);
        next.delete(rituel.id);
        return next;
      });
    }, 420);
    // Force re-render to update the disabled state
    setNowTick((t) => t + 1);
  };

  const rituels = getRituels();
  const total = getLumieresTotal();
  const atCap = cercle.length >= 7;
  const isEmpty = cercle.length === 0;

  return (
    <div className="wash-temple" style={overlayStyle({ mounted, closing })}>
      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(env(safe-area-inset-top, 0px) + 4px) 12px 14px',
          zIndex: 4,
        }}
      >
        <button
          type="button"
          data-press
          onClick={doClose}
          aria-label="Retour"
          style={{
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '12px 14px',
            minWidth: 44,
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--content-tertiary)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1, marginRight: 2 }}>‹</span>
          Retour
        </button>
        <div
          className="neya-mark"
          style={{ color: 'var(--content-tertiary)' }}
        >
          MON CERCLE
        </div>
        <button
          type="button"
          data-press
          onClick={doClose}
          aria-label="Fermer"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '0.5px solid var(--hairline)',
            background: 'rgba(251, 246, 232, 0.6)',
            color: 'var(--ink)',
            fontSize: 15,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ✕
        </button>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: 'calc(env(safe-area-inset-top, 0px) + 66px) 22px calc(env(safe-area-inset-bottom, 0px) + 48px)',
        }}
      >
        {/* Hero */}
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(26px, 7vw, 32px)',
            lineHeight: 1.15,
            color: 'var(--ink)',
            letterSpacing: '-0.015em',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            maxWidth: 320,
          }}
        >
          «&nbsp;Les voix qui comptent.&nbsp;»
        </h1>
        <p
          style={{
            margin: '10px 0 28px',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            lineHeight: 1.55,
            color: 'var(--ink-soft)',
            maxWidth: 340,
          }}
        >
          Sept personnes maximum. Envoie-leur une lumière chaque jour si tu veux.
        </p>

        {/* Cercle list */}
        {isEmpty ? (
          <EmptyCard
            onAdd={() => { haptic(4); setComposerOpen(true); }}
            composerOpen={composerOpen}
          />
        ) : (
          <div
            key={cercle.length /* re-run stagger when count changes */}
            className="stagger"
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {cercle.map((m) => (
              <MemberCard
                key={m.pseudo}
                member={m}
                pop={popIds.has(m.pseudo)}
                onSend={() => handleSendLumiere(m.pseudo)}
                onRemove={() => handleRemove(m.pseudo)}
              />
            ))}
          </div>
        )}

        {/* RITUELS DU CERCLE — shared symbolic gestures */}
        <div style={{ marginTop: 36 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 18,
                height: 1,
                background: TILLEUL,
                opacity: 0.7,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.222em',
                textTransform: 'uppercase',
                color: TILLEUL,
                lineHeight: 1,
              }}
            >
              Rituels du cercle
            </span>
          </div>
          <p
            style={{
              margin: '0 0 16px',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              lineHeight: 1.55,
              color: 'var(--ink-soft)',
              maxWidth: 340,
            }}
          >
            Des gestes communs avec celles et ceux de ton cercle. Tu n’es pas seul·e à le faire — même si tu ne les vois pas.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rituels.map((r) => (
              <RituelCard
                key={r.id}
                rituel={r}
                done={isRituelDoneToday(r.id)}
                pop={rituelPopIds.has(r.id)}
                onDo={() => handleRituel(r)}
              />
            ))}
          </div>
        </div>

        {/* Add composer / button */}
        {!atCap && !isEmpty && (
          <div style={{ marginTop: 18 }}>
            {!composerOpen ? (
              <button
                type="button"
                data-press
                onClick={() => { haptic(4); setComposerOpen(true); }}
                style={{
                  width: '100%',
                  appearance: 'none',
                  background: 'transparent',
                  border: '0.5px dashed var(--hairline-strong)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 18px',
                  minHeight: 52,
                  color: 'var(--ink-soft)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'background 200ms var(--ease-out)',
                }}
              >
                Ajouter une voix au cercle +
              </button>
            ) : (
              <ComposerInline
                inputRef={inputRef}
                draft={draft}
                setDraft={setDraft}
                onAdd={handleAdd}
                onCancel={() => { setComposerOpen(false); setDraft(''); }}
                prominent={false}
              />
            )}
          </div>
        )}

        {atCap && (
          <p
            style={{
              marginTop: 18,
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontStyle: 'italic',
              color: 'var(--ink-whisper)',
              lineHeight: 1.5,
            }}
          >
            Sept est suffisant.
          </p>
        )}

        {/* Footer whisper */}
        <div
          style={{
            marginTop: 36,
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--ink-whisper)',
            lineHeight: 1.5,
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            padding: '0 24px',
          }}
        >
          {total > 0
            ? `« Tu as partagé ${total} lumière${total > 1 ? 's' : ''}. »`
            : '« Ton cercle commence ici. »'}
        </div>
      </div>

      {removeTarget && (
        <ActionSheet
          title={`Retirer ${removeTarget} ?`}
          description="Cette voix quittera ton cercle. Tu pourras la rajouter plus tard."
          actions={[
            {
              label: 'Retirer du cercle',
              role: 'destructive',
              onTap: confirmRemove,
            },
          ]}
          cancelLabel="Annuler"
          onClose={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}

/* ============================================================
   MEMBER CARD
   ============================================================ */

function MemberCard({ member, pop, onSend, onRemove }) {
  const sentToday = hasSentLumiereToday(member.pseudo);
  const total = member.lumieresSent || 0;

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--cream-light)',
        border: '0.5px solid var(--hairline)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      {/* Remove ✕ — 44×44 tap zone, visual icon stays small */}
      <button
        type="button"
        data-press
        onClick={onRemove}
        aria-label={`Retirer ${member.pseudo} du cercle`}
        style={{
          position: 'absolute',
          top: 2,
          right: 2,
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: 'none',
          background: 'transparent',
          color: 'var(--ink-whisper)',
          fontSize: 14,
          lineHeight: 1,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        ✕
      </button>

      {/* Top row : pseudo + sent-today badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          flexWrap: 'wrap',
          paddingRight: 28,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--ink)',
            lineHeight: 1.2,
          }}
        >
          {member.pseudo}
        </span>
        {sentToday && (
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              fontStyle: 'italic',
              color: TILLEUL,
              letterSpacing: '0.02em',
              lineHeight: 1.2,
            }}
          >
            · lumière envoyée aujourd’hui
          </span>
        )}
      </div>

      {/* Counter row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          marginTop: 10,
          marginBottom: 14,
        }}
      >
        <span
          className={pop ? 'tilleul-pop' : undefined}
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 18,
            fontWeight: 400,
            color: 'var(--ink)',
            lineHeight: 1,
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            fontVariantNumeric: 'tabular-nums',
            display: 'inline-block',
            transformOrigin: 'left center',
          }}
        >
          {total}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: 'var(--ink-whisper)',
            lineHeight: 1,
          }}
        >
          lumières partagées
        </span>
      </div>

      {/* CTA */}
      {sentToday ? (
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            padding: '12px 14px',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(26, 26, 47, 0.04)',
            color: 'var(--ink-soft)',
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 400,
            fontStyle: 'italic',
            lineHeight: 1.4,
          }}
        >
          Reviens demain pour une autre lumière.
        </div>
      ) : (
        <button
          type="button"
          data-press
          onClick={onSend}
          style={{
            width: '100%',
            appearance: 'none',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--ink)',
            color: 'var(--cream)',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            fontWeight: 500,
            padding: '15px 18px',
            minHeight: 50,
            cursor: 'pointer',
            letterSpacing: '0.01em',
            WebkitTapHighlightColor: 'transparent',
            boxShadow: '0 4px 14px rgba(26, 26, 47, 0.10)',
            transition: 'background 200ms var(--ease-out)',
          }}
        >
          Envoyer une lumière&nbsp;
          <span style={{ color: TILLEUL }}>✦</span>
        </button>
      )}
    </div>
  );
}

/* ============================================================
   EMPTY STATE CARD
   ============================================================ */

function EmptyCard({ onAdd, composerOpen }) {
  return (
    <div
      style={{
        background: 'var(--cream-light)',
        border: '0.5px solid var(--hairline)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 22px',
        boxShadow: 'var(--shadow-soft)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 16,
          fontWeight: 400,
          color: 'var(--ink)',
          lineHeight: 1.3,
          fontVariationSettings: 'var(--fraunces-italic-soft)',
          marginBottom: 8,
        }}
      >
        «&nbsp;Ton cercle est vide.&nbsp;»
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          color: 'var(--ink-soft)',
          lineHeight: 1.5,
          maxWidth: 280,
          margin: '0 auto 18px',
        }}
      >
        Ajoute jusqu’à 7 personnes que tu veux porter en toi.
      </div>
      {!composerOpen && (
        <button
          type="button"
          data-press
          onClick={onAdd}
          style={{
            appearance: 'none',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--ink)',
            color: 'var(--cream)',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            fontWeight: 500,
            padding: '15px 28px',
            minHeight: 50,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            boxShadow: '0 6px 18px rgba(26, 26, 47, 0.14)',
          }}
        >
          Ajouter une voix +
        </button>
      )}
    </div>
  );
}

/* ============================================================
   INLINE COMPOSER
   ============================================================ */

function ComposerInline({ inputRef, draft, setDraft, onAdd, onCancel }) {
  const canAdd = draft.trim().length > 0;

  return (
    <div
      style={{
        background: 'var(--cream-light)',
        border: '0.5px solid var(--hairline)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Pseudo (ou nom)"
        maxLength={30}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && canAdd) onAdd();
          if (e.key === 'Escape') onCancel();
        }}
        style={{
          width: '100%',
          background: 'rgba(26, 26, 47, 0.04)',
          border: 'none',
          outline: 'none',
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          color: 'var(--ink)',
          lineHeight: 1.4,
          padding: '12px 14px',
          borderRadius: 8,
          boxSizing: 'border-box',
        }}
      />
      <p
        style={{
          margin: '10px 0 14px',
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          color: 'var(--ink-whisper)',
          lineHeight: 1.45,
        }}
      >
        Tu peux mettre n’importe quel nom — c’est pour toi.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          data-press
          onClick={onAdd}
          disabled={!canAdd}
          style={{
            flex: 1,
            appearance: 'none',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            background: canAdd ? 'var(--ink)' : 'rgba(26, 26, 47, 0.08)',
            color: canAdd ? 'var(--cream)' : 'var(--ink-whisper)',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            fontWeight: 500,
            padding: '14px 18px',
            minHeight: 48,
            cursor: canAdd ? 'pointer' : 'default',
            WebkitTapHighlightColor: 'transparent',
            transition: 'background 200ms var(--ease-out)',
          }}
        >
          Ajouter
        </button>
        <button
          type="button"
          data-press
          onClick={onCancel}
          style={{
            appearance: 'none',
            border: '0.5px solid var(--hairline)',
            borderRadius: 'var(--radius-pill)',
            background: 'transparent',
            color: 'var(--ink-soft)',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            fontWeight: 500,
            padding: '14px 22px',
            minHeight: 48,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   RITUEL CARD — shared symbolic gesture
   ============================================================ */

function timeUntil(targetHour) {
  const now = new Date();
  const target = new Date();
  target.setHours(targetHour, 0, 0, 0);
  if (target < now) target.setDate(target.getDate() + 1);
  const diff = target - now;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours === 0) return `dans ${mins} min`;
  if (hours < 24) return `dans ${hours}h`;
  return 'demain';
}

function RituelCard({ rituel, done, pop, onDo }) {
  const timeText = rituel.hour !== null ? timeUntil(rituel.hour) : null;

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--cream-light)',
        border: '0.5px solid var(--hairline)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      {/* Top row : icon + label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span
          className={pop || done ? 'tilleul-pop' : undefined}
          style={{
            fontSize: 22,
            lineHeight: 1,
            color: done ? TILLEUL : 'var(--ink)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            transformOrigin: 'center',
            transition: 'color 280ms var(--ease-out)',
          }}
          aria-hidden
        >
          {rituel.icon}
        </span>
        <span
          style={{
            flex: 1,
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 17,
            fontWeight: 400,
            color: 'var(--ink)',
            lineHeight: 1.2,
            fontVariationSettings: 'var(--fraunces-italic-soft)',
          }}
        >
          {rituel.label}
        </span>
      </div>

      {/* Hint */}
      <div
        style={{
          marginTop: 6,
          paddingLeft: 38,
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          color: 'var(--ink-soft)',
          lineHeight: 1.5,
        }}
      >
        {rituel.hint}
      </div>

      {/* Time hint */}
      {timeText && (
        <div
          style={{
            marginTop: 8,
            paddingLeft: 38,
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: 'var(--content-tertiary)',
            lineHeight: 1.2,
          }}
        >
          À {rituel.hour}H · {timeText}
        </div>
      )}

      {/* CTA row right-aligned */}
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        {done ? (
          <div
            style={{
              appearance: 'none',
              border: '0.5px solid var(--hairline)',
              borderRadius: 'var(--radius-pill)',
              background: 'transparent',
              color: 'var(--ink-soft)',
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              fontWeight: 500,
              fontStyle: 'italic',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '7px 14px',
              lineHeight: 1.2,
            }}
          >
            Fait aujourd’hui · Tu es là.
          </div>
        ) : (
          <button
            type="button"
            data-press
            onClick={onDo}
            style={{
              appearance: 'none',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--ink)',
              color: 'var(--cream)',
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.222em',
              textTransform: 'uppercase',
              padding: '14px 22px',
              minHeight: 44,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              lineHeight: 1.2,
              boxShadow: '0 3px 10px rgba(26, 26, 47, 0.10)',
              transition: 'background 200ms var(--ease-out)',
            }}
          >
            J’y suis&nbsp;✓
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   OVERLAY STYLE — slide-up 420ms, slide-down 320ms
   ============================================================ */

function overlayStyle({ mounted, closing }) {
  const transform = closing
    ? 'translateY(100%)'
    : mounted
      ? 'translateY(0)'
      : 'translateY(100%)';
  const opacity = closing ? 0 : mounted ? 1 : 0;
  const dur = closing ? '320ms' : '420ms';
  return {
    position: 'absolute',
    inset: 0,
    zIndex: 90,
    color: 'var(--ink)',
    overflow: 'hidden',
    opacity,
    transform,
    transition: `transform ${dur} var(--ease-out-ios), opacity ${dur} var(--ease-out-ios)`,
    WebkitFontSmoothing: 'antialiased',
  };
}
