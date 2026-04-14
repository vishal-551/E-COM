import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const NotificationsPage = () => {
  const [items, setItems] = useState([]);
  const load = () => api.get('/notifications').then((res) => setItems(res.data.notifications));
  useEffect(() => { load(); }, []);

  const markRead = async (id) => { await api.patch(`/notifications/${id}/read`); load(); };

  return <div className="rounded-xl border bg-white p-4"><h2 className="mb-3 text-lg font-semibold">Notifications</h2>{items.length===0?<p className="text-slate-500">No notifications.</p>:<div className="space-y-2">{items.map((n)=><div key={n._id} className="flex items-start justify-between rounded border p-3"><div><p className="font-medium">{n.title}</p><p className="text-sm text-slate-600">{n.message}</p></div>{!n.isRead && <button className="rounded border px-2 text-sm" onClick={()=>markRead(n._id)}>Mark read</button>}</div>)}</div>}</div>;
};

export const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get('/activity-logs').then((res) => setLogs(res.data.logs)); }, []);

  return <div className="rounded-xl border bg-white p-4"><h2 className="mb-3 text-lg font-semibold">Activity Logs</h2><div className="space-y-2">{logs.map((log)=><div key={log._id} className="rounded border p-2 text-sm"><strong>{log.action}</strong> · {log.actor?.email} · {new Date(log.createdAt).toLocaleString()}</div>)}</div></div>;
};

export const ProfilePage = () => {
  const { user } = useAuth();
  return <div className="rounded-xl border bg-white p-6"><h2 className="mb-4 text-xl font-semibold">Profile</h2><p>Name: {user?.firstName} {user?.lastName}</p><p>Email: {user?.email}</p><p>Role: {user?.role}</p><p>Subscription: {user?.subscription?.plan} ({user?.subscription?.status})</p></div>;
};

export const SupportPage = () => {
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' });
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/support', form);
    setMessage('Support request submitted successfully.');
    setForm({ subject: '', message: '', priority: 'medium' });
  };

  return <div className="rounded-xl border bg-white p-4"><h2 className="mb-4 text-lg font-semibold">Contact / Support</h2><form onSubmit={submit} className="space-y-3"><input className="w-full rounded border p-2" placeholder="Subject" value={form.subject} onChange={(e)=>setForm({...form,subject:e.target.value})}/><textarea className="w-full rounded border p-2" rows={5} placeholder="How can we help?" value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})}/><select className="w-full rounded border p-2" value={form.priority} onChange={(e)=>setForm({...form,priority:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select><button className="rounded bg-slate-900 px-4 py-2 text-white">Submit Ticket</button></form>{message && <p className="mt-3 text-sm text-green-600">{message}</p>}</div>;
};
