/* ============================================================
   AventurePlayer — moteur de scènes narratives interactives
   ============================================================
   Lit le graph de scènes d'une aventure (data/aventure-*.js)
   et le joue scène par scène avec :

     - narratif painterly plein écran
     - choix multiples (chaque choix mène à une scène + peut donner une clé)
     - mini-jeu respiration intégré
     - reflection (textarea optionnelle)
     - keys-recap (récap des clés gagnées)
     - final (clôture + marque le monde complété)

   État runtime :
     - currentSceneKey
     - keys[] (clés gagnées)
     - notes (texte écrit dans les reflection)

   Persisté dans profile.aventure :
     - mondesProgress[mondeKey] : nombre d'étapes max
     - mondesScenes[mondeKey] : { lastScene, keys, notes }
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { haptic, getProfile, patchProfile, ls } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';

function saveSceneState(aventureKey, state) {
  const profile = getProfile();
  const av = profile.aventure || {};
  const mondesScenes = av.mondesScenes || {};
  mondesScenes[aventureKey] = state;
  patchProfile({ aventure: { ...av, mondesScenes } });
}

function loadSceneState(aventureKey) {
  const profile = getProfile();
  const av = profile.aventure || {};
  const mondesScenes = av.mondesScenes || {};
  return mondesScenes[aventureKey] || { lastScene: null, keys: [], notes: {} };
}

function markMondeCompleted(aventureKey, totalScenes) {
  const profile = getProfile();
  const av = profile.aventure || {};
  const progress = av.mondesProgress || {};
  progress[aventureKey] = totalScenes;
  patchProfile({ aventure: { ...av, mondesProgress: progress } });
}

export default function AventurePlayer({ aventure, onClose }) {
  const initialState = loadSceneState(aventure.key);
  const [sceneKey, setSceneKey] = useState(initialState.lastScene || aventure.startScene);
  const [keys, setKeys] = useState(initialState.keys || []);
  const [notes, setNotes] = useState(initialState.notes || {});
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const aliveRef = useRef(true);
  const timersRef = useRef([]);

  const scene = aventure.scenes[sceneKey];
  const visitedCount = Math.min(
    Object.keys(aventure.scenes).indexOf(sceneKey) + 1,
    aventure.totalScenes || Object.keys(aventure.scenes).length
  );

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => { if (aliveRef.current) fn(); }, ms);
    timersRef.current.push(id);
    return id;
  };

  const persistState = (override = {}) => {
    saveSceneState(aventure.key, {
      lastScene: override.lastScene !== undefined ? override.lastScene : sceneKey,
      keys: override.keys || keys,
      notes: override.notes || notes,
    });
  };

  const handleClose = () => {
    if (closing) return;
    persistState();
    haptic(3);
    setClosing(true);
    safeTimeout(() => onClose?.(), 380);
  };

  const goToScene = (nextKey, gainKey = null) => {
    if (!nextKey) return;
    haptic(4);
    let newKeys = keys;
    if (gainKey && !keys.includes(gainKey)) {
      newKeys = [...keys, gainKey];
      setKeys(newKeys);
    }
    setTransitioning(true);
    safeTimeout(() => {
      if (!aliveRef.current) return;
      setSceneKey(nextKey);
      setTransitioning(false);
      persistState({ lastScene: nextKey, keys: newKeys });
    }, 380);
  };

  const handleFinal = () => {
    haptic([6, 80, 6]);
    markMondeCompleted(aventure.key, Object.keys(aventure.scenes).length);
    persistState();
    setTransitioning(true);
    safeTimeout(() => {
      if (aliveRef.current) handleClose();
    }, 1800);
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: aventure.name,
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

  if (!scene) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        overflow: 'hidden',
        background: '#0a0c14',
        opacity: closing ? 0 : mounted ? 1 : 0,
        transition: 'opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Painterly bg */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${aventure.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'aventure-bg-ken-burns 40s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      {/* Voile sombre */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.30) 35%, rgba(0,0,0,0.78) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          left: 12,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 3,
        }}
      >
        <button
          type="button"
          data-press
          onClick={handleClose}
          aria-label="Quitter l'aventure"
          style={{
            appearance: 'none',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(251, 246, 232, 0.10)',
            border: '0.5px solid rgba(251, 246, 232, 0.28)',
            color: '#FBF6E8',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            WebkitTapHighlightColor: 'transparent',
            fontSize: 18,
            padding: 0,
          }}
        >
          ‹
        </button>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 999,
            background: 'rgba(251, 246, 232, 0.10)',
            border: '0.5px solid rgba(251, 246, 232, 0.22)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              letterSpacing: '0.222em',
              textTransform: 'uppercase',
              color: '#FBF6E8',
              opacity: 0.88,
              fontWeight: 600,
            }}
          >
            Clés
          </span>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontWeight: 600,
              color: aventure.accent,
              fontVariantNumeric: 'tabular-nums',
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}
          >
            {keys.length}
          </span>
        </div>
        <span style={{ width: 44, height: 44 }} aria-hidden />
      </div>

      {/* Scene content */}
      {scene.kind === 'narrative' && (
        <NarrativeScene
          scene={scene}
          aventure={aventure}
          transitioning={transitioning}
          onNext={() => goToScene(scene.next)}
        />
      )}

      {scene.kind === 'choice' && (
        <ChoiceScene
          scene={scene}
          aventure={aventure}
          transitioning={transitioning}
          onPick={(choice) => goToScene(choice.next, choice.gainKey)}
        />
      )}

      {scene.kind === 'breathing' && (
        <BreathingScene
          scene={scene}
          aventure={aventure}
          onComplete={() => goToScene(scene.next, scene.gainKey)}
        />
      )}

      {scene.kind === 'reflection' && (
        <ReflectionScene
          scene={scene}
          aventure={aventure}
          initialText={notes[sceneKey] || ''}
          onSave={(text) => {
            const newNotes = { ...notes, [sceneKey]: text };
            setNotes(newNotes);
            persistState({ notes: newNotes });
            goToScene(scene.next, scene.gainKey);
          }}
        />
      )}

      {scene.kind === 'keys-recap' && (
        <KeysRecapScene
          scene={scene}
          aventure={aventure}
          keys={keys}
          onNext={() => goToScene(scene.next)}
        />
      )}

      {scene.kind === 'final' && (
        <FinalScene
          scene={scene}
          aventure={aventure}
          keys={keys}
          onFinish={handleFinal}
        />
      )}

      <style>{`
        @keyframes aventure-bg-ken-burns {
          0%   { transform: scale(1)    translate3d(0, 0, 0); }
          100% { transform: scale(1.06) translate3d(0, -1%, 0); }
        }
        @keyframes scene-fade {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes key-pop {
          0%   { opacity: 0; transform: scale(0.6); }
          60%  { opacity: 1; transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes breath-pulse {
          0%, 100% { transform: scale(0.6); opacity: 0.42; }
          50%      { transform: scale(1);   opacity: 0.92; }
        }
      `}</style>
    </div>
  );
}

/* ─── Scènes ─── */

function SceneShell({ children, transitioning }) {
  return (
    <div
      key={transitioning ? 'out' : 'in'}
      style={{
        position: 'absolute',
        top: 'calc(env(safe-area-inset-top, 0px) + 76px)',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 110px)',
        left: 22,
        right: 22,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        color: '#FBF6E8',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        opacity: transitioning ? 0 : 1,
        transition: 'opacity 380ms cubic-bezier(0.16, 1, 0.3, 1)',
        animation: transitioning ? 'none' : 'scene-fade 700ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  );
}

function SceneHeader({ eyebrow, title, accent }) {
  return (
    <>
      {eyebrow && (
        <div
          className="neya-mark"
          style={{
            color: accent,
            marginBottom: 12,
            fontSize: 9,
            opacity: 0.96,
            textShadow: '0 1px 6px rgba(0,0,0,0.5)',
          }}
        >
          {eyebrow}
        </div>
      )}
      <h2
        style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontVariationSettings: 'var(--fraunces-italic-soft)',
          fontWeight: 400,
          fontSize: 'clamp(26px, 7vw, 34px)',
          lineHeight: 1.12,
          letterSpacing: '-0.018em',
          color: '#FBF6E8',
          textShadow: '0 2px 16px rgba(0, 0, 0, 0.42)',
          marginBottom: 18,
        }}
      >
        {title}
      </h2>
    </>
  );
}

function SceneBody({ body, quote, accent }) {
  return (
    <>
      {body && body.map((para, i) => (
        <p
          key={i}
          style={{
            margin: '0 0 14px',
            fontFamily: 'var(--font-body)',
            fontSize: 15.5,
            lineHeight: 1.62,
            color: '#FBF6E8',
            opacity: 0.94,
            textShadow: '0 1px 8px rgba(0, 0, 0, 0.42)',
          }}
        >
          {para}
        </p>
      ))}
      {quote && (
        <p
          style={{
            margin: '18px 0 0',
            paddingLeft: 16,
            borderLeft: `2px solid ${accent}`,
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            fontSize: 17,
            lineHeight: 1.4,
            color: '#FBF6E8',
            opacity: 0.96,
            textShadow: '0 1px 8px rgba(0, 0, 0, 0.42)',
          }}
        >
          « {quote} »
        </p>
      )}
    </>
  );
}

function PrimaryCTA({ label, accent, onClick, large = false }) {
  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      style={{
        appearance: 'none',
        width: '100%',
        padding: large ? '18px 28px' : '16px 24px',
        minHeight: large ? 56 : 52,
        background: accent,
        color: '#FBF6E8',
        border: 'none',
        borderRadius: 999,
        fontFamily: 'var(--font-ui)',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.222em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        boxShadow: `0 8px 24px ${accent}66`,
      }}
    >
      {label}
    </button>
  );
}

/* ─── NarrativeScene ─── */

function NarrativeScene({ scene, aventure, transitioning, onNext }) {
  return (
    <>
      <SceneShell transitioning={transitioning}>
        <SceneHeader eyebrow={scene.eyebrow} title={scene.title} accent={aventure.accent} />
        <SceneBody body={scene.body} quote={scene.quote} accent={aventure.accent} />
      </SceneShell>
      <div
        style={{
          position: 'absolute',
          left: 22,
          right: 22,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
          zIndex: 3,
        }}
      >
        <PrimaryCTA label={scene.cta || 'Avancer'} accent={aventure.accent} onClick={onNext} />
      </div>
    </>
  );
}

/* ─── ChoiceScene ─── */

function ChoiceScene({ scene, aventure, transitioning, onPick }) {
  return (
    <>
      <SceneShell transitioning={transitioning}>
        <SceneHeader eyebrow={scene.eyebrow} title={scene.title} accent={aventure.accent} />
        <SceneBody body={scene.body} quote={scene.quote} accent={aventure.accent} />
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {scene.choices.map((c, i) => (
            <button
              key={i}
              type="button"
              data-press
              onClick={() => onPick(c)}
              style={{
                appearance: 'none',
                width: '100%',
                padding: '16px 20px',
                minHeight: 56,
                background: 'rgba(251, 246, 232, 0.10)',
                border: '0.5px solid rgba(251, 246, 232, 0.36)',
                borderRadius: 14,
                color: '#FBF6E8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textAlign: 'left',
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                fontSize: 16,
                lineHeight: 1.3,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                WebkitTapHighlightColor: 'transparent',
                textShadow: '0 1px 6px rgba(0,0,0,0.4)',
              }}
            >
              <span style={{ flex: 1 }}>« {c.label} »</span>
              <span aria-hidden style={{ color: aventure.accent, fontSize: 18, flexShrink: 0 }}>›</span>
            </button>
          ))}
        </div>
      </SceneShell>
    </>
  );
}

/* ─── BreathingScene ─── */

function BreathingScene({ scene, aventure, onComplete }) {
  const cycles = scene.cycles || 3;
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState('inspire'); // 'inspire' | 'expire'
  const aliveRef = useRef(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (cycle >= cycles) {
      // Done
      const t = setTimeout(() => { if (aliveRef.current) onComplete?.(); }, 800);
      return () => clearTimeout(t);
    }
    const inspireMs = 4000;
    const expireMs = 6000;
    const duration = phase === 'inspire' ? inspireMs : expireMs;
    timerRef.current = setTimeout(() => {
      if (!aliveRef.current) return;
      if (phase === 'inspire') {
        setPhase('expire');
      } else {
        setPhase('inspire');
        setCycle((c) => c + 1);
        haptic(2);
      }
    }, duration);
    return () => clearTimeout(timerRef.current);
  }, [phase, cycle, cycles, onComplete]);

  useEffect(() => {
    return () => {
      aliveRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        zIndex: 2,
        color: '#FBF6E8',
        padding: '0 32px',
        animation: 'scene-fade 700ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="neya-mark"
        style={{
          color: aventure.accent,
          fontSize: 9,
          opacity: 0.96,
          textShadow: '0 1px 6px rgba(0,0,0,0.5)',
        }}
      >
        {scene.subtitle || 'Respire'}
      </div>

      {/* Cercle de respiration */}
      <div
        style={{
          position: 'relative',
          width: 240,
          height: 240,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `1px solid ${aventure.accent}`,
              opacity: phase === 'inspire' ? 0.28 - i * 0.06 : 0.55 - i * 0.12,
              transform: phase === 'inspire' ? `scale(${1 + i * 0.14})` : `scale(${0.32 + i * 0.10})`,
              transition: `transform ${phase === 'inspire' ? 4000 : 6000}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${phase === 'inspire' ? 4000 : 6000}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
          />
        ))}
        <div
          style={{
            width: phase === 'inspire' ? 200 : 56,
            height: phase === 'inspire' ? 200 : 56,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${aventure.accent} 0%, ${aventure.accent}88 35%, transparent 70%)`,
            opacity: phase === 'inspire' ? 0.92 : 0.40,
            filter: phase === 'inspire' ? 'blur(1px)' : 'blur(4px)',
            boxShadow: phase === 'inspire' ? `0 0 60px 16px ${aventure.accent}55` : 'none',
            transition: `width ${phase === 'inspire' ? 4000 : 6000}ms cubic-bezier(0.34, 1.1, 0.64, 1), height ${phase === 'inspire' ? 4000 : 6000}ms cubic-bezier(0.34, 1.1, 0.64, 1), opacity ${phase === 'inspire' ? 4000 : 6000}ms ease-out, filter ${phase === 'inspire' ? 4000 : 6000}ms ease-out, box-shadow ${phase === 'inspire' ? 4000 : 6000}ms ease-out`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            key={phase}
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 28,
              color: '#FBF6E8',
              textShadow: '0 1px 12px rgba(0,0,0,0.4)',
              animation: 'scene-fade 700ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {cycle >= cycles ? 'Voilà.' : phase === 'inspire' ? 'Inspire' : 'Expire'}
          </span>
        </div>
      </div>

      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 9,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: '#FBF6E8',
          opacity: 0.78,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {Math.min(cycle, cycles)} / {cycles}
      </div>
    </div>
  );
}

/* ─── ReflectionScene ─── */

function ReflectionScene({ scene, aventure, initialText, onSave }) {
  const [text, setText] = useState(initialText);

  return (
    <>
      <SceneShell transitioning={false}>
        <SceneHeader eyebrow={scene.eyebrow} title={scene.title} accent={aventure.accent} />
        <p
          style={{
            margin: '0 0 16px',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            fontSize: 17,
            lineHeight: 1.45,
            color: '#FBF6E8',
            opacity: 0.96,
            textShadow: '0 1px 8px rgba(0,0,0,0.4)',
          }}
        >
          « {scene.prompt} »
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écris ce qui vient. Tu peux laisser vide aussi."
          rows={5}
          maxLength={500}
          aria-label="Tes notes"
          style={{
            width: '100%',
            padding: '14px 16px',
            minHeight: 130,
            background: 'rgba(251, 246, 232, 0.08)',
            border: '0.5px solid rgba(251, 246, 232, 0.22)',
            borderRadius: 12,
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            lineHeight: 1.55,
            color: '#FBF6E8',
            outline: 'none',
            resize: 'none',
            boxSizing: 'border-box',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        />
      </SceneShell>
      <div
        style={{
          position: 'absolute',
          left: 22,
          right: 22,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
          zIndex: 3,
        }}
      >
        <PrimaryCTA label={scene.cta || 'Continuer'} accent={aventure.accent} onClick={() => onSave(text)} />
      </div>
    </>
  );
}

/* ─── KeysRecapScene ─── */

function KeysRecapScene({ scene, aventure, keys, onNext }) {
  return (
    <>
      <SceneShell transitioning={false}>
        <SceneHeader eyebrow={scene.eyebrow} title={scene.title} accent={aventure.accent} />
        <SceneBody body={scene.body} accent={aventure.accent} />
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {keys.map((k, i) => (
            <div
              key={k}
              style={{
                padding: '10px 16px',
                background: `${aventure.accent}26`,
                border: `0.5px solid ${aventure.accent}`,
                borderRadius: 999,
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                fontSize: 14,
                color: '#FBF6E8',
                textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                animation: `key-pop 600ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 120}ms backwards`,
              }}
            >
              ✦ {k}
            </div>
          ))}
        </div>
        {keys.length === 0 && (
          <div
            style={{
              marginTop: 18,
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: '#FBF6E8',
              opacity: 0.78,
              fontStyle: 'italic',
              textShadow: '0 1px 6px rgba(0,0,0,0.4)',
            }}
          >
            Tu n'as pas pris de clé. C'est OK. Ce que tu as traversé compte aussi.
          </div>
        )}
      </SceneShell>
      <div
        style={{
          position: 'absolute',
          left: 22,
          right: 22,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
          zIndex: 3,
        }}
      >
        <PrimaryCTA label={scene.cta || 'Sortir de la forêt'} accent={aventure.accent} onClick={onNext} large />
      </div>
    </>
  );
}

/* ─── FinalScene ─── */

function FinalScene({ scene, aventure, keys, onFinish }) {
  return (
    <>
      <SceneShell transitioning={false}>
        <SceneHeader eyebrow={scene.eyebrow} title={scene.title} accent={aventure.accent} />
        <SceneBody body={scene.body} quote={scene.quote} accent={aventure.accent} />
        {keys.length > 0 && (
          <div
            style={{
              marginTop: 28,
              padding: '14px 18px',
              background: `${aventure.accent}1A`,
              borderLeft: `2px solid ${aventure.accent}`,
              borderRadius: 6,
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              lineHeight: 1.55,
              color: '#FBF6E8',
              opacity: 0.94,
              textShadow: '0 1px 6px rgba(0,0,0,0.4)',
            }}
          >
            Tu emportes <strong style={{ color: aventure.accent }}>{keys.length} clé{keys.length > 1 ? 's' : ''}</strong> :{' '}
            <em style={{ fontStyle: 'italic' }}>{keys.join(' · ')}</em>
          </div>
        )}
      </SceneShell>
      <div
        style={{
          position: 'absolute',
          left: 22,
          right: 22,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
          zIndex: 3,
        }}
      >
        <PrimaryCTA label={scene.cta || 'Terminer'} accent={aventure.accent} onClick={onFinish} large />
      </div>
    </>
  );
}
