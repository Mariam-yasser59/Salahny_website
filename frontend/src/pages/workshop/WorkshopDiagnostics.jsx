import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { patch, post } from '../../services/api.js';

export default function WorkshopDiagnostics() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState(state?.bookingId || '');
  const [vitals, setVitals] = useState({
    ENGINE_RPM: '', COOLANT_TEMPERATURE: '', VEHICLE_SPEED: '',
    CONTROL_MODULE_VOLTAGE: '', ENGINE_RUN_TIME: '', ENGINE_LOAD: '', THROTTLE: '', TIMING_ADVANCE: '',
    SHORT_TERM_FUEL_TRIM_BANK_1: '', LONG_TERM_FUEL_TRIM_BANK_1: '', FUEL_TANK: '', FUEL_AIR_COMMANDED_EQUIV_RATIO: '',
    INTAKE_MANIFOLD_PRESSURE: '', INTAKE_AIR_TEMP: '', ABSOLUTE_BAROMETRIC_PRESSURE: '',
    ABSOLUTE_THROTTLE_B: '', RELATIVE_THROTTLE_POSITION: '', PEDAL_D: '', PEDAL_E: '', COMMANDED_THROTTLE_ACTUATOR: '',
    CATALYST_TEMPERATURE_BANK1_SENSOR1: '', CATALYST_TEMPERATURE_BANK1_SENSOR2: '',
    COMMANDED_EVAPORATIVE_PURGE: '',
    faultCodes: ''
  });
  const [report, setReport] = useState(null);
  const [obdFile, setObdFile] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [scanning, setScanning] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [completing, setCompleting] = useState(false);

  const run = async () => {
    setScanning(true);
    setError('');
    setMessage('');
    try {
      const { faultCodes: rawCodes, ...sensorMap } = vitals;
      const sensorReadings = Object.fromEntries(Object.entries(sensorMap).filter(([, v]) => v !== '').map(([k, v]) => [k, Number(v)]));
      const faultCodesArr = String(rawCodes || '').split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
      setReport(await post(`/workshop/diagnostics/${bookingId}/run`, { vitals: sensorReadings, sensorReadings, faultCodes: faultCodesArr }));
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };
  const upload = async () => {
    if (!obdFile) return;
    setError('');
    setMessage('');
    setScanning(true);
    const text = await obdFile.text();
    let parsed = {};
    try {
      parsed = obdFile.name.toLowerCase().endsWith('.json') ? JSON.parse(text) : parseCsvVitals(text);
    } catch (_err) {
      setError('Could not read this OBD file. Use CSV or JSON with columns such as rpm, coolantTemp, speed, map, maf, o2Voltage, battery, engineLoad, and faultCodes.');
      setScanning(false);
      return;
    }
    setVitals({ ...vitals, ...parsed });
    try {
      setReport(await post(`/workshop/diagnostics/${bookingId}/upload-obd`, { fileName: obdFile.name, vitals: normalizeVitals({ ...vitals, ...parsed }) }));
    } finally {
      setScanning(false);
    }
  };
  const share = async () => {
    setSharing(true);
    setError('');
    setMessage('');
    try {
      await post(`/workshop/diagnostics/${bookingId}/share`, { diagnosticId: report?.id || report?._id });
      setMessage('Report sent to the driver and notification created.');
    } catch (err) {
      setError(err.message || 'Could not send report to driver.');
    } finally {
      setSharing(false);
    }
  };

  const createRepairTask = async () => {
    setCreating(true);
    setError('');
    setMessage('');
    try {
      await post(`/workshop/diagnostics/${bookingId}/create-repair-task`, { diagnosticId: report?.id || report?._id });
      setMessage('Repair task created.');
      navigate('/workshop/requests', { state: { bookingId, status: 'repair_in_progress' } });
    } catch (err) {
      setError(err.message || 'Could not create repair task.');
    } finally {
      setCreating(false);
    }
  };

  const completeJob = async () => {
    setCompleting(true);
    setError('');
    setMessage('');
    try {
      await patch(`/workshop/bookings/${bookingId}/status`, { status: 'completed' });
      setMessage('Job completed.');
      navigate('/workshop/requests', { state: { bookingId, status: 'completed' } });
    } catch (err) {
      setError(err.message || 'Could not complete this job.');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Workshop Diagnostics" />
      <section className="visual-banner">
        <img src="/images/ai-diagnostic.jpg" alt="Professional OBD diagnostic scanner" />
        <div>
          <span className="eyebrow">Workshop AI report</span>
          <h3>Attach diagnostics to the active booking workflow.</h3>
          <p>Upload scanner data or enter OBD values manually, then share the report with the driver chat.</p>
        </div>
      </section>
      <section className="panel form-grid">
        <p className="form-note">Required OBD data is highlighted with names and units. You can enter readings manually or upload a CSV/JSON file with matching field names.</p>
        <label className="field-card">
          <span>Linked Booking ID</span>
          <small>Diagnostics must be attached to a workshop booking.</small>
          <input placeholder="Booking ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
        </label>
        <label className="field-card">
          <span>Upload OBD File (CSV or JSON)</span>
          <small>Accepted fields: ENGINE_RPM, COOLANT_TEMPERATURE, VEHICLE_SPEED, ENGINE_LOAD, THROTTLE, etc.</small>
          <input type="file" accept=".csv,.json" onChange={(e) => setObdFile(e.target.files?.[0] || null)} />
        </label>
        {WS_SENSOR_GROUPS.map((group) => (
          <div key={group.label} style={{ gridColumn: '1/-1', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <div style={{ width: 3, height: 14, borderRadius: 2, background: group.color }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: group.color, letterSpacing: '1.1px', textTransform: 'uppercase' }}>{group.label}</span>
            </div>
            {group.fields.map((field) => (
              <label className="field-card" key={field.key}>
                <span>{field.label} {field.unit && <small style={{ opacity: 0.6 }}>({field.unit})</small>}</span>
                <input type="number" step={field.step || '1'} placeholder={field.hint} value={vitals[field.key]} onChange={(e) => setVitals({ ...vitals, [field.key]: e.target.value })} />
              </label>
            ))}
          </div>
        ))}
        <label className="field-card" style={{ gridColumn: '1/-1' }}>
          <span>Fault Codes (DTC)</span>
          <small>Comma-separated codes from scanner. e.g. P0420, P0171</small>
          <input type="text" placeholder="P0300, P0420, U0100" value={vitals.faultCodes} onChange={(e) => setVitals({ ...vitals, faultCodes: e.target.value })} />
        </label>
        <button className="primary-btn" disabled={!bookingId || scanning} onClick={run}>Run AI Analysis</button>
        <button className="ghost-btn" disabled={!bookingId || !obdFile} onClick={upload}>Upload OBD file</button>
      </section>
      {scanning && <section className="diagnostic-card scanner-card"><span>Scanning OBD values</span><strong>AI</strong><p>Analyzing vitals, fault codes, urgency, and recommended repair path...</p><div className="splash-loader"><span /></div></section>}
      {error && <p className="error">{error}</p>}
      {message && <p className="success-card">{message}</p>}
      {report && (
        <section className="diagnostic-card">
          <span>AI diagnostic report</span>
          <strong>{report.healthScore || report.score || 0}%</strong>
          <h3>Detection: {report.detectedIssue || report.issue || report.possibleFault || 'Diagnostic issue'}</h3>
          <p><strong>Prediction:</strong> {report.predictedIssue || 'No near-term failure predicted'} {report.predictionHorizon ? `within ${report.predictionHorizon}` : ''}</p>
          {report.predictionReason && <p>{report.predictionReason}</p>}
          <p>Confidence: {report.confidence || report.probability || 0}% - Urgency: {report.urgency || urgencyFromScore(report.healthScore)}</p>
          <p>Repair category: {report.repairCategory || report.category || 'Diagnostics and repair'}</p>
          <p>{report.technicalNote || report.recommendation || report.recommendedFix}</p>
          <p>{report.recommendedFix || 'Inspect the highlighted systems, confirm OBD readings, and update the repair workflow.'}</p>
          <div className="chips">
            {(report.faultCodes || String(vitals.faultCodes || '').split(',').map((item) => item.trim()).filter(Boolean)).map((code) => <span key={code}>{code} - review</span>)}
          </div>
          <div className="feature-grid three">
            {Object.entries(report.vitals || normalizeVitals(vitals)).map(([key, value]) => <article className="compact-card" key={key}><h3>{fieldLabel(key)}</h3><p>{String(value)}</p></article>)}
          </div>
          <p>Linked request ID: {bookingId}</p>
          <div className="actions">
            <button className="ghost-btn" disabled={creating || sharing || completing} onClick={createRepairTask}>{creating ? 'Creating...' : 'Create Repair Task'}</button>
            <button className="primary-btn" disabled={creating || sharing || completing} onClick={share}>{sharing ? 'Sending...' : 'Send Report to Driver'}</button>
            <button className="ghost-btn" disabled={creating || sharing || completing} onClick={completeJob}>{completing ? 'Completing...' : 'Done'}</button>
          </div>
        </section>
      )}
    </div>
  );
}

const parseCsvVitals = (text) => {
  const rows = text.trim().split(/\r?\n/).map((row) => row.split(',').map((cell) => cell.trim()));
  const headers = rows[0] || [];
  const values = rows[1] || [];
  return headers.reduce((acc, header, index) => {
    const key = header.trim();
    const numericValue = Number(values[index]);
    acc[key] = key === 'faultCodes' ? values[index] : Number.isNaN(numericValue) ? values[index] : numericValue;
    return acc;
  }, {});
};

const normalizeVitals = (values) => values;

const urgencyFromScore = (score = 0) => Number(score) > 80 ? 'Healthy' : Number(score) > 60 ? 'Warning' : 'Critical';

const WS_SENSOR_GROUPS = [
  {
    label: 'Required', color: '#ef4444',
    fields: [
      { key: 'ENGINE_RPM', label: 'Engine RPM', unit: 'rpm', hint: 'e.g. 800' },
      { key: 'COOLANT_TEMPERATURE', label: 'Coolant Temperature', unit: '°C', hint: 'e.g. 90' },
      { key: 'VEHICLE_SPEED', label: 'Vehicle Speed', unit: 'km/h', hint: 'e.g. 60' },
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

const fieldLabel = (key) => WS_SENSOR_GROUPS.flatMap((g) => g.fields).find((f) => f.key === key)?.label || key;
