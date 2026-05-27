let twilio;
try {
  twilio = require('twilio');
} catch (e) {
  twilio = null;
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = (twilio && accountSid && authToken) ? twilio(accountSid, authToken) : null;

/**
 * Dispatches a real SMS via Twilio or falls back to standard developer logs.
 * @param {string} to Phone number in E.164 format
 * @param {string} body Text content
 */
const sendSMS = async (to, body) => {
  if (client && twilioPhone) {
    try {
      const message = await client.messages.create({
        body,
        from: twilioPhone,
        to
      });
      console.log(`[SMS SUCCESS] Dispatched Twilio SMS to ${to}. SID: ${message.sid}`);
      return message;
    } catch (err) {
      console.error(`[SMS FAILED] Twilio delivery exception to ${to}:`, err.message);
      throw err;
    }
  } else {
    // Sandbox fallbacks
    console.log(`\n📲 ================= MOCK SMS DISPATCH =================`);
    console.log(`   TO:       ${to}`);
    console.log(`   BODY:     ${body}`);
    console.log(`   STATUS:   [SANDBOX SIMULATION COMPLETED SUCCESSFULLY]`);
    console.log(`========================================================\n`);
    return { sid: 'mock_sms_sid_' + Math.random().toString(36).substring(2, 10) };
  }
};

/**
 * Sends highly optimized OTP SMS messages.
 * @param {string} to 
 * @param {string} otp 
 */
const sendSMSOTP = async (to, otp) => {
  const messageText = `Your Freshnaps Verification OTP is ${otp}. Valid for 5 minutes. Please do not share this code.`;
  return await sendSMS(to, messageText);
};

module.exports = {
  sendSMS,
  sendSMSOTP
};
