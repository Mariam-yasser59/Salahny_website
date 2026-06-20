import { Bell, CalendarCheck, Siren, Wrench } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';

const toList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.notifications)) return data.notifications;
  if (Array.isArray(data?.data?.notifications)) return data.data.notifications;
  return [];
};

const getIcon = (item) => {
  const text = `${item.type || ''} ${item.title || ''} ${item.message || ''}`.toLowerCase();

  if (text.includes('emergency')) return Siren;
  if (text.includes('booking')) return CalendarCheck;
  if (text.includes('workshop')) return Wrench;
  return Bell;
};

const getTitle = (item) =>
  item.title ||
  item.message ||
  'Salahny notification';

const getMessage = (item) =>
  item.message && item.title && item.message !== item.title
    ? item.message
    : item.body || item.description || 'You have a new update from Salahny.';

const getDate = (item) => {
  const value = item.createdAt || item.updatedAt || item.date;
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

export default function DriverNotifications() {
  const { data } = useApi('/driver/notifications', []);
  const notifications = [...toList(data)].sort((a, b) =>
    new Date(b.createdAt || b.updatedAt || b.date || 0) -
    new Date(a.createdAt || a.updatedAt || a.date || 0)
  );

  return (
    <div className="dash-stack">
      <SectionHeader title="Notifications">
        Track booking updates, workshop actions, emergency updates, and system alerts.
      </SectionHeader>

      {notifications.length ? (
        <div className="feature-grid two">
          {notifications.map((item, index) => {
            const Icon = getIcon(item);

            return (
              <article className="feature-card" key={item.id || item._id || index}>
                <Icon size={24} />

                <h3>{getTitle(item)}</h3>

                <p>{getMessage(item)}</p>

                {getDate(item) && <p>{getDate(item)}</p>}

                <StatusBadge value={item.read ? 'read' : item.status || 'new'} />
              </article>
            );
          })}
        </div>
      ) : (
        <article className="state-card">
          <Bell size={30} />
          <strong>No notifications yet</strong>
          <span>Your booking and emergency updates will appear here.</span>
        </article>
      )}
    </div>
  );
}