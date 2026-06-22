import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function Packages() {
  const { data } = useApi('/public/landing', { packages: [] });
  const packages = data?.packages || [];

  return (
    <main className="page">
      <SectionHeader eyebrow="Packages" title="Subscription plans for every driver" />
      <div className="package-grid">
        {packages.map((pkg) => (
          <article className={`price-card ${pkg.popular ? 'popular' : ''}`} key={pkg.id || pkg._id || pkg.name}>
            <h3>{pkg.name}</h3>
            <strong>{formatPrice(pkg.price)} EGP</strong>
            <span>/{pkg.period || 'month'}</span>
            {(pkg.features || []).map((feature) => (
              <p key={feature}>
                <span aria-hidden="true">✓</span> {feature}
              </p>
            ))}
            <button className="primary-btn">Choose {pkg.name}</button>
          </article>
        ))}
      </div>
    </main>
  );
}

const formatPrice = (price) => Number(price || 0).toLocaleString('en-US');
