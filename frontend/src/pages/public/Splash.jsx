import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo.jsx';

export default function Splash() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(timer);
  }, []);

  if (ready) return <Navigate to="/roles" replace />;

  return (
    <main className="splash-screen">
      <Logo />
      <div className="splash-loader"><span /></div>
      <p>Smart automotive care is starting...</p>
    </main>
  );
}
