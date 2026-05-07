import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../services/AuthContext.jsx';

export default function RoleGuard({ role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={`/login/${role}`} replace />;
  return user.role === role ? <Outlet /> : <Navigate to={`/${user.role}`} replace />;
}
