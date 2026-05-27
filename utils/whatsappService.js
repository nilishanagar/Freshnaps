const axios = require('axios');

const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Dispatches a WhatsApp Template Message via Meta Graph API.
 * @param {string} to Phone number with country code (no '+' prefix for Meta API)
 * @param {string} templateName Meta Template Name
 * @param {Array} parameters Array of parameter values: [{ type: 'text', text: 'val' }]
 */
const sendWhatsAppTemplate = async (to, templateName, parameters = []) => {
  // Clean phone number: remove non-digits
  const cleanPhone = to.replace(/\D/g, '');

  if (whatsappToken && phoneNumberId) {
    try {
      const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'en_US'
          },
          components: [
            {
              type: 'body',
              parameters: parameters
            }
          ]
        }
      };

      const res = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`[WHATSAPP SUCCESS] Dispatched Meta WhatsApp Template to ${cleanPhone}. Message ID: ${res.data?.messages?.[0]?.id}`);
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.message;
      console.error(`[WHATSAPP FAILED] Meta API delivery exception to ${cleanPhone}:`, errMsg);
      throw new Error(`WhatsApp API Error: ${errMsg}`);
    }
  } else {
    // Sandbox Mock Mode fallback
    console.log(`\n💬 ============= MOCK WHATSAPP DISPATCH =============`);
    console.log(`   TO:         +${cleanPhone}`);
    console.log(`   TEMPLATE:   ${templateName}`);
    console.log(`   PARAMETERS: ${JSON.stringify(parameters.map(p => p.text))}`);
    console.log(`   STATUS:     [SANDBOX SIMULATION COMPLETED SUCCESSFULLY]`);
    console.log(`=====================================================\n`);
    return { messages: [{ id: 'mock_whatsapp_msg_id_' + Math.random().toString(36).substring(2, 10) }] };
  }
};

/**
 * Sends OTP verification WhatsApp messages.
 * @param {string} to 
 * @param {string} otp 
 */
const sendWhatsAppOTP = async (to, otp) => {
  const params = [
    { type: 'text', text: otp }
  ];
  return await sendWhatsAppTemplate(to, 'freshnaps_verification_otp', params);
};

module.exports = {
  sendWhatsAppTemplate,
  sendWhatsAppOTP
};
