/*
  PRODUCTS
  --------
  This is the only file you need to touch to update what's for sale.

  - colors: each product has a list of color variants (name, hex, front/back
    photo paths). One color = no swatch row shown. 2+ colors = swatches
    appear automatically.
  - price: in Naira, as a plain number (no commas).
  - sizes: shown as buttons on the product card.
  - sku: shows on the receipt/checkout, purely cosmetic.
  - category: one of the CATEGORIES ids below (controls the nav filter).
  - featured: optional. Add a short string (e.g. "Best Seller") to show a
    badge on the top-left of that product's card. Leave it off entirely
    for products that shouldn't have one.

  STOCK: each product starts with 20 units (set in api/get-stock.js and
  api/verify-payment.js — INITIAL_STOCK). Stock lives on the server, not
  here, so it survives across visits and decreases automatically after
  every real paid order. To change the starting stock number, update
  INITIAL_STOCK in both of those two API files.
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
    id: "crop-basic-female",
    name: "Basic Female Cropped Tee",
    sku: "TH-CROP-BASIC",
    price: 20000,
    originalPrice: 30000,
    category: "tee",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Black", hex: "#17170f", front: "assets/crop-black-front.png", back: "assets/crop-black-back.png" },
      { name: "Pink", hex: "#f2a6c1", front: "assets/crop-pink-front.png", back: "assets/crop-pink-back.png" },
      { name: "White", hex: "#f5f3ec", front: "assets/crop-white-v2-front.png", back: "assets/crop-white-v2-back.png" }
    ],
    description: "Cropped fit, front & back print."
  },
  /*
  {
    id: "rose-graphic-tee",
    name: "Rose Graphic T",
    sku: "TH-ROSE-GFX",
    price: 20000,
    originalPrice: 30000,
    category: "tee",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#17170f", front: "assets/rose-tee-black-front.png", back: "assets/rose-tee-black-back.png" },
      { name: "Peach", hex: "#f5c9a8", front: "assets/rose-tee-peach-front.png", back: "assets/rose-tee-peach-back.png" },
      { name: "Maroon", hex: "#6e1423", front: "assets/rose-tee-maroon-front.png", back: "assets/rose-tee-maroon-back.png" },
      { name: "White", hex: "#f5f3ec", front: "assets/rose-tee-white-front.png", back: "assets/rose-tee-white-back.png" }
    ],
    description: "Unisex tee with a bold rose graphic front and the Thr33 print on the back."
  },
  */
  {
    id: "mfdoom-king-spade",
    name: "Thr33 x MF Doom — King of Spade",
    sku: "TH-DOOM-KOS",
    price: 21999,
    originalPrice: 30000,
    category: "tee",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Peach", hex: "#f5c9a8", front: "assets/mfdoom-peach-front.png", back: "assets/mfdoom-peach-back.png" },
      { name: "White", hex: "#f5f3ec", front: "assets/mfdoom-white-front.png", back: "assets/mfdoom-white-back.png" },
      { name: "Black", hex: "#17170f", front: "assets/mfdoom-black-front.png", back: "assets/mfdoom-black-back.png" },
      { name: "Maroon", hex: "#6e1423", front: "assets/mfdoom-maroon-front.png", back: "assets/mfdoom-maroon-back.png" }
    ],
    description: "Unisex tee, playing card graphic front, Thr33 print on the back."
  },
  {
    id: "moneyface-tee",
    name: "Money Face Graphic T",
    sku: "TH-MONEYFACE",
    price: 21999,
    originalPrice: 30000,
    category: "tee",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Peach", hex: "#f5c9a8", front: "assets/moneyface-peach-front.png", back: "assets/moneyface-peach-back.png" },
      { name: "Maroon", hex: "#6e1423", front: "assets/moneyface-maroon-front.png", back: "assets/moneyface-maroon-back.png" },
      { name: "White", hex: "#f5f3ec", front: "assets/moneyface-white-front.png", back: "assets/moneyface-white-back.png" },
      { name: "Black", hex: "#17170f", front: "assets/moneyface-black-front.png", back: "assets/moneyface-black-back.png" }
    ],
    description: "Unisex tee, \"Money Talks\" graphic front, Thr33 print on the back."
  },
  {
    id: "t3-basic-tee",
    name: "T3 Basic Tee",
    sku: "TH-T3-BASIC",
    price: 21999,
    originalPrice: 30000,
    category: "tee",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "White", hex: "#f5f3ec", front: "assets/t3basic-white-front.png", back: "assets/t3basic-white-back.png" },
      { name: "Black", hex: "#17170f", front: "assets/t3basic-black-front.png", back: "assets/t3basic-black-back.png" },
      { name: "Peach", hex: "#f5c9a8", front: "assets/t3basic-peach-front.png", back: "assets/t3basic-peach-back.png" },
      { name: "Maroon", hex: "#6e1423", front: "assets/t3basic-maroon-front.png", back: "assets/t3basic-maroon-back.png" }
    ],
    description: "Unisex tee with the repeating T3 monogram outline print."
  },
  {
    id: "croptop-thr33-female",
    name: "Thr33 Cropped Top",
    sku: "TH-CROPTOP",
    price: 20000,
    originalPrice: 30000,
    category: "tee",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "White", hex: "#f5f3ec", front: "assets/croptop-white-front.png", back: "assets/croptop-white-back.png" },
      { name: "Black", hex: "#17170f", front: "assets/croptop-black-front.png", back: "assets/croptop-black-back.png" },
      { name: "Pink", hex: "#f2a6c1", front: "assets/croptop-pink-front.png", back: "assets/croptop-pink-back.png" }
    ],
    description: "Cropped fit, front & back Thr33 print."
  },
  {
    id: "jorts-black",
    name: "Thr33 Denim Jorts",
    sku: "TH-JORTS-BLK",
    price: 25999,
    originalPrice: 35000,
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
    featured: "Best Seller",
    category: "long-sleeve",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Black", hex: "#17170f", front: "assets/rose-female-ls-front.png", back: "assets/rose-female-ls-back.png" }
    ],
    description: "Cropped long-sleeve with the rose back print."
  },
  {
    id: "rose-unisex",
    name: "Rose From the Concrete Boxy Tee — Unisex",
    sku: "TH-ROSE-UNI-BLK",
    price: 45000,
    featured: "Best Seller",
    category: "tee",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#17170f", front: "assets/rose-unisex-front.png", back: "assets/rose-unisex-back.png" }
    ],
    description: "Relaxed boxy tee with a white contrast collar, rose emblem front, Thr33 print on the back."
  }
];
