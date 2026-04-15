import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const navLinks = [
  ['/', 'Home'],
  ['/shop', 'Shop'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
  ['/faq', 'FAQ'],
];

export default function Navbar() {
  const { cart, wishlist, user } = useStore();

  return (
    <header className="bg-white/95 sticky top-0 z-40 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-charcoal">E-COM</Link>
        <nav className="hidden md:flex gap-5 text-sm font-medium">
          {navLinks.map(([to, label]) => <Link key={to} to={to} className="hover:text-gold">{label}</Link>)}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/wishlist">Wishlist ({wishlist.length})</Link>
          <Link to="/cart">Cart ({cart.length})</Link>
          <Link to={user ? '/profile' : '/login'}>{user ? 'Account' : 'Login'}</Link>
          <Link to="/admin/login" className="text-gold">Admin</Link>
        </div>
      </div>
    </header>
  );
}
