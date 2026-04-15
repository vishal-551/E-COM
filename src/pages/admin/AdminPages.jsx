import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, deleteImage, uploadImage } from '../../lib/supabase';
import { adminService, authService } from '../../lib/services';

const card = 'rounded-2xl border border-cyan-400/20 bg-white/10 backdrop-blur-lg shadow-[0_0_40px_rgba(20,184,166,0.15)] p-4';
const statusList = ['Pending', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'];

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const login = async () => {
    try {
      setLoading(true);
      setError('');
      const { user } = await authService.signIn({ email, password });
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') throw new Error('Admin access required');
      navigate('/admin', { replace: true });
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return <div className="py-8 max-w-md mx-auto"><div className={card}><h1 className="section-title">Admin Login</h1><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border p-2 rounded w-full my-2 bg-black/20"/><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="border p-2 rounded w-full bg-black/20"/>{error && <p className="mt-2 text-sm text-rose-200">{error}</p>}<button disabled={loading} onClick={login} className="bg-charcoal text-white w-full mt-3 py-2 rounded disabled:opacity-70 disabled:cursor-not-allowed">{loading ? 'Authenticating...' : 'Login'}</button></div></div>;
};

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  useEffect(() => { adminService.getDashboard().then(setData); }, []);
  if (!data) return <div className="py-8">Loading analytics...</div>;
  const stats = [['Total sales', `₹${Math.round(data.totalSales)}`], ['Total orders', data.totalOrders], ['Pending', data.pendingOrders], ['Dispatched', data.dispatchedOrders], ['Delivered', data.deliveredOrders], ['Cancelled', data.cancelledOrders], ['Total products', data.totalProducts], ['Low stock', data.lowStockCount], ['Total users', data.totalUsers]];
  return <div className="py-8 space-y-4"><h1 className="section-title">Admin Dashboard</h1><div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">{stats.map(([k, v]) => <div key={k} className={card}><p className="text-sm text-cyan-100">{k}</p><p className="text-2xl font-semibold text-white">{v}</p></div>)}</div><div className="grid lg:grid-cols-2 gap-3"><div className={card}><h3 className="font-semibold mb-2">Latest orders</h3>{data.latestOrders.map((o) => <p key={o.id} className="text-sm">#{o.id.slice(0, 8)} • {o.profile?.full_name} • ₹{o.total_amount} • {o.status}</p>)}</div><div className={card}><h3 className="font-semibold mb-2">Latest customers</h3>{data.latestCustomers.map((u) => <p key={u.id} className="text-sm">{u.full_name} • {u.email}</p>)}</div></div></div>;
};

export const AdminProducts = () => {
  const empty = { name: '', slug: '', description: '', category_id: '', brand: '', price: 0, sale_price: 0, stock: 0, sku: '', featured: false, is_active: true, thumbnail_url: '', thumbnail_path: '' };
  const [form, setForm] = useState(empty);
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState('');

  const load = async () => {
    const [{ data: items }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setRows(items || []);
    setCategories(cats || []);
  };
  useEffect(() => { load(); }, []);

  const uploadThumb = async (file) => {
    if (!file) return;
    if (form.thumbnail_path) await deleteImage({ bucket: 'products', path: form.thumbnail_path });
    const uploaded = await uploadImage({ bucket: 'products', file, folder: 'thumbnails' });
    setForm((prev) => ({ ...prev, thumbnail_url: uploaded.url, thumbnail_path: uploaded.path }));
  };

  const save = async () => {
    const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') };
    if (editingId) await supabase.from('products').update(payload).eq('id', editingId);
    else await supabase.from('products').insert(payload);
    setForm(empty); setEditingId(''); load();
  };

  return <div className="py-8 grid lg:grid-cols-3 gap-4"><div className={`${card} space-y-2`}>
    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="name" className="border p-2 rounded w-full bg-black/20" />
    <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="slug" className="border p-2 rounded w-full bg-black/20" />
    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="description" className="border p-2 rounded w-full bg-black/20" />
    <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="border p-2 rounded w-full bg-black/20"><option value="">Category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
    {['brand', 'price', 'sale_price', 'stock', 'sku'].map((k) => <input key={k} value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: ['price', 'sale_price', 'stock'].includes(k) ? Number(e.target.value) : e.target.value })} placeholder={k} className="border p-2 rounded w-full bg-black/20" />)}
    <label className="flex gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}/>featured</label>
    <label className="flex gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}/>active</label>
    <input type="file" accept="image/*" onChange={(e) => uploadThumb(e.target.files?.[0])} className="border p-2 rounded w-full bg-black/20" />
    {form.thumbnail_url && <img src={form.thumbnail_url} className="h-20 rounded"/>}
    <button onClick={save} className="w-full bg-charcoal text-white py-2 rounded">{editingId ? 'Update' : 'Create'} Product</button>
  </div><div className="lg:col-span-2 space-y-2">{rows.map((p) => <div key={p.id} className={`${card} flex justify-between items-center`}><div className="flex items-center gap-3"><img src={p.thumbnail_url} className="h-12 w-12 rounded object-cover"/><div><p>{p.name}</p><p className="text-xs">SKU:{p.sku} • Stock: <span className={p.stock <= 5 ? 'text-red-300' : 'text-emerald-300'}>{p.stock}</span></p></div></div><div className="space-x-2"><button onClick={() => { setEditingId(p.id); setForm(p); }} className="text-cyan-200">Edit</button><button onClick={async () => { if (window.confirm('Delete product?')) { if (p.thumbnail_path) await deleteImage({ bucket: 'products', path: p.thumbnail_path }); await supabase.from('products').delete().eq('id', p.id); load(); } }} className="text-red-300">Delete</button></div></div>)}</div></div>;
};

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [dispatchByOrder, setDispatchByOrder] = useState({});

  const load = async () => {
    let query = supabase.from('orders').select('*, profile:profiles(full_name,email), order_items(*)').order('created_at', { ascending: false });
    if (filter) query = query.eq('status', filter);
    const { data } = await query;
    setOrders(data || []);
  };

  useEffect(() => {
    load();
  }, [filter]);

  const setDispatchField = (orderId, key, value) => {
    setDispatchByOrder((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        [key]: value,
      },
    }));
  };

  const updateStatus = async (order, status) => {
    const patch = dispatchByOrder[order.id] || {};
    await supabase.from('orders').update({ status, ...patch }).eq('id', order.id);
    await load();
  };

  return <div className="py-8 space-y-3"><h1 className="section-title">Orders</h1><div className={card}><div className="flex flex-wrap gap-2 items-center"><select value={filter} onChange={(e) => setFilter(e.target.value)} className="border p-2 rounded bg-black/20"><option value="">All statuses</option><option value="Pending">New orders</option>{statusList.map((s) => <option key={s}>{s}</option>)}</select><button onClick={() => setFilter('Pending')} className="px-3 py-2 rounded bg-charcoal text-white">View New</button></div></div>{orders.map((o) => { const dispatch = dispatchByOrder[o.id] || { courier_name: o.courier_name || '', tracking_id: o.tracking_id || '', dispatch_date: o.dispatch_date || '', estimated_delivery_date: o.estimated_delivery_date || '' }; return <div key={o.id} className={card}><div className="flex justify-between gap-2 flex-wrap"><div><p>#{o.id}</p><p className="text-xs">{o.profile?.full_name} • {o.payment_method} • ₹{o.total_amount}</p><p className="text-xs">Current status: {o.status}</p></div><div className="flex gap-2 flex-wrap"><button onClick={() => updateStatus(o, 'Confirmed')} className="text-xs px-2 py-1 rounded border">Confirm</button><button onClick={() => updateStatus(o, 'Packed')} className="text-xs px-2 py-1 rounded border">Mark Packed</button><button onClick={() => updateStatus(o, 'Dispatched')} className="text-xs px-2 py-1 rounded border">Mark Dispatched</button><button onClick={() => updateStatus(o, 'Delivered')} className="text-xs px-2 py-1 rounded border">Mark Delivered</button><button onClick={() => updateStatus(o, 'Cancelled')} className="text-xs px-2 py-1 rounded border border-rose-300 text-rose-200">Cancel</button><select value={o.status} onChange={(e) => updateStatus(o, e.target.value)} className="border p-2 rounded bg-black/20">{statusList.map((s) => <option key={s}>{s}</option>)}</select></div></div><div className="grid md:grid-cols-4 gap-2 mt-2">{['courier_name', 'tracking_id', 'dispatch_date', 'estimated_delivery_date'].map((k) => <input key={k} placeholder={k} value={dispatch[k]} onChange={(e) => setDispatchField(o.id, k, e.target.value)} className="border p-2 rounded bg-black/20" />)}</div><button onClick={() => updateStatus(o, o.status)} className="mt-2 text-xs px-3 py-1 rounded bg-charcoal text-white">Save dispatch details</button><div className="mt-2 space-y-1">{o.order_items?.map((item) => <p key={item.id} className="text-xs">{item.product_name} × {item.quantity} = ₹{Number(item.line_total)}</p>)}</div></div>; })}</div>;
};

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const load = async () => {
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
    const { data } = await query;
    setUsers(data || []);
  };
  useEffect(() => { load(); }, []);
  return <div className="py-8"><h1 className="section-title mb-3">Users</h1><div className={card}><div className="flex gap-2 mb-3"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users" className="border p-2 rounded bg-black/20 flex-1"/><button onClick={load} className="bg-charcoal text-white rounded px-3">Search</button></div>{users.map((u) => <div key={u.id} className="flex justify-between border-b border-white/10 py-2 text-sm"><span>{u.full_name} • {u.email} • Joined:{new Date(u.created_at).toLocaleDateString()}</span><button onClick={async () => { await supabase.from('profiles').update({ is_active: !u.is_active }).eq('id', u.id); load(); }} className="text-amber-200">{u.is_active ? 'Disable' : 'Enable'}</button></div>)}</div></div>;
};

export const AdminBanners = () => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ title: '', subtitle: '', cta_text: 'Shop Now', image_url: '', image_path: '', display_order: 0, is_active: true });
  const load = async () => { const { data } = await supabase.from('banners').select('*').order('display_order'); setRows(data || []); };
  useEffect(() => { load(); }, []);

  const uploadBanner = async (file) => {
    const uploaded = await uploadImage({ bucket: 'banners', file, folder: 'hero' });
    setForm({ ...form, image_url: uploaded.url, image_path: uploaded.path });
  };

  return <div className="py-8"><h1 className="section-title mb-3">Banners</h1><div className={card}><div className="grid md:grid-cols-5 gap-2">{['title', 'subtitle', 'cta_text', 'display_order'].map((k) => <input key={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: k === 'display_order' ? Number(e.target.value) : e.target.value })} placeholder={k} className="border p-2 rounded bg-black/20" />)}<input type="file" accept="image/*" onChange={(e) => uploadBanner(e.target.files?.[0])} className="border p-2 rounded bg-black/20"/></div><button onClick={async () => { await supabase.from('banners').insert(form); setForm({ title: '', subtitle: '', cta_text: 'Shop Now', image_url: '', image_path: '', display_order: 0, is_active: true }); load(); }} className="mt-2 bg-charcoal text-white px-3 py-2 rounded">Create banner</button></div><div className="mt-3 space-y-2">{rows.map((b) => <div key={b.id} className={`${card} flex justify-between items-center`}><div className="flex items-center gap-2"><img src={b.image_url} className="h-12 w-20 object-cover rounded"/><span>{b.title}</span></div><button onClick={async () => { if (window.confirm('Delete banner?')) { if (b.image_path) await deleteImage({ bucket: 'banners', path: b.image_path }); await supabase.from('banners').delete().eq('id', b.id); load(); } }} className="text-red-300">Delete</button></div>)}</div></div>;
};

export const AdminEnquiries = () => {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const load = async () => {
    let query = supabase.from('enquiries').select('*').order('created_at', { ascending: false });
    if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,subject.ilike.%${q}%`);
    const { data } = await query;
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);

  return <div className="py-8"><h1 className="section-title mb-3">Enquiries</h1><div className={card}><div className="grid md:grid-cols-4 gap-2"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="border p-2 rounded bg-black/20"/><button onClick={load} className="bg-charcoal text-white rounded">Apply</button></div>{rows.map((e) => <div key={e.id} className="flex justify-between border-b border-white/10 py-2"><span>{e.name} • {e.email} • {e.subject}</span><div className="space-x-2"><button onClick={async () => { await supabase.from('enquiries').update({ is_read: !e.is_read }).eq('id', e.id); load(); }} className="text-cyan-200">Mark {e.is_read ? 'Unread' : 'Read'}</button><button onClick={async () => { await supabase.from('enquiries').delete().eq('id', e.id); load(); }} className="text-red-300">Delete</button></div></div>)}</div></div>;
};

export const AdminCoupons = () => {
  const empty = { code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, expiry_date: '', is_active: true };
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState('');
  const load = async () => { const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false }); setRows(data || []); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = { ...form, code: form.code.toUpperCase() };
    if (editId) await supabase.from('coupons').update(payload).eq('id', editId); else await supabase.from('coupons').insert(payload);
    setForm(empty); setEditId(''); load();
  };

  return <div className="py-8"><h1 className="section-title mb-3">Coupons</h1><div className={card}><div className="grid md:grid-cols-6 gap-2"><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Code" className="border p-2 rounded bg-black/20"/><select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="border p-2 rounded bg-black/20"><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select><input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} placeholder="Value" className="border p-2 rounded bg-black/20"/><input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })} placeholder="Min order" className="border p-2 rounded bg-black/20"/><input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="border p-2 rounded bg-black/20"/><button onClick={save} className="bg-charcoal text-white rounded">{editId ? 'Update' : 'Create'}</button></div>{rows.map((c) => <div key={c.id} className="flex justify-between border-b border-white/10 py-2"><span>{c.code} • {c.discount_type} • {c.discount_value} • min ₹{c.min_order_amount} • {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : ''} • {c.is_active ? 'Active' : 'Inactive'}</span><div className="space-x-2"><button onClick={() => { setEditId(c.id); setForm({ ...c, expiry_date: c.expiry_date?.slice(0, 10) }); }} className="text-cyan-200">Edit</button><button onClick={async () => { await supabase.from('coupons').update({ is_active: !c.is_active }).eq('id', c.id); load(); }} className="text-amber-200">{c.is_active ? 'Disable' : 'Enable'}</button><button onClick={async () => { await supabase.from('coupons').delete().eq('id', c.id); load(); }} className="text-red-300">Delete</button></div></div>)}</div></div>;
};

export const AdminSettings = () => {
  const [form, setForm] = useState({});
  useEffect(() => { supabase.from('site_settings').select('*').eq('key', 'global').maybeSingle().then(({ data }) => setForm(data?.value || {})); }, []);
  const update = async () => {
    await supabase.from('site_settings').upsert({ key: 'global', value: form }, { onConflict: 'key' });
    window.alert('Saved');
  };
  return <div className="py-8"><h1 className="section-title mb-3">Settings & Content</h1><div className={`${card} grid md:grid-cols-2 gap-2`}>{['storeName', 'homeHeadline', 'aboutText', 'footerText', 'supportEmail', 'supportPhone', 'instagram', 'facebook', 'youtube', 'whatsapp'].map((k) => <input key={k} value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="border p-2 rounded bg-black/20" placeholder={k} />)}<button onClick={update} className="md:col-span-2 bg-charcoal text-white py-2 rounded">Save</button></div></div>;
};

export const AdminCategories = () => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', image_url: '', image_path: '', is_active: true });
  const load = async () => { const { data } = await supabase.from('categories').select('*').order('name'); setRows(data || []); };
  useEffect(() => { load(); }, []);

  const uploadCategory = async (file) => {
    const uploaded = await uploadImage({ bucket: 'categories', file, folder: 'category' });
    setForm({ ...form, image_url: uploaded.url, image_path: uploaded.path });
  };

  return <div className="py-8"><h1 className="section-title mb-3">Categories</h1><div className={card}><div className="grid md:grid-cols-4 gap-2"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="border p-2 rounded bg-black/20"/><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" className="border p-2 rounded bg-black/20"/><input type="file" onChange={(e) => uploadCategory(e.target.files?.[0])} className="border p-2 rounded bg-black/20"/><button onClick={async () => { await supabase.from('categories').insert({ ...form, slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }); setForm({ name: '', slug: '', image_url: '', image_path: '', is_active: true }); load(); }} className="bg-charcoal text-white rounded">Create</button></div>{rows.map((c) => <div key={c.id} className="flex justify-between border-b border-white/10 py-2"><span>{c.name}</span><button onClick={async () => { if (c.image_path) await deleteImage({ bucket: 'categories', path: c.image_path }); await supabase.from('categories').delete().eq('id', c.id); load(); }} className="text-red-300">Delete</button></div>)}</div></div>;
};

export const AdminReviews = () => <div className="py-8"><div className={card}>Reviews can be implemented from order ratings table if needed.</div></div>;

export const AdminLogoutButton = () => {
  const navigate = useNavigate();
  return <button onClick={async () => { await authService.signOut(); navigate('/admin/login'); }} className="bg-rose-700 text-white px-3 py-1 rounded">Logout</button>;
};
