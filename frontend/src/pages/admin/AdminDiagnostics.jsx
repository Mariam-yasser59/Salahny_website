import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { del } from '../../services/api.js';

export default function AdminDiagnostics() {
  const { data, setData } = useApi('/admin/diagnostics', []);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const remove = async (id) => {
    if (!window.confirm('Delete this diagnostic record?')) return;
    try {
      await del(`/admin/diagnostics/${id}`);
      setData((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(err.message || 'Could not delete record.');
    }
  };

  const filtered = data
    .filter((d) => {
      if (filter === 'critical') return Number(d.healthScore) < 60;
      if (filter === 'warning') return Number(d.healthScore) >= 60 && Number(d.healthScore) < 80;
      if (filter === 'healthy') return Number(d.healthScore) >= 80;
      return true;
    })
    .filter((d) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (d.driverName || '').toLowerCase().includes(q) ||
        (d.driverEmail || '').toLowerCase().includes(q) ||
        (d.possibleFault || '').toLowerCase().includes(q) ||
        (d.id || '').toLowerCase().includes(q)
      );
    });

  const stats = {
    total: data.length,
    critical: data.filter((d) => Number(d.healthScore) < 60).length,
    warning: data.filter((d) => Number(d.healthScore) >= 60 && Number(d.healthScore) < 80).length,
    healthy: data.filter((d) => Number(d.healthScore) >= 80).length,
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Diagnostics Management">
        View and manage all AI diagnostic reports submitted by drivers.
      </SectionHeader>

      {/* Stats */}
      <div className="feature-grid four" style={{ '--col': 4 }}>
        {[
          { label: 'Total Scans', value: stats.total, color: '' },
          { label: 'Healthy', value: stats.healthy, color: '#22c55e' },
          { label: 'Warning', value: stats.warning, color: '#f59e0b' },
          { label: 'Critical', value: stats.critical, color: '#ef4444' },
        ].map((s) => (
          <article className="compact-card" key={s.label} style={{ textAlign: 'center' }}>
            <strong style={{ fontSize: '1.8rem', color: s.color || 'inherit' }}>{s.value}</strong>
            <p style={{ margin: 0, opacity: 0.6, fontSize: '0.85rem' }}>{s.label}</p>
          </article>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          placeholder="Search by driver, fault..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        {['all', 'healthy', 'warning', 'critical'].map((f) => (
          <button key={f} className={filter === f ? 'primary-btn' : 'ghost-btn'} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <article className="state-card">
          <strong>No diagnostics found</strong>
          <span>{data.length === 0 ? 'No diagnostic scans have been submitted yet.' : 'No records match your filter.'}</span>
        </article>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((d) => (
            <article
              className="feature-card booking-card"
              key={d.id}
              style={{
                borderLeft: `4px solid ${Number(d.healthScore) >= 80 ? '#22c55e' : Number(d.healthScore) >= 60 ? '#f59e0b' : '#ef4444'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <strong>{d.driverName || 'Unknown driver'}</strong>
                  <span style={{ opacity: 0.5, fontSize: '0.8rem', marginLeft: 8 }}>{d.driverEmail}</span>
                  <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: '0.85rem' }}>
                    {d.possibleFault || d.detectedIssue || 'No fault detected'}
                  </p>
                  {(d.faultCodes || []).length > 0 && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', opacity: 0.6 }}>
                      DTCs: {d.faultCodes.join(', ')}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <strong style={{
                      fontSize: '1.4rem',
                      color: Number(d.healthScore) >= 80 ? '#22c55e' : Number(d.healthScore) >= 60 ? '#f59e0b' : '#ef4444'
                    }}>
                      {d.healthScore}%
                    </strong>
                    <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.5 }}>Health</p>
                  </div>
                  <button
                    className="ghost-btn"
                    style={{ color: '#ef4444', borderColor: '#ef4444', padding: '6px 10px' }}
                    onClick={() => remove(d.id)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.8rem', opacity: 0.65 }}>
                <span>Confidence: {d.probability || 0}%</span>
                <span>Date: {d.date ? new Date(d.date).toLocaleDateString() : '—'}</span>
                <span>ID: {d.id}</span>
              </div>

              {d.recommendation && (
                <p style={{ margin: '8px 0 0', fontSize: '0.85rem', opacity: 0.75 }}>{d.recommendation}</p>
              )}

              {d.sensorReadings && (
                <details style={{ marginTop: 10 }}>
                  <summary style={{ fontSize: '0.8rem', opacity: 0.6, cursor: 'pointer' }}>View sensor readings</summary>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6, marginTop: 8 }}>
                    {Object.entries(d.sensorReadings).map(([key, val]) => (
                      <div key={key} className="compact-card" style={{ padding: '6px 10px' }}>
                        <small style={{ opacity: 0.5, display: 'block', fontSize: '0.7rem' }}>{key}</small>
                        <strong style={{ fontSize: '0.85rem' }}>{val}</strong>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
