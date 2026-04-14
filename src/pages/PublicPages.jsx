import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api';

const useFetch = (url, initial = []) => {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    api.get(url).then((res) => mounted && setData(res.data)).catch(() => mounted && setData(initial)).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [url]);
  return { data, loading, setData };
};

export function HomePage() {
  const services = useFetch('/services');
  const testimonials = useFetch('/testimonials');
  return (
    <div className="space-y-12">
      <section className="premium-card p-8 bg-gradient-to-r from-charcoal to-slate-700 text-white">
        <h1 className="text-4xl font-bold">Build a Brand That Wins Online</h1>
        <p className="mt-3 max-w-2xl">Production-ready websites, content systems, and growth funnels for service businesses.</p>
        <Link to="/contact" className="inline-block mt-5 bg-gold text-charcoal px-5 py-2 rounded-lg font-semibold">Start Your Project</Link>
      </section>
      <section>
        <h2 className="section-title mb-4">Services</h2>
        <div className="grid md:grid-cols-3 gap-4">{services.data.slice(0, 6).map((s) => <article className="premium-card p-4" key={s._id}><h3 className="font-semibold">{s.title}</h3><p className="text-sm mt-2">{s.shortDescription}</p></article>)}</div>
      </section>
      <section>
        <h2 className="section-title mb-4">Testimonials</h2>
        <div className="grid md:grid-cols-2 gap-4">{testimonials.data.slice(0, 4).map((t) => <blockquote className="premium-card p-4" key={t._id}>“{t.message}”<footer className="text-sm mt-3">— {t.name}</footer></blockquote>)}</div>
      </section>
      <NewsletterSection />
    </div>
  );
}

export const AboutPage = () => <section className="space-y-4"><h1 className="section-title">About Us</h1><p>We are a full-stack digital agency delivering scalable websites and backend systems.</p><TeamSection /></section>;

export function ServicesPage() {
  const { data, loading } = useFetch('/services');
  if (loading) return <p>Loading services...</p>;
  return <section><h1 className="section-title mb-4">Our Services</h1><div className="grid md:grid-cols-3 gap-4">{data.map((s) => <article key={s._id} className="premium-card p-4"><h3 className="font-semibold">{s.title}</h3><p className="text-sm mt-2">{s.description}</p></article>)}</div></section>;
}

export function ProjectsPage() {
  const { data } = useFetch('/projects');
  return <section><h1 className="section-title mb-4">Portfolio</h1><div className="grid md:grid-cols-3 gap-4">{data.map((p) => <Link key={p._id} to={`/projects/${p.slug}`} className="premium-card p-4"><h3 className="font-semibold">{p.title}</h3><p className="text-sm">{p.category}</p></Link>)}</div></section>;
}

export function ProjectDetailsPage() {
  const { slug } = useParams();
  const { data, loading } = useFetch(`/projects/${slug}`, null);
  if (loading) return <p>Loading project...</p>;
  if (!data) return <p>Project not found.</p>;
  return <article className="space-y-3"><h1 className="section-title">{data.title}</h1><p>{data.description}</p><p className="text-sm">Client: {data.clientName || 'N/A'} | Tech: {data.technologies?.join(', ')}</p></article>;
}

export function BlogPage() {
  const { data } = useFetch('/blog');
  return <section><h1 className="section-title mb-4">News & Insights</h1><div className="space-y-3">{data.filter((p) => p.isPublished).map((p) => <Link key={p._id} to={`/blog/${p.slug}`} className="premium-card p-4 block"><h3 className="font-semibold">{p.title}</h3><p className="text-sm mt-1">{p.excerpt}</p></Link>)}</div></section>;
}

export function BlogDetailsPage() {
  const { slug } = useParams();
  const { data, loading } = useFetch(`/blog/${slug}`, null);
  if (loading) return <p>Loading post...</p>;
  if (!data) return <p>Post not found.</p>;
  return <article><h1 className="section-title mb-3">{data.title}</h1><p className="whitespace-pre-wrap">{data.content}</p></article>;
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');
    try { await api.post('/contact', form); setStatus('Submitted successfully.'); setForm({ name: '', email: '', subject: '', message: '' }); } catch { setStatus('Failed to submit.'); }
  };
  return <section className="grid md:grid-cols-2 gap-6"><div><h1 className="section-title">Contact Us</h1><p className="mt-3">Tell us about your project and goals.</p><FAQSection /></div><form onSubmit={submit} className="premium-card p-4 space-y-3">{['name','email','subject'].map((k) => <input key={k} required className="w-full border rounded p-2" placeholder={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />)}<textarea required className="w-full border rounded p-2" rows="5" placeholder="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /><button className="bg-charcoal text-white px-4 py-2 rounded">Send Enquiry</button><p className="text-sm">{status}</p></form></section>;
}

export function QuotePage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', budget: '', timeline: '', service: '', details: '' });
  const [status, setStatus] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try { await api.post('/quote', form); setStatus('Quote request submitted.'); } catch { setStatus('Unable to submit request.'); }
  };
  return <form onSubmit={submit} className="premium-card p-5 space-y-3 max-w-2xl"><h1 className="section-title">Request Quote</h1>{Object.keys(form).map((k) => <input key={k} required={['name','email','details'].includes(k)} className="w-full border rounded p-2" placeholder={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />)}<button className="bg-gold px-4 py-2 rounded">Submit</button><p className="text-sm">{status}</p></form>;
}

export const FAQPage = () => <FAQSection />;

function FAQSection() {
  const faqs = [{ q: 'How long does a project take?', a: 'Most projects ship in 3-8 weeks.' }, { q: 'Do you provide support?', a: 'Yes, ongoing maintenance plans are available.' }];
  return <section><h2 className="section-title mb-3">FAQ</h2>{faqs.map((f) => <details key={f.q} className="premium-card p-3 mb-2"><summary className="font-medium">{f.q}</summary><p className="text-sm mt-2">{f.a}</p></details>)}</section>;
}

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const submit = async (e) => { e.preventDefault(); try { await api.post('/newsletter', { email }); setMsg('Subscribed!'); setEmail(''); } catch { setMsg('Subscription failed.'); } };
  return <form onSubmit={submit} className="premium-card p-5 flex flex-col md:flex-row gap-3 items-center"><h3 className="font-semibold">Join our newsletter</h3><input required type="email" className="border rounded p-2 flex-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" /><button className="bg-charcoal text-white px-4 py-2 rounded">Subscribe</button><span className="text-sm">{msg}</span></form>;
}

function TeamSection() {
  const { data } = useFetch('/team');
  return <section><h2 className="section-title mb-3">Team</h2><div className="grid md:grid-cols-3 gap-3">{data.map((m) => <article key={m._id} className="premium-card p-3"><h4 className="font-semibold">{m.name}</h4><p className="text-sm">{m.role}</p></article>)}</div></section>;
}

export const NotFoundPage = () => <div className="text-center py-10"><h1 className="text-3xl font-semibold">404</h1><p>Page not found.</p></div>;
