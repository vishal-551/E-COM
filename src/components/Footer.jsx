import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { settings } = useStore();
  return (
    <footer className="bg-charcoal text-white mt-14">
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div><h3 className="text-gold text-xl font-semibold mb-2">{settings.storeName}</h3><p className="text-sm text-white/80">{settings.footerText}</p></div>
        <div><h4 className="font-semibold mb-2">Quick Links</h4><div className="grid gap-1 text-sm"><Link to="/shop">Shop</Link><Link to="/offers">Offers</Link><Link to="/order-tracking">Track Order</Link><Link to="/faq">FAQ</Link></div></div>
        <div><h4 className="font-semibold mb-2">Policies</h4><div className="grid gap-1 text-sm"><Link to="/privacy-policy">Privacy Policy</Link><Link to="/terms-and-conditions">Terms</Link><Link to="/shipping-policy">Shipping</Link><Link to="/return-and-exchange-policy">Returns</Link></div></div>
        <div><h4 className="font-semibold mb-2">Contact & Social</h4><p className="text-sm">{settings.phone}<br />{settings.email}<br />{settings.address}</p><div className="text-sm mt-2 space-x-2"><a href={settings.instagram}>Instagram</a><a href={settings.facebook}>Facebook</a><a href={settings.youtube}>YouTube</a><a href={settings.whatsapp}>WhatsApp</a></div></div>
      </div>
      <div className="text-center text-xs py-3 border-t border-white/20">© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</div>
    </footer>
  );
}
