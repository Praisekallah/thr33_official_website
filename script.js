/* ============================================
   THREE — storefront logic
   Plain JS, no framework, no build step.
   ============================================ */

// ---- CONFIG: replace with your own Paystack public key ----
const PAYSTACK_PUBLIC_KEY = "pk_live_efdfb8f1cbb80b64b7907f7222fcb4801a0909f2";

// ---- CONFIG: shipping fee by state ----
const SHIPPING_RATES = {
  "Lagos": 3500,
  "Ogun": 3500,
  "Oyo": 3500,
  "Osun": 3500,
  "Ondo": 3500,
  "Ekiti": 3500,
  "FCT (Abuja)": 3500,
  "Edo": 3500,
  "Delta": 3500,
  "Rivers": 3500,
  "Bayelsa": 3500,
  "Cross River": 3500,
  "Akwa Ibom": 3500,
  "Abia": 3500,
  "Imo": 3500,
  "Anambra": 3500,
  "Ebonyi": 3500,
  "Enugu": 3500,
  "Kwara": 3500,
  "Kogi": 3500,
  "Niger": 3500,
  "Nasarawa": 3500,
  "Plateau": 2500,
  "Benue": 2500,
  "Kaduna": 2800,
  "Kano": 2800,
  "Katsina": 2800,
  "Kebbi": 2800,
  "Sokoto": 2800,
  "Zamfara": 2800,
  "Jigawa": 2800,
  "Bauchi": 2800,
  "Gombe": 2800,
  "Adamawa": 2800,
  "Taraba": 2800,
  "Borno": 2800,
  "Yobe": 2800
};
const DEFAULT_SHIPPING_FEE = 2500;

function getShippingFee(state) {
  return SHIPPING_RATES[state] || DEFAULT_SHIPPING_FEE;
}

const naira = (n) => "₦" + (n || 0).toLocaleString("en-NG");

const CROP_IDS = ["crop-basic-female", "croptop-thr33-female", "thr33-crop-top"];

// ---------------- Helper Toast ----------------
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

// Set dynamic copyright year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------------- Cart state ----------------
let cart = JSON.parse(localStorage.getItem("three_cart") || "[]");

function saveCart() {
  localStorage.setItem("three_cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(productId, size, colorIdx) {
  const product = PRODUCTS.find(p => p.id === productId);
  const color = product.colors[colorIdx] || product.colors[0];
  const existing = cart.find(i => i.id === productId && i.size === size && i.colorName === color.name);

  const remaining = stockLevels[productId];
  const currentQtyInCart = existing ? existing.qty : 0;
  if (remaining !== undefined && currentQtyInCart + 1 > remaining) {
    showToast(remaining <= 0 ? "That's sold out" : `Only ${remaining} left in stock`);
    return;
  }

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: productId,
      size,
      colorName: color.name,
      qty: 1,
      name: product.name,
      price: product.price,
      image: color.images[0]
    });
  }
  saveCart();
  const colorLabel = product.colors.length > 1 ? `, ${color.name}` : "";
  showToast(`${product.name} (${size}${colorLabel}) added to bag`);
  closeQuickAdd();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
}

function cartSubtotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

// ---------------- Filters ----------------
let activeCategory = "all";

function categoryHasStock(catId) {
  return PRODUCTS.some(p => p.category === catId);
}

function renderFilters() {
  const bar = document.getElementById("filterBar");
  if (!bar) return;

  const catRow = CATEGORIES.map(c => {
    const disabled = c.id !== "all" && !categoryHasStock(c.id);
    return `<button type="button" class="filter-pill ${activeCategory === c.id ? 'active' : ''} ${disabled ? 'disabled' : ''}"
              data-id="${c.id}">${c.label}${disabled ? ' <span class="soon">soon</span>' : ''}</button>`;
  }).join("");

  bar.innerHTML = `<div class="filter-row">${catRow}</div>`;

  bar.querySelectorAll(".filter-pill").forEach(btn => {
    if (btn.classList.contains("disabled")) return;
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.id;
      renderFilters();
      renderProducts();
    });
  });
}

// ---------------- Sort ----------------
let activeSort = "featured";

function sortProducts(list) {
  if (activeSort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
  if (activeSort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
  return [...list].sort((a, b) => ((b.badges && b.badges.length) ? 1 : 0) - ((a.badges && a.badges.length) ? 1 : 0));
}

// ---------------- Stock ----------------
let stockLevels = {};

async function fetchStock() {
  try {
    const res = await fetch("/api/get-stock");
    const data = await res.json();
    stockLevels = data.stock || {};
  } catch (err) {
    stockLevels = {};
  }
  renderProducts();
}

// ---------------- Render: product grid ----------------
function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const filtered = sortProducts(
    PRODUCTS.filter(p => activeCategory === "all" || p.category === activeCategory)
  );

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="grid-empty">Nothing here yet — check back soon.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const first = p.colors[0];
    const frontImg = first.images[0];
    const backImg = first.images[1] || first.images[0];

    const remaining = stockLevels[p.id];
    const soldOut = remaining !== undefined && remaining <= 0;
    const lowStock = remaining !== undefined && remaining > 0 && remaining <= 5;
    const isComingSoon = Boolean(p.comingSoon);

    const stockBadge = soldOut
      ? `<span class="stock-badge sold-out">Sold out</span>`
      : lowStock
        ? `<span class="stock-badge low">Only ${remaining} left</span>`
        : "";

    const badgeStack = (p.badges && p.badges.length)
      ? `<div class="badge-stack">${p.badges.map(b => `<span class="featured-badge">${b}</span>`).join("")}</div>`
      : "";

    const discountPct = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    const discountRow = p.originalPrice
      ? `<div class="price-discount-row">
          <span class="product-price">${naira(p.price)}</span>
          <span class="price-was">${naira(p.originalPrice)}</span>
          <span class="price-discount">-${discountPct}%</span>
        </div>`
      : `<span class="product-price">${naira(p.price)}</span>`;

    return `
    <div class="product-card ${soldOut ? 'is-sold-out' : ''} ${isComingSoon ? 'coming-soon' : ''}" data-id="${p.id}" data-status="${isComingSoon ? 'coming-soon' : 'live'}">
      <div class="product-flip" data-role="open-quick-add">
        ${badgeStack}
        ${stockBadge}
        <img src="${frontImg}" alt="${p.name} — front" class="img-front" loading="lazy" />
        <img src="${backImg}" alt="${p.name} — back" class="img-back" loading="lazy" />
      </div>
      <div class="product-info" data-role="open-quick-add">
        <p class="product-name">${p.name}</p>
        ${discountRow}
      </div>
    </div>`;
  }).join("");

  grid.querySelectorAll(".product-card").forEach(card => {
    const product = PRODUCTS.find(p => p.id === card.dataset.id);
    card.querySelectorAll('[data-role="open-quick-add"]').forEach(el => {
      el.addEventListener("click", () => openQuickAdd(product));
    });
  });
}

// ---------------- Product Detail modal ----------------
const quickAddOverlay = document.getElementById("quickAddOverlay");
const quickAddBody = document.getElementById("quickAddBody");
let quickAddColorIdx = 0;
let quickAddImageIdx = 0;

function openQuickAdd(product) {
  quickAddColorIdx = 0;
  quickAddImageIdx = 0;
  renderQuickAdd(product);
  if (quickAddOverlay) quickAddOverlay.classList.add("open");
}
function closeQuickAdd() {
  if (quickAddOverlay) quickAddOverlay.classList.remove("open");
}
const qaCloseBtn = document.getElementById("quickAddClose");
if (qaCloseBtn) qaCloseBtn.addEventListener("click", closeQuickAdd);
if (quickAddOverlay) {
  quickAddOverlay.addEventListener("click", (e) => {
    if (e.target === quickAddOverlay) closeQuickAdd();
  });
}

function renderQuickAdd(product) {
  const color = product.colors[quickAddColorIdx] || product.colors[0];
  const images = color.images;
  const remaining = stockLevels[product.id];
  const soldOut = (remaining !== undefined && remaining <= 0);
  const isComingSoon = Boolean(product.comingSoon);

  const swatches = product.colors.length > 1
    ? `<div class="color-swatches" data-role="qa-colors">
        ${product.colors.map((c, idx) => `<button type="button" class="swatch ${idx === quickAddColorIdx ? 'selected' : ''}" data-idx="${idx}" style="background:${c.hex}" aria-label="${c.name}" title="${c.name}"></button>`).join("")}
       </div>`
    : "";

  const sizeGuideLink = product.category !== "shorts"
    ? `<button type="button" class="size-guide-link" id="qaSizeGuideBtn">Size Guide</button>`
    : "";

  const galleryTrack = images.map((src, idx) =>
    `<img src="${src}" alt="${product.name} — view ${idx + 1}" />`
  ).join("");

  const arrows = images.length > 1
    ? `<button type="button" class="pd-arrow prev" id="qaPrev" aria-label="Previous image">&#8249;</button>
       <button type="button" class="pd-arrow next" id="qaNext" aria-label="Next image">&#8250;</button>`
    : "";

  const dots = images.length > 1
    ? `<div class="pd-dots" id="qaDots">
        ${images.map((_, idx) => `<span class="pd-dot ${idx === quickAddImageIdx ? 'active' : ''}" data-idx="${idx}"></span>`).join("")}
       </div>`
    : "";

  quickAddBody.innerHTML = `
    <div class="pd-gallery" id="qaGallery">
      <div class="pd-gallery-track" id="qaGalleryTrack">
        ${galleryTrack}
      </div>
      ${arrows}
    </div>
    ${dots}
    <div class="pd-details">
      <p class="qa-name">${product.name}</p>
      <p class="qa-price">${naira(product.price)}</p>
      <p class="qa-desc">${product.description}</p>
      ${swatches}
      <div class="product-sizes-row">
        <div class="product-sizes" id="qaSizes">
          ${product.sizes.map((s, idx) => `<button type="button" class="size-btn ${idx === 0 ? 'selected' : ''}" data-size="${s}">${s}</button>`).join("")}
        </div>
        ${sizeGuideLink}
      </div>
      <p class="delivery-note">🚚 Lagos &amp; Abuja: 2–4 days &nbsp;·&nbsp; Other states: 4–7 days</p>
    </div>
  `;

  const qaStickyAdd = document.getElementById("qaStickyAdd");
  if (qaStickyAdd) {
    qaStickyAdd.innerHTML = `
      <button type="button" class="btn btn-primary btn-full" id="qaAddBtn" ${(soldOut || isComingSoon) ? 'disabled' : ''}>
        ${isComingSoon ? 'Coming Soon' : (soldOut ? 'Sold Out' : 'Add to Bag')}
      </button>
    `;
  }

  setGalleryPosition(quickAddImageIdx);

  quickAddBody.querySelectorAll(".swatch").forEach(btn => {
    btn.addEventListener("click", () => {
      quickAddColorIdx = Number(btn.dataset.idx);
      quickAddImageIdx = 0;
      renderQuickAdd(product);
    });
  });

  quickAddBody.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      quickAddBody.querySelectorAll(".size-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  const addBtn = document.getElementById("qaAddBtn");
  if (addBtn && !addBtn.disabled) {
    addBtn.addEventListener("click", () => {
      const selectedSize = quickAddBody.querySelector(".size-btn.selected");
      addToCart(product.id, selectedSize ? selectedSize.dataset.size : "One Size", quickAddColorIdx);
    });
  }

  const prevBtn = document.getElementById("qaPrev");
  const nextBtn = document.getElementById("qaNext");
  if (prevBtn) prevBtn.addEventListener("click", () => stepGallery(images.length, -1));
  if (nextBtn) nextBtn.addEventListener("click", () => stepGallery(images.length, 1));

  const dotsEl = document.getElementById("qaDots");
  if (dotsEl) {
    dotsEl.querySelectorAll(".pd-dot").forEach(dot => {
      dot.addEventListener("click", () => {
        quickAddImageIdx = Number(dot.dataset.idx);
        setGalleryPosition(quickAddImageIdx);
      });
    });
  }

  const galleryEl = document.getElementById("qaGallery");
  if (galleryEl && images.length > 1) {
    let touchStartX = 0;
    galleryEl.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    galleryEl.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) stepGallery(images.length, dx < 0 ? 1 : -1);
    }, { passive: true });
  }
}

function stepGallery(count, delta) {
  quickAddImageIdx = (quickAddImageIdx + delta + count) % count;
  setGalleryPosition(quickAddImageIdx);
}

function setGalleryPosition(idx) {
  const track = document.getElementById("qaGalleryTrack");
  if (track) track.style.transform = `translateX(-${idx * 100}%)`;

  const dotsEl = document.getElementById("qaDots");
  if (dotsEl) {
    dotsEl.querySelectorAll(".pd-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === idx);
    });
  }
}

// ---------------- Render: cart drawer ----------------
function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const countEl = document.getElementById("cartCount");
  const subtotalEl = document.getElementById("cartSubtotal");

  if (countEl) countEl.textContent = cart.reduce((n, i) => n + i.qty, 0);
  if (subtotalEl) subtotalEl.textContent = naira(cartSubtotal());

  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = `<p class="cart-empty">Your bag is empty.</p>`;
    return;
  }

  itemsEl.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-meta">Size ${item.size}${item.colorName ? ' · ' + item.colorName : ''} · ${naira(item.price)}</p>
        <div class="cart-item-qty">
          <button class="qty-btn" data-action="dec" data-idx="${idx}">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-idx="${idx}">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-action="remove" data-idx="${idx}">Remove</button>
    </div>
  `).join("");

  itemsEl.querySelectorAll("[data-action]").forEach(btn => {
    const idx = Number(btn.dataset.idx);
    btn.addEventListener("click", () => {
      if (btn.dataset.action === "inc") changeQty(idx, 1);
      if (btn.dataset.action === "dec") changeQty(idx, -1);
      if (btn.dataset.action === "remove") removeFromCart(idx);
    });
  });
}

// ---------------- Cart drawer open/close ----------------
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

function openCart() {
  if (cartDrawer) cartDrawer.classList.add("open");
  if (cartOverlay) cartOverlay.classList.add("open");
}
function closeCart() {
  if (cartDrawer) cartDrawer.classList.remove("open");
  if (cartOverlay) cartOverlay.classList.remove("open");
}

const cartToggleBtn = document.getElementById("cartToggle");
if (cartToggleBtn) cartToggleBtn.addEventListener("click", openCart);
const cartCloseBtn = document.getElementById("cartClose");
if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCart);
if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

// ---------------- Checkout modal ----------------
const checkoutOverlay = document.getElementById("checkoutOverlay");
const stateSelect = document.querySelector('#checkoutForm select[name="state"]');
const checkoutEmailInput = document.querySelector('#checkoutForm input[name="email"]');
const loyaltyProgressEl = document.getElementById("loyaltyProgress");

function updateCheckoutTotals() {
  const subtotal = cartSubtotal();
  const state = stateSelect ? stateSelect.value : "";
  const shipping = state ? getShippingFee(state) : 0;
  const total = subtotal + shipping;

  const subEl = document.getElementById("checkoutSubtotal");
  const shipEl = document.getElementById("checkoutShipping");
  const totEl = document.getElementById("checkoutTotal");

  if (subEl) subEl.textContent = naira(subtotal);
  if (shipEl) shipEl.textContent = state ? naira(shipping) : "Select a state";
  if (totEl) totEl.textContent = naira(total);

  return { subtotal, shipping, total };
}

if (stateSelect) stateSelect.addEventListener("change", updateCheckoutTotals);

// ---------------- THR33 TRIBE loyalty progress ----------------
let loyaltyLookupTimer;
if (checkoutEmailInput) {
  checkoutEmailInput.addEventListener("input", () => {
    clearTimeout(loyaltyLookupTimer);
    const email = checkoutEmailInput.value.trim();
    if (!email.includes("@")) {
      if (loyaltyProgressEl) loyaltyProgressEl.textContent = "";
      return;
    }
    loyaltyLookupTimer = setTimeout(() => fetchLoyaltyProgress(email), 500);
  });
}

function fetchLoyaltyProgress(email) {
  fetch("/api/loyalty-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      const completedOrders = data.count || 0;
      const thisOrderNumber = completedOrders + 1;
      const nextMilestone = Math.ceil(thisOrderNumber / 5) * 5;
      const positionInCycle = thisOrderNumber - (nextMilestone - 5);
      const remaining = nextMilestone - thisOrderNumber;
      const rewardLabel = nextMilestone % 10 === 0 ? "a TRIBE patch + a free tee" : "a TRIBE patch";

      if (loyaltyProgressEl) {
        loyaltyProgressEl.innerHTML = remaining === 0
          ? `🏅 This order unlocks <strong>${rewardLabel}</strong> — welcome deeper into THR33 TRIBE!`
          : `🏅 <strong>${positionInCycle}/5</strong> orders — ${remaining} more to unlock ${rewardLabel}`;
      }
    })
    .catch(() => {
      if (loyaltyProgressEl) loyaltyProgressEl.textContent = "";
    });
}

function openCheckout() {
  if (cart.length === 0) {
    showToast("Your bag is empty");
    return;
  }
  updateCheckoutTotals();
  if (loyaltyProgressEl) loyaltyProgressEl.textContent = "";
  closeCart();
  if (checkoutOverlay) checkoutOverlay.classList.add("open");
}
function closeCheckout() {
  if (checkoutOverlay) checkoutOverlay.classList.remove("open");
}

const checkoutBtn = document.getElementById("checkoutBtn");
if (checkoutBtn) checkoutBtn.addEventListener("click", openCheckout);
const checkoutCloseBtn = document.getElementById("checkoutClose");
if (checkoutCloseBtn) checkoutCloseBtn.addEventListener("click", closeCheckout);
if (checkoutOverlay) {
  checkoutOverlay.addEventListener("click", (e) => {
    if (e.target === checkoutOverlay) closeCheckout();
  });
}

// ---------------- Success Modal Control ----------------
const successOverlay = document.getElementById("successOverlay");
const successCloseBtn = document.getElementById("successClose");
const successDoneBtn = document.getElementById("successDoneBtn");

function openSuccessModal(details) {
  const refEl = document.getElementById("successRef");
  const amtEl = document.getElementById("successAmount");
  const banner = document.getElementById("successLoyaltyBanner");
  const msg = document.getElementById("successLoyaltyMessage");

  if (refEl) refEl.textContent = details.reference;
  if (amtEl) amtEl.textContent = naira(details.totalAmount);

  // Fetch updated loyalty count post-purchase
  fetch("/api/loyalty-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: details.email })
  })
    .then(res => res.json())
    .then(data => {
      const count = data.count || 0;
      if (count > 0 && banner && msg) {
        banner.style.display = "block";
        if (count % 5 === 0) {
          msg.innerHTML = `🏅 <strong>THR33 TRIBE Milestone Unlocked!</strong> This was order #${count}. Check your email for your reward details!`;
        } else {
          const nextMilestone = 5 - (count % 5);
          msg.innerHTML = `🔥 You have completed <strong>${count} order(s)</strong> with THR33 TRIBE. Only <strong>${nextMilestone} more order(s)</strong> until your next reward!`;
        }
      }
    })
    .catch(() => {});

  if (successOverlay) successOverlay.classList.add("open");
}

function closeSuccessModal() {
  if (successOverlay) successOverlay.classList.remove("open");
}

if (successCloseBtn) successCloseBtn.addEventListener("click", closeSuccessModal);
if (successDoneBtn) successDoneBtn.addEventListener("click", closeSuccessModal);
if (successOverlay) {
  successOverlay.addEventListener("click", (e) => {
    if (e.target === successOverlay) closeSuccessModal();
  });
}

// ---------------- Checkout form -> Paystack ----------------
const checkoutForm = document.getElementById("checkoutForm");
if (checkoutForm) {
  checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (PAYSTACK_PUBLIC_KEY.includes("REPLACE")) {
      showToast("Add your Paystack public key in script.js to accept payment");
      return;
    }

    const form = e.target;
    const data = new FormData(form);
    const email = data.get("email");
    const state = data.get("state");

    if (!state) {
      showToast("Please select a delivery state");
      return;
    }

    const { subtotal, shipping, total } = updateCheckoutTotals();
    const amountKobo = total * 100;

    const payBtn = document.getElementById("payBtn");
    payBtn.disabled = true;
    payBtn.textContent = "Opening secure payment…";

    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amountKobo,
      currency: "NGN",
      metadata: {
        custom_fields: [
          { display_name: "Full Name", variable_name: "full_name", value: data.get("fullName") },
          { display_name: "Phone", variable_name: "phone", value: data.get("phone") },
          { display_name: "Delivery Address", variable_name: "address", value: `${data.get("address")}, ${data.get("city")}, ${state}` },
          { display_name: "Notes", variable_name: "notes", value: data.get("notes") || "" },
          { display_name: "Order Items", variable_name: "order_items", value: JSON.stringify(cart.map(i => `${i.name} (${i.size}${i.colorName ? ', ' + i.colorName : ''}) x${i.qty}`)) },
          { display_name: "Subtotal", variable_name: "subtotal", value: naira(subtotal) },
          { display_name: "Shipping Fee", variable_name: "shipping_fee", value: naira(shipping) }
        ]
      },
      callback: function (response) {
        payBtn.textContent = "Confirming payment…";

        fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: response.reference,
            email: email,
            fullName: data.get("fullName"),
            phone: data.get("phone"),
            address: `${data.get("address")}, ${data.get("city")}, ${state}`,
            items: cart,
            subtotal: subtotal,
            shipping: shipping,
            total: total
          })
        })
          .then(res => res.json())
          .then(result => {
            payBtn.disabled = false;
            payBtn.textContent = "Pay with Paystack";

            if (result.verified) {
              cart = [];
              saveCart();
              closeCheckout();
              form.reset();
              openSuccessModal({
                reference: response.reference,
                totalAmount: total,
                email: email
              });
              fetchStock();
            } else {
              showToast("We couldn't confirm this payment. Please contact us with your reference: " + response.reference);
            }
          })
          .catch(() => {
            payBtn.disabled = false;
            payBtn.textContent = "Pay with Paystack";
            showToast("Network error verifying payment. Keep your reference: " + response.reference);
          });
      },
      onClose: function () {
        payBtn.disabled = false;
        payBtn.textContent = "Pay with Paystack";
      }
    });

    handler.openIframe();
  });
}

// Initial renders
renderFilters();
fetchStock();
renderCart();
