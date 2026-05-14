/* ============================================================
   NÉYA V2 — Cocon (sanctuaire personnalisable)
   ============================================================
   Identité : pseudo (edit) · totem (6 choix) · mantra
   Items : 5 items grid (bougie/cristal/plante/totem/portail) toggle placed
   Stats : jours connectés · minutes totales · mondes explorés
   ============================================================ */

import { useState, useEffect } from 'react';
import { WORLDS } from '../worlds';
import { getProfile, setProfile, haptic, ls } from '../state';
import GlassCard from '../../components/GlassCard';
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
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--void)',
      }}
    >
      {/* Subtle atmospheric bg */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${totemWorld.bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.18,
          filter: 'blur(10px) brightness(0.6)',
          transform: 'scale(1.08)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(5,8,16,0.92) 0%, rgba(5,8,16,0.75) 50%, rgba(5,8,16,0.95) 100%)',
        }}
      />

      {/* Scrollable content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: 'calc(env(safe-area-inset-top, 0px) + 24px) var(--sp-5) calc(env(safe-area-inset-bottom, 0px) + 110px)',
        }}
      >
        {/* Header */}
        <div className="neya-mark" style={{ color: 'var(--content-tertiary)', marginBottom: 6 }}>
          MON COCON
        </div>
        <div
          className="neya-h1"
          style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}
        >
          {profile.pseudo ? (
            <>Bienvenue, <em className="neya-key">{profile.pseudo}.</em></>
          ) : (
            <>Pose-toi <em className="neya-key">ici.</em></>
          )}
        </div>

        {/* Identité — pseudo & mantra */}
        <SectionTitle accent={totemWorld.accent}>Identité</SectionTitle>

        <GlassCard variant="default" style={{ marginBottom: 12 }}>
          <FieldRow label="Prénom" editing={editingPseudo}>
            {editingPseudo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  autoFocus
                  value={tempPseudo}
                  onChange={(e) => setTempPseudo(e.target.value)}
                  placeholder="Ton prénom"
                  style={inputStyle}
                  onKeyDown={(e) => { if (e.key === 'Enter') savePseudo(); }}
                />
                <Button size="sm" variant="primary" onClick={savePseudo}>OK</Button>
              </div>
            ) : (
              <ValueButton onClick={() => { setTempPseudo(profile.pseudo || ''); setEditingPseudo(true); }}>
                {profile.pseudo || <span style={{ color: 'var(--content-whisper, var(--content-tertiary))' }}>Toucher pour poser ton prénom</span>}
              </ValueButton>
            )}
          </FieldRow>
        </GlassCard>

        <GlassCard variant="default" style={{ marginBottom: 24 }}>
          <FieldRow label="Mantra du moment">
            {editingMantra ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                  autoFocus
                  value={tempMantra}
                  onChange={(e) => setTempMantra(e.target.value)}
                  placeholder="Une phrase pour toi…"
                  rows={2}
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="sm" variant="primary" onClick={saveMantra}>Garder</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setTempMantra(profile.mantra || ''); setEditingMantra(false); }}>Annuler</Button>
                </div>
              </div>
            ) : (
              <ValueButton onClick={() => { setTempMantra(profile.mantra || ''); setEditingMantra(true); }}>
                {profile.mantra ? (
                  <span style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 17 }}>« {profile.mantra} »</span>
                ) : (
                  <span style={{ color: 'var(--content-tertiary)' }}>Toucher pour poser un mantra…</span>
                )}
              </ValueButton>
            )}
          </FieldRow>
        </GlassCard>

        {/* Totem — 6 choix */}
        <SectionTitle accent={totemWorld.accent}>Mon totem</SectionTitle>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 8,
            marginBottom: 24,
          }}
        >
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
                  background: isActive ? `${w.accentRgb}, 0.12)` : 'rgba(245,242,236,0.04)',
                  border: `0.5px solid ${isActive ? w.accent : 'var(--hairline)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--content-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'background 200ms var(--ease-out), border-color 200ms var(--ease-out)',
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
                    color: isActive ? 'var(--content-primary)' : 'var(--content-secondary)',
                  }}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Items à placer */}
        <SectionTitle accent={totemWorld.accent}>Mon sanctuaire</SectionTitle>
        <div
          className="neya-body-sm"
          style={{ color: 'var(--content-tertiary)', marginBottom: 12 }}
        >
          Touche pour poser ou retirer un objet.
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginBottom: 24,
          }}
        >
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
                  padding: '16px 14px',
                  background: isPlaced ? `${totemWorld.accentRgb}, 0.10)` : 'rgba(245,242,236,0.04)',
                  border: `0.5px solid ${isPlaced ? totemWorld.accent : 'var(--hairline)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--content-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'background 240ms var(--ease-out), border-color 240ms var(--ease-out)',
                }}
              >
                <span style={{ fontSize: 26, color: isPlaced ? totemWorld.accent : 'var(--content-secondary)', lineHeight: 1 }}>
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
        <SectionTitle accent={totemWorld.accent}>Ton chemin</SectionTitle>
        <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          <Stat label="Jours" value={profile.progress?.joursConnectes || 1} />
          <Stat label="Minutes" value={profile.progress?.minutesTotales || 0} />
          <Stat label="Mondes" value={profile.progress?.worldsExplored?.length || 1} />
        </div>

        {/* Footer whisper */}
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

function SectionTitle({ children, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, marginTop: 4 }}>
      <span style={{ width: 18, height: 1, background: accent, opacity: 0.7 }} />
      <span
        className="neya-mark"
        style={{ color: accent }}
      >
        {children}
      </span>
    </div>
  );
}

function FieldRow({ label, editing, children }) {
  return (
    <div>
      <div
        className="neya-mark"
        style={{ color: 'var(--content-tertiary)', marginBottom: 8 }}
      >
        {label}
      </div>
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
        padding: 0,
        textAlign: 'left',
        color: 'var(--content-primary)',
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

const inputStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  borderBottom: '0.5px solid var(--hairline-strong)',
  outline: 'none',
  padding: '6px 0',
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: 'var(--content-primary)',
};

function Stat({ label, value }) {
  return (
    <div
      style={{
        flex: 1,
        background: 'rgba(245,242,236,0.04)',
        border: '0.5px solid var(--hairline)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        alignItems: 'flex-start',
      }}
    >
      <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: 'var(--content-primary)',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
