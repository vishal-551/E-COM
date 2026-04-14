import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

export default function HomePage() {
  const { banners, categories, products, settings } = useStore();
  const best = products.filter((p) => p.featured).slice(0, 8);
  const arrivals = products.slice(0, 8);

  return (
    <div className="space-y-12 py-8">
      <section className="premium-card p-6 text-center"><h1 className="text-3xl font-bold">{settings.homeText || 'Premium Collection'}</h1></section>
      <section className="grid md:grid-cols-3 gap-4">{banners.map((b) => <div key={b._id} className="premium-card overflow-hidden relative"><img src={b.image?.url} className="h-64 w-full object-cover" /><div className="absolute inset-0 bg-black/35 text-white p-5 flex flex-col justify-end"><h2 className="text-2xl font-semibold">{b.title}</h2><p>{b.subtitle}</p><Link to={b.link || '/shop'} className="mt-3 inline-block bg-gold px-4 py-2 rounded-lg">{b.cta || 'Shop Now'}</Link></div></div>)}</section>
      <section><h2 className="section-title mb-4">Featured Categories</h2><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{categories.map((c) => <Link key={c._id} to={`/shop?category=${c.slug || c.name}`} className="premium-card p-3 text-center"><img src={c.image} className="h-20 w-full object-cover rounded-lg mb-2" /><p className="text-sm font-medium">{c.name}</p></Link>)}</div></section>
      <section><h2 className="section-title mb-4">Best Selling Beauties</h2><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{best.map((p) => <ProductCard key={p._id} product={p} />)}</div></section>
      <section><h2 className="section-title mb-4">New Arrivals You’ll Love</h2><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{arrivals.map((p) => <ProductCard key={p._id} product={p} />)}</div></section>
    </div>
  );
}
