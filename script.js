/* ============================================
   THREE — storefront logic
   Plain JS, no framework, no build step.
   ============================================ */

// ---- CONFIG: replace with your own Paystack public key ----
// Get this from https://dashboard.paystack.com/#/settings/developer
// It's safe to expose the PUBLIC key in front-end code — never the secret key.
const PAYSTACK_PUBLIC_KEY = "pk_test_REPLACE_WITH_YOUR_PAYSTACK_PUBLIC_KEY";

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
  openCart();
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

// ---------------- Render: product grid ----------------
function renderProducts() {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = PRODUCTS.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-flip">
        <span class="product-tag">${p.sku}</span>
        <img src="${p.front}" alt="${p.name} — front" class="img-front" loading="lazy" />
        <img src="${p.back}" alt="${p.name} — back" class="img-back" loading="lazy" />
      </div>
      <div class="product-info">
        <div>
          <p class="product-name">${p.name}</p>
          <p class="product-desc">${p.description}</p>
        </div>
        <span class="product-price">${naira(p.price)}</span>
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
      // NOTE: this fires on the client as soon as Paystack reports success.
      // For real orders, send response.reference to a small server/serverless
      // function that calls Paystack's Verify Transaction API before you
      // treat the order as paid and ship it. See README.md.
      cart = [];
      saveCart();
      payBtn.disabled = false;
      payBtn.textContent = "Pay with Paystack";
      closeCheckout();
      form.reset();
      showToast(`Payment received — ref ${response.reference}. We'll email your receipt.`);
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
renderProducts();
renderCart();
