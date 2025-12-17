/**
 * WhatsApp Report Service
 * Sends savings reports via WhatsApp using Twilio API
 * 
 * Setup Instructions:
 * 1. Install Twilio: npm install twilio
 * 2. Get Twilio credentials from https://www.twilio.com/console
 * 3. Set environment variables:
 *    - TWILIO_ACCOUNT_SID=your-account-sid
 *    - TWILIO_AUTH_TOKEN=your-auth-token
 *    - TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890 (your Twilio number)
 *    - WHATSAPP_RECIPIENT_NUMBER=whatsapp:+601234567890 (recipient number)
 */

// Check if Twilio is installed, if not provide helpful message
let twilio;
try {
  twilio = require('twilio');
} catch (error) {
  console.log('⚠️  Twilio not installed. To use WhatsApp: npm install twilio');
  twilio = null;
}

const sendSavingsReportViaWhatsApp = async (records, totalSavings) => {
  if (!twilio) {
    throw new Error('Twilio SDK not installed. Run: npm install twilio');
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  const toNumber = process.env.WHATSAPP_RECIPIENT_NUMBER;

  // Validate Twilio configuration
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
  }

  if (!fromNumber || !toNumber) {
    throw new Error('WhatsApp numbers not configured. Set TWILIO_WHATSAPP_NUMBER and WHATSAPP_RECIPIENT_NUMBER');
  }

  try {
    const client = twilio(accountSid, authToken);

    // Format message with savings data
    const today = new Date().toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' });
    const messageBody = formatWhatsAppMessage(records, totalSavings, today);

    // Send WhatsApp message
    const message = await client.messages.create({
      from: fromNumber,
      to: toNumber,
      body: messageBody
    });

    console.log(`✓ WhatsApp message sent successfully. SID: ${message.sid}`);

    return {
      success: true,
      message: 'WhatsApp report sent successfully!',
      messageSid: message.sid,
      recordCount: records.length,
      totalSavings: totalSavings,
      sentTo: toNumber,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ WhatsApp send error:', error.message);
    throw error;
  }
};

/**
 * Format message content for WhatsApp
 * WhatsApp has character limits, so we need to keep it concise
 */
const formatWhatsAppMessage = (records, totalSavings, date) => {
  const recentRecords = records.slice(0, 5); // Show only 5 most recent records
  const recordsText = recentRecords
    .map((r, idx) => `${idx + 1}. RM ${r.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} - ${r.record_date}`)
    .join('\n');

  const message = `💰 Savings Report - ${date}

📊 Total Savings: RM ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}

📝 Recent Records (Last 5):
${recordsText}

Total Records: ${records.length}

---
Nur Investment Fund - Savings & Cash Management`;

  return message;
};

module.exports = {
  sendSavingsReportViaWhatsApp,
  formatWhatsAppMessage
};
