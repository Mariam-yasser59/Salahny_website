import { Link } from 'react-router-dom';
import { BrainCircuit, CalendarCheck, MapPinned, ShieldCheck, Siren, Star, Store, Wrench } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function Home() {
  const { data } = useApi('/public/landing', { services: [], packages: [], testimonials: [], workshops: [] });

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">AI-powered vehicle care</span>
          <h1>Salahny connects every driver to the right auto service at the right moment.</h1>
          <p>Book verified workshops, request emergency support, diagnose vehicle issues, and manage the full service journey from one premium platform.</p>
          <div className="hero-actions">
            <Link className="primary-btn" to="/register/driver">Start as Driver</Link>
            <Link className="ghost-btn light" to="/register/workshop">Partner Workshop</Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="vehicle-score">
            <span>Vehicle Health</span>
            <strong>87%</strong>
            <p>Oil service due within 2 weeks</p>
          </div>
          <div className="hero-grid">
            {[CalendarCheck, BrainCircuit, Siren, Store].map((Icon, index) => <div key={index}><Icon /><span>{['Booking', 'AI Scan', 'Emergency', 'Workshops'][index]}</span></div>)}
          </div>
        </div>
      </section>

      <section className="content-band">
        <SectionHeader eyebrow="How it works" title="From symptom to solved job">
          Drivers get smart recommendations, workshops receive structured requests, and admins keep the marketplace healthy.
        </SectionHeader>
        <div className="feature-grid three">
          {[
            ['Describe or scan', 'Enter OBD readings or choose the service your car needs.', BrainCircuit],
            ['Match and book', 'Pick a nearby verified workshop by rating, distance, price, and availability.', MapPinned],
            ['Track to completion', 'Follow status, quotes, progress, and support messages until delivery.', ShieldCheck]
          ].map(([title, text, Icon]) => <article className="feature-card" key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="content-band subtle">
        <SectionHeader eyebrow="Services" title="Everything a driver expects from a real auto platform" />
        <div className="service-grid">
          {data.services.slice(0, 9).map((service) => <article className="compact-card" key={service.id}><Wrench size={20} /><h3>{service.name}</h3><p>{service.description}</p><strong>{service.price} EGP</strong></article>)}
        </div>
      </section>

      <section className="split-section">
        <div>
          <span className="eyebrow">AI Diagnostics</span>
          <h2>Actionable OBD intelligence before the problem becomes expensive.</h2>
          <p>Analyze coolant temperature, RPM, speed, battery status, brake condition, and engine load to produce a practical health score and service recommendation.</p>
        </div>
        <div className="diagnostic-card">
          <span>Health Score</span>
          <strong>87%</strong>
          <p>Possible issue: Oil change due soon</p>
          <div className="meter"><span style={{ width: '87%' }} /></div>
          <small>Recommendation: Book oil service within 2 weeks.</small>
        </div>
      </section>

      <section className="content-band">
        <SectionHeader eyebrow="Emergency and workshops" title="Fast roadside help and better workshop operations" />
        <div className="feature-grid two">
          <article className="feature-card accent"><Siren /><h3>Emergency support</h3><p>Towing, fuel delivery, battery jump starts, and priority help from the nearest available partner.</p></article>
          <article className="feature-card accent"><Store /><h3>Workshop partnership</h3><p>Receive structured requests, quotes, job tracking, diagnostics, earnings, and profile management.</p></article>
        </div>
      </section>

      <section className="content-band subtle">
        <SectionHeader eyebrow="Packages" title="Flexible vehicle care memberships" action={<Link className="ghost-btn" to="/packages">View all</Link>} />
        <div className="package-grid">
          {data.packages.map((pkg) => <article className={`price-card ${pkg.popular ? 'popular' : ''}`} key={pkg.id}><h3>{pkg.name}</h3><strong>{pkg.price} EGP</strong><span>/{pkg.period}</span>{pkg.features.map((feature) => <p key={feature}>✓ {feature}</p>)}</article>)}
        </div>
      </section>

      <section className="content-band">
        <SectionHeader eyebrow="Trusted experience" title="Loved by drivers and workshops" />
        <div className="feature-grid three">
          {data.testimonials.map((review) => <article className="testimonial" key={review.id}><Star fill="currentColor" /><p>{review.comment}</p><strong>{review.author}</strong></article>)}
        </div>
      </section>

      <section className="faq-cta">
        <h2>Ready to run vehicle care like a modern service network?</h2>
        <p>Login as driver, workshop, or super admin and explore the complete connected product.</p>
        <Link className="primary-btn" to="/login/driver">Open Salahny</Link>
      </section>
    </>
  );
}
