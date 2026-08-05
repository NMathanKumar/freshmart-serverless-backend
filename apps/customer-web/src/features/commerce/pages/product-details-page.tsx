import { Suspense, useState } from 'react';
import { ChevronRight, Heart, Minus, Plus, ShoppingBag, Star, Truck, ShieldCheck, ZoomIn, ChevronLeft, Leaf, Sparkles, Sun, Package } from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { useParams, Link } from 'react-router-dom';
import { useGetProductDetailsQuery, useUpdateCartItemMutation } from '../api/commerce-api.js';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';
import { CommerceProductCard } from '../components/commerce-product-card.js';

const SAMPLE_PRODUCT = {
  productId: 'prod-strawberries-1',
  name: 'Organic Heritage Strawberries',
  brand: "Nature's Harvest Farms",
  rating: 4.9,
  reviewCount: 128,
  stockLabel: 'In Stock',
  price: 8.50,
  originalPrice: 10.00,
  unitWeight: '400g pack ($0.85/100g)',
  badge: '15% OFF',
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR'
};

const SAMPLE_GALLERY = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCSHaELNOhgX7mXWpkTZoBd8EkjiC2gtiPjn00f0mfjjc35_Do4_8Cy5vfaZ00jCjl_LWa_yqs1YWNNxfKG-47zOk6_uc4o68CzFG_6qcXMcdsDVDl_SyzMzXoPgwzJXcSlEVxzUTctK3lNfyPPIhPNxdF9p3-VLXrfZOpRAlbQ8V_eSjtPAmHqEI4QEygGblDnpdLD1BIr84P3DEYq4457nmGfVawMGFAmdA0Sx86DswR32pk7VCPiD5p8M9i4wnqts7_21AyM6I6S',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA-8ZKxMuvb9QVdjRnKXyn-bmUF69PYQ5gWY2M8ofX8H15-hmkg8-Gy-qHR61k7JtnnVXh0JF7KRg0XbNdLeLtRYR0G-xZpY9RiUPqL8qFvdL9Sp-Axe1JpioUqZnCOyw_xkiBbtnq4PKTIO-9B6bZ_Muj4HirdjRXta4ycEsR1xOPMARFTJ4AC5WVY5yZbXglG-7V9upqCvyqtUT3kFfCrcwaLkmpmB1REpl05m6AtigOrnjL4cpAY8P4SDTpYFsOlnJyXkgQpo17u',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR'
];

const LOOKUP_PRODUCTS: Record<string, {
  productId: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  unitWeight: string;
  badge?: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  stockLabel: string;
  gallery: string[];
  descriptionTitle: string;
  descriptionText: string;
  calories: string;
  vitaminC: string;
  sugars: string;
  fiber: string;
}> = {
  'prod-strawberries-1': {
    productId: 'prod-strawberries-1',
    name: 'Organic Heritage Strawberries',
    brand: "Nature's Harvest Farms",
    price: 8.50,
    originalPrice: 10.00,
    unitWeight: '400g pack ($0.85/100g)',
    badge: '15% OFF',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR',
    rating: 4.9,
    reviewCount: 128,
    stockLabel: 'In Stock',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSHaELNOhgX7mXWpkTZoBd8EkjiC2gtiPjn00f0mfjjc35_Do4_8Cy5vfaZ00jCjl_LWa_yqs1YWNNxfKG-47zOk6_uc4o68CzFG_6qcXMcdsDVDl_SyzMzXoPgwzJXcSlEVxzUTctK3lNfyPPIhPNxdF9p3-VLXrfZOpRAlbQ8V_eSjtPAmHqEI4QEygGblDnpdLD1BIr84P3DEYq4457nmGfVawMGFAmdA0Sx86DswR32pk7VCPiD5p8M9i4wnqts7_21AyM6I6S',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA-8ZKxMuvb9QVdjRnKXyn-bmUF69PYQ5gWY2M8ofX8H15-hmkg8-Gy-qHR61k7JtnnVXh0JF7KRg0XbNdLeLtRYR0G-xZpY9RiUPqL8qFvdL9Sp-Axe1JpioUqZnCOyw_xkiBbtnq4PKTIO-9B6bZ_Muj4HirdjRXta4ycEsR1xOPMARFTJ4AC5WVY5yZbXglG-7V9upqCvyqtUT3kFfCrcwaLkmpmB1REpl05m6AtigOrnjL4cpAY8P4SDTpYFsOlnJyXkgQpo17u',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR'
    ],
    descriptionTitle: 'Sun-Ripened Heritage Berries',
    descriptionText: 'Grown in the nutrient-rich volcanic soil of our partner organic farms, these Heritage Strawberries are allowed to ripen fully on the vine, ensuring an unmatched sweetness and deep aromatic profile.',
    calories: '32 kcal',
    vitaminC: '98% DV',
    sugars: '4.9g',
    fiber: '2.0g'
  },
  'sim-1': {
    productId: 'sim-1',
    name: 'Organic Blueberries',
    brand: 'Organic Farms Network',
    price: 4.50,
    originalPrice: 5.50,
    unitWeight: '125g punnet ($3.60/100g)',
    badge: 'FRESH HARVEST',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSHaELNOhgX7mXWpkTZoBd8EkjiC2gtiPjn00f0mfjjc35_Do4_8Cy5vfaZ00jCjl_LWa_yqs1YWNNxfKG-47zOk6_uc4o68CzFG_6qcXMcdsDVDl_SyzMzXoPgwzJXcSlEVxzUTctK3lNfyPPIhPNxdF9p3-VLXrfZOpRAlbQ8V_eSjtPAmHqEI4QEygGblDnpdLD1BIr84P3DEYq4457nmGfVawMGFAmdA0Sx86DswR32pk7VCPiD5p8M9i4wnqts7_21AyM6I6S',
    rating: 4.9,
    reviewCount: 120,
    stockLabel: 'In Stock',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSHaELNOhgX7mXWpkTZoBd8EkjiC2gtiPjn00f0mfjjc35_Do4_8Cy5vfaZ00jCjl_LWa_yqs1YWNNxfKG-47zOk6_uc4o68CzFG_6qcXMcdsDVDl_SyzMzXoPgwzJXcSlEVxzUTctK3lNfyPPIhPNxdF9p3-VLXrfZOpRAlbQ8V_eSjtPAmHqEI4QEygGblDnpdLD1BIr84P3DEYq4457nmGfVawMGFAmdA0Sx86DswR32pk7VCPiD5p8M9i4wnqts7_21AyM6I6S',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR'
    ],
    descriptionTitle: 'Antioxidant-Rich Wild Blueberries',
    descriptionText: 'Hand-picked from certified organic wild berry patches. Bursting with natural antioxidants, deep purple pigment, and a tart-sweet flavor profile perfect for breakfasts, smoothies, and snacking.',
    calories: '57 kcal',
    vitaminC: '24% DV',
    sugars: '9.9g',
    fiber: '2.4g'
  },
  'sim-2': {
    productId: 'sim-2',
    name: 'Heritage Raspberries',
    brand: 'Valley Fresh Orchards',
    price: 5.20,
    originalPrice: 6.00,
    unitWeight: '150g punnet ($3.46/100g)',
    badge: 'ORGANIC',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR',
    rating: 4.8,
    reviewCount: 85,
    stockLabel: 'In Stock',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR'
    ],
    descriptionTitle: 'Sweet & Delicate Raspberries',
    descriptionText: 'Delicate, fragrant red raspberries grown in coastal fog belts. Soft, velvety texture with a fragrant floral aroma and balanced acidity.',
    calories: '52 kcal',
    vitaminC: '44% DV',
    sugars: '4.4g',
    fiber: '6.5g'
  },
  'sim-3': {
    productId: 'sim-3',
    name: 'Wild Blackberries',
    brand: 'Pure Orchard Organics',
    price: 7.50,
    originalPrice: 8.50,
    unitWeight: '200g punnet ($3.75/100g)',
    badge: 'WILD PICK',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-8ZKxMuvb9QVdjRnKXyn-bmUF69PYQ5gWY2M8ofX8H15-hmkg8-Gy-qHR61k7JtnnVXh0JF7KRg0XbNdLeLtRYR0G-xZpY9RiUPqL8qFvdL9Sp-Axe1JpioUqZnCOyw_xkiBbtnq4PKTIO-9B6bZ_Muj4HirdjRXta4ycEsR1xOPMARFTJ4AC5WVY5yZbXglG-7V9upqCvyqtUT3kFfCrcwaLkmpmB1REpl05m6AtigOrnjL4cpAY8P4SDTpYFsOlnJyXkgQpo17u',
    rating: 4.9,
    reviewCount: 94,
    stockLabel: 'In Stock',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA-8ZKxMuvb9QVdjRnKXyn-bmUF69PYQ5gWY2M8ofX8H15-hmkg8-Gy-qHR61k7JtnnVXh0JF7KRg0XbNdLeLtRYR0G-xZpY9RiUPqL8qFvdL9Sp-Axe1JpioUqZnCOyw_xkiBbtnq4PKTIO-9B6bZ_Muj4HirdjRXta4ycEsR1xOPMARFTJ4AC5WVY5yZbXglG-7V9upqCvyqtUT3kFfCrcwaLkmpmB1REpl05m6AtigOrnjL4cpAY8P4SDTpYFsOlnJyXkgQpo17u'
    ],
    descriptionTitle: 'Sun-Ripened Wild Blackberries',
    descriptionText: 'Large, glossy black berries harvested at peak sweetness. Packed with dietary fiber, Vitamin K, and natural phytonutrients.',
    calories: '43 kcal',
    vitaminC: '35% DV',
    sugars: '4.9g',
    fiber: '5.3g'
  },
  'sim-4': {
    productId: 'sim-4',
    name: 'Organic Gala Apples',
    brand: 'Harvest Select',
    price: 6.49,
    originalPrice: 7.99,
    unitWeight: '6 Pack (Seasonal)',
    badge: 'CRISP',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR',
    rating: 4.7,
    reviewCount: 110,
    stockLabel: 'In Stock',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR'
    ],
    descriptionTitle: 'Sweet & Crisp Organic Gala Apples',
    descriptionText: 'Sweet, juicy Gala apples with a thin red-striped skin and dense, crunchy texture. Naturally rich in pectin and Vitamin C.',
    calories: '52 kcal',
    vitaminC: '14% DV',
    sugars: '10.3g',
    fiber: '2.4g'
  }
};

const SIMILAR_FRUITS = [
  {
    productId: 'sim-1',
    name: 'Organic Blueberries',
    brand: 'Organic Farms',
    quantity: '125g / punnet',
    price: 4.50,
    rating: 4.9,
    reviewCount: '120 reviews',
    badge: 'FRESH',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSHaELNOhgX7mXWpkTZoBd8EkjiC2gtiPjn00f0mfjjc35_Do4_8Cy5vfaZ00jCjl_LWa_yqs1YWNNxfKG-47zOk6_uc4o68CzFG_6qcXMcdsDVDl_SyzMzXoPgwzJXcSlEVxzUTctK3lNfyPPIhPNxdF9p3-VLXrfZOpRAlbQ8V_eSjtPAmHqEI4QEygGblDnpdLD1BIr84P3DEYq4457nmGfVawMGFAmdA0Sx86DswR32pk7VCPiD5p8M9i4wnqts7_21AyM6I6S'
  },
  {
    productId: 'sim-2',
    name: 'Heritage Raspberries',
    brand: 'Valley Fresh',
    quantity: '150g / punnet',
    price: 5.20,
    rating: 4.8,
    reviewCount: '85 reviews',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR'
  },
  {
    productId: 'sim-3',
    name: 'Wild Blackberries',
    brand: 'Pure Orchard',
    quantity: '200g / punnet',
    price: 7.50,
    rating: 4.9,
    reviewCount: '94 reviews',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-8ZKxMuvb9QVdjRnKXyn-bmUF69PYQ5gWY2M8ofX8H15-hmkg8-Gy-qHR61k7JtnnVXh0JF7KRg0XbNdLeLtRYR0G-xZpY9RiUPqL8qFvdL9Sp-Axe1JpioUqZnCOyw_xkiBbtnq4PKTIO-9B6bZ_Muj4HirdjRXta4ycEsR1xOPMARFTJ4AC5WVY5yZbXglG-7V9upqCvyqtUT3kFfCrcwaLkmpmB1REpl05m6AtigOrnjL4cpAY8P4SDTpYFsOlnJyXkgQpo17u'
  },
  {
    productId: 'sim-4',
    name: 'Organic Gala Apples',
    brand: 'Harvest Select',
    quantity: '6 Pack (Seasonal)',
    price: 6.49,
    rating: 4.7,
    reviewCount: '110 reviews',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR'
  }
];

const ProductDetailsContent = () => {
  const { productId } = useParams();
  const { data } = useGetProductDetailsQuery(productId);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'nutrition' | 'reviews'>('description');
  const [addToCart, addState] = useUpdateCartItemMutation();

  // Dynamic Product Resolver for ANY clicked product
  const matched = productId ? LOOKUP_PRODUCTS[productId] : undefined;

  const product = matched ?? {
    productId: productId ?? SAMPLE_PRODUCT.productId,
    name: data?.product?.name ?? SAMPLE_PRODUCT.name,
    brand: data?.product?.brand ?? SAMPLE_PRODUCT.brand,
    rating: data?.product?.rating ?? SAMPLE_PRODUCT.rating,
    reviewCount: Number(data?.product?.reviewCount ?? SAMPLE_PRODUCT.reviewCount),
    stockLabel: data?.product?.stockLabel ?? SAMPLE_PRODUCT.stockLabel,
    price: data?.product?.price ?? SAMPLE_PRODUCT.price,
    originalPrice: data?.product?.originalPrice ?? SAMPLE_PRODUCT.originalPrice,
    unitWeight: SAMPLE_PRODUCT.unitWeight,
    badge: data?.product?.badge ?? SAMPLE_PRODUCT.badge,
    imageUrl: data?.product?.imageUrl ?? SAMPLE_PRODUCT.imageUrl,
    gallery: data?.gallery && data.gallery.length > 0 ? data.gallery : SAMPLE_GALLERY,
    descriptionTitle: 'Sun-Ripened Heritage Berries',
    descriptionText: 'Grown in the nutrient-rich volcanic soil of our partner organic farms, these Heritage Strawberries are allowed to ripen fully on the vine, ensuring an unmatched sweetness and deep aromatic profile.',
    calories: '32 kcal',
    vitaminC: '98% DV',
    sugars: '4.9g',
    fiber: '2.0g'
  };

  const gallery = matched?.gallery ?? (data?.gallery && data.gallery.length > 0 ? data.gallery : SAMPLE_GALLERY);
  const similar = data?.similar && data.similar.length > 0 ? data.similar : SIMILAR_FRUITS;

  const mainImage = gallery[activeImage] ?? product.imageUrl;

  return (
    <div className="min-h-screen bg-[#f4fcf0] text-[#171d16] font-sans">
      <HomeHeader variant="cart" />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pb-16 pt-24 space-y-8">

        {/* Category Breadcrumb Nav */}
        <nav className="flex items-center gap-2 text-xs font-bold text-[#8b9888]">
          <Link className="hover:text-[#006b2c]" to="/">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link className="hover:text-[#006b2c]" to="/categories">Groceries</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#006b2c] font-black">{product.name}</span>
        </nav>

        {/* Top Section: Gallery & Purchase Details */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-start">

          {/* Left Column: Thumbnails + Main Showcase Image */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Thumbnails Row */}
            <div className="flex sm:flex-col gap-3 order-2 sm:order-1 overflow-x-auto sm:overflow-visible">
              {gallery.slice(0, 4).map((imgUrl, idx) => (
                <button
                  key={idx}
                  className={`h-18 w-18 sm:h-20 sm:w-20 rounded-2xl p-1 bg-white border-2 transition-all overflow-hidden shrink-0 cursor-pointer ${
                    activeImage === idx ? 'border-[#006b2c] shadow-xs' : 'border-[#e2ebdE] hover:border-[#bdcaba]'
                  }`}
                  onClick={() => setActiveImage(idx)}
                  type="button"
                >
                  <img alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-contain mix-blend-multiply" src={imgUrl} />
                </button>
              ))}
            </div>

            {/* Main Showcase Image */}
            <div className="order-1 sm:order-2 flex-1 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs relative flex items-center justify-center min-h-[380px] sm:min-h-[460px]">
              {/* Badges */}
              <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                <span className="rounded-full bg-[#fce4e8] px-3 py-1 text-xs font-black text-rose-700">
                  15% OFF
                </span>
                <span className="rounded-full bg-[#006b2c] px-3 py-1 text-xs font-black text-white flex items-center gap-1">
                  <Leaf className="h-3 w-3" />
                  <span>Organic</span>
                </span>
              </div>

              {/* Main Image */}
              <img alt={product.name} className="max-h-[380px] w-full object-contain mix-blend-multiply transition-all duration-300" src={mainImage} />

              {/* Zoom Glass Button */}
              <button className="absolute bottom-5 right-5 h-10 w-10 rounded-full bg-white border border-[#e2ebdE] shadow-sm flex items-center justify-center text-[#006b2c] hover:bg-[#eff6ea] transition-all" type="button">
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Product Purchase Card */}
          <div className="rounded-[28px] border border-[#e2ebdE] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#171d16] tracking-tight">{product.name}</h1>
              <p className="text-xs font-extrabold text-[#8b9888] mt-1">
                By <a className="text-[#006b2c] hover:underline" href="#farm">Nature's Harvest Farms</a>
              </p>
            </div>

            {/* Rating & Stock Row */}
            <div className="flex items-center gap-3 text-xs font-extrabold">
              <span className="flex items-center gap-1 rounded-lg bg-[#eff6ea] px-2.5 py-1 text-[#006c4a]">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{product.rating ?? 4.9}</span>
              </span>
              <span className="text-[#8b9888]">{product.reviewCount ?? 128} Reviews</span>
              <span className="text-[#e2ebdE]">•</span>
              <span className="text-[#006c4a] font-black">{product.stockLabel ?? 'In Stock'}</span>
            </div>

            {/* Pricing Section */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-[#171d16]">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-lg font-bold text-[#8b9888] line-through">${product.originalPrice.toFixed(2)}</span>
                )}
              </div>
              <p className="text-xs font-semibold text-[#8b9888]">
                Price per {product.unitWeight}
              </p>
            </div>

            {/* Quantity & CTA Row */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center gap-2 rounded-2xl border border-[#bdcaba]/60 bg-[#f8fbf5] px-3 py-2 shadow-xs">
                  <button aria-label="Decrease quantity" className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-[#171d16] shadow-xs hover:bg-[#eff6ea] transition-all cursor-pointer" onClick={() => setQuantity(Math.max(1, quantity - 1))} type="button">
                    <Minus className="h-3.5 w-3.5 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center text-sm font-black text-[#171d16]">{quantity}</span>
                  <button aria-label="Increase quantity" className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-[#171d16] shadow-xs hover:bg-[#eff6ea] transition-all cursor-pointer" onClick={() => setQuantity(quantity + 1)} type="button">
                    <Plus className="h-3.5 w-3.5 stroke-[3]" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="flex-1 h-12 rounded-2xl bg-[#006b2c] text-xs font-extrabold text-white shadow-md hover:bg-[#005422] transition-all flex items-center justify-center gap-2 active:scale-98"
                  disabled={addState.isLoading}
                  onClick={() => void addToCart({ productId: product.productId, quantity })}
                  type="button"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Cart</span>
                </Button>

                {/* Wishlist Heart Button */}
                <button className="h-12 w-12 rounded-2xl border border-[#bdcaba]/60 bg-white flex items-center justify-center text-[#8b9888] hover:text-rose-600 hover:border-rose-300 transition-all shadow-xs cursor-pointer" type="button">
                  <Heart className="h-5 w-5" />
                </button>
              </div>

              {/* Buy Now Button */}
              <Button className="w-full h-12 rounded-2xl bg-[#171d16] text-xs font-extrabold text-white hover:bg-black transition-all shadow-xs cursor-pointer" type="button">
                Buy Now
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-[#e2ebdE] pt-5 space-y-3">
              <div className="flex items-center gap-3 text-xs font-extrabold text-[#3e4a3d]">
                <div className="h-9 w-9 rounded-full bg-[#eff6ea] flex items-center justify-center text-[#006b2c]">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[#171d16]">Express Delivery</span>
                  <span className="text-[11px] font-semibold text-[#8b9888]">Arriving today by 4:30 PM</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-extrabold text-[#3e4a3d]">
                <div className="h-9 w-9 rounded-full bg-[#eff6ea] flex items-center justify-center text-[#006b2c]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[#171d16]">Freshness Guaranteed</span>
                  <span className="text-[11px] font-semibold text-[#8b9888]">100% refund if not satisfied on delivery</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Section 2: Details Tabs & Nutritional Summary Card */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start pt-4">

          {/* Left Column: Description Tabs & Content */}
          <div className="space-y-6">

            {/* Tabs Row */}
            <div className="flex items-center gap-6 border-b border-[#e2ebdE] text-sm font-extrabold">
              <button
                className={`pb-3 transition-all cursor-pointer ${
                  activeTab === 'description' ? 'border-b-2 border-[#006b2c] text-[#006b2c]' : 'text-[#8b9888] hover:text-[#171d16]'
                }`}
                onClick={() => setActiveTab('description')}
                type="button"
              >
                Description
              </button>
              <button
                className={`pb-3 transition-all cursor-pointer ${
                  activeTab === 'specifications' ? 'border-b-2 border-[#006b2c] text-[#006b2c]' : 'text-[#8b9888] hover:text-[#171d16]'
                }`}
                onClick={() => setActiveTab('specifications')}
                type="button"
              >
                Specifications
              </button>
              <button
                className={`pb-3 transition-all cursor-pointer ${
                  activeTab === 'nutrition' ? 'border-b-2 border-[#006b2c] text-[#006b2c]' : 'text-[#8b9888] hover:text-[#171d16]'
                }`}
                onClick={() => setActiveTab('nutrition')}
                type="button"
              >
                Nutritional Info
              </button>
              <button
                className={`pb-3 transition-all cursor-pointer ${
                  activeTab === 'reviews' ? 'border-b-2 border-[#006b2c] text-[#006b2c]' : 'text-[#8b9888] hover:text-[#171d16]'
                }`}
                onClick={() => setActiveTab('reviews')}
                type="button"
              >
                Reviews ({product.reviewCount ?? 128})
              </button>
            </div>

            {/* Description Body */}
            <div className="space-y-4">
              <h2 className="text-lg font-black text-[#171d16]">{product.descriptionTitle}</h2>
              <p className="text-xs sm:text-sm font-semibold text-[#8b9888] leading-relaxed">
                {product.descriptionText}
              </p>

              {/* 4 Feature Bullet Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#171d16]">
                  <Leaf className="h-4 w-4 text-[#006b2c]" />
                  <span>Pesticide-free certification</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#171d16]">
                  <Sparkles className="h-4 w-4 text-[#006b2c]" />
                  <span>Hydro-cooled for maximum crispness</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#171d16]">
                  <Sun className="h-4 w-4 text-[#006b2c]" />
                  <span>Sustainably farmed using solar energy</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#171d16]">
                  <Package className="h-4 w-4 text-[#006b2c]" />
                  <span>100% compostable packaging</span>
                </div>
              </div>
            </div>

            {/* Frequently Bought Together Section */}
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-black text-[#171d16]">Frequently bought together</h3>
              <div className="rounded-[24px] border border-[#e2ebdE] bg-white p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-3">
                  <img alt={product.name} className="h-16 w-16 rounded-2xl border border-[#e2ebdE] object-contain p-1 mix-blend-multiply" src={mainImage} />
                  <span className="text-lg font-black text-[#8b9888]">+</span>
                  <img alt="Greek Yogurt" className="h-16 w-16 rounded-2xl border border-[#e2ebdE] object-contain p-1 mix-blend-multiply" src="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=120" />
                </div>

                <div className="flex items-center gap-4 text-center sm:text-right">
                  <div>
                    <span className="block text-[10px] font-bold text-[#8b9888]">Total bundle price</span>
                    <span className="text-base font-black text-[#171d16]">$16.20</span>
                    <span className="ml-1 text-xs font-bold text-[#8b9888] line-through">$19.50</span>
                  </div>
                  <Button className="h-10 rounded-xl bg-[#006b2c] px-4 text-xs font-black text-white hover:bg-[#005422] transition-all cursor-pointer" type="button">
                    Add 2 Items to Cart
                  </Button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Nutritional Summary Card */}
          <div className="rounded-[24px] bg-[#eff6ea] p-6 border border-[#bdcaba]/30 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#005320]">
              NUTRITIONAL SUMMARY (PER 100G)
            </h3>

            <div className="space-y-3 text-xs font-extrabold text-[#3e4a3d]">
              <div className="flex items-center justify-between border-b border-[#bdcaba]/30 pb-2">
                <span>Calories</span>
                <span className="text-[#171d16] font-black">{product.calories}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#bdcaba]/30 pb-2 text-[#006c4a]">
                <span>Vitamin C</span>
                <span className="font-black">{product.vitaminC}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#bdcaba]/30 pb-2">
                <span>Total Sugars</span>
                <span className="text-[#171d16] font-black">{product.sugars}</span>
              </div>
              <div className="flex items-center justify-between pb-1">
                <span>Fiber</span>
                <span className="text-[#171d16] font-black">{product.fiber}</span>
              </div>
            </div>

            <p className="text-[10px] font-semibold text-[#8b9888] leading-tight pt-2 border-t border-[#bdcaba]/30">
              *Daily Values (DV) are based on a 2,000 calorie diet.
            </p>
          </div>

        </div>

        {/* Section 3: Similar Premium Fruits Section */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#171d16]">Similar premium fruits</h2>
              <p className="text-xs font-bold text-[#8b9888] mt-0.5">
                Picked fresh from our organic network
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button className="h-8 w-8 rounded-full border border-[#bdcaba]/60 bg-white flex items-center justify-center text-[#171d16] hover:bg-[#eff6ea] transition-all" type="button">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="h-8 w-8 rounded-full border border-[#bdcaba]/60 bg-white flex items-center justify-center text-[#171d16] hover:bg-[#eff6ea] transition-all" type="button">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {similar.map((item) => (
              <CommerceProductCard key={item.productId} product={item} />
            ))}
          </div>
        </div>

      </main>

      <HomeFooter />
    </div>
  );
};

export default function ProductDetailsPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#f4fcf0]" />}><ProductDetailsContent /></Suspense>;
}
