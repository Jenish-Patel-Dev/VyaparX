import nodemailer, { type Transporter } from 'nodemailer';
import dotenv from 'dotenv';

// Safely load .env in development
try {
  dotenv.config();
} catch {
  // Ignored in serverless production
}

let cachedTransporter: Transporter | null = null;
let lastConfigHash: string = '';

export function isSmtpConfigured(): boolean {
  const user = process.env.EMAIL_USER?.trim();
  const pass = (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS)?.trim();
  return Boolean(user && pass);
}

export function getSmtpStatus(): { configured: boolean; user?: string; serviceOrHost?: string } {
  const user = process.env.EMAIL_USER?.trim();
  const host = process.env.EMAIL_HOST?.trim();
  const service = process.env.EMAIL_SERVICE?.trim();
  const configured = isSmtpConfigured();

  let maskedUser: string | undefined = undefined;
  if (user && user.includes('@')) {
    const [u, d] = user.split('@');
    maskedUser = `${u.slice(0, 3)}***@${d}`;
  }

  return {
    configured,
    user: maskedUser,
    serviceOrHost: service || host || (user?.endsWith('@gmail.com') ? 'gmail' : undefined),
  };
}

function getTransporter(): Transporter {
  const rawUser = process.env.EMAIL_USER?.trim() || '';
  const rawPass = (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS)?.trim() || '';
  const rawHost = process.env.EMAIL_HOST?.trim() || '';
  const rawPort = Number(process.env.EMAIL_PORT?.trim() || 587);
  const rawSecure = process.env.EMAIL_SECURE?.trim() === 'true' || rawPort === 465;
  const rawService = process.env.EMAIL_SERVICE?.trim()?.toLowerCase();

  if (!rawUser || !rawPass) {
    throw new Error(
      'EMAIL_NOT_CONFIGURED: Sender email credentials are not set. Please configure EMAIL_USER and EMAIL_PASSWORD (or EMAIL_PASS) in your environment variables.'
    );
  }

  // Google App Passwords commonly have spaces when copied (e.g. "abcd efgh ijkl mnop")
  const sanitizedPass = rawPass.replace(/\s+/g, '');
  const configHash = `${rawService}-${rawHost}-${rawPort}-${rawSecure}-${rawUser}-${sanitizedPass}`;

  if (cachedTransporter && lastConfigHash === configHash) {
    return cachedTransporter;
  }

  let transporter: Transporter;

  // Use Gmail service if explicitly requested or if sender is a @gmail.com address without custom host
  if (rawService === 'gmail' || (!rawHost && rawUser.endsWith('@gmail.com'))) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: rawUser,
        pass: sanitizedPass,
      },
    });
  } else {
    // Custom SMTP
    transporter = nodemailer.createTransport({
      host: rawHost || 'smtp.gmail.com',
      port: rawPort,
      secure: rawSecure,
      auth: {
        user: rawUser,
        pass: sanitizedPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  cachedTransporter = transporter;
  lastConfigHash = configHash;
  return transporter;
}

export async function verifySmtpConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    return { success: true, message: 'SMTP connection verified successfully.' };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to verify SMTP connection.',
    };
  }
}

export type OtpPurpose = 'login' | 'pin_reset';

/**
 * Generates modern, responsive HTML email template for OTP delivery
 * Differentiates clearly between Account Login vs 6-Digit PIN Reset
 */
function buildOtpEmailHtml(toEmail: string, otp: string, purpose: OtpPurpose = 'login'): string {
  const formattedTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const isPinReset = purpose === 'pin_reset';

  // Config based on purpose
  const config = isPinReset
    ? {
        title: 'Your VyaparX PIN Reset Authorization Code',
        headerGradient: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #059669 100%)',
        badgeBg: '#ccfbf1',
        badgeColor: '#0f766e',
        badgeBorder: '#99f6e4',
        badgeText: '🛡️ SECURITY PASSCODE (PIN) RESET',
        headline: 'Reset Your 6-Digit Security PIN',
        subtext: 'We received a request to reset or change the <strong>6-digit security PIN</strong> for your VyaparX account. Use the one-time authorization code below to verify your identity and set a new Passcode PIN:',
        otpContainerBg: '#f0fdfa',
        otpBorder: '#0d9488',
        otpLabelColor: '#0f766e',
        otpLabelText: 'PIN RESET AUTHORIZATION CODE',
        otpColor: '#0f766e',
        otpBadgeBg: '#99f6e4',
        otpBadgeColor: '#134e4a',
        securityTitle: '🛡️ PIN Security Notice',
        securityItems: [
          'This code authorizes setting a new 6-digit PIN to unlock your application.',
          'Never share this code with anyone. VyaparX staff will never ask for your verification code.',
          'If you did NOT request to reset your PIN, please ignore this email. Your current passcode remains safe and unchanged.',
        ],
        purposeLabel: '6-Digit PIN Reset',
      }
    : {
        title: 'Your VyaparX Login Verification Code',
        headerGradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
        badgeBg: '#dbeafe',
        badgeColor: '#1e40af',
        badgeBorder: '#bfdbfe',
        badgeText: '🔐 ACCOUNT SIGN-IN VERIFICATION',
        headline: 'Verify Your Account Login',
        subtext: 'We received a request to sign in to your VyaparX portal. Use the one-time verification code below to authenticate your session and access your Sauda Book:',
        otpContainerBg: '#eff6ff',
        otpBorder: '#2563eb',
        otpLabelColor: '#1d4ed8',
        otpLabelText: 'ONE-TIME LOGIN CODE',
        otpColor: '#1d4ed8',
        otpBadgeBg: '#bfdbfe',
        otpBadgeColor: '#1e3a8a',
        securityTitle: '🛡️ Sign-in Security Notice',
        securityItems: [
          'This code grants full access to your business firms, trading parties, and Sauda records.',
          'Never share this code with anyone under any circumstances.',
          'If you did NOT attempt to log in to VyaparX, please verify your email credentials immediately.',
        ],
        purposeLabel: 'Account Login Authentication',
      };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #1e293b;
    }
    table {
      border-collapse: collapse;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f1f5f9;
      padding: 40px 12px;
    }
    .main-card {
      background-color: #ffffff;
      margin: 0 auto;
      max-width: 560px;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
    }
    .header-banner {
      background: ${config.headerGradient};
      padding: 36px 28px;
      text-align: center;
    }
    .brand-logo {
      display: inline-block;
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 1.5px;
      color: #ffffff;
      margin: 0;
      text-transform: uppercase;
      text-shadow: 0 2px 4px rgba(0,0,0,0.18);
    }
    .brand-tagline {
      color: rgba(255, 255, 255, 0.88);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      margin-top: 6px;
      text-transform: uppercase;
    }
    .content-body {
      padding: 36px 32px;
      text-align: center;
    }
    .purpose-badge {
      display: inline-block;
      background: ${config.badgeBg};
      color: ${config.badgeColor};
      border: 1px solid ${config.badgeBorder};
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      padding: 6px 14px;
      border-radius: 9999px;
      text-transform: uppercase;
      margin-bottom: 18px;
    }
    .headline {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      margin: 0 0 12px 0;
      line-height: 1.3;
    }
    .subtext {
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
      margin: 0 0 26px 0;
    }
    .otp-container {
      background: ${config.otpContainerBg};
      border: 2px dashed ${config.otpBorder};
      border-radius: 18px;
      padding: 24px 20px;
      margin: 0 auto 28px;
      max-width: 400px;
    }
    .otp-label {
      font-size: 11px;
      font-weight: 800;
      color: ${config.otpLabelColor};
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
      display: block;
    }
    .otp-number {
      font-size: 44px;
      font-weight: 900;
      letter-spacing: 14px;
      color: ${config.otpColor};
      font-family: 'SF Pro Display', -apple-system, 'Courier New', Courier, monospace;
      padding-left: 14px;
      line-height: 1.1;
      margin: 4px 0;
    }
    .otp-badge {
      display: inline-block;
      margin-top: 10px;
      background: ${config.otpBadgeBg};
      color: ${config.otpBadgeColor};
      font-size: 12px;
      font-weight: 700;
      padding: 4px 14px;
      border-radius: 9999px;
    }
    .security-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 18px 20px;
      margin-bottom: 24px;
      text-align: left;
    }
    .security-title {
      font-size: 12px;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 8px;
    }
    .security-list {
      margin: 0;
      padding-left: 18px;
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
    }
    .meta-card {
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      margin-top: 10px;
      font-size: 12px;
      color: #94a3b8;
      text-align: left;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }
    .meta-key {
      color: #64748b;
      font-weight: 600;
    }
    .meta-val {
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 700;
    }
    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-card">
      <!-- Header Banner -->
      <div class="header-banner">
        <div class="brand-logo">VyaparX</div>
        <div class="brand-tagline">Commodity ERP & Trade Sauda Book</div>
      </div>

      <!-- Main Body -->
      <div class="content-body">
        <!-- Purpose Badge -->
        <div class="purpose-badge">${config.badgeText}</div>

        <h2 class="headline">${config.headline}</h2>
        <p class="subtext">${config.subtext}</p>

        <!-- OTP Highlight Card -->
        <div class="otp-container">
          <span class="otp-label">${config.otpLabelText}</span>
          <div class="otp-number">${otp}</div>
          <div class="otp-badge">⏱️ Valid for 5 minutes only</div>
        </div>

        <!-- Security Guidance -->
        <div class="security-box">
          <div class="security-title">${config.securityTitle}</div>
          <ul class="security-list">
            ${config.securityItems.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>

        <!-- Request Details -->
        <div class="meta-card">
          <div class="meta-row">
            <span class="meta-key">Request Purpose:</span>
            <span class="meta-val">${config.purposeLabel}</span>
          </div>
          <div class="meta-row">
            <span class="meta-key">Recipient:</span>
            <span class="meta-val">${toEmail}</span>
          </div>
          <div class="meta-row">
            <span class="meta-key">Timestamp (IST):</span>
            <span class="meta-val">${formattedTime}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        © 2026 VyaparX. All rights reserved.<br>
        Automated security notification for commodity & agro brokerage services.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Dispatches the OTP email to the user's real email address.
 * Tailors subject and HTML according to OTP purpose ('login' | 'pin_reset').
 */
export async function sendOtpEmail(
  toEmail: string,
  otp: string,
  purpose: OtpPurpose = 'login'
): Promise<{ success: boolean; messageId?: string }> {
  try {
    const transporter = getTransporter();
    const fromUser = process.env.EMAIL_USER?.trim() || 'noreply@vyaparx.com';
    const fromAddress = process.env.EMAIL_FROM?.trim() || `"VyaparX Security" <${fromUser}>`;

    const htmlContent = buildOtpEmailHtml(toEmail, otp, purpose);
    const isPinReset = purpose === 'pin_reset';
    const subject = isPinReset
      ? `🔑 [VyaparX] ${otp} is your 6-Digit PIN Reset Code`
      : `🔐 [VyaparX] ${otp} is your Login Verification Code`;

    const plainText = isPinReset
      ? `Your VyaparX 6-Digit PIN Reset authorization code is: ${otp}\n\nPurpose: Reset Security Passcode (PIN)\nValid for 5 minutes.\nDo not share this code with anyone.\n\nSent to: ${toEmail}\nVyaparX - Commodity ERP & Sauda Book`
      : `Your VyaparX Login verification code is: ${otp}\n\nPurpose: Account Sign-In Verification\nValid for 5 minutes.\nDo not share this code with anyone.\n\nSent to: ${toEmail}\nVyaparX - Commodity ERP & Sauda Book`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      text: plainText,
      html: htmlContent,
    });

    console.log(`[EMAIL SUCCESS] Real OTP email (${purpose}) delivered to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[EMAIL ERROR] Failed to send real email to ${toEmail}:`, error.message);
    throw error;
  }
}
