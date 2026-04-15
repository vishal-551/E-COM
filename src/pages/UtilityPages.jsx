import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { authService, storeService } from '../lib/services';

const ORDER_STAGES = ['Pending', 'Confirmed', 'Packed', 'Dispatched', 'Delivered'];

export function WishlistPage() {
  const { wishlist } = useStore();

  return (
    <div className="py-8">
      <h1 className="section-title mb-4">Wishlist</h1>
      {wishlist.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wishlist.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="premium-card p-8 text-center">Your wishlist is empty.</div>
      )}
    </div>
  );
}

export function CartPage() {
  const { cart, updateQty, removeFromCart } = useStore();
  const subtotal = useMemo(() => cart.reduce((s, i) => s + Number(i.sale_price || i.price) * i.quantity, 0), [cart]);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <div className="py-8">
      <h1 className="section-title mb-4">Cart</h1>
      {cart.length ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {cart.map((i) => (
              <div key={i.id} className="premium-card p-3 flex gap-3">
                <img src={i.thumbnail_url} className="h-20 w-20 rounded object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-sm">₹{Number(i.sale_price || i.price)}</p>
                  <div className="flex gap-2 mt-2 items-center">
                    <button onClick={() => updateQty(i.id, i.quantity - 1)} className="border px-2">-</button>
                    <span>{i.quantity}</span>
                    <button onClick={() => updateQty(i.id, i.quantity + 1)} className="border px-2">+</button>
                    <button onClick={() => removeFromCart(i.id)} className="text-red-500 text-sm">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="premium-card p-4 h-fit">
            <p>Subtotal ₹{subtotal}</p>
            <p>Shipping ₹{shipping}</p>
            <p className="font-semibold mt-2">Total ₹{total}</p>
            <Link to="/checkout" className="block mt-3 bg-charcoal text-white text-center py-2 rounded">Proceed to checkout</Link>
          </div>
        </div>
      ) : (
        <div className="premium-card p-8 text-center">Your cart is empty.</div>
      )}
    </div>
  );
}

export function CheckoutPage() {
  const nav = useNavigate();
  const { cart, user } = useStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '', payment: 'COD' });

  const subtotal = useMemo(() => cart.reduce((s, i) => s + Number(i.sale_price || i.price) * i.quantity, 0), [cart]);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = Math.max(0, subtotal + shipping - couponDiscount);

  const onApplyCoupon = async () => {
    try {
      if (!couponCode.trim()) throw new Error('Please enter a coupon code');
      const { discount } = await storeService.applyCoupon({ code: couponCode, subtotal });
      setCouponDiscount(discount);
      setCouponMessage(`Coupon applied. You saved ₹${Math.round(discount)}.`);
    } catch (e) {
      setCouponDiscount(0);
      setCouponMessage(e.message);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return nav('/login');
    if (!cart.length) return window.alert('Your cart is empty.');

    setPlacingOrder(true);
    try {
      const items = cart.map((it) => ({
        product_id: it.id,
        quantity: it.quantity,
        unit_price: Number(it.sale_price || it.price),
        product_name: it.name,
        product_thumbnail_url: it.thumbnail_url,
      }));
      const order = await storeService.placeOrder({
        user_id: user.id,
        shipping_address: form,
        payment_method: form.payment,
        items,
        coupon_code: couponCode || null,
        discount_amount: couponDiscount,
        subtotal,
        shipping_amount: shipping,
        total_amount: total,
      });
      nav(`/order-success/${order.id}`);
    } catch (error) {
      window.alert(error.message || 'Unable to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="py-8 premium-card p-8 text-center">
        <h1 className="section-title mb-2">Checkout</h1>
        <p>Your cart is empty. Add products before checkout.</p>
        <Link to="/shop" className="inline-block mt-3 px-4 py-2 rounded bg-charcoal text-white">Go to shop</Link>
      </div>
    );
  }

  return (
    <div className="py-8 grid lg:grid-cols-3 gap-4">
      <form onSubmit={onSubmit} className="lg:col-span-2 premium-card p-4 grid md:grid-cols-2 gap-3">
        {Object.entries(form).map(([k, v]) => k !== 'payment' && (
          <input
            key={k}
            required
            value={v}
            onChange={(event) => setForm({ ...form, [k]: event.target.value })}
            placeholder={k}
            className="border rounded p-2"
          />
        ))}
        <select value={form.payment} onChange={(event) => setForm({ ...form, payment: event.target.value })} className="border rounded p-2 md:col-span-2">
          <option>COD</option>
          <option>UPI</option>
          <option>Card</option>
        </select>
        <button disabled={placingOrder} className="bg-charcoal text-white py-2 rounded md:col-span-2 disabled:opacity-70">
          {placingOrder ? 'Placing order...' : 'Place Order'}
        </button>
      </form>
      <aside className="premium-card p-4">
        <h3 className="font-semibold">Order Summary</h3>
        <p className="text-sm">Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
        <p>Subtotal: ₹{subtotal}</p>
        <p>Shipping: ₹{shipping}</p>
        <div className="mt-2 flex gap-2">
          <input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="Coupon" className="border rounded p-2 flex-1" />
          <button type="button" onClick={onApplyCoupon} className="px-3 rounded bg-charcoal text-white">Apply</button>
        </div>
        {couponMessage && <p className="mt-2 text-xs">{couponMessage}</p>}
        <p>Discount: ₹{couponDiscount}</p>
        <p className="font-semibold mt-2">Total ₹{total}</p>
      </aside>
    </div>
  );
}

export function OrderSuccessPage() {
  const { orderId } = useParams();

  return (
    <div className="py-8">
      <div className="premium-card p-8 text-center max-w-2xl mx-auto">
        <h1 className="section-title">Order Placed Successfully</h1>
        <p className="mt-3">Thank you for your purchase. Your order ID is:</p>
        <p className="mt-1 font-semibold break-all">{orderId}</p>
        <p className="text-sm mt-4">You can track status updates from your order history.</p>
        <div className="flex justify-center gap-2 mt-5">
          <Link to="/orders" className="px-4 py-2 rounded bg-charcoal text-white">View My Orders</Link>
          <Link to="/shop" className="px-4 py-2 rounded border">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [data, setData] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  return <div className="py-8"><h1 className="section-title mb-4">Contact Us</h1><form onSubmit={async (e) => { e.preventDefault(); await storeService.submitEnquiry(data); setData({ name: '', phone: '', email: '', subject: '', message: '' }); window.alert('Message sent'); }} className="premium-card p-4 grid md:grid-cols-2 gap-3">{Object.entries(data).map(([k, v]) => <input key={k} required value={v} onChange={(e) => setData({ ...data, [k]: e.target.value })} placeholder={k} className="border rounded p-2" />)}<button className="bg-charcoal text-white py-2 rounded md:col-span-2">Send Message</button></form></div>;
}

export const AboutPage = () => <div className="py-8 space-y-3"><h1 className="section-title">About</h1><p>Premium fashion jewellery curated for every occasion.</p></div>;
export const FAQPage = () => <div className="py-8"><h1 className="section-title mb-4">FAQ</h1></div>;
export const AccountPage = () => {
  const { user, profile } = useStore();
  return <div className="py-8"><h1 className="section-title">My Profile</h1><p className="mt-2">Name: {profile?.full_name || 'Guest'} • Email: {user?.email || 'Not logged in'}</p></div>;
};

export const MyOrdersPage = () => {
  const { user } = useStore();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      storeService.myOrders(user.id).then(setOrders);
    }
  }, [user]);

  return (
    <div className="py-8">
      <h1 className="section-title mb-4">My Orders</h1>
      {orders.map((order) => {
        const stageIndex = ORDER_STAGES.indexOf(order.status);
        return (
          <div key={order.id} className="premium-card p-4 mb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium break-all">Order #{order.id}</p>
              <p className="text-sm">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <p className="text-sm mt-1">Status: <span className="font-semibold">{order.status}</span></p>
            <div className="flex flex-wrap gap-1 mt-2">
              {ORDER_STAGES.map((stage, index) => (
                <span key={stage} className={`text-xs px-2 py-1 rounded ${index <= stageIndex ? 'bg-emerald-600/30' : 'bg-gray-500/20'}`}>
                  {stage}
                </span>
              ))}
              {order.status === 'Cancelled' && <span className="text-xs px-2 py-1 rounded bg-rose-600/30">Cancelled</span>}
            </div>
            {order.tracking_id && (
              <p className="text-sm mt-2">
                Tracking: {order.tracking_id}
                {order.courier_name ? ` (${order.courier_name})` : ''}
              </p>
            )}
            <div className="mt-3 space-y-2">
              {order.order_items.map((item) => (
                <div key={item.id} className="border border-white/10 rounded p-2 flex items-center gap-2">
                  {item.product_thumbnail_url && <img src={item.product_thumbnail_url} className="h-12 w-12 rounded object-cover" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product_name}</p>
                    <p className="text-xs">Qty: {item.quantity} × ₹{Number(item.unit_price)}</p>
                  </div>
                  <p className="text-sm font-semibold">₹{Number(item.line_total)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm grid grid-cols-2 gap-2 max-w-md">
              <p>Subtotal: ₹{Number(order.subtotal)}</p>
              <p>Shipping: ₹{Number(order.shipping_amount)}</p>
              <p>Discount: ₹{Number(order.discount_amount)}</p>
              <p className="font-semibold">Total: ₹{Number(order.total_amount)}</p>
            </div>
          </div>
        );
      })}
      {!orders.length && <div className="premium-card p-4">No orders yet.</div>}
    </div>
  );
};

export const TrackingPage = () => <div className="py-8 premium-card p-4"><h1 className="section-title">Order Tracking</h1><div className="mt-3 text-sm">Stages: Pending → Confirmed → Packed → Dispatched → Delivered</div></div>;
export const LoginPage = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgot, setForgot] = useState(false);
  return <div className="py-8 max-w-md mx-auto premium-card p-4"><h1 className="section-title">Login</h1><input value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded w-full my-2" placeholder="Email" /><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="border p-2 rounded w-full mb-2" placeholder="Password" />{forgot && <button onClick={async () => { await authService.resetPassword(email); window.alert('Reset email sent'); }} className="border py-2 rounded w-full mb-2">Send reset link</button>}<button onClick={async () => { await authService.signIn({ email, password }); nav('/profile'); }} className="bg-charcoal text-white py-2 rounded w-full">Login</button><button onClick={() => setForgot(!forgot)} className="text-xs mt-2">Forgot password?</button></div>;
};
export const SignupPage = () => {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return <div className="py-8 max-w-md mx-auto premium-card p-4"><h1 className="section-title">Signup</h1><input value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded w-full my-2" placeholder="Name" /><input value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded w-full my-2" placeholder="Email" /><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="border p-2 rounded w-full mb-2" placeholder="Password" /><button onClick={async () => { await authService.signUp({ email, password, fullName: name }); window.alert('Signup successful. Check your email verification.'); nav('/login'); }} className="bg-charcoal text-white py-2 rounded w-full">Create account</button></div>;
};
export const PolicyPage = ({ title }) => <div className="py-8"><h1 className="section-title mb-3">{title}</h1><div className="premium-card p-4 text-sm space-y-2"><p>This page contains editable policy content for a real ecommerce business.</p></div></div>;
export const NotFoundPage = () => <div className="py-20 text-center"><h1 className="text-5xl font-bold">404</h1><p>Page not found.</p><Link to="/" className="text-gold">Go Home</Link></div>;
