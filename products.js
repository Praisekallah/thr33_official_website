/*
  PRODUCTS
  --------
  This is the only file you need to touch to update what's for sale.

  - colors: each product has a list of color variants. Every color needs
    a name, a hex swatch color, and front/back photo paths. If a product
    only comes in one color, just list one entry — no swatch row will
    show on the card. The moment you add a second color entry with real
    photos, a swatch selector automatically appears on that product card.
  - price: in Naira, as a plain number (no commas).
  - sizes: shown as buttons on the product card.
  - sku: shows on the receipt/checkout, purely cosmetic.
  - category: one of the CATEGORIES ids below (controls the nav filter).

  To add a new type (e.g. "Hoodies"), just add it to CATEGORIES — it'll
  show up in the nav automatically and say "coming soon" until a product
  uses that id.
*/

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "tee", label: "Tees" },
  { id: "long-sleeve", label: "Long Sleeve" },
  { id: "shorts", label: "Shorts" },
  { id: "hoodie", label: "Hoodies" }
];

const PRODUCTS = [
  {
    id: "tee-black",
    name: "Basic Thr33 Tee — Black",
    sku: "TH-BASIC-BLK",
    price: 20000,
    category: "tee",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#17170f", front: "assets/tee-black-front.png", back: "assets/tee-black-back.png" }
    ],
    description: "Unisex heavyweight tee in black with the Thr33 monogram print."
  },
  {
    id: "tee-white",
    name: "Basic Thr33 Tee — White",
    sku: "TH-BASIC-WHT",
    price: 20000,
    category: "tee",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "White", hex: "#f5f3ec", front: "assets/tee-white-front.png", back: "assets/tee-white-back.png" }
    ],
    description: "Unisex heavyweight tee in white with the Thr33 monogram print."
  },
  {
    id: "crop-tee-white",
    name: "Basic Female Crop Tee",
    sku: "TH-CROP-WHT",
    price: 15000,
    category: "tee",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "White", hex: "#f5f3ec", front: "assets/crop-white-front.png", back: "assets/crop-white-back.png" }
      // To add black: send the black crop-tee front & back photos, then add:
      // { name: "Black", hex: "#17170f", front: "assets/crop-black-front.png", back: "assets/crop-black-back.png" }
    ],
    description: "Cropped fit, front & back print."
  },
  {
    id: "jorts-black",
    name: "Thr33 Denim Jorts",
    sku: "TH-JORTS-BLK",
    price: 20000,
    category: "shorts",
    sizes: ["28", "30", "32", "34", "36"],
    colors: [
      { name: "Black", hex: "#17170f", front: "assets/jorts-front.png", back: "assets/jorts-back.png" }
    ],
    description: "Washed black denim jorts with the embroidered TB monogram pocket."
  },
  {
    id: "rose-female-ls",
    name: "Rose From the Concrete Boxy Tee — Long Sleeve (Female)",
    sku: "TH-ROSE-LS-BLK",
    price: 45000,
    category: "long-sleeve",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Black", hex: "#17170f", front: "assets/rose-female-ls-front.png", back: "assets/rose-female-ls-back.png" }
      // To add white / sky blue / brown: send those front & back photos, then add
      // entries here the same way as the Black one above.
    ],
    description: "Cropped long-sleeve with the rose back print."
  },
  {
    id: "rose-unisex",
    name: "Rose From the Concrete Boxy Tee — Unisex",
    sku: "TH-ROSE-UNI-BLK",
    price: 45000,
    category: "tee",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#17170f", front: "assets/rose-unisex-front.png", back: "assets/rose-unisex-back.png" }
    ],
    description: "Relaxed boxy tee with a white contrast collar, rose emblem front, Thr33 print on the back."
  }
];