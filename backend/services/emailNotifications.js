const RESEND_API_URL = 'https://api.resend.com/emails';

const fromEmail = () => process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || 'Salahny <notifications@salahny.com>';
const opsEmail = () => process.env.WORKSHOP_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || process.env.RESEND_TO_EMAIL;

export const sendEmailNotification = async ({ to, subject, html, text }) => {
  if (!process.env.RESEND_API_KEY || !to) return { skipped: true };

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: fromEmail(), to, subject, html, text })
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Resend notification failed: ${details || response.status}`);
  }

  return response.json();
};

export const notifyWorkshopRegistration = (workshop, owner) => {
  const to = opsEmail();
  if (!to) return;

  sendEmailNotification({
    to,
    subject: `New workshop pending approval: ${workshop.name}`,
    text: `${workshop.name} registered and is pending document verification/admin approval. Owner: ${owner.name}, email: ${owner.email}, phone: ${owner.phone}, address: ${workshop.address}.`,
    html: `
      <h2>New workshop pending approval</h2>
      <p><strong>${workshop.name}</strong> registered and is waiting for document verification and admin approval.</p>
      <ul>
        <li>Owner: ${owner.name}</li>
        <li>Email: ${owner.email}</li>
        <li>Phone: ${owner.phone || 'Not provided'}</li>
        <li>Address: ${workshop.address || 'Not provided'}</li>
      </ul>
    `
  }).catch((error) => console.warn(error.message));
};

export const notifyBookingStatus = (booking, status) => {
  if (!booking.driver?.email) return;

  sendEmailNotification({
    to: booking.driver.email,
    subject: `Your Salahny booking is now ${status}`,
    text: `Your workshop booking ${booking.id} status changed to ${status}.`,
    html: `<p>Your workshop booking <strong>${booking.id}</strong> status changed to <strong>${status}</strong>.</p>`
  }).catch((error) => console.warn(error.message));
};
