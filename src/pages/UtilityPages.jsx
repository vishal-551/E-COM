import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

export function WishlistPage() {
  const { wishlist } = useStore();
  return <div className="py-8"><h1 className="section-title mb-4">Wishlist</h1>{wishlist.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{wishlist.map((p)=><ProductCard key={p.id} product={p}/>)}</div> : <div className="premium-card p-8 text-center">Your wishlist is empty.</div>}</div>;
}

export function CartPage() {
  const { cart, updateQty, removeFromCart, placeOrder } = useStore();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = Math.round(subtotal * 0.1);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal - discount + shipping;
  return <div className="py-8"><h1 className="section-title mb-4">Cart</h1>{cart.length ? <div className="grid lg:grid-cols-3 gap-4"><div className="lg:col-span-2 space-y-3">{cart.map((i)=><div key={i.id} className="premium-card p-3 flex gap-3"><img src={i.thumbnail} className="h-20 w-20 rounded object-cover"/><div className="flex-1"><p className="font-medium">{i.name}</p><p className="text-sm">₹{i.price}</p><div className="flex gap-2 mt-2"><button onClick={()=>updateQty(i.id, i.qty-1)} className="border px-2">-</button><span>{i.qty}</span><button onClick={()=>updateQty(i.id, i.qty+1)} className="border px-2">+</button><button onClick={()=>removeFromCart(i.id)} className="text-red-500 text-sm">Remove</button></div></div></div>)}</div><div className="premium-card p-4 h-fit"><p>Subtotal ₹{subtotal}</p><p>Discount ₹{discount}</p><p>Shipping ₹{shipping}</p><p className="font-semibold mt-2">Total ₹{total}</p><Link to="/checkout" className="block mt-3 bg-charcoal text-white text-center py-2 rounded">Proceed to checkout</Link><button onClick={()=>placeOrder({items:cart,total,payment:'COD'})} className="mt-2 w-full border py-2 rounded">Quick order demo</button></div></div> : <div className="premium-card p-8 text-center">Your cart is empty.</div>}</div>;
}

export function CheckoutPage() {
  const nav = useNavigate();
  const { cart, placeOrder } = useStore();
  const [form, setForm] = useState({name:'',phone:'',email:'',address:'',city:'',state:'',pincode:'',landmark:'',payment:'COD'});
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const onSubmit = (e) => { e.preventDefault(); const order=placeOrder({items:cart,total,shipping:form,payment:form.payment}); alert(`Order placed: ${order.id}`); nav('/my-orders'); };
  return <div className="py-8 grid lg:grid-cols-3 gap-4"><form onSubmit={onSubmit} className="lg:col-span-2 premium-card p-4 grid md:grid-cols-2 gap-3">{Object.entries(form).map(([k,v])=>k!=='payment'&&<input key={k} required value={v} onChange={(e)=>setForm({...form,[k]:e.target.value})} placeholder={k} className="border rounded p-2"/>)}<select value={form.payment} onChange={(e)=>setForm({...form,payment:e.target.value})} className="border rounded p-2 md:col-span-2"><option>COD</option><option>UPI</option><option>Card</option><option>Net Banking</option><option>Wallet</option></select><button className="bg-charcoal text-white py-2 rounded md:col-span-2">Place Order</button></form><aside className="premium-card p-4"><h3 className="font-semibold">Order Summary</h3><p className="text-sm">Items: {cart.length}</p><p className="font-semibold mt-2">Total ₹{total}</p></aside></div>;
}

export function ContactPage() {
  const { setEnquiries } = useStore();
  const [data, setData] = useState({name:'',phone:'',email:'',subject:'',message:''});
  return <div className="py-8"><h1 className="section-title mb-4">Contact Us</h1><form onSubmit={(e)=>{e.preventDefault();setEnquiries((p)=>[{id:Date.now(),...data},...p]);setData({name:'',phone:'',email:'',subject:'',message:''});alert('Message sent');}} className="premium-card p-4 grid md:grid-cols-2 gap-3">{Object.entries(data).map(([k,v])=><input key={k} required value={v} onChange={(e)=>setData({...data,[k]:e.target.value})} placeholder={k} className="border rounded p-2"/>)}<button className="bg-charcoal text-white py-2 rounded md:col-span-2">Send Message</button></form></div>;
}

export const AboutPage = () => <div className="py-8 space-y-3"><h1 className="section-title">About Aarohi Artificial Jewellery</h1><p>Our brand celebrates Indian weddings, festivals and modern daily styling through premium-finish artificial jewellery.</p><p>Mission: deliver affordable luxury with trustworthy quality and fast service.</p></div>;
export const FAQPage = () => <div className="py-8"><h1 className="section-title mb-4">FAQ</h1><div className="space-y-2">{['Is the jewellery anti-tarnish?','What is the delivery time?','Do you offer COD?','Can I return a product?','How can I track my order?'].map((q)=><details key={q} className="premium-card p-3"><summary>{q}</summary><p className="text-sm mt-2">Yes, details are shared in policies and product descriptions.</p></details>)}</div></div>;
export const AccountPage = () => <div className="py-8"><h1 className="section-title">My Account</h1><p className="mt-2">Profile details, addresses, wishlist, orders and password update placeholders ready.</p></div>;
export const MyOrdersPage = () => { const {orders}=useStore(); return <div className="py-8"><h1 className="section-title mb-4">My Orders</h1>{orders.map((o)=><div key={o.id} className="premium-card p-3 mb-2">{o.id} • {o.status} • ₹{o.total}</div>)}{!orders.length&&<div className="premium-card p-4">No orders yet.</div>}</div>; };
export const TrackingPage = () => <div className="py-8 premium-card p-4"><h1 className="section-title">Order Tracking</h1><input placeholder="Order ID" className="border p-2 rounded mr-2 mt-2"/><input placeholder="Email or phone" className="border p-2 rounded mt-2"/><div className="mt-3 text-sm">Stages: Order placed → Confirmed → Packed → Shipped → Out for delivery → Delivered</div></div>;
export const LoginPage = () => <div className="py-8 max-w-md mx-auto premium-card p-4"><h1 className="section-title">Login</h1><input className="border p-2 rounded w-full my-2" placeholder="Email"/><input type="password" className="border p-2 rounded w-full mb-2" placeholder="Password"/><button className="bg-charcoal text-white py-2 rounded w-full">Login</button></div>;
export const SignupPage = () => <div className="py-8 max-w-md mx-auto premium-card p-4"><h1 className="section-title">Signup</h1><input className="border p-2 rounded w-full my-2" placeholder="Name"/><input className="border p-2 rounded w-full my-2" placeholder="Email"/><input type="password" className="border p-2 rounded w-full mb-2" placeholder="Password"/><button className="bg-charcoal text-white py-2 rounded w-full">Create account</button></div>;
export const PolicyPage = ({title}) => <div className="py-8"><h1 className="section-title mb-3">{title}</h1><div className="premium-card p-4 text-sm space-y-2"><p>This page contains editable policy content for a real ecommerce business.</p><p>Replace business details, SLA, legal terms, and customer support commitments as needed.</p></div></div>;
export const NotFoundPage = () => <div className="py-20 text-center"><h1 className="text-5xl font-bold">404</h1><p>Page not found.</p><Link to="/" className="text-gold">Go Home</Link></div>;
