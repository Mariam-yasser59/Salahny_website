import { BarChart3 } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function WorkshopEarnings() {
  const { data } = useApi('/workshop/earnings', { series: [] });
  return (
    <div className="dash-stack">
      <SectionHeader title="Earnings" />
      <div className="stats-grid">
        <StatCard label="Total Earnings" value={`${data.totalEarnings ?? data.monthly ?? 0} EGP`} icon={BarChart3} />
        <StatCard label="Available" value={`${data.availableBalance ?? data.daily ?? 0} EGP`} icon={BarChart3} />
        <StatCard label="Paid" value={`${data.paidAmount ?? data.weekly ?? 0} EGP`} icon={BarChart3} />
        <StatCard label="Completed Jobs" value={data.completedJobs} icon={BarChart3} />
      </div>
      <section className="panel chart-bars">{data.series.map((value, index) => <span key={index} style={{ height: `${value / 100}px` }} />)}</section>
      <section className="panel">
        <h3>Recent earning items</h3>
        {(data.recent || data.items || []).map((item) => <p className="activity-row" key={item.id || item.bookingId}>{item.description || item.serviceName || 'Completed booking'} - {item.amount} EGP</p>)}
      </section>
    </div>
  );
}
