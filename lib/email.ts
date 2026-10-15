import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

type SendEmailOpts = {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
};

const FROM_DEFAULT = process.env.EMAIL_FROM || 'no-reply@auxlo.uk';

let smtpTransport: nodemailer.Transporter | null = null;

export function initSendGrid() {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) return false;
  try {
    sgMail.setApiKey(key);
    return true;
  } catch (err) {
    console.error('initSendGrid error', err);
    return false;
  }
}

export function initSMTP() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const secure = (process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';

  if (!host || !port || !user || !pass) {
    return false;
  }

  try {
    smtpTransport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
    return true;
  } catch (err) {
    console.error('initSMTP error', err);
    smtpTransport = null;
    return false;
  }
}

export async function sendEmail(opts: SendEmailOpts) {
  // Prefer SendGrid if API key present
  if (process.env.SENDGRID_API_KEY && initSendGrid()) {
    const msg: any = {
      to: opts.to,
      from: opts.from || FROM_DEFAULT,
      subject: opts.subject,
    };

    if (opts.templateId) {
      msg.templateId = opts.templateId;
      if (opts.dynamicTemplateData) msg.dynamic_template_data = opts.dynamicTemplateData;
    } else {
      if (opts.html) msg.html = opts.html;
      if (opts.text) msg.text = opts.text;
    }

    try {
      const res = await sgMail.send(msg);
      return { ok: true, provider: 'sendgrid', response: res };
    } catch (err: any) {
      console.error('SendGrid sendEmail error', err?.response?.body || err.message || err);
      // Don't throw yet; try SMTP fallback below
    }
  }

  // SMTP fallback
  const smtpOk = smtpTransport || initSMTP();
  if (!smtpOk || !smtpTransport) {
    console.warn('No email provider configured (SendGrid disabled and SMTP not configured). Skipping send to', opts.to);
    return { ok: false, skipped: true };
  }

  const mailOpts: nodemailer.SendMailOptions = {
    to: opts.to,
    from: opts.from || FROM_DEFAULT,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  };

  try {
    const info = await smtpTransport.sendMail(mailOpts);
    return { ok: true, provider: 'smtp', response: info };
  } catch (err: any) {
    console.error('SMTP sendEmail error', err);
    throw err;
  }
}

export async function sendBookingConfirmation(to: string, data: { name?: string; bookingId?: string; date?: string }) {
  // If you prefer template-based sends via SendGrid, set SENDGRID_BOOKING_TEMPLATE
  if (process.env.SENDGRID_BOOKING_TEMPLATE && process.env.SENDGRID_API_KEY) {
    return sendEmail({
      to,
      subject: 'Booking confirmed',
      templateId: process.env.SENDGRID_BOOKING_TEMPLATE,
      dynamicTemplateData: data,
    });
  }

  const html = `<p>Hi ${data.name || 'there'},</p><p>Your booking ${data.bookingId || ''} is confirmed for ${data.date || ''}.</p>`;
  return sendEmail({ to, subject: 'Booking confirmed', html, text: `Your booking is confirmed for ${data.date || ''}` });
}

export async function sendLeadNotification(to: string, data: { name?: string; message?: string }) {
  if (process.env.SENDGRID_LEAD_TEMPLATE && process.env.SENDGRID_API_KEY) {
    return sendEmail({
      to,
      subject: 'New lead received',
      templateId: process.env.SENDGRID_LEAD_TEMPLATE,
      dynamicTemplateData: data,
    });
  }

  const html = `<p>New lead from ${data.name}</p><p>${data.message}</p>`;
  return sendEmail({ to, subject: 'New lead', html });
}

export default { initSendGrid, initSMTP, sendEmail, sendBookingConfirmation, sendLeadNotification };
