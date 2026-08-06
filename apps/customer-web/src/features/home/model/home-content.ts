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

export const toTrendingProducts = (products: ProductSummary[]): ProductViewModel[] => 
  products.map((product) => ({ 
    ...product, 
    name: product.productName,
    imageUrl: product.images?.[0] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR',
    quantity: product.weight && product.unit ? `${product.weight}${product.unit}` : '1 Unit',
    // We mock the badge conditionally based on price for the visual parity, but the array is removed
    badge: product.price > 10 ? 'BESTSELLER' : '10% OFF',
    badgeTone: product.price > 10 ? 'bestseller' : 'offer',
  }));

export const toRecommendedProducts = (products: ProductSummary[]): ProductViewModel[] => 
  products.map((product) => ({ 
    ...product, 
    name: product.productName,
    imageUrl: product.images?.[0] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVNTMlttKu2Hz7Unjegu948DLlY9waR6xqugQ631kofvTund94IrAi2wZb5g_3cK2nGc_Qtb9VYmlp683nRCi2AoK39GpgwYie1_quon7cRVkCfcjv5f8cx4WWmdawpRb1ElaEFk6URX0axMs2yYuLSTNFOnAPm0bYXr_OzTGeUVneZJx55tIMcpmjxBOKUrvI2H6CeYeifXokv1FLY6BQye9DFgqfU31UKb1v7IR61uTbLniSyvvVBqVVGCFoH2EOqNchgG8okWTu',
    quantity: product.weight && product.unit ? `${product.weight}${product.unit}` : '',
    badge: product.price > 15 ? 'SMART BUNDLE' : 'DAILY PICK',
    note: product.price > 15 ? 'Save 15%' : 'New in store'
  }));

export const toCategories = (categories: CategorySummary[]): CategoryViewModel[] => 
  categories.map((category) => category);
