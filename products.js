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
    badges: ["Coming Soon"],
    comingSoon: true,
    category: "shorts",
    sizes: ["28", "30", "32", "34", "36"],
    colors: [
      {
        name: "Black",
        hex: "#17170f",
        images: [
          "assets/jorts-front.png",
          "assets/jorts-back.png"
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
    badges: ["Coming Soon"],
    comingSoon: true,
    category: "long-sleeve",
    sizes: ["S", "M", "L"],
    colors: [
      {
        name: "Black",
        hex: "#17170f",
        images: [
          "assets/rose-female-ls-front.png",
          "assets/rose-female-ls-back.png"
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
    badges: ["Coming Soon"],
    comingSoon: true,
    category: "tee",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      {
        name: "Black",
        hex: "#17170f",
        images: [
          "assets/rose-unisex-front.png",
          "assets/rose-unisex-back.png"
        ]
      }
    ],
    description: "Relaxed boxy tee with a white contrast collar, rose emblem front, Thr33 print on the back."
  },
  {
    id: "t3-basic-tee",
    name: "T3 Basic Tee",
    sku: "TH-T3-BASIC",
    price: 25000,
    originalPrice: 35000,
    badges: ["Live"],
    category: "tee",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        name: "Black",
        hex: "#17170f",
        images: [
          "assets/t3basic-black-front.png",
          "assets/t3basic-black-back.png",
          "assets/model-black-thr33-basicT32.jpg",
          "assets/model-black-thr33-basicT32.png"
        ]
      },
      {
        name: "White",
        hex: "#f5f3ec",
        images: [
          "assets/t3basic-white-front.png",
          "assets/t3basic-white-back.png",
          "assets/model-white-thr33-basicT31.jpg",
          "assets/model-white-thr33-basicT32.jpg"
        ]
      }
    ],
    description: "Basic T3 Tee - Unisex."
  },
  {
    id: "thr33-crop-top",
    name: "Thr33 girls Crop Top",
    sku: "TH-crop-top",
    price: 25000,
    originalPrice: 35000,
    badges: ["Live"],
    category: "tee",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        name: "Black",
        hex: "#17170f",
        images: [
          "assets/croptop-black-front.png",
          "assets/croptop-black-back.png",
          "assets/model-black-thr33-croptop1.png",
          "assets/model-black-thr33-croptop2.png"
        ]
      },
      {
        name: "White",
        hex: "#f5f3ec",
        images: [
          "assets/croptop-white-front.png",
          "assets/croptop-white-back.png",
          "assets/model-white-thr33-croptop1.png",
          "assets/model-white-thr33-croptop2.png"
        ]
      }
    ],
    description: "Comfy girls' crop top."
  },
  {
    id: "thr33-peach-graphic-tee",
    name: "Thr33 Peach Graphic Tee",
    sku: "THR-Pch-grph-top",
    price: 25000,
    originalPrice: 35000,
    badges: ["Live"],
    category: "tee",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        name: "Peach",
        hex: "#ffb38a",
        images: [
          "assets/thr33-peach-graphic-tee-front.png",
          "assets/thr33-peach-graphic-tee-back.png",
          "assets/model-peach-thr33-soph-brain2.png",
          "assets/model-peach-thr33-soph-brain1.png"
        ]
      }
    ],
    description: "Boxy Thr33 Peach-colored graphic Tee."
  }
];
