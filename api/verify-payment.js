// Vercel Serverless Function.
// Runs on Vercel's servers only — never in the customer's browser —
// so it's the safe place to use your PAYSTACK SECRET key.
//
// This checks a payment reference against Paystack's own records before
// the site treats an order as actually paid.

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ verified: false, error: "Method not allowed" });
  }

  const { reference } = req.body || {};
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