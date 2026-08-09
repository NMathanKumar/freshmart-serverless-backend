import { AppWindow, CreditCard, Globe2, Nfc, Play, Share2, WalletCards } from 'lucide-react';

const FooterLink = ({ children }: { children: string }) => <li><a className="text-base text-[#3e4a3d] transition-colors hover:text-[#006b2c]" href={`#${children.toLowerCase().replaceAll(' ', '-')}`}>{children}</a></li>;

export const HomeFooter = () => (
  <footer className="border-t border-[#bdcaba] bg-white">
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-4 md:px-10">
      <div className="space-y-4"><strong className="text-xl text-[#006b2c]">FreshMart</strong><p className="text-base text-[#3e4a3d]">Experience the next generation of quick commerce. Premium quality, delivered in minutes.</p><div className="flex gap-4"><a aria-label="FreshMart website" className="footer-social" href="#website"><Globe2 aria-hidden="true" className="h-5 w-5" /></a><a aria-label="Share FreshMart" className="footer-social" href="#share"><Share2 aria-hidden="true" className="h-5 w-5" /></a></div></div>
      <div className="space-y-4"><h2 className="text-sm font-bold">Company</h2><ul className="space-y-2"><FooterLink>About Us</FooterLink><FooterLink>Sustainability</FooterLink><FooterLink>Careers</FooterLink><FooterLink>Newsroom</FooterLink></ul></div>
      <div className="space-y-4"><h2 className="text-sm font-bold">Support</h2><ul className="space-y-2"><FooterLink>Help Center</FooterLink><FooterLink>Privacy Policy</FooterLink><FooterLink>Partner with Us</FooterLink><FooterLink>Terms of Service</FooterLink></ul></div>
      <div className="space-y-4"><h2 className="text-sm font-bold">Download App</h2><div className="space-y-3"><a className="app-store-button" href="#app-store"><AppWindow aria-hidden="true" className="h-6 w-6" /><span><small>Download on the</small><strong>App Store</strong></span></a><a className="app-store-button" href="#google-play"><Play aria-hidden="true" className="h-6 w-6" /><span><small>Get it on</small><strong>Google Play</strong></span></a></div></div>
    </div>
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-[#bdcaba] px-4 py-6 md:flex-row md:px-10"><span className="text-xs font-medium text-[#3e4a3d]">© 2024 FreshMart Inc. Premium Quick Commerce.</span><div className="flex gap-6 text-[#bdcaba]"><WalletCards aria-label="Digital payments accepted" /><CreditCard aria-label="Credit cards accepted" /><Nfc aria-label="Contactless payments accepted" /></div></div>
  </footer>
);
