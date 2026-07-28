# THREE — Storefront

A simple, static storefront for THREE. No build step, no framework — just
`index.html`, `style.css`, `script.js`, and `products.js`. Ready to drag
straight onto Netlify.

## What's included

- Product grid with the front → back photo flip on hover
- A working shopping bag (persists in the browser between visits)
- A checkout form that collects name, phone, email, delivery address,
  city, state, and delivery notes
- Payment via Paystack's popup (cards, bank transfer, USSD — all the ways
  people pay in Nigeria)
- A banknote-inspired look built from your two logos and the $100-bill palette

## 1. Add your real product photos

Open `products.js`. Each product has a `front` and `back` image path.
Drop your real photos into the `/assets` folder (any name you like) and
point to them there. Placeholder SVGs are in place now so you can see the
flip effect working — swap them out whenever your photos are ready.

Also edit: `name`, `price` (in plain Naira, no commas), `sizes`, and
`description` for each product. Add or remove whole product blocks to
change how many items are in the shop.

## 2. Connect Paystack (so you can actually get paid)

1. Create a free account at [paystack.com](https://paystack.com) and
   complete their business verification (needed before you can receive
   real money, not just test payments).
2. In your Paystack dashboard, go to **Settings → API Keys & Webhooks**
   and copy your **Public Key**.
3. Open `script.js` and replace this line near the top:
   ```js
   const PAYSTACK_PUBLIC_KEY = "pk_test_REPLACE_WITH_YOUR_PAYSTACK_PUBLIC_KEY";
   ```
   with your real key. The public key is safe to put in front-end code —
   never put your **secret** key in a file like this.
4. Use `pk_test_...` while testing (use Paystack's test cards), then swap
   in your `pk_live_...` key when you're ready to take real payments.

### Important: verifying payments

Right now, the site treats a payment as "successful" the moment Paystack's
popup reports success back to the browser. That's fine for testing, but a
determined person could fake that response. Before you rely on this for
real orders, add a **Netlify Function** (a small free serverless function,
still no separate server to manage) that:

1. Receives the payment reference from the browser after checkout.
2. Calls Paystack's `GET /transaction/verify/:reference` endpoint using
   your **secret** key (kept only on the server, never in `script.js`).
3. Only then marks the order as paid — e.g. by emailing you the order
   details, or logging it to a spreadsheet/database.

Netlify's docs walk through adding a function:
https://docs.netlify.com/build/functions/overview/ — happy to help you
build this when you're ready; it's maybe 20 lines of code.

## 3. Deploy to Netlify

**Easiest way (no account setup needed first):**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag this whole folder onto the page
3. You'll get a live `*.netlify.app` link instantly

**Better way (auto-redeploys when you make changes):**
1. Push this folder to a GitHub repository
2. In Netlify, click "Add new site" → "Import an existing project" →
   connect the repo
3. Leave the build command blank and set the publish directory to `/`
   (it's a static site, nothing to build)
4. Deploy — every future push to GitHub updates the live site automatically

## 4. Custom domain (whenever you're ready)

Buy a domain anywhere (Namecheap, Google Domains, a Nigerian registrar,
etc.), then in Netlify go to **Domain settings → Add a custom domain** and
follow the prompts to point it at your Netlify site. Netlify also gives
you free HTTPS automatically.

## Notes

- Cart data is stored in the visitor's own browser (`localStorage`), so
  it's private per-device and clears if they clear their browser data.
- Everything — colors, fonts, copy — lives in `style.css`, `index.html`,
  and `products.js`, so you (or I) can keep tweaking it easily.
