import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Send SMS OTP via Twilio
 * @param {string} toPhone - Recipient phone number (E.164 format, e.g., +919876543210)
 * @param {string} otpCode - 6-digit OTP code
 * @returns {{ success: boolean, mode: string, sid?: string, error?: string }}
 */
export async function sendSmsOtp(toPhone, otpCode) {
  const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const authToken  = (process.env.TWILIO_AUTH_TOKEN  || '').trim();
  const fromPhone  = (process.env.TWILIO_PHONE_NUMBER || '').trim();

  const hasTwilio =
    accountSid && !accountSid.includes('your-') &&
    authToken   && !authToken.includes('your-')  &&
    fromPhone   && fromPhone.startsWith('+');

  const message = `Your CampusGig verification code is: ${otpCode}\n\nDo not share this code with anyone. Valid for 10 minutes.\n\n— CampusGig Student Marketplace`;

  if (hasTwilio) {
    try {
      // Dynamic import to allow module loading even if Twilio isn't configured
      const twilio = (await import('twilio')).default;
      const client = twilio(accountSid, authToken);

      // Normalize phone to E.164: ensure it starts with +
      let normalizedPhone = toPhone.trim().replace(/[\s\-().]/g, '');
      if (!normalizedPhone.startsWith('+')) {
        // Auto-prefix with +91 for Indian numbers (10-digit)
        if (normalizedPhone.length === 10) {
          normalizedPhone = '+91' + normalizedPhone;
        } else {
          normalizedPhone = '+' + normalizedPhone;
        }
      }

      const msg = await client.messages.create({
        body: message,
        from: fromPhone,
        to: normalizedPhone
      });

      console.log(`📱 [Twilio SMS] OTP sent to ${normalizedPhone}. SID: ${msg.sid}`);
      return { success: true, mode: 'twilio', sid: msg.sid };

    } catch (err) {
      console.error(`❌ [Twilio SMS Error] Failed to send to ${toPhone}: ${err.message}`);
      // Log OTP to server console as fallback (dev/debug)
      console.log(`🔑 [Server Fallback OTP] Code for ${toPhone}: 👉 [ ${otpCode} ] 👈`);
      return { success: false, mode: 'twilio_error', error: err.message };
    }
  } else {
    // Twilio not configured — log to console (dev/testing mode)
    console.log('⚠️  [Twilio Not Configured] Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to backend/.env');
    console.log(`🔑 [Dev/Test OTP] Code for ${toPhone}: 👉 [ ${otpCode} ] 👈`);
    return { success: true, mode: 'dev_console', otp: otpCode };
  }
}

export default { sendSmsOtp };
