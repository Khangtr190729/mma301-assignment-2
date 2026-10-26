/**
 * Safe offline fallback product data in case Remote API is unreachable
 * Ensures app resilience and offline demo capability
 */
export const FALLBACK_PRODUCTS = [
  {
    id: 1,
    title: 'Essence Mascara Lash Princess',
    description: 'The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects.',
    category: 'beauty',
    price: 9.99,
    discountPercentage: 7.17,
    rating: 4.94,
    stock: 99,
    brand: 'Essence',
    thumbnail: 'https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/thumbnail.png',
    images: [
      'https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/1.png'
    ],
  },
  {
    id: 2,
    title: 'Eyeshadow Palette with Mirror',
    description: 'The Eyeshadow Palette with Mirror offers a versatile range of eyeshadow shades for creating stunning eye looks.',
    category: 'beauty',
    price: 19.99,
    discountPercentage: 5.5,
    rating: 3.28,
    stock: 44,
    brand: 'Glamour',
    thumbnail: 'https://cdn.dummyjson.com/products/images/beauty/Eyeshadow%20Palette%20with%20Mirror/thumbnail.png',
    images: [
      'https://cdn.dummyjson.com/products/images/beauty/Eyeshadow%20Palette%20with%20Mirror/1.png'
    ],
  },
  {
    id: 3,
    title: 'Powder Canister',
    description: 'The Powder Canister is a finely milled setting powder designed to set makeup and control shine.',
    category: 'beauty',
    price: 14.99,
    discountPercentage: 18.14,
    rating: 3.82,
    stock: 59,
    brand: 'Velvet Touch',
    thumbnail: 'https://cdn.dummyjson.com/products/images/beauty/Powder%20Canister/thumbnail.png',
    images: [
      'https://cdn.dummyjson.com/products/images/beauty/Powder%20Canister/1.png'
    ],
  },
  {
    id: 4,
    title: 'Red Lipstick',
    description: 'The Red Lipstick is a classic and bold choice for adding a pop of color to your lips with long-lasting hydration.',
    category: 'beauty',
    price: 12.99,
    discountPercentage: 19.03,
    rating: 2.51,
    stock: 68,
    brand: 'Chic Cosmetics',
    thumbnail: 'https://cdn.dummyjson.com/products/images/beauty/Red%20Lipstick/thumbnail.png',
    images: [
      'https://cdn.dummyjson.com/products/images/beauty/Red%20Lipstick/1.png'
    ],
  },
  {
    id: 5,
    title: 'Red Nail Polish',
    description: 'The Red Nail Polish offers a rich and glossy red color for manicured nails with quick-dry formula.',
    category: 'beauty',
    price: 8.99,
    discountPercentage: 2.46,
    rating: 3.91,
    stock: 71,
    brand: 'Nail Couture',
    thumbnail: 'https://cdn.dummyjson.com/products/images/beauty/Red%20Nail%20Polish/thumbnail.png',
    images: [
      'https://cdn.dummyjson.com/products/images/beauty/Red%20Nail%20Polish/1.png'
    ],
  },
  {
    id: 6,
    title: 'Calvin Klein CK One',
    description: 'CK One by Calvin Klein is a classic unisex fragrance, known for its fresh and clean scent notes.',
    category: 'fragrances',
    price: 49.99,
    discountPercentage: 0.32,
    rating: 4.85,
    stock: 17,
    brand: 'Calvin Klein',
    thumbnail: 'https://cdn.dummyjson.com/products/images/fragrances/Calvin%20Klein%20CK%20One/thumbnail.png',
    images: [
      'https://cdn.dummyjson.com/products/images/fragrances/Calvin%20Klein%20CK%20One/1.png'
    ],
  },
  {
    id: 7,
    title: 'Chanel Coco Noir Eau De',
    description: 'Coco Noir by Chanel is an elegant and mysterious fragrance with notes of grapefruit, rose, and patchouli.',
    category: 'fragrances',
    price: 129.99,
    discountPercentage: 18.64,
    rating: 2.76,
    stock: 41,
    brand: 'Chanel',
    thumbnail: 'https://cdn.dummyjson.com/products/images/fragrances/Chanel%20Coco%20Noir%20Eau%20De/thumbnail.png',
    images: [
      'https://cdn.dummyjson.com/products/images/fragrances/Chanel%20Coco%20Noir%20Eau%20De/1.png'
    ],
  },
  {
    id: 8,
    title: "Dior J'adore",
    description: "J'adore by Dior is a luxurious and floral fragrance, celebrated for its glamorous and feminine scent.",
    category: 'fragrances',
    price: 89.99,
    discountPercentage: 17.44,
    rating: 3.31,
    stock: 91,
    brand: 'Dior',
    thumbnail: "https://cdn.dummyjson.com/products/images/fragrances/Dior%20J'adore/thumbnail.png",
    images: [
      "https://cdn.dummyjson.com/products/images/fragrances/Dior%20J'adore/1.png"
    ],
  },
];
