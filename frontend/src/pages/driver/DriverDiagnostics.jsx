import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';
import { post } from '../../services/api.js';

const SENSOR_GROUPS = [
  {
    label: 'Required', color: '#ef4444',
    fields: [
      { key: 'ENGINE_RPM', label: 'Engine RPM', unit: 'rpm', hint: 'e.g. 800', required: true },
      { key: 'COOLANT_TEMPERATURE', label: 'Coolant Temperature', unit: '°C', hint: 'e.g. 90', required: true },
      { key: 'VEHICLE_SPEED', label: 'Vehicle Speed', unit: 'km/h', hint: 'e.g. 60', required: true },
    ]
  },
  {
    label: 'Engine', color: '#f59e0b',
    fields: [
      { key: 'CONTROL_MODULE_VOLTAGE', label: 'Control Module Voltage', unit: 'V', hint: 'e.g. 14.2', step: '0.1' },
      { key: 'ENGINE_RUN_TIME', label: 'Engine Run Time', unit: 's', hint: 'e.g. 300' },
      { key: 'ENGINE_LOAD', label: 'Engine Load', unit: '%', hint: 'e.g. 45' },
      { key: 'THROTTLE', label: 'Throttle Position', unit: '%', hint: 'e.g. 20' },
      { key: 'TIMING_ADVANCE', label: 'Timing Advance', unit: '°', hint: 'e.g. 10' },
    ]
  },
  {
    label: 'Fuel System', color: '#eab308',
    fields: [
      { key: 'SHORT_TERM_FUEL_TRIM_BANK_1', label: 'Short-Term Fuel Trim B1', unit: '%', hint: 'e.g. -2.3', step: '0.1' },
      { key: 'LONG_TERM_FUEL_TRIM_BANK_1', label: 'Long-Term Fuel Trim B1', unit: '%', hint: 'e.g. 1.5', step: '0.1' },
      { key: 'FUEL_TANK', label: 'Fuel Tank Level', unit: '%', hint: 'e.g. 65' },
      { key: 'FUEL_AIR_COMMANDED_EQUIV_RATIO', label: 'Fuel/Air Equiv Ratio', unit: 'λ', hint: 'e.g. 1.00', step: '0.01' },
    ]
  },
  {
    label: 'Air & Pressure', color: '#3b82f6',
    fields: [
      { key: 'INTAKE_MANIFOLD_PRESSURE', label: 'Intake Manifold Pressure', unit: 'kPa', hint: 'e.g. 101' },
      { key: 'INTAKE_AIR_TEMP', label: 'Intake Air Temperature', unit: '°C', hint: 'e.g. 30' },
      { key: 'ABSOLUTE_BAROMETRIC_PRESSURE', label: 'Absolute Barometric Pressure', unit: 'kPa', hint: 'e.g. 101' },
    ]
  },
  {
    label: 'Throttle & Pedal', color: '#22c55e',
    fields: [
      { key: 'ABSOLUTE_THROTTLE_B', label: 'Absolute Throttle B', unit: '%', hint: 'e.g. 18' },
      { key: 'RELATIVE_THROTTLE_POSITION', label: 'Relative Throttle Position', unit: '%', hint: 'e.g. 12' },
      { key: 'PEDAL_D', label: 'Pedal Position D', unit: '%', hint: 'e.g. 22' },
      { key: 'PEDAL_E', label: 'Pedal Position E', unit: '%', hint: 'e.g. 22' },
      { key: 'COMMANDED_THROTTLE_ACTUATOR', label: 'Commanded Throttle Actuator', unit: '%', hint: 'e.g. 20' },
    ]
  },
  {
    label: 'Catalyst Temperature', color: '#ef4444',
    fields: [
      { key: 'CATALYST_TEMPERATURE_BANK1_SENSOR1', label: 'Catalyst Temp B1S1', unit: '°C', hint: 'e.g. 520' },
      { key: 'CATALYST_TEMPERATURE_BANK1_SENSOR2', label: 'Catalyst Temp B1S2', unit: '°C', hint: 'e.g. 490' },
    ]
  },
  {
    label: 'Evaporative System', color: '#22c55e',
    fields: [
      { key: 'COMMANDED_EVAPORATIVE_PURGE', label: 'Commanded Evaporative Purge', unit: '%', hint: 'e.g. 50' },
    ]
  },
];

const ALL_KEYS = SENSOR_GROUPS.flatMap((g) => g.fields.map((f) => f.key));

const emptyForm = () => Object.fromEntries([...ALL_KEYS.map((k) => [k, '']), ['faultCodes', ''], ['vehicleId', '']]);

export default function DriverDiagnostics() {
  const { data, setData } = useApi('/driver/diagnostics', []);
  const [form, setForm] = useState(emptyForm);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const run = async () => {
    const sensorReadings = {};
    for (const key of ALL_KEYS) {
      const val = form[key];
      if (val !== '') sensorReadings[key] = Number(val);
    }
    const faultCodes = form.faultCodes
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    setScanning(true);
    setError('');
    try {
      const result = await post('/driver/diagnostics', { sensorReadings, faultCodes, vehicleId: form.vehicleId });
      setData([result, ...data]);
    } catch (err) {
      setError(err.message || 'Diagnostic scan failed.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="AI Diagnostics" />
      <section className="visual-banner">
        <img src="/images/ai-diagnostic.jpg" alt="OBD diagnostic scanner connected to a car" />
        <div>
          <span className="eyebrow">AI car check</span>
          <h3>Real-time OBD-II + AI analysis.</h3>
          <p>Enter your vehicle sensor readings manually. Values are sent to the AI engine for real-time analysis.</p>
        </div>
      </section>

      <section className="panel form-grid">
        <p className="form-note" style={{ gridColumn: '1/-1' }}>Enter live OBD values from your scanner. Required readings are marked with *.</p>

        {SENSOR_GROUPS.map((group) => (
          <div key={group.label} style={{ gridColumn: '1/-1', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <div style={{ width: 3, height: 14, borderRadius: 2, background: group.color }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: group.color, letterSpacing: '1.1px', textTransform: 'uppercase' }}>{group.label}</span>
            </div>
            {group.fields.map((field) => (
              <label className="field-card" key={field.key}>
                <span>{field.label}{field.required && ' *'} {field.unit && <small style={{ opacity: 0.6 }}>({field.unit})</small>}</span>
                <input
                  type="number"
                  step={field.step || '1'}
                  placeholder={field.hint}
                  required={field.required}
                  value={form[field.key]}
                  onChange={(e) => set(field.key, e.target.value)}
                />
              </label>
            ))}
          </div>
        ))}

        <div style={{ gridColumn: '1/-1', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
            <div style={{ width: 3, height: 14, borderRadius: 2, background: '#ef4444' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ef4444', letterSpacing: '1.1px', textTransform: 'uppercase' }}>DTC Fault Codes</span>
          </div>
          <label className="field-card" style={{ gridColumn: '1/-1' }}>
            <span>Fault Codes (optional)</span>
            <small>Enter codes from your OBD scanner, separated by commas. e.g. P0300, P0420</small>
            <input type="text" placeholder="P0300, P0420, U0100" value={form.faultCodes} onChange={(e) => set('faultCodes', e.target.value)} />
          </label>
        </div>

        {error && <p className="error" style={{ gridColumn: '1/-1' }}>{error}</p>}
        <button className="primary-btn" style={{ gridColumn: '1/-1' }} type="button" disabled={scanning} onClick={run}>
          {scanning ? 'Scanning...' : 'Start Full Scan'}
        </button>
      </section>

      {data.length > 0 && (
        <div className="feature-grid two">
          {data.map((item) => (
            <article className="diagnostic-card" key={item.id || item._id}>
              <span>{item.date ? new Date(item.date).toLocaleDateString() : 'Today'}</span>
              <strong>{item.healthScore}%</strong>
              <p>{item.possibleFault || item.detectedIssue || 'Diagnostic complete'} – {item.probability || item.confidence || 0}% probability</p>
              <div className="meter"><span style={{ width: `${item.healthScore}%` }} /></div>
              <small>{item.recommendation || item.recommendedFix || ''}</small>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
