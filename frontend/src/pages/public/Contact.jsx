export default function Contact() {
  return (
    <main className="page split-section">
      <div>
        <span className="eyebrow">Contact</span>
        <h1>Support for Salahny workshop partners.</h1>
        <p>Phone: +20 100 000 0000</p>
        <p>Email: support@salahny.com</p>
        <p>Location: Cairo, Egypt</p>
      </div>
      <form className="form-card">
        <input placeholder="Full name" />
        <input placeholder="Email address" />
        <select><option>Workshop partnership</option><option>Verification documents</option><option>Portal support</option></select>
        <textarea placeholder="How can Salahny help?" rows="5" />
        <button className="primary-btn" type="button">Send Message</button>
      </form>
    </main>
  );
}
