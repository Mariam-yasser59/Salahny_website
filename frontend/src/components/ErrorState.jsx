export default function ErrorState({ message = 'Unable to load data.' }) {
  return <div className="state-card error-state"><strong>Connection issue</strong><p>{message}</p></div>;
}
