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
    productId: 'PROD-001',
    name: 'Fresh Organic Fuji Apples',
    brand: 'FreshMart Organic',
    quantity: '1 kg Pack',
    price: 4.99,
    originalPrice: 5.99,
    badge: '15% OFF',
    badgeTone: 'sale',
    rating: 4.9,
    reviewCount: '1.2k',
    deliveryTime: '15 min',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80'
  },
  {
    productId: 'PROD-002',
    name: 'Farm Fresh Whole Milk',
    brand: 'FreshMart Dairy',
    quantity: '1 Litre Bottle',
    price: 3.49,
    rating: 4.8,
    reviewCount: '850',
    deliveryTime: '15 min',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80'
  },
  {
    productId: 'PROD-003',
    name: 'Artisanal Whole Wheat Bread',
    brand: 'FreshMart Bakery',
    quantity: '400g Loaf',
    price: 2.99,
    rating: 4.7,
    reviewCount: '430',
    deliveryTime: '12 min',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'
  },
  {
    productId: 'PROD-004',
    name: 'Raw Organic Wildflower Honey',
    brand: 'FreshMart Naturals',
    quantity: '500g Jar',
    price: 7.99,
    rating: 4.9,
    reviewCount: '210',
    deliveryTime: '15 min',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80'
  }
];

export const categoryProducts: CommerceProduct[] = [
  {
    productId: 'PROD-001',
    name: 'Fresh Organic Fuji Apples',
    brand: 'FreshMart Organic',
    quantity: '1 kg Pack',
    price: 4.99,
    originalPrice: 5.99,
    badge: '15% OFF',
    badgeTone: 'sale',
    rating: 4.9,
    reviewCount: '128',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80'
  },
  {
    productId: 'PROD-002',
    name: 'Farm Fresh Whole Milk',
    brand: 'FreshMart Dairy',
    quantity: '1 Litre Bottle',
    price: 3.49,
    rating: 4.8,
    reviewCount: '95',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80'
  },
  {
    productId: 'PROD-003',
    name: 'Artisanal Whole Wheat Bread',
    brand: 'FreshMart Bakery',
    quantity: '400g Loaf',
    price: 2.99,
    badge: 'FRESH ARRIVAL',
    badgeTone: 'fresh',
    rating: 4.7,
    reviewCount: '80',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'
  },
  {
    productId: 'PROD-004',
    name: 'Raw Organic Wildflower Honey',
    brand: 'FreshMart Naturals',
    quantity: '500g Jar',
    price: 7.99,
    rating: 4.9,
    reviewCount: '210',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80'
  }
];

export const wishlistProducts: CommerceProduct[] = [
  {
    productId: 'PROD-001',
    name: 'Fresh Organic Fuji Apples',
    brand: 'FreshMart Organic',
    quantity: '1 kg Pack',
    price: 4.99,
    originalPrice: 5.99,
    badge: '15% OFF',
    badgeTone: 'sale',
    stockLabel: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80'
  },
  {
    productId: 'PROD-002',
    name: 'Farm Fresh Whole Milk',
    brand: 'FreshMart Dairy',
    quantity: '1 Litre Bottle',
    price: 3.49,
    stockLabel: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80'
  },
  {
    productId: 'PROD-003',
    name: 'Artisanal Whole Wheat Bread',
    brand: 'FreshMart Bakery',
    quantity: '400g Loaf',
    price: 2.99,
    stockLabel: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'
  },
  {
    productId: 'PROD-004',
    name: 'Raw Organic Wildflower Honey',
    brand: 'FreshMart Naturals',
    quantity: '500g Jar',
    price: 7.99,
    originalPrice: 9.50,
    badge: 'SALE',
    badgeTone: 'sale',
    stockLabel: 'In Stock',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80'
  }
];

export const cartLines: CartLine[] = [];
export const savedAddresses: AddressView[] = [];

export const productDetail = {
  product: {
    productId: 'PROD-001',
    name: 'Fresh Organic Fuji Apples',
    brand: 'FreshMart Organic',
    quantity: '1 kg Pack',
    price: 4.99,
    originalPrice: 5.99,
    badge: '15% OFF',
    badgeTone: 'sale' as const,
    rating: 4.9,
    reviewCount: '128',
    stockLabel: 'In Stock',
    deliveryTime: 'Arriving today by 6:00 PM',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80'
  },
  gallery: [
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80'
  ],
  similar: []
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
      imageUrl: typeof newItem.imageUrl === 'string' && newItem.imageUrl.length > 0 ? newItem.imageUrl : 'https://placehold.co/400x400/e2ebdE/006c4a.png?text=FreshMart',
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
    const targetId = text(item, ['productId', 'id', 'sku'], '');
    const matchedFallback = fallback.find((f) => f.productId === targetId);
    const visual = matchedFallback ?? fallback[index % fallback.length] ?? fallback[0];
    
    // Check for imageUrl, image, thumbnailUrl, OR the first item in the images array
    let remoteImg = text(item, ['imageUrl', 'image', 'thumbnailUrl'], '');
    if (!remoteImg && Array.isArray(item.images) && typeof item.images[0] === 'string') {
      remoteImg = item.images[0];
    }
    
    const validImg = remoteImg && remoteImg.startsWith('http') && !remoteImg.includes('product-placeholder.png')
      ? remoteImg
      : visual.imageUrl;

    return {
      ...visual,
      productId: targetId || visual.productId,
      name: text(item, ['name', 'productName', 'title'], visual.name),
      brand: text(item, ['brand', 'brandName', 'vendor'], visual.brand),
      quantity: text(item, ['quantity', 'packSize', 'unit'], visual.quantity),
      price: numberValue(item, ['price', 'salePrice', 'amount'], visual.price),
      originalPrice: numberValue(item, ['originalPrice', 'mrp', 'listPrice'], visual.originalPrice ?? 0) || visual.originalPrice,
      imageUrl: validImg
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
  // Unwrap API envelope: { success, data: { addresses } }
  const envelope = isRecord(remote) && isRecord(remote.data) ? remote.data : remote;
  const profile = isRecord(envelope) && isRecord(envelope.user) ? envelope.user : envelope;
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

const WISHLIST_STORAGE_KEY = 'freshmart_active_wishlist_v1';

export const getStoredWishlist = (): CommerceProduct[] => {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as CommerceProduct[];
      }
    }
  } catch (_) {
    // Fallback if localStorage is unavailable
  }
  return [];
};

export const saveStoredWishlist = (items: CommerceProduct[]): void => {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (_) {
    // Storage quota fallback
  }
};

export const addOrUpdateStoredWishlistItem = (newItem: Record<string, unknown>): CommerceProduct[] => {
  const current = getStoredWishlist();
  const productId = String(newItem.productId || newItem.id || `prod-${Date.now()}`);
  const existingIdx = current.findIndex((item) => item.productId === productId);

  if (existingIdx !== -1) {
    return current;
  }

  const fullItem: CommerceProduct = {
    productId,
    name: String(newItem.name || newItem.productName || 'Product'),
    brand: typeof newItem.brand === 'string' ? newItem.brand : 'Organic',
    quantity: typeof newItem.quantity === 'string' ? newItem.quantity : '1 Unit',
    price: typeof newItem.price === 'number' ? newItem.price : 4.99,
    originalPrice: typeof newItem.originalPrice === 'number' ? newItem.originalPrice : undefined,
    badge: typeof newItem.badge === 'string' ? newItem.badge : undefined,
    badgeTone: (newItem.badgeTone as 'sale' | 'fresh' | 'organic') || undefined,
    imageUrl: typeof newItem.imageUrl === 'string' ? newItem.imageUrl : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300'
  };

  const updated = [fullItem, ...current];
  saveStoredWishlist(updated);
  return updated;
};

export const removeStoredWishlistItem = (productId: string): CommerceProduct[] => {
  const current = getStoredWishlist();
  const updated = current.filter((item) => item.productId !== productId);
  saveStoredWishlist(updated);
  return updated;
};

export const mergeWishlist = (remote: unknown): CommerceProduct[] => {
  const data = isRecord(remote) && isRecord(remote.wishlist) ? remote.wishlist : remote;
  const items = isRecord(data) && Array.isArray(data.items)
    ? data.items
    : Array.isArray(data)
      ? data
      : isRecord(remote) && Array.isArray(remote.data)
        ? remote.data
        : [];
  if (items.length === 0) return getStoredWishlist();

  const merged = mergeProducts(items, getStoredWishlist());
  saveStoredWishlist(merged);
  return merged;
};

