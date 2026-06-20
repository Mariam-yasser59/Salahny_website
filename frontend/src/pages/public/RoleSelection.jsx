import { Link } from 'react-router-dom';
import { Car, Store } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';

export default function RoleSelection() {
  return (
    <main className="page role-page">
      <SectionHeader eyebrow="Choose your portal" title="Continue as Driver or Workshop" />
      <div className="feature-grid two">
        <article className="feature-card role-card">
          <Car />
          <h3>Driver</h3>
          <p>Book services, track jobs, manage vehicles, chat with workshops, and view diagnostics from your driver portal.</p>
          <div className="actions">
            <Link className="primary-btn" to="/login/driver">Driver Login</Link>
            <Link className="ghost-btn" to="/register/driver">Create Driver Account</Link>
          </div>
        </article>
        <article className="feature-card role-card">
          <Store />
          <h3>Workshop</h3>
          <p>Manage requests, active jobs, services, diagnostics, emergency assignments, earnings, admin chat, and availability.</p>
          <div className="actions">
            <Link className="primary-btn" to="/login/workshop">Workshop Login</Link>
            <Link className="ghost-btn" to="/register/workshop">Register Workshop</Link>
          </div>
        </article>
      </div>
    </main>
  );
}
