import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function ProductPage() {
  const { slug } = useParams();
  const { products, addToCart, toggleWishlist, reviews } = useStore();
  const product = products.find((p) => p.slug === slug);
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const related = useMemo(() => products.filter((p) => p.category === product?.category && p.id !== product?.id).slice(0, 4), [products, product]);
  if (!product) return <div className="py-16">Product not found.</div>;
  return <div className="py-8 grid lg:grid-cols-2 gap-8"><div><img src={product.images[img]} className="w-full h-[420px] object-cover rounded-2xl" /><div className="flex gap-2 mt-2">{product.images.map((im, i) => <button key={im+i} onClick={() => setImg(i)}><img src={im} className={`h-16 w-16 object-cover rounded ${img===i?'ring-2 ring-gold':''}`} /></button>)}</div></div><div className="space-y-3"><h1 className="text-3xl font-semibold">{product.name}</h1><div className="text-sm text-gray-500">{product.reviewCount} reviews • ⭐ {product.rating}</div><div className="flex gap-2 items-center"><span className="text-2xl font-semibold">₹{product.price}</span><span className="line-through">₹{product.oldPrice}</span><span className="bg-blush px-2 rounded">{product.discount}% Off</span></div><p>{product.shortDescription}</p><ul className="text-sm list-disc pl-5"><li>Material: {product.material}</li><li>Color: {product.color}</li><li>Occasion: {product.occasion}</li><li>{product.shippingInfo}</li></ul><div className="flex items-center gap-2"><button onClick={() => setQty(Math.max(1, qty - 1))} className="border px-3 py-1">-</button><span>{qty}</span><button onClick={() => setQty(qty + 1)} className="border px-3 py-1">+</button></div><div className="flex gap-2"><button onClick={() => addToCart(product, qty)} className="bg-charcoal text-white px-5 py-3 rounded-lg">Add to Cart</button><button onClick={() => toggleWishlist(product)} className="border border-gold px-5 py-3 rounded-lg">Wishlist</button></div><div className="premium-card p-4"><p className="text-sm">Pincode checker • Secure payment • Easy returns in 7 days.</p></div></div><div className="lg:col-span-2"><h2 className="section-title my-4">Related Products</h2><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div><h3 className="text-xl font-semibold mt-8 mb-3">Customer Reviews</h3><div className="grid md:grid-cols-2 gap-3">{reviews.map((r) => <div key={r.id} className="premium-card p-3"><p>⭐ {r.rating}</p><p className="text-sm">{r.comment}</p><p className="text-xs text-gray-500">{r.user}</p></div>)}</div></div></div>;
}
