import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../services/AuthContext.jsx';

const labels = { driver: 'Driver', workshop: 'Workshop', admin: 'Super Admin' };

export default function AuthPage({ mode }) {
  const { role = 'driver' } = useParams();
  const currentRole = labels[role] ? role : 'driver';
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    address: '',
    workshopName: '',
    workshopAddress: '',
    documentType: 'commercial_registration',
    verificationDocumentName: '',
    verificationFile: null,
    driverLicense: null
  });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    try {
      let payload = form;
      if (mode === 'register' && ['workshop', 'driver'].includes(currentRole)) {
        payload = new FormData();
        const baseFields = {
          ownerName: form.ownerName || form.name,
          name: currentRole === 'workshop' ? (form.workshopName || form.ownerName || form.name) : form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          city: form.city,
          role: currentRole
        };
        const roleFields = currentRole === 'workshop'
          ? {
              workshopName: form.workshopName || form.ownerName || form.name,
              workshopAddress: form.workshopAddress || form.address,
              address: form.workshopAddress || form.address,
              documentType: 'commercial_registration'
            }
          : {
              documentType: 'driver_license'
            };
        Object.entries({ ...baseFields, ...roleFields }).forEach(([key, value]) => payload.append(key, value || ''));
        if (currentRole === 'workshop' && form.verificationFile) payload.append('verificationDocument', form.verificationFile);
        if (currentRole === 'driver' && form.driverLicense) payload.append('driverLicense', form.driverLicense);
      }
      const user = mode === 'login' ? await login({ ...form, role: currentRole }) : await register(currentRole, payload);
      navigate(user.role === 'workshop' && user.status === 'pending' ? '/login/workshop' : `/${user.role}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">{labels[currentRole]} {mode}</span>
        <h1>{mode === 'login' ? 'Welcome back' : `Create ${labels[currentRole]} account`}</h1>
        {mode === 'register' && (
          <>
            <input required placeholder={currentRole === 'workshop' ? 'Owner name' : 'Full name'} value={currentRole === 'workshop' ? form.ownerName : form.name} onChange={(e) => setForm(currentRole === 'workshop' ? { ...form, ownerName: e.target.value } : { ...form, name: e.target.value })} />
            {currentRole === 'workshop' && <input required placeholder="Workshop name" value={form.workshopName} onChange={(e) => setForm({ ...form, workshopName: e.target.value })} />}
          </>
        )}
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {mode === 'register' && (
          <>
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            {currentRole !== 'admin' && <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />}
            {currentRole === 'workshop' && (
              <>
                <input required placeholder="Workshop address" value={form.workshopAddress} onChange={(e) => setForm({ ...form, workshopAddress: e.target.value })} />
                <input readOnly value="Commercial registration" />
                <input required type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setForm({ ...form, verificationFile: e.target.files?.[0] || null, verificationDocumentName: e.target.files?.[0]?.name || '' })} />
                <p className="form-note">Commercial register PDF, JPG, or PNG documents are submitted for CV/OCR checks, then admin approval activates the account.</p>
              </>
            )}
            {currentRole === 'driver' && (
              <>
                <input required type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setForm({ ...form, driverLicense: e.target.files?.[0] || null })} />
                <p className="form-note">Upload a driving license document for verification before admin approval.</p>
              </>
            )}
          </>
        )}
        {error && <p className="error">{error}</p>}
        <button className="primary-btn">{mode === 'login' ? 'Login' : 'Register'}</button>
        <Link to="/forgot-password">Forgot password?</Link>
        {currentRole !== 'admin' && <Link to={mode === 'login' ? `/register/${currentRole}` : `/login/${currentRole}`}>{mode === 'login' ? 'Create account' : 'Already have an account'}</Link>}
      </form>
    </main>
  );
}
