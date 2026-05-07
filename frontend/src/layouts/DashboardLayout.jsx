import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import MobileNav from '../components/MobileNav.jsx';
import { nav, roleMeta } from '../data/navigation.js';
import { useAuth } from '../services/AuthContext.jsx';

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== role) return <Navigate to={`/login/${role}`} replace />;

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <Logo />
        <p className="portal-title">{roleMeta[role].title}</p>
        <nav>
          {nav[role].map(({ to, label, icon: Icon }) => (
            <NavLink end={to === roleMeta[role].home} key={to} to={to}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="dashboard-main">
        <header className="dash-topbar">
          <div>
            <span className="eyebrow">{roleMeta[role].title}</span>
            <h1>Welcome back, {user.name}</h1>
          </div>
          <button className="ghost-btn" onClick={() => { logout(); navigate('/'); }}>Logout</button>
        </header>
        <Outlet />
        <MobileNav role={role} />
      </main>
    </div>
  );
}
