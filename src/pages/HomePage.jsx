import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

export default function HomePage() {
  const { banners, categories, products, testimonials } = useStore();
  const best = products.filter((p) => p.bestseller).slice(0, 8);
  const arrivals = products.filter((p) => p.newArrival).slice(0, 8);
  return (
    <div className="space-y-12 py-8">
      <section className="grid md:grid-cols-3 gap-4">{banners.map((b) => <div key={b.id} className="premium-card overflow-hidden relative"><img src={b.image} className="h-64 w-full object-cover" /><div className="absolute inset-0 bg-black/35 text-white p-5 flex flex-col justify-end"><h2 className="text-2xl font-semibold">{b.title}</h2><p>{b.subtitle}</p><Link to="/shop" className="mt-3 inline-block bg-gold px-4 py-2 rounded-lg">{b.cta}</Link></div></div>)}</section>
      <section><h2 className="section-title mb-4">Featured Categories</h2><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{categories.map((c) => <Link key={c.id} to={`/shop?category=${c.name}`} className="premium-card p-3 text-center"><img src={c.image} className="h-20 w-full object-cover rounded-lg mb-2" /><p className="text-sm font-medium">{c.name}</p></Link>)}</div></section>
      <section><h2 className="section-title mb-4">Best Selling Beauties</h2><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{best.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>
      <section><h2 className="section-title mb-4">New Arrivals You’ll Love</h2><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{arrivals.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>
      <section className="premium-card p-6 grid md:grid-cols-3 gap-4"><div><h3 className="font-semibold mb-2">Why choose us</h3><ul className="text-sm space-y-1 list-disc pl-4"><li>Premium quality</li><li>Lightweight design</li><li>Affordable pricing</li><li>Fast shipping</li><li>Easy returns</li></ul></div><div className="md:col-span-2"><h3 className="font-semibold mb-3">Customer Love</h3><div className="grid md:grid-cols-2 gap-3">{testimonials.map((t) => <div key={t.id} className="bg-blush/40 p-3 rounded-lg"><p className="text-sm">“{t.text}”</p><p className="text-xs mt-1 text-gray-600">— {t.name}</p></div>)}</div></div></section>
    </div>
  );
}
