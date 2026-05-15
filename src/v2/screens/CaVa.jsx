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
import ProductDetail from './ProductDetail';
import Manifeste from './Manifeste';
import Lookbook from './Lookbook';

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
    cover: '/cava/capsules/capsule-libre.png',
    products: [
      { id: 'libre-hoodie', name: 'Hoodie Visage',         price: 89, image: '/cava/products/libre-hoodie.jpg', motif: 'Broderie main · visage cyan' },
      { id: 'libre-pull',   name: 'Pull Mains de feu',     price: 95, image: '/cava/products/libre-pull.jpg',   motif: 'Mains brodées + soleil jaune' },
      { id: 'libre-tshirt', name: 'T-shirt Cœur fissuré',  price: 49, image: '/cava/products/libre-tshirt.jpg', motif: 'Cœur brodé + gants colorés' },
    ],
  },
  {
    key: 'cava',
    name: 'Ça Va',
    accent: 'var(--cava-blue)',
    accentSoft: 'rgba(93, 123, 184, 0.18)',
    tagline: 'Pour ceux qui n’ont pas besoin de mentir.',
    cover: '/cava/capsules/capsule-cava.png',
    products: [
      { id: 'cava-hoodie', name: 'Hoodie Œil bleu',  price: 95, image: '/cava/products/cava-hoodie.jpg', motif: 'Œil bleu brodé · vert émeraude' },
      { id: 'cava-sweat',  name: 'Sweat Patches',    price: 95, image: '/cava/products/cava-sweat.jpg',  motif: 'Yeux + soleil + fleurs cousus' },
      { id: 'cava-tee',    name: 'Tee Soleil doré',  price: 45, image: '/cava/products/cava-tee.jpg',    motif: 'Soleil brodé doré · marine' },
    ],
  },
  {
    key: 'vraiment',
    name: 'Vraiment ?',
    accent: 'var(--cava-purple)',
    accentSoft: 'rgba(61, 47, 107, 0.18)',
    tagline: 'Pour ceux qui osent la question.',
    cover: '/cava/capsules/capsule-vraiment.png',
    products: [
      { id: 'vr-tshirt',   name: 'T-shirt CA VA',     price: 49, image: '/cava/products/vr-tshirt.jpg', motif: 'Cœur-visage cousu cyan · noir' },
      { id: 'vr-pull',     name: 'Pull Lèvres cousues', price: 99, image: '/cava/products/vr-pull.jpg',   motif: 'Bouche brodée noir + or' },
      { id: 'vr-tote',     name: 'Tote CA VA Or',     price: 39, image: '/cava/products/vr-tote.jpg',   motif: 'CA VA? or sur toile noire' },
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
  const [cartOpen, setCartOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  const [productDetail, setProductDetail] = useState(null); // { product, capsule }
  const [manifesteOpen, setManifesteOpen] = useState(false);
  const [lookbookOpen, setLookbookOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const compressed = scrollY > 60;
  const activeIndex = Math.max(0, PASSES.findIndex((p) => p.key === activePass));

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
    haptic(4);
  };

  const scrollToCapsule = (key) => {
    haptic(4);
    const el = document.getElementById(`cava-capsule-${key}`);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  const placeOrder = () => {
    if (cart.length === 0) return;
    haptic([8, 60, 8]);
    const orders = ls.get('cava_orders', []);
    orders.unshift({
      id: `order-${Date.now()}`,
      createdAt: Date.now(),
      items: cart,
      subtotal: cartTotal,
      pass: currentPass.key,
      discount: currentPass.discount,
      total: discountedTotal,
    });
    ls.set('cava_orders', orders);
    setLastOrderTotal(discountedTotal);
    setCart([]);
    saveCart([]);
    setCartOpen(false);
    setConfirmOpen(true);
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
        onScroll={(e) => setScrollY(e.currentTarget.scrollTop)}
        style={{
          position: 'relative',
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding:
            '0 0 calc(env(safe-area-inset-bottom, 0px) + 110px)',
        }}
      >
        {/* Sticky compressed header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 5,
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + ' + (compressed ? '12px' : '24px') + ')',
            paddingLeft: 22,
            paddingRight: 22,
            paddingBottom: compressed ? 12 : 22,
            background: compressed ? 'rgba(244, 240, 232, 0.92)' : 'transparent',
            backdropFilter: compressed ? 'blur(18px) saturate(160%)' : 'none',
            WebkitBackdropFilter: compressed ? 'blur(18px) saturate(160%)' : 'none',
            borderBottom: compressed ? '0.5px solid rgba(26, 26, 47, 0.10)' : '0.5px solid transparent',
            transition:
              'padding 240ms var(--ease-out-ios), background 240ms var(--ease-out-ios), border-color 240ms var(--ease-out-ios), backdrop-filter 240ms var(--ease-out-ios)',
          }}
        >
          {/* Header row : brand + cart */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 9,
                  fontWeight: 500,
                  letterSpacing: '0.222em',
                  textTransform: 'uppercase',
                  color: 'rgba(26, 26, 47, 0.55)',
                  marginBottom: compressed ? 0 : 8,
                  opacity: compressed ? 0 : 1,
                  maxHeight: compressed ? 0 : 14,
                  overflow: 'hidden',
                  transition:
                    'opacity 240ms var(--ease-out-ios), max-height 240ms var(--ease-out-ios), margin-bottom 240ms var(--ease-out-ios)',
                }}
              >
                CAPSULE · MARQUE SŒUR DE NÉYA
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: compressed ? 22 : 36,
                  fontWeight: 400,
                  lineHeight: 1.0,
                  letterSpacing: '-0.018em',
                  fontVariationSettings: 'var(--fraunces-opsz-large)',
                  margin: 0,
                  color: 'var(--cava-ink)',
                  transition: 'font-size 240ms var(--ease-out-ios)',
                }}
              >
                ÇA VA ?
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
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

          {/* Segmented control — passes */}
          <div
            style={{
              marginTop: compressed ? 8 : 14,
              position: 'relative',
              display: 'flex',
              background: 'rgba(26, 26, 47, 0.06)',
              borderRadius: 'var(--radius-pill)',
              padding: 3,
              overflow: 'hidden',
              transition: 'margin-top 240ms var(--ease-out-ios)',
            }}
          >
            {/* Sliding indicator */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 3,
                bottom: 3,
                left: 3,
                width: 'calc((100% - 6px) / 3)',
                background: 'var(--cream-light)',
                borderRadius: 'var(--radius-pill)',
                boxShadow: '0 1px 2px rgba(26, 26, 47, 0.06), 0 4px 12px rgba(26, 26, 47, 0.05)',
                transform: `translateX(${activeIndex * 100}%)`,
                transition: 'transform 320ms var(--ease-spring-subtle)',
              }}
            />
            {PASSES.map((p) => {
              const isActive = p.key === activePass;
              const unlocked = isPassUnlocked(p.key, joursConnectes);
              return (
                <button
                  key={p.key}
                  data-press={unlocked ? true : undefined}
                  onClick={() => pickPass(p.key)}
                  disabled={!unlocked}
                  style={{
                    appearance: 'none',
                    background: 'transparent',
                    border: 'none',
                    flex: 1,
                    padding: '8px 12px',
                    position: 'relative',
                    zIndex: 1,
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive
                      ? p.color
                      : 'rgba(26, 26, 47, 0.55)',
                    opacity: unlocked ? 1 : 0.55,
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'color 240ms var(--ease-out-ios), font-weight 240ms var(--ease-out-ios)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inner padded body */}
        <div style={{ padding: '0 22px' }}>

        {/* Manifeste tagline (fades + collapses when compressed) */}
        <p
          style={{
            margin: 0,
            paddingTop: compressed ? 0 : 14,
            paddingBottom: compressed ? 0 : 28,
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: 1.55,
            color: 'rgba(26, 26, 47, 0.65)',
            maxWidth: 380,
            opacity: compressed ? 0 : 1,
            maxHeight: compressed ? 0 : 200,
            overflow: 'hidden',
            transition:
              'opacity 240ms var(--ease-out-ios), max-height 240ms var(--ease-out-ios), padding 240ms var(--ease-out-ios)',
          }}
        >
          Faire de la mode un langage qui libère la parole sur la santé mentale.
          <br />
          <em style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontVariationSettings: 'var(--fraunces-italic-soft)' }}>
            Briser le masque du « ça va ».
          </em>
        </p>

        {/* Horizontal capsule covers strip — scroll-snap */}
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: 10,
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            padding: '8px 22px 12px',
            margin: '0 -22px 18px',
            scrollPaddingLeft: 22,
          }}
        >
          {CAPSULES.map((c) => (
            <button
              key={c.key}
              data-press
              onClick={() => scrollToCapsule(c.key)}
              style={{
                flex: '0 0 86%',
                scrollSnapAlign: 'start',
                aspectRatio: '16 / 9',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundImage: `url(${c.cover})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: c.accentSoft,
                border: `0.5px solid ${c.accent}`,
                position: 'relative',
                cursor: 'pointer',
                appearance: 'none',
                padding: 0,
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label={`Aller à la capsule ${c.name}`}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 14,
                  right: 14,
                  color: 'var(--cava-ink)',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 18,
                  fontVariationSettings: 'var(--fraunces-italic-soft)',
                  textShadow: '0 1px 4px rgba(255, 252, 245, 0.5)',
                  textAlign: 'left',
                }}
              >
                {c.name}
              </div>
            </button>
          ))}
        </div>

        {/* Quick links bar — Notre histoire + Lookbook */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          <button
            data-press
            onClick={() => { haptic(4); setManifesteOpen(true); }}
            style={{
              appearance: 'none',
              flex: 1,
              padding: '12px 14px',
              background: 'transparent',
              border: '0.5px solid rgba(26, 26, 47, 0.18)',
              borderRadius: 'var(--radius-pill)',
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: 'var(--cava-ink)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Notre histoire
          </button>
          <button
            data-press
            onClick={() => { haptic(4); setLookbookOpen(true); }}
            style={{
              appearance: 'none',
              flex: 1,
              padding: '12px 14px',
              background: 'transparent',
              border: '0.5px solid rgba(26, 26, 47, 0.18)',
              borderRadius: 'var(--radius-pill)',
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: 'var(--cava-ink)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Lookbook
          </button>
        </div>

        {/* 3 capsules */}
        {CAPSULES.map((c) => (
          <div id={`cava-capsule-${c.key}`} key={c.key} style={{ scrollMarginTop: 80 }}>
            <CapsuleSection
              capsule={c}
              onAddToCart={addToCart}
              onOpenDetail={(product) => setProductDetail({ product, capsule: c })}
              discountPercent={currentPass.discount}
              pseudo={pseudo}
              totem={totem}
            />
          </div>
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
      </div>

      {/* Cart drawer slide-in right */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          updateQty={updateQty}
          discountPercent={currentPass.discount}
          currentPass={currentPass}
          onClose={() => setCartOpen(false)}
          onCheckout={placeOrder}
        />
      )}

      {/* Checkout confirmation sheet */}
      {confirmOpen && (
        <CheckoutConfirm
          orderTotal={lastOrderTotal}
          pseudo={pseudo}
          onClose={() => setConfirmOpen(false)}
        />
      )}

      {/* Product detail sheet */}
      {productDetail && (
        <ProductDetail
          product={productDetail.product}
          capsule={productDetail.capsule}
          image={productDetail.product.image}
          pseudo={pseudo}
          totem={totem}
          onAddToCart={(p) => { addToCart(p); setProductDetail(null); }}
          onClose={() => setProductDetail(null)}
        />
      )}

      {/* Manifeste — Notre histoire */}
      {manifesteOpen && <Manifeste onClose={() => setManifesteOpen(false)} />}

      {/* Lookbook — gallery */}
      {lookbookOpen && <Lookbook onClose={() => setLookbookOpen(false)} />}
    </div>
  );
}

function CapsuleSection({ capsule, onAddToCart, onOpenDetail, discountPercent, pseudo, totem }) {
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
            onAdd={() => onOpenDetail ? onOpenDetail(p) : onAddToCart(p)}
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
          overflow: 'hidden',
        }}
      >
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
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
        {product.motif && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 10,
              fontStyle: 'italic',
              color: 'rgba(26, 26, 47, 0.55)',
              marginTop: -2,
              lineHeight: 1.35,
            }}
          >
            {product.motif}
          </div>
        )}
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

function CartDrawer({ cart, updateQty, discountPercent, currentPass, onClose, onCheckout }) {
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
              onClick={onCheckout}
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

function CheckoutConfirm({ orderTotal, pseudo, onClose }) {
  const [leaving, setLeaving] = useState(false);

  const handleClose = () => {
    if (leaving) return;
    haptic(4);
    setLeaving(true);
    setTimeout(() => onClose(), 300);
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 110,
        background: 'rgba(26, 26, 47, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: leaving
          ? 'cavaFadeOut 300ms var(--ease-out-ios, ease-out) forwards'
          : 'cavaFadeIn 280ms var(--ease-out-ios, ease-out) forwards',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--cream-light)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          padding: '24px 22px calc(env(safe-area-inset-bottom, 0px) + 22px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 -12px 40px rgba(26, 26, 47, 0.18)',
          animation: leaving
            ? 'cavaSheetDown 320ms var(--ease-out-ios, ease-out) forwards'
            : 'cavaSheetUp 420ms var(--ease-out-ios, ease-out) forwards',
        }}
      >
        {/* Drag handle */}
        <div
          className="drag-handle"
          style={{
            width: 44,
            height: 4,
            borderRadius: 999,
            background: 'rgba(26, 26, 47, 0.18)',
            marginBottom: 6,
          }}
        />

        {/* Tilleul check circle */}
        <div
          className="tilleul-pop"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--tilleul, #c8d97a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cava-ink)',
            fontFamily: 'var(--font-ui)',
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 2,
          }}
        >
          ✓
        </div>

        {/* Caps mark */}
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: 'var(--content-tertiary, rgba(26, 26, 47, 0.50))',
            textAlign: 'center',
          }}
        >
          COMMANDE NOTÉE · DEMO MVP
        </div>

        {/* Hero italic */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.014em',
            color: 'var(--cava-ink)',
            fontVariationSettings: 'var(--fraunces-opsz-large)',
            textAlign: 'center',
            margin: '4px 0 0',
          }}
        >
          « Merci{pseudo ? `, ${pseudo}` : ''}. »
        </div>

        {/* Explanatory body */}
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: 1.5,
            color: 'var(--ink-soft, rgba(26, 26, 47, 0.65))',
            textAlign: 'center',
            maxWidth: 360,
          }}
        >
          Ta commande est enregistrée localement. Le vrai checkout viendra bientôt —
          on te préviendra par mail si tu nous as donné une adresse.
        </p>

        {/* Total */}
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 22,
            fontWeight: 500,
            color: 'var(--cava-ink)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.01em',
            marginTop: 4,
          }}
        >
          {Number(orderTotal || 0).toFixed(0)} €
        </div>

        {/* Fermer button */}
        <button
          data-press
          onClick={handleClose}
          style={{
            appearance: 'none',
            marginTop: 10,
            width: '100%',
            background: 'var(--cava-ink)',
            color: 'var(--cava-bg)',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            padding: '14px 24px',
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: '0.02em',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            transition: 'transform 120ms var(--ease-out-ios, ease-out)',
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
          onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Fermer
        </button>
      </div>

      <style>{`
        @keyframes cavaSheetUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes cavaSheetDown {
          from { transform: translateY(0); }
          to   { transform: translateY(100%); }
        }
        @keyframes cavaFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cavaFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

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
