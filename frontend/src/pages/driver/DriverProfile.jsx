import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bell, ChevronRight, Mail, MapPin, Moon, Shield, Trash2, User } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { put, post } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { fileToDataUrl } from '../../utils/fileToDataUrl.js';
import { STORAGE_KEYS } from '../../config/api.js';

export default function DriverProfile() {
  const { data, setData } = useApi('/driver/profile', {});
  const [profileImage, setProfileImage] = useState('');
  const [editForm, setEditForm] = useState(null); // null = not editing
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState('');
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailAlerts: true,
    locationAccess: true,
    darkMode: true,
  });
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { setProfileImage(data.profileImage || ''); }, [data.profileImage]);

  // Request location permission when Location Access toggle is on
  const locationRequested = useRef(false);
  useEffect(() => {
    if (settings.locationAccess && !locationRequested.current && navigator.geolocation) {
      locationRequested.current = true;
      navigator.geolocation.getCurrentPosition(() => {}, () => {}, { enableHighAccuracy: false, timeout: 8000 });
    }
  }, [settings.locationAccess]);

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImage(await fileToDataUrl(file));
  };

  const saveProfileImage = async () => {
    setSaving(true);
    try {
      const updated = await put('/driver/profile', { profileImage });
      const user = updated.user || updated;
      syncStoredUser(user);
      setData(user);
      setMessage('Profile picture saved.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => setEditForm({ name: data.name || '', phone: data.phone || '', city: data.city || '' });

  const saveEdit = async () => {
    setEditSaving(true);
    setEditMsg('');
    try {
      const updated = await put('/driver/profile', editForm);
      const user = updated.user || updated;
      syncStoredUser(user);
      setData((prev) => ({ ...prev, ...user }));
      setEditForm(null);
      setEditMsg('Profile updated.');
    } catch (err) {
      setEditMsg(err.message || 'Failed to save.');
    } finally {
      setEditSaving(false);
    }
  };

  const removeProfileImage = async () => {
    setProfileImage('');
    const updated = await put('/driver/profile', { profileImage: '' });
    const user = updated.user || updated;
    syncStoredUser(user);
    setData(user);
  };

  const submitReport = async () => {
    if (!reportText.trim()) return;
    try {
      await post('/driver/report', { message: reportText });
    } catch (_) {}
    setReportText('');
    setReportSent(true);
  };

  const deleteAccount = async () => {
    try {
      await post('/driver/delete-account', {});
    } catch (_) {}
    window.localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Profile & Settings" />

      {/* ── Profile card ── */}
      <section className="panel profile-panel">
        <div className="profile-strip">
          <div className="profile-identity">
            {profileImage
              ? <img className="avatar image-avatar" src={profileImage} alt={data.name || 'Driver'} />
              : <div className="avatar">{(data.name || 'DR').slice(0, 2).toUpperCase()}</div>}
            <div>
              <h2>{data.name || 'Driver'}</h2>
              <p>{data.email}</p>
              <p>{data.phone || 'No phone'} · {data.city || 'No city'}</p>
            </div>
          </div>
          <StatusBadge value={data.status || 'active'} />
        </div>
        <div className="form-grid" style={{ marginTop: 16 }}>
          <label className="field-card">
            <span>Profile Picture</span>
            <small>Upload a clear JPG or PNG.</small>
            <input type="file" accept="image/*" onChange={uploadImage} />
          </label>
          <button className="primary-btn" type="button" disabled={saving} onClick={saveProfileImage}>{saving ? 'Saving...' : 'Save picture'}</button>
          {profileImage && <button className="ghost-btn" type="button" onClick={removeProfileImage}>Remove picture</button>}
          {message && <p className="success-card" style={{ gridColumn: '1/-1' }}>{message}</p>}
        </div>

        {/* Edit profile info */}
        {editMsg && <p className="success-card" style={{ marginTop: 8 }}>{editMsg}</p>}
        {editForm ? (
          <div className="form-grid" style={{ marginTop: 16 }}>
            <h3 style={{ gridColumn: '1/-1', margin: 0 }}>Edit Profile</h3>
            <label className="field-card">
              <span>Full Name</span>
              <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Your name" />
            </label>
            <label className="field-card">
              <span>Phone</span>
              <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+20 100 000 0000" />
            </label>
            <label className="field-card">
              <span>City</span>
              <input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} placeholder="Cairo" />
            </label>
            <button className="primary-btn" disabled={editSaving} onClick={saveEdit}>{editSaving ? 'Saving...' : 'Save Changes'}</button>
            <button className="ghost-btn" onClick={() => setEditForm(null)}>Cancel</button>
          </div>
        ) : (
          <button className="ghost-btn" style={{ marginTop: 12 }} onClick={startEdit}>Edit Profile Info</button>
        )}
      </section>

      {/* ── Notifications ── */}
      <SettingsGroup title="Notifications" icon={<Bell size={15} />}>
        <SettingsToggle
          label="Push Notifications"
          description="Receive in-app booking and status updates"
          value={settings.pushNotifications}
          onChange={(v) => setSettings((s) => ({ ...s, pushNotifications: v }))}
        />
        <SettingsToggle
          label="Email Alerts"
          description="Get booking confirmations and receipts by email"
          value={settings.emailAlerts}
          onChange={(v) => setSettings((s) => ({ ...s, emailAlerts: v }))}
        />
      </SettingsGroup>

      {/* ── Privacy & Security ── */}
      <SettingsGroup title="Privacy & Security" icon={<Shield size={15} />}>
        <SettingsToggle
          label="Location Access"
          description="Allow Salahny to use your location for nearby workshops and emergency requests"
          value={settings.locationAccess}
          onChange={(v) => setSettings((s) => ({ ...s, locationAccess: v }))}
        />
      </SettingsGroup>

      {/* ── Appearance ── */}
      <SettingsGroup title="Appearance" icon={<Moon size={15} />}>
        <SettingsToggle
          label="Dark Mode"
          description="The website uses dark mode by default"
          value={settings.darkMode}
          onChange={(v) => setSettings((s) => ({ ...s, darkMode: v }))}
        />
      </SettingsGroup>

      {/* ── Account ── */}
      <SettingsGroup title="Account" icon={<User size={15} />}>
        {/* Report a problem */}
        {!reportSent ? (
          <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border, #2a2a2a)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
              <strong style={{ fontSize: '0.9rem' }}>Report a Problem</strong>
            </div>
            <textarea
              rows={3}
              placeholder="Describe the issue you encountered..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              style={{ width: '100%', marginBottom: 8, resize: 'vertical' }}
            />
            <button className="ghost-btn" onClick={submitReport}>Submit Report</button>
          </div>
        ) : (
          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border, #2a2a2a)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mail size={16} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: '0.9rem' }}>Report sent — thank you!</span>
          </div>
        )}

        {/* Delete account */}
        {!deleteConfirm ? (
          <button
            className="ghost-btn"
            style={{ color: '#ef4444', borderColor: '#ef4444', marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => setDeleteConfirm(true)}
          >
            <Trash2 size={15} /> Delete Account
          </button>
        ) : (
          <div style={{ marginTop: 12, padding: 16, border: '1px solid #ef4444', borderRadius: 10 }}>
            <p style={{ marginBottom: 12, color: '#ef4444' }}>Are you sure you want to permanently delete your account? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="primary-btn" style={{ background: '#ef4444' }} onClick={deleteAccount}>Yes, Delete</button>
              <button className="ghost-btn" onClick={() => setDeleteConfirm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </SettingsGroup>
    </div>
  );
}

function SettingsGroup({ title, icon, children }) {
  return (
    <section className="panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ opacity: 0.6 }}>{icon}</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.6 }}>{title}</span>
      </div>
      {children}
    </section>
  );
}

function SettingsToggle({ label, description, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border, #2a2a2a)' }}>
      <div>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{label}</p>
        {description && <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.55 }}>{description}</p>}
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, flexShrink: 0, marginLeft: 16 }}>
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{
          position: 'absolute', cursor: 'pointer', inset: 0, borderRadius: 24,
          background: value ? '#ef4444' : '#3a3a3a',
          transition: 'background 0.2s',
        }}>
          <span style={{
            position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18,
            borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
          }} />
        </span>
      </label>
    </div>
  );
}

const syncStoredUser = (user) => {
  const current = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.user) || '{}');
  window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify({ ...current, ...user }));
};
