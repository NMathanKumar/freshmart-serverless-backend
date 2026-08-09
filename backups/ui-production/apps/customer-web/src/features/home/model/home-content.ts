import type { CategorySummary, ProductSummary } from '@freshmart/api-sdk';

export interface ProductViewModel extends ProductSummary {
  name: string;
  imageUrl: string;
  quantity: string;
  badge?: string;
  badgeTone?: 'offer' | 'bestseller';
  originalPrice?: number;
  note?: string;
}

export interface CategoryViewModel extends CategorySummary {
  subtitle?: string;
  imageUrl?: string;
}

export const heroFallback = {
  title: 'Farm Fresh Organic Produce',
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-adUk9ZXoP0nwAjwNtfGOr5P5qjDPIVpu8m4Vdaa6rmvZfYCO8DrhUiWkCkEnkpBPf1hfACU0i6X4MHnjn7tn-qBqG7UElO4IZ5vYD0IWUdFEAe2ip_JZ7Yp1O9uS8XCIqy2c7zeTw-OaD5NBWTNh6gpnJ6MRMmOsn5Xp4t19iMDNLrTPk3eGmAMwiXK6Cn7VNBFe7yb3RUV4_NhlxvGXwNZ1vgb3V8NLRbAsu8FSsIwEUkSt1lvC2fVszOZFfpGkbLz5-M5Xbopo'
};

export const featuredCategoryImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2_wakJeNv8J9pfTbTOX4-gsPMKr3KGytLKmSlfe-86ba2RW0vUdLGKYMhUxzzfbk5vnmq82PVWfy92vftWzibGMVddgyIM7u6bJ7pt-dKqLK_jkC7juwpkJkT-YymjmU_xZqgynA4_ujqCQ-93OSVMeV558V8BNbMJXEsi7KBozG49ZxzLOWQ9mtL3D6AjS1Kg_Q3_RFGEzlVSHa--3h9Crwv_0Nf5kqSpmx4xyuXNRCuj5sr6buLdVgZTFZdM1kCKxxyg81cEXjH';

const productVisuals = [
  { imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR', quantity: '1 Litre', badge: '10% OFF', badgeTone: 'offer' as const, originalPrice: 5 },
  { imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSHaELNOhgX7mXWpkTZoBd8EkjiC2gtiPjn00f0mfjjc35_Do4_8Cy5vfaZ00jCjl_LWa_yqs1YWNNxfKG-47zOk6_uc4o68CzFG_6qcXMcdsDVDl_SyzMzXoPgwzJXcSlEVxzUTctK3lNfyPPIhPNxdF9p3-VLXrfZOpRAlbQ8V_eSjtPAmHqEI4QEygGblDnpdLD1BIr84P3DEYq4457nmGfVawMGFAmdA0Sx86DswR32pk7VCPiD5p8M9i4wnqts7_21AyM6I6S', quantity: 'Pack of 2' },
  { imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAocIVc-EoYCbFmS10USZQHrW2cBY3jC44RL3aegAleg9zH39V0IHSWwM6MIKPQO6ifSz4gqZNGdwbezCWTwpjY26PgUPmNirsv572TsUAyQLu6A8XrYc_0UG8v0nwTw-VYaT0SMJPhU_zb_d9e0nSrxGxXQbl6Lx_YXZsdI0Y_-NYBK5I62D_ProCKkx-hG1xm3k6nMB89NGrtr-8Z1cQoVuXM7LxVdoQLwhsZlw2KSjnxaqws6Q_tmOCTfNEAnRlce3LxYTMFdXYO', quantity: '400g', badge: 'BESTSELLER', badgeTone: 'bestseller' as const },
  { imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-8ZKxMuvb9QVdjRnKXyn-bmUF69PYQ5gWY2M8ofX8H15-hmkg8-Gy-qHR61k7JtnnVXh0JF7KRg0XbNdLeLtRYR0G-xZpY9RiUPqL8qFvdL9Sp-Axe1JpioUqZnCOyw_xkiBbtnq4PKTIO-9B6bZ_Muj4HirdjRXta4ycEsR1xOPMARFTJ4AC5WVY5yZbXglG-7V9upqCvyqtUT3kFfCrcwaLkmpmB1REpl05m6AtigOrnjL4cpAY8P4SDTpYFsOlnJyXkgQpo17u', quantity: '250g' }
];

const recommendationVisuals = [
  { imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVNTMlttKu2Hz7Unjegu948DLlY9waR6xqugQ631kofvTund94IrAi2wZb5g_3cK2nGc_Qtb9VYmlp683nRCi2AoK39GpgwYie1_quon7cRVkCfcjv5f8cx4WWmdawpRb1ElaEFk6URX0axMs2yYuLSTNFOnAPm0bYXr_OzTGeUVneZJx55tIMcpmjxBOKUrvI2H6CeYeifXokv1FLY6BQye9DFgqfU31UKb1v7IR61uTbLniSyvvVBqVVGCFoH2EOqNchgG8okWTu', quantity: '', badge: 'SMART BUNDLE', note: 'Save 15%' },
  { imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhywKt5hTZ28Mus6NPttJzxjiiCGFM_nZ0RhR79f_8dDhE8jN6udRc0hhjYOOg5IFpDmF313gNQS_OCdCptHrBprXGf1QUoFAazVXgnAyhOtS88kKAUffcT2zCBfTfWgqcQ3r5udcfdC_T95AN96Yk4_8VsHDlArKg1xvZJu6UGtZ_XuXODGoIowARuXN-bZGQ9Rju71pjMAD7olJsT6DEuVIiFwvQsYOzgmRK0e3fEExPmNCzBeQ8oB6HSOYOd8wjNjZbJHNRzx_H', quantity: '', badge: 'DAILY PICK', note: 'New in store' },
  { imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgxNDg0sUD2V6xNOGnaeJyn4D1feLmyElbF0cyOTGNJJvh9W2u9NKkJDFx6a-xvFUZp4Z47IV5R1gmCECaosToDCjn77NBGalhXojksMzVyzFn-9WBuUAqa7XPm78275TfPfk0UO3cT1h0zDTswTBvG-r1cL_Fj78C9L4LwysSSrV644Dy1LmS7sEdN4EqwxK15wOvb_bQthVRPmoG9TLZDitxC3vSSoFFsz7bWY1wE5Q2jdwguK3LxESuf4ARYAydHOywvFwcbuta', quantity: '', badge: 'SNACK HEALTHY', note: 'Highly rated' }
];

export const toTrendingProducts = (products: ProductSummary[]): ProductViewModel[] => products.map((product, index) => ({ ...product, name: product.productName, ...(productVisuals[index % productVisuals.length] ?? productVisuals[0]) }));
export const toRecommendedProducts = (products: ProductSummary[]): ProductViewModel[] => products.map((product, index) => ({ ...product, name: product.productName, ...(recommendationVisuals[index % recommendationVisuals.length] ?? recommendationVisuals[0]) }));
export const toCategories = (categories: CategorySummary[]): CategoryViewModel[] => categories.map((category, index) => index === 0 ? { ...category, subtitle: 'Daily Fresh Arrivals', imageUrl: featuredCategoryImage } : category);
