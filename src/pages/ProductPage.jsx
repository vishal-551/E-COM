import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, user } = useStore();
  const product = products.find((p) => p.slug === slug);
  const images = [product?.thumbnail?.url, ...(product?.galleryImages || []).map((x) => x.url)].filter(Boolean);
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const related = useMemo(() => products.filter((p) => (p.category === product?.category) && p._id !== product?._id).slice(0, 4), [products, product]);
  if (!product) return <div className="py-16">Product not found.</div>;
  return <div className="py-8 grid lg:grid-cols-2 gap-8"><div><img src={images[img]} className="w-full h-[420px] object-cover rounded-2xl" /><div className="flex gap-2 mt-2">{images.map((im, i) => <button key={im + i} onClick={() => setImg(i)}><img src={im} className={`h-16 w-16 object-cover rounded ${img === i ? 'ring-2 ring-gold' : ''}`} /></button>)}</div></div><div className="space-y-3"><h1 className="text-3xl font-semibold">{product.name}</h1><div className="text-sm text-gray-500">SKU: {product.sku}</div><div className="flex gap-2 items-center"><span className="text-2xl font-semibold">₹{Number(product.salePrice || product.price)}</span><span className="line-through">₹{Number(product.price)}</span></div><p>{product.description}</p><ul className="text-sm list-disc pl-5"><li>Brand: {product.brand || 'N/A'}</li><li>Stock: {product.stock}</li></ul><div className="flex items-center gap-2"><button onClick={() => setQty(Math.max(1, qty - 1))} className="border px-3 py-1">-</button><span>{qty}</span><button onClick={() => setQty(qty + 1)} className="border px-3 py-1">+</button></div><div className="flex gap-2"><button onClick={async () => { if (!user) return navigate('/login'); await addToCart(product, qty); }} className="bg-charcoal text-white px-5 py-3 rounded-lg">Add to Cart</button><button onClick={async () => { if (!user) return navigate('/login'); await toggleWishlist(product); }} className="border border-gold px-5 py-3 rounded-lg">Wishlist</button></div></div><div className="lg:col-span-2"><h2 className="section-title my-4">Related Products</h2><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{related.map((p) => <ProductCard key={p._id} product={p} />)}</div></div></div>;
}
