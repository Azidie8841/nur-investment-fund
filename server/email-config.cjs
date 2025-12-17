const nodemailer = require('nodemailer');

// Gmail SMTP configuration
// Use your Gmail email and App Password (not your regular password)
// Guide: https://support.google.com/accounts/answer/185833

console.log('📧 Loading Gmail configuration...');
console.log('   GMAIL_USER:', process.env.GMAIL_USER);
console.log('   GMAIL_APP_PASSWORD length:', process.env.GMAIL_APP_PASSWORD?.length || 0);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'your-email@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
  }
});

// Verify connection configuration (non-blocking)
try {
  transporter.verify((error, success) => {
    if (error) {
      console.log('⚠️  Gmail connection failed');
      console.log('   Error:', error.message);
      console.log('   Make sure to:');
      console.log('   1. Enable 2-Factor Authentication on your Gmail account');
      console.log('   2. Generate an App Password: https://myaccount.google.com/apppasswords');
      console.log('   3. Set environment variables:');
      console.log('      - GMAIL_USER=your-email@gmail.com');
      console.log('      - GMAIL_APP_PASSWORD=your-16-char-password');
    } else {
      console.log('✓ Gmail SMTP connection ready');
    }
  });
} catch (err) {
  console.log('⚠️  Gmail configuration skipped (optional feature)');
}

module.exports = transporter;

