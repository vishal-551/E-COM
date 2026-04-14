import { Link } from 'react-router-dom';

const navLinks = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/services', 'Services'],
  ['/projects', 'Projects'],
  ['/blog', 'Blog'],
  ['/contact', 'Contact'],
  ['/faq', 'FAQ'],
  ['/admin/login', 'Admin'],
];

export default function Navbar() {
  return (
    <header className="bg-white/95 sticky top-0 z-40 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-charcoal">NovaCraft Agency</Link>
        <nav className="hidden md:flex gap-5 text-sm font-medium">
          {navLinks.map(([to, label]) => <Link key={to} to={to} className="hover:text-gold">{label}</Link>)}
        </nav>
      </div>
    </header>
  );
}
