import { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { put } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { fileToDataUrl } from '../../utils/fileToDataUrl.js';
import { STORAGE_KEYS } from '../../config/api.js';

export default function DriverProfile() {
  const { data, setData } = useApi('/driver/profile', {});
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    setProfileImage(data.profileImage || '');
  }, [data.profileImage]);

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileImage(await fileToDataUrl(file));
  };

  const saveProfileImage = async () => {
    const updated = await put('/driver/profile', { profileImage });
    const user = updated.user || updated;
    syncStoredUser(user);
    setData(user);
  };

  const removeProfileImage = async () => {
    setProfileImage('');
    const updated = await put('/driver/profile', { profileImage: '' });
    const user = updated.user || updated;
    syncStoredUser(user);
    setData(user);
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Profile & Settings" />
      <section className="panel profile-panel">
        <div className="profile-strip">
          <div className="profile-identity">
            {profileImage ? <img className="avatar image-avatar" src={profileImage} alt={data.name || 'Driver profile'} /> : <div className="avatar">{(data.name || 'DR').slice(0, 2).toUpperCase()}</div>}
            <div>
              <h2>{data.name || 'Driver'}</h2>
              <p>{data.email}</p>
              <p>{data.phone || 'No phone'} - {data.city || 'No city'}</p>
            </div>
          </div>
          <StatusBadge value={data.status || 'active'} />
        </div>

        <div className="form-grid">
          <label className="field-card">
            <span>Profile Picture</span>
            <small>Upload a clear JPG or PNG. It appears on your profile, booking cards, and chats when available.</small>
            <input type="file" accept="image/*" onChange={uploadImage} />
          </label>
          <button className="primary-btn" type="button" onClick={saveProfileImage}>Save profile picture</button>
          <button className="ghost-btn" type="button" onClick={removeProfileImage}>Remove picture</button>
        </div>

        <label><input type="checkbox" defaultChecked /> Booking notifications</label>
        <label><input type="checkbox" defaultChecked /> Diagnostic alerts</label>
        <label><input type="checkbox" /> Private profile mode</label>
      </section>
    </div>
  );
}

const syncStoredUser = (user) => {
  const current = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.user) || '{}');
  window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify({ ...current, ...user }));
};
