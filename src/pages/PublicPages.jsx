import { Link } from 'react-router-dom';

export const LandingPage = () => (
  <div className="min-h-screen bg-slate-950 text-white">
    <div className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-5xl font-bold">Operate your SaaS with confidence.</h1>
      <p className="mt-4 max-w-2xl text-slate-300">Production-ready admin platform with RBAC, analytics, team ops, settings modules, and support workflows.</p>
      <div className="mt-8 flex gap-3">
        <Link className="rounded bg-indigo-600 px-5 py-3" to="/signup">Start free trial</Link>
        <Link className="rounded border border-slate-500 px-5 py-3" to="/pricing">View pricing</Link>
      </div>
    </div>
  </div>
);

export const PricingPage = () => (
  <div className="mx-auto max-w-5xl px-6 py-16">
    <h2 className="text-4xl font-bold">Pricing</h2>
    <div className="mt-10 grid gap-6 md:grid-cols-3">
      {[
        ['Starter', '$29/mo', 'For small teams'],
        ['Growth', '$99/mo', 'For scaling SaaS teams'],
        ['Enterprise', 'Custom', 'For regulated orgs']
      ].map(([name, price, desc]) => (
        <div key={name} className="rounded-xl border p-6 shadow-sm">
          <h3 className="text-xl font-semibold">{name}</h3><p className="mt-2 text-3xl">{price}</p><p className="mt-3 text-slate-600">{desc}</p>
        </div>
      ))}
    </div>
  </div>
);
