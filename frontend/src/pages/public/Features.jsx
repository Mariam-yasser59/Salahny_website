import {
  BadgeCheck,
  Bell,
  Bot,
  CalendarClock,
  Car,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  LockKeyhole,
  MapPinned,
  MessageCircle,
  ShieldCheck,
  Star,
  Store,
  Wrench,
} from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import LiveIntegrationStatus from '../../components/LiveIntegrationStatus.jsx';

export default function Features() {
  return (
    <main>
      <section className="page">
        <SectionHeader eyebrow="Salahny Platform" title="Complete feature map for drivers, workshops, and admins">
          Salahny is now a connected vehicle-service platform: driver actions create real backend
          records, workshops receive and manage those records, and admins review platform activity
          from the same production API and MongoDB database.
        </SectionHeader>

        <div className="feature-grid three">
          {featureGroups.map(({ title, text, Icon }) => (
            <article className="feature-card" key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <LiveIntegrationStatus />

      <section className="content-band">
        <SectionHeader eyebrow="Latest implementation edits" title="What was added and fixed in the application">
          These are the major product and engineering updates reflected across the mobile app,
          backend, and website copy.
        </SectionHeader>
        <div className="timeline-grid">
          {latestEdits.map((item) => (
            <article className="compact-card update-card" key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band subtle">
        <SectionHeader eyebrow="Real workflow" title="How a driver connects with a workshop" />
        <div className="flow-strip">
          {workflow.map((step, index) => (
            <article className="feature-card" key={step.title}>
              <span className="step-number">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <SectionHeader eyebrow="Security and production readiness" title="Key safeguards now documented" />
        <div className="feature-grid two">
          <article className="feature-card accent">
            <ShieldCheck />
            <h3>Account approval gate</h3>
            <p>
              Driver and workshop accounts stay pending until admin approval. Workshop documents are
              submitted for OCR/CV verification and manual review before activation.
            </p>
          </article>
          <article className="feature-card accent">
            <LockKeyhole />
            <h3>Secure password reset</h3>
            <p>
              Reset requests use expiring tokens, backend validation, password hashing, and Resend
              delivery instead of email-only password changes.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

const featureGroups = [
  {
    title: 'Driver accounts',
    text: 'Registration, login, password reset, profile, vehicles, booking history, diagnostics, emergency requests, chat, and notifications.',
    Icon: Car,
  },
  {
    title: 'Workshop accounts',
    text: 'Workshop registration, document submission, approval status, services, availability, requests, active jobs, earnings, chat, and diagnostics.',
    Icon: Store,
  },
  {
    title: 'Admin operations',
    text: 'Driver and workshop management, account approvals, document review, booking monitoring, catalogs, logs, and settings.',
    Icon: BadgeCheck,
  },
  {
    title: 'AI diagnosis reports',
    text: 'Reports now show detection plus prediction, confidence, risk level, recommendations, and repair-task actions.',
    Icon: Bot,
  },
  {
    title: 'Repair task flow',
    text: 'Create Repair Task moves the work into repair progress, and Done moves completed jobs toward the completion workflow.',
    Icon: Wrench,
  },
  {
    title: 'Role-based verification',
    text: 'Driver verification accepts driving licenses; workshop verification requires commercial register and can include tax card support.',
    Icon: FileCheck2,
  },
  {
    title: 'Availability slots',
    text: 'Workshop-created slots are stored and displayed consistently so drivers see the same date and time selected by the workshop.',
    Icon: CalendarClock,
  },
  {
    title: 'Google Maps flow',
    text: 'Drivers can use their location, view nearby workshops, compare distance, and continue to booking from workshop listings.',
    Icon: MapPinned,
  },
  {
    title: 'Notifications',
    text: 'Booking changes, approvals, rejected requests, emergency events, report sharing, and slot actions create user notifications.',
    Icon: Bell,
  },
  {
    title: 'Chat',
    text: 'Driver and workshop conversations are tied to booking context, with persisted messages and unread status support.',
    Icon: MessageCircle,
  },
  {
    title: 'Ratings',
    text: 'After completion, drivers can rate workshops and workshops can rate drivers, updating profile rating totals.',
    Icon: Star,
  },
  {
    title: 'Earnings',
    text: 'Completed services update workshop revenue and completed-service counters automatically from booking data.',
    Icon: CreditCard,
  },
];

const latestEdits = [
  {
    title: 'Create Repair Task fixed',
    text: 'AI diagnosis repair actions now create backend repair tasks and move the job into the correct repair workflow instead of staying stuck.',
  },
  {
    title: 'Done/completion navigation fixed',
    text: 'Workshop completion actions now lead users to the right service status flow so jobs can become completed.',
  },
  {
    title: 'AI report upgraded',
    text: 'Reports now include both detected issue and predictive forecast language, without exposing it as fake simulation to users.',
  },
  {
    title: 'Send to Driver flow connected',
    text: 'Shared reports are saved, surfaced in the driver application, and connected to notification and email delivery.',
  },
  {
    title: 'Password reset secured',
    text: 'The reset flow verifies email and token, hashes the new password, clears used tokens, and supports immediate login after reset.',
  },
  {
    title: 'Post-service ratings added',
    text: 'Drivers rate workshops and workshops rate drivers only after completed service requests, preventing premature or duplicate ratings.',
  },
  {
    title: 'Workshop money and completed services updated',
    text: 'Completed jobs now feed workshop profile revenue and completed-service metrics automatically.',
  },
  {
    title: 'Production Resend email verified',
    text: 'The production backend reports Resend configured for Salahny email delivery from the health endpoint.',
  },
];

const workflow = [
  {
    title: 'Driver selects service',
    text: 'The driver logs in, chooses a vehicle, service, workshop, slot, and location.',
  },
  {
    title: 'Booking is saved',
    text: 'The website posts the booking to the production backend, where MongoDB stores the request.',
  },
  {
    title: 'Workshop receives it',
    text: 'The workshop portal loads pending requests from the backend and can accept, reject, start, or complete work.',
  },
  {
    title: 'Status syncs back',
    text: 'Driver, workshop, and admin screens read the updated booking status and notifications from the same API.',
  },
  {
    title: 'Completion unlocks rating',
    text: 'After completion, both roles can rate each other and workshop earnings are updated.',
  },
];
