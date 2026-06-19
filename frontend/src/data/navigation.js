import { BarChart3, Bell, Bot, BriefcaseBusiness, CalendarClock, ClipboardCheck, LayoutDashboard, LifeBuoy, MapPinned, MessageCircle, Store, Wrench } from 'lucide-react';

export const nav = {
  workshop: [
    { to: '/workshop', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/workshop/requests', label: 'Requests', icon: ClipboardCheck },
    { to: '/workshop/jobs', label: 'Active Jobs', icon: BriefcaseBusiness },
    { to: '/workshop/services', label: 'Services', icon: Wrench },
    { to: '/workshop/availability', label: 'Availability', icon: CalendarClock },
    { to: '/workshop/emergency', label: 'Emergency', icon: LifeBuoy },
    { to: '/workshop/earnings', label: 'Earnings', icon: BarChart3 },
    { to: '/workshop/diagnostics', label: 'AI Reports', icon: Bot },
    { to: '/workshop/chat', label: 'Chat', icon: MessageCircle },
    { to: '/workshop/notifications', label: 'Notifications', icon: Bell },
    { to: '/workshop/profile', label: 'Profile', icon: Store }
  ]
};

export const roleMeta = {
  workshop: { title: 'Workshop Portal', home: '/workshop' }
};
