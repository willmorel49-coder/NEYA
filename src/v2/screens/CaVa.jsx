/* ============================================================
   NÉYA V2 — ÇA VA? (boutique capsule clothing)
   ============================================================
   Light cream palette (rupture totale avec NÉYA dark cosmic).
   Header "ÇA VA?" Fraunces italic + tagline manifeste.
   3 passes : Libre (warm) · Ça Va (blue) · Vraiment ? (purple).
   3 capsules grid avec identité couleur + produits placeholder.
   Cart slide-in droite avec total + Passer commande.
   ============================================================ */

import { useState, useEffect } from 'react';
import { ls, haptic, getProfile } from '../state';
import Button from '../../components/Button';

const PASSES = [
  { key: 'libre',    label: 'Libre',     priceY: 'Gratuit',     discount: 0,  color: 'var(--cava-warm)' },
  { key: 'cava',     label: 'Ça Va',     priceY: '9,90 €/an',   discount: 10, color: 'var(--cava-blue)' },
  { key: 'vraiment', label: 'Vraiment ?', priceY: '24,90 €/an', discount: 25, color: 'var(--cava-purple)' },
];

// Agent E — Pass Vraiment? offert au 30e jour de présence sur NÉYA
const PASS_UNLOCK_THRESHOLD = 30;
function isPassUnlocked(passKey, joursConnectes) {
  if (passKey === 'libre') return true;
  if (passKey === 'cava') return true;     // payant, dispo a tout moment
  if (passKey === 'vraiment') return joursConnectes >= PASS_UNLOCK_THRESHOLD;
  return false;
}
function passLabel(pass, joursConnectes) {
  if (pass.key !== 'vraiment') return pass.priceY;
  if (joursConnectes >= PASS_UNLOCK_THRESHOLD) return 'Offert · ta présence';
  return `${pass.priceY} (à 30 j)`;
}

const CAPSULES = [
  {
    key: 'libre',
    name: 'Libre',
    accent: 'var(--cava-warm)',
    accentSoft: 'rgba(212, 152, 128, 0.18)',
    tagline: 'Pour ceux qui se relèvent.',
    products: [
      { id: 'libre-hoodie',    name: 'Hoodie crème',   price: 89 },
      { id: 'libre-tshirt',    name: 'T-shirt broderie', price: 39 },
      { id: 'libre-cap',       name: 'Casquette',      price: 29 },
    ],
  },
  {
    key: 'cava',
    name: 'Ça Va',
    accent: 'var(--cava-blue)',
    accentSoft: 'rgba(93, 123, 184, 0.18)',
    tagline: 'Pour ceux qui n’ont pas besoin de mentir.',
    products: [
      { id: 'cava-sweat',      name: 'Sweat oversize', price: 95 },
      { id: 'cava-tshirt',     name: 'T-shirt poche',  price: 39 },
      { id: 'cava-pants',      name: 'Pantalon ample', price: 79 },
    ],
  },
  {
    key: 'vraiment',
    name: 'Vraiment ?',
    accent: 'var(--cava-purple)',
    accentSoft: 'rgba(61, 47, 107, 0.18)',
    tagline: 'Pour ceux qui osent la question.',
    products: [
      { id: 'vr-hoodie',       name: 'Hoodie manifeste', price: 95 },
      { id: 'vr-tshirt',       name: 'T-shirt phrase',  price: 42 },
      { id: 'vr-tote',         name: 'Tote bag',        price: 24 },
    ],
  },
];

function loadCart() {
  return ls.get('cava_cart', []);
}
function saveCart(items) {
  ls.set('cava_cart', items);
}
function loadActivePass() {
  return ls.get('cava_pass', 'libre');
}
function saveActivePass(key) {
  ls.set('cava_pass', key);
}

export default function CaVa() {
  const profile = getProfile();
  const joursConnectes = profile.progress?.joursConnectes || 0;
  const pseudo = profile.pseudo;
  const totem = profile.totem || 'lion';
  const vraimentUnlocked = isPassUnlocked('vraiment', joursConnectes);

  const [cart, setCart] = useState(() => loadCart());
  const [activePass, setActivePass] = useState(() => loadActivePass());
  const [passOpen, setPassOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const currentPass = PASSES.find((p) => p.key === activePass) || PASSES[0];
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountedTotal = cartTotal * (1 - currentPass.discount / 100);

  const pickPass = (key) => {
    if (!isPassUnlocked(key, joursConnectes)) {
      haptic([4, 30, 4]);
      return;
    }
    setActivePass(key);
    saveActivePass(key);
    setPassOpen(false);
    haptic(4);
  };

  const addToCart = (product) => {
    const existing = cart.find((i) => i.id === product.id);
    const next = existing
      ? cart.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
      : [...cart, { ...product, qty: 1 }];
    setCart(next);
    saveCart(next);
    haptic(6);
  };

  const updateQty = (id, delta) => {
    const next = cart
      .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
      .filter((i) => i.qty > 0);
    setCart(next);
    saveCart(next);
    haptic(4);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--cava-bg)',
        color: 'var(--cava-ink)',
      }}
    >
      {/* Scrollable content */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding:
            'calc(env(safe-area-inset-top, 0px) + 24px) var(--sp-5) calc(env(safe-area-inset-bottom, 0px) + 110px)',
        }}
      >
        {/* Header row : brand + pass + cart */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.222em',
                textTransform: 'uppercase',
                color: 'rgba(26, 26, 47, 0.55)',
                marginBottom: 8,
              }}
            >
              CAPSULE · MARQUE SŒUR DE NÉYA
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 36,
                fontWeight: 400,
                lineHeight: 1.0,
                letterSpacing: '-0.018em',
                fontVariationSettings: 'var(--fraunces-opsz-large)',
                margin: 0,
                color: 'var(--cava-ink)',
              }}
            >
              ÇA VA ?
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Pass selector */}
            <button
              data-press
              onClick={() => { haptic(4); setPassOpen((o) => !o); }}
              style={{
                appearance: 'none',
                background: 'transparent',
                border: `0.5px solid ${currentPass.color}`,
                borderRadius: 'var(--radius-pill)',
                padding: '6px 14px',
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                fontWeight: 500,
                color: currentPass.color,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                WebkitTapHighlightColor: 'transparent',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: currentPass.color,
                }}
              />
              {currentPass.label}
              <span style={{ fontSize: 9, opacity: 0.7 }}>▾</span>
            </button>

            {/* Cart */}
            <button
              data-press
              onClick={() => { haptic(4); setCartOpen(true); }}
              aria-label="Panier"
              style={{
                appearance: 'none',
                background: 'transparent',
                border: '0.5px solid rgba(26, 26, 47, 0.18)',
                borderRadius: '50%',
                width: 36,
                height: 36,
                color: 'var(--cava-ink)',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
                fontSize: 14,
              }}
            >
              ⌒
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    minWidth: 16,
                    height: 16,
                    background: 'var(--cava-purple)',
                    color: 'var(--cava-bg)',
                    borderRadius: '50%',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 9,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Manifeste tagline */}
        <p
          style={{
            margin: '8px 0 32px',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: 1.55,
            color: 'rgba(26, 26, 47, 0.65)',
            maxWidth: 380,
          }}
        >
          Faire de la mode un langage qui libère la parole sur la santé mentale.
          <br />
          <em style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            Briser le masque du « ça va ».
          </em>
        </p>

        {/* Pass dropdown */}
        {passOpen && (
          <div
            style={{
              background: 'rgba(255, 252, 245, 0.78)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '0.5px solid rgba(26, 26, 47, 0.10)',
              borderRadius: 'var(--radius-lg)',
              padding: 12,
              marginBottom: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {PASSES.map((p) => {
              const isActive = p.key === activePass;
              const unlocked = isPassUnlocked(p.key, joursConnectes);
              const showGift = p.key === 'vraiment' && unlocked;
              return (
                <button
                  key={p.key}
                  data-press={unlocked ? true : undefined}
                  onClick={() => pickPass(p.key)}
                  disabled={!unlocked}
                  style={{
                    appearance: 'none',
                    background: isActive ? 'rgba(26, 26, 47, 0.06)' : 'transparent',
                    border: showGift ? `0.5px solid ${p.color}` : 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                    opacity: unlocked ? 1 : 0.55,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: p.color,
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: 14,
                            fontWeight: 500,
                            color: 'var(--cava-ink)',
                          }}
                        >
                          {p.label}
                        </span>
                        {showGift && (
                          <span
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontStyle: 'italic',
                              fontSize: 11,
                              color: p.color,
                              fontVariationSettings: 'var(--fraunces-italic-soft)',
                            }}
                          >
                            ♡ pour toi
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 11,
                          color: 'rgba(26, 26, 47, 0.55)',
                        }}
                      >
                        {p.discount > 0 ? `${p.discount}% sur tout` : 'Aucune réduction'}
                        {!unlocked && p.key === 'vraiment' && ` · ${joursConnectes}/${PASS_UNLOCK_THRESHOLD} j`}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 11,
                      color: showGift ? p.color : 'var(--cava-ink)',
                      fontWeight: 500,
                    }}
                  >
                    {passLabel(p, joursConnectes)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 3 capsules */}
        {CAPSULES.map((c) => (
          <CapsuleSection
            key={c.key}
            capsule={c}
            onAddToCart={addToCart}
            discountPercent={currentPass.discount}
            pseudo={pseudo}
            totem={totem}
          />
        ))}

        {/* Footer manifesto */}
        <div
          style={{
            marginTop: 40,
            padding: '24px 16px',
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontStyle: 'italic',
            lineHeight: 1.45,
            color: 'rgba(26, 26, 47, 0.75)',
            fontVariationSettings: 'var(--fraunces-opsz-large)',
          }}
        >
          « Nous existons pour briser<br />le masque du <em>ça va.</em> »
        </div>
      </div>

      {/* Cart drawer slide-in right */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          updateQty={updateQty}
          discountPercent={currentPass.discount}
          currentPass={currentPass}
          onClose={() => setCartOpen(false)}
        />
      )}
    </div>
  );
}

function CapsuleSection({ capsule, onAddToCart, discountPercent, pseudo, totem }) {
  return (
    <div style={{ marginBottom: 32 }}>
      {/* Capsule header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
        <span
          style={{
            width: 24,
            height: 1,
            background: capsule.accent,
            marginBottom: 6,
          }}
        />
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontStyle: 'italic',
            fontWeight: 400,
            letterSpacing: '-0.014em',
            margin: 0,
            color: capsule.accent,
            fontVariationSettings: 'var(--fraunces-opsz-large)',
          }}
        >
          {capsule.name}
        </h2>
      </div>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: 'rgba(26, 26, 47, 0.65)',
          marginTop: 0,
          marginBottom: 14,
          fontStyle: 'italic',
        }}
      >
        {capsule.tagline}
      </p>

      {/* Products grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}
      >
        {capsule.products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            capsule={capsule}
            onAdd={() => onAddToCart(p)}
            discountPercent={discountPercent}
            pseudo={pseudo}
            totem={totem}
          />
        ))}
      </div>
    </div>
  );
}

const TOTEM_LABEL = {
  lion: 'lion', ours: 'ours', aigle: 'aigle',
  daim: 'daim', baleine: 'baleine', renard: 'renard',
};

function ProductCard({ product, capsule, onAdd, discountPercent, pseudo, totem }) {
  const finalPrice = product.price * (1 - discountPercent / 100);
  const isDiscounted = discountPercent > 0;
  const broderieText = pseudo
    ? `Pour ${pseudo}${totem ? ` · le ${TOTEM_LABEL[totem] || totem}` : ''}`
    : null;

  return (
    <div
      style={{
        background: 'var(--cream-light)',
        border: '0.5px solid rgba(26, 26, 47, 0.08)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Visual placeholder — 4:5 ratio cream tile with capsule accent stripe */}
      <div
        style={{
          aspectRatio: '4 / 5',
          background: `linear-gradient(135deg, ${capsule.accentSoft} 0%, var(--cava-bg) 100%)`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Decorative atmospheric marks */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            fontFamily: 'var(--font-ui)',
            fontSize: 8,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: 'rgba(26, 26, 47, 0.40)',
          }}
        >
          ÇA VA ? · {capsule.name}
        </div>
        <div
          style={{
            width: 56,
            height: 1,
            background: capsule.accent,
            opacity: 0.6,
          }}
        />

        {/* Broderie preview (Agent E) — Pour {pseudo} · le {totem} */}
        {broderieText && (
          <div
            style={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              right: 14,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 11,
              lineHeight: 1.3,
              color: capsule.accent,
              opacity: 0.7,
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              letterSpacing: '-0.005em',
              textAlign: 'left',
            }}
          >
            {broderieText}
          </div>
        )}
      </div>

      {/* Meta */}
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.2,
            color: 'var(--cava-ink)',
            fontVariationSettings: 'var(--fraunces-opsz-large)',
          }}
        >
          {product.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          {isDiscounted && (
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                color: 'rgba(26, 26, 47, 0.42)',
                textDecoration: 'line-through',
              }}
            >
              {product.price} €
            </span>
          )}
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--cava-ink)',
            }}
          >
            {finalPrice.toFixed(0)} €
          </span>
        </div>
        <button
          data-press
          onClick={onAdd}
          style={{
            appearance: 'none',
            marginTop: 4,
            background: 'var(--cava-ink)',
            color: 'var(--cava-bg)',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            padding: '9px 14px',
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.03em',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}

function CartDrawer({ cart, updateQty, discountPercent, currentPass, onClose }) {
  const subTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const finalTotal = subTotal * (1 - discountPercent / 100);
  const savings = subTotal - finalTotal;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        background: 'rgba(26, 26, 47, 0.45)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(420px, 92vw)',
          background: 'var(--cava-bg)',
          borderLeft: '0.5px solid rgba(26, 26, 47, 0.12)',
          padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 22px calc(env(safe-area-inset-bottom, 0px) + 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontStyle: 'italic',
              fontWeight: 400,
              letterSpacing: '-0.014em',
              margin: 0,
              color: 'var(--cava-ink)',
              fontVariationSettings: 'var(--fraunces-opsz-large)',
            }}
          >
            Ton panier
          </h3>
          <button
            data-press
            onClick={onClose}
            style={{
              appearance: 'none',
              background: 'rgba(26, 26, 47, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: 'var(--cava-ink)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Items list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cart.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 32,
                color: 'rgba(26, 26, 47, 0.55)',
                fontStyle: 'italic',
                fontFamily: 'var(--font-display)',
                fontSize: 17,
              }}
            >
              Ton panier est vide.
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  background: 'var(--cream-light)',
                  border: '0.5px solid rgba(26, 26, 47, 0.08)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 14,
                      fontStyle: 'italic',
                      fontVariationSettings: 'var(--fraunces-opsz-large)',
                      color: 'var(--cava-ink)',
                      marginBottom: 4,
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 12,
                      color: 'rgba(26, 26, 47, 0.65)',
                    }}
                  >
                    {(item.price * (1 - discountPercent / 100)).toFixed(0)} € × {item.qty}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    data-press
                    onClick={() => updateQty(item.id, -1)}
                    style={qtyBtnStyle}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 13,
                      fontWeight: 500,
                      minWidth: 16,
                      textAlign: 'center',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {item.qty}
                  </span>
                  <button
                    data-press
                    onClick={() => updateQty(item.id, +1)}
                    style={qtyBtnStyle}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        {cart.length > 0 && (
          <div
            style={{
              borderTop: '0.5px solid rgba(26, 26, 47, 0.10)',
              paddingTop: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {discountPercent > 0 && (
              <Row>
                <span style={{ color: 'rgba(26, 26, 47, 0.55)', fontSize: 13 }}>
                  Pass {currentPass.label} · −{discountPercent}%
                </span>
                <span
                  style={{
                    color: currentPass.color,
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  −{savings.toFixed(0)} €
                </span>
              </Row>
            )}
            <Row>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 18,
                  fontStyle: 'italic',
                  color: 'var(--cava-ink)',
                  fontVariationSettings: 'var(--fraunces-opsz-large)',
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 22,
                  fontWeight: 600,
                  color: 'var(--cava-ink)',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                }}
              >
                {finalTotal.toFixed(0)} €
              </span>
            </Row>
            <Button
              size="lg"
              variant="primary"
              style={{
                background: 'var(--cava-ink)',
                color: 'var(--cava-bg)',
                marginTop: 8,
              }}
              onClick={() => { haptic([8, 60, 8]); alert('Passer commande — à connecter avec le backend ÇA VA?'); }}
            >
              Passer commande
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const Row = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    {children}
  </div>
);

const qtyBtnStyle = {
  appearance: 'none',
  background: 'rgba(26, 26, 47, 0.06)',
  border: 'none',
  borderRadius: '50%',
  width: 26,
  height: 26,
  color: 'var(--cava-ink)',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
};
