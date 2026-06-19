import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { post } from '../../services/api.js';

export default function WorkshopDiagnostics() {
  const { state } = useLocation();
  const [bookingId, setBookingId] = useState(state?.bookingId || '');
  const [vitals, setVitals] = useState({ rpm: 820, speed: 0, coolantTemp: 92, battery: 12.4, engineLoad: 32 });
  const [report, setReport] = useState(null);
  const [fileName, setFileName] = useState('');

  const run = async () => setReport(await post(`/workshop/diagnostics/${bookingId}/run`, { vitals }));
  const upload = async () => setReport(await post(`/workshop/diagnostics/${bookingId}/upload-obd`, { fileName }));
  const share = async () => post(`/workshop/diagnostics/${bookingId}/share`, { diagnosticId: report?.id || report?._id });

  return (
    <div className="dash-stack">
      <SectionHeader title="Workshop Diagnostics" />
      <section className="panel form-grid">
        <input placeholder="Booking ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
        <input type="file" accept=".csv,.json" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} />
        {Object.entries(vitals).map(([key, value]) => (
          <input key={key} type="number" placeholder={key} value={value} onChange={(e) => setVitals({ ...vitals, [key]: Number(e.target.value) })} />
        ))}
        <button className="primary-btn" disabled={!bookingId} onClick={run}>Run manual OBD</button>
        <button className="ghost-btn" disabled={!bookingId || !fileName} onClick={upload}>Upload OBD file</button>
      </section>
      {report && (
        <section className="diagnostic-card">
          <span>AI diagnostic report</span>
          <strong>{report.healthScore || report.score || 0}%</strong>
          <h3>{report.issue || report.possibleFault || 'Diagnostic issue'}</h3>
          <p>Confidence: {report.confidence || report.probability || 0}% - Urgency: {report.urgency || 'review'}</p>
          <p>{report.technicalNote || report.recommendation || report.recommendedFix}</p>
          <div className="chips">
            {(report.faultCodes || []).map((code) => <span key={code}>{code}</span>)}
          </div>
          <button className="primary-btn" onClick={share}>Share to driver chat</button>
        </section>
      )}
    </div>
  );
}
