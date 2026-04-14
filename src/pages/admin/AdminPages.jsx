import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { clearAdminSession, setAdminSession } from '../../utils/adminAuth';

const toast = (msg) => window.alert(msg);
const card = 'rounded-2xl border border-cyan-400/20 bg-white/10 backdrop-blur-lg shadow-[0_0_40px_rgba(20,184,166,0.15)] p-4';
const statusList = ['Pending', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'];

const Uploader = ({ multiple = false, onUploaded }) => {
  const onChange = async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    const fd = new FormData();
    files.forEach((f) => fd.append(multiple ? 'images' : 'image', f));
    const endpoint = multiple ? '/upload/multiple' : '/upload/single';
    const { data } = await api.post(endpoint, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    onUploaded(multiple ? data : [data]);
  };
  return <input type="file" accept="image/*" multiple={multiple} onChange={onChange} className="border p-2 rounded w-full bg-black/20" />;
};

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });
      if (data.user?.role !== 'admin') throw new Error('Admin access required');
      setAdminSession(data.token);
      navigate('/admin', { replace: true });
    } catch (e) {
      toast(e.response?.data?.message || e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return <div className="py-8 max-w-md mx-auto"><div className={card}><h1 className="section-title">Admin Login</h1><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border p-2 rounded w-full my-2 bg-black/20"/><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="border p-2 rounded w-full bg-black/20"/><button disabled={loading} onClick={login} className="bg-charcoal text-white w-full mt-3 py-2 rounded">{loading ? 'Authenticating...' : 'Login'}</button></div></div>;
};

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/admin/analytics').then((r) => setData(r.data)); }, []);
  if (!data) return <div className="py-8">Loading analytics...</div>;
  const stats = [
    ['Total sales', `₹${data.totalSales}`], ['Total orders', data.totalOrders], ['Pending', data.pendingOrders], ['Dispatched', data.dispatchedOrders], ['Delivered', data.deliveredOrders], ['Cancelled', data.cancelledOrders], ['Total products', data.totalProducts], ['Low stock', data.lowStockCount], ['Total users', data.totalUsers],
  ];
  return <div className="py-8 space-y-4"><h1 className="section-title">Admin Dashboard</h1><div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">{stats.map(([k, v]) => <div key={k} className={card}><p className="text-sm text-cyan-100">{k}</p><p className="text-2xl font-semibold text-white">{v}</p></div>)}</div><div className="grid lg:grid-cols-2 gap-3"><div className={card}><h3 className="font-semibold mb-2">Latest orders</h3>{data.latestOrders.map((o) => <p key={o._id} className="text-sm">#{o._id.slice(-6)} • {o.user?.name} • ₹{o.total} • {o.status}</p>)}</div><div className={card}><h3 className="font-semibold mb-2">Latest customers</h3>{data.latestCustomers.map((u) => <p key={u._id} className="text-sm">{u.name} • {u.email}</p>)}</div></div></div>;
};

export const AdminProducts = () => {
  const empty = { name: '', slug: '', description: '', category: '', brand: '', price: 0, salePrice: 0, stock: 0, sku: '', featured: false, isActive: true, thumbnail: null, galleryImages: [] };
  const [form, setForm] = useState(empty);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ q: '', category: '', isActive: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [editingId, setEditingId] = useState('');

  const load = () => api.get('/products', { params: { ...filters, page, limit: 8 } }).then(({ data }) => { setRows(data.items); setPages(data.pages || 1); });
  useEffect(() => { load(); }, [page]);

  const submit = async () => {
    const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') };
    if (editingId) await api.put(`/products/${editingId}`, payload); else await api.post('/products', payload);
    setForm(empty); setEditingId(''); load();
  };
  const edit = (item) => { setEditingId(item._id); setForm({ ...item, salePrice: item.salePrice || 0 }); };
  const remove = async (id) => { if (window.confirm('Delete product?')) { await api.delete(`/products/${id}`); load(); } };

  return <div className="py-8 grid lg:grid-cols-3 gap-4"><div className={`${card} space-y-2`}>
    {['name', 'slug', 'description', 'category', 'brand', 'price', 'salePrice', 'stock', 'sku'].map((k) => <input key={k} value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: ['price', 'salePrice', 'stock'].includes(k) ? Number(e.target.value) : e.target.value })} placeholder={k} className="border p-2 rounded w-full bg-black/20" />)}
    <label className="flex gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}/>featured</label>
    <label className="flex gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}/>active</label>
    <Uploader onUploaded={(images) => setForm({ ...form, thumbnail: images[0] })} />
    {form.thumbnail?.url && <img src={form.thumbnail.url} className="h-20 rounded"/>}
    <Uploader multiple onUploaded={(images) => setForm({ ...form, galleryImages: [...form.galleryImages, ...images] })} />
    <div className="grid grid-cols-4 gap-2">{form.galleryImages.map((g) => <img key={g.publicId} src={g.url} className="h-16 w-full object-cover rounded" />)}</div>
    <button onClick={submit} className="w-full bg-charcoal text-white py-2 rounded">{editingId ? 'Update' : 'Create'} Product</button>
  </div><div className="lg:col-span-2 space-y-2"><div className={card}><div className="grid md:grid-cols-4 gap-2"><input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Search" className="border p-2 rounded bg-black/20"/><input value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} placeholder="Category" className="border p-2 rounded bg-black/20"/><select value={filters.isActive} onChange={(e) => setFilters({ ...filters, isActive: e.target.value })} className="border p-2 rounded bg-black/20"><option value="">All status</option><option value="true">Active</option><option value="false">Inactive</option></select><button onClick={() => { setPage(1); load(); }} className="bg-charcoal text-white rounded">Apply</button></div></div>{rows.map((p) => <div key={p._id} className={`${card} flex justify-between items-center`}><div className="flex items-center gap-3"><img src={p.thumbnail?.url} className="h-12 w-12 rounded object-cover"/><div><p>{p.name}</p><p className="text-xs">{p.category} • SKU:{p.sku} • Stock: <span className={p.stock <= 5 ? 'text-red-300' : 'text-emerald-300'}>{p.stock}</span></p></div></div><div className="space-x-2"><button onClick={() => edit(p)} className="text-cyan-200">Edit</button><button onClick={() => remove(p._id)} className="text-red-300">Delete</button></div></div>)}<div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button><span>{page}/{pages}</span><button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></div></div></div>;
};

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState({ status: '', paymentStatus: '' });
  const [selected, setSelected] = useState(null);
  const [dispatch, setDispatch] = useState({ courierPartner: '', trackingId: '', dispatchDate: '', estimatedDeliveryDate: '' });
  const load = () => api.get('/orders', { params: filter }).then((r) => setOrders(r.data));
  useEffect(() => { load(); }, [filter.status, filter.paymentStatus]);

  const updateStatus = async (order, status) => {
    await api.patch(`/orders/${order._id}/status`, { ...dispatch, status });
    load();
  };

  return <div className="py-8 space-y-3"><h1 className="section-title">Orders</h1><div className={card}><div className="grid md:grid-cols-3 gap-2"><select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="border p-2 rounded bg-black/20"><option value="">All statuses</option>{statusList.map((s) => <option key={s}>{s}</option>)}</select><select value={filter.paymentStatus} onChange={(e) => setFilter({ ...filter, paymentStatus: e.target.value })} className="border p-2 rounded bg-black/20"><option value="">All payments</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option></select><button onClick={load} className="bg-charcoal text-white rounded">Refresh</button></div></div>{orders.map((o) => <div key={o._id} className={card}><div className="flex justify-between"><div><p>#{o._id}</p><p className="text-xs">{o.user?.name} • {o.paymentMethod} • {o.paymentStatus} • ₹{o.total}</p></div><select value={o.status} onChange={(e) => updateStatus(o, e.target.value)} className="border p-2 rounded bg-black/20">{statusList.map((s) => <option key={s}>{s}</option>)}</select></div><div className="mt-2 flex gap-2"><button onClick={() => setSelected(o)} className="text-cyan-200">Details</button></div></div>)}{selected && <div className={card}><h3 className="font-semibold">Order details #{selected._id}</h3><p>{selected.shipping?.name} • {selected.shipping?.address}</p><p>{selected.items?.map((i) => `${i.name} x ${i.qty}`).join(', ')}</p><div className="grid md:grid-cols-4 gap-2 mt-2">{['courierPartner', 'trackingId', 'dispatchDate', 'estimatedDeliveryDate'].map((k) => <input key={k} placeholder={k} value={dispatch[k]} onChange={(e) => setDispatch({ ...dispatch, [k]: e.target.value })} className="border p-2 rounded bg-black/20" />)}</div><div className="mt-2">Timeline:{selected.statusHistory?.map((h) => <p key={`${h.status}-${h.at}`}>{h.status} • {new Date(h.at).toLocaleString()}</p>)}</div></div>}</div>;
};

export const AdminUsers = () => {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState([]);
  const load = () => api.get('/users', { params: { q } }).then((r) => setUsers(r.data));
  useEffect(() => { load(); }, []);
  return <div className="py-8"><h1 className="section-title mb-3">Users</h1><div className={card}><div className="flex gap-2 mb-3"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users" className="border p-2 rounded bg-black/20 flex-1"/><button onClick={load} className="bg-charcoal text-white rounded px-3">Search</button></div>{users.map((u) => <div key={u._id} className="flex justify-between border-b border-white/10 py-2 text-sm"><span>{u.name} • {u.email} • Orders:{u.orderCount} • Joined:{new Date(u.createdAt).toLocaleDateString()}</span><div className="space-x-2"><button onClick={async () => { await api.patch(`/users/${u._id}/block`, { isBlocked: !u.isBlocked }); load(); }} className="text-amber-200">{u.isBlocked ? 'Unblock' : 'Block'}</button><button onClick={async () => { if (window.confirm('Delete user?')) { await api.delete(`/users/${u._id}`); load(); } }} className="text-red-300">Delete</button></div></div>)}</div></div>;
};

export const AdminBanners = () => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ title: '', subtitle: '', cta: '', image: null, order: 0, active: true });
  const load = () => api.get('/banners').then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  return <div className="py-8"><h1 className="section-title mb-3">Banners</h1><div className={card}><div className="grid md:grid-cols-5 gap-2">{['title', 'subtitle', 'cta', 'order'].map((k) => <input key={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: k === 'order' ? Number(e.target.value) : e.target.value })} placeholder={k} className="border p-2 rounded bg-black/20" />)}<Uploader onUploaded={(images) => setForm({ ...form, image: images[0] })} /></div><button onClick={async () => { await api.post('/banners', form); setForm({ title: '', subtitle: '', cta: '', image: null, order: 0, active: true }); load(); }} className="mt-2 bg-charcoal text-white px-3 py-2 rounded">Create banner</button></div><div className="mt-3 space-y-2">{rows.map((b) => <div key={b._id} className={`${card} flex justify-between items-center`}><div className="flex items-center gap-2"><img src={b.image?.url} className="h-12 w-20 object-cover rounded"/><span>{b.title}</span></div><button onClick={async () => { if (window.confirm('Delete banner?')) { await api.delete(`/banners/${b._id}`); load(); } }} className="text-red-300">Delete</button></div>)}</div></div>;
};

export const AdminEnquiries = () => {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [isRead, setIsRead] = useState('');
  const load = () => api.get('/contact', { params: { q, isRead } }).then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  return <div className="py-8"><h1 className="section-title mb-3">Enquiries</h1><div className={card}><div className="grid md:grid-cols-4 gap-2"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="border p-2 rounded bg-black/20"/><select value={isRead} onChange={(e) => setIsRead(e.target.value)} className="border p-2 rounded bg-black/20"><option value="">All</option><option value="false">Unread</option><option value="true">Read</option></select><button onClick={load} className="bg-charcoal text-white rounded">Apply</button></div>{rows.map((e) => <div key={e._id} className="flex justify-between border-b border-white/10 py-2"><span>{e.name} • {e.email} • {e.subject}</span><div className="space-x-2"><button onClick={async () => { await api.patch(`/contact/${e._id}/read`, { isRead: !e.isRead }); load(); }} className="text-cyan-200">Mark {e.isRead ? 'Unread' : 'Read'}</button><button onClick={async () => { await api.delete(`/contact/${e._id}`); load(); }} className="text-red-300">Delete</button></div></div>)}</div></div>;
};

export const AdminCoupons = () => {
  const empty = { code: '', type: 'percentage', value: 10, minOrderAmount: 0, expiry: '', active: true };
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState('');
  const load = () => api.get('/coupons').then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editId) await api.put(`/coupons/${editId}`, form); else await api.post('/coupons', form);
    setForm(empty); setEditId(''); load();
  };

  return <div className="py-8"><h1 className="section-title mb-3">Coupons</h1><div className={card}><div className="grid md:grid-cols-6 gap-2"><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Code" className="border p-2 rounded bg-black/20"/><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border p-2 rounded bg-black/20"><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select><input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} placeholder="Value" className="border p-2 rounded bg-black/20"/><input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })} placeholder="Min order" className="border p-2 rounded bg-black/20"/><input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} className="border p-2 rounded bg-black/20"/><button onClick={save} className="bg-charcoal text-white rounded">{editId ? 'Update' : 'Create'}</button></div>{rows.map((c) => <div key={c._id} className="flex justify-between border-b border-white/10 py-2"><span>{c.code} • {c.type} • {c.value} • min ₹{c.minOrderAmount} • {new Date(c.expiry).toLocaleDateString()} • {c.active ? 'Active' : 'Inactive'}</span><div className="space-x-2"><button onClick={() => { setEditId(c._id); setForm({ ...c, expiry: c.expiry?.slice(0, 10) }); }} className="text-cyan-200">Edit</button><button onClick={async () => { await api.put(`/coupons/${c._id}`, { ...c, active: !c.active }); load(); }} className="text-amber-200">{c.active ? 'Disable' : 'Enable'}</button><button onClick={async () => { await api.delete(`/coupons/${c._id}`); load(); }} className="text-red-300">Delete</button></div></div>)}</div></div>;
};

export const AdminSettings = () => {
  const [form, setForm] = useState(null);
  useEffect(() => { api.get('/settings').then((r) => setForm(r.data)); }, []);
  if (!form) return <div className="py-8">Loading settings...</div>;
  const update = async () => { await api.put('/settings', form); toast('Saved'); };
  return <div className="py-8"><h1 className="section-title mb-3">Settings & Content</h1><div className={`${card} grid md:grid-cols-2 gap-2`}>{['storeName', 'homeText', 'aboutText', 'footerText', 'promoText'].map((k) => <input key={k} value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="border p-2 rounded bg-black/20" placeholder={k} />)}{['instagram', 'facebook', 'youtube', 'whatsapp'].map((k) => <input key={k} value={form.socialLinks?.[k] || ''} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, [k]: e.target.value } })} className="border p-2 rounded bg-black/20" placeholder={k} />)}<button onClick={update} className="md:col-span-2 bg-charcoal text-white py-2 rounded">Save</button></div></div>;
};

export const AdminCategories = () => <div className="py-8"><div className={card}>Categories are managed as product category values.</div></div>;
export const AdminReviews = () => <div className="py-8"><div className={card}>Reviews module stays unchanged.</div></div>;

export const AdminLogoutButton = () => {
  const navigate = useNavigate();
  return <button onClick={() => { clearAdminSession(); navigate('/admin/login'); }} className="bg-rose-700 text-white px-3 py-1 rounded">Logout</button>;
};
