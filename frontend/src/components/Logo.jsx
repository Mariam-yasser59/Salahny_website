import { Link } from 'react-router-dom';

export default function Logo({ compact = false }) {
  return (
    <Link className="logo" to="/">
      <span className="logo-mark">S</span>
      {!compact && <span>Salahny</span>}
    </Link>
  );
}
