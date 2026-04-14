import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export function AdminLoginPage() {
  const { login, isAuthenticated } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      nav('/admin');
    } catch (err) {
      setError(err.userMessage || 'Login failed');
    }
  };

  return <form onSubmit={submit} className="premium-card p-6 max-w-md mx-auto space-y-3"><h1 className="section-title">Admin Login</h1><input required className="w-full border rounded p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><input required type="password" className="w-full border rounded p-2" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /><button className="bg-charcoal text-white rounded px-4 py-2">Login</button><p className="text-red-600 text-sm">{error}</p></form>;
}

export function AdminDashboard() {
  const { isAuthenticated, logout } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center"><h1 className="section-title">Admin Panel</h1><button onClick={logout} className="text-sm border px-3 py-1 rounded">Logout</button></div>
      <div className="grid md:grid-cols-2 gap-4">
        <CrudManager title="Services" endpoint="/admin/services" publicEndpoint="/services" fields={[['title'], ['slug'], ['shortDescription'], ['description']]} />
        <CrudManager title="Projects" endpoint="/admin/projects" publicEndpoint="/projects" fields={[['title'], ['slug'], ['description'], ['category'], ['clientName'], ['liveLink'], ['technologies']]} />
        <CrudManager title="Blog Posts" endpoint="/admin/blog" publicEndpoint="/blog" fields={[['title'], ['slug'], ['excerpt'], ['content'], ['category'], ['tags'], ['isPublished']]} />
        <CrudManager title="Testimonials" endpoint="/admin/testimonials" publicEndpoint="/testimonials" fields={[['name'], ['role'], ['company'], ['message'], ['rating']]} />
        <CrudManager title="Team" endpoint="/admin/team" publicEndpoint="/team" fields={[['name'], ['role'], ['bio']]} />
        <ReadOnlyManager title="Contact Enquiries" endpoint="/admin/enquiries" />
        <ReadOnlyManager title="Quote Requests" endpoint="/admin/quotes" />
        <ReadOnlyManager title="Newsletter Subscribers" endpoint="/admin/newsletter" />
        <CrudManager title="Site Settings" endpoint="/admin/settings" publicEndpoint="/admin/settings" fields={[['key'], ['value']]} />
      </div>
      <Link className="underline" to="/">Back to website</Link>
    </div>
  );
}

function CrudManager({ title, endpoint, publicEndpoint, fields }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState('');

  const load = () => api.get(publicEndpoint).then((r) => setItems(r.data));
  useEffect(() => { load(); }, [publicEndpoint]);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.tags) payload.tags = payload.tags.split(',').map((v) => v.trim());
    if (payload.technologies) payload.technologies = payload.technologies.split(',').map((v) => v.trim());
    if (payload.value) {
      try { payload.value = JSON.parse(payload.value); } catch { /* noop */ }
    }
    if (editingId) await api.put(`${endpoint}/${editingId}`, payload); else await api.post(endpoint, payload);
    setForm({}); setEditingId(''); load();
  };

  const edit = (item) => {
    const next = { ...item };
    if (Array.isArray(next.tags)) next.tags = next.tags.join(', ');
    if (Array.isArray(next.technologies)) next.technologies = next.technologies.join(', ');
    if (typeof next.value === 'object') next.value = JSON.stringify(next.value);
    setForm(next);
    setEditingId(item._id);
  };

  const remove = async (id) => { await api.delete(`${endpoint}/${id}`); load(); };

  return (
    <section className="premium-card p-4">
      <h2 className="font-semibold mb-3">{title}</h2>
      <form onSubmit={submit} className="space-y-2 mb-4">{fields.map(([key]) => <input key={key} className="w-full border rounded p-2" placeholder={key} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}<button className="bg-charcoal text-white px-3 py-1 rounded">{editingId ? 'Update' : 'Add'}</button></form>
      <div className="max-h-64 overflow-auto space-y-2">{items.map((item) => <div key={item._id} className="border rounded p-2 text-sm"><p className="font-medium">{item.title || item.name || item.key}</p><div className="mt-2 flex gap-2"><button onClick={() => edit(item)} className="underline">Edit</button><button onClick={() => remove(item._id)} className="underline text-red-600">Delete</button></div></div>)}</div>
    </section>
  );
}

function ReadOnlyManager({ title, endpoint }) {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get(endpoint).then((r) => setItems(r.data)); }, [endpoint]);
  return <section className="premium-card p-4"><h2 className="font-semibold mb-2">{title}</h2><div className="space-y-2 max-h-64 overflow-auto">{items.map((item) => <pre key={item._id} className="text-xs bg-slate-50 p-2 rounded overflow-auto">{JSON.stringify(item, null, 2)}</pre>)}</div></section>;
}
