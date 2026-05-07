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
        <StatCard label="Daily" value={`${data.daily} EGP`} icon={BarChart3} />
        <StatCard label="Weekly" value={`${data.weekly} EGP`} icon={BarChart3} />
        <StatCard label="Monthly" value={`${data.monthly} EGP`} icon={BarChart3} />
        <StatCard label="Completed Jobs" value={data.completedJobs} icon={BarChart3} />
      </div>
      <section className="panel chart-bars">{data.series.map((value, index) => <span key={index} style={{ height: `${value / 100}px` }} />)}</section>
    </div>
  );
}
