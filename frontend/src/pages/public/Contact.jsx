export default function Contact() {
  return (
    <main className="page split-section">
      <div>
        <span className="eyebrow">Contact</span>
        <h1>Support for drivers, workshops, and platform partners.</h1>
        <p>Phone: +20 100 000 0000</p>
        <p>Email: support@salahny.com</p>
        <p>Location: Cairo, Egypt</p>
      </div>
      <form className="form-card">
        <input placeholder="Full name" />
        <input placeholder="Email address" />
        <select><option>Driver support</option><option>Workshop partnership</option><option>Admin inquiry</option></select>
        <textarea placeholder="How can Salahny help?" rows="5" />
        <button className="primary-btn" type="button">Send Message</button>
      </form>
    </main>
  );
}
