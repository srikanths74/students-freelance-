import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder or root folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Create transporter dynamically based on environment config
function getTransporter() {
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '').trim();
  const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || smtpUser.includes('@gmail.com');
  
  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
}

/**
 * Send Verification OTP Email
 * @param {string} toEmail - Recipient email address (the user's login/register email)
 * @param {string} recipientName - Recipient student/client name
 * @param {string} otpCode - 6-digit OTP code
 */
export async function sendVerificationOtpEmail(toEmail, recipientName, otpCode) {
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '').trim();
  const fromAddress = smtpUser || 'noreply@campusgig.edu';
  
  const mailOptions = {
    from: `"CampusGig Verification" <${fromAddress}>`,
    to: toEmail,
    subject: `🎓 Your CampusGig Verification Code: ${otpCode}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1.5px solid #d6e4f7; border-radius: 16px; color: #0d1b3e;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: linear-gradient(135deg, #0A5FD6 0%, #1A7FE8 100%); color: #ffffff; font-size: 24px; font-weight: bold;">
            🎓
          </div>
          <h2 style="font-size: 22px; font-weight: 800; color: #0A5FD6; margin: 12px 0 4px;">CampusGig Email Verification</h2>
          <p style="font-size: 14px; color: #5b7fa6; margin: 0;">Student Freelance Marketplace</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6;">Hello <strong>${recipientName || 'Student'}</strong>,</p>
        
        <p style="font-size: 14px; line-height: 1.6; color: #1e3a5f;">
          Please use the following 6-digit verification code to verify your email address (<strong>${toEmail}</strong>) and access your <strong>CampusGig Account</strong>.
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: #ebf2ff; border: 2px dashed #0A5FD6; border-radius: 12px; padding: 14px 28px; letter-spacing: 6px; font-size: 32px; font-weight: 800; color: #0A5FD6;">
            ${otpCode}
          </div>
          <p style="font-size: 12px; color: #5b7fa6; margin-top: 8px;">This code will expire in 15 minutes.</p>
        </div>

        <div style="background: #f4f7fd; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #5b7fa6; line-height: 1.5; margin-bottom: 20px;">
          🔒 <strong>Security Notice:</strong> Never share your verification code with anyone. CampusGig administrators will never ask for your code.
        </div>

        <p style="font-size: 12px; color: #94b3ce; text-align: center; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          If you did not request this email, you can safely ignore it.<br />
          © 2026 CampusGig Student Freelance Marketplace.
        </p>
      </div>
    `
  };

  const hasValidUser = smtpUser && !smtpUser.includes('your-email');
  const hasValidPass = smtpPass && !smtpPass.includes('your-app-password');

  if (hasValidUser && hasValidPass) {
    try {
      const transporter = getTransporter();
      const info = await transporter.sendMail(mailOptions);
      console.log(`📧 [SMTP Live Dispatch] Verification email delivered to ${toEmail}. MessageId: ${info.messageId}`);
      return { success: true, mode: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.error(`❌ [SMTP Error] Could not send to ${toEmail} (${err.message}).`);
      console.log(`🔑 [Server Fallback OTP] Code for ${toEmail}: 👉 [ ${otpCode} ] 👈`);
      return { success: true, mode: 'simulated', otp: otpCode, error: err.message };
    }
  } else {
    console.log(`⚠️ [SMTP Config Needed] SMTP_USER is currently '${smtpUser}'. Please set your actual Gmail address in backend/.env`);
    console.log(`🔑 [Server Log OTP] Code for ${toEmail}: 👉 [ ${otpCode} ] 👈`);
    return { success: true, mode: 'simulated', otp: otpCode };
  }
}

/**
 * Send Phone Verification OTP Email via SMTP
 * @param {string} toEmail - Recipient email address
 * @param {string} recipientName - Recipient student name
 * @param {string} phone - Recipient phone number being verified
 * @param {string} otpCode - 6-digit OTP code
 */
export async function sendPhoneVerificationOtpEmail(toEmail, recipientName, phone, otpCode) {
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '').trim();
  const fromAddress = smtpUser || 'noreply@campusgig.edu';

  const mailOptions = {
    from: `"CampusGig Phone Verification" <${fromAddress}>`,
    to: toEmail,
    subject: `📱 CampusGig Phone Verification Code: ${otpCode} for ${phone}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 28px; background: #ffffff; border: 1.5px solid #d1fae5; border-radius: 16px; color: #064e3b; box-shadow: 0 4px 20px rgba(5, 150, 105, 0.08);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 14px; background: linear-gradient(135deg, #059669 0%, #10B981 100%); color: #ffffff; font-size: 26px; font-weight: bold; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
            📱
          </div>
          <h2 style="font-size: 22px; font-weight: 800; color: #065f46; margin: 14px 0 4px; letter-spacing: -0.02em;">Mobile Phone Verification</h2>
          <p style="font-size: 13px; color: #059669; font-weight: 600; margin: 0;">CampusGig Verified Student Freelancer</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #1e293b;">Hello <strong>${recipientName || 'Student'}</strong>,</p>
        
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          You requested to verify and link your mobile phone number <strong>${phone}</strong> with your CampusGig student freelancer profile.
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Please enter the following 6-digit verification code to complete your profile setup:
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: #ecfdf5; border: 2px dashed #059669; border-radius: 12px; padding: 14px 32px; letter-spacing: 8px; font-size: 34px; font-weight: 800; color: #065f46;">
            ${otpCode}
          </div>
          <p style="font-size: 12px; color: #047857; margin-top: 10px; font-weight: 600;">⏱️ This code will expire in 10 minutes.</p>
        </div>

        <div style="background: #f0fdf4; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #166534; line-height: 1.5; border: 1px solid #bbf7d0;">
          🔒 <strong>Security Warning:</strong> Never share this OTP code with anyone. CampusGig staff will never contact you asking for this code.
        </div>

        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 26px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          If you did not request this verification, please secure your account immediately.<br />
          © 2026 CampusGig Student Freelance Marketplace.
        </p>
      </div>
    `
  };

  const hasValidUser = smtpUser && !smtpUser.includes('your-email');
  const hasValidPass = smtpPass && !smtpPass.includes('your-app-password');

  if (hasValidUser && hasValidPass) {
    try {
      const transporter = getTransporter();
      const info = await transporter.sendMail(mailOptions);
      console.log(`📱 [SMTP Phone OTP Dispatch] Delivered verification code to ${toEmail} for phone ${phone}. MessageId: ${info.messageId}`);
      return { success: true, mode: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.error(`❌ [SMTP Phone OTP Error] Could not send to ${toEmail} (${err.message}).`);
      console.log(`🔑 [Server Fallback OTP] Code for ${phone} / ${toEmail}: 👉 [ ${otpCode} ] 👈`);
      return { success: true, mode: 'simulated', otp: otpCode, error: err.message };
    }
  } else {
    console.log(`⚠️ [SMTP Config Needed] SMTP_USER is currently '${smtpUser}'.`);
    console.log(`🔑 [Server Log OTP] Code for ${phone} / ${toEmail}: 👉 [ ${otpCode} ] 👈`);
    return { success: true, mode: 'simulated', otp: otpCode };
  }
}

/**
 * Send Password Reset OTP Email via SMTP
 * @param {string} toEmail - Recipient email address
 * @param {string} recipientName - Recipient name
 * @param {string} otpCode - 6-digit OTP code
 */
export async function sendPasswordResetOtpEmail(toEmail, recipientName, otpCode) {
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '').trim();
  const fromAddress = smtpUser || 'noreply@campusgig.edu';

  const mailOptions = {
    from: `"CampusGig Security" <${fromAddress}>`,
    to: toEmail,
    subject: `🔐 CampusGig Password Reset Code: ${otpCode}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 28px; background: #ffffff; border: 1.5px solid #fed7aa; border-radius: 16px; color: #7c2d12; box-shadow: 0 4px 20px rgba(234, 88, 12, 0.08);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 14px; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: #ffffff; font-size: 26px; font-weight: bold; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
            🔑
          </div>
          <h2 style="font-size: 22px; font-weight: 800; color: #9a3412; margin: 14px 0 4px; letter-spacing: -0.02em;">Password Reset Request</h2>
          <p style="font-size: 13px; color: #ea580c; font-weight: 600; margin: 0;">CampusGig Account Security</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #1e293b;">Hello <strong>${recipientName || 'User'}</strong>,</p>
        
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          We received a request to reset the password for your CampusGig account associated with <strong>${toEmail}</strong>.
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Please use the following 6-digit verification code to choose a new password:
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: #fff7ed; border: 2px dashed #ea580c; border-radius: 12px; padding: 14px 32px; letter-spacing: 8px; font-size: 34px; font-weight: 800; color: #c2410c;">
            ${otpCode}
          </div>
          <p style="font-size: 12px; color: #c2410c; margin-top: 10px; font-weight: 600;">⏱️ This reset code will expire in 15 minutes.</p>
        </div>

        <div style="background: #fffbeb; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #92400e; line-height: 1.5; border: 1px solid #fde68a;">
          🛡️ <strong>Did not request this?</strong> If you did not request a password reset, you can safely ignore this email. Your existing password remains unchanged and secure.
        </div>

        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 26px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          © 2026 CampusGig Student Freelance Marketplace. All rights reserved.
        </p>
      </div>
    `
  };

  const hasValidUser = smtpUser && !smtpUser.includes('your-email');
  const hasValidPass = smtpPass && !smtpPass.includes('your-app-password');

  if (hasValidUser && hasValidPass) {
    try {
      const transporter = getTransporter();
      const info = await transporter.sendMail(mailOptions);
      console.log(`🔐 [SMTP Password Reset Dispatch] Delivered reset code to ${toEmail}. MessageId: ${info.messageId}`);
      return { success: true, mode: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.error(`❌ [SMTP Password Reset Error] Could not send to ${toEmail} (${err.message}).`);
      console.log(`🔑 [Server Fallback Reset OTP] Code for ${toEmail}: 👉 [ ${otpCode} ] 👈`);
      return { success: true, mode: 'simulated', otp: otpCode, error: err.message };
    }
  } else {
    console.log(`⚠️ [SMTP Config Needed] SMTP_USER is currently '${smtpUser}'.`);
    console.log(`🔑 [Server Log Reset OTP] Code for ${toEmail}: 👉 [ ${otpCode} ] 👈`);
    return { success: true, mode: 'simulated', otp: otpCode };
  }
}

export default {
  sendVerificationOtpEmail,
  sendPhoneVerificationOtpEmail,
  sendPasswordResetOtpEmail
};
