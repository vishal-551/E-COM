import { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';

const toast = (msg) => window.alert(msg);
const slugify = (v) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
const card = 'rounded-2xl border border-cyan-400/20 bg-white/10 backdrop-blur-lg shadow-[0_0_40px_rgba(20,184,166,0.15)] p-4';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('admin@khushijewallary.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(localStorage.getItem('aaj_admin') === '1');
  if (ok) return <div className="py-8"><a href="/admin/dashboard" className="text-gold">Go to Dashboard</a></div>;

  const login = () => {
    setLoading(true);
    setTimeout(() => {
      if (email && password) {
        localStorage.setItem('aaj_admin', '1');
        localStorage.setItem('aaj_admin_token', `jwt-demo-${Date.now()}`);
        toast('Admin login successful');
        setOk(true);
      }
      setLoading(false);
    }, 700);
  };

  return <div className="py-8 max-w-md mx-auto"><div className={card}><h1 className="section-title">Admin Login</h1><input value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded w-full my-2 bg-black/20"/><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="border p-2 rounded w-full bg-black/20"/><button disabled={loading} onClick={login} className="bg-charcoal text-white w-full mt-3 py-2 rounded">{loading ? 'Authenticating...' : 'Login'}</button></div></div>;
};

export const AdminDashboard = () => {
  const { products, users, orders, enquiries, activities } = useStore();
  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const stats = [
    ['Total users', users.length], ['Total orders', orders.length], ['Total revenue', `₹${revenue}`], ['Contact enquiries', enquiries.length],
  ];
  return <div className="py-8 space-y-4"><h1 className="section-title">Neon Admin Dashboard</h1><div className="grid md:grid-cols-4 gap-3">{stats.map(([k, v]) => <div key={k} className={card}><p className="text-sm text-cyan-100">{k}</p><p className="text-2xl font-semibold text-white">{v}</p></div>)}</div><div className={card}><h3 className="font-semibold mb-2 text-cyan-100">Recent activity</h3>{activities.length ? activities.slice(0, 6).map((a) => <p key={a.id} className="text-sm text-white/90">• {a.message}</p>) : <p className="text-sm text-white/90">No recent activity.</p>}</div></div>;
};

export const AdminProducts = () => {
  const { products, setProducts, categories, addActivity } = useStore();
  const [form, setForm] = useState({ name: '', category: categories[0]?.name || '', price: 999, oldPrice: 1299, description: '', thumbnail: '' });
  const [preview, setPreview] = useState('');

  const saveProduct = () => {
    const payload = {
      ...form,
      id: Date.now(),
      slug: slugify(form.name),
      discount: Math.round(((form.oldPrice - form.price) / form.oldPrice) * 100),
      reviewCount: 0,
      rating: 0,
      images: [form.thumbnail, ...(preview ? [preview] : [])].filter(Boolean),
      availability: 'In Stock',
      shortDescription: form.description,
      tags: ['new', 'offer'],
    };
    setProducts([payload, ...products]);
    addActivity(`Product added: ${payload.name}`);
    toast('Product added');
    setForm({ ...form, name: '', description: '', thumbnail: '' });
    setPreview('');
  };

  const del = (id) => {
    setProducts(products.filter((p) => p.id !== id));
    addActivity(`Product deleted: ${id}`);
  };

  return <div className="py-8 grid lg:grid-cols-3 gap-4"><div className={`${card} space-y-2`}>{Object.entries(form).map(([k, v]) => k === 'category' ? <select key={k} value={v} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="border p-2 rounded w-full bg-black/20">{categories.map((c) => <option key={c.id || c.name}>{c.name}</option>)}</select> : <input key={k} value={v} onChange={(e) => { setForm({ ...form, [k]: e.target.value }); if (k === 'thumbnail') setPreview(e.target.value); }} placeholder={k} className="border p-2 rounded w-full bg-black/20" />)}{preview && <img src={preview} className="h-24 w-full object-cover rounded" />}<button onClick={saveProduct} className="w-full bg-charcoal text-white py-2 rounded">Save Product</button></div><div className="lg:col-span-2 space-y-2">{products.slice(0, 25).map((p) => <div key={p.id} className={`${card} flex justify-between`}><div>{p.name}<p className="text-xs">₹{p.price} • {p.category}</p></div><button onClick={() => del(p.id)} className="text-red-300">Delete</button></div>)}</div></div>;
};

export const AdminCategories = () => {
  const { categories, setCategories, addActivity } = useStore();
  const [name, setName] = useState('');
  return <div className="py-8"><h1 className="section-title mb-3">Manage Categories</h1><div className={card}><input value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded bg-black/20" placeholder="Category"/><button onClick={() => { setCategories([...categories, { id: Date.now(), name, slug: slugify(name) }]); addActivity(`Category added: ${name}`); setName(''); }} className="ml-2 bg-charcoal text-white px-3 py-2 rounded">Add</button><div className="mt-3 flex flex-wrap gap-2">{categories.map((c) => <span key={c.id} className="bg-blush/70 px-2 py-1 rounded text-sm">{c.name}</span>)}</div></div></div>;
};

export const AdminOrders = () => { const { orders } = useStore(); return <div className="py-8"><h1 className="section-title mb-3">Manage Orders</h1>{orders.map((o) => <div key={o.id} className={`${card} mb-2`}>{o.id} - ₹{o.total} - {o.status}</div>)}{!orders.length && <div className={card}>No orders yet.</div>}</div>; };

export const AdminBanners = () => {
  const { banners, setBanners, settings, setSettings, addActivity } = useStore();
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  return <div className="py-8 space-y-3"><h1 className="section-title">Banner & Media Control</h1><div className={card}><div className="grid md:grid-cols-3 gap-2"><input value={title} onChange={(e) => setTitle(e.target.value)} className="border p-2 rounded bg-black/20" placeholder="Banner title"/><input value={image} onChange={(e) => setImage(e.target.value)} className="border p-2 rounded bg-black/20" placeholder="Banner image URL"/><button onClick={() => { setBanners([...banners, { id: Date.now(), title, subtitle: 'New banner', image, cta: 'Shop now' }]); addActivity(`Banner added: ${title}`); setTitle(''); setImage(''); }} className="bg-charcoal text-white px-3 py-2 rounded">Upload banner</button></div></div><div className={card}><h3 className="font-semibold mb-2">Hero & thumbnail images</h3><input placeholder="Hero image URL" className="border p-2 rounded bg-black/20 mr-2" onKeyDown={(e) => { if (e.key === 'Enter') setSettings({ ...settings, heroImages: [...settings.heroImages, e.currentTarget.value] }); }} /><input placeholder="Thumbnail URL" className="border p-2 rounded bg-black/20" onKeyDown={(e) => { if (e.key === 'Enter') setSettings({ ...settings, thumbnailImages: [...settings.thumbnailImages, e.currentTarget.value] }); }} /></div></div>;
};

export const AdminCustomers = () => {
  const { enquiries, setEnquiries } = useStore();
  const toggle = (id) => setEnquiries((p) => p.map((e) => e.id === id ? { ...e, isRead: !e.isRead } : e));
  return <div className="py-8"><h1 className="section-title mb-3">Enquiry Management</h1>{enquiries.map((e) => <div key={e.id} className={`${card} mb-2 flex justify-between`}><div>{e.name} • {e.subject}<p className="text-xs">{e.email}</p></div><button onClick={() => toggle(e.id)} className="text-cyan-200">Mark as {e.isRead ? 'unread' : 'read'}</button></div>)}{!enquiries.length && <div className={card}>No enquiries yet.</div>}</div>;
};

export const AdminCoupons = () => {
  const { offers, setOffers } = useStore();
  const [offer, setOffer] = useState({ title: '', type: 'percent', value: 10, applyType: 'category', target: '' });
  return <div className="py-8"><h1 className="section-title mb-3">Offers Management</h1><div className={card}><div className="grid md:grid-cols-5 gap-2"><input value={offer.title} onChange={(e) => setOffer({ ...offer, title: e.target.value })} className="border p-2 rounded bg-black/20" placeholder="Offer title"/><select value={offer.type} onChange={(e) => setOffer({ ...offer, type: e.target.value })} className="border p-2 rounded bg-black/20"><option value="percent">%</option><option value="fixed">Fixed</option></select><input value={offer.value} onChange={(e) => setOffer({ ...offer, value: Number(e.target.value) })} className="border p-2 rounded bg-black/20" type="number"/><select value={offer.applyType} onChange={(e) => setOffer({ ...offer, applyType: e.target.value })} className="border p-2 rounded bg-black/20"><option value="category">Category</option><option value="product">Product</option></select><input value={offer.target} onChange={(e) => setOffer({ ...offer, target: e.target.value })} className="border p-2 rounded bg-black/20" placeholder="Target"/></div><button onClick={() => { setOffers([{ ...offer, id: Date.now() }, ...offers]); toast('Offer created'); }} className="mt-2 bg-charcoal text-white px-3 py-2 rounded">Create offer</button><div className="mt-3 space-y-2">{offers.map((o) => <div key={o.id} className="text-sm">{o.title} • {o.value}{o.type === 'percent' ? '%' : '₹'} on {o.applyType}: {o.target}</div>)}</div></div></div>;
};

export const AdminReviews = () => <div className="py-8"><h1 className="section-title">Reviews Management</h1><div className={card}>Review moderation module placeholder.</div></div>;

export const AdminSettings = () => {
  const { settings, setSettings, users, setUsers } = useStore();
  const [draft, setDraft] = useState(settings);
  const blockedCount = useMemo(() => users.filter((u) => u.isBlocked).length, [users]);

  return <div className="py-8 space-y-3"><h1 className="section-title">Content & Social Management</h1><div className={`${card} grid md:grid-cols-2 gap-2`}>{Object.entries(draft).map(([k, v]) => <input key={k} value={Array.isArray(v) ? v.join(',') : v} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} className="border p-2 rounded bg-black/20" placeholder={k} />)}<button onClick={() => { setSettings({ ...draft, heroImages: String(draft.heroImages || '').split(',').filter(Boolean), thumbnailImages: String(draft.thumbnailImages || '').split(',').filter(Boolean) }); toast('Content updated'); }} className="md:col-span-2 bg-charcoal text-white py-2 rounded">Save Content</button></div><div className={card}><h3 className="font-semibold mb-2">User Management</h3><p className="text-sm mb-2">Registered users: {users.length} • Blocked: {blockedCount}</p>{users.map((u) => <div key={u.id} className="flex justify-between text-sm border-b border-white/10 py-1"><span>{u.name} ({u.email})</span><div className="space-x-2"><button onClick={() => setUsers((p) => p.map((x) => x.id === u.id ? { ...x, isBlocked: !x.isBlocked } : x))} className="text-amber-200">{u.isBlocked ? 'Unblock' : 'Block'}</button><button onClick={() => setUsers((p) => p.filter((x) => x.id !== u.id))} className="text-red-300">Delete</button></div></div>)}</div></div>;
};
