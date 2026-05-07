import { Link, NavLink, Outlet } from 'react-router-dom';
import Logo from '../components/Logo.jsx';

const links = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/services', 'Services'],
  ['/packages', 'Packages'],
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
          <Link className="ghost-btn" to="/login/driver">Driver Login</Link>
          <Link className="primary-btn" to="/register/driver">Get Started</Link>
        </div>
      </header>
      <Outlet />
      <footer className="footer">
        <Logo />
        <p>Smart vehicle care, trusted workshops, and platform operations in one connected system.</p>
        <div>
          <Link to="/login/workshop">Workshop Login</Link>
          <Link to="/login/admin">Super Admin</Link>
        </div>
      </footer>
    </div>
  );
}
