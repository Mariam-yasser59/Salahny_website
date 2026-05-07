import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';
import { post } from '../../services/api.js';

export default function DriverDiagnostics() {
  const { data, setData } = useApi('/driver/diagnostics', []);
  const [form, setForm] = useState({ coolantTemp: 91, rpm: 850, speed: 0, battery: 12.4, brake: 'Good', engineLoad: 32, vehicleId: 'v1' });
  const run = async () => setData([await post('/driver/diagnostics', form), ...data]);

  return (
    <div className="dash-stack">
      <SectionHeader title="AI Diagnostics" />
      <section className="panel form-grid">
        {['coolantTemp', 'rpm', 'speed', 'battery', 'engineLoad'].map((key) => <input key={key} type="number" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
        <select value={form.brake} onChange={(e) => setForm({ ...form, brake: e.target.value })}><option>Good</option><option>Fair</option><option>Needs attention</option></select>
        <button className="primary-btn" type="button" onClick={run}>Run diagnostic</button>
      </section>
      <div className="feature-grid two">{data.map((item) => <article className="diagnostic-card" key={item.id}><span>{item.date}</span><strong>{item.healthScore}%</strong><p>{item.possibleFault} · {item.probability}% probability</p><div className="meter"><span style={{ width: `${item.healthScore}%` }} /></div><small>{item.recommendation}</small></article>)}</div>
    </div>
  );
}
