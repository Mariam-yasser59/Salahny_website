import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function DriverPackages() {
  const { data } = useApi('/public/landing', { packages: [] });
  return (
    <div className="dash-stack">
      <SectionHeader title="Packages & Subscriptions" />
      <div className="package-grid">
        {data.packages.map((pkg) => (
          <article className={`price-card ${pkg.popular ? 'popular' : ''}`} key={pkg.id}>
            <h3>{pkg.name}</h3>
            <strong>{pkg.price} EGP</strong>
            <span>/{pkg.period || 'month'}</span>
            {(pkg.features || []).map((feature) => <p key={feature}>✓ {feature}</p>)}
            <button className="primary-btn">Checkout</button>
          </article>
        ))}
      </div>
      <article className="success-card">Checkout and success flow is mocked until payment integration is connected.</article>
    </div>
  );
}
