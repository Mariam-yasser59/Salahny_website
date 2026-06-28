import {
  BadgeCheck,
  Bell,
  Bot,
  CalendarClock,
  Car,
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

export default function Features() {
  return (
    <main>
      <section className="page">
        <SectionHeader eyebrow="Salahny" title="Car service made simple">
          Find nearby workshops, book available times, follow your request, and keep your car service history in one place.
        </SectionHeader>

        <div className="feature-grid three">
          {customerFeatures.map(({ title, text, Icon }) => (
            <article className="feature-card" key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <SectionHeader eyebrow="For drivers" title="Book the right workshop near you">
          Salahny uses your location to show nearby available workshops first, so you can choose a practical service provider instead of searching through unrelated locations.
        </SectionHeader>
        <div className="flow-strip">
          {driverFlow.map((step, index) => (
            <article className="feature-card" key={step.title}>
              <span className="step-number">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band subtle">
        <SectionHeader eyebrow="For workshops" title="Manage work from request to completion">
          Workshops can receive driver requests, manage services and availability, handle repairs, and build trust through completed jobs and ratings.
        </SectionHeader>
        <div className="feature-grid three">
          {workshopFeatures.map(({ title, text, Icon }) => (
            <article className="feature-card" key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <SectionHeader eyebrow="Trust" title="Designed for safer service decisions" />
        <div className="feature-grid two">
          <article className="feature-card accent">
            <ShieldCheck />
            <h3>Verified access</h3>
            <p>
              Accounts and workshop documents are reviewed before activation so drivers deal with approved providers.
            </p>
          </article>
          <article className="feature-card accent">
            <LockKeyhole />
            <h3>Protected account recovery</h3>
            <p>
              Password reset uses a secure email token so only the account owner can change their password.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

const customerFeatures = [
  {
    title: 'Nearby workshops',
    text: 'Use your location to find nearby workshops and continue booking with the provider that makes sense for your trip.',
    Icon: Car,
  },
  {
    title: 'Workshop booking',
    text: 'Choose a service, vehicle, workshop, and available appointment time in a guided booking flow.',
    Icon: Store,
  },
  {
    title: 'AI car check',
    text: 'Review diagnostic information, predicted issues, risk level, and recommended next steps before repair decisions.',
    Icon: Bot,
  },
  {
    title: 'Emergency support',
    text: 'Request roadside support and follow the status until help is assigned and completed.',
    Icon: ShieldCheck,
  },
  {
    title: 'Live availability',
    text: 'See appointment slots created by workshops and book a time that is actually available.',
    Icon: CalendarClock,
  },
  {
    title: 'Notifications',
    text: 'Receive updates when requests are created, accepted, rejected, completed, or need attention.',
    Icon: Bell,
  },
  {
    title: 'Chat',
    text: 'Message the workshop about the request and keep the conversation connected to the service.',
    Icon: MessageCircle,
  },
  {
    title: 'Ratings',
    text: 'After completion, drivers and workshops can rate each other to improve trust on the platform.',
    Icon: Star,
  },
];

const driverFlow = [
  {
    title: 'Share location',
    text: 'Allow location access or enter an address so Salahny can find workshops close to you.',
  },
  {
    title: 'Compare nearby options',
    text: 'Review workshops by distance, rating, services, and open status.',
  },
  {
    title: 'Choose a time',
    text: 'Select a workshop appointment from the available slots.',
  },
  {
    title: 'Track the request',
    text: 'Follow status updates from pending to accepted, in progress, and completed.',
  },
  {
    title: 'Rate the service',
    text: 'Rate the workshop after the request is completed.',
  },
];

const workshopFeatures = [
  {
    title: 'Requests',
    text: 'Receive driver bookings and accept, reject, start, or complete service work.',
    Icon: BadgeCheck,
  },
  {
    title: 'Repair tasks',
    text: 'Turn diagnostics into repair work and keep job status clear for the driver.',
    Icon: Wrench,
  },
  {
    title: 'Documents',
    text: 'Submit business verification documents so the account can be reviewed and approved.',
    Icon: FileCheck2,
  },
  {
    title: 'Earnings',
    text: 'Completed services update workshop earnings and completed-service totals.',
    Icon: CreditCard,
  },
  {
    title: 'Coverage',
    text: 'Set workshop location and availability so nearby drivers can find and book you.',
    Icon: MapPinned,
  },
];
