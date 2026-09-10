// Vercel Serverless Function
// Checks the submitted drop password server-side, so the real password
// never ships to the browser in plain text (unlike a client-side check).
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ correct: false });
  }
  const { password } = req.body || {};
  const correct = Boolean(password) && password === process.env.DROP_PASSWORD;
  return res.status(200).json({ correct });
};
