import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import MobileNav from '../components/MobileNav.jsx';
import { nav, roleMeta } from '../data/navigation.js';
import { useAuth } from '../services/AuthContext.jsx';

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const roleNav = nav[role] || [];
  const meta = roleMeta[role] || { title: 'Portal', home: '/' };

  if (!user || user.role !== role) return <Navigate to={`/login/${role}`} replace />;
  if (role === 'driver' && ['pending', 'rejected', 'suspended', 'deleted'].includes(String(user.status || '').toLowerCase())) {
    return <Navigate to="/login/driver" replace />;
  }
  if (role === 'workshop' && ['pending', 'rejected', 'suspended', 'deleted'].includes(String(user.status || user.verificationStatus || '').toLowerCase())) {
    return <Navigate to="/login/workshop" replace />;
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <Logo />
        <p className="portal-title">{meta.title}</p>
        <nav>
          {roleNav.map(({ to, label, icon: Icon }) => (
            <NavLink end={to === meta.home} key={to} to={to}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="dashboard-main">
        <header className="dash-topbar">
          <div>
            <span className="eyebrow">{meta.title}</span>
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
