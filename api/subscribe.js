// Vercel Serverless Function
// Adds an email to your Brevo subscriber list.
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { email } = req.body || {};
  if (!email || !email.includes("@")) {
    return res.status(400).json({ success: false, error: "Invalid email" });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;

  if (!apiKey || !listId) {
    return res.status(500).json({ success: false, error: "Subscriber list not configured" });
  }

  try {
    const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        listIds: [Number(listId)],
        updateEnabled: true // if they already exist, just add them to the list instead of erroring
      })
    });

    if (brevoRes.status === 204 || brevoRes.status === 201) {
      return res.status(200).json({ success: true });
    }

    console.error("Brevo subscribe failed with status:", brevoRes.status);
    return res.status(200).json({ success: false, error: "Could not subscribe right now" });
  } catch (err) {
    console.error("Subscribe request failed:", err);
    return res.status(500).json({ success: false, error: "Network error" });
  }
};
