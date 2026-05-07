export default function EmptyState({ title = 'Nothing here yet', message = 'When data is available, it will appear here.' }) {
  return <div className="state-card"><strong>{title}</strong><p>{message}</p></div>;
}
