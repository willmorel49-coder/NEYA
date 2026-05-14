/* ============================================================
   NÉYA V3 — Cocon (LIGHT MODE, wash personnalisable)
   ============================================================
   Sanctuaire 100% personnalisable. Cream base + wash totem.
   Cards pearl translucides + ink text.
   ============================================================ */

import { useState, useEffect } from 'react';
import { WORLDS } from '../worlds';
import { getProfile, setProfile, patchProfile, haptic, ls } from '../state';
import Button from '../../components/Button';

const Q1_PILLS = [
  { value: 'pas-terrible',     label: 'Pas terrible' },
  { value: 'ca-va-je-gere',    label: 'Ça va, je gère' },
  { value: 'plutot-bien',      label: 'Plutôt bien' },
  { value: 'je-sais-pas-trop', label: 'Je sais pas trop' },
];
const Q2_PILLS = [
  { value: 'stress',   label: 'Le stress' },
  { value: 'sommeil',  label: 'Le sommeil' },
  { value: 'emotions', label: 'Les émotions' },
  { value: 'curieux',  label: 'Curieux·se' },
];
const Q3_PILLS = [
  { value: 5,      label: '5 min' },
  { value: 10,     label: '10 min' },
  { value: 15,     label: '15 min' },
  { value: 'plus', label: 'Plus si je peux' },
];
const Q4_PILLS = [
  { value: 'matin',        label: 'Le matin' },
  { value: 'midi',         label: 'À midi' },
  { value: 'soir',         label: 'Le soir' },
  { value: 'avant-dormir', label: 'Avant de dormir' },
];

const QUESTIONS = [
  { field: 'q1_etat',    label: 'Comment je vais',     pills: Q1_PILLS, placeholder: '—' },
  { field: 'q2_motif',   label: "Ce qui m'amène",      pills: Q2_PILLS, placeholder: '—' },
  { field: 'q3_minutes', label: 'Mon temps par jour',  pills: Q3_PILLS, placeholder: '—' },
  { field: 'q4_rythme',  label: 'Mon rythme',          pills: Q4_PILLS, placeholder: '—' },
];

const TERRACOTTA = '#c7674a';

const TOTEMS = [
  { key: 'lion',    label: 'Lion blanc',    glyph: '◆', world: 'foret' },
  { key: 'ours',    label: 'Ours polaire',  glyph: '◇', world: 'temple' },
  { key: 'aigle',   label: 'Aigle céleste', glyph: '△', world: 'oasis' },
  { key: 'daim',    label: 'Daim lunaire',  glyph: '✦', world: 'lac' },
  { key: 'baleine', label: 'Baleine sage',  glyph: '○', world: 'montagne' },
  { key: 'renard',  label: 'Renard',        glyph: '▽', world: 'communaute' },
];

const ITEMS = [
  { key: 'bougie',  label: 'Bougie',  glyph: '✺', whisper: 'Lumière douce' },
  { key: 'cristal', label: 'Cristal', glyph: '◇', whisper: 'Présence claire' },
  { key: 'plante',  label: 'Plante',  glyph: '❦', whisper: 'Souffle vivant' },
  { key: 'totem',   label: 'Totem',   glyph: '◈', whisper: 'Animal proche' },
  { key: 'portail', label: 'Portail', glyph: '○', whisper: 'Ailleurs' },
];

export default function Cocon() {
  const [profile, setLocalProfile] = useState(() => getProfile());
  const [editingPseudo, setEditingPseudo] = useState(false);
  const [tempPseudo, setTempPseudo] = useState(profile.pseudo || '');
  const [editingMantra, setEditingMantra] = useState(false);
  const [tempMantra, setTempMantra] = useState(profile.mantra || '');
  const [editingAnswer, setEditingAnswer] = useState(null); // field key or null
  const [confirmReset, setConfirmReset] = useState(false);

  const placed = profile.coconPlaced || {};
  const totemKey = profile.totem || 'lion';
  const currentTotem = TOTEMS.find((t) => t.key === totemKey) || TOTEMS[0];
  const totemWorld = WORLDS[currentTotem.world];
  const placedCount = Object.values(placed).filter(Boolean).length;
  const allPlaced = placedCount >= ITEMS.length;
  const TILLEUL = '#d4e08c';

  const save = (patch) => {
    const next = { ...profile, ...patch };
    setLocalProfile(next);
    setProfile(next);
  };

  const savePseudo = () => {
    save({ pseudo: tempPseudo.trim() || null });
    setEditingPseudo(false);
    haptic(4);
  };

  const saveMantra = () => {
    save({ mantra: tempMantra.trim() || null });
    setEditingMantra(false);
    haptic(4);
  };

  const pickTotem = (key) => {
    save({ totem: key });
    haptic(6);
  };

  const togglePlaced = (key) => {
    const next = { ...placed, [key]: !placed[key] };
    save({ coconPlaced: next });
  };

  const pickAnswer = (field, value) => {
    const nextOb = { ...(profile.onboarding || {}), [field]: value };
    const next = patchProfile({ onboarding: nextOb });
    setLocalProfile(next);
    setEditingAnswer(null);
    haptic(4);
  };

  const doReset = () => {
    haptic(8);
    ls.clear();
    window.location.reload();
  };

  return (
    <div
      className={totemWorld.wash}
      style={{
        position: 'absolute',
        inset: 0,
        color: 'var(--ink)',
      }}
    >
      {/* Atmospheric bg overlay du totem world */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${totemWorld.bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.06,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: 'calc(env(safe-area-inset-top, 0px) + 22px) 22px calc(env(safe-area-inset-bottom, 0px) + 110px)',
        }}
      >
        {/* Header */}
        <div className="neya-mark" style={{ color: 'var(--content-tertiary)', marginBottom: 6 }}>
          MON COCON · {currentTotem.label.toUpperCase()}
        </div>
        <h1
          className="neya-h1"
          style={{ fontFamily: 'var(--font-display)', marginBottom: 28 }}
        >
          {profile.pseudo ? (
            <>Bienvenue, <em className="neya-key">{profile.pseudo}.</em></>
          ) : (
            <>Pose-toi <em className="neya-key">ici.</em></>
          )}
        </h1>

        {/* Identité */}
        <SectionTitle accent={totemWorld.accent}>Identité</SectionTitle>

        <PearlCard>
          <FieldLabel>Prénom</FieldLabel>
          {editingPseudo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <input
                autoFocus
                value={tempPseudo}
                onChange={(e) => setTempPseudo(e.target.value)}
                placeholder="Ton prénom"
                style={inputStyle}
                onKeyDown={(e) => { if (e.key === 'Enter') savePseudo(); }}
              />
              <Button size="sm" variant="primary" style={primaryDarkBtn} onClick={savePseudo}>OK</Button>
            </div>
          ) : (
            <ValueButton onClick={() => { setTempPseudo(profile.pseudo || ''); setEditingPseudo(true); }}>
              {profile.pseudo || <span style={{ color: 'var(--content-tertiary)' }}>Toucher pour poser ton prénom</span>}
            </ValueButton>
          )}
        </PearlCard>

        <PearlCard style={{ marginTop: 10 }}>
          <FieldLabel>Mantra du moment</FieldLabel>
          {editingMantra ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
              <textarea
                autoFocus
                value={tempMantra}
                onChange={(e) => setTempMantra(e.target.value)}
                placeholder="Une phrase pour toi…"
                rows={2}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.5, borderBottom: 'none', background: 'rgba(26, 26, 47, 0.04)', borderRadius: 8, padding: 10 }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="sm" variant="primary" style={primaryDarkBtn} onClick={saveMantra}>Garder</Button>
                <Button size="sm" variant="ghost" onClick={() => { setTempMantra(profile.mantra || ''); setEditingMantra(false); }}>Annuler</Button>
              </div>
            </div>
          ) : (
            <ValueButton onClick={() => { setTempMantra(profile.mantra || ''); setEditingMantra(true); }}>
              {profile.mantra ? (
                <span style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 17, fontVariationSettings: 'var(--fraunces-italic-soft)' }}>« {profile.mantra} »</span>
              ) : (
                <span style={{ color: 'var(--content-tertiary)' }}>Toucher pour poser un mantra…</span>
              )}
            </ValueButton>
          )}
        </PearlCard>

        {/* Totem — 6 choix */}
        <SectionTitle accent={totemWorld.accent} style={{ marginTop: 32 }}>Mon totem</SectionTitle>
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
          {TOTEMS.map((t) => {
            const isActive = t.key === totemKey;
            const w = WORLDS[t.world];
            return (
              <button
                key={t.key}
                data-press
                onClick={() => pickTotem(t.key)}
                style={{
                  appearance: 'none',
                  padding: '14px 8px',
                  background: isActive ? `${w.accentRgb}, 0.18)` : 'rgba(255, 252, 245, 0.6)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: `0.5px solid ${isActive ? w.accent : 'rgba(26, 26, 47, 0.08)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'all 200ms var(--ease-out)',
                  boxShadow: isActive ? '0 2px 12px rgba(26, 26, 47, 0.06)' : 'none',
                }}
              >
                <span style={{ fontSize: 22, color: isActive ? w.accent : 'var(--content-secondary)', lineHeight: 1 }}>
                  {t.glyph}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    fontWeight: 500,
                    lineHeight: 1.2,
                    textAlign: 'center',
                    color: isActive ? 'var(--ink)' : 'var(--content-secondary)',
                  }}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Items */}
        <SectionTitle
          accent={totemWorld.accent}
          style={{ marginTop: 32 }}
          hairlineColor={allPlaced ? TILLEUL : undefined}
          trailing={
            <span
              style={{
                fontFamily: '"Sora", system-ui, sans-serif',
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: allPlaced ? TILLEUL : 'var(--content-tertiary)',
                fontVariantNumeric: 'tabular-nums',
                transition: 'color 320ms var(--ease-out-ios)',
              }}
            >
              {placedCount}/5
            </span>
          }
        >
          Mon sanctuaire
        </SectionTitle>
        <div className="neya-body-sm" style={{ color: 'var(--content-tertiary)', marginBottom: 12 }}>
          Touche pour poser ou retirer un objet.
        </div>
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
          {ITEMS.map((item, i) => {
            const isPlaced = placed[item.key];
            return (
              <button
                key={item.key + '-' + (isPlaced ? 'on' : 'off')}
                data-press
                onClick={() => togglePlaced(item.key)}
                style={{
                  gridColumn: i === 4 ? '1 / -1' : 'auto',
                  appearance: 'none',
                  padding: '18px 14px',
                  background: isPlaced ? `${totemWorld.accentRgb}, 0.14)` : 'rgba(255, 252, 245, 0.6)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: `0.5px solid ${isPlaced ? totemWorld.accent : 'rgba(26, 26, 47, 0.08)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'all 240ms var(--ease-out)',
                  boxShadow: isPlaced ? '0 2px 12px rgba(26, 26, 47, 0.06)' : 'none',
                }}
              >
                <span
                  className={isPlaced ? 'tilleul-pop' : ''}
                  style={{ fontSize: 28, color: isPlaced ? totemWorld.accent : 'var(--content-secondary)', lineHeight: 1 }}
                >
                  {item.glyph}
                </span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500 }}>
                  {item.label}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: isPlaced ? totemWorld.accent : 'var(--content-tertiary)', fontStyle: 'italic' }}>
                  {isPlaced ? '✓ posé' : item.whisper}
                </span>
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <SectionTitle accent={totemWorld.accent} style={{ marginTop: 32 }}>Ton chemin</SectionTitle>
        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          <Stat label="Jours" value={profile.progress?.joursConnectes || 1} accent={totemWorld.accent} />
          <Stat label="Minutes" value={profile.progress?.minutesTotales || 0} accent={totemWorld.accent} />
          <Stat label="Mondes" value={profile.progress?.worldsExplored?.length || 1} accent={totemWorld.accent} />
        </div>

        <div
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            fontStyle: 'italic',
            color: 'var(--content-tertiary)',
            lineHeight: 1.55,
            padding: '8px 24px',
          }}
        >
          {profile.progress?.joursConnectes >= 7
            ? `Tu es revenu·e ${profile.progress.joursConnectes} jours d’affilée — c’est ce qui compte.`
            : 'Ce cocon est le tien. Touche, pose, change.'}
        </div>

        {/* Mes réponses */}
        <SectionTitle accent={totemWorld.accent} style={{ marginTop: 36 }}>Mes réponses</SectionTitle>
        <PearlCard style={{ padding: '4px 0' }}>
          {QUESTIONS.map((q, idx) => {
            const value = profile.onboarding?.[q.field];
            const currentLabel = q.pills.find((p) => p.value === value)?.label;
            const isEditing = editingAnswer === q.field;
            return (
              <div
                key={q.field}
                style={{
                  borderTop: idx === 0 ? 'none' : '0.5px solid rgba(26, 26, 47, 0.06)',
                }}
              >
                <button
                  data-press
                  onClick={() => { haptic(2); setEditingAnswer(isEditing ? null : q.field); }}
                  style={{
                    appearance: 'none',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    textAlign: 'left',
                  }}
                >
                  <span className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
                    {q.label}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 14,
                        fontWeight: 500,
                        color: currentLabel ? 'var(--ink)' : 'var(--content-tertiary)',
                      }}
                    >
                      {currentLabel || q.placeholder}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 16,
                        color: 'var(--content-tertiary)',
                        lineHeight: 1,
                        transform: isEditing ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 220ms var(--ease-out-ios, var(--ease-out))',
                        display: 'inline-block',
                      }}
                    >
                      ›
                    </span>
                  </span>
                </button>
                {isEditing && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      padding: '0 18px 16px',
                    }}
                  >
                    {q.pills.map((p) => {
                      const isActive = p.value === value;
                      return (
                        <button
                          key={String(p.value)}
                          data-press
                          onClick={() => pickAnswer(q.field, p.value)}
                          style={{
                            appearance: 'none',
                            width: '100%',
                            padding: '12px 14px',
                            background: isActive
                              ? `${totemWorld.accentRgb}, 0.14)`
                              : 'rgba(255, 252, 245, 0.7)',
                            border: `0.5px solid ${isActive ? totemWorld.accent : 'rgba(26, 26, 47, 0.08)'}`,
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--ink)',
                            fontFamily: 'var(--font-ui)',
                            fontSize: 14,
                            fontWeight: isActive ? 600 : 500,
                            textAlign: 'left',
                            cursor: 'pointer',
                            WebkitTapHighlightColor: 'transparent',
                            transition: 'all 200ms var(--ease-out)',
                          }}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </PearlCard>

        {/* Réinitialiser — danger zone */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, marginBottom: 8 }}>
          <button
            data-press
            onClick={() => { haptic(4); setConfirmReset(true); }}
            className="neya-mark"
            style={{
              appearance: 'none',
              background: 'transparent',
              border: 'none',
              color: TERRACOTTA,
              cursor: 'pointer',
              padding: '12px 18px',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Réinitialiser mon NÉYA
          </button>
        </div>
      </div>

      {/* Confirm reset overlay */}
      {confirmReset && (
        <ResetConfirmSheet
          onCancel={() => setConfirmReset(false)}
          onConfirm={doReset}
        />
      )}
    </div>
  );
}

function ResetConfirmSheet({ onCancel, onConfirm }) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26, 26, 47, 0.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'fadeIn 200ms var(--ease-out, ease-out)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--cream-light, #fffcf5)',
          borderTopLeftRadius: 'var(--radius-xl, 24px)',
          borderTopRightRadius: 'var(--radius-xl, 24px)',
          padding: '14px 22px calc(env(safe-area-inset-bottom, 0px) + 28px)',
          boxShadow: '0 -8px 40px rgba(26, 26, 47, 0.18)',
          animation: 'slideUpSheet 320ms var(--ease-out-ios, cubic-bezier(0.22, 1, 0.36, 1))',
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 38,
            height: 4,
            borderRadius: 2,
            background: 'rgba(26, 26, 47, 0.16)',
            margin: '0 auto 18px',
          }}
        />
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            fontSize: 28,
            lineHeight: 1.15,
            color: 'var(--ink)',
            margin: '4px 0 14px',
            textAlign: 'center',
          }}
        >
          Es-tu sûr·e ?
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: 1.55,
            color: 'var(--content-secondary, rgba(26, 26, 47, 0.7))',
            textAlign: 'center',
            margin: '0 0 24px',
          }}
        >
          Toutes tes données NÉYA vont disparaître (pseudo, mantra, totem, mondes explorés, habitudes, panier ÇA VA?). Cette action est irréversible.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            data-press
            onClick={onCancel}
            style={{
              flex: 1,
              appearance: 'none',
              background: 'transparent',
              border: '0.5px solid rgba(26, 26, 47, 0.18)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              fontFamily: 'var(--font-ui)',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--ink)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Annuler
          </button>
          <button
            data-press
            onClick={onConfirm}
            style={{
              flex: 1,
              appearance: 'none',
              background: TERRACOTTA,
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              fontFamily: 'var(--font-ui)',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--cream, #fffcf5)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              boxShadow: '0 4px 14px rgba(199, 103, 74, 0.28)',
            }}
          >
            Tout effacer
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function PearlCard({ children, style }) {
  return (
    <div
      style={{
        background: 'rgba(255, 252, 245, 0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '0.5px solid rgba(26, 26, 47, 0.08)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        boxShadow: '0 2px 14px rgba(26, 26, 47, 0.04)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, accent, style, trailing, hairlineColor }) {
  const lineColor = hairlineColor || accent;
  const labelColor = hairlineColor || accent;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, ...style }}>
      <span
        style={{
          width: 18,
          height: 1,
          background: lineColor,
          opacity: 0.8,
          transition: 'background 320ms var(--ease-out-ios, ease-out)',
        }}
      />
      <span
        className="neya-mark"
        style={{
          color: labelColor,
          transition: 'color 320ms var(--ease-out-ios, ease-out)',
        }}
      >
        {children}
      </span>
      {trailing ? (
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center' }}>
          {trailing}
        </span>
      ) : null}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
      {children}
    </div>
  );
}

function ValueButton({ onClick, children }) {
  return (
    <button
      data-press
      onClick={onClick}
      style={{
        appearance: 'none',
        width: '100%',
        background: 'transparent',
        border: 'none',
        padding: '8px 0 0',
        textAlign: 'left',
        color: 'var(--ink)',
        fontFamily: 'var(--font-body)',
        fontSize: 15,
        lineHeight: 1.45,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div
      style={{
        flex: 1,
        background: 'rgba(255, 252, 245, 0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '0.5px solid rgba(26, 26, 47, 0.06)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        alignItems: 'flex-start',
      }}
    >
      <div className="neya-mark" style={{ color: accent }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const inputStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  borderBottom: '0.5px solid rgba(26, 26, 47, 0.18)',
  outline: 'none',
  padding: '6px 0',
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: 'var(--ink)',
};

const primaryDarkBtn = {
  background: 'var(--ink)',
  color: 'var(--cream)',
};
