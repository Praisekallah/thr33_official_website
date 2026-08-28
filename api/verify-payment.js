// Vercel Serverless Function
const INITIAL_STOCK = 20;

function naira(kobo) {
  return "₦" + Math.round(kobo / 100).toLocaleString("en-NG");
}

async function redis(command) {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!base || !token) return null;
  
  const res = await fetch(`${base}/${command.join("/")}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.result;
}

function hasRedis() {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// ---------------- Idempotency guard ----------------
async function markProcessedOnce(reference) {
  if (!hasRedis()) return true;
  try {
    const result = await redis(["setnx", `processed:${reference}`, "1"]);
    return Number(result) === 1;
  } catch (err) {
    console.error("Idempotency check failed:", err);
    return true;
  }
}

// ---------------- Stock ----------------
async function decrementStock(items) {
  if (!hasRedis() || !Array.isArray(items)) return;

  try {
    await Promise.all(
      items.map(async (item) => {
        if (!item || !item.id || !item.qty) return;
        const key = `stock:${item.id}`;
        await redis(["setnx", key, INITIAL_STOCK]);
        const newValue = await redis(["decrby", key, item.qty]);
        if (Number(newValue) < 0) {
          await redis(["set", key, 0]);
        }
      })
    );
  } catch (err) {
    console.error("Stock decrement failed:", err);
  }
}

// ---------------- THR33 TRIBE loyalty ----------------
async function incrementLoyalty(email) {
  if (!email || !hasRedis()) return null;
  try {
    const key = `loyalty:${email.trim().toLowerCase()}`;
    const newCount = await redis(["incr", key]);
    return Number(newCount);
  } catch (err) {
    console.error("Loyalty increment failed:", err);
    return null;
  }
}

function generateRewardCode() {
  return "TRIBE-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function issueRewardCode(email, milestone) {
  try {
    const code = generateRewardCode();
    await redis(["set", `reward-code:${code}`, JSON.stringify({
      email: email.toLowerCase(),
      used: 0,
      milestone
    })]);
    return code;
  } catch (err) {
    console.error("Reward code issue failed:", err);
    return null;
  }
}

function buildRewardEmailHtml({ milestone, teeCode }) {
  const teeBlock = teeCode
    ? `
      <div style="background:#f2ead3;border:1px solid #b08d57;border-radius:4px;padding:16px;margin:20px 0;">
        <p style="margin:0 0 6px;font-weight:700;">🎁 You've also unlocked a FREE TEE</p>
        <p style="margin:0;">Add any tee to your bag next time and quote this code when you message us on WhatsApp to redeem it:</p>
        <p style="font-family:monospace;font-size:1.2rem;font-weight:700;margin:10px 0 0;letter-spacing:1px;">${teeCode}</p>
      </div>`
    : "";

  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#17170f;">
      <h2 style="margin-bottom:4px;">Welcome deeper into THR33 TRIBE 🏅</h2>
      <p style="color:#666;margin-top:0;">This is order #${milestone} — thank you for riding with us.</p>

      <div style="background:#3f4f34;color:#f2ead3;border-radius:4px;padding:16px;margin:20px 0;">
        <p style="margin:0;font-weight:700;">🧵 An embroidered TRIBE patch is riding along with this order.</p>
      </div>

      ${teeBlock}

      <p style="margin-top:24px;color:#444;">
        Every 5th order earns a TRIBE patch. Every 10th earns a free tee on top.
        Keep going — we see you.
      </p>

      <p style="margin-top:28px;color:#999;font-size:12px;">— THR33 TRIBE</p>
    </div>
  `;
}

async function sendRewardEmail(email, milestone, teeCode) {
  if (!process.env.RESEND_API_KEY || !email) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "THR33 TRIBE <onboarding@resend.dev>",
        to: email,
        subject: teeCode
          ? `🎁 You unlocked a free tee — THR33 TRIBE`
          : `🧵 You unlocked a TRIBE patch — THR33 TRIBE`,
        html: buildRewardEmailHtml({ milestone, teeCode })
      })
    });
  } catch (err) {
    console.error("Reward email failed:", err);
  }
}

// ---------------- Owner order-notification email ----------------
function buildOrderEmailHtml(order) {
  const fields = (order.metadata && order.metadata.custom_fields) || [];
  const rows = fields.map(f =>
    `<tr><td style="padding:6px 12px;color:#666;vertical-align:top;">${f.display_name}</td><td style="padding:6px 12px;"><strong>${f.value}</strong></td></tr>`
  ).join("");

  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
      <h2 style="margin-bottom:4px;">New order — ${naira(order.amount)}</h2>
      <p style="color:#666;margin-top:0;">Reference: ${order.reference}</p>
      <p style="color:#666;">Customer email: ${order.customer && order.customer.email}</p>
      <table style="border-collapse:collapse;width:100%;margin-top:16px;">
        ${rows}
      </table>
      <p style="margin-top:20px;color:#999;font-size:12px;">
        This order has already been verified against Paystack — you're good to prep and ship.
      </p>
    </div>
  `;
}

async function sendOrderEmail(order) {
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFY_EMAIL) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "THREE Orders <onboarding@resend.dev>",
        to: process.env.NOTIFY_EMAIL,
        subject: `New order — ${naira(order.amount)} — ${order.reference}`,
        html: buildOrderEmailHtml(order)
      })
    });
  } catch (err) {
    console.error("Order notification email failed:", err);
  }
}

// ---------------- Customer confirmation email ----------------
function buildCustomerEmailHtml(order) {
  const fields = (order.metadata && order.metadata.custom_fields) || [];
  const get = (varName) => {
    const f = fields.find(x => x.variable_name === varName);
    return f ? f.value : "";
  };
  const itemsRaw = get("order_items");
  let itemsList = "";
  try {
    const items = JSON.parse(itemsRaw);
    itemsList = Array.isArray(items) 
      ? items.map(i => `<li style="margin-bottom:4px;">${i}</li>`).join("")
      : `<li style="margin-bottom:4px;">${itemsRaw}</li>`;
  } catch (e) {
    itemsList = `<li style="margin-bottom:4px;">${itemsRaw}</li>`;
  }

  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#17170f;">
      <h2 style="margin-bottom:4px;">Order confirmed 🎉</h2>
      <p style="color:#666;margin-top:0;">Thanks for shopping with THR33 — reference <strong>${order.reference}</strong></p>

      <ul style="padding-left:18px;margin:20px 0;">${itemsList}</ul>

      <table style="border-collapse:collapse;width:100%;margin-top:8px;">
        <tr><td style="padding:6px 0;color:#666;">Subtotal</td><td style="padding:6px 0;text-align:right;">${get("subtotal")}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Shipping</td><td style="padding:6px 0;text-align:right;">${get("shipping_fee")}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;border-top:1px solid #eee;">Total paid</td><td style="padding:8px 0;text-align:right;font-weight:700;border-top:1px solid #eee;">${naira(order.amount)}</td></tr>
      </table>

      <p style="margin-top:24px;color:#444;">
        Delivering to: ${get("address")}
      </p>

      <p style="margin-top:20px;color:#444;">
        <strong>What happens next:</strong> we're prepping your order now.
      </p>

      <p style="margin-top:20px;">
        Questions about your order? Message us on
        <a href="https://wa.me/2347063467013" style="color:#3f4f34;">WhatsApp</a>.
      </p>

      <p style="margin-top:28px;color:#999;font-size:12px;">— THR33</p>
    </div>
  `;
}

async function sendCustomerEmail(order) {
  if (!process.env.RESEND_API_KEY) return;
  const to = order.customer && order.customer.email;
  if (!to) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "THR33 <onboarding@resend.dev>",
        to: to,
        subject: `Your THR33 order is confirmed — ${order.reference}`,
        html: buildCustomerEmailHtml(order)
      })
    });
  } catch (err) {
    console.error("Customer confirmation email failed:", err);
  }
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ verified: false, error: "Method not allowed" });
  }

  const { reference, items } = req.body || {};
  if (!reference) {
    return res.status(400).json({ verified: false, error: "Missing reference" });
  }

  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = await paystackRes.json();

    if (data.status && data.data && data.data.status === "success") {
      const order = data.data;
      const email = order.customer && order.customer.email;
      const isFirstTime = await markProcessedOnce(order.reference);

      await decrementStock(items);
      await sendOrderEmail(order);

      if (isFirstTime) {
        await sendCustomerEmail(order);

        const count = await incrementLoyalty(email);
        if (count && count % 5 === 0) {
          const isTeeMilestone = count % 10 === 0;
          const teeCode = isTeeMilestone ? await issueRewardCode(email, count) : null;
          await sendRewardEmail(email, count, teeCode);
        }
      }

      return res.status(200).json({
        verified: true,
        reference: order.reference,
        amount: order.amount,
        email: email
      });
    }

    return res.status(200).json({ verified: false });
  } catch (err) {
    return res.status(500).json({ verified: false, error: "Verification request failed" });
  }
};
