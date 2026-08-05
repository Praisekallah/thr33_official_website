// Vercel Serverless Function.
// Returns current stock levels for every active product, reading from
// Upstash Redis. If a product has never been touched before, it gets
// initialized to INITIAL_STOCK the first time it's read.

const PRODUCT_IDS = [
  "crop-basic-female",
  "rose-graphic-tee",
  "mfdoom-king-spade",
  "moneyface-tee",
  "t3-basic-tee",
  "croptop-thr33-female"
];

const INITIAL_STOCK = 20; // change this number to adjust the starting stock for every product

async function redis(command) {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const res = await fetch(`${base}/${command.join("/")}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.result;
}

module.exports = async (req, res) => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Stock tracking isn't set up yet — tell the front-end to treat everything as in stock.
    const fallback = {};
    PRODUCT_IDS.forEach(id => (fallback[id] = INITIAL_STOCK));
    return res.status(200).json({ stock: fallback });
  }

  try {
    const stock = {};
    await Promise.all(
      PRODUCT_IDS.map(async (id) => {
        await redis(["setnx", `stock:${id}`, INITIAL_STOCK]);
        const value = await redis(["get", `stock:${id}`]);
        stock[id] = Number(value ?? INITIAL_STOCK);
      })
    );
    return res.status(200).json({ stock });
  } catch (err) {
    const fallback = {};
    PRODUCT_IDS.forEach(id => (fallback[id] = INITIAL_STOCK));
    return res.status(200).json({ stock: fallback });
  }
};
