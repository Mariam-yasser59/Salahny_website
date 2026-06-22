import { BadgeCheck, Bot, LifeBuoy, Star, Store, Wrench } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function About() {
  const { data } = useApi('/public/landing', { workshops: [], services: [] });
  const workshops = data?.workshops || [];
  const services = data?.services || [];

  const stats = [
    ['Workshops', workshops.length],
    ['Completed services', data?.completedServices || 0],
    ['Happy customers', data?.happyCustomers || 0],
    ['Emergency requests handled', data?.emergencyHandled || 0]
  ];

  return (
    <main className="page about-page">
      <section className="about-hero">
        <img src="/images/about-brake-service.jpg" alt="Mechanic preparing brake service parts in a workshop" />
        <div>
          <span className="eyebrow">About Salahny</span>
          <h1>Smart car care built around trust, speed, and transparency.</h1>
          <p>Salahny is a smart car service platform that connects car owners with trusted workshops, emergency providers, and professional automotive services. Our mission is to make car maintenance easier, faster, and more reliable through technology, real-time booking, AI diagnosis, and transparent ratings.</p>
        </div>
      </section>

      <div className="feature-grid two">
        <article className="feature-card"><BadgeCheck /><h3>Mission</h3><p>Make car maintenance simple, reliable, and visible from booking to completion with verified providers, live updates, and professional service records.</p></article>
        <article className="feature-card"><Star /><h3>Vision</h3><p>Become the trusted digital operating layer for vehicle care across Egypt, connecting drivers, workshops, emergency teams, and admins through one smart platform.</p></article>
      </div>

      <section className="content-band subtle">
        <SectionHeader eyebrow="Why choose us" title="Built for real automotive operations" />
        <div className="feature-grid three">
          <article className="feature-card"><Wrench /><h3>Trusted workshops</h3><p>Verified partners, transparent ratings, clear service details, and booking slots drivers can trust.</p></article>
          <article className="feature-card"><Bot /><h3>AI diagnostics</h3><p>OBD-supported diagnostics help drivers and workshops understand issues before repair decisions.</p></article>
          <article className="feature-card"><LifeBuoy /><h3>Emergency support</h3><p>Roadside requests connect drivers with assigned workshops and live status updates.</p></article>
        </div>
      </section>

      <section className="split-section image-split">
        <img src="/images/service-trust.jpg" alt="Customer and mechanic agreeing on vehicle service" />
        <div>
          <SectionHeader eyebrow="Services" title="A complete vehicle service marketplace" />
          <div className="chips">{services.slice(0, 8).map((service) => <span key={service.id || service.name}>{service.name}</span>)}</div>
        </div>
      </section>

      <section className="stats-grid">
        {stats.map(([label, value]) => <article className="stat-card" key={label}><div><p>{label}</p><strong>{value}</strong><span>Live platform metric</span></div></article>)}
      </section>

      <section className="content-band">
        <SectionHeader eyebrow="Customer reviews" title="What drivers value" />
        <div className="feature-grid three">
          {[
            ['Transparent service', 'The workshop updates and booking status made my repair visit easy to follow.'],
            ['Helpful diagnostics', 'The AI report helped me understand the issue before approving the service.'],
            ['Fast emergency help', 'Roadside support gave me clear status updates until the workshop arrived.']
          ].map(([title, text]) => <article className="feature-card" key={title}><Store /><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>
    </main>
  );
}
