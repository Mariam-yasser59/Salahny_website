import { useEffect, useState } from 'react';
import { Activity, Database, MailCheck, Server } from 'lucide-react';
import { API_BASE_URL, API_ORIGIN } from '../config/api.js';
import StatusBadge from './StatusBadge.jsx';

export default function LiveIntegrationStatus() {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    let active = true;

    fetch(`${API_BASE_URL}/health`)
      .then((response) => response.json())
      .then((data) => {
        if (active) setState({ loading: false, error: '', data });
      })
      .catch((error) => {
        if (active) setState({ loading: false, error: error.message, data: null });
      });

    return () => {
      active = false;
    };
  }, []);

  const databaseStatus = state.data?.database?.status || (state.data?.database ? 'connected' : 'unknown');
  const emailStatus = state.data?.email?.configured ? 'configured' : state.data?.email ? 'not configured' : 'unknown';

  return (
    <section className="content-band subtle">
      <div className="integration-panel">
        <div>
          <span className="eyebrow">Live Integration</span>
          <h2>Website, driver portal, workshop portal, and admin portal use the production backend.</h2>
          <p>
            Public data, login, bookings, vehicles, workshop availability, diagnostics, ratings,
            notifications, and account approvals are routed to the same Railway API and MongoDB used
            by the Salahny application.
          </p>
          <p className="api-endpoint">{API_ORIGIN}</p>
        </div>
        <div className="integration-grid">
          <article className="feature-card">
            <Server />
            <h3>API</h3>
            <StatusBadge value={state.loading ? 'checking' : state.error ? 'offline' : 'connected'} />
            <p>{state.error || state.data?.service || 'Checking production API health.'}</p>
          </article>
          <article className="feature-card">
            <Database />
            <h3>MongoDB</h3>
            <StatusBadge value={databaseStatus} />
            <p>{state.data?.database?.message || 'Database health comes from the backend health endpoint.'}</p>
          </article>
          <article className="feature-card">
            <MailCheck />
            <h3>Email</h3>
            <StatusBadge value={emailStatus} />
            <p>{state.data?.email?.provider ? `${state.data.email.provider} from ${state.data.email.from}` : 'Email provider status is loaded from production.'}</p>
          </article>
          <article className="feature-card">
            <Activity />
            <h3>Cross-role flow</h3>
            <StatusBadge value="connected" />
            <p>Driver bookings appear in workshop operations, then completion enables ratings and earnings updates.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
