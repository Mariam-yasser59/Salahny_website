import { Link, NavLink, Outlet } from 'react-router-dom';
import Logo from '../components/Logo.jsx';

const links = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/services', 'Services'],
  ['/contact', 'Contact']
];

export default function PublicLayout() {
  return (
    <div className="site-shell">
      <header className="public-nav">
        <Logo />
        <nav>
          {links.map(([to, label]) => <NavLink key={to} to={to === '/' ? '/home' : to}>{label}</NavLink>)}
        </nav>
        <div className="nav-actions">
          <Link className="ghost-btn" to="/login">Workshop Login</Link>
          <Link className="primary-btn" to="/register">Register Workshop</Link>
        </div>
      </header>
      <Outlet />
      <footer className="footer">
        <Logo />
        <p>Workshop operations for Salahny service partners.</p>
        <div>
          <Link to="/login">Workshop Login</Link>
          <Link to="/register">Register Workshop</Link>
        </div>
      </footer>
    </div>
  );
}
