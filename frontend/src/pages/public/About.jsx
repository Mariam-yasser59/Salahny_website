import SectionHeader from '../../components/SectionHeader.jsx';

export default function About() {
  return (
    <main className="page">
      <SectionHeader eyebrow="About Salahny" title="A smarter operating system for vehicle care">
        Salahny exists to make auto service transparent, quick, and reliable for drivers while helping workshops manage demand with better data.
      </SectionHeader>
      <div className="feature-grid three">
        {[
          ['Mission', 'Reduce the stress and uncertainty of car maintenance through AI, verified partners, and live service tracking.'],
          ['Why choose us', 'Drivers get visibility and control. Workshops get qualified jobs. Admins get governance tools for the whole network.'],
          ['Platform benefits', 'Digital bookings, emergency dispatch, subscriptions, diagnostics, approvals, moderation, and activity logs in one system.']
        ].map(([title, text]) => <article className="feature-card" key={title}><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </main>
  );
}
