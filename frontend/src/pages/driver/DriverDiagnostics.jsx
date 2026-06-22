import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';
import { post } from '../../services/api.js';

export default function DriverDiagnostics() {
  const { data, setData } = useApi('/driver/diagnostics', []);
  const [form, setForm] = useState({ coolantTemp: '', rpm: '', speed: '', battery: '', brake: 'Good', engineLoad: '', vehicleId: '' });

  const run = async () => {
    const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, numericFields.includes(key) ? Number(value) : value]));
    setData([await post('/driver/diagnostics', payload), ...data]);
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="AI Diagnostics" />
      <section className="visual-banner">
        <img src="/images/ai-diagnostic.jpg" alt="OBD diagnostic scanner connected to a car" />
        <div>
          <span className="eyebrow">AI car check</span>
          <h3>Understand vehicle symptoms before booking a repair.</h3>
          <p>Enter OBD readings from your scanner, then use the diagnostic result to choose the right service.</p>
        </div>
      </section>
      <section className="panel form-grid">
        <p className="form-note">Enter live OBD values from your scanner. Required readings are highlighted with units so the report is easier to understand.</p>
        {driverDiagnosticFields.map((field) => (
          <label className="field-card" key={field.key}>
            <span>{field.label}</span>
            <small>{field.help}</small>
            <input required={field.required} type="number" step={field.step || '1'} placeholder={field.placeholder} value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} />
          </label>
        ))}
        <label className="field-card">
          <span>Brake Condition</span>
          <small>Choose the closest visual or sensor-based condition.</small>
          <select value={form.brake} onChange={(e) => setForm({ ...form, brake: e.target.value })}><option>Good</option><option>Fair</option><option>Needs attention</option></select>
        </label>
        <button className="primary-btn" type="button" onClick={run}>Run diagnostic</button>
      </section>
      <div className="feature-grid two">{data.map((item) => <article className="diagnostic-card" key={item.id}><span>{item.date}</span><strong>{item.healthScore}%</strong><p>{item.possibleFault} - {item.probability}% probability</p><div className="meter"><span style={{ width: `${item.healthScore}%` }} /></div><small>{item.recommendation}</small></article>)}</div>
    </div>
  );
}

const driverDiagnosticFields = [
  { key: 'rpm', label: 'Engine RPM (RPM)', help: 'Current engine revolutions per minute.', placeholder: 'Example: 850', required: true },
  { key: 'coolantTemp', label: 'Coolant Temperature (C)', help: 'Engine coolant temperature from OBD.', placeholder: 'Example: 92', required: true },
  { key: 'speed', label: 'Vehicle Speed (km/h)', help: 'Current speed from the OBD scanner.', placeholder: 'Example: 0', required: true },
  { key: 'battery', label: 'Battery Voltage (V)', help: 'Battery or charging voltage.', placeholder: 'Example: 12.4', required: true, step: '0.1' },
  { key: 'engineLoad', label: 'Engine Load (%)', help: 'Calculated engine load percentage.', placeholder: 'Example: 32', required: true }
];

const numericFields = driverDiagnosticFields.map((field) => field.key);
