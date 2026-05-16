/* ============================================================
   V2 Preview — composants en isolation pour validation visuelle
   ============================================================
   URL: /?preview=v2
   ============================================================ */

import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import ChapterMark, { BrandMark, ChapterInfo } from '../components/ChapterMark';
import HeroTitle from '../components/HeroTitle';
import BreathingCircle from '../components/BreathingCircle';

const SectionLabel = ({ children }) => (
  <div style={{ marginTop: 48, marginBottom: 16 }}>
    <div
      style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 'var(--type-mark)',
        fontWeight: 'var(--weight-medium)',
        letterSpacing: 'var(--ls-mark)',
        textTransform: 'uppercase',
        color: 'var(--content-accent-dawn)',
        marginBottom: 4,
      }}
    >
      {children}
    </div>
    <div style={{ height: 1, width: 36, background: 'rgba(212, 168, 120, 0.6)' }} />
  </div>
);

const Row = ({ children, style }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', ...style }}>
    {children}
  </div>
);

export default function PreviewV2() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--void)',
        color: 'var(--content-primary)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: 'calc(env(safe-area-inset-top, 0px) + 32px) 22px calc(env(safe-area-inset-bottom, 0px) + 64px)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--type-mark)',
              letterSpacing: 'var(--ls-mark)',
              textTransform: 'uppercase',
              color: 'var(--content-tertiary)',
              fontWeight: 'var(--weight-medium)',
            }}
          >
            ÇA VA ? · Design System v2 · Preview
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--type-h1)',
              fontWeight: 'var(--weight-regular)',
              lineHeight: 'var(--lh-h1)',
              letterSpacing: 'var(--ls-h1)',
              fontVariationSettings: 'var(--fraunces-opsz-large)',
              margin: '8px 0 0',
            }}
          >
            Composants <em className="neya-key">de base.</em>
          </h1>
          <p
            style={{
              margin: '12px 0 0',
              fontSize: 14,
              lineHeight: 1.55,
              color: 'var(--content-secondary)',
              maxWidth: 480,
            }}
          >
            Studio VØR painterly direction × Apple structural discipline.
            5 atomes : Button, GlassCard, ChapterMark, HeroTitle, BreathingCircle.
            Chacun validé contre les Do's &amp; Don'ts du spec v2.
          </p>
        </div>

        {/* 1. BUTTON */}
        <SectionLabel>1 · Button</SectionLabel>

        <div style={{ marginBottom: 12, color: 'var(--content-tertiary)', fontSize: 11 }}>
          Sizes : sm / md / lg
        </div>
        <Row>
          <Button size="sm">Continuer</Button>
          <Button size="md">Continuer</Button>
          <Button size="lg">Continuer mon aventure</Button>
        </Row>

        <div style={{ marginTop: 22, marginBottom: 12, color: 'var(--content-tertiary)', fontSize: 11 }}>
          Variants : primary · primary-night · secondary · ghost · destructive
        </div>
        <Row>
          <Button variant="primary">Primary</Button>
          <Button variant="primary-night">Primary Night</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Mode crise — quitter</Button>
        </Row>

        <div style={{ marginTop: 22, marginBottom: 12, color: 'var(--content-tertiary)', fontSize: 11 }}>
          Icon-only & Disabled
        </div>
        <Row>
          <Button variant="icon" icon="✕" aria-label="Fermer" />
          <Button variant="icon" icon="‹" aria-label="Retour" />
          <Button variant="icon" icon="❤" aria-label="Touché·e" />
          <Button disabled>Indisponible</Button>
        </Row>

        {/* 2. GLASS CARD */}
        <SectionLabel>2 · GlassCard</SectionLabel>

        {/* Solid variant — sur flat bg */}
        <div style={{ marginBottom: 12, color: 'var(--content-tertiary)', fontSize: 11 }}>
          default · solid sur surface non-painterly
        </div>
        <GlassCard variant="default" style={{ maxWidth: 360 }}>
          <div className="neya-label" style={{ marginBottom: 6 }}>Routine du soir</div>
          <div className="neya-body" style={{ color: 'var(--content-secondary)', fontSize: 12 }}>
            Trois respirations, lampe basse, fenêtre ouverte.
          </div>
        </GlassCard>

        {/* Glass variant — sur painterly (simulated with photo bg below) */}
        <div style={{ marginTop: 22, marginBottom: 12, color: 'var(--content-tertiary)', fontSize: 11 }}>
          glass · sur scène painterly (bg simulé)
        </div>
        <div
          style={{
            position: 'relative',
            height: 200,
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            backgroundImage: 'url(/bg-foret.avif)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            padding: 22,
          }}
        >
          <GlassCard variant="glass" worldAccent="rgba(212, 168, 120" style={{ maxWidth: 220 }}>
            <div className="neya-label" style={{ marginBottom: 4 }}>Forêt de la Clarté</div>
            <div className="neya-body-sm">Respiration · 5 min</div>
          </GlassCard>
        </div>

        {/* Editorial variant */}
        <div style={{ marginTop: 22, marginBottom: 12, color: 'var(--content-tertiary)', fontSize: 11 }}>
          editorial · magazine moment (cream wash)
        </div>
        <GlassCard variant="editorial" style={{ maxWidth: 360 }}>
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--type-mark)',
              fontWeight: 'var(--weight-medium)',
              letterSpacing: 'var(--ls-mark)',
              textTransform: 'uppercase',
              color: 'rgba(26, 26, 31, 0.55)',
              marginBottom: 8,
            }}
          >
            Journal — Jeudi soir
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--type-h2)',
              fontWeight: 'var(--weight-regular)',
              lineHeight: 'var(--lh-h2)',
              letterSpacing: 'var(--ls-h2)',
              fontVariationSettings: 'var(--fraunces-opsz-large)',
              color: 'var(--cava-ink)',
              margin: 0,
            }}
          >
            Tu es revenu·e <em className="neya-key">7 jours d'affilée.</em>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(26, 26, 31, 0.65)', lineHeight: 1.55, marginTop: 8, marginBottom: 0 }}>
            C'est ce qui compte. Pas la durée, pas la performance — juste le retour.
          </p>
        </GlassCard>

        {/* 3. CHAPTER MARK */}
        <SectionLabel>3 · ChapterMark</SectionLabel>

        <div style={{ marginBottom: 12, color: 'var(--content-tertiary)', fontSize: 11 }}>
          BrandMark seul · ChapterInfo seul · Composite avec scène
        </div>
        <Row>
          <BrandMark />
          <div style={{ width: 1, height: 24, background: 'var(--hairline)' }} />
          <ChapterInfo chapter={1} world="Forêt de la Clarté" align="left" />
        </Row>

        <div
          style={{
            position: 'relative',
            height: 200,
            marginTop: 22,
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            backgroundImage: 'url(/bg-cosmos.avif)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(5,8,16,0.7) 0%, rgba(5,8,16,0.1) 50%)',
            }}
          />
          <ChapterMark
            brand
            chapter={4}
            world="Lac des Émotions"
            topPadding="0px"
          />
        </div>

        {/* 4. HERO TITLE */}
        <SectionLabel>4 · HeroTitle</SectionLabel>

        <div style={{ marginBottom: 12, color: 'var(--content-tertiary)', fontSize: 11 }}>
          Dawn (Amber) · Night (Moon White) · Sizes hero/h1/h2
        </div>

        <HeroTitle
          eyebrow="L'ÉVEIL"
          paletteMode="dawn"
          size="hero"
          title={<>Le lion blanc s'éveille <em className="neya-key">avec toi.</em></>}
          body="Une question, une respiration. Pas besoin d'aller bien pour commencer."
        />

        <div style={{ height: 32 }} />

        <HeroTitle
          eyebrow="LA NUIT"
          paletteMode="night"
          size="h1"
          title={<>Pose-toi. <em className="neya-key">Le daim veille.</em></>}
          body="L'eau du lac est plate. La lune se reflète. Tu peux te poser."
        />

        <div style={{ height: 32 }} />

        <HeroTitle
          eyebrow="LE REFUGE"
          paletteMode="dawn"
          size="h2"
          title={<>Tu n'es pas <em className="neya-key">seul·e.</em></>}
          body="L'ours polaire vient. C'est sa saison."
        />

        {/* 5. BREATHING CIRCLE */}
        <SectionLabel>5 · BreathingCircle</SectionLabel>

        <div style={{ marginBottom: 12, color: 'var(--content-tertiary)', fontSize: 11 }}>
          Cycle 19s (4s inspire · 7s retiens · 8s expire) — Tilleul rare et précieux
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '48px 0',
            background: 'var(--surface-scene)',
            borderRadius: 'var(--radius-lg)',
            border: '0.5px solid var(--hairline)',
          }}
        >
          <BreathingCircle size={180} />
        </div>

        {/* Validation footer */}
        <SectionLabel>Validation Do's &amp; Don'ts</SectionLabel>

        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            lineHeight: 1.7,
            color: 'var(--content-secondary)',
            maxWidth: 560,
          }}
        >
          ✓ Pas de pure white — partout cream #FBF6E8.<br />
          ✓ Pas de neon / fluorescent.<br />
          ✓ Buttons pill-shaped (radius-pill 9999px).<br />
          ✓ Fraunces uniquement sur hero/h1/h2 — italic 300 sur 2-4 keywords.<br />
          ✓ Press scale(0.95) via [data-press] (Apple mix).<br />
          ✓ Glass cards uniquement sur painterly scenes (preview montre les 2 cas).<br />
          ✓ Tilleul rare : exclusivement BreathingCircle + futurs checkmarks.<br />
          ✓ Anti-bounce — toutes les animations ease-out, jamais spring rebound.<br />
          ✓ Tutoiement + inclusive (seul·e, fatigué·e).<br />
          ✓ Pas de bold 700+ (seulement stat token).<br />
        </div>

        <div style={{ height: 32 }} />
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: 'var(--ls-mark)',
            textTransform: 'uppercase',
            color: 'var(--content-tertiary)',
          }}
        >
          v2.0 · {new Date().toISOString().split('T')[0]}
        </div>
      </div>
    </div>
  );
}
