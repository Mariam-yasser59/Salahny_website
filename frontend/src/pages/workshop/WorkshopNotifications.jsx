import { Bell, CalendarCheck, UserCheck, Wrench } from 'lucide-react';
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
  if (text.includes('booking') || text.includes('request')) return CalendarCheck;
  if (text.includes('approval') || text.includes('verified')) return UserCheck;
  if (text.includes('service') || text.includes('repair')) return Wrench;
  return Bell;
};

const getDate = (item) => {
  const value = item.createdAt || item.updatedAt || item.date;
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
};

export default function WorkshopNotifications() {
  const { data } = useApi('/workshop/notifications', []);
  const notifications = [...toList(data)].sort((a, b) =>
    new Date(b.createdAt || b.updatedAt || b.date || 0) -
    new Date(a.createdAt || a.updatedAt || a.date || 0)
  );

  return (
    <div className="dash-stack">
      <SectionHeader title="Notifications">
        Booking requests, approval updates, repair actions, and customer messages appear here.
      </SectionHeader>

      {notifications.length ? (
        <div className="feature-grid two">
          {notifications.map((item, index) => {
            const Icon = getIcon(item);
            return (
              <article className="feature-card" key={item.id || item._id || index}>
                <Icon size={24} />
                <h3>{item.title || item.type || 'Workshop update'}</h3>
                <p>{item.message || item.body || 'You have a new workshop update.'}</p>
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
          <span>New booking and workshop updates will appear here.</span>
        </article>
      )}
    </div>
  );
}
