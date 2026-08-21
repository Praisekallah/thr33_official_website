/*
  PRODUCTS
  --------
  This is the only file you need to touch to update what's for sale.

  - colors: each product has a list of color variants (name, hex, images).
    One color = no swatch row shown. 2+ colors = swatches appear
    automatically.
  - images: an ARRAY of photo paths for that color, in the order you want
    them to appear in the product gallery. Order convention:
      [0] = front           (used as the main grid photo)
      [1] = back             (used for the hover-flip on the grid card)
      [2+] = anything else — on-model shots, detail close-ups, etc.
    You need at least 1 image. 2+ unlocks the hover-flip on the grid.
    3+ gives customers a swipeable gallery inside the product popup.
  - price: in Naira, as a plain number (no commas).
  - sizes: shown as buttons on the product card.
  - sku: shows on the receipt/checkout, purely cosmetic.
  - category: one of the CATEGORIES ids below (controls the nav filter).
  - badges: optional. Add an array of short strings (e.g. ["New", "Presale"])
    to show one or more small badges stacked in the top-left of that
    product's card. Leave it off entirely for products that shouldn't
    have any.

  STOCK: each product starts with 20 units (set in api/get-stock.js and
  api/verify-payment.js — INITIAL_STOCK). Stock lives on the server, not
  here, so it survives across visits and decreases automatically after
  every real paid order. To change the starting stock number, update
  INITIAL_STOCK in both of those two API files.

  PAUSED PRODUCTS: everything below the active three is commented out,
  not deleted — find the comment-start line above that block and the
  comment-end line after it (near the bottom of this file) and delete
  just those two lines to bring the product straight back.
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
    id: "jorts-black",
    name: "Thr33 Denim Jorts",
    sku: "TH-JORTS-BLK",
    price: 25999,
    originalPrice: 35000,
    badges: ["New", "Presale"],
    category: "shorts",
    sizes: ["28", "30", "32", "34", "36"],
    colors: [
      {
        name: "Black",
        hex: "#17170f",
        images: [
          "assets/jorts-front.png",
          "assets/jorts-back.png"
          // add on-model shots here once the shoot is in, e.g.:
          // "assets/jorts-model-1.jpg", "assets/jorts-model-2.jpg"
        ]
      }
    ],
    description: "Washed black denim jorts with the embroidered TB monogram pocket."
  },
  {
    id: "rose-female-ls",
    name: "Rose From the Concrete Boxy Tee — Long Sleeve (Female)",
    sku: "TH-ROSE-LS-BLK",
    price: 45000,
    badges: ["New", "Presale"],
    category: "long-sleeve",
    sizes: ["S", "M", "L"],
    colors: [
      {
        name: "Black",
        hex: "#17170f",
        images: [
          "assets/rose-female-ls-front.png",
          "assets/rose-female-ls-back.png"
          // "assets/rose-female-ls-model-1.jpg"
        ]
      }
    ],
    description: "Cropped long-sleeve with the rose back print."
  },
  {
    id: "rose-unisex",
    name: "Rose From the Concrete Boxy Tee — Unisex",
    sku: "TH-ROSE-UNI-BLK",
    price: 45000,
    badges: ["New", "Presale"],
    category: "tee",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      {
        name: "Black",
        hex: "#17170f",
        images: [
          "assets/rose-unisex-front.png",
          "assets/rose-unisex-back.png"
          // "assets/rose-unisex-model-1.jpg"
        ]
      }
    ],
    description: "Relaxed boxy tee with a white contrast collar, rose emblem front, Thr33 print on the back."
  }

  /* --- PAUSED — delete this comment-start line and the comment-end
     line after the last item below to bring these back into the catalog. ---

  ,{
    id: "crop-basic-female",
    name: "Basic Female Cropped Tee",
    sku: "TH-CROP-BASIC",
    price: 20000,
    originalPrice: 30000,
    category: "tee",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Black", hex: "#17170f", images: ["assets/crop-black-front.png", "assets/crop-black-back.png"] },
      { name: "Pink", hex: "#f2a6c1", images: ["assets/crop-pink-front.png", "assets/crop-pink-back.png"] },
      { name: "White", hex: "#f5f3ec", images: ["assets/crop-white-v2-front.png", "assets/crop-white-v2-back.png"] }
    ],
    description: "Cropped fit, front & back print."
  },
  {
    id: "rose-graphic-tee",
    name: "Rose Graphic T",
    sku: "TH-ROSE-GFX",
    price: 20000,
    originalPrice: 30000,
    category: "tee",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#17170f", images: ["assets/rose-tee-black-front.png", "assets/rose-tee-black-back.png"] },
      { name: "Peach", hex: "#f5c9a8", images: ["assets/rose-tee-peach-front.png", "assets/rose-tee-peach-back.png"] },
      { name: "Maroon", hex: "#6e1423", images: ["assets/rose-tee-maroon-front.png", "assets/rose-tee-maroon-back.png"] },
      { name: "White", hex: "#f5f3ec", images: ["assets/rose-tee-white-front.png", "assets/rose-tee-white-back.png"] }
    ],
    description: "Unisex tee with a bold rose graphic front and the Thr33 print on the back."
  },
  {
    id: "mfdoom-king-spade",
    name: "Thr33 x MF Doom — King of Spade",
    sku: "TH-DOOM-KOS",
    price: 21999,
    originalPrice: 30000,
    category: "tee",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Peach", hex: "#f5c9a8", images: ["assets/mfdoom-peach-front.png", "assets/mfdoom-peach-back.png"] },
      { name: "White", hex: "#f5f3ec", images: ["assets/mfdoom-white-front.png", "assets/mfdoom-white-back.png"] },
      { name: "Black", hex: "#17170f", images: ["assets/mfdoom-black-front.png", "assets/mfdoom-black-back.png"] },
      { name: "Maroon", hex: "#6e1423", images: ["assets/mfdoom-maroon-front.png", "assets/mfdoom-maroon-back.png"] }
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
      { name: "Peach", hex: "#f5c9a8", images: ["assets/moneyface-peach-front.png", "assets/moneyface-peach-back.png"] },
      { name: "Maroon", hex: "#6e1423", images: ["assets/moneyface-maroon-front.png", "assets/moneyface-maroon-back.png"] },
      { name: "White", hex: "#f5f3ec", images: ["assets/moneyface-white-front.png", "assets/moneyface-white-back.png"] },
      { name: "Black", hex: "#17170f", images: ["assets/moneyface-black-front.png", "assets/moneyface-black-back.png"] }
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
      { name: "White", hex: "#f5f3ec", images: ["assets/t3basic-white-front.png", "assets/t3basic-white-back.png"] },
      { name: "Black", hex: "#17170f", images: ["assets/t3basic-black-front.png", "assets/t3basic-black-back.png"] },
      { name: "Peach", hex: "#f5c9a8", images: ["assets/t3basic-peach-front.png", "assets/t3basic-peach-back.png"] },
      { name: "Maroon", hex: "#6e1423", images: ["assets/t3basic-maroon-front.png", "assets/t3basic-maroon-back.png"] }
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
      { name: "White", hex: "#f5f3ec", images: ["assets/croptop-white-front.png", "assets/croptop-white-back.png"] },
      { name: "Black", hex: "#17170f", images: ["assets/croptop-black-front.png", "assets/croptop-black-back.png"] },
      { name: "Pink", hex: "#f2a6c1", images: ["assets/croptop-pink-front.png", "assets/croptop-pink-back.png"] }
    ],
    description: "Cropped fit, front & back Thr33 print."
  }
  */
];
