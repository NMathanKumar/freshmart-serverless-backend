import {
  CreditCard,
  Globe2,
  Nfc,
  Share2,
  WalletCards,
} from 'lucide-react';

const FooterLink = ({ children }: { children: string }) => (
  <li>
    <a
      className="text-[13px] text-[#3e4a3d] transition-colors hover:text-[#006b2c]"
      href={`#${children.toLowerCase().replaceAll(' ', '-')}`}
    >
      {children}
    </a>
  </li>
);

export const HomeFooter = () => (
  <footer className="border-t border-[#e2ebdE] bg-white">
    <div className="mx-auto grid max-w-7xl grid-cols-3 gap-12 px-10 py-16">
      <div className="space-y-4">
        <strong className="text-xl font-bold tracking-tight text-[#006b2c]">
          FreshMart
        </strong>
        <p className="max-w-[280px] text-[13px] leading-relaxed text-[#3e4a3d]">
          Experience the next generation of quick commerce. Premium quality,
          delivered in minutes.
        </p>
        <div className="flex gap-3">
          <a
            aria-label="FreshMart website"
            className="footer-social"
            href="#website"
          >
            <Globe2 aria-hidden="true" className="h-4 w-4" />
          </a>
          <a
            aria-label="Share FreshMart"
            className="footer-social"
            href="#share"
          >
            <Share2 aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="space-y-4 pl-8">
        <h2 className="text-sm font-extrabold text-[#171d16]">Company</h2>
        <ul className="space-y-2.5">
          <FooterLink>About Us</FooterLink>
          <FooterLink>Sustainability</FooterLink>
          <FooterLink>Careers</FooterLink>
          <FooterLink>Newsroom</FooterLink>
        </ul>
      </div>
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-[#171d16]">Support</h2>
        <ul className="space-y-2.5">
          <FooterLink>Help Center</FooterLink>
          <FooterLink>Privacy Policy</FooterLink>
          <FooterLink>Partner with Us</FooterLink>
          <FooterLink>Terms of Service</FooterLink>
        </ul>
      </div>
    </div>
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 border-t border-[#e2ebdE] px-10 py-6">
      <span className="text-[11px] font-medium text-[#8b9888]">
        © 2024 FreshMart Inc. Premium Quick Commerce.
      </span>
      <div className="flex gap-5 text-[#bdcaba]">
        <WalletCards
          aria-label="Digital payments accepted"
          className="h-5 w-5"
        />
        <CreditCard aria-label="Credit cards accepted" className="h-5 w-5" />
        <Nfc aria-label="Contactless payments accepted" className="h-5 w-5" />
      </div>
    </div>
  </footer>
);
