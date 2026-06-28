import { Bot, Car, Shield, Star, Wrench, Zap } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';

export default function DriverAbout() {
  return (
    <div className="dash-stack">
      <SectionHeader title="About Salahny">Egypt's intelligent vehicle maintenance platform.</SectionHeader>

      <section className="visual-banner">
        <img src="/images/service-trust.jpg" alt="Salahny mechanic and driver" />
        <div>
          <span className="eyebrow">Our mission</span>
          <h3>Making car maintenance smarter, faster, and stress-free for every Egyptian driver.</h3>
          <p>Salahny connects drivers with verified workshops through AI-powered diagnostics and real-time booking.</p>
        </div>
      </section>

      <div className="feature-grid three">
        {features.map((f) => (
          <article className="feature-card" key={f.title}>
            <f.icon size={28} style={{ color: '#ef4444', marginBottom: 10 }} />
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </article>
        ))}
      </div>

      <section className="panel">
        <h2 style={{ marginBottom: 16 }}>Our Story</h2>
        <p style={{ lineHeight: 1.8, opacity: 0.85 }}>
          Salahny was founded in 2025 by a team of engineers and automotive professionals who were frustrated with the lack of transparency and
          convenience in Egypt's vehicle maintenance industry. Drivers had no easy way to find trusted workshops, diagnose issues before visiting a
          mechanic, or track their car's service history in one place.
        </p>
        <p style={{ lineHeight: 1.8, opacity: 0.85, marginTop: 12 }}>
          We built Salahny to change that — combining OBD-II diagnostic technology with AI analysis, a curated network of verified workshops,
          and a seamless booking experience available on both mobile and web.
        </p>
        <p style={{ lineHeight: 1.8, opacity: 0.85, marginTop: 12 }}>
          Today, Salahny serves thousands of drivers across Cairo, Giza, and the greater Egypt region, with a growing network of workshop partners
          committed to fair pricing and quality service.
        </p>
      </section>

      <section className="panel">
        <h2 style={{ marginBottom: 16 }}>Platform Version</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            ['Platform', 'Salahny Web v2.0'],
            ['AI Engine', 'Random Forest + Gemini'],
            ['Backend', 'Node.js / Express'],
            ['Database', 'MongoDB Atlas'],
            ['Mobile App', 'Flutter (iOS & Android)'],
            ['Support', 'support@salahny.com'],
          ].map(([label, value]) => (
            <div key={label} className="compact-card" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <small style={{ opacity: 0.5, fontSize: '0.75rem' }}>{label}</small>
              <strong style={{ fontSize: '0.9rem' }}>{value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const features = [
  { icon: Bot, title: 'AI Diagnostics', desc: 'Submit 25 OBD-II sensor readings and get an instant AI health report with fault predictions.' },
  { icon: Wrench, title: 'Verified Workshops', desc: 'Every workshop on Salahny is verified by our admin team before accepting driver bookings.' },
  { icon: Zap, title: 'Real-Time Tracking', desc: 'Track your booking status and workshop location updates in real time from booking to completion.' },
  { icon: Shield, title: 'Emergency Dispatch', desc: 'One-tap emergency requests auto-assign the nearest available workshop for roadside assistance.' },
  { icon: Car, title: 'Vehicle Management', desc: 'Keep all your vehicles in one place with maintenance history, OBD status, and health scores.' },
  { icon: Star, title: 'Transparent Pricing', desc: 'See service prices and workshop ratings before booking — no hidden fees, no surprises.' },
];
