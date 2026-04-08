import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const wished = wishlist.some((x) => x.id === product.id);
  return (
    <article className="premium-card overflow-hidden group">
      <Link to={`/product/${product.slug}`}><img src={product.thumbnail} alt={product.name} className="h-56 w-full object-cover group-hover:scale-105 transition" /></Link>
      <div className="p-4">
        <div className="text-xs text-gold mb-1">{product.category}</div>
        <Link to={`/product/${product.slug}`} className="font-semibold line-clamp-1">{product.name}</Link>
        <div className="flex items-center gap-1 text-amber-500 text-xs my-2"><Star size={14} fill="currentColor" /> {product.rating} ({product.reviewCount})</div>
        <div className="flex items-center gap-2"><span className="font-semibold">₹{product.price}</span><span className="line-through text-sm text-gray-500">₹{product.oldPrice}</span><span className="text-xs bg-blush px-2 rounded">-{product.discount}%</span></div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => addToCart(product)} className="flex-1 bg-charcoal text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1"><ShoppingCart size={14} />Add</button>
          <button onClick={() => toggleWishlist(product)} className={`p-2 rounded-lg border ${wished ? 'bg-blush border-rosegold' : 'border-champagne'}`}><Heart size={15} /></button>
        </div>
      </div>
    </article>
  );
}
