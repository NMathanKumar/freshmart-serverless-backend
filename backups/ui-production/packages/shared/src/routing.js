const customerRoutePaths = {
  signIn: '/auth/sign-in',
  home: '/',
  categories: '/categories',
  productDetails: '/products/:productId',
  search: '/search',
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  wishlist: '/wishlist',
  notifications: '/notifications',
  profile: '/profile',
  settings: '/settings'
};

const adminRoutePaths = {
  signIn: '/auth/sign-in',
  dashboard: '/',
  products: '/products',
  categories: '/categories',
  inventory: '/inventory',
  orders: '/orders',
  customers: '/customers',
  analytics: '/analytics',
  reports: '/reports',
  settings: '/settings'
};

module.exports = {
  customerRoutePaths,
  adminRoutePaths
};
