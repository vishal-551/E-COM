import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const AuthLayout = ({ title, children }) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
    <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-6">{children}</div>
    </div>
  </div>
);

export const LoginPage = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return <AuthLayout title="Login">{error && <p className="mb-3 text-sm text-red-600">{error}</p>}<form onSubmit={submit} className="space-y-3"><input className="w-full rounded border p-2" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} /><input type="password" className="w-full rounded border p-2" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} /><button className="w-full rounded bg-slate-900 py-2 text-white">Sign in</button></form><div className="mt-4 flex justify-between text-sm"><Link to="/forgot-password">Forgot password?</Link><Link to="/signup">Create account</Link></div></AuthLayout>;
};

export const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return <AuthLayout title="Create account"><form onSubmit={submit} className="space-y-3">{error && <p className="text-sm text-red-600">{error}</p>}<input className="w-full rounded border p-2" placeholder="First name" onChange={(e) => setForm({ ...form, firstName: e.target.value })} /><input className="w-full rounded border p-2" placeholder="Last name" onChange={(e) => setForm({ ...form, lastName: e.target.value })} /><input className="w-full rounded border p-2" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} /><input type="password" className="w-full rounded border p-2" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} /><button className="w-full rounded bg-slate-900 py-2 text-white">Sign up</button></form></AuthLayout>;
};

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/auth/forgot-password', { email });
    setMessage(data.resetToken ? `${data.message} Token: ${data.resetToken}` : data.message);
  };

  return <AuthLayout title="Forgot password"><form className="space-y-3" onSubmit={submit}><input className="w-full rounded border p-2" placeholder="Email" onChange={(e) => setEmail(e.target.value)} /><button className="w-full rounded bg-slate-900 py-2 text-white">Send reset link</button></form>{message && <p className="mt-4 text-xs text-slate-600">{message}</p>}</AuthLayout>;
};
