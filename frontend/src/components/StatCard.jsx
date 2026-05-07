export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <article className="stat-card">
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {hint && <span>{hint}</span>}
      </div>
      {Icon && <Icon size={24} />}
    </article>
  );
}
