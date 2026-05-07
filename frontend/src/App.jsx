import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Splash from './pages/public/Splash.jsx';
import RoleSelection from './pages/public/RoleSelection.jsx';
import Home from './pages/public/Home.jsx';
import About from './pages/public/About.jsx';
import Services from './pages/public/Services.jsx';
import Packages from './pages/public/Packages.jsx';
import Contact from './pages/public/Contact.jsx';
import AuthPage from './pages/public/AuthPage.jsx';
import ForgotPassword from './pages/public/ForgotPassword.jsx';
import DriverDashboard from './pages/driver/DriverDashboard.jsx';
import DriverVehicles from './pages/driver/DriverVehicles.jsx';
import DriverServices from './pages/driver/DriverServices.jsx';
import DriverBooking from './pages/driver/DriverBooking.jsx';
import DriverTracking from './pages/driver/DriverTracking.jsx';
import DriverHistory from './pages/driver/DriverHistory.jsx';
import DriverWorkshops from './pages/driver/DriverWorkshops.jsx';
import DriverEmergency from './pages/driver/DriverEmergency.jsx';
import DriverDiagnostics from './pages/driver/DriverDiagnostics.jsx';
import DriverChat from './pages/driver/DriverChat.jsx';
import DriverNotifications from './pages/driver/DriverNotifications.jsx';
import DriverPackages from './pages/driver/DriverPackages.jsx';
import DriverProfile from './pages/driver/DriverProfile.jsx';
import WorkshopDashboard from './pages/workshop/WorkshopDashboard.jsx';
import WorkshopRequests from './pages/workshop/WorkshopRequests.jsx';
import WorkshopJobs from './pages/workshop/WorkshopJobs.jsx';
import WorkshopServices from './pages/workshop/WorkshopServices.jsx';
import WorkshopEarnings from './pages/workshop/WorkshopEarnings.jsx';
import WorkshopProfile from './pages/workshop/WorkshopProfile.jsx';
import WorkshopDiagnostics from './pages/workshop/WorkshopDiagnostics.jsx';
import WorkshopChat from './pages/workshop/WorkshopChat.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminApprovals from './pages/admin/AdminApprovals.jsx';
import AdminDrivers from './pages/admin/AdminDrivers.jsx';
import AdminWorkshops from './pages/admin/AdminWorkshops.jsx';
import AdminBookings from './pages/admin/AdminBookings.jsx';
import AdminCatalog from './pages/admin/AdminCatalog.jsx';
import AdminLogs from './pages/admin/AdminLogs.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/roles" element={<RoleSelection />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login/:role" element={<AuthPage mode="login" />} />
        <Route path="/register/:role" element={<AuthPage mode="register" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route path="/driver" element={<DashboardLayout role="driver" />}>
        <Route index element={<DriverDashboard />} />
        <Route path="vehicles" element={<DriverVehicles />} />
        <Route path="services" element={<DriverServices />} />
        <Route path="booking" element={<DriverBooking />} />
        <Route path="service/:id" element={<DriverBooking />} />
        <Route path="tracking" element={<DriverTracking />} />
        <Route path="history" element={<DriverHistory />} />
        <Route path="workshops" element={<DriverWorkshops />} />
        <Route path="workshops/:id" element={<DriverWorkshops />} />
        <Route path="emergency" element={<DriverEmergency />} />
        <Route path="towing" element={<DriverEmergency />} />
        <Route path="car-wash" element={<DriverEmergency />} />
        <Route path="fuel-delivery" element={<DriverEmergency />} />
        <Route path="diagnostics" element={<DriverDiagnostics />} />
        <Route path="diagnostics/history" element={<DriverDiagnostics />} />
        <Route path="packages" element={<DriverPackages />} />
        <Route path="checkout-success" element={<DriverPackages />} />
        <Route path="chat" element={<DriverChat />} />
        <Route path="notifications" element={<DriverNotifications />} />
        <Route path="profile" element={<DriverProfile />} />
      </Route>

      <Route path="/workshop" element={<DashboardLayout role="workshop" />}>
        <Route index element={<WorkshopDashboard />} />
        <Route path="requests" element={<WorkshopRequests />} />
        <Route path="jobs" element={<WorkshopJobs />} />
        <Route path="services" element={<WorkshopServices />} />
        <Route path="earnings" element={<WorkshopEarnings />} />
        <Route path="profile" element={<WorkshopProfile />} />
        <Route path="diagnostics" element={<WorkshopDiagnostics />} />
        <Route path="chat" element={<WorkshopChat />} />
      </Route>

      <Route path="/admin" element={<DashboardLayout role="admin" />}>
        <Route index element={<AdminDashboard />} />
        <Route path="approvals" element={<AdminApprovals />} />
        <Route path="drivers" element={<AdminDrivers />} />
        <Route path="workshops" element={<AdminWorkshops />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="services" element={<AdminCatalog type="services" />} />
        <Route path="packages" element={<AdminCatalog type="packages" />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
