import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  title: string;
  message: string;
  ctaUrl?: string;
  ctaText?: string;
}

export async function sendPajoEmail({
  to,
  subject,
  title,
  message,
  ctaUrl,
  ctaText,
}: SendEmailParams) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: sans-serif; background-color: #000; color: #fff; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #0A0A0A; border: 1px solid #1A1A1A; border-radius: 12px; overflow: hidden; }
        .header { background-color: #000; padding: 30px; text-align: center; border-bottom: 1px solid #1A1A1A; }
        .content { padding: 40px; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #1A1A1A; }
        .button { background-color: #B4FF00; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 20px; }
        h1 { color: #B4FF00; font-size: 24px; margin-bottom: 16px; }
        p { color: #EDEDED; line-height: 1.6; font-size: 16px; }
        .logo { font-weight: bold; letter-spacing: 0.25em; text-transform: uppercase; color: #B4FF00; font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">PAJO</div>
        </div>
        <div class="content">
          <h1>${title}</h1>
          <p>${message}</p>
          ${ctaUrl ? `<a href="${process.env.NEXTAUTH_URL}${ctaUrl}" class="button">${ctaText || 'View Details'}</a>` : ''}
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Auxlo. All rights reserved.<br>
          This is an automated operational email for your Pajo circle.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Pajo" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
