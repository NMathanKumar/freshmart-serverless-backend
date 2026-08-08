import { Link } from 'react-router-dom';

const FooterLink = ({ children, to }: { children: string; to: string }) => (
  <li>
    <Link
      className="text-[13px] text-[#3e4a3d] transition-colors hover:text-[#006b2c]"
      to={to}
    >
      {children}
    </Link>
  </li>
);

export const HomeFooter = () => (
  <footer className="border-t border-[#e2ebdE] bg-white">
    <div className="mx-auto grid max-w-7xl grid-cols-3 gap-12 px-10 py-12">
      <div className="space-y-4">
        <strong className="text-xl font-bold tracking-tight text-[#006b2c]">
          FreshMart
        </strong>
        <p className="max-w-[280px] text-[13px] leading-relaxed text-[#3e4a3d]">
          Experience the next generation of quick commerce. Premium quality,
          delivered in minutes.
        </p>
      </div>
      <div className="space-y-4 pl-8">
        <h2 className="text-sm font-extrabold text-[#171d16]">Company</h2>
        <ul className="space-y-2.5">
          <FooterLink to="/about">About Us</FooterLink>
        </ul>
      </div>
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-[#171d16]">Support</h2>
        <ul className="space-y-2.5">
          <FooterLink to="/help">Help Center</FooterLink>
        </ul>
      </div>
    </div>
  </footer>
);
