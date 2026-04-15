import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist, user } = useStore();
  const wished = wishlist.some((x) => x._id === product._id);
  const price = Number(product.salePrice || product.price || 0);
  const oldPrice = Number(product.price || price);
  const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const thumb = product.thumbnail?.url || product.galleryImages?.[0]?.url;

  const ensureAuth = async (fn) => {
    try {
      if (!user) return navigate('/login');
      await fn();
    } catch (e) {
      window.alert(e.message);
    }
  };

  return (
    <article className="premium-card overflow-hidden group">
      <Link to={`/product/${product.slug}`}><img src={thumb} alt={product.name} className="h-56 w-full object-cover group-hover:scale-105 transition" /></Link>
      <div className="p-4">
        <div className="text-xs text-gold mb-1">{product.category || 'General'}</div>
        <Link to={`/product/${product.slug}`} className="font-semibold line-clamp-1">{product.name}</Link>
        <div className="text-xs my-2">★ {product.rating || 4.5}</div>
        <div className="flex items-center gap-2"><span className="font-semibold">₹{price}</span><span className="line-through text-sm text-gray-500">₹{oldPrice}</span>{discount > 0 && <span className="text-xs bg-blush px-2 rounded">-{discount}%</span>}</div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => ensureAuth(() => addToCart(product))} className="flex-1 bg-charcoal text-white py-2 rounded-lg text-sm">Add to Cart</button>
          <button onClick={() => ensureAuth(() => toggleWishlist(product))} className={`p-2 rounded-lg border ${wished ? 'bg-blush border-rosegold' : 'border-champagne'}`}>{wished ? '♥' : '♡'}</button>
        </div>
      </div>
    </article>
  );
}
