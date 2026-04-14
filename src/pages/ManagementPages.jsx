import { useEffect, useState } from 'react';
import api from '../api/client';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');

  const load = () => api.get('/users', { params: { q } }).then((res) => setUsers(res.data.users));
  useEffect(() => { load(); }, []);

  const toggleBlock = async (id) => { await api.patch(`/users/${id}/block`); load(); };
  const removeUser = async (id) => { await api.delete(`/users/${id}`); load(); };

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-4 flex gap-2"><input className="rounded border p-2" placeholder="Search users" value={q} onChange={(e) => setQ(e.target.value)} /><button className="rounded bg-slate-900 px-4 text-white" onClick={load}>Search</button></div>
      <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="text-left"><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Join Date</th><th/></tr></thead><tbody>{users.map((u) => <tr key={u._id} className="border-t"><td>{u.firstName} {u.lastName}</td><td>{u.email}</td><td>{u.role}</td><td>{u.isBlocked ? 'Blocked' : u.isActive ? 'Active' : 'Inactive'}</td><td>{new Date(u.createdAt).toLocaleDateString()}</td><td className="space-x-2 py-2"><button onClick={() => toggleBlock(u._id)} className="rounded border px-2">{u.isBlocked ? 'Unblock' : 'Block'}</button><button onClick={() => removeUser(u._id)} className="rounded border px-2 text-red-600">Delete</button></td></tr>)}</tbody></table></div>
    </div>
  );
};

export const TeamPage = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'staff' });
  const [message, setMessage] = useState('');

  const invite = async (e) => {
    e.preventDefault();
    await api.post('/users', form);
    setMessage('Team member invited/created successfully.');
    setForm({ firstName: '', lastName: '', email: '', password: '', role: 'staff' });
  };

  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="mb-4 text-lg font-semibold">Invite Team Member</h2>
      <form onSubmit={invite} className="grid gap-3 md:grid-cols-2">{['firstName','lastName','email','password'].map((key) => <input key={key} className="rounded border p-2" type={key==='password'?'password':'text'} placeholder={key} value={form[key]} onChange={(e)=>setForm({...form,[key]:e.target.value})} />)}<select className="rounded border p-2" value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}><option value="admin">admin</option><option value="manager">manager</option><option value="staff">staff</option><option value="user">user</option></select><button className="rounded bg-slate-900 py-2 text-white">Create</button></form>
      {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
    </div>
  );
};

export const SettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [key, setKey] = useState('company.name');
  const [value, setValue] = useState('SaaSCore');
  const [category, setCategory] = useState('company');

  const load = () => api.get('/settings').then((res) => setSettings(res.data.settings));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await api.post('/settings', { key, value, category });
    load();
  };

  return <div className="space-y-6"><form onSubmit={save} className="rounded-xl border bg-white p-4"><h2 className="mb-3 font-semibold">Settings Module</h2><div className="grid gap-3 md:grid-cols-4"><input className="rounded border p-2" value={key} onChange={(e)=>setKey(e.target.value)} placeholder="key"/><input className="rounded border p-2" value={value} onChange={(e)=>setValue(e.target.value)} placeholder="value"/><select className="rounded border p-2" value={category} onChange={(e)=>setCategory(e.target.value)}><option value="app">app</option><option value="profile">profile</option><option value="company">company</option><option value="branding">branding</option><option value="notifications">notifications</option><option value="security">security</option></select><button className="rounded bg-slate-900 text-white">Save</button></div></form><div className="rounded-xl border bg-white p-4"><h3 className="mb-3 font-semibold">Saved Settings</h3>{settings.length===0?<p className="text-slate-500">No settings yet.</p>:<ul className="space-y-2 text-sm">{settings.map((s)=><li key={s._id} className="rounded bg-slate-50 p-2"><strong>{s.category}</strong> - {s.key}: {String(s.value)}</li>)}</ul>}</div></div>;
};
