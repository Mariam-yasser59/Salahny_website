import { Link } from 'react-router-dom';
import { BadgeCheck, BarChart3, Bot, CalendarCheck, LifeBuoy, MessageCircle, Store, Wrench } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Smart vehicle service marketplace</span>
          <h1>Salahny</h1>
          <p>Book trusted workshops, manage live service jobs, run AI diagnostics, request emergency support, and keep every driver, workshop, and admin workflow connected through one premium automotive platform.</p>
          <div className="hero-actions">
            <Link className="primary-btn" to="/roles">Choose your role</Link>
            <Link className="ghost-btn light" to="/services">Explore services</Link>
          </div>
        </div>
        <div className="hero-panel image-panel">
          <img src="/images/workshop-lift.jpg" alt="Mechanic servicing a car on a workshop lift" />
          <div className="vehicle-score">
            <span>Connected service workflow</span>
            <strong>AI</strong>
            <p>Bookings, diagnostics, emergency support, chat, ratings, and earnings in one place.</p>
          </div>
          <div className="hero-grid">
            {[Wrench, Bot, LifeBuoy, Store].map((Icon, index) => <div key={index}><Icon /><span>{['Jobs', 'AI Reports', 'Emergency', 'Profile'][index]}</span></div>)}
          </div>
        </div>
      </section>

      <section className="content-band">
        <SectionHeader eyebrow="Operations" title="Everything an approved workshop needs" />
        <div className="feature-grid three">
          {[
            ['Requests and jobs', 'Accept, decline, start service, run diagnostics, start repair, complete jobs, and notify customers.', BadgeCheck],
            ['Service catalog', 'Maintain service names, labels, prices, and durations synced to the backend workshop profile.', Wrench],
            ['Availability', 'Create and save future slots that are removed as bookings consume them.', CalendarCheck],
            ['Diagnostics', 'Run manual OBD checks or upload CSV/JSON readings, then share reports to booking chat.', Bot],
            ['Emergency', 'Handle assigned roadside requests from acceptance through completion.', LifeBuoy],
            ['Messages and earnings', 'Chat with customers/admins and monitor completed-job earnings.', MessageCircle]
          ].map(([title, text, Icon]) => <article className="feature-card" key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="content-band subtle">
        <SectionHeader eyebrow="Verification" title="Workshop accounts stay gated until approved">
          Registration captures owner identity, workshop address, location information, and a PDF/JPG/PNG business document for CV/OCR verification before final approval.
        </SectionHeader>
        <div className="feature-grid two">
          <article className="feature-card"><Store /><h3>Profile and location</h3><p>Update workshop name, address, map coordinates, open status, services, and verification visibility.</p></article>
          <article className="feature-card"><BarChart3 /><h3>Revenue visibility</h3><p>View total earnings, available balance, paid amount, and recent earning items without withdrawal flows.</p></article>
        </div>
      </section>
    </>
  );
}
