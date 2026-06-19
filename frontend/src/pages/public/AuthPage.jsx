import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../services/AuthContext.jsx';

const demo = ['workshop@salahny.com', 'workshop123'];

export default function AuthPage({ mode }) {
  const { role = 'workshop' } = useParams();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [form, setForm] = useState({
    ownerName: '',
    email: demo[0],
    password: demo[1],
    phone: '',
    workshopName: '',
    workshopAddress: '',
    documentType: 'commercial_registration',
    verificationDocumentName: '',
    verificationFile: null
  });
  const [error, setError] = useState('');
  const lockedRole = role === 'workshop' ? role : 'workshop';

  const submit = async (event) => {
    event.preventDefault();
    try {
      const payload = new FormData();
      Object.entries({
        ownerName: form.ownerName,
        name: form.ownerName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        workshopName: form.workshopName || form.ownerName,
        workshopAddress: form.workshopAddress,
        address: form.workshopAddress,
        documentType: form.documentType,
        role: 'workshop'
      }).forEach(([key, value]) => payload.append(key, value));
      if (form.verificationFile) payload.append('verificationDocument', form.verificationFile);
      const user = mode === 'login' ? await login({ ...form, role: lockedRole }) : await register(lockedRole, payload);
      navigate(user.status === 'pending' ? '/login' : '/workshop');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">Workshop {mode}</span>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create workshop account'}</h1>
        {mode === 'register' && (
          <>
            <input required placeholder="Owner name" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
            <input required placeholder="Workshop name" value={form.workshopName} onChange={(e) => setForm({ ...form, workshopName: e.target.value })} />
          </>
        )}
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {mode === 'register' && (
          <>
            <input required placeholder="Phone" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input required placeholder="Workshop address" onChange={(e) => setForm({ ...form, workshopAddress: e.target.value })} />
            <select value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })}>
              <option value="commercial_registration">Commercial registration</option>
              <option value="tax_card">Tax card</option>
              <option value="business_license">Business license</option>
            </select>
            <input required type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setForm({ ...form, verificationFile: e.target.files?.[0] || null, verificationDocumentName: e.target.files?.[0]?.name || '' })} />
            <p className="form-note">PDF, JPG, and PNG documents are submitted for CV/OCR checks, then admin approval activates the account.</p>
          </>
        )}
        {error && <p className="error">{error}</p>}
        <button className="primary-btn">{mode === 'login' ? 'Login' : 'Register'}</button>
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Create account' : 'Already have an account'}</Link>
      </form>
    </main>
  );
}
