import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Splash from './pages/public/Splash.jsx';
import RoleSelection from './pages/public/RoleSelection.jsx';
import Home from './pages/public/Home.jsx';
import About from './pages/public/About.jsx';
import Services from './pages/public/Services.jsx';
import Contact from './pages/public/Contact.jsx';
import AuthPage from './pages/public/AuthPage.jsx';
import ForgotPassword from './pages/public/ForgotPassword.jsx';
import WorkshopDashboard from './pages/workshop/WorkshopDashboard.jsx';
import WorkshopRequests from './pages/workshop/WorkshopRequests.jsx';
import WorkshopJobs from './pages/workshop/WorkshopJobs.jsx';
import WorkshopServices from './pages/workshop/WorkshopServices.jsx';
import WorkshopEarnings from './pages/workshop/WorkshopEarnings.jsx';
import WorkshopProfile from './pages/workshop/WorkshopProfile.jsx';
import WorkshopDiagnostics from './pages/workshop/WorkshopDiagnostics.jsx';
import WorkshopChat from './pages/workshop/WorkshopChat.jsx';
import WorkshopAvailability from './pages/workshop/WorkshopAvailability.jsx';
import WorkshopEmergency from './pages/workshop/WorkshopEmergency.jsx';
import WorkshopNotifications from './pages/workshop/WorkshopNotifications.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/roles" element={<RoleSelection />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/login/:role" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/register/:role" element={<AuthPage mode="register" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route path="/workshop" element={<DashboardLayout role="workshop" />}>
        <Route index element={<WorkshopDashboard />} />
        <Route path="requests" element={<WorkshopRequests />} />
        <Route path="jobs" element={<WorkshopJobs />} />
        <Route path="services" element={<WorkshopServices />} />
        <Route path="availability" element={<WorkshopAvailability />} />
        <Route path="emergency" element={<WorkshopEmergency />} />
        <Route path="earnings" element={<WorkshopEarnings />} />
        <Route path="profile" element={<WorkshopProfile />} />
        <Route path="diagnostics" element={<WorkshopDiagnostics />} />
        <Route path="chat" element={<WorkshopChat />} />
        <Route path="notifications" element={<WorkshopNotifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
