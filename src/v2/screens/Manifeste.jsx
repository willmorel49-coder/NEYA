/* ============================================================
   ÇA VA ? — Manifeste d'entrée (V3)
   ============================================================
   Ecran cinematique avant-ouverture : scroll vertical lent qui
   revele le manifeste de l'app en 4 sections.
   Remplace l'onboarding + Patronus + Tour de l'ancienne V2.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { patchProfile, ls, haptic } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';

const SECTIONS = [
  {
    eyebrow: '01 · ARRIVÉE',
    title: 'Merci.',
    paragraphs: [
      'Merci d\'être ici.',
      'Parce que parfois, continuer à avancer demande déjà une force immense.',
      'Il y a des douleurs qui ne se voient pas.',
      'Des tempêtes silencieuses que certaines personnes apprennent à cacher tellement longtemps qu\'elles deviennent invisibles aux yeux des autres.',
      'Le monde continue normalement autour.',
      'Les conversations continuent.',
      'Les journées passent.',
      'Et pendant ce temps-là, certains essaient juste de survivre à ce qu\'ils ressentent à l\'intérieur.',
      'Il y a des nuits où l\'anxiété prend toute la place.',
      'Des nuits où le cœur bat trop vite.',
      'Où respirer devient difficile.',
      'Où le cerveau fait croire que quelque chose de grave va arriver.',
      'Et malgré ça, le lendemain, on remet un sourire.',
      'On répond encore :',
      { italic: '« oui ça va. »' },
    ],
  },
  {
    eyebrow: '02 · ORIGINE',
    title: 'D\'où ça vient.',
    paragraphs: [
      'ÇA VA ? est née d\'un vrai mal-être.',
      'De crises d\'angoisse vécues en silence.',
      'De nuits passées à attendre que la panique redescende enfin.',
      'De cette sensation d\'être enfermé dans sa propre tête sans réussir à l\'arrêter.',
      'De la fatigue mentale qui épuise tellement qu\'on finit parfois par ne plus reconnaître la personne qu\'on était avant.',
      'Mais le plus difficile n\'était pas toujours la douleur.',
      { italic: 'Le plus difficile, c\'était de continuer à faire semblant que tout allait bien.' },
      'De sourire automatiquement.',
      'De répondre « ça va » alors qu\'au fond tout s\'effondrait doucement.',
    ],
  },
  {
    eyebrow: '03 · POURQUOI',
    title: 'Pourquoi ÇA VA ?',
    paragraphs: [
      'Parce qu\'un jour, cette question a commencé à faire mal.',
      { italic: '« Ça va ? »' },
      'Deux mots simples.',
      'Deux mots que tout le monde prononce.',
      'Mais pour certaines personnes, ces mots cachent des choses très lourdes.',
      'La peur.',
      'Le vide.',
      'L\'anxiété.',
      'La solitude mentale.',
      'La sensation d\'être perdu à l\'intérieur de soi-même.',
      'Alors cette application n\'a pas été créée pour rendre les gens plus performants.',
      'Elle a été créée pour offrir un endroit calme.',
      'Un refuge.',
      'Un espace où l\'on peut respirer quelques minutes sans avoir besoin de prétendre que tout va bien.',
    ],
  },
  {
    eyebrow: '04 · CRÉATION',
    title: 'Qui l\'a fait.',
    paragraphs: [
      'Cette application a été créée par quelqu\'un qui connaît réellement ces états-là.',
      'Quelqu\'un qui sait ce que ça fait d\'avoir peur de son propre cerveau.',
      'De penser trop.',
      'De cacher ses crises.',
      'De sourire mécaniquement pendant qu\'à l\'intérieur tout devient de plus en plus lourd.',
      'Alors un jour, une idée est née :',
      { italic: 'créer l\'endroit qu\'on aurait aimé trouver pendant ses pires nuits.' },
      'Un endroit doux.',
      'Humain.',
      'Silencieux.',
      'Un endroit qui ne juge pas.',
      'Qui ne demande pas d\'aller bien.',
      'Qui te laisse simplement exister, respirer, et te sentir un peu moins seul.',
    ],
  },
];

const STORAGE_KEY = 'manifeste_seen';

export default function Manifeste({ onClose }) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const scrollRef = useRef(null);

  const handleEnter = () => {
    haptic(6);
    ls.set(STORAGE_KEY, true);
    // Marque les anciens flags pour ne pas declencher les anciens flows
    ls.set('patronus_seen', true);
    ls.set('tour_seen', true);
    patchProfile({
      onboarding: { completed: true, completedAt: new Date().toISOString() },
    });
    setClosing(true);
    setTimeout(() => onClose?.(), 420);
  };

  const handleSkip = () => {
    haptic(2);
    handleEnter();
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleSkip,
    labelText: 'Manifeste ÇA VA ?',
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: true } }));
    }
    return () => {
      cancelAnimationFrame(raf);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: false } }));
      }
    };
  }, []);

  // Reveal-on-scroll via IntersectionObserver
  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const items = scroll.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-revealed', 'true');
            io.unobserve(e.target);
          }
        });
      },
      { root: scroll, threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'var(--cream)',
        color: 'var(--ink)',
        opacity: closing ? 0 : mounted ? 1 : 0,
        transition: 'opacity 420ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Voile haut */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 'calc(env(safe-area-inset-top, 0px) + 80px)',
          background: 'linear-gradient(to bottom, var(--cream) 0%, var(--cream) 60%, transparent 100%)',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* Bouton Passer */}
      <button
        type="button"
        onClick={handleSkip}
        data-press
        aria-label="Passer le manifeste"
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          right: 18,
          appearance: 'none',
          padding: '8px 14px',
          minHeight: 36,
          background: 'rgba(26, 26, 47, 0.04)',
          border: '0.5px solid rgba(26, 26, 47, 0.18)',
          borderRadius: 999,
          color: 'var(--ink-soft)',
          fontFamily: 'var(--font-ui)',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontWeight: 600,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          zIndex: 4,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        Passer ›
      </button>

      {/* Scroll content */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
        }}
      >
        {/* Hero — wordmark ÇA VA ? */}
        <section
          data-reveal
          style={{
            position: 'relative',
            minHeight: 'calc(100dvh - env(safe-area-inset-top, 0px))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'calc(env(safe-area-inset-top, 0px) + 60px) 24px 60px',
            textAlign: 'center',
            opacity: 0,
            transform: 'translateY(16px)',
            transition: 'opacity 1200ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              letterSpacing: '0.42em',
              fontWeight: 600,
              color: 'var(--ink-soft)',
              marginBottom: 32,
            }}
          >
            MMXXVI
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 'clamp(56px, 16vw, 92px)',
              fontWeight: 300,
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
            }}
          >
            ÇA VA&nbsp;?
          </h1>
          <div
            style={{
              width: 40,
              height: 1,
              background: 'rgba(26, 26, 47, 0.32)',
              margin: '32px auto 0',
            }}
          />
          <p
            style={{
              marginTop: 28,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 16,
              lineHeight: 1.5,
              color: 'var(--ink-soft)',
              maxWidth: 320,
            }}
          >
            L'application faite pour ceux qui disent « ça va »
            <br />
            quand ça ne va pas.
          </p>
          <div
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              letterSpacing: '0.32em',
              color: 'var(--ink-whisper)',
              fontWeight: 600,
              animation: 'manifeste-scroll-hint 2.4s ease-in-out infinite',
            }}
          >
            ↓ FAIRE DÉFILER
          </div>
        </section>

        {/* Sections */}
        {SECTIONS.map((section, sIdx) => (
          <section
            key={sIdx}
            style={{
              padding: '120px 28px 80px',
              maxWidth: 620,
              margin: '0 auto',
            }}
          >
            <div
              data-reveal
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 10,
                letterSpacing: '0.32em',
                fontWeight: 600,
                color: 'var(--ink-soft)',
                marginBottom: 24,
                opacity: 0,
                transform: 'translateY(12px)',
                transition: 'opacity 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            >
              {section.eyebrow}
            </div>
            <h2
              data-reveal
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                fontSize: 'clamp(38px, 9vw, 56px)',
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: '-0.012em',
                color: 'var(--ink)',
                marginBottom: 40,
                opacity: 0,
                transform: 'translateY(16px)',
                transition: 'opacity 1100ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 80ms, transform 1100ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 80ms',
              }}
            >
              {section.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {section.paragraphs.map((p, pIdx) => {
                const isItalic = typeof p === 'object' && p.italic;
                const text = isItalic ? p.italic : p;
                return (
                  <p
                    key={pIdx}
                    data-reveal
                    style={{
                      margin: 0,
                      fontFamily: isItalic ? 'var(--font-display)' : 'var(--font-body)',
                      fontStyle: isItalic ? 'italic' : 'normal',
                      fontVariationSettings: isItalic ? 'var(--fraunces-italic-soft)' : undefined,
                      fontSize: isItalic ? 19 : 17,
                      lineHeight: isItalic ? 1.5 : 1.65,
                      color: isItalic ? 'var(--ink)' : 'var(--ink-soft)',
                      letterSpacing: isItalic ? '-0.005em' : '0',
                      maxWidth: isItalic ? 480 : 560,
                      opacity: 0,
                      transform: 'translateY(10px)',
                      transition: `opacity 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${Math.min(pIdx * 40, 320)}ms, transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${Math.min(pIdx * 40, 320)}ms`,
                    }}
                  >
                    {text}
                  </p>
                );
              })}
            </div>
          </section>
        ))}

        {/* Signature finale + CTA */}
        <section
          style={{
            padding: '60px 28px calc(env(safe-area-inset-bottom, 0px) + 80px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div
            data-reveal
            style={{
              width: 1,
              height: 60,
              background: 'rgba(26, 26, 47, 0.18)',
              marginBottom: 40,
              opacity: 0,
              transform: 'scaleY(0.4)',
              transformOrigin: 'top',
              transition: 'opacity 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
          <p
            data-reveal
            style={{
              margin: 0,
              marginBottom: 12,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 24,
              lineHeight: 1.3,
              color: 'var(--ink)',
              opacity: 0,
              transform: 'translateY(12px)',
              transition: 'opacity 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 200ms, transform 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 200ms',
            }}
          >
            ÇA VA&nbsp;?
          </p>
          <p
            data-reveal
            style={{
              margin: 0,
              marginBottom: 44,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 16,
              lineHeight: 1.5,
              color: 'var(--ink-soft)',
              maxWidth: 360,
              opacity: 0,
              transform: 'translateY(12px)',
              transition: 'opacity 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 280ms, transform 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 280ms',
            }}
          >
            L'application faite pour ceux qui disent « ça va »
            <br />
            quand ça ne va pas.
          </p>
          <button
            type="button"
            data-press
            onClick={handleEnter}
            aria-label="Entrer dans ÇA VA ?"
            style={{
              appearance: 'none',
              padding: '16px 42px',
              minHeight: 52,
              background: 'var(--gradient-blue)',
              color: 'var(--cream)',
              border: 'none',
              borderRadius: 999,
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              boxShadow: '0 8px 24px rgba(26, 26, 47, 0.18)',
            }}
          >
            Entrer
          </button>
        </section>
      </div>

      <style>{`
        [data-reveal][data-revealed="true"] {
          opacity: 1 !important;
          transform: translateY(0) scaleY(1) !important;
        }
        @keyframes manifeste-scroll-hint {
          0%, 100% { opacity: 0.55; transform: translate(-50%, 0); }
          50% { opacity: 0.85; transform: translate(-50%, 4px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal] {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          @keyframes manifeste-scroll-hint {
            0%, 100% { opacity: 0.7; transform: translateX(-50%); }
          }
        }
      `}</style>
    </div>
  );
}
