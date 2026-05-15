/* ============================================================
   NÉYA V2 — ÇA VA? · ProductDetail (slide-up sheet)
   ============================================================
   Inspection produit boutique. Light cream + palette ÇA VA?.
   Image 4:5 top 50%, info zone (tagline caps · titre Fraunces ·
   prix · citation manuscrite), sélecteur taille pearl pills,
   quantité ± · broderie preview, CTA sticky bottom.
   ============================================================ */

import { useEffect, useMemo, useState } from 'react';
import { haptic } from '../state';
import useSwipeToDismiss from '../hooks/useSwipeToDismiss';

const BRAND_QUOTES = [
  'Nous existons pour briser le masque du ça va.',
  'Faire de la mode un langage qui libère la parole sur la santé mentale.',
  'When the power of love overcomes the love of power, the world will know peace.',
  'Pour ceux qui n\'ont pas besoin de mentir.',
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

const FRAUNCES_ITALIC = '"opsz" 144, "SOFT" 100, "WONK" 1';

export default function ProductDetail({
  product,
  capsule,
  image,
  onAddToCart,
  onClose,
  pseudo,
  totem,
}) {
  const [closing, setClosing] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [zoomed, setZoomed] = useState(false);

  // Swipe-to-dismiss (iOS HIG : drag handle down)
  const { bindHandle, translateY, isDragging } = useSwipeToDismiss({
    onClose: () => handleClose(),
  });

  // Citation aléatoire fixée pour la durée du sheet
  const quote = useMemo(() => {
    const i = Math.floor(Math.random() * BRAND_QUOTES.length);
    return BRAND_QUOTES[i];
  }, []);

  // Lock scroll background pendant l'ouverture
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ESC pour fermer
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    if (closing) return;
    setClosing(true);
    haptic(2);
    setTimeout(() => { onClose?.(); }, 320);
  }

  function handleSize(size) {
    haptic(4);
    setSelectedSize(size);
  }

  function inc() { haptic(4); setQty((q) => Math.min(q + 1, 9)); }
  function dec() { haptic(4); setQty((q) => Math.max(q - 1, 1)); }

  function handleAdd() {
    if (!selectedSize) return;
    haptic([6, 30, 6]);
    onAddToCart?.({ ...product, size: selectedSize, qty });
    setClosing(true);
    setTimeout(() => { onClose?.(); }, 320);
  }

  const accent = capsule?.accent || 'var(--cava-warm)';
  const accentSoft = capsule?.accentSoft || 'rgba(159, 88, 76, 0.18)';

  // discount = computed by parent — receive via product if needed
  const discountPct = product?.discountPct || 0;
  const basePrice = product?.price || 0;
  const finalPrice = discountPct > 0
    ? Math.round(basePrice * (1 - discountPct / 100))
    : basePrice;

  return (
    <>
      <style>{`
        @keyframes pdSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0);    }
        }
        @keyframes pdSlideDown {
          from { transform: translateY(0);    }
          to   { transform: translateY(100%); }
        }
        @keyframes pdFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pdFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>

      {/* Scrim */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(26, 26, 47, 0.32)',
          zIndex: 999,
          animation: closing
            ? 'pdFadeOut 320ms var(--ease-out-ios, ease-out) forwards'
            : 'pdFadeIn 420ms var(--ease-out-ios, ease-out) forwards',
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          top: '4vh',
          zIndex: 1000,
          background: 'var(--cava-bg)',
          color: 'var(--cava-ink)',
          borderRadius: '22px 22px 0 0',
          boxShadow: '0 -12px 40px rgba(26, 26, 47, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: `translateY(${translateY}px)`,
          transition: isDragging
            ? 'none'
            : 'transform 320ms var(--ease-spring-ios)',
          animation: closing
            ? 'pdSlideDown 320ms var(--ease-out-ios, ease-out) forwards'
            : translateY === 0 && !isDragging
              ? 'pdSlideUp 420ms var(--ease-out-ios, ease-out) forwards'
              : 'none',
        }}
      >
        {/* Drag handle — grab zone ~64x24 around the visible bar */}
        <div
          {...bindHandle}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 24,
            paddingTop: 8,
            cursor: 'grab',
            touchAction: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div
            style={{
              width: isDragging ? 40 : 36,
              height: isDragging ? 6 : 5,
              borderRadius: 999,
              background: isDragging
                ? 'var(--ink-soft)'
                : 'rgba(26, 26, 47, 0.18)',
              transition: 'width 180ms var(--ease-out-ios), height 180ms var(--ease-out-ios), background 180ms var(--ease-out-ios)',
            }}
          />
        </div>

        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px 6px',
        }}>
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: 'var(--content-tertiary)',
          }}>
            {(capsule?.name || 'ÇA VA?').toUpperCase()} · CAPSULE
          </div>
          <button
            data-press
            onClick={handleClose}
            aria-label="Fermer"
            style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: 'transparent',
              border: '0.5px solid var(--hairline-strong)',
              color: 'var(--cava-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 120,
        }}>
          {/* Image zone — 4:5 full-width */}
          <div
            data-press={image ? '' : undefined}
            onClick={image ? () => { haptic(4); setZoomed(true); } : undefined}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4 / 5',
              background: image
                ? 'var(--cream-dim)'
                : `linear-gradient(135deg, ${accentSoft} 0%, var(--cava-bg) 100%)`,
              overflow: 'hidden',
              cursor: image ? 'pointer' : 'default',
              WebkitTapHighlightColor: 'transparent',
            }}>
            {image ? (
              <>
                <img
                  src={image}
                  alt={product?.name || ''}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                {/* Zoom hint */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--cream-light, rgba(255, 252, 245, 0.85))',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--cava-ink)',
                    fontSize: 14,
                    lineHeight: 1,
                    opacity: 0.7,
                    boxShadow: '0 2px 8px rgba(26, 26, 47, 0.12)',
                    pointerEvents: 'none',
                  }}
                >
                  ⤢
                </div>
              </>
            ) : (
              <>
                {/* Caps top-left */}
                <div style={{
                  position: 'absolute',
                  top: 16, left: 18,
                  fontFamily: 'var(--font-ui)',
                  fontSize: 9,
                  fontWeight: 500,
                  letterSpacing: '0.222em',
                  textTransform: 'uppercase',
                  color: 'var(--content-tertiary)',
                  opacity: 0.85,
                }}>
                  {(capsule?.name || 'ÇA VA?').toUpperCase()}
                </div>

                {/* Hairline accent center */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 48,
                  height: 1,
                  background: accent,
                  opacity: 0.6,
                }} />
              </>
            )}
          </div>

          {/* Info zone */}
          <div style={{ padding: '24px 22px 4px' }}>
            {/* Tagline caps */}
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.222em',
              textTransform: 'uppercase',
              color: accent,
              marginBottom: 12,
            }}>
              {capsule?.tagline || 'CAPSULE'}
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: FRAUNCES_ITALIC,
              fontSize: 'clamp(24px, 6vw, 30px)',
              lineHeight: 1.1,
              letterSpacing: '-0.014em',
              color: 'var(--cava-ink)',
              fontWeight: 400,
              margin: 0,
            }}>
              {product?.name || 'Pièce'}
            </h2>

            {/* Price row */}
            <div style={{
              marginTop: 12,
              display: 'flex',
              alignItems: 'baseline',
              gap: 10,
            }}>
              {discountPct > 0 && (
                <span style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 14,
                  color: 'var(--content-tertiary)',
                  textDecoration: 'line-through',
                  textDecorationThickness: '0.5px',
                }}>
                  {basePrice} €
                </span>
              )}
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: '-0.014em',
                color: 'var(--cava-ink)',
              }}>
                {finalPrice} €
              </span>
              {discountPct > 0 && (
                <span style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: accent,
                  marginLeft: 4,
                }}>
                  −{discountPct}%
                </span>
              )}
            </div>

            {/* Hand-drawn quote */}
            <p style={{
              marginTop: 22,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: FRAUNCES_ITALIC,
              fontSize: 13,
              lineHeight: 1.55,
              color: 'var(--ink-soft)',
              fontWeight: 300,
              borderLeft: `1px solid ${accent}`,
              paddingLeft: 12,
              opacity: 0.92,
            }}>
              « {quote} »
            </p>
          </div>

          {/* Size selector */}
          <div style={{ padding: '20px 22px 0' }}>
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: 'var(--tracking-caps)',
              textTransform: 'uppercase',
              color: 'var(--content-tertiary)',
              marginBottom: 10,
            }}>
              TAILLE
            </div>
            <div style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}>
              {SIZES.map((s) => {
                const active = selectedSize === s;
                return (
                  <button
                    key={s}
                    data-press
                    onClick={() => handleSize(s)}
                    style={{
                      flex: '1 1 0',
                      minWidth: 52,
                      padding: '10px 0',
                      borderRadius: 999,
                      background: active ? 'var(--cream-light)' : 'var(--cream-light)',
                      border: active
                        ? `1px solid ${accent}`
                        : '0.5px solid var(--hairline-strong)',
                      color: active ? accent : 'var(--cava-ink)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      letterSpacing: '0.04em',
                      transition: 'border-color 180ms var(--ease-out-ios), color 180ms var(--ease-out-ios)',
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div style={{ padding: '22px 22px 0' }}>
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: 'var(--tracking-caps)',
              textTransform: 'uppercase',
              color: 'var(--content-tertiary)',
              marginBottom: 10,
            }}>
              QUANTITÉ
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}>
              <button
                data-press
                onClick={dec}
                aria-label="Diminuer"
                disabled={qty <= 1}
                style={{
                  width: 32, height: 32,
                  borderRadius: '50%',
                  background: 'var(--cream-light)',
                  border: '0.5px solid var(--hairline-strong)',
                  color: 'var(--cava-ink)',
                  fontSize: 16,
                  lineHeight: 1,
                  opacity: qty <= 1 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                −
              </button>
              <span style={{
                minWidth: 24,
                textAlign: 'center',
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--cava-ink)',
              }}>
                {qty}
              </span>
              <button
                data-press
                onClick={inc}
                aria-label="Augmenter"
                disabled={qty >= 9}
                style={{
                  width: 32, height: 32,
                  borderRadius: '50%',
                  background: 'var(--cream-light)',
                  border: '0.5px solid var(--hairline-strong)',
                  color: 'var(--cava-ink)',
                  fontSize: 16,
                  lineHeight: 1,
                  opacity: qty >= 9 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Broderie preview */}
          {pseudo && (
            <div style={{ padding: '22px 22px 8px' }}>
              <div style={{
                background: 'var(--cream-light)',
                border: '0.5px solid var(--hairline-strong)',
                borderRadius: 14,
                padding: '12px 14px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 9,
                  fontWeight: 500,
                  letterSpacing: 'var(--tracking-caps)',
                  textTransform: 'uppercase',
                  color: 'var(--content-tertiary)',
                  marginBottom: 8,
                }}>
                  BRODERIE INCLUSE · DOS
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontVariationSettings: FRAUNCES_ITALIC,
                  fontSize: 16,
                  fontWeight: 400,
                  color: accent,
                  lineHeight: 1.3,
                  marginBottom: 6,
                }}>
                  Pour {pseudo} · le {totem || 'totem'}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  fontWeight: 400,
                  color: 'var(--ink-soft)',
                  lineHeight: 1.4,
                  opacity: 0.78,
                }}>
                  Brodé main par notre atelier. Inclus dans le prix.
                </div>
              </div>
            </div>
          )}

          {/* Footer mark — petit signe ça va? */}
          <div style={{
            textAlign: 'center',
            padding: '18px 22px 0',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontVariationSettings: FRAUNCES_ITALIC,
            fontSize: 13,
            color: 'var(--content-tertiary)',
            opacity: 0.6,
          }}>
            ça va ?
          </div>
        </div>

        {/* Sticky CTA bar */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          padding: '14px 20px calc(14px + env(safe-area-inset-bottom)) 20px',
          background: 'linear-gradient(to top, var(--cava-bg) 75%, rgba(251,246,232,0))',
          pointerEvents: 'none',
        }}>
          <button
            data-press
            onClick={handleAdd}
            disabled={!selectedSize}
            style={{
              pointerEvents: 'auto',
              width: '100%',
              height: 52,
              borderRadius: 14,
              border: 'none',
              background: selectedSize ? 'var(--cava-ink)' : 'var(--cream-light)',
              color: selectedSize ? 'var(--cava-bg)' : 'var(--content-tertiary)',
              fontFamily: 'var(--font-ui)',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.04em',
              boxShadow: selectedSize
                ? '0 4px 24px rgba(26, 26, 47, 0.16)'
                : 'inset 0 0 0 0.5px var(--hairline-strong)',
              transition: 'background 220ms var(--ease-out-ios), color 220ms var(--ease-out-ios)',
            }}
          >
            {selectedSize ? 'Ajouter au panier' : 'Choisis ta taille'}
          </button>
        </div>
      </div>

      {/* Zoom overlay — fullscreen tap-to-close */}
      {zoomed && image && (
        <div
          onClick={() => { haptic(4); setZoomed(false); }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(26, 26, 47, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            animation: 'fade-in 240ms var(--ease-out-ios)',
            cursor: 'pointer',
          }}
        >
          <img
            src={image}
            alt={product?.name || ''}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '100%',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-deep)',
              animation: 'sheet-rise 420ms var(--ease-spring-soft) both',
              cursor: 'default',
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
            left: 0, right: 0,
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 16,
            color: 'rgba(255, 252, 245, 0.92)',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            pointerEvents: 'none',
          }}>
            {product?.name}
          </div>
        </div>
      )}
    </>
  );
}
