import { useMemo, useState } from 'react';
import { post } from '../../services/api.js';

export default function ForgotPassword() {
  const initialToken = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('token')) return params.get('token');
    const hashQuery = String(window.location.hash || '').split('?')[1];
    return hashQuery ? new URLSearchParams(hashQuery).get('token') || '' : '';
  }, []);

  const [form, setForm] = useState({ email: '', token: initialToken || '', password: '' });
  const [step, setStep] = useState(initialToken ? 'reset' : 'request');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const requestReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await post('/auth/forgot-password', { email: form.email });
      setMessage(response.message || 'If this email exists, a reset token has been sent.');
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Could not request password reset.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await post('/auth/reset-password', {
        email: form.email,
        token: form.token,
        password: form.password,
      });
      setMessage(response.message || 'Password reset successfully. You can now login with the new password.');
      setForm({ email: form.email, token: '', password: '' });
    } catch (err) {
      setError(err.message || 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={step === 'request' ? requestReset : resetPassword}>
        <span className="eyebrow">Account recovery</span>
        <h1>Reset your password</h1>
        <input required type="email" placeholder="Email address" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        {step === 'reset' && (
          <>
            <input required placeholder="Reset token" value={form.token} onChange={(event) => setForm({ ...form, token: event.target.value })} />
            <input required type="password" minLength={8} placeholder="New password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </>
        )}
        {message && <p className="form-note">{message}</p>}
        {error && <p className="error">{error}</p>}
        <button className="primary-btn" disabled={loading}>
          {loading ? 'Please wait...' : step === 'request' ? 'Send reset token' : 'Reset password'}
        </button>
        {step === 'reset' && <button className="ghost-btn" type="button" onClick={() => setStep('request')}>Request a new token</button>}
      </form>
    </main>
  );
}
