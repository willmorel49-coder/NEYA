/* ============================================================
   NÉYA V5 — Cocon plein écran painterly (retour vision MVP)
   ============================================================
   Sanctuaire personnel immersif. Pas de cards pearl glass.
   Painterly du monde-totem en plein écran + texte blanc en
   surimpression + 1 CTA "Me poser 2 minutes".

   Inspiration : MVP NÉYA original (PDFs glissés).
   ============================================================ */

import { useState, useEffect, useMemo, useRef } from 'react';
import { WORLDS } from '../worlds';
import { getProfile, setProfile, patchProfile, haptic } from '../state';
import ActionSheet from '../../components/ActionSheet';
import BreathingPause from './BreathingPause';
import useStandardOverlay from '../hooks/useStandardOverlay';

const TOTEMS = [
  { key: 'lion',    label: 'Lion blanc',    world: 'foret' },
  { key: 'ours',    label: 'Ours polaire',  world: 'temple' },
  { key: 'aigle',   label: 'Aigle céleste', world: 'oasis' },
  { key: 'daim',    label: 'Daim lunaire',  world: 'lac' },
  { key: 'baleine', label: 'Baleine sage',  world: 'montagne' },
  { key: 'renard',  label: 'Renard',        world: 'communaute' },
];

/* ─── Helpers ─── */

function getHourPhrase() {
  const h = new Date().getHours();
  if (h >= 5 && h < 8)   return { whisper: 'L\'aube est douce. Pose-toi.',                tint: 'rgba(245, 212, 156, 0.18)' };
  if (h >= 8 && h < 12)  return { whisper: 'Le jour est là. Respire.',                    tint: 'rgba(255, 252, 245, 0.10)' };
  if (h >= 12 && h < 17) return { whisper: 'Chaque souffle te recentre.',                 tint: 'rgba(255, 252, 245, 0.10)' };
  if (h >= 17 && h < 20) return { whisper: 'Le jour s\'apaise. Reviens à toi.',           tint: 'rgba(199, 103, 74, 0.22)' };
  if (h >= 20 && h < 23) return { whisper: 'La nuit veille. Repose-toi.',                 tint: 'rgba(30, 30, 60, 0.32)' };
  return                       { whisper: 'Chaque respiration te rapproche de toi-même.', tint: 'rgba(20, 24, 56, 0.42)' };
}

function getGreeting(pseudo) {
  if (pseudo) return `Bonjour, ${pseudo}.`;
  return 'Pose-toi ici.';
}

/* ─── Lucioles (points lumineux flottants) ─── */

const FIREFLIES = [
  { left: '18%', top: '38%', size: 4, delay: 0,    duration: 7.2 },
  { left: '72%', top: '32%', size: 3, delay: 1.4,  duration: 8.4 },
  { left: '34%', top: '64%', size: 5, delay: 0.6,  duration: 6.8 },
  { left: '82%', top: '58%', size: 3, delay: 2.2,  duration: 9.0 },
  { left: '22%', top: '76%', size: 4, delay: 1.8,  duration: 7.6 },
  { left: '64%', top: '78%', size: 3, delay: 0.4,  duration: 8.2 },
  { left: '48%', top: '24%', size: 4, delay: 3.0,  duration: 7.8 },
];

function Fireflies({ accent }) {
  return (
    <>
      {FIREFLIES.map((f, i) => (
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
            background: '#FBF6E8',
            boxShadow: `0 0 ${f.size * 3}px ${f.size}px ${accent}`,
            opacity: 0,
            animation: `cocon-firefly ${f.duration}s ease-in-out ${f.delay}s infinite`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
}

/* ─── Main ─── */

export default function Cocon() {
  const [profile, setLocalProfile] = useState(() => getProfile());
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  const [, forceTick] = useState(0);

  const totemKey = profile.totem || 'lion';
  const currentTotem = TOTEMS.find((t) => t.key === totemKey) || TOTEMS[0];
  const totemWorld = WORLDS[currentTotem.world] || WORLDS.foret;
  const accent = totemWorld.accent;
  const hourPhase = useMemo(() => getHourPhrase(), []);

  // Re-évalue l'heure toutes les minutes
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => (n + 1) % 1000), 60_000);
    return () => clearInterval(id);
  }, []);

  // Listen pour mises à jour profil (autres onglets/écrans)
  useEffect(() => {
    const refresh = () => setLocalProfile(getProfile());
    window.addEventListener('neya:profile-changed', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('neya:profile-changed', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const updateProfile = (patch) => {
    const next = patchProfile(patch);
    setLocalProfile(next);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#0a0c14',
      }}
      data-world={currentTotem.world}
    >
      {/* Painterly bg plein écran */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${totemWorld.bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'cocon-bg-ken-burns 28s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      {/* Voile sombre subtil pour lisibilité texte blanc */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.42) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Voile horaire (teinte selon moment) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: hourPhase.tint,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />

      {/* Lucioles */}
      <Fireflies accent={accent} />

      {/* Top bar — logo NÉYA centré + icône personnaliser */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 22px)',
          left: 22,
          right: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 3,
        }}
      >
        {/* Spacer pour centrer le logo */}
        <span style={{ width: 32, height: 32 }} />

        {/* Logo NÉYA */}
        <div
          aria-hidden
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {/* Mini lotus SVG */}
          <svg width="22" height="14" viewBox="0 0 44 28" fill="none" aria-hidden>
            <path d="M22 26 C 8 18, 4 8, 22 2 C 40 8, 36 18, 22 26 Z" stroke="#FBF6E8" strokeWidth="0.8" fill="none" opacity="0.92" />
            <path d="M22 26 C 12 22, 10 14, 22 8" stroke="#FBF6E8" strokeWidth="0.6" fill="none" opacity="0.7" />
            <path d="M22 26 C 32 22, 34 14, 22 8" stroke="#FBF6E8" strokeWidth="0.6" fill="none" opacity="0.7" />
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              letterSpacing: '0.42em',
              fontWeight: 500,
              color: '#FBF6E8',
              opacity: 0.78,
            }}
          >
            NÉYA
          </span>
        </div>

        {/* Bouton personnaliser */}
        <button
          type="button"
          onClick={() => { haptic(2); setPersonalizeOpen(true); }}
          data-press
          aria-label="Personnaliser"
          style={{
            appearance: 'none',
            width: 32,
            height: 32,
            background: 'rgba(251, 246, 232, 0.08)',
            border: '0.5px solid rgba(251, 246, 232, 0.22)',
            borderRadius: '50%',
            color: '#FBF6E8',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            WebkitTapHighlightColor: 'transparent',
            fontSize: 14,
            padding: 0,
          }}
        >
          ⋯
        </button>
      </div>

      {/* Texte centré — greeting + whisper */}
      <div
        style={{
          position: 'absolute',
          top: '26%',
          left: 22,
          right: 22,
          textAlign: 'center',
          zIndex: 2,
          color: '#FBF6E8',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 8vw, 42px)',
            fontWeight: 300,
            lineHeight: 1.15,
            letterSpacing: '-0.018em',
            fontVariationSettings: '"opsz" 144, "SOFT" 50',
            color: '#FBF6E8',
            textShadow: '0 2px 18px rgba(0, 0, 0, 0.38)',
          }}
        >
          {getGreeting(profile.pseudo)}
        </h1>
        <p
          style={{
            margin: '18px auto 0',
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            lineHeight: 1.6,
            color: '#FBF6E8',
            opacity: 0.88,
            maxWidth: 280,
            textShadow: '0 1px 8px rgba(0, 0, 0, 0.32)',
          }}
        >
          {hourPhase.whisper}
        </p>
      </div>

      {/* Mantra en filigrane (centre-bas) si présent */}
      {profile.mantra && (
        <button
          type="button"
          onClick={() => { haptic(2); setPersonalizeOpen(true); }}
          aria-label="Modifier ton mantra"
          style={{
            position: 'absolute',
            left: 22,
            right: 22,
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 230px)',
            margin: 0,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'center',
            color: '#FBF6E8',
            WebkitTapHighlightColor: 'transparent',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 17,
              lineHeight: 1.45,
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              color: '#FBF6E8',
              opacity: 0.82,
              textShadow: '0 1px 8px rgba(0, 0, 0, 0.36)',
              animation: 'cocon-mantra-breathe 8s ease-in-out infinite',
              display: 'inline-block',
              maxWidth: '88%',
            }}
          >
            « {profile.mantra} »
          </span>
        </button>
      )}

      {!profile.mantra && (
        <button
          type="button"
          onClick={() => { haptic(2); setPersonalizeOpen(true); }}
          data-press
          aria-label="Poser un mantra"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 234px)',
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#FBF6E8',
            opacity: 0.5,
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            fontWeight: 500,
            padding: '10px 18px',
            WebkitTapHighlightColor: 'transparent',
            zIndex: 2,
          }}
        >
          + Poser un mantra
        </button>
      )}

      {/* CTA principal — Me poser 2 minutes */}
      <button
        type="button"
        onClick={() => { haptic(6); setBreathingOpen(true); }}
        data-press
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 150px)',
          appearance: 'none',
          padding: '16px 38px',
          minHeight: 52,
          background: accent,
          color: '#FBF6E8',
          border: 'none',
          borderRadius: 999,
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          boxShadow: `0 8px 28px ${totemWorld.accentRgb}, 0.42), 0 2px 6px rgba(0, 0, 0, 0.18)`,
          zIndex: 3,
        }}
      >
        Me poser 2 minutes
      </button>

      {/* Sub-CTA texte — Changer de monde / personnaliser */}
      <button
        type="button"
        onClick={() => { haptic(2); setPersonalizeOpen(true); }}
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#FBF6E8',
          opacity: 0.65,
          fontFamily: 'var(--font-ui)',
          fontSize: 10,
          letterSpacing: '0.222em',
          textTransform: 'uppercase',
          fontWeight: 500,
          padding: '8px 16px',
          minHeight: 32,
          WebkitTapHighlightColor: 'transparent',
          zIndex: 3,
        }}
      >
        {currentTotem.label}
      </button>

      {/* Overlays */}
      {breathingOpen && (
        <BreathingPause
          accent={accent}
          onClose={() => setBreathingOpen(false)}
        />
      )}

      {personalizeOpen && (
        <PersonalizeSheet
          profile={profile}
          onSave={updateProfile}
          onClose={() => setPersonalizeOpen(false)}
        />
      )}

      {/* Keyframes locales */}
      <style>{`
        @keyframes cocon-bg-ken-burns {
          0%   { transform: scale(1)    translate3d(0, 0, 0); }
          100% { transform: scale(1.08) translate3d(0, -1.5%, 0); }
        }
        @keyframes cocon-firefly {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.6); }
          15%      { opacity: 0.45; transform: translateY(-6px) scale(1); }
          50%      { opacity: 0.9;  transform: translateY(-14px) scale(1.1); }
          85%      { opacity: 0.4;  transform: translateY(-22px) scale(0.9); }
        }
        @keyframes cocon-mantra-breathe {
          0%, 100% { opacity: 0.74; }
          50%      { opacity: 0.94; }
        }
      `}</style>
    </div>
  );
}

/* ─── PersonalizeSheet — édition prénom + mantra + totem ─── */

function PersonalizeSheet({ profile, onSave, onClose }) {
  const [tempPseudo, setTempPseudo] = useState(profile.pseudo || '');
  const [tempMantra, setTempMantra] = useState(profile.mantra || '');
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [actionSheet, setActionSheet] = useState(null);
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

  const handleSave = () => {
    const patch = {};
    const pseudoTrim = (tempPseudo || '').trim();
    const mantraTrim = (tempMantra || '').trim();
    if (pseudoTrim !== (profile.pseudo || '')) patch.pseudo = pseudoTrim || null;
    if (mantraTrim !== (profile.mantra || '')) patch.mantra = mantraTrim || null;
    if (Object.keys(patch).length > 0) {
      onSave(patch);
      haptic(6);
    } else {
      haptic(2);
    }
    handleClose();
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: 'Personnaliser',
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

  const pickTotem = (key) => {
    onSave({ totem: key });
    haptic(4);
    setActionSheet(null);
  };

  const currentTotemLabel = (TOTEMS.find((t) => t.key === profile.totem) || TOTEMS[0]).label;

  return (
    <>
      <div
        aria-hidden
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          background: 'rgba(8, 10, 24, 0.62)',
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
          padding: '12px 22px calc(env(safe-area-inset-bottom, 0px) + 28px)',
          transform: closing ? 'translateY(100%)' : mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.18)',
          maxHeight: '78vh',
          overflowY: 'auto',
        }}
      >
        {/* Drag handle */}
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

        {/* Title */}
        <div
          className="neya-mark"
          style={{
            color: 'var(--content-tertiary)',
            textAlign: 'center',
            marginBottom: 22,
          }}
        >
          Personnaliser
        </div>

        {/* Prénom */}
        <div style={{ marginBottom: 22 }}>
          <label
            className="neya-mark"
            style={{ color: 'var(--content-tertiary)', display: 'block', marginBottom: 8 }}
          >
            Prénom
          </label>
          <input
            type="text"
            value={tempPseudo}
            onChange={(e) => setTempPseudo(e.target.value)}
            placeholder="Ton prénom"
            maxLength={30}
            aria-label="Ton prénom"
            style={{
              width: '100%',
              padding: '14px 16px',
              minHeight: 48,
              background: 'rgba(26, 26, 47, 0.04)',
              border: '0.5px solid rgba(26, 26, 47, 0.10)',
              borderRadius: 12,
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              color: 'var(--ink)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Mantra */}
        <div style={{ marginBottom: 22 }}>
          <label
            className="neya-mark"
            style={{ color: 'var(--content-tertiary)', display: 'block', marginBottom: 8 }}
          >
            Mantra du moment
          </label>
          <textarea
            value={tempMantra}
            onChange={(e) => setTempMantra(e.target.value)}
            placeholder="Une phrase pour toi…"
            rows={2}
            maxLength={140}
            aria-label="Mantra"
            style={{
              width: '100%',
              padding: '14px 16px',
              minHeight: 64,
              background: 'rgba(26, 26, 47, 0.04)',
              border: '0.5px solid rgba(26, 26, 47, 0.10)',
              borderRadius: 12,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 16,
              lineHeight: 1.4,
              color: 'var(--ink)',
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div
            style={{
              marginTop: 4,
              textAlign: 'right',
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              fontVariantNumeric: 'tabular-nums',
              color: tempMantra.length >= 130 ? 'var(--crisis)' : 'var(--content-tertiary)',
            }}
          >
            {140 - tempMantra.length}
          </div>
        </div>

        {/* Totem (sélecteur via ActionSheet) */}
        <div style={{ marginBottom: 28 }}>
          <label
            className="neya-mark"
            style={{ color: 'var(--content-tertiary)', display: 'block', marginBottom: 8 }}
          >
            Mon totem
          </label>
          <button
            type="button"
            data-press
            onClick={() => { haptic(2); setActionSheet({ type: 'totem' }); }}
            style={{
              appearance: 'none',
              width: '100%',
              padding: '14px 16px',
              minHeight: 48,
              background: 'rgba(26, 26, 47, 0.04)',
              border: '0.5px solid rgba(26, 26, 47, 0.10)',
              borderRadius: 12,
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              color: 'var(--ink)',
              textAlign: 'left',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{currentTotemLabel}</span>
            <span style={{ color: 'var(--content-tertiary)', fontSize: 14 }}>›</span>
          </button>
        </div>

        {/* Actions */}
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
            onClick={handleSave}
            style={{
              appearance: 'none',
              flex: 1,
              padding: '14px 16px',
              minHeight: 48,
              background: 'var(--ink)',
              color: 'var(--cream)',
              border: 'none',
              borderRadius: 999,
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Garder
          </button>
        </div>
      </div>

      {actionSheet?.type === 'totem' && (
        <ActionSheet
          title="Choisir un totem"
          actions={TOTEMS.map((t) => ({
            label: t.label,
            onTap: () => pickTotem(t.key),
          }))}
          onClose={() => setActionSheet(null)}
        />
      )}
    </>
  );
}

