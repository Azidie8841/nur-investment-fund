const nodemailer = require('nodemailer');

// Mailhog SMTP configuration
// Mailhog runs on localhost:1025 for SMTP
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025,
  secure: false, // Mailhog doesn't use TLS
  auth: {
    user: 'test@example.com', // Mailhog accepts any credentials
    pass: 'password'
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('⚠️  Mailhog not connected. Make sure it\'s running on localhost:1025');
    console.log('   Download: https://github.com/mailhog/MailHog/releases');
    console.log('   Run: ./MailHog (then visit http://localhost:1025)');
  } else {
    console.log('✓ Mailhog SMTP connection ready');
  }
});

module.exports = transporter;
