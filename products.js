/*
  PRODUCTS
  --------
  This is the only file you need to touch to update what's for sale.

  - front / back: paths to your product photos. Drop new images into the
    /assets folder and point to them here (e.g. "assets/hoodie-front.jpg").
  - price: in Naira, as a plain number (no commas).
  - sizes: shown as buttons on the product card.
  - sku: shows on the receipt/checkout, purely cosmetic.
  - category: one of the CATEGORIES ids below (controls the "type" filter).
  - collection: one of the COLLECTIONS ids below (controls the "collection" filter).

  To add a new type or collection (e.g. "Hoodies" or "Summer Drop"), just add
  it to the matching list below — it'll show up in the nav automatically,
  and will say "coming soon" until a product uses that id.
*/

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "tee", label: "Tees" },
  { id: "long-sleeve", label: "Long Sleeve" },
  { id: "shorts", label: "Shorts" },
  { id: "hoodie", label: "Hoodies" }
];

const COLLECTIONS = [
  { id: "all", label: "All" },
  { id: "core", label: "Core" },
  { id: "rose-from-the-concrete", label: "Rose From the Concrete" },
  { id: "sports", label: "Sports Collection" }
];

const PRODUCTS = [
  {
    id: "tee-black",
    name: "Basic Thr33 Tee — Black",
    sku: "TH-BASIC-BLK",
    price: 20000,
    category: "tee",
    collection: "core",
    sizes: ["S", "M", "L", "XL"],
    front: "assets/tee-black-front.png",
    back: "assets/tee-black-back.png",
    description: "Unisex heavyweight tee in black with the Thr33 monogram print."
  },
  {
    id: "tee-white",
    name: "Basic Thr33 Tee — White",
    sku: "TH-BASIC-WHT",
    price: 20000,
    category: "tee",
    collection: "core",
    sizes: ["S", "M", "L", "XL"],
    front: "assets/tee-white-front.png",
    back: "assets/tee-white-back.png",
    description: "Unisex heavyweight tee in white with the Thr33 monogram print."
  },
  {
    id: "crop-tee-white",
    name: "Basic Female Crop Tee — White",
    sku: "TH-CROP-WHT",
    price: 15000,
    category: "tee",
    collection: "core",
    sizes: ["S", "M", "L"],
    front: "assets/crop-white-front.png",
    back: "assets/crop-white-back.png",
    description: "Cropped fit, front & back print. Also available in black — ask on order."
  },
  {
    id: "jorts-black",
    name: "Thr33 Denim Jorts",
    sku: "TH-JORTS-BLK",
    price: 20000,
    category: "shorts",
    collection: "core",
    sizes: ["28", "30", "32", "34", "36"],
    front: "assets/jorts-front.png",
    back: "assets/jorts-back.png",
    description: "Washed black denim jorts with the embroidered TB monogram pocket."
  },
  {
    id: "rose-female-ls",
    name: "Rose From the Concrete Boxy Tee — Long Sleeve (Female)",
    sku: "TH-ROSE-LS-BLK",
    price: 45000,
    category: "long-sleeve",
    collection: "rose-from-the-concrete",
    sizes: ["S", "M", "L"],
    front: "assets/rose-female-ls-front.png",
    back: "assets/rose-female-ls-back.png",
    description: "Cropped long-sleeve with the rose back print. Also in white, sky blue and brown — ask on order."
  },
  {
    id: "rose-unisex",
    name: "Rose From the Concrete Boxy Tee — Unisex",
    sku: "TH-ROSE-UNI-BLK",
    price: 45000,
    category: "tee",
    collection: "rose-from-the-concrete",
    sizes: ["S", "M", "L", "XL"],
    front: "assets/rose-unisex-front.png",
    back: "assets/rose-unisex-back.png",
    description: "Relaxed boxy tee with a white contrast collar, rose emblem front, Thr33 print on the back."
  }
];
