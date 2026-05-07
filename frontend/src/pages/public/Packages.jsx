import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function Packages() {
  const { data } = useApi('/public/landing', { packages: [] });
  return (
    <main className="page">
      <SectionHeader eyebrow="Packages" title="Subscription plans for every driver" />
      <div className="package-grid">
        {data.packages.map((pkg) => <article className={`price-card ${pkg.popular ? 'popular' : ''}`} key={pkg.id}><h3>{pkg.name}</h3><strong>{pkg.price} EGP</strong><span>/{pkg.period}</span>{pkg.features.map((feature) => <p key={feature}>✓ {feature}</p>)}<button className="primary-btn">Choose {pkg.name}</button></article>)}
      </div>
    </main>
  );
}
