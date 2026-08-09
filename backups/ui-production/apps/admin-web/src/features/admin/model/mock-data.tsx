import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Archive,
  Activity,
  BadgeCheck,
  Bell,
  Box,
  BriefcaseBusiness,
  CreditCard,
  ChartNoAxesColumnIncreasing,
  Flag,
  Grid2x2,
  LayoutDashboard,
  MessageSquareText,
  Package,
  ShoppingCart,
  Shapes,
  ShieldCheck,
  SquareChartGantt,
  Star,
  Store,
  Ticket,
  Truck,
  UserCog,
  Users
} from 'lucide-react';

export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export type Metric = {
  title: string;
  value: string;
  subtitle: string;
  accent?: string;
  badge?: string;
  tone?: 'success' | 'danger' | 'neutral';
  icon: LucideIcon;
};

export type TopbarUser = {
  name: string;
  role: string;
  avatar: string;
};

export const adminUsers = {
  main: {
    name: 'Admin User',
    role: 'SUPER ADMIN',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4aka1ymojT-vWSqRZ1G7gTKyzvOPL-I2FN4CigyzdORH7OFXtsN5Qu_SG7mLOLk7sLi1Q_XeeKApeeeaEakacBWTlOtLXxv64-nAHuPas7Z12pfWh5zs1Mgq7tLuEkwcScc7i-zdD3LdJbM3OaUoqM3e6ka8VEbjH0zogHUDIqWgl1zoi7z35dYb32GavcxfLgpo3sZWOMio6bp6fq7MgqomnRSImErWsq6mISj86yNw-YNWBSUpfsCI7m6OuqSWEaYhcUWTN7Gx8'
  },
  alex: {
    name: 'Alex Rivera',
    role: 'Super Admin',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1gDdYIXL1bnyQ5EN1YfylARskFYTnhklRQK2IKptmNeL4c2vFZ_AIPV-kRh45nrEbP4cqJRQwGlMXQ10uKjF56V8ocpRtXww2YHzpWmJ4iXBaIHLRxPtjaNu9m5IBK9d423vchSAloRVYjbFxwJktrYY7_wBGZktV8WG2P2Oa-40EG2Enjlv0vzTAx5jh9ShI06h9zFlS1vK1S9QYCyI9T7RVH7jV_U0EU2YLAKSnBmmdFj9paBOhzrtNhhX4KTUNbGhrXBsgYd6H'
  },
  sarah: {
    name: 'Sarah Jenkins',
    role: 'Administrator Profile',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD67B3GPw8xZHbYD31bMzAyhT_PXQXzJF5pvA7Sy4M1T33wtdrpwR_ueurq4hQ6TKxDz7vvGS6ieUr-jRH4pllB-fz7KvhYm4SgcVEXMrcIDR3Cbscblc_Q219sEn604TbSZ32q0nRXI7TOdFNX5yQqcf7CSzJHy958Kr0OHcHQE4N4LZa_9ZttCHQo6BGIGN4c7Lf9dpf23U5bWnLKq0sN5S53Xurbrb2yeL9Up4X5jfz343Hgbz0ZP2sUbOd1QMXSWhB16hpXAyzp'
  },
  office: {
    name: 'Admin User',
    role: 'MAIN OFFICE',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGZcy3huHp_dAMO_bgACfuIxgINOMChP-B8RLDJISGFk4i04zOJXv1CH7FgvBrUTBxdlqlT38WAKGKseFO4ly8G8S497gtwbtlMkLht4bR7dkBqyqOfNyCPb8eX4WGwnqfgNEHUcrHVhqtmziNy1EhHg0kEroyEL_jACbEssDFUTQhR8Wqp8TVuUp4IHjbeo2c44OAn4CdOpiy_NNIsrJknGEG-h624YQp0NjZxl8yyM76mUCFUH1ExS7FqDaIcQ6JJ2UftfjlyCY2'
  },
  catalog: {
    name: 'Admin User',
    role: 'SUPER ADMIN',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2D8EcIVISAfVc9wLbk7qnRvatyjpM-l3xTt-DY-euUErTnr_Yx7n8fqF5yiHEdrQyVmIA4KKmr07ANMNyFRw1GDrlQgzhpAhUqfPX3kTB7le6idrY3XdtKTtZh3b30NwBXm-Eu0G_YmIAwx1TreZnbWfqrxZm2Tm9HOIx0fMMxUd0_YVU0xa_DQ47O_58vXF0g5j9IW_NbG51lTv0EW3jVKufWuEgapz7a1PSMF65rbygRqoBw64k58W5LGk582PJEwr5HEy-qGSM'
  },
  categories: {
    name: 'FreshMart Admin',
    role: 'Master Account',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZTL3MCOwaGVzn6ocQ2C5A-t3YKLlnaTxE2dc5m2jfjm29ImrfS2BxP9FADscD5Yz31HL5CNETY9ODQZgyFEI3oldKsDGckjXeyT06tJP11bCkpWsduPywEY-3TZLgCeI4WTwdrk3-wDfCpDHaoU-kXGPBZ30bR9YgA0BUEdh8amUNULI4iyCGGPpAdObVnXaqjw5Oku5s0yK0f5KOfGuE4wbiM9rPChww33ATKEVzA94rIhtfyzudhZfe1jNPSRL-oIBkmjje79fy'
  },
  procurement: {
    name: 'Admin User',
    role: 'Procurement Lead',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCpFvWM1E5FYTZiXA3D34NL9H32qQgOB3ETq5276P1AnuyVmDRCE-ggP-8HSHeRj_cRYeBRU6sg56-Gkamcg0Nk7XiAczAk5KuldvzNBKZHlObGVVuaWQi22xif9LvRd9Iw3wPdngpMZIKUCRk_fRXleqwQI1W9bZnvVKFtxIlIscVobcBFw_co2dF9ca3qToJXwOjmGtdnMdY06X7dVXuC7DhyYF_AEcBEMoNKzvIXrpkr9JlFLS65eLgNXt9raYhErDkaJ_YdC5b'
  }
} satisfies Record<string, TopbarUser>;

export const retailNav: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Orders', path: '/orders', icon: ShoppingCart },
  { label: 'Inventory', path: '/inventory', icon: Box },
  { label: 'Products', path: '/products', icon: Store },
  { label: 'Categories', path: '/categories', icon: Grid2x2 },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Delivery', path: '/delivery', icon: Truck },
  { label: 'Coupons', path: '/coupons', icon: Ticket },
  { label: 'Reviews', path: '/reviews', icon: MessageSquareText },
  { label: 'Settings', path: '/settings', icon: UserCog }
];

export const catalogNav: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Products', path: '/products', icon: Archive },
  { label: 'Categories', path: '/categories', icon: Shapes },
  { label: 'Orders', path: '/orders', icon: ShoppingCart },
  { label: 'Analytics', path: '/analytics', icon: ChartNoAxesColumnIncreasing },
  { label: 'Settings', path: '/settings', icon: UserCog }
];

export const operationsNav: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Orders', path: '/orders', icon: ShoppingCart },
  { label: 'Inventory', path: '/inventory', icon: Box },
  { label: 'Users', path: '/customers', icon: Users },
  { label: 'Analytics', path: '/analytics', icon: SquareChartGantt },
  { label: 'Activity', path: '/activity', icon: Activity },
  { label: 'Roles', path: '/roles', icon: ShieldCheck },
  { label: 'Settings', path: '/settings', icon: UserCog }
];

export const procurementNav: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Orders', path: '/purchase-orders', icon: ShoppingCart },
  { label: 'Inventory', path: '/inventory', icon: Box },
  { label: 'Users', path: '/suppliers', icon: Users },
  { label: 'Analytics', path: '/analytics', icon: SquareChartGantt },
  { label: 'Settings', path: '/settings', icon: UserCog }
];

export const dashboardMetrics: Metric[] = [
  { title: 'Total Orders', value: '1,284', subtitle: 'vs last month: 1,141', badge: '+12.5%', tone: 'success', icon: Package },
  { title: "Today's Revenue", value: '$14,290', subtitle: 'Target: $15,000', badge: '+8.2%', tone: 'success', icon: CreditCard },
  { title: 'Active Customers', value: '8,432', subtitle: '242 new today', badge: '+3.1%', tone: 'danger', icon: Users },
  { title: 'Inventory Alerts', value: '12 Items', subtitle: 'Immediate restock required', badge: '14 Alert', tone: 'danger', icon: AlertTriangle }
];

export const productMetrics: Metric[] = [
  { title: 'TOTAL PRODUCTS', value: '1,284', subtitle: '+12%', tone: 'success', icon: Box },
  { title: 'ACTIVE STOCK', value: '8,432', subtitle: 'In Sync', tone: 'success', icon: Package },
  { title: 'LOW STOCK ALERT', value: '24', subtitle: 'SKUs', tone: 'danger', icon: AlertTriangle },
  { title: 'DRAFT ITEMS', value: '15', subtitle: 'Items', tone: 'neutral', icon: Grid2x2 }
];

export const reviewMetrics: Metric[] = [
  { title: 'Average Rating', value: '4.8', subtitle: '/ 5.0', badge: '+0.2 from last month', tone: 'success', icon: Star },
  { title: 'Total Reviews', value: '3,240', subtitle: '', badge: '124 new today', tone: 'success', icon: MessageSquareText },
  { title: 'Pending Reviews', value: '18', subtitle: '', badge: 'Requires Action', tone: 'danger', icon: BriefcaseBusiness },
  { title: 'Flagged Reviews', value: '3', subtitle: '', badge: 'High Priority', tone: 'danger', icon: Flag }
];

export const supplierCards = [
  {
    name: 'Green Valley Farms',
    id: 'SUP-2401',
    contact: 'Robert Chen',
    email: 'r.chen@greenvalley.com',
    items: '42 items',
    active: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDW9FARh48BI9jZ6H0jGo47yPpzgoR7B1lnhkflFp3xGMuBLahxIzvFQULoJElqV1sD8ey2fMkWf3G6oAaa1IWIxDENiqF6Rw6azToHYvANP1kfZUudHBAflPCink7fSFqfqKY0N2qq92wZ7iJvjeL4PIaNlkEmeBOSMPN9o3E9Dc6FH_nWxusBArWTe-OdNhL78LHXyZ503AV0kgGhIQoEcrSqh7CBOBer5Oeb5-z3syHfWPXXGrEwlyZbs52IP0GRnnkrrBTfZJue'
  },
  {
    name: 'Orchard Elite',
    id: 'SUP-2405',
    contact: 'Sarah Jenkins',
    email: 's.jenkins@orchardelite.io',
    items: '18 items',
    active: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCN7ATwV5uB2_IvT7S8qAsosKsV9Cf32Th7MvgxLfs7GRIUN1c52NgqScKJx8-VDXMQ1FJ7EAzN1OId0h43A7do2ASIFA42VqueGgMfdFPHM2wsV0x7lhlJoVat_9RQUMnQWHoNtnWougx3kJeKXwz54MqrV6Fru_pYllfdT35EVmmPr6kobjqrpCqR31Px0FTP3a28x_msM4_OHY0YLV3cgu751MUKIUpR0ucxThnZ5O2ZG4oOM7AnJLKtjknGz1lj0IXDIwS2Bdpz'
  },
  {
    name: 'Nordic Dairy Imports',
    id: 'SUP-2398',
    contact: 'Lars Vestergaard',
    email: 'logistics@nordicdairy.com',
    items: '105 items',
    active: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAh5vwYOqcyf5u23LpZs2ydbLYgAlwcTcU5myJVZeOswj1r5tiSdbeHOJ9FMofruOYQhQS5ycyyyYqfIkxHuJ4VWbV71qznKVlm57n-mTpp44y4GMjqedYBT0AUsRUUtkjoUfBjzvO1gW0Q3vEulcniKaqOSoXVcFDz-_dyyGf7qyEFGubDIKz3xYmEQLKpA1JMINbTk8YpsEY_QhbMj5LDBv_IvKCSzsDhK5xrnc2rnPkVmZ4no9kfsAYtHolm68EXAokYWtso1IPE'
  }
];

export const productRows = [
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCI4Le5ppuh1z4JABFZcxtbJMVKS-DrahtY85AGT4u-SyoNp0rN6N6XzKewrqz7eqi6DSUNK9h-3DR3GF3Sw8d1xPi0NcV7XkGuwkB2bJp9g6-1kMJNyrTT06vPFfQsy01R2o42XwXbydYTii2oYAj8aLocf5FrrcuqIWmeNrdkxSMSUh6jgL2hxM48GU3DwcFWC1s-mcxOQXU11hymbwlu3RxmTpySTXMYiNXzLphWY_1ucebaWbJjJH2RWNe2C3gMByEtGMDaFv9V',
    name: 'Organic Hass Avocado',
    subtitle: '2 units pack',
    sku: 'AVO-001-ORG',
    category: 'Produce',
    price: '$4.99',
    stock: 142,
    progress: 70,
    status: 'ACTIVE'
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtICMUroKFC6jvhslsM-e3f8kZnk_6B6SEEWIGlFucvKM70clVEUNMUK_P1-fpRJx0YXRTYPWnU91n5oLV6f7DvU1FzVFn_mZbIG0PRGDMZv1EI6s1uwxqrSWuAu6X5wZjG1-3cnq0vb4Jr40v1i1CyG2LvqINpJqDsye8oz7BVLUrlRuPxCOedpK0aKSrXu3O8FJzbAtsBX6PGQfTZ7IJ7d5W_VzvMcoCfQ2uMCWhvM9wqvgGsvm3lUEoYItRbeuJ70qMYwzIHJVK',
    name: 'Artisan Sourdough Loaf',
    subtitle: '500g Freshly Baked',
    sku: 'BAK-772-ART',
    category: 'Bakery',
    price: '$6.50',
    stock: 12,
    progress: 16,
    danger: true,
    status: 'ACTIVE'
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNR8R67ryJ442blge1xfwfC7mPoo4wrYcK-3i5-a55Y8dxFlwDvk_ISo2sciuXXrL3QsAo7AuP1a05vg79-8Ays5x0ycN5cTBowxqFZ9UVcLtOiQEqFDr1olLSFHLO36ufRySp8RYcaZISGNPkuAuC1q9d0HKxCaX1EYO8VxYovCLrjEEL9cO0eg2komvY4g0euImlEyhimUWthbCojpWJqVvy_qrn5gb35usD4wmv6T3_J8eUEJZi0rBDi0VISqLLr6UX1M5-1rAM',
    name: 'Premium Almond Milk',
    subtitle: '1L Unsweetened',
    sku: 'BEV-990-ALM',
    category: 'Beverages',
    price: '$8.99',
    stock: 0,
    progress: 0,
    danger: true,
    status: 'INACTIVE'
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDB0bVfaHJBpk10cLzalgNvo-tb9vU7uFHJEkvPEkDYGk_gUQ1zxg1cFm3G7NdilX4homjdk1tLuiAWkvl7Y9THKLZZHSTBg03nXyVHl2mk7zQAnwSipLApL4TDro143giIT5CQkCIx_S8a41H7niG60OGkX7Qc8O4kjvlDfsrRkz58N4KahpPvqa9xZObIHMKCLELEPBJkZ3r6AcwzSBN4X3jpQX1_QNKDcuS3NR9_PM9linhX8OyyWNx7WUPLYJjLwLqCgchXOv7J',
    name: 'Sweet Garden Strawberries',
    subtitle: '250g Seasonal',
    sku: 'BER-441-STR',
    category: 'Produce',
    price: '$5.25',
    stock: 86,
    progress: 46,
    status: 'ACTIVE'
  }
];

export const categoryRows = [
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDD-aOj4Wsi4OJ2OVcPtwzkF5978D_hZD7sJkhuxHzf-i0YiYQ9W4GBUneMFqM6h0nl1Ai65HjwtJNqY1hgX76YAhNwe-Bcc6diaLiVb8RFqMKVLLwFiqu2WTI524uHsJyT-YajDJB1_61xbEpyHbHXUX_YQNGjmNoEW5R2Orwj73zv14wzMPj-MKPCtjJFa_3MrsbFlXDDmihAigT24LWiPUV_fwXdemziO51PFj2udGPCzClDpcURrE0mbiGK5BSobqtJlkEUjOwp',
    name: 'Fresh Vegetables',
    id: 'CAT-001',
    description: 'Farm-fresh organic greens and...',
    products: '432',
    active: true
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9pIMVws90fTfsg_dQ5FaEFl0dNeS0JuAO0g5za41uwLf5WFEySzC_DMd-pAAimMqPzL2sSKpHcrO0kJW5d7xB1u2rYxwXivUNCDNBl3_wKy4Kvfuk9wnAVaKqwNdNn4DRXyIBYJEq-yfK3zuYsKynQQjEatLrSpXwM_Lvy4mOn3b15vXYP4E89WfZ37hXRYOVJdTgl_MsXx6RWYJUbt-McVhFiFGNWTvnTRXefD--44SubGVnvSOeXvYanrgaWQZ6xL_UQsFB_dDK',
    name: 'Bakery & Bread',
    id: 'CAT-002',
    description: 'Freshly baked sourdough, pastrie...',
    products: '218',
    active: true
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDftxvtkJ0Ftu_JmWtQwmvjRdeL2XHow5Mv-DZlodUbkjo2L4xmY6qgZObmPU-ckdimszPJ6ec8FbVbBr5yT84IRNKhvqpS-U9h6dSSkNq2k9QhlsZoWQzYY9rOnz2XR6zJn64L7liJYVqm46eve-wDqP2KJYHNAXaFM-woD8ryVrxN-zqFkKTFTnMJ1seb2SaAf3A2JSPELJSAFd9OBeOthVTYiVU_19csn_T7eAF3dNUhWvXQOyvfrL7XSEJ3AqMgIeswMYGy-5Ft',
    name: 'Dairy & Eggs',
    id: 'CAT-003',
    description: 'Locally sourced milk, artisan...',
    products: '156',
    active: true
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEofMAIQHUM4zytgpfmIZriRyinRpdqZYt3OHOxFZ0X4rqs5-72QAwxdD-wl23g4MZJflIehB9-Om4kGyiwB4mzV2dnYrfcY5rh6VN7c35mJejixS0nRxoZS8YxE_Cu3XKzvh92Z43lvVl4bQb_5gZ8ZtrfymZYXQNJ39Ttvx_5s3unyqO2jJei8utxqWMPIiSQ0cFws6QIlLF0FfjYGcIYEUg0tT8ITayN5rn6YOeOvFzzTwoZeqDV-SzLiUpRN9tOha7aSa5faER',
    name: 'Organic Fruits',
    id: 'CAT-004',
    description: 'Seasonal and tropical fruits...',
    products: '389',
    active: false
  }
];

export const orderRows = [
  {
    id: '#FM-1023',
    customer: 'Sarah Connor',
    email: 'sarah.c@gmail.com',
    initials: 'SC',
    products: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBoYFBBrvR35TeXpDhUmESi3qflEjsplSe_HExnhKtm5U7u1gXWZflbDUe-DLvcWgAs_BwtPzrfYQbr_1T-WyaHOBbtPKwQoDqfFgqBvk02yfVfyGCU1rFvisn1pC3Dhy56fZkf9CJA2ORkn7OP3FQf9IwPiA08AtkLSReRdREpvrHJlubOFWcyKVFqWFwLcVeCU3TRTzYz3R6lD7y4RbrlgUUp1UO6mnl5YDfpZbjl7BGiCOnp2KFTSVkGnld81SDQhJqjZDls5mRL', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCom5GIsOF2Js5hDboiZ5w3HojRZ7rB3CciI2-vmsRB_nWcKgLSNG5zU9_gkr_5n5x5fSM3oetJZTnuK6SqKcDvonuHtUe8AtWQqc5jp26T-H1zomEzW_T7t_cF6Cwljx-fxdmH4sI1FBHTJH_BzZErmdOzLWzqjzhh9yd33YiqQRNSEj8d8NESXV4k5FiyUtheXYxj1KHmo7nNhoQOtelIk_Duez9tmLMyF7ChsSlwXiFRbMx1FkJzymYbNfXqL8ZMjxGLpJyJWS7'],
    extra: '+3',
    date: 'Oct 18,\n14:20',
    amount: '$142.50',
    payment: 'Paid',
    status: 'Processing'
  },
  {
    id: '#FM-1022',
    customer: 'James Bond',
    email: 'j.bond@mi6.com',
    initials: 'JB',
    products: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAJFFgQv5MEHcHqWPpakUqDph-BipG1B-5ki0Q7g9X0Ea-0GIe9zDT4sHb4-308ZAGg4COOBsr-ntEWPbllHlUEExhpxCBmhX0oh_Bwwvecy6euAsDqQsxccX5LeLZ8LqooxGJIJ-uvXeSds63GHtv0HgupplBsQ3REssyj4i8rifZVxiZiFcQUXYl76eNB2-nZQsodU3vpfOX19IjcJSGIRafJgNzMVoBRWkUsNB_jt-7AcA-Hc0KUUWpvlB9uVYwnv9UBxpsrhiB1'],
    date: 'Oct 18,\n11:05',
    amount: '$56.00',
    payment: 'Unpaid',
    status: 'Pending'
  },
  {
    id: '#FM-1021',
    customer: 'Ellen Marsh',
    email: 'ellen@marsh.io',
    initials: 'EM',
    products: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCqyz9FWPdBJp5m2Lu-352v45ZyYlaBA11uojmhiBK9h9URKEmsbqC9i0VRtOEeoLNUPb4AmdEeU2SPXJSPVtp96nn8bROPZFfIH78uqj42uPDuEhCUFt6D_Y5VcVritey1U0hEuA31puntLI2m6M57fTP5qIIiQA3Y3DtNdOmR0TqwGIZCyI5c3vHUHZKDr2uBh1M-21P4q3ricysRHil7FQBZJbY676EAaPw7fAEf2uCB34mUXhaL29Bxw46BR1asXMZb9MCp6eiY'],
    extra: '+1',
    date: 'Oct 17,\n18:45',
    amount: '$89.20',
    payment: 'Paid',
    status: 'Shipped'
  }
];

export const inventoryRows = [
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWKxq0a5qBj7tQhsnI2lUasR5L2u1OiybqBw3YRJAXSEO36FAh7hECnaG-VXNuTgp842Aq0NKe4NH00J5LbhJrMYPQcjRTiJ6ilNUHX8D1YrIFqE-Wt6JZovIUr7TUploBjjFKD5qfLL2ZsgUDqdhR7TVym-foGhS3JQgpLrNhHkrfS68OlYdWBekhwqesASbKG5xWRlh__wcCeqG6Nqhyxs-H0V2YAdlejTapwui-AKUG41pvxD8a-ux3AGOvH_mrnu9lMWdg9-L9',
    name: 'Organic Hass Avocados',
    subtitle: 'Pack of 4, Grade A',
    sku: 'AVO-HS-001',
    category: 'PRODUCE',
    warehouse: 'Central Hub',
    stock: '1,240',
    reserved: '142',
    progress: 72,
    status: 'In Stock'
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0zDznpph-LMAntwHa9vxF2QAFLAeJVf0xXZejcDNnvr4EhYHQfAmlUzpP3YBXekcr4WEIEwc11roLqQwmfSAlS__xWuPugE7S9fxLZTbwvtl-9ZNo7ea8NQ9gx3_WxHjoAX3TzIPFu28tVHQMurvrwPIaxGJj5tHAknvyetSNkVLwQr0ed1vzqJU3xl0yioqHize7A4Lwi8nZ3W3zZBaBWVAGhO2xyHRLDe8efhOXRXVvS4CVUESG-PBTDI3nImnUQ9RFLcbhlPa-',
    name: 'Artisan Almond Milk',
    subtitle: '1L Glass Bottle, Unsweetened',
    sku: 'MLK-AL-204',
    category: 'DAIRY & ALT',
    warehouse: 'Metro Express',
    stock: '14',
    reserved: '8',
    progress: 14,
    status: 'Low Stock',
    danger: true
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9lA0ogmLehEhlWoE6elTDe4vhbDBTNajqEyzvNG8a7HwQW0dPLHbOjem8ZdF_W4cQk-r006boHR0pVQz0KqF75pFbm4HezOilGmdS3YEn8kJhbnspNw7i0k7yujvKxARQUiOnK32SvCoWLAbGPP1YpG-AbsY_EwTiXG3euU17HryFyoi9ToG0D38xurjIpztq_SF3VpmOBtTZ7dZ_xLyX1S7uwv1YwckGURg-o5Bia46LalGOoYNhwCFjFkABMA5sc3veSXMmgfEw',
    name: 'Organic Bananas',
    subtitle: 'Per kg, Fair Trade',
    sku: 'BNN-OR-991',
    category: 'PRODUCE',
    warehouse: 'Regional DC',
    stock: '0',
    reserved: '0',
    progress: 0,
    status: 'Out of Stock',
    danger: true
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgtl6Y60zLTX3GG5BPMZB1K3Q7ZxJc0DkqQtYQXqdcUAhVGJW0dW4z3PuD6nMPfNZ-4hyRArBv1bVb1803W4jcfASD0z5lBaXknrVxKlHvm7J3VUy8Zrozz9vT-obOtGsBCfxv2y3SReod8VyrVKq8wM7G8hKd_i0JRVd51in1tcCE_bBDNq8J21PKLpl2s8RTFnQEdE1mBxD8_JkFL0Az1F_C6sNxBxtJ51D7v8TM4uFxFTcUkd5xyF1FcSJgjVKtR-3lwWehb2BS',
    name: 'Whole Grain Greek Yogurt',
    subtitle: '500g Tub, Plain',
    sku: 'YOG-GR-332',
    category: 'DAIRY',
    warehouse: 'Central Hub',
    stock: '452',
    reserved: '32',
    progress: 44,
    status: 'In Stock'
  }
];

export const customerRows = [
  {
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    name: 'Sarah Jenkins',
    email: 'sarah.j@outlook.com',
    id: '#CUST-1024',
    phone: '+1 (555) 012-3456',
    date: 'Oct 12,\n2023',
    orders: '42\nOrders',
    spending: '$2,450.00',
    status: 'ACTIVE',
    highlight: true
  },
  {
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    name: 'David Chen',
    email: 'd.chen@gmail.com',
    id: '#CUST-1025',
    phone: '+1 (555) 987-6543',
    date: 'Nov 03,\n2023',
    orders: '12\nOrders',
    spending: '$845.20',
    status: 'ACTIVE'
  },
  {
    initials: 'EM',
    name: 'Elena Martinez',
    email: 'elena.m@company.com',
    id: '#CUST-1026',
    phone: '+1 (555) 234-5678',
    date: 'Dec 15,\n2023',
    orders: '0\nOrders',
    spending: '$0.00',
    status: 'BLOCKED'
  }
];

export const deliveryRows = [
  {
    id: '#DEL-8821',
    order: 'Order #FM-9912',
    customer: 'Sarah Jenkins',
    distance: '2.4 km away',
    partner: 'David Miller',
    rating: '4.9',
    eta: '14:45',
    etaSub: '(In 12m)',
    status: 'Out for Delivery',
    highlight: true
  },
  {
    id: '#DEL-8822',
    order: 'Order #FM-9915',
    customer: 'Robert Chen',
    distance: '0.8 km away',
    partner: 'Elena Rodriguez',
    rating: '4.7',
    eta: '14:55',
    etaSub: '(In 22m)',
    status: 'Picked Up'
  },
  {
    id: '#DEL-8819',
    order: 'Order #FM-9908',
    customer: 'Amelia Watson',
    distance: '5.1 km away',
    partner: 'Marcus Thorne',
    rating: '4.5',
    eta: '14:20',
    etaSub: '(15m late)',
    status: 'Delayed',
    danger: true
  },
  {
    id: '#DEL-8825',
    order: 'Order #FM-9920',
    customer: "Liam O'Neill",
    distance: '1.2 km away',
    partner: 'Unassigned',
    eta: '15:10',
    etaSub: '',
    status: 'Pending'
  }
];

export const couponRows = [
  {
    code: 'FRESH50',
    campaign: 'Spring Launch 2024',
    type: 'Percentage',
    value: '50%',
    validity: 'Apr 01 -\nMay 30',
    expiry: 'Expires in 12 days',
    usage: '1,240\n/ 5,000',
    status: 'Active'
  },
  {
    code: 'WELCOME10',
    campaign: 'New User Onboarding',
    type: 'Flat Amount',
    value: '$10.00',
    validity: 'Unlimited',
    usage: '8,450\n/ ∞',
    status: 'Active'
  },
  {
    code: 'WINTER23',
    campaign: 'Clearance Sale',
    type: 'Percentage',
    value: '25%',
    validity: 'Expired\nDec 31',
    usage: '5,000\n/ 5,000',
    status: 'Inactive'
  },
  {
    code: 'VEGGIE20',
    campaign: 'Organic Produce Promo',
    type: 'Percentage',
    value: '20%',
    validity: 'May 01 -\nMay 15',
    expiry: 'Starts in 3 days',
    usage: '0 /\n2,500',
    status: 'Scheduled'
  }
];

export const reviewRows = [
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpY8B3Qp6RHuRtuL8FDLYJZPXm5gp2iWEf763jQT6s-khOZlVsZ40fb1rLTygYykkGq5pV4HdghEpqh0ur_aNoJLKSSar2mbQLOAPE-DCu-_8GXxiU8OXdTlC_nWxNnZ20H0CP9kDO05jEGm4WeWraSIcHSxq1BMFXIpfaxNw31vQdVaaC8kG6Iih6LGPjSYosnolYd_8FofryMWtJb8RtHn2_7U4-KrJ7_80aVXDJZyo0HPX_Albl0FsVGp5bnJwF3uCSeH4d6aHK',
    product: 'Organic Red Apples',
    customer: 'Sarah Jenkins',
    date: 'Oct 24, 2023',
    status: 'APPROVED',
    highlight: true
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8d6E6g9vSoFmjXAmBUNsvSgkaABSlS0Sqxrz1b--WcxDVkoBfkVDyNi_BeFUjVcdIR8R8-4c4nOVPK3ckh4FHSyrZWbf_ActGLjs_WJ7ycGOOC793Ft47GWMnFmNqU1RBYAWKlWUZOSfgRvQiKoHye2PBnBrXrYSlTEcPuTWL28LOmQL2lia1UoPhyeilcIddSz1YxfI6d4k_IwxWfGNEQ9nIzfebW5re-KqO3BUiFCXmxTQg0Os5a8uE56PKZSCFHxR3OrRuTlbt',
    product: 'Cold Pressed Almond Milk',
    customer: 'Michael Thorne',
    date: 'Oct 25, 2023',
    status: 'PENDING'
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtIribeESCq51iftXTkil9xhsevlogfuWWWWniTutRPDwjJtlqBUfssLGcl9jiYA94FL4CO37RfEaReF6_cUh-7PfdzcCJPw-94D1DzhEs1tEg4N5ms9EaIpG3xizPZ8vEpvfXejT-cx3-P9BnhxaongDXhdaWifR_ZcQo0w9oO16VV6wkL7m3fspzNtfN4I9M_KeuPzhGSlFbsVifGrKklDFr9M2VdnBODetZMMCpPCWa8I6DY1MJUCf3wM20fQJiN9Ic2p7MMEUi',
    product: 'Artisan Sourdough',
    customer: 'Anonymous User',
    date: 'Oct 25, 2023',
    status: 'FLAGGED'
  }
];

export const purchaseOrders = [
  { id: '#PO-8821', supplier: 'Green Valley Farms', created: 'Oct 24,\n2023', expected: 'Oct 28,\n2023', total: '$2,450.00', status: 'Approved', highlight: true },
  { id: '#PO-8819', supplier: 'Organic Roots Ltd.', created: 'Oct 23,\n2023', expected: 'Oct 30,\n2023', total: '$1,120.50', status: 'Draft' },
  { id: '#PO-8815', supplier: 'Ocean Harvest Co.', created: 'Oct 21,\n2023', expected: 'Oct 25,\n2023', total: '$4,890.00', status: 'Approved' },
  { id: '#PO-8812', supplier: 'Dairy King Distro', created: 'Oct 20,\n2023', expected: 'Oct 22,\n2023', total: '$845.20', status: 'Pending' },
  { id: '#PO-8810', supplier: 'Fresh Orchard', created: 'Oct 19,\n2023', expected: 'Oct 24,\n2023', total: '$1,300.00', status: 'Approved' }
];

export const recentOrders = [
  { id: '#FM-8932', customer: 'Jane Doe', initials: 'JD', status: 'Delivered', total: '$142.00' },
  { id: '#FM-8931', customer: 'Marcus Smith', initials: 'MS', status: 'Processing', total: '$84.50' },
  { id: '#FM-8930', customer: 'Emily Lo', initials: 'EL', status: 'Pending', total: '$210.15' }
];

export const lowStockItems = [
  { image: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&w=120&q=80', name: 'Organic Avocados', detail: '8 units remaining', progress: 35 },
  { image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=120&q=80', name: 'Artisan Oat Milk', detail: '15 units remaining', progress: 28 },
  { image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=120&q=80', name: 'Sourdough Loaf', detail: '3 units remaining', progress: 10 }
];

export const supplierDeliveries = [
  { title: 'Fresh Lettuce Batch', meta: 'Mar 14, 2024 • 2,400 units', good: true },
  { title: 'Organic Avocados', meta: 'Mar 12, 2024 • 800 units', good: true },
  { title: 'Baby Spinach Packs', meta: 'Mar 09, 2024 • 1,500 units', danger: true }
];

export const purchaseOrderItems = [
  { title: 'Organic Gala Apples', detail: 'Qty: 250 kg • $2.40/kg', price: '$600.00' },
  { title: 'Fresh Spinach Bundles', detail: 'Qty: 400 pcs • $1.20/pc', price: '$480.00' },
  { title: 'Hass Avocados (Premium)', detail: 'Qty: 30 cases • $32.00/cs', price: '$960.00' },
  { title: 'Baby Carrots 500g', detail: 'Qty: 150 bags • $1.40/bg', price: '$210.00' }
];

export const settingsPlaceholders = [
  { title: 'Store Controls', value: 'Regional operating hours, tax regions, and permissions will be surfaced in the next iteration.', icon: UserCog },
  { title: 'Security', value: 'SSO, audit logs, and recovery controls can slot into this page without modifying the app shell.', icon: BadgeCheck },
  { title: 'Notifications', value: 'Alert routing and escalation rules can be configured here once backend settings APIs are exposed.', icon: Bell }
];

export const chartPoints = [12000, 19000, 15000, 22000, 28000, 32000, 38000];
export const donutSegments = [42, 28, 15, 15];
export const supplyBars = [32, 46, 39, 64, 56, 78];
export const signInProviders = [
  { label: 'Google', icon: 'G' },
  { label: 'Microsoft', icon: 'M' }
];

export const securityLinks = ['Privacy Policy', 'Help Center', 'Security Audit'];

export const reviewQuote = '"The quality is amazing,\nbut the packaging was\nslightly leaked when it\narrived. Still tastes great\nthough!"';
