import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../services/AuthContext.jsx';

const labels = { driver: 'Driver', workshop: 'Workshop', admin: 'Super Admin' };
const demo = {
  driver: ['driver@salahny.com', 'driver123'],
  workshop: ['workshop@salahny.com', 'workshop123'],
  admin: ['admin@salahny.com', 'admin123']
};

export default function AuthPage({ mode }) {
  const { role = 'driver' } = useParams();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: demo[role]?.[0] || '', password: demo[role]?.[1] || '', phone: '', city: 'Cairo', address: '' });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    try {
      const user = mode === 'login' ? await login({ ...form, role }) : await register(role, form);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">{labels[role]} {mode}</span>
        <h1>{mode === 'login' ? 'Welcome back' : `Create ${labels[role]} account`}</h1>
        {mode === 'register' && <input required placeholder="Full name / Workshop name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {mode === 'register' && <><input placeholder="Phone" onChange={(e) => setForm({ ...form, phone: e.target.value })} /><input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />{role === 'workshop' && <input placeholder="Workshop address" onChange={(e) => setForm({ ...form, address: e.target.value })} />}</>}
        {error && <p className="error">{error}</p>}
        <button className="primary-btn">{mode === 'login' ? 'Login' : 'Register'}</button>
        <Link to="/forgot-password">Forgot password?</Link>
        {role !== 'admin' && <Link to={mode === 'login' ? `/register/${role}` : `/login/${role}`}>{mode === 'login' ? 'Create account' : 'Already have an account'}</Link>}
      </form>
    </main>
  );
}
