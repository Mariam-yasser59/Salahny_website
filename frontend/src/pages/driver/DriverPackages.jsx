import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function DriverPackages() {
  const { data } = useApi('/public/landing', { packages: [] });
  const packages = normalizePackages(data?.packages || []);

  return (
    <div className="dash-stack">
      <SectionHeader title="Packages & Subscriptions" />
      <div className="package-grid">
        {packages.map((pkg) => (
          <article className={`price-card ${pkg.popular ? 'popular' : ''}`} key={pkg.id || pkg._id || pkg.name}>
            <h3>{pkg.name}</h3>
            <strong>{Number(pkg.price || 0).toLocaleString('en-US')} EGP</strong>
            <span>/{pkg.period || 'month'}</span>
            {(pkg.features || []).map((feature) => (
              <p key={feature}>
                <span aria-hidden="true">{'\u2713'}</span> {feature}
              </p>
            ))}
            <button className="primary-btn">Checkout</button>
          </article>
        ))}
      </div>
      <article className="success-card">Checkout and success flow is mocked until payment integration is connected.</article>
    </div>
  );
}

const packageMinimums = {
  basic: { price: 799, name: 'Basic' },
  plus: { price: 1999, name: 'Premium' },
  premium: { price: 1999, name: 'Premium' },
  fleet: { price: 8999, name: 'Fleet' },
};

const normalizePackages = (packages) => packages.map((pkg) => {
  const plan = packageMinimums[String(pkg.name || '').toLowerCase()] || packageMinimums.basic;
  const price = Number(pkg.price || 0);

  return {
    ...pkg,
    name: plan.name,
    price: price > 0 ? Math.max(price, plan.price) : plan.price,
    period: pkg.period || 'month',
  };
});
