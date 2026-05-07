import { Link } from 'react-router-dom';
import { Car, ShieldCheck, Store } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';

const roles = [
  { role: 'driver', title: 'Driver', text: 'Book services, request roadside help, run AI diagnostics, and track your car care.', icon: Car },
  { role: 'workshop', title: 'Workshop', text: 'Receive requests, update jobs, manage services, and chat with drivers.', icon: Store },
  { role: 'admin', title: 'Super Admin', text: 'Monitor users, workshops, bookings, services, packages, and platform activity.', icon: ShieldCheck }
];

export default function RoleSelection() {
  return (
    <main className="page role-page">
      <SectionHeader eyebrow="Choose portal" title="Open Salahny as the right role" />
      <div className="feature-grid three">
        {roles.map(({ role, title, text, icon: Icon }) => (
          <article className="feature-card role-card" key={role}>
            <Icon />
            <h3>{title}</h3>
            <p>{text}</p>
            <div className="actions">
              <Link className="primary-btn" to={`/login/${role}`}>Login</Link>
              {role !== 'admin' && <Link className="ghost-btn" to={`/register/${role}`}>Register</Link>}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
