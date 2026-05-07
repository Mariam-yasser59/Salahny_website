import SectionHeader from '../../components/SectionHeader.jsx';

export default function WorkshopDiagnostics() {
  return (
    <div className="dash-stack">
      <SectionHeader title="Workshop AI Reports" />
      <div className="feature-grid two">
        {['Battery degradation risk', 'Oil service due soon', 'Brake wear pattern', 'High engine load pattern'].map((item, index) => (
          <article className="diagnostic-card" key={item}>
            <span>AI report #{index + 1}</span>
            <strong>{88 - index * 7}%</strong>
            <p>{item}</p>
            <div className="meter"><span style={{ width: `${88 - index * 7}%` }} /></div>
            <small>Use this summary while quoting and prioritizing incoming workshop jobs.</small>
          </article>
        ))}
      </div>
    </div>
  );
}
