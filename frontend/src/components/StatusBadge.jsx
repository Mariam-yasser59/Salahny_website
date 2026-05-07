export default function StatusBadge({ value }) {
  const clean = String(value || 'active').replace('_', ' ');
  return <span className={`badge badge-${String(value).toLowerCase()}`}>{clean}</span>;
}
