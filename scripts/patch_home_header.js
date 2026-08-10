const fs = require('fs');
const file = 'apps/customer-web/src/features/home/components/home-header.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import
const importHook = "import { useNotifications } from '../../account/hooks/use-notifications.js';\n";
content = content.replace(/import \{ useGetCartQuery \}.*?;\n/, match => match + importHook);

// Add unreadCount
content = content.replace(/const \{ data: cartItems = \[\] \} = useGetCartQuery\(\);/, match => match + '\n  const { unreadCount } = useNotifications();');

// Replace the two occurrences of the hardcoded badge
const badgeRegex = /<span className="absolute -top-0\.5 -right-0\.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-\[#a72d51\] px-1 text-\[9px\] font-extrabold text-white shadow-sm">\s*3\s*<\/span>/g;
const replacementBadge = `{unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#a72d51] px-1 text-[9px] font-extrabold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}`;
content = content.replace(badgeRegex, replacementBadge);

fs.writeFileSync(file, content);
console.log('done');
