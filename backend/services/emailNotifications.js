const RESEND_API_URL = 'https://api.resend.com/emails';

const fromEmail = () => process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || process.env.FROM_EMAIL || 'Salahny <notifications@salahny.com>';
const replyToEmail = () => process.env.EMAIL_REPLY_TO || process.env.RESEND_REPLY_TO || process.env.REPLY_TO;
const opsEmail = () => process.env.WORKSHOP_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || process.env.RESEND_TO_EMAIL;

export const emailConfigurationStatus = () => ({
  provider: 'resend',
  configured: Boolean(process.env.RESEND_API_KEY),
  from: fromEmail(),
  replyTo: replyToEmail() || null,
  opsRecipientConfigured: Boolean(opsEmail())
});

export const sendEmailNotification = async ({ to, subject, html, text }) => {
  if (!process.env.RESEND_API_KEY || !to) return { skipped: true };

  const body = { from: fromEmail(), to, subject, html, text };
  const replyTo = replyToEmail();
  if (replyTo) body.reply_to = replyTo;

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
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

export const notifyWorkshopNewBooking = (workshop, booking, driver) => {
  const ownerEmail = booking.workshopOwnerEmail || workshop.email || opsEmail();
  if (!ownerEmail) return;

  sendEmailNotification({
    to: ownerEmail,
    subject: `New Salahny booking request: ${booking.id}`,
    text: `Hello ${workshop.name},\n\nYou received a new booking request from ${driver?.name || 'a customer'}.\nService: ${booking.serviceName || booking.serviceId}\nSlot: ${booking.slot || `${booking.date || ''} ${booking.time || ''}`}\n\nOpen the workshop portal to accept or decline the request.`,
    html: `
      <p>Hello ${workshop.name},</p>
      <p>You received a new booking request from <strong>${driver?.name || 'a customer'}</strong>.</p>
      <ul>
        <li>Booking: ${booking.id}</li>
        <li>Service: ${booking.serviceName || booking.serviceId}</li>
        <li>Slot: ${booking.slot || `${booking.date || ''} ${booking.time || ''}`}</li>
      </ul>
      <p>Open the workshop portal to accept or decline the request.</p>
    `
  }).catch((error) => console.warn(error.message));
};

export const notifyDiagnosticReady = (booking, diagnostic) => {
  if (!booking.driver?.email) return;

  sendEmailNotification({
    to: booking.driver.email,
    subject: 'Your Salahny diagnostic report is ready',
    text: `Your workshop diagnostic report is ready.\nIssue: ${diagnostic.issue}\nHealth score: ${diagnostic.healthScore}%\nRecommended fix: ${diagnostic.recommendedFix}`,
    html: `
      <p>Your workshop diagnostic report is ready.</p>
      <ul>
        <li>Issue: ${diagnostic.issue}</li>
        <li>Health score: ${diagnostic.healthScore}%</li>
        <li>Recommended fix: ${diagnostic.recommendedFix}</li>
      </ul>
    `
  }).catch((error) => console.warn(error.message));
};

export const notifyAccountStatus = (user, status, notes = '') => {
  if (!user?.email) return;
  const approved = ['active', 'verified', 'approved'].includes(status);
  const workshopCopy = user.role === 'workshop';
  const subject = approved
    ? workshopCopy
      ? 'Your Salahny workshop account has been approved'
      : 'Your Salahny account has been approved'
    : workshopCopy
      ? 'Your Salahny workshop account was not approved'
      : 'Your Salahny account was not approved';
  const text = approved
    ? `Hello ${user.name},\n\nYour ${workshopCopy ? 'workshop ' : ''}account has been approved. You can now log in and use Salahny.\n\nSalahny Team`
    : `Hello ${user.name},\n\nYour ${workshopCopy ? 'workshop ' : ''}account was not approved.${notes ? `\n\nNotes: ${notes}` : ''}\n\nPlease review your submitted information or contact support.\n\nSalahny Team`;

  sendEmailNotification({
    to: user.email,
    subject,
    text,
    html: text.split('\n').map((line) => `<p>${line || '&nbsp;'}</p>`).join('')
  }).catch((error) => console.warn(error.message));
};

export const notifyEmergencyStatus = (driver, request) => {
  if (!driver?.email) return;
  sendEmailNotification({
    to: driver.email,
    subject: `Your Salahny emergency request is ${request.status}`,
    text: `Hello ${driver.name},\n\nYour emergency request for ${request.emergencyType || 'roadside assistance'} is now ${request.status}.\nLocation: ${request.address || 'Provided in app'}\n\nSalahny Team`,
    html: `<p>Hello ${driver.name},</p><p>Your emergency request for <strong>${request.emergencyType || 'roadside assistance'}</strong> is now <strong>${request.status}</strong>.</p><p>Location: ${request.address || 'Provided in app'}</p>`
  }).catch((error) => console.warn(error.message));
};

export const notifyChatMessage = ({ to, recipientName = 'there', senderName, text, context = 'Salahny chat' }) => {
  if (!to) return;
  sendEmailNotification({
    to,
    subject: `New message in ${context}`,
    text: `Hello ${recipientName},\n\n${senderName || 'Salahny'} sent a new message:\n${text}\n\nOpen Salahny to reply.`,
    html: `<p>Hello ${recipientName},</p><p><strong>${senderName || 'Salahny'}</strong> sent a new message:</p><blockquote>${text}</blockquote><p>Open Salahny to reply.</p>`
  }).catch((error) => console.warn(error.message));
};
