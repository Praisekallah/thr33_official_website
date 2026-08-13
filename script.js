/* ============================================
   THREE — storefront logic
   Plain JS, no framework, no build step.
   ============================================ */

// ---- CONFIG: replace with your own Paystack public key ----
// Get this from https://dashboard.paystack.com/#/settings/developer
// It's safe to expose the PUBLIC key in front-end code — never the secret key.
const PAYSTACK_PUBLIC_KEY = "pk_live_efdfb8f1cbb80b64b7907f7222fcb4801a0909f2";

// ---- CONFIG: shipping fee by state ----
// Every fee here is in plain Naira and kept above ₦1,500 as requested.
// Edit any number to adjust pricing — states not listed fall back to
// DEFAULT_SHIPPING_FEE.
const SHIPPING_RATES = {
  "Lagos": 1700,
  "Ogun": 2000,
  "Oyo": 2000,
  "Osun": 2000,
  "Ondo": 2000,
  "Ekiti": 2000,
  "FCT (Abuja)": 2000,
  "Edo": 2300,
  "Delta": 2300,
  "Rivers": 2300,
  "Bayelsa": 2300,
  "Cross River": 2300,
  "Akwa Ibom": 2300,
  "Abia": 2300,
  "Imo": 2300,
  "Anambra": 2300,
  "Ebonyi": 2300,
  "Enugu": 2300,
  "Kwara": 2500,
  "Kogi": 2500,
  "Niger": 2500,
  "Nasarawa": 2500,
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
const DEFAULT_SHIPPING_FEE = 2500; // used if a state isn't in the list above — still > ₦1,500

function getShippingFee(state) {
  return SHIPPING_RATES[state] || DEFAULT_SHIPPING_FEE;
}

const naira = (n) => "₦" + n.toLocaleString("en-NG");

// Product ids that are cropped fits — used to show the crop note in the size guide
const CROP_IDS = ["crop-basic-female", "croptop-thr33-female"];

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
      image: color.front
    });
  }
  saveCart();
  const colorLabel = product.colors.length > 1 ? `, ${color.name}` : "";
  showToast(`${product.name} (${size}${colorLabel}) added to bag`);
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

// ---------------- Stock ----------------
let stockLevels = {}; // populated by fetchStock() — { productId: remainingCount }

async function fetchStock() {
  try {
    const res = await fetch("/api/get-stock");
    const data = await res.json();
    stockLevels = data.stock || {};
  } catch (err) {
    stockLevels = {}; // if this fails, cards just show as normal/in-stock
  }
  renderProducts();
}

// ---------------- Render: product grid ----------------
function renderProducts() {
  const grid = document.getElementById("productGrid");

  const filtered = PRODUCTS
    .filter(p => activeCategory === "all" || p.category === activeCategory)
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="grid-empty">Nothing here yet — check back soon.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const first = p.colors[0];
    const swatches = p.colors.length > 1
      ? `<div class="color-swatches" data-role="colors">
          ${p.colors.map((c, idx) => `<button type="button" class="swatch ${idx === 0 ? 'selected' : ''}" data-idx="${idx}" style="background:${c.hex}" aria-label="${c.name}" title="${c.name}"></button>`).join("")}
         </div>`
      : "";

    const remaining = stockLevels[p.id];
    const soldOut = remaining !== undefined && remaining <= 0;
    const lowStock = remaining !== undefined && remaining > 0 && remaining <= 5;
    const stockBadge = soldOut
      ? `<span class="stock-badge sold-out">Sold out</span>`
      : lowStock
        ? `<span class="stock-badge low">Only ${remaining} left</span>`
        : "";

    const featuredBadge = p.featured ? `<span class="featured-badge">${p.featured}</span>` : "";

    const discountPct = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    const discountRow = p.originalPrice
      ? `<div class="price-discount-row">
          <span class="price-was">${naira(p.originalPrice)}</span>
          <span class="price-discount">-${discountPct}%</span>
        </div>`
      : "";

    const sizeGuideLink = p.category !== "shorts"
      ? `<button type="button" class="size-guide-link" data-role="size-guide" data-crop="${CROP_IDS.includes(p.id) ? "1" : "0"}">Size Guide</button>`
      : "";

    return `
    <div class="product-card ${soldOut ? 'is-sold-out' : ''}" data-id="${p.id}" data-color-idx="0">
      <div class="product-flip">
        ${featuredBadge}
        ${stockBadge}
        <img src="${first.front}" alt="${p.name} — front" class="img-front" loading="lazy" />
        <img src="${first.back}" alt="${p.name} — back" class="img-back" loading="lazy" />
      </div>
      <div class="product-info">
        <div class="product-info-top">
          <p class="product-name">${p.name}</p>
          <span class="product-price">${naira(p.price)}</span>
        </div>
        ${discountRow}
        <p class="product-desc">${p.description}</p>
        ${swatches}
      </div>
      <div class="product-sizes-row">
        <div class="product-sizes" data-role="sizes">
          ${p.sizes.map((s, idx) => `<button type="button" class="size-btn ${idx === 0 ? 'selected' : ''}" data-size="${s}">${s}</button>`).join("")}
        </div>
        ${sizeGuideLink}
      </div>
      <p class="delivery-note">🚚 Lagos &amp; Abuja: 2–4 days &nbsp;·&nbsp; Other states: 4–7 days</p>
      <button type="button" class="add-btn" data-role="add" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Sold Out' : 'Add to Bag'}</button>
    </div>`;
  }).join("");

  grid.querySelectorAll(".product-card").forEach(card => {
    const product = PRODUCTS.find(p => p.id === card.dataset.id);

    // size selection
    const sizeButtons = card.querySelectorAll(".size-btn");
    sizeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        sizeButtons.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
    });

    // color swatch selection — swaps the front/back photos shown on the card
    const swatchButtons = card.querySelectorAll(".swatch");
    swatchButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        swatchButtons.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        const idx = Number(btn.dataset.idx);
        card.dataset.colorIdx = idx;
        const color = product.colors[idx];
        card.querySelector(".img-front").src = color.front;
        card.querySelector(".img-back").src = color.back;
      });
    });

    const addBtn = card.querySelector('[data-role="add"]');
    if (addBtn && !addBtn.disabled) {
      addBtn.addEventListener("click", () => {
        const selectedSize = card.querySelector(".size-btn.selected");
        const colorIdx = Number(card.dataset.colorIdx || 0);
        addToCart(product.id, selectedSize ? selectedSize.dataset.size : "One Size", colorIdx);
      });
    }

    const sizeGuideBtn = card.querySelector('[data-role="size-guide"]');
    if (sizeGuideBtn) {
      sizeGuideBtn.addEventListener("click", () => {
        openSizeGuide(sizeGuideBtn.dataset.crop === "1");
      });
    }
  });
}

// ---------------- Render: cart drawer ----------------
function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const countEl = document.getElementById("cartCount");
  const subtotalEl = document.getElementById("cartSubtotal");

  countEl.textContent = cart.reduce((n, i) => n + i.qty, 0);
  subtotalEl.textContent = naira(cartSubtotal());

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
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
}

document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// ---------------- Checkout modal ----------------
const checkoutOverlay = document.getElementById("checkoutOverlay");
const stateSelect = document.querySelector('#checkoutForm select[name="state"]');

function updateCheckoutTotals() {
  const subtotal = cartSubtotal();
  const state = stateSelect.value;
  const shipping = state ? getShippingFee(state) : 0;
  const total = subtotal + shipping;

  document.getElementById("checkoutSubtotal").textContent = naira(subtotal);
  document.getElementById("checkoutShipping").textContent = state ? naira(shipping) : "Select a state";
  document.getElementById("checkoutTotal").textContent = naira(total);

  return { subtotal, shipping, total };
}

stateSelect.addEventListener("change", updateCheckoutTotals);

function openCheckout() {
  if (cart.length === 0) {
    showToast("Your bag is empty");
    return;
  }
  updateCheckoutTotals();
  closeCart();
  checkoutOverlay.classList.add("open");
}
function closeCheckout() {
  checkoutOverlay.classList.remove("open");
}

document.getElementById("checkoutBtn").addEventListener("click", openCheckout);
document.getElementById("checkoutClose").addEventListener("click", closeCheckout);
checkoutOverlay.addEventListener("click", (e) => {
  if (e.target === checkoutOverlay) closeCheckout();
});

// ---------------- Checkout form -> Paystack ----------------
document.getElementById("checkoutForm").addEventListener("submit", function (e) {
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
  const amountKobo = total * 100; // Paystack expects kobo

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
      // Paystack reports success client-side here. Before trusting it,
      // confirm with our own server (/api/verify-payment), which checks
      // the reference against Paystack's records using the secret key.
      payBtn.textContent = "Confirming payment…";

      fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: response.reference,
          items: cart.map(i => ({ id: i.id, qty: i.qty }))
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
            showToast(`Payment confirmed — ref ${response.reference}. We'll email your receipt.`);
            fetchStock(); // reflect the updated stock count right away
          } else {
            showToast("We couldn't confirm this payment. Please contact us with your reference: " + response.reference);
          }
        })
        .catch(() => {
          payBtn.disabled = false;
          payBtn.textContent = "Pay with Paystack";
          showToast("Payment went through, but we couldn't confirm it automatically. Please contact us with your reference: " + response.reference);
        });
    },
    onClose: function () {
      payBtn.disabled = false;
      payBtn.textContent = "Pay with Paystack";
    }
  });

  handler.openIframe();
});

// ---------------- Size Guide modal ----------------
const sizeGuideOverlay = document.getElementById("sizeGuideOverlay");
const sizeGuideCropNote = document.getElementById("sizeGuideCropNote");

function openSizeGuide(isCrop) {
  sizeGuideCropNote.style.display = isCrop ? "block" : "none";
  sizeGuideOverlay.classList.add("open");
}
function closeSizeGuide() {
  sizeGuideOverlay.classList.remove("open");
}
document.getElementById("sizeGuideClose").addEventListener("click", closeSizeGuide);
sizeGuideOverlay.addEventListener("click", (e) => {
  if (e.target === sizeGuideOverlay) closeSizeGuide();
});

// ---------------- Track Order modal ----------------
const trackOrderOverlay = document.getElementById("trackOrderOverlay");
const trackOrderResult = document.getElementById("trackOrderResult");

function openTrackOrder() {
  trackOrderResult.innerHTML = "";
  trackOrderOverlay.classList.add("open");
}
function closeTrackOrder() {
  trackOrderOverlay.classList.remove("open");
}
document.getElementById("trackOrderOpen").addEventListener("click", openTrackOrder);
document.getElementById("trackOrderClose").addEventListener("click", closeTrackOrder);
trackOrderOverlay.addEventListener("click", (e) => {
  if (e.target === trackOrderOverlay) closeTrackOrder();
});

document.getElementById("trackOrderForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const reference = new FormData(e.target).get("reference").trim();
  if (!reference) return;

  const submitBtn = document.getElementById("trackOrderSubmit");
  submitBtn.disabled = true;
  submitBtn.textContent = "Checking…";
  trackOrderResult.innerHTML = "";

  fetch("/api/track-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference })
  })
    .then(res => res.json())
    .then(result => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Check Status";

      if (!result.found) {
        trackOrderResult.innerHTML = `<p class="track-result track-not-found">We couldn't find that reference. Double-check for typos, or message us on WhatsApp.</p>`;
        return;
      }

      if (result.status === "success") {
        let itemsHtml = "";
        try {
          const items = JSON.parse(result.items);
          itemsHtml = `<ul>${items.map(i => `<li>${i}</li>`).join("")}</ul>`;
        } catch (e) {
          itemsHtml = "";
        }
        trackOrderResult.innerHTML = `
          <div class="track-result track-confirmed">
            <p><strong>✅ Confirmed</strong> — ${result.amount}</p>
            ${itemsHtml}
            <p class="track-meta">Delivering to: ${result.address || "—"}</p>
          </div>`;
      } else {
        trackOrderResult.innerHTML = `<p class="track-result track-pending">This payment shows as <strong>${result.status}</strong> — not yet confirmed. If you believe this is wrong, message us on WhatsApp with your reference.</p>`;
      }
    })
    .catch(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Check Status";
      trackOrderResult.innerHTML = `<p class="track-result track-not-found">Something went wrong checking that reference. Try again in a moment.</p>`;
    });
});

// ---------------- Toast ----------------
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

// ---------------- Init ----------------
document.getElementById("year").textContent = new Date().getFullYear();
renderFilters();
renderProducts();
renderCart();
fetchStock();
