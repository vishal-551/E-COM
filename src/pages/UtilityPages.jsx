import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { authService, storeService } from '../lib/services';

export function WishlistPage() {
  const { wishlist } = useStore();
  return <div className="py-8"><h1 className="section-title mb-4">Wishlist</h1>{wishlist.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{wishlist.map((p) => <ProductCard key={p._id} product={p} />)}</div> : <div className="premium-card p-8 text-center">Your wishlist is empty.</div>}</div>;
}

export function CartPage() {
  const { cart, updateQty, removeFromCart } = useStore();
  const subtotal = useMemo(() => cart.reduce((s, i) => s + Number(i.salePrice || i.price) * i.quantity, 0), [cart]);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;
  return <div className="py-8"><h1 className="section-title mb-4">Cart</h1>{cart.length ? <div className="grid lg:grid-cols-3 gap-4"><div className="lg:col-span-2 space-y-3">{cart.map((i) => <div key={i._id} className="premium-card p-3 flex gap-3"><img src={i.thumbnail?.url} className="h-20 w-20 rounded object-cover"/><div className="flex-1"><p className="font-medium">{i.name}</p><p className="text-sm">₹{Number(i.salePrice || i.price)}</p><div className="flex gap-2 mt-2"><button onClick={() => updateQty(i._id, i.quantity - 1)} className="border px-2">-</button><span>{i.quantity}</span><button onClick={() => updateQty(i._id, i.quantity + 1)} className="border px-2">+</button><button onClick={() => removeFromCart(i._id)} className="text-red-500 text-sm">Remove</button></div></div></div>)}</div><div className="premium-card p-4 h-fit"><p>Subtotal ₹{subtotal}</p><p>Shipping ₹{shipping}</p><p className="font-semibold mt-2">Total ₹{total}</p><Link to="/checkout" className="block mt-3 bg-charcoal text-white text-center py-2 rounded">Proceed to checkout</Link></div></div> : <div className="premium-card p-8 text-center">Your cart is empty.</div>}</div>;
}

export function CheckoutPage() {
  const nav = useNavigate();
  const { cart, user, loadPrivateData } = useStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', state: '', postalCode: '', country: 'India', payment: 'COD' });
  const subtotal = cart.reduce((s, i) => s + Number(i.salePrice || i.price) * i.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping - couponDiscount;

  const onApplyCoupon = async () => {
    try {
      const { discount } = await storeService.applyCoupon({ code: couponCode, subtotal });
      setCouponDiscount(discount);
    } catch (e) {
      window.alert(e.response?.data?.message || e.message);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return nav('/login');
    const items = cart.map((it) => ({ productId: it._id, qty: it.quantity, price: Number(it.salePrice || it.price), name: it.name, thumbnail: it.thumbnail?.url }));
    const order = await storeService.placeOrder({
      shipping: form,
      paymentMethod: form.payment,
      items,
      couponCode: couponCode || null,
      discountAmount: couponDiscount,
      subtotal,
      shippingAmount: shipping,
      total,
    });
    await loadPrivateData();
    nav(`/order-success/${order._id}`);
  };

  return <div className="py-8 grid lg:grid-cols-3 gap-4"><form onSubmit={onSubmit} className="lg:col-span-2 premium-card p-4 grid md:grid-cols-2 gap-3">{Object.entries(form).map(([k, v]) => k !== 'payment' && <input key={k} required value={v} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={k} className="border rounded p-2"/>)}<select value={form.payment} onChange={(e) => setForm({ ...form, payment: e.target.value })} className="border rounded p-2 md:col-span-2"><option>COD</option><option>UPI</option><option>Card</option></select><button className="bg-charcoal text-white py-2 rounded md:col-span-2">Place Order</button></form><aside className="premium-card p-4"><h3 className="font-semibold">Order Summary</h3><p className="text-sm">Items: {cart.length}</p><p>Subtotal: ₹{subtotal}</p><div className="mt-2 flex gap-2"><input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon" className="border rounded p-2 flex-1"/><button type="button" onClick={onApplyCoupon} className="px-3 rounded bg-charcoal text-white">Apply</button></div><p>Discount: ₹{couponDiscount}</p><p className="font-semibold mt-2">Total ₹{total}</p></aside></div>;
}

export function OrderSuccessPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const fallbackOrderId = location.state?.orderId;
  return (
    <div className="py-10 max-w-2xl mx-auto">
      <div className="premium-card p-8 text-center space-y-3">
        <h1 className="section-title">Order placed successfully</h1>
        <p>Thank you for your purchase. Your order is now saved in your account history.</p>
        {(orderId || fallbackOrderId) && <p className="text-sm text-slate-600">Order ID: {orderId || fallbackOrderId}</p>}
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/orders" className="bg-charcoal text-white px-5 py-2 rounded">View Orders</Link>
          <Link to="/shop" className="border px-5 py-2 rounded">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() { const [data, setData] = useState({ name: '', phone: '', email: '', subject: '', message: '' }); return <div className="py-8"><h1 className="section-title mb-4">Contact Us</h1><form onSubmit={async (e) => { e.preventDefault(); await storeService.submitEnquiry(data); setData({ name: '', phone: '', email: '', subject: '', message: '' }); window.alert('Message sent'); }} className="premium-card p-4 grid md:grid-cols-2 gap-3">{Object.entries(data).map(([k, v]) => <input key={k} required value={v} onChange={(e) => setData({ ...data, [k]: e.target.value })} placeholder={k} className="border rounded p-2"/>)}<button className="bg-charcoal text-white py-2 rounded md:col-span-2">Send Message</button></form></div>; }

export const AboutPage = () => <div className="py-8 space-y-3"><h1 className="section-title">About</h1><p>Premium fashion jewellery curated for every occasion.</p></div>;
export const FAQPage = () => <div className="py-8"><h1 className="section-title mb-4">FAQ</h1></div>;
export const AccountPage = () => { const { user } = useStore(); return <div className="py-8"><h1 className="section-title">My Profile</h1><p className="mt-2">Name: {user?.name || 'Guest'} • Email: {user?.email || 'Not logged in'}</p></div>; };
export const MyOrdersPage = () => { const [orders, setOrders] = useState([]); useEffect(() => { storeService.myOrders().then(setOrders).catch(() => setOrders([])); }, []); return <div className="py-8"><h1 className="section-title mb-4">My Orders</h1>{orders.map((o) => <div key={o._id} className="premium-card p-3 mb-2">{o._id} • {o.status} • ₹{o.total} {o.dispatch?.trackingId ? `• ${o.dispatch.trackingId}` : ''}</div>)}{!orders.length && <div className="premium-card p-4">No orders yet.</div>}</div>; };
export const TrackingPage = () => <div className="py-8 premium-card p-4"><h1 className="section-title">Order Tracking</h1><div className="mt-3 text-sm">Stages: Pending → Confirmed → Packed → Dispatched → Delivered</div></div>;
export const LoginPage = () => { const nav = useNavigate(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [forgot, setForgot] = useState(false); return <div className="py-8 max-w-md mx-auto premium-card p-4"><h1 className="section-title">Login</h1><input value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded w-full my-2" placeholder="Email"/><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="border p-2 rounded w-full mb-2" placeholder="Password"/>{forgot && <button onClick={async () => { const data = await authService.forgotPassword(email); window.alert(data.resetToken ? `Reset token: ${data.resetToken}` : 'Reset flow started'); }} className="border py-2 rounded w-full mb-2">Send reset link</button>}<button onClick={async () => { await authService.signIn({ email, password }); nav('/profile'); window.location.reload(); }} className="bg-charcoal text-white py-2 rounded w-full">Login</button><button onClick={() => setForgot(!forgot)} className="text-xs mt-2">Forgot password?</button></div>; };
export const SignupPage = () => { const nav = useNavigate(); const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); return <div className="py-8 max-w-md mx-auto premium-card p-4"><h1 className="section-title">Signup</h1><input value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded w-full my-2" placeholder="Name"/><input value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded w-full my-2" placeholder="Email"/><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="border p-2 rounded w-full mb-2" placeholder="Password"/><button onClick={async () => { await authService.signUp({ name, email, password }); window.alert('Signup successful.'); nav('/profile'); window.location.reload(); }} className="bg-charcoal text-white py-2 rounded w-full">Create account</button></div>; };
export const PolicyPage = () => {
  const { settings } = useStore();
  const location = useLocation();
  const slug = location.pathname.split('/').pop();
  const map = {
    privacy: ['Privacy Policy', settings.privacyPolicy],
    terms: ['Terms of Service', settings.termsOfService],
    shipping: ['Shipping Policy', settings.shippingPolicy],
    refund: ['Refund Policy', settings.refundPolicy],
  };
  const [title, content] = map[slug] || ['Policy', 'Policy content is not available yet.'];

  return <div className="py-8"><h1 className="section-title mb-3">{title}</h1><div className="premium-card p-4 text-sm space-y-2"><p>{content || `${title} content is coming soon.`}</p></div></div>;
};
export const NotFoundPage = () => <div className="py-20 text-center"><h1 className="text-5xl font-bold">404</h1><p>Page not found.</p><Link to="/" className="text-gold">Go Home</Link></div>;
