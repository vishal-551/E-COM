import { Heart, Menu, Search, ShoppingBag, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '../context/StoreContext';

const links = [
  ['/', 'Home'], ['/shop', 'Shop'], ['/categories', 'Categories'], ['/new-arrivals', 'New Arrivals'], ['/best-sellers', 'Best Sellers'], ['/bridal-collection', 'Bridal Collection'], ['/about', 'About'], ['/contact', 'Contact'],
];

export default function Navbar() {
  const { cart, wishlist, settings } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="bg-charcoal text-white text-center py-2 text-sm">Free Shipping on Orders Above ₹999 • Festival Offers up to 40% Off</div>
      <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur border-b border-champagne">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="text-xl font-bold tracking-wide text-gold">{settings.storeName}</Link>
          <div className="hidden lg:flex gap-5 text-sm">{links.map(([to, label]) => <Link key={to} to={to} className="hover:text-gold">{label}</Link>)}</div>
          <div className="flex items-center gap-3">
            <Search size={18} /><Link to="/wishlist" className="relative"><Heart size={18} /><span className="absolute -top-2 -right-2 text-xs bg-gold text-white rounded-full px-1">{wishlist.length}</span></Link>
            <Link to="/cart" className="relative"><ShoppingBag size={18} /><span className="absolute -top-2 -right-2 text-xs bg-gold text-white rounded-full px-1">{cart.length}</span></Link>
            <Link to="/account"><User size={18} /></Link>
            <button className="lg:hidden" onClick={() => setOpen(!open)}><Menu size={20} /></button>
          </div>
        </nav>
        {open && <div className="lg:hidden px-4 pb-4 grid gap-2">{links.map(([to, label]) => <Link onClick={() => setOpen(false)} key={to} to={to}>{label}</Link>)}</div>}
      </header>
    </>
  );
}
