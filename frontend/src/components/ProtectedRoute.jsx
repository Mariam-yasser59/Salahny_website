import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../services/AuthContext.jsx';

export default function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/roles" replace />;
}
