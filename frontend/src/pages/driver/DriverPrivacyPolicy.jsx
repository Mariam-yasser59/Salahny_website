import SectionHeader from '../../components/SectionHeader.jsx';

export default function DriverPrivacyPolicy() {
  return (
    <div className="dash-stack">
      <SectionHeader title="Privacy Policy">How Salahny collects, uses, and protects your data.</SectionHeader>

      <section className="panel">
        <p style={{ opacity: 0.6, fontSize: '0.85rem', marginBottom: 20 }}>Last updated: June 2026</p>

        <PolicySection title="1. Information We Collect">
          <p>We collect information you provide directly to us, such as when you create an account, book a service, or contact us for support. This includes:</p>
          <ul>
            <li>Name, email address, phone number, and city</li>
            <li>Vehicle information (make, model, year, plate, VIN)</li>
            <li>OBD-II sensor readings submitted for AI diagnostics</li>
            <li>Location data when you use the emergency or workshop-finder features</li>
            <li>Payment card last-4 digits for demo subscription transactions</li>
          </ul>
        </PolicySection>

        <PolicySection title="2. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve the Salahny platform</li>
            <li>Process bookings and coordinate with workshops on your behalf</li>
            <li>Run AI diagnostics on your vehicle sensor data</li>
            <li>Send you notifications about booking status and service updates</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Monitor and analyze usage patterns to improve user experience</li>
          </ul>
        </PolicySection>

        <PolicySection title="3. Location Data">
          <p>
            Salahny requests access to your device location only when you use the "Use Current Location" button in the Emergency or Workshops screens.
            Location data is used solely to find the nearest available workshops or to attach your coordinates to an emergency request.
            We do not track your location continuously in the background.
          </p>
        </PolicySection>

        <PolicySection title="4. OBD-II Diagnostic Data">
          <p>
            Sensor readings you submit through the AI Diagnostics feature are processed by our backend AI engine to generate a health report.
            This data is stored against your account and is visible to you and, if you share the report, to the assigned workshop technician.
            We do not sell diagnostic data to third parties.
          </p>
        </PolicySection>

        <PolicySection title="5. Data Sharing">
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul>
            <li><strong>Workshops:</strong> When you book a service, the workshop receives your name, phone, vehicle info, and booking details.</li>
            <li><strong>Service providers:</strong> Third-party vendors that help us operate the platform (hosting, email, analytics).</li>
            <li><strong>Law enforcement:</strong> If required by law or to protect the rights and safety of our users.</li>
          </ul>
        </PolicySection>

        <PolicySection title="6. Data Retention">
          <p>
            We retain your account data for as long as your account is active. If you delete your account, we will delete your personal information
            within 30 days, except where we are required to retain it for legal or regulatory purposes.
          </p>
        </PolicySection>

        <PolicySection title="7. Security">
          <p>
            We use industry-standard encryption and secure practices to protect your data. Passwords are hashed using scrypt before storage.
            However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </PolicySection>

        <PolicySection title="8. Your Rights">
          <p>You have the right to:</p>
          <ul>
            <li>Access and download your personal data</li>
            <li>Correct inaccurate information in your profile</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of non-essential communications</li>
          </ul>
          <p>To exercise any of these rights, use the Settings page or contact us at support@salahny.com.</p>
        </PolicySection>

        <PolicySection title="9. Contact Us">
          <p>
            If you have questions about this Privacy Policy, please contact us at:<br />
            <strong>support@salahny.com</strong><br />
            Salahny Technologies, Cairo, Egypt
          </p>
        </PolicySection>
      </section>
    </div>
  );
}

function PolicySection({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ marginBottom: 10, fontSize: '1rem' }}>{title}</h3>
      <div style={{ lineHeight: 1.7, opacity: 0.85, fontSize: '0.9rem' }}>{children}</div>
    </div>
  );
}
