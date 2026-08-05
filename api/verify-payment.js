// Vercel Serverless Function.
// Runs on Vercel's servers only — never in the customer's browser —
// so it's the safe place to use your PAYSTACK SECRET key.
//
// This checks a payment reference against Paystack's own records before
// the site treats an order as actually paid, decreases stock for the
// items ordered, then emails you the order details via Resend.

const INITIAL_STOCK = 20; // keep this the same number as in api/get-stock.js

function naira(kobo) {
  return "₦" + Math.round(kobo / 100).toLocaleString("en-NG");
}

async function redis(command) {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const res = await fetch(`${base}/${command.join("/")}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.result;
}

async function decrementStock(items) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return;
  if (!Array.isArray(items)) return;

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

function buildOrderEmailHtml(order) {
  const fields = (order.metadata && order.metadata.custom_fields) || [];
  const rows = fields.map(f =>
    `<tr><td style="padding:6px 12px;color:#666;">${f.display_name}</td><td style="padding:6px 12px;"><strong>${f.value}</strong></td></tr>`
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
      await decrementStock(items);
      await sendOrderEmail(data.data);

      return res.status(200).json({
        verified: true,
        reference: data.data.reference,
        amount: data.data.amount,
        email: data.data.customer && data.data.customer.email
      });
    }

    return res.status(200).json({ verified: false });
  } catch (err) {
    return res.status(500).json({ verified: false, error: "Verification request failed" });
  }
};
