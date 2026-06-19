import SectionHeader from '../../components/SectionHeader.jsx';

export default function About() {
  return (
    <main className="page">
      <SectionHeader eyebrow="About Salahny" title="A smarter operating system for vehicle care">
        This website is focused on the workshop side of Salahny: approved partners managing demand, service workflows, diagnostics, emergency assignments, and earnings.
      </SectionHeader>
      <div className="feature-grid three">
        {[
          ['Mission', 'Give workshop teams a clear web workspace for bookings, service progress, diagnostics, availability, and communication.'],
          ['Verification', 'Workshop accounts remain pending until document checks and approval are complete.'],
          ['Operations', 'The portal mirrors existing backend features without adding driver-owned or admin-owned workflows.']
        ].map(([title, text]) => <article className="feature-card" key={title}><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </main>
  );
}
