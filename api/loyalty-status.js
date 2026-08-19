// Vercel Serverless Function.
// Read-only lookup of a customer's THR33 TRIBE order count, used to show
// live progress in the checkout modal. Never writes anything.

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ count: 0 });
  }

  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ count: 0 });
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(200).json({ count: 0 });
  }

  try {
    const base = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    const key = `loyalty:${email.trim().toLowerCase()}`;
    const r = await fetch(`${base}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await r.json();
    return res.status(200).json({ count: Number(data.result || 0) });
  } catch (err) {
    return res.status(200).json({ count: 0 });
  }
};
