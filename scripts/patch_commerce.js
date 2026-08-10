const fs = require('fs');
const path = require('path');

// 1. Patch commerce-layout.tsx
const layoutFile = path.resolve('apps/customer-web/src/features/commerce/components/commerce-layout.tsx');
let layoutContent = fs.readFileSync(layoutFile, 'utf8');

// Add imports
layoutContent = layoutContent.replace(
  /import \* as shared from '@freshmart\/shared';\s*/,
  `import * as shared from '@freshmart/shared';\nimport { useGetCartQuery } from '../api/commerce-api.js';\nimport { useNotifications } from '../../account/hooks/use-notifications.js';\n\n`
);

// Add hooks to CommerceHeader
layoutContent = layoutContent.replace(
  /export const CommerceHeader = \(\{[\s\S]*?\}\) => \{/,
  `export const CommerceHeader = ({ title, showBack = false, cartCount: overrideCartCount }: { title?: string; showBack?: boolean; cartCount?: number; }) => {`
);

layoutContent = layoutContent.replace(
  /const navigate = useNavigate\(\);\s*const location = useLocation\(\);/,
  `const navigate = useNavigate();\n  const location = useLocation();\n\n  const { data: cartItems = [] } = useGetCartQuery();\n  const { unreadCount } = useNotifications();\n  const liveCartCount = overrideCartCount !== undefined ? overrideCartCount : cartItems.reduce((sum, item) => sum + (item.quantityInCart || 1), 0);\n`
);

// Replace hardcoded notification badge
const notifBadgeRegex = /<span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-\[#a72d51\] px-1 text-\[10px\] font-bold text-white">\s*3\s*<\/span>/;
layoutContent = layoutContent.replace(notifBadgeRegex, `{unreadCount > 0 && <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#a72d51] px-1 text-[10px] font-bold text-white">{unreadCount}</span>}`);

// Replace hardcoded cartCount usage
layoutContent = layoutContent.replace(
  /cartCount > 0/g,
  `liveCartCount > 0`
);
layoutContent = layoutContent.replace(
  /\{cartCount\}/g,
  `{liveCartCount}`
);

fs.writeFileSync(layoutFile, layoutContent);
console.log('Patched commerce-layout.tsx');

// 2. Patch commerce-api.ts to use customer endpoint for orders
const apiFile = path.resolve('apps/customer-web/src/features/commerce/api/commerce-api.ts');
let apiContent = fs.readFileSync(apiFile, 'utf8');

const getOrdersReplacement = `getOrders: builder.query<OrderSummaryView[], void>({
      queryFn: async () => {
        try {
          const response = await userTransport.request<Record<string, unknown>>({
            method: 'GET',
            url: '/api/v1/customer/orders'
          });
          return { data: normalizeOrdersList(response) };
        } catch (_) {
          try {
            return { data: normalizeOrdersList(await sdk.order.listOrders()) };
          } catch (error) {
            return { error: toApiError(error) };
          }
        }
      },
      providesTags: ['CommerceOrders' as never]
    })`;

apiContent = apiContent.replace(/getOrders: builder\.query<OrderSummaryView\[\], void>\(\{[\s\S]*?\}\),/, getOrdersReplacement + ',');
fs.writeFileSync(apiFile, apiContent);
console.log('Patched commerce-api.ts');
