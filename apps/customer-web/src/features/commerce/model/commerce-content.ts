export interface CommerceProduct {
  productId: string;
  name: string;
  brand: string;
  quantity: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  badge?: string;
  badgeTone?: 'sale' | 'fresh' | 'organic';
  rating?: number;
  reviewCount?: string;
  deliveryTime?: string;
  stockLabel?: string;
}

export interface CartLine extends CommerceProduct {
  quantityInCart: number;
}

export interface AddressView {
  addressId: string;
  label: 'Home' | 'Work' | 'Other';
  name: string;
  phone: string;
  lines: string[];
  city: string;
  state: string;
  postalCode: string;
  isDefault?: boolean;
}

export const searchProducts: CommerceProduct[] = [
  {
    productId: 'premium-hass-avocado',
    name: 'Premium Hass Avocado',
    brand: 'Organic Farms',
    quantity: '1 Unit',
    price: 2.49,
    originalPrice: 2.99,
    badge: '-15% OFF',
    badgeTone: 'sale',
    rating: 4.9,
    reviewCount: '1.2k',
    deliveryTime: '15 min',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_6alBBSW6DPpn8yHUoXDkDWJ-TEDKwtoDmrnBBsJkmJVkLMkVJnuf--ItTvsH6BilRxTVUkGqzL_z2uz7mq3Yu9micB_mXuCHSCCxgXMp4uwiK-W7DX1u6rmXtZC3u_OgcL1F159qsQ1lHG3nvTzerUTOekjXgneAwOJengKTzm5flvsjhPLYK47gCKHpPD5b868UGuPuBZcvmMkbVzh7LNmQq_2bj87JdeSm9-7G53bdw10Jr1hU0DVsrHIezEN7dIkcKQ4VVUId'
  },
  {
    productId: 'organic-avocado-oil',
    name: 'Organic Avocado Oil',
    brand: 'Pure Cold Press',
    quantity: '500ml Bottle',
    price: 12.99,
    rating: 4.8,
    reviewCount: '850',
    deliveryTime: '20 min',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC19ASCmmLi6eR7UILxqyW2DjU6EirgxA_AIEKAuCJFCdXP8UTkj5uubhs9S3ej1RzaqSUo4Bab5Th8zQwAgn8q7qoaDag1wqoCASnb9tb_3cGbsGKwHi9ogB8jhuRE2h53awVmINLDOY7qjJ6DyrnD6hMSQJguqTUheTi4FqUSUfS4YCdLE-vTvhFJbCMa6hZ3KSVYg7JDEsIQWOIkKpeASJShQAvkYID8ET86eUtWmiMiAfrGURx8fiwq-nLmOs16ixpCxlLS_Yig'
  },
  {
    productId: 'classic-guacamole-mix',
    name: 'Classic Guacamole Mix',
    brand: 'Kitchen Fresh',
    quantity: 'Ready Kit',
    price: 5.49,
    rating: 4.7,
    reviewCount: '430',
    deliveryTime: '12 min',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCmt0GpaRxBg2lqhXe3HV8Qe588zOXWu5uCv6XFuvx74gDRk9z1pSbh1ky4qCmDkhEFrZSMwERIZ7FSc-dKeeWJrP8mbWTGtUmFSb7ks3qV2dJAYfiW5am_NHwbnlPgukGCY0kdQ-exXxGQHjChWqTCbyivj5Ue3JXqw1QY5Xmo_M5t47fDGzSXJhJH4TjLVtoOWxmP7FT2ct_JVSDisBAm0_5s75Qzj2LOJWGJxT2R8s9io8rQXzCcWHlzbZ1g-15XWzDTmLcoA7S'
  },
  {
    productId: 'organic-baby-avocados',
    name: 'Organic Baby Avocados (4pk)',
    brand: 'Daily Deals',
    quantity: '4 Pack',
    price: 6.99,
    rating: 4.5,
    reviewCount: '210',
    deliveryTime: '18 min',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYFixX5CVUl9_woujsH8XJaxiWgo_5fkxP_bFFn8-qXgXt4yGccYn762a-woTFwcug6sif414eCRAisNbxXNswbsOrJ4_t2leGZLfs1RGs7QE6cjyLxRzklZsFWugb-0XQS5ZlxGbTptE43Akv2VoXJ4uOniFdpPoW-i9Rrsn3-v9B314ndry0OHKGGek3pzlU2savFMfEEttSV7hS8EB3h-Kt63SYNk_qir78s-Mn9wz7D8EOSwJ5P688YUZL9Qjf5nL8DvqT5yC6'
  }
];

export const categoryProducts: CommerceProduct[] = [
  {
    productId: 'organic-lacinato-kale',
    name: 'Organic Lacinato Kale',
    brand: 'Local Farm',
    quantity: 'Approx. 250g',
    price: 3.5,
    originalPrice: 4.15,
    badge: '15% OFF',
    badgeTone: 'sale',
    rating: 4.8,
    reviewCount: '124',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6HzydlMLvYgzOIPFYggb6WzXrMCIkoczG7wIjXc1ODprPz5lzKVxwjvr5CxpQGObYIfAXe7Abdkx5UDe65ZJW3Bc2GmH1C_Z8M2oWPklYHwx9n1njqPwOmE5S7F9D1fJXDGqcpKfiaFFUUoKBWCNJ7pM9d_b5dKZ5rBol6d4EBlkghd0plHmw2xEk9WV803YFhOC3_CyXjdjvEwS4k-J5kmK8xC6x087saSwJ1uFy7Dr_Ygl-L9N1tpqj2EayRokzH6xNpQ_-iWWf'
  },
  {
    productId: 'vine-ripened-tomatoes',
    name: 'Vine-Ripened Tomatoes',
    brand: 'Hydroponic',
    quantity: '500g Pack',
    price: 5.25,
    rating: 4.9,
    reviewCount: '342',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3X7FpBAllkl1XHo7K037c6yutZxCEAdj6t_S3TsHkUoEnCMt1WcXhBT0zStpLkPT7yMpPVgeN_QKyeP3Y3uDzFKRiTebg-dblJ-G-aCv5hFFh7XIZalbHqw1gFzUTbzFZH_dc_oziZhURgW74EFz9FVLgRoQmDpLLX-7M7PDl7kAIaC4lYT--yW-_nMr5R19AmJKQ2lfE7Yx3TRQntuhFq4GjH7WxdQKQQTrBjpyEwk8tAHX0DQIv1YjoJdrovqaoAoN_-z9EefmQ'
  },
  {
    productId: 'sweet-blueberries',
    name: 'Sweet Blueberries',
    brand: 'Imported',
    quantity: '125g Punnet',
    price: 4.95,
    badge: 'FRESH ARRIVAL',
    badgeTone: 'fresh',
    rating: 4.7,
    reviewCount: '89',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXLzPsCBTvIVg8Crdk0R9s74hpv_7VWwlQbkCF2-gCMUtdnVcESO_hDo_vWGL4HAwKrVIeSyM-nNdZGHHqQGezzSNoLV-xJrBCtL0bERH0VMnOfHD-6KhFYvEtmb1QwgDxIHVl4-xC-ccia8xq4OmdHk7XSI-Our0ar1aKhkU4ea3FlHy7Z6j7QC3qoDZS2-SYtn16roZQ-KmPwMM39Yl9oR88ybRIeUkv-ddpp1I6yBiPSKvThc7A0aFn6eIAbM0DFNvDL5e3GUjn'
  },
  { ...searchProducts[0], productId: 'hass-avocado-large', name: 'Hass Avocado Large', quantity: '1 Unit - Ripe & Ready', price: 2.2, originalPrice: undefined, reviewCount: '512' }
];

export const wishlistProducts: CommerceProduct[] = [
  {
    productId: 'organic-honeyberries',
    name: 'Organic Honeyberries',
    brand: 'Premium Organic',
    quantity: '250g Bowl',
    price: 12.5,
    originalPrice: 14.75,
    badge: '15% OFF',
    badgeTone: 'sale',
    stockLabel: 'In Stock',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWsw8JAA3GnMTnwbl9czzfzrPkpAcnemPmyCZESxlbqP0WdJvK0URWh5kEYhaHbFzbFTYHpgo9OtyCvfPPeUimMIzw7mFeTb-TH3UKFxHB738M5MXiQ8f1H58fJF-_K8bwW2s91sC-Qkr6BmXVvBOEKCo9s3VhE-AIyAUxnrNShtKvtmguCzYIbw3DvNtKrn_PyIpuY3vB4VExuNkw7YYanmGMwDulU1Fuc6zhaoedT3AUBCXryZfRdegDZ4C_lsKRLEMx3fhmdVyn'
  },
  {
    productId: 'artisan-sourdough',
    name: 'Artisan Sourdough',
    brand: 'Freshly Baked',
    quantity: '1 Loaf',
    price: 8,
    stockLabel: 'Only 2 Left',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1i_srdtLz-v-lKU1ZaVOLjgwHNPUor3F3EyC6s4YExz1pMTvbtm5KXgQg8sYN5Xte-cETfKpZMXpns5hWrpZYSBj2UD-AeI54udNdFzOyCcth83o_UVmcbDEN6NSQxOhwC0FtJ6XiDmLudujnfgpsu98HsjS5MaIZ6_3dIMcYeFKnhU3dX-hcRi5mDdWYY1kfLO6I9FsKud5q1mwpOyM_ewC7MmgbPj0Xux4S9fAfPmo5hkZgmVs2HuiXe5avyVufGnggqHeljW8s'
  },
  {
    productId: 'single-origin-arabica',
    name: 'Single Origin Arabica',
    brand: 'Ethically Sourced',
    quantity: '350g Bag',
    price: 22,
    stockLabel: 'In Stock',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDs-6-loikjXEHt--7uzlFhHYckybgs6Q-lr9b-QErZ5WwDPc_eRDmL9LBnkV8pwvEFa2AsrFBucfzjJOSKvS2iJo7fpz-ZibKUEg9mJ-IAfxy85m6Xcp62AGALMJA_qYDKo1WFNVqtNT-I1-evWYX3SRdNaqXjvRlaviDW7GXVU73wHWuvZva2-NfcorN1XHl0ylxF7r1KD28oBPXCdnG3WiI98BtQtYCRzV8NXvYLOuRwsE-m2CsFzeCfCtUtcOL9gi4MITUyYSCr'
  },
  {
    productId: 'cold-pressed-green-juice',
    name: 'Cold-Pressed Green Juice',
    brand: 'Superfood',
    quantity: '300ml Bottle',
    price: 6.5,
    originalPrice: 8,
    badge: 'SALE',
    badgeTone: 'fresh',
    stockLabel: 'In Stock',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS7LVpLJngaGd7gTrSTWDZ7mAjIhrISgGvIP1hisPESqJ-ZvAKYkmKu4OpKN46OCU3R0r766MYsZ-e5Fr6ArR9mKlUoSuDTYCuJNf3kX2Yaq9G9YVC0zh3PM0nJSkIIi1Fqgpvc8usxZSsPAa58xRrX3TnAvrCTQrl1BmMOKTwUOIgZxuhiucnglxOl3YgHZFrwJkGIBq16p4BLyHNkt0MorViaknGI4gSzxLJlDtwxlexc4oCN-IH2WlPHxd6tytEJW_m7VkpvTXm'
  }
];

export const cartLines: CartLine[] = [
  {
    productId: 'organic-dino-kale',
    name: 'Organic Dino Kale',
    brand: 'Organic Valley',
    quantity: '250g bunch',
    price: 4.99,
    quantityInCart: 1,
    stockLabel: 'In stock - Delivery in 15 mins',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzJVH3uc3SFpH-hNDdvCi4XMJFFRmll42KhwclWOuiHgUuJNzKMjlrsJn4lVAHgNvjV9nkGM_dP_CzAHXe0ALKu_lIKUYdk9krQAFYYbOoJwHSuVF0O9hCH8O36rZtA4RkZuwaqDgi2cR01amVRvRbN1eaJBlx_5XPw3B8uUDN-CQuiYwFdI897NxaUwYRfELv016N6xyjlgvHCD69GsOrDkgMJohfMmfFrWXR74w49mKAE2Y1TbB7P3bkX_yD8NiV3qqDEtQZTt9l'
  },
  {
    productId: 'whole-grass-fed-milk',
    name: 'Whole Grass-Fed Milk',
    brand: 'Organic Valley',
    quantity: '1L Bottle',
    price: 6.49,
    quantityInCart: 2,
    stockLabel: 'In stock - Delivery in 12 mins',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuPai1VbfcGA5BdQw0R89dLuFpF83jVBUYz_fHOHhJE9onmZ9rE_WSyyZmxGbUY5773kYTnCHRvTVBMRGI85ae3PitKABE8AWLz2NNAY7H0iqNfSHWBSe7GMO_6TdcjuT9pGpzH_vHN0od78-NcF3eJ9g0-Bq8sqZH8r7GNiBtf2ufCZCiIGzqc-dYFKsMbpnZG13NH8HV2bLEge4h5G8OxTm0cNAMyjIe10yDNwVM18MGnEaIkSdYij5rBV-MyWWNGRye4C29I2mC'
  },
  {
    productId: 'artisanal-sourdough',
    name: 'Artisanal Sourdough',
    brand: 'FreshMart Bakery',
    quantity: '1 Loaf',
    price: 5.5,
    quantityInCart: 1,
    stockLabel: 'In stock - Delivery in 20 mins',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnmseg0MAjt1dIqAUCKqL-rwFsTJ6nAqZslw69ROEYpM4j3qOfzE6kJBe7UfowC7CP7qfP3KmTymmIaO2_skOHDxvbnjXepKGBt2lM6vksSjRRUIJx19g54R-nWYalOtbkjI6mnxFBqm5Zc044gKi_5rCccwDOZ3_unN4jOpGF-fNUxE63vREoTLLSj5fPvKdBTbs2mvxweyOdaLRPutz4x5ujQqUoiplhro5av7Q37pZT_-SAtf3Hzb_MI4skcFeW9h75RqMM9Iui'
  }
];

export const savedAddresses: AddressView[] = [];

export const productDetail = {
  product: {
    productId: 'organic-heritage-strawberries',
    name: 'Organic Heritage Strawberries',
    brand: "Nature's Harvest Farms",
    quantity: '400g Pack',
    price: 8.5,
    originalPrice: 10,
    badge: '15% OFF',
    badgeTone: 'sale' as const,
    rating: 4.8,
    reviewCount: '128',
    stockLabel: 'In Stock',
    deliveryTime: 'Arriving today by 6:00 PM',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuecVWM6WqEpgzQxhU5Iv1RxAa9doHt0NKgnq1Urzc-07VFKrInNJrqLR3eH-4Nh7oh8udkS1KAUToGjVK_LkPrEHYl_cQQmYd-kVeWxQpOQ2T9QeoheKfmE3DkoYKYsE39RNynqlYq-HwCoIVInkgYzZ9YXo5p2yUI2PvBAi6Ti8KOp26D7nD8_8djkHGPRYL-1uBMFjP7IJx3qBt4ahRN0cD524-GvwkWuCK_jerhqplJswLPo59_o_RfoFC68gGm7crCKN420Q4'
  },
  gallery: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAlNwU_x8VyufENGflxJ4qg4WuMJ6T5EORAg4EvGI4w3Dr4VOPq4RM6z-efMUAQWLP0I4r0vnrti7-ozui9ncG8m4Iv6k2HXfxTjdlizjhE1UviMxqxxSWUVwaVHnRH_12VHVJE3psdUf1hPUybvqJcc1_f6qkR0_PFh89qrbmRSieDf5QSYhd5iHBRZpDzAR7TMOb1nxkB49944DER42jMIXeuMkuvx5OtSR9FN1Pqq6bENdXu_B9uxQC8HF6AuCTrELrUAZEhSmw9',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCX3xjjg175v7sfKdKqZs7C4EDJBAE5ImfWM3uQW3klSPqH6iRLTP3ypV3aVr7Dp4GfvXahMx39lgjvyWle88BeNn5JFbP7wf9U0b8QYyu3-V0jKjC8yOG8yZyzJwiq8CAMgLK7QGg5yvIEKv301-AzfT9Rb8hE5vuRSwF_wYQJHe8Ht41o92Dc6OZdYKpNMtZS4hpMwVxCdKRwN7OC74C4Gxwh1GJLDBG_8tlvR787URi3-WZhhW47Obw7XdWS_KmD35qsFcTe1RP4',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCNtn_F2QV0U4lH63DGsp-rl1akf-xjFOdqvvWcK0F7kC_EZlL8a6tsPICiJ0-ELIRUwxPA1o2JzV9xtlERaEyDcPgPDDsoqdyTN7WsiQeY21Wi0-YeaUTdBprMGZAbl2wcBh4kgU1-5pWy6Jaa9l4TsPUg-HFsibmpi-oKB_Y3xxGz9FnLuetPv61W7o-aZ9T_njVeIS0zpTzG5PtrnxxY45ITMnqf8HgiLo4zJ2zh6lj4HqvXchjhrWg71uqTR1iIiHsUBf-OCNS7',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCm4QD5FiraoWwl_j9gQB5ELfaeVgJgWXgSPWoUgDqa6Q8lVFOm865Voz0nWjuYuirz3A8XHi9UjiB-IxYKGsgKr0j6rieARL6uC3IGffhk72YfvAWvsBKPVKUlAc_YQrwnEjnGEXo-81yZWDZV2kSzjfpFsfXuErmKI5fLRpPbtfM-4eM4d-yxEgxOTxqA2fMiYkk83_dJH8RQBqoYnjp0Ia8KVcAAkr9EGt43G5xPMwBPtDgboCulMfAOe5DwtAOyvoEKPVtps983'
  ],
  similar: [
    { ...categoryProducts[2], productId: 'organic-blueberries', name: 'Organic Blueberries', price: 6.2 },
    { ...wishlistProducts[0], productId: 'heritage-raspberries', name: 'Heritage Raspberries', price: 9, originalPrice: undefined },
    { ...categoryProducts[2], productId: 'wild-blackberries', name: 'Wild Blackberries', price: 7.5 },
    { ...categoryProducts[3], productId: 'organic-gala-apples', name: 'Organic Gala Apples', price: 4.2 }
  ]
};

export const orderConfirmationProducts: CommerceProduct[] = [
  { ...cartLines[1], productId: 'organic-bananas', name: 'Organic Bananas', price: 1.2, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuvUYesLfvjg3xElbXJJskAl7tFngEcR8igDJRdmsc-vX-bwMEKwMhI9RBq24eCiw3q6Srd9j-tBb7yh2DIrc2yzTlEIfL1JAEjXIsmLOl5v2MCp3fTO_ByG3FoaX_K-OQkBbcNi_XapA5pA7RPgpelqcEmkDVpsizh1ImQrudWBSa-max7fbKb6TAS9Oyf2UcsK0ano3TwGLd7hN9JO3gOasVngaReHimybyyLvhlb-x82sTzTT-WUg3ZS_OnFDdVIvEMYeAh9lkd' },
  { ...cartLines[1], productId: 'whole-milk-1l', name: 'Whole Milk 1L', price: 3.5 },
  { ...cartLines[2], productId: 'sourdough-loaf', name: 'Sourdough Loaf', price: 5.9 }
];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const text = (record: Record<string, unknown>, keys: string[], fallback = '') =>
  keys.map((key) => record[key]).find((value): value is string => typeof value === 'string' && value.length > 0) ?? fallback;

const numberValue = (record: Record<string, unknown>, keys: string[], fallback = 0) =>
  keys.map((key) => record[key]).find((value): value is number => typeof value === 'number' && Number.isFinite(value)) ?? fallback;

const CART_STORAGE_KEY = 'freshmart_active_cart_v1';

export const getStoredCart = (): CartLine[] => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as CartLine[];
      }
    }
  } catch (_) {
    // Fallback if localStorage is unavailable
  }
  return [];
};

export const saveStoredCart = (items: CartLine[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (_) {
    // Storage quota fallback
  }
};

export const addOrUpdateStoredCartItem = (newItem: Record<string, unknown>): CartLine[] => {
  const current = getStoredCart();
  const productId = String(newItem.productId || newItem.id || `prod-${Date.now()}`);
  const existingIdx = current.findIndex((item) => item.productId === productId);

  let updated: CartLine[];
  if (existingIdx >= 0) {
    const target = current[existingIdx];
    const newQty = typeof newItem.quantity === 'number' ? newItem.quantity : (target.quantityInCart + 1);
    const newImg = typeof newItem.imageUrl === 'string' && newItem.imageUrl.length > 0 ? newItem.imageUrl : target.imageUrl;
    updated = current.map((item, idx) =>
      idx === existingIdx ? { ...item, quantityInCart: newQty, imageUrl: newImg } : item
    );
  } else {
    const fullItem: CartLine = {
      productId,
      name: String(newItem.name || newItem.productName || 'FreshMart Organic Product'),
      brand: String(newItem.brand || 'FreshMart'),
      quantity: String(newItem.quantity || '1 Unit'),
      price: Number(newItem.price ?? 4.99),
      originalPrice: typeof newItem.originalPrice === 'number' ? newItem.originalPrice : undefined,
      imageUrl: typeof newItem.imageUrl === 'string' && newItem.imageUrl.length > 0 ? newItem.imageUrl : 'https://lh3.googleusercontent.com/aida-public/b01cfbf2eb5d4e1fa429ed3ee7964b91/product-placeholder.png',
      quantityInCart: typeof newItem.quantity === 'number' ? newItem.quantity : 1,
      stockLabel: 'In stock - Delivery in 15 mins'
    };
    updated = [...current, fullItem];
  }

  saveStoredCart(updated);
  return updated;
};

export const removeStoredCartItem = (productId: string): CartLine[] => {
  const current = getStoredCart();
  const updated = current.filter((item) => item.productId !== productId);
  saveStoredCart(updated);
  return updated;
};

export const mergeProducts = (remote: unknown, fallback: CommerceProduct[]): CommerceProduct[] => {
  const items = Array.isArray(remote)
    ? remote
    : isRecord(remote) && Array.isArray(remote.items)
      ? remote.items
      : isRecord(remote) && Array.isArray(remote.products)
        ? remote.products
        : [];

  if (items.length === 0) return fallback;

  return items.filter(isRecord).map((item, index) => {
    const visual = fallback[index % fallback.length] ?? fallback[0];
    return {
      ...visual,
      productId: text(item, ['productId', 'id', 'sku'], visual.productId),
      name: text(item, ['name', 'productName', 'title'], visual.name),
      brand: text(item, ['brand', 'brandName', 'vendor'], visual.brand),
      quantity: text(item, ['quantity', 'packSize', 'unit'], visual.quantity),
      price: numberValue(item, ['price', 'salePrice', 'amount'], visual.price),
      originalPrice: numberValue(item, ['originalPrice', 'mrp', 'listPrice'], visual.originalPrice ?? 0) || visual.originalPrice,
      imageUrl: text(item, ['imageUrl', 'image', 'thumbnailUrl'], visual.imageUrl)
    };
  });
};

export const mergeCart = (remote: unknown): CartLine[] => {
  const data = isRecord(remote) && isRecord(remote.cart) ? remote.cart : remote;
  const items = isRecord(data) && Array.isArray(data.items) ? data.items : [];
  if (items.length === 0) return getStoredCart();

  const merged = mergeProducts(items, getStoredCart()).map((product, index) => ({
    ...product,
    quantityInCart: isRecord(items[index]) ? numberValue(items[index], ['quantity', 'quantityInCart'], 1) : 1
  }));

  saveStoredCart(merged);
  return merged;
};

export const mergeAddresses = (remote: unknown): AddressView[] => {
  const profile = isRecord(remote) && isRecord(remote.user) ? remote.user : remote;
  const addresses = isRecord(profile) && Array.isArray(profile.addresses) ? profile.addresses : [];
  if (addresses.length === 0) return [];

  return addresses.filter(isRecord).map((address, index) => {
    return {
      addressId: text(address, ['addressId', 'id'], `addr-${index}`),
      label: (text(address, ['label', 'type'], 'Home') as AddressView['label']),
      name: text(address, ['name', 'recipientName'], 'Valued Customer'),
      phone: text(address, ['phone', 'phoneNumber'], ''),
      lines: [text(address, ['line1'], ''), text(address, ['line2'], ''), text(address, ['landmark'], '')].filter(Boolean),
      city: text(address, ['city'], ''),
      state: text(address, ['state'], ''),
      postalCode: text(address, ['postalCode', 'pinCode'], ''),
      isDefault: Boolean(address.isDefault ?? index === 0)
    };
  });
};
