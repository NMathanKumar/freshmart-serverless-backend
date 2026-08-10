const fs = require('fs');
const path = require('path');

// 1. cart-page.tsx
const cartFile = path.resolve('apps/customer-web/src/features/commerce/pages/cart-page.tsx');
let cartContent = fs.readFileSync(cartFile, 'utf8');

// Remove coupon code
cartContent = cartContent.replace(/const \[couponCode, setCouponCode\] = useState\(''\);\n\s*const \[appliedCoupon, setAppliedCoupon\] = useState\(''\);/, '');
cartContent = cartContent.replace(/const discount = appliedCoupon === 'FRESH20' \? 4\.0 : 0;/, 'const discount = 0;');
// Remove apply coupon row
cartContent = cartContent.replace(/\{\/\* Apply Coupon Row \*\/\}[\s\S]*?<\/div>\n\s*\{\/\* Proceed to Checkout CTA Button \*\/\}/, '{/* Proceed to Checkout CTA Button */}');

fs.writeFileSync(cartFile, cartContent);
console.log('Patched cart-page.tsx');

// 2. address-management-page.tsx
const addressFile = path.resolve('apps/customer-web/src/features/commerce/pages/address-management-page.tsx');
let addressContent = fs.readFileSync(addressFile, 'utf8');

const addressReplacement = `<button
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#006b2c] px-8 text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#005422] active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={addresses.length === 0}
              onClick={() => {
                const effectiveSelectedId = selectedId || addresses.find((a) => a.isDefault)?.addressId || addresses[0]?.addressId;
                const addr = addresses.find(a => a.addressId === effectiveSelectedId);
                const addressString = addr ? [...addr.lines, \`\${addr.city}, \${addr.state} \${addr.postalCode}\`].join(', ') : 'Home';
                navigate('/checkout', { state: { deliveryAddress: addressString } });
              }}
              type="button"
            >`;

addressContent = addressContent.replace(/<button[\s\S]*?onClick=\{\(\) => navigate\('\/checkout'\)\}[\s\S]*?>/, addressReplacement);
fs.writeFileSync(addressFile, addressContent);
console.log('Patched address-management-page.tsx');

// 3. checkout-payment-page.tsx
const checkoutFile = path.resolve('apps/customer-web/src/features/commerce/pages/checkout-payment-page.tsx');
let checkoutContent = fs.readFileSync(checkoutFile, 'utf8');

checkoutContent = checkoutContent.replace(/import \{ Link, useNavigate \} from 'react-router-dom';/, "import { Link, useNavigate, useLocation } from 'react-router-dom';");

checkoutContent = checkoutContent.replace(/const navigate = useNavigate\(\);/, "const navigate = useNavigate();\n  const location = useLocation();\n  const deliveryAddress = location.state?.deliveryAddress || 'Home';");

checkoutContent = checkoutContent.replace(/deliveryAddress: 'Home',/, "deliveryAddress,");

fs.writeFileSync(checkoutFile, checkoutContent);
console.log('Patched checkout-payment-page.tsx');
