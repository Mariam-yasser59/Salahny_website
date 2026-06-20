import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { post } from '../../services/api.js';

export default function WorkshopDiagnostics() {
  const { state } = useLocation();
  const [bookingId, setBookingId] = useState(state?.bookingId || '');
  const [vitals, setVitals] = useState({ rpm: 820, coolantTemp: 92, speed: 0, map: 38, maf: 4.8, o2Voltage: 0.74, faultCodes: 'P0420, P0171', battery: 12.4, engineLoad: 32 });
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
      setError('Could not read this OBD file. Use CSV or JSON with rpm, speed, coolantTemp, battery, and engineLoad fields.');
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
        <input placeholder="Booking ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
        <input type="file" accept=".csv,.json" onChange={(e) => setObdFile(e.target.files?.[0] || null)} />
        {Object.entries(vitals).map(([key, value]) => (
          <input key={key} type={key === 'faultCodes' ? 'text' : 'number'} placeholder={key} value={value} onChange={(e) => setVitals({ ...vitals, [key]: key === 'faultCodes' ? e.target.value : Number(e.target.value) })} />
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
            {Object.entries(report.vitals || normalizeVitals(vitals)).map(([key, value]) => <article className="compact-card" key={key}><h3>{key}</h3><p>{String(value)}</p></article>)}
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
    const key = { coolanttemp: 'coolantTemp', engineload: 'engineLoad', batteryvoltage: 'battery' }[normalized] || normalized;
    const value = Number(values[index]);
    if (!Number.isNaN(value)) acc[key] = value;
    return acc;
  }, {});
};

const normalizeVitals = (values) => ({
  ...values,
  faultCodes: typeof values.faultCodes === 'string' ? values.faultCodes.split(',').map((item) => item.trim()).filter(Boolean) : values.faultCodes
});

const urgencyFromScore = (score = 0) => Number(score) > 80 ? 'Healthy' : Number(score) > 60 ? 'Warning' : 'Critical';
