import { useEffect, useState } from 'react';
import api from '../api/client';
import StatCard from '../components/common/StatCard';

export const DashboardPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/overview').then((res) => setData(res.data));
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  const cards = data.cards;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Revenue (MRR)" value={`$${cards.mrr}`} />
        <StatCard title="Total Users" value={cards.totalUsers} />
        <StatCard title="Active Users" value={cards.activeUsers} />
        <StatCard title="Blocked Users" value={cards.blockedUsers} />
        <StatCard title="Open Tickets" value={cards.openTickets} />
        <StatCard title="Conversion" value={`${cards.conversionRate}%`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4"><h3 className="mb-4 font-semibold">Recent Activity</h3><div className="space-y-3">{data.recentActivity.map((item) => <div key={item._id} className="rounded bg-slate-50 p-3 text-sm">{item.action} by {item.actor?.email}</div>)}</div></div>
        <div className="rounded-xl border bg-white p-4"><h3 className="mb-4 font-semibold">System Health</h3><p>API: {data.systemHealth.api}</p><p>Database: {data.systemHealth.database}</p><p className="text-xs text-slate-500">{new Date(data.systemHealth.timestamp).toLocaleString()}</p></div>
      </div>
    </div>
  );
};

const MiniBars = ({ data, keyName, color }) => {
  const max = Math.max(...data.map((i) => i[keyName]), 1);
  return <div className="flex h-48 items-end gap-1">{data.slice(-20).map((point) => <div key={`${keyName}-${point.date}`} className="group relative flex-1"><div className="w-full rounded-t" style={{ background: color, height: `${(point[keyName] / max) * 100}%` }} /><span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">{point[keyName]}</span></div>)}</div>;
};

export const AnalyticsPage = () => {
  const [series, setSeries] = useState([]);
  useEffect(() => {
    api.get('/dashboard/analytics').then((res) => setSeries(res.data.series));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4"><h3 className="mb-4 font-semibold">Revenue</h3><MiniBars data={series} keyName="revenue" color="#4f46e5" /></div>
      <div className="rounded-xl border bg-white p-4"><h3 className="mb-4 font-semibold">Users vs Leads</h3><div className="grid gap-4 lg:grid-cols-2"><MiniBars data={series} keyName="users" color="#16a34a" /><MiniBars data={series} keyName="leads" color="#ea580c" /></div></div>
    </div>
  );
};
