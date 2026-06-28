import { Activity, AlertTriangle, BadgeCheck, BarChart3, Bell, Bot, BriefcaseBusiness, CalendarClock, Car, ClipboardCheck, Clock3, FileCheck2, History, Info, LayoutDashboard, LifeBuoy, ListChecks, Lock, MapPinned, MessageCircle, Package, Settings, ShieldCheck, Store, Users, Wrench } from 'lucide-react';

export const nav = {
  driver: [
    { to: '/driver', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/driver/vehicles', label: 'My Vehicles', icon: Car },
    { to: '/driver/services', label: 'Services', icon: Wrench },
    { to: '/driver/booking', label: 'Book Service', icon: Wrench },
    { to: '/driver/tracking', label: 'Tracking', icon: Clock3 },
    { to: '/driver/history', label: 'History', icon: History },
    { to: '/driver/workshops', label: 'Workshops', icon: MapPinned },
    { to: '/driver/emergency', label: 'Emergency', icon: LifeBuoy },
    { to: '/driver/diagnostics', label: 'AI Diagnostics', icon: Bot },
    { to: '/driver/packages', label: 'Packages', icon: Package },
    { to: '/driver/chat', label: 'AI Chat', icon: MessageCircle },
    { to: '/driver/notifications', label: 'Notifications', icon: Bell },
    { to: '/driver/profile', label: 'Settings', icon: Settings },
    { to: '/driver/about', label: 'About', icon: Info },
    { to: '/driver/privacy', label: 'Privacy Policy', icon: Lock }
  ],
  workshop: [
    { to: '/workshop', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/workshop/requests', label: 'Requests', icon: ClipboardCheck },
    { to: '/workshop/jobs', label: 'Active Jobs', icon: BriefcaseBusiness },
    { to: '/workshop/services', label: 'Services', icon: Wrench },
    { to: '/workshop/availability', label: 'Availability', icon: CalendarClock },
    { to: '/workshop/emergency', label: 'Emergency', icon: LifeBuoy },
    { to: '/workshop/earnings', label: 'Earnings', icon: BarChart3 },
    { to: '/workshop/diagnostics', label: 'AI Reports', icon: Bot },
    { to: '/workshop/chat', label: 'Admin Chat', icon: MessageCircle },
    { to: '/workshop/verification-documents', label: 'Verification Documents', icon: FileCheck2 },
    { to: '/workshop/profile', label: 'Profile', icon: Store }
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/approvals', label: 'Approvals', icon: BadgeCheck },
    { to: '/admin/drivers', label: 'Drivers', icon: Users },
    { to: '/admin/workshops', label: 'Workshops', icon: Store },
    { to: '/admin/bookings', label: 'Bookings', icon: ListChecks },
    { to: '/admin/services', label: 'Services', icon: Wrench },
    { to: '/admin/packages', label: 'Packages', icon: Package },
    { to: '/admin/emergency', label: 'Emergency', icon: AlertTriangle },
    { to: '/admin/chats', label: 'Chat Monitor', icon: MessageCircle },
    { to: '/admin/diagnostics', label: 'Diagnostics', icon: Bot },
    { to: '/admin/logs', label: 'Activity Logs', icon: Activity },
    { to: '/admin/settings', label: 'Settings', icon: ShieldCheck }
  ]
};

export const roleMeta = {
  driver: { title: 'Driver Portal', home: '/driver' },
  workshop: { title: 'Workshop Portal', home: '/workshop' },
  admin: { title: 'Super Admin', home: '/admin' }
};
