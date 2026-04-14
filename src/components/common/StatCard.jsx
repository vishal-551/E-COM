const StatCard = ({ title, value, hint }) => (
  <div className="rounded-xl border bg-white p-4 shadow-sm">
    <p className="text-sm text-slate-500">{title}</p>
    <p className="mt-2 text-2xl font-bold">{value}</p>
    {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
  </div>
);

export default StatCard;
