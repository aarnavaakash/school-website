const nodemailer = require('nodemailer');

const TARGET_EMAIL = process.env.ADMIN_ALERT_EMAIL || 'riturajkumar1729@gmail.com';

/**
 * Creates and returns a nodemailer transporter configured with environment variables
 */
const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  // Support custom SMTP host or default to Gmail service
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
};

/**
 * Sends security alert email to TARGET_EMAIL whenever someone logs into the admin panel
 */
exports.sendAdminLoginAlert = async ({ adminEmail, adminName, ip, userAgent, time = new Date() }) => {
  const transporter = getTransporter();

  const formattedTime = new Date(time).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const subject = `🚨 [Security Alert] Admin Login Detected - H.N.P Institute`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); color: #ffffff; padding: 24px; text-align: center; }
          .badge { display: inline-block; background: #dc2626; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
          .title { font-size: 20px; font-weight: 800; margin: 0; }
          .body { padding: 24px; }
          .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px; margin-bottom: 20px; color: #991b1b; font-size: 13px; font-weight: 600; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .details-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          .details-table td.label { font-weight: bold; color: #475569; width: 35%; background: #f8fafc; }
          .details-table td.val { color: #0f172a; font-family: monospace; font-size: 12.5px; }
          .footer { background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">Security Notice</span>
            <h1 class="title">Admin Login Notification</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.85;">H.N.P. Institute of Education</p>
          </div>
          <div class="body">
            <div class="alert-box">
              ⚠️ Someone has successfully logged into the School Admin Dashboard.
            </div>
            <table class="details-table">
              <tr>
                <td class="label">Admin Account</td>
                <td class="val"><strong>${adminEmail || 'admin@hnp.edu'}</strong> (${adminName || 'Admin User'})</td>
              </tr>
              <tr>
                <td class="label">Login Time (IST)</td>
                <td class="val">${formattedTime} IST</td>
              </tr>
              <tr>
                <td class="label">IP Address</td>
                <td class="val">${ip || 'Unknown / Localhost'}</td>
              </tr>
              <tr>
                <td class="label">Browser / Device</td>
                <td class="val" style="word-break: break-all;">${userAgent || 'Web Browser'}</td>
              </tr>
            </table>
            <p style="font-size: 12px; color: #475569; line-height: 1.5; margin: 0;">
              If this was you, you can safely ignore this email. If you did not log in or authorize this session, please immediately change the admin password and inspect the server.
            </p>
          </div>
          <div class="footer">
            Automated security notification sent to <strong>${TARGET_EMAIL}</strong> &bull; H.N.P Institute of Education
          </div>
        </div>
      </body>
    </html>
  `;

  if (!transporter) {
    console.warn('\n======================================================');
    console.warn(`[EMAIL ALERT SIMULATION] Admin logged in at ${formattedTime}!`);
    console.warn(`Destination: ${TARGET_EMAIL}`);
    console.warn(`Account: ${adminEmail} | IP: ${ip}`);
    console.warn('NOTE: To send real emails via Gmail, add the following to backend/.env:');
    console.warn('  EMAIL_USER=yourgmail@gmail.com');
    console.warn('  EMAIL_PASS=your16digitGoogleAppPassword');
    console.warn('======================================================\n');
    return { success: false, reason: 'EMAIL_USER or EMAIL_PASS not configured in .env' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"HNP Security Alert" <${process.env.EMAIL_USER}>`,
      to: TARGET_EMAIL,
      subject,
      html: htmlContent
    });
    console.log(`[EMAIL ALERT] Notification sent to ${TARGET_EMAIL}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL ALERT ERROR] Failed to send email to ${TARGET_EMAIL}:`, error.message);
    return { success: false, error: error.message };
  }
};
