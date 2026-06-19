import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';

export default function RoleSelection() {
  return (
    <main className="page role-page">
      <SectionHeader eyebrow="Workshop portal" title="Run your Salahny workshop operations from the web" />
      <article className="feature-card role-card">
        <Store />
        <h3>Workshop account</h3>
        <p>Register, wait for document verification and admin approval, then manage requests, jobs, services, diagnostics, emergency assignments, earnings, chat, and availability.</p>
        <div className="actions">
          <Link className="primary-btn" to="/login">Login</Link>
          <Link className="ghost-btn" to="/register">Register</Link>
        </div>
      </article>
    </main>
  );
}
