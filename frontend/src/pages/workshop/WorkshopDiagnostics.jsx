import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { post } from '../../services/api.js';

export default function WorkshopDiagnostics() {
  const { state } = useLocation();
  const [bookingId, setBookingId] = useState(state?.bookingId || '');
  const [vitals, setVitals] = useState({ rpm: '', coolantTemp: '', speed: '', map: '', maf: '', o2Voltage: '', faultCodes: '', battery: '', engineLoad: '' });
  const [report, setReport] = useState(null);
  const [obdFile, setObdFile] = useState(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  const run = async () => {
    setScanning(true);
    setError('');
    try {
      setReport(await post(`/workshop/diagnostics/${bookingId}/run`, { vitals: normalizeVitals(vitals) }));
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };
  const upload = async () => {
    if (!obdFile) return;
    setError('');
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
  const share = async () => post(`/workshop/diagnostics/${bookingId}/share`, { diagnosticId: report?.id || report?._id });

  return (
    <div className="dash-stack">
      <SectionHeader title="Workshop Diagnostics" />
      <section className="panel form-grid">
        <p className="form-note">Required OBD data is highlighted with names and units. You can enter readings manually or upload a CSV/JSON file with matching field names.</p>
        <label className="field-card">
          <span>Linked Booking ID</span>
          <small>Diagnostics must be attached to a workshop booking.</small>
          <input placeholder="Booking ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
        </label>
        <label className="field-card">
          <span>Upload OBD File (CSV or JSON)</span>
          <small>Accepted fields: rpm, coolantTemp, speed, map, maf, o2Voltage, battery, engineLoad, faultCodes.</small>
          <input type="file" accept=".csv,.json" onChange={(e) => setObdFile(e.target.files?.[0] || null)} />
        </label>
        {workshopObdFields.map((field) => (
          <label className="field-card" key={field.key}>
            <span>{field.label}</span>
            <small>{field.help}</small>
            <input type={field.key === 'faultCodes' ? 'text' : 'number'} step={field.step || '1'} placeholder={field.placeholder} value={vitals[field.key]} onChange={(e) => setVitals({ ...vitals, [field.key]: field.key === 'faultCodes' ? e.target.value : e.target.value })} />
          </label>
        ))}
        <button className="primary-btn" disabled={!bookingId || scanning} onClick={run}>Run AI Analysis</button>
        <button className="ghost-btn" disabled={!bookingId || !obdFile} onClick={upload}>Upload OBD file</button>
      </section>
      {scanning && <section className="diagnostic-card scanner-card"><span>Scanning OBD values</span><strong>AI</strong><p>Analyzing vitals, fault codes, urgency, and recommended repair path...</p><div className="splash-loader"><span /></div></section>}
      {error && <p className="error">{error}</p>}
      {report && (
        <section className="diagnostic-card">
          <span>AI diagnostic report</span>
          <strong>{report.healthScore || report.score || 0}%</strong>
          <h3>{report.issue || report.possibleFault || 'Diagnostic issue'}</h3>
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
            <button className="ghost-btn">Create Repair Task</button>
            <button className="primary-btn" onClick={share}>Send Report to Driver</button>
            <button className="ghost-btn" onClick={() => setReport(null)}>Done</button>
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
    const normalized = header.replace(/[\s_-]+/g, '').toLowerCase();
    const key = { coolanttemp: 'coolantTemp', engineload: 'engineLoad', batteryvoltage: 'battery', o2voltage: 'o2Voltage', intakemanifoldpressure: 'map' }[normalized] || normalized;
    const numericValue = Number(values[index]);
    acc[key] = key === 'faultCodes' ? values[index] : Number.isNaN(numericValue) ? values[index] : numericValue;
    return acc;
  }, {});
};

const normalizeVitals = (values) => ({
  ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, key === 'faultCodes' || value === '' ? value : Number(value)])),
  faultCodes: typeof values.faultCodes === 'string' ? values.faultCodes.split(',').map((item) => item.trim()).filter(Boolean) : values.faultCodes
});

const urgencyFromScore = (score = 0) => Number(score) > 80 ? 'Healthy' : Number(score) > 60 ? 'Warning' : 'Critical';

const workshopObdFields = [
  { key: 'rpm', label: 'Engine RPM (RPM)', help: 'Current engine speed from OBD.', placeholder: 'Example: 850' },
  { key: 'coolantTemp', label: 'Coolant Temperature (C)', help: 'Engine coolant temperature.', placeholder: 'Example: 92' },
  { key: 'speed', label: 'Vehicle Speed (km/h)', help: 'Speed reported by the vehicle.', placeholder: 'Example: 0' },
  { key: 'map', label: 'MAP / Intake Pressure (kPa)', help: 'Intake manifold absolute pressure.', placeholder: 'Example: 38' },
  { key: 'maf', label: 'MAF Air Flow (g/s)', help: 'Mass air flow sensor reading.', placeholder: 'Example: 4.8', step: '0.1' },
  { key: 'o2Voltage', label: 'O2 Sensor Voltage (V)', help: 'Oxygen sensor voltage.', placeholder: 'Example: 0.74', step: '0.01' },
  { key: 'battery', label: 'Battery Voltage (V)', help: 'Battery or charging voltage.', placeholder: 'Example: 12.4', step: '0.1' },
  { key: 'engineLoad', label: 'Engine Load (%)', help: 'Calculated engine load percentage.', placeholder: 'Example: 32' },
  { key: 'faultCodes', label: 'Fault Codes (DTC)', help: 'Comma-separated codes from scanner.', placeholder: 'Example: P0420, P0171' }
];

const fieldLabel = (key) => workshopObdFields.find((field) => field.key === key)?.label || key;
