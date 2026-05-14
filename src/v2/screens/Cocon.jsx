/* ============================================================
   NÉYA V3 — Cocon (LIGHT MODE, wash personnalisable)
   ============================================================
   Sanctuaire 100% personnalisable. Cream base + wash totem.
   Cards pearl translucides + ink text.
   ============================================================ */

import { useState, useEffect } from 'react';
import { WORLDS } from '../worlds';
import { getProfile, setProfile, haptic } from '../state';
import Button from '../../components/Button';

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

  const placed = profile.coconPlaced || {};
  const totemKey = profile.totem || 'lion';
  const currentTotem = TOTEMS.find((t) => t.key === totemKey) || TOTEMS[0];
  const totemWorld = WORLDS[currentTotem.world];

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

  return (
    <div
      className={totemWorld.wash}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
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
        <SectionTitle accent={totemWorld.accent} style={{ marginTop: 32 }}>Mon sanctuaire</SectionTitle>
        <div className="neya-body-sm" style={{ color: 'var(--content-tertiary)', marginBottom: 12 }}>
          Touche pour poser ou retirer un objet.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
          {ITEMS.map((item, i) => {
            const isPlaced = placed[item.key];
            return (
              <button
                key={item.key}
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
                <span style={{ fontSize: 28, color: isPlaced ? totemWorld.accent : 'var(--content-secondary)', lineHeight: 1 }}>
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
      </div>
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

function SectionTitle({ children, accent, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, ...style }}>
      <span style={{ width: 18, height: 1, background: accent, opacity: 0.8 }} />
      <span className="neya-mark" style={{ color: accent }}>
        {children}
      </span>
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
