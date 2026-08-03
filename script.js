/* ============================================
   THREE — storefront logic
   Plain JS, no framework, no build step.
   ============================================ */

// ---- CONFIG: replace with your own Paystack public key ----
// Get this from https://dashboard.paystack.com/#/settings/developer
// It's safe to expose the PUBLIC key in front-end code — never the secret key.
const PAYSTACK_PUBLIC_KEY = "pk_live_efdfb8f1cbb80b64b7907f7222fcb4801a0909f2";

const naira = (n) => "₦" + n.toLocaleString("en-NG");

// ---------------- Cart state ----------------
let cart = JSON.parse(localStorage.getItem("three_cart") || "[]");

function saveCart() {
  localStorage.setItem("three_cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(productId, size) {
  const product = PRODUCTS.find(p => p.id === productId);
  const existing = cart.find(i => i.id === productId && i.size === size);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, size, qty: 1, name: product.name, price: product.price, image: product.front });
  }
  saveCart();
  showToast(`${product.name} (${size}) added to bag`);
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
let activeCollection = "all";

function productHasStock(catId, collId) {
  return PRODUCTS.some(p =>
    (catId === "all" || p.category === catId) &&
    (collId === "all" || p.collection === collId)
  );
}

function renderFilters() {
  const bar = document.getElementById("filterBar");

  const catRow = CATEGORIES.map(c => {
    const disabled = c.id !== "all" && !productHasStock(c.id, "all");
    return `<button type="button" class="filter-pill ${activeCategory === c.id ? 'active' : ''} ${disabled ? 'disabled' : ''}"
              data-type="category" data-id="${c.id}">${c.label}${disabled ? ' <span class="soon">soon</span>' : ''}</button>`;
  }).join("");

  const collRow = COLLECTIONS.map(c => {
    const disabled = c.id !== "all" && !productHasStock("all", c.id);
    return `<button type="button" class="filter-pill ${activeCollection === c.id ? 'active' : ''} ${disabled ? 'disabled' : ''}"
              data-type="collection" data-id="${c.id}">${c.label}${disabled ? ' <span class="soon">soon</span>' : ''}</button>`;
  }).join("");

  bar.innerHTML = `
    <div class="filter-row">${catRow}</div>
    <div class="filter-row">${collRow}</div>
  `;

  bar.querySelectorAll(".filter-pill").forEach(btn => {
    if (btn.classList.contains("disabled")) return;
    btn.addEventListener("click", () => {
      if (btn.dataset.type === "category") activeCategory = btn.dataset.id;
      if (btn.dataset.type === "collection") activeCollection = btn.dataset.id;
      renderFilters();
      renderProducts();
    });
  });
}

// ---------------- Render: product grid ----------------
function renderProducts() {
  const grid = document.getElementById("productGrid");

  const filtered = PRODUCTS.filter(p =>
    (activeCategory === "all" || p.category === activeCategory) &&
    (activeCollection === "all" || p.collection === activeCollection)
  );

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="grid-empty">Nothing here yet — check back soon.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-flip">
        <span class="product-tag">${p.sku}</span>
        <img src="${p.front}" alt="${p.name} — front" class="img-front" loading="lazy" />
        <img src="${p.back}" alt="${p.name} — back" class="img-back" loading="lazy" />
      </div>
      <div class="product-info">
        <div class="product-info-top">
          <p class="product-name">${p.name}</p>
          <span class="product-price">${naira(p.price)}</span>
        </div>
        <p class="product-desc">${p.description}</p>
      </div>
      <div class="product-sizes" data-role="sizes">
        ${p.sizes.map((s, idx) => `<button type="button" class="size-btn ${idx === 0 ? 'selected' : ''}" data-size="${s}">${s}</button>`).join("")}
      </div>
      <button type="button" class="add-btn" data-role="add">Add to Bag</button>
    </div>
  `).join("");

  // size selection
  grid.querySelectorAll(".product-card").forEach(card => {
    const sizeButtons = card.querySelectorAll(".size-btn");
    sizeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        sizeButtons.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
    });
    card.querySelector('[data-role="add"]').addEventListener("click", () => {
      const selected = card.querySelector(".size-btn.selected");
      addToCart(card.dataset.id, selected ? selected.dataset.size : "One Size");
    });
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
        <p class="cart-item-meta">Size ${item.size} · ${naira(item.price)}</p>
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

function openCheckout() {
  if (cart.length === 0) {
    showToast("Your bag is empty");
    return;
  }
  document.getElementById("checkoutTotal").textContent = naira(cartSubtotal());
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
  const amountKobo = cartSubtotal() * 100; // Paystack expects kobo

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
        { display_name: "Delivery Address", variable_name: "address", value: `${data.get("address")}, ${data.get("city")}, ${data.get("state")}` },
        { display_name: "Notes", variable_name: "notes", value: data.get("notes") || "" },
        { display_name: "Order Items", variable_name: "order_items", value: JSON.stringify(cart.map(i => `${i.name} (${i.size}) x${i.qty}`)) }
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
        body: JSON.stringify({ reference: response.reference })
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
