import nodemailer from 'nodemailer';

function buildTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration missing. Please set SMTP_HOST, SMTP_USER, SMTP_PASS');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, subject, text, html, fromName, replyTo } = req.body || {};
  if (!to || (!text && !html)) {
    return res.status(400).json({ error: 'Missing required fields: to and one of text or html' });
  }

  try {
    const transporter = buildTransporter();
    const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER;
    const formattedFrom = fromName ? `${fromName} <${fromAddress}>` : fromAddress;

    const info = await transporter.sendMail({
      from: formattedFrom,
      to,
      subject: subject || '(no subject)',
      text: text || undefined,
      html: html || undefined,
      replyTo: replyTo || undefined
    });

    return res.status(200).json({ messageId: info.messageId, accepted: info.accepted, rejected: info.rejected });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to send email', details: message });
  }
}


