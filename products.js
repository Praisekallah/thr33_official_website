/*
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
    id: "jorts-black",
    name: "Thr33 R4C Denim Jorts",
    sku: "TH-JORTS-BLK",
    price: 25000,
    originalPrice: 35000,
    badges: ["Preorder"],
    category: "shorts",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      {
        name: "Black",
        hex: "#17170f",
        images: [
          "assets/jorts-front.png",
          "assets/jorts-back.png",
          "assets/R4C-grid/grid-07.JPG",
          "assets/R4C-grid/grid-13.JPG",
          "assets/R4C-grid/grid-10.JPG"
        ]
      }
    ],
    description: "Washed black denim jorts with the embroidered TB monogram pocket."
  },
  {
    id: "rose-female-ls",
    name: "R4C GIRLS CROP TOP (LONGSLEEVE)",
    sku: "TH-ROSE-LS-BLK",
    price: 25000,
    badges: ["Preorder"],
    category: "long-sleeve",
    sizes: ["S", "M", "L"],
    colors: [
      {
        name: "Black",
        hex: "#17170f",
        images: [
          "assets/rose-female-ls-front.PNG",
          "assets/rose-female-ls-back.PNG",
          "assets/R4C-grid/grid-11.JPG",
          "assets/R4C-grid/grid-05.JPG",
          "assets/R4C-grid/grid-09.JPG"
        ]
      }
    ],
    description: "Cropped long-sleeve with the rose back print."
  },
  {
    id: "rose-unisex",
    name: "R4C Boxy Tee — Unisex",
    sku: "TH-ROSE-UNI-BLK",
    price: 25000,
    badges: ["Preorder"],
    category: "tee",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      {
        name: "Black",
        hex: "#17170f",
        images: [
          "assets/rose-unisex-front.PNG",
          "assets/rose-unisex-back.PNG",
          "assets/R4C-grid/grid-14.JPG",
          "assets/R4C-grid/grid-01.JPG",
          "assets/R4C-grid/grid-04.JPG",
          "assets/R4C-grid/grid-10.JPG"
        ]
      }
    ],
    description: "Relaxed boxy tee with a white contrast collar, rose emblem front, Thr33 print on the back."
  },

  {
    id: "R4C_Tee",
    name: "Thr33 black R4C tee",
    sku: "T3-R4C_BT",
    price: 15000,
    originalPrice: 20000,
    badges: ["Preorder"],
    category: "tee",
    sizes: ["M", "L", "XL"],
    colors: [
      {
        name: "Black",
        hex: "#17170f",
        images: [
          "assets/R4C_basic_tee_front.PNG",
          "assets/R4C_basic_tee_back.PNG",
          "assets/R4C-grid/grid-13.JPG",
          "assets/R4C-grid/grid-08.JPG"
        ]
      }
    ],
    description: "Thr33 black R4C basic tee."
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
          "assets/model-black-thr33-basicT31.JPG",
          "assets/model-black-thr33-basicT32.PNG"
        ]
      },
      {
        name: "White",
        hex: "#f5f3ec",
        images: [
          "assets/t3basic-white-front.png",
          "assets/t3basic-white-back.png",
          "assets/model-white-thr33-basicT31.JPG",
          "assets/model-white-thr33-basicT32.JPG"
        ]

      }
    ],
    description: "Basic T3 Tee - Unisex."
  },
  {
    id: "thr33-crop-top",
    name: "Thr33 baggy girls Crop Top",
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
          "assets/model-black-thr33-croptop.PNG",
          "assets/model-black-thr33-croptop2.PNG"
        ]
      },
      {
        name: "White",
        hex: "#f5f3ec",
        images: [
          "assets/croptop-white-front.png",
          "assets/croptop-white-back.png",
          "assets/model-white-thr33-croptop1.PNG",
          "assets/model-white-thr33-croptop2.PNG"
        ]
      }
    ],
    description: "loose girls' crop top."
  },
  {
    id: "thr33-peach-graphic-tee",
    name: "Thr33 Peach Graphic Tee",
    sku: "THR-Pch-grph-top",
    price: 25000,
    originalPrice: 35000,
    outOfStock: true,
    category: "tee",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        name: "Peach",
        hex: "#ffb38a",
        images: [
          "assets/thr33-peach-graphic-tee-front.png",
          "assets/thr33-peach-graphic-tee-back.png",
          "assets/model-peach-thr33-soph-brain2.JPG",
          "assets/model-peach-thr33-soph-brain1.JPG"
        ]
      }
    ],
    description: "Boxy Thr33 Peach-colored graphic Tee."
  }
];
// Allow this file to be shared with server-side code (Vercel functions)
// without breaking browser usage. Browsers ignore this block since
// `module` doesn't exist there — only Node (your API functions) sees it.
if (typeof module !== "undefined") {
  module.exports = { PRODUCTS, CATEGORIES };
}
