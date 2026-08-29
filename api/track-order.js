// Vercel Serverless Function
function naira(kobo) {
  return "₦" + Math.round(kobo / 100).toLocaleString("en-NG");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ found: false, error: "Method not allowed" });
  }

  const { reference } = req.body || {};
  if (!reference) {
    return res.status(400).json({ found: false, error: "Missing reference" });
  }

  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference.trim())}`,
      {
        headers: {
          // In verify-payment.js and track-order.js:
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_LIVE_KEY}`
        }
      }
    );

    const data = await paystackRes.json();

    if (!data.status || !data.data) {
      return res.status(200).json({ found: false });
    }

    const order = data.data;
    const fields = (order.metadata && order.metadata.custom_fields) || [];
    const get = (varName) => {
      const f = fields.find(x => x.variable_name === varName);
      return f ? f.value : null;
    };

    let itemsVal = get("order_items");
    // Ensure tracking modal receives a consistent format
    if (typeof itemsVal === "string" && !itemsVal.startsWith("[")) {
      itemsVal = JSON.stringify([itemsVal]);
    }

    return res.status(200).json({
      found: true,
      status: order.status,
      reference: order.reference,
      amount: naira(order.amount),
      date: order.paid_at || order.created_at,
      items: itemsVal,
      address: get("address"),
      fullName: get("full_name")
    });
  } catch (err) {
    return res.status(500).json({ found: false, error: "Lookup failed" });
  }
};
