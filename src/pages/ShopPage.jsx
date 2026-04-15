import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

export default function ShopPage({ preset }) {
  const { products, categories } = useStore();
  const [params] = useSearchParams();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState(params.get('category') || 'All');
  const [sort, setSort] = useState('latest');
  const list = useMemo(() => {
    let out = products.filter((p) => {
      const categoryName = p.category || '';
      const normalizedCategory = category.toLowerCase();
      const categoryMatches = category === 'All'
        || categoryName.toLowerCase() === normalizedCategory
        || categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-') === normalizedCategory;
      return categoryMatches && (!preset || preset(p))
      && `${p.name} ${categoryName} ${p.brand || ''}`.toLowerCase().includes(q.toLowerCase());
    });
    if (sort === 'low') out = [...out].sort((a, b) => Number(a.salePrice || a.price) - Number(b.salePrice || b.price));
    if (sort === 'high') out = [...out].sort((a, b) => Number(b.salePrice || b.price) - Number(a.salePrice || a.price));
    return out;
  }, [products, category, q, sort, preset]);

  return (
    <div className="py-8 space-y-5">
      <h1 className="section-title">Shop All Products</h1>
      <div className="premium-card p-4 grid md:grid-cols-4 gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, category, brand" className="border rounded-lg px-3 py-2" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded-lg px-3 py-2"><option>All</option>{categories.map((c) => <option key={c._id}>{c.name}</option>)}</select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded-lg px-3 py-2"><option value="latest">Latest</option><option value="low">Price low to high</option><option value="high">Price high to low</option></select>
        <div className="text-sm flex items-center">{list.length} products</div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{list.map((p) => <ProductCard key={p._id} product={p} />)}</div>
    </div>
  );
}
