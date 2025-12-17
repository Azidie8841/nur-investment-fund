# Gmail Email Configuration Guide

## Overview
The "Send Email Report" button now sends actual emails via Gmail SMTP server.

## Setup Steps

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the steps to enable 2FA

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Google will generate a 16-character password (spaces included)
4. Copy the password

### Step 3: Configure Environment Variables
Create a `.env` file in the project root (copy from `.env.example`):

```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
GMAIL_RECIPIENT=recipient@example.com
```

**IMPORTANT:** 
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace the app password with the 16-character password from Step 2
- Include the spaces in the app password exactly as generated
- Set the recipient email (where reports will be sent)

### Step 4: Start the Application
```
npm start
```

The server will verify Gmail connection on startup:
```
✓ Gmail SMTP connection ready
```

### Step 5: Send a Report
1. Open http://localhost:5173
2. Navigate to: **Financial > Savings > Savings Records**
3. Click **"Send Email Report"**
4. Check the recipient email inbox for the report

## Features

### Email Report Contents
- Professional HTML formatting with fund branding
- Savings records summary with totals
- Detailed table of all savings transactions
- Timestamp and report metadata

### Response Format
Success response:
```json
{
  "success": true,
  "message": "Email report sent successfully!",
  "recordCount": 10,
  "totalSavings": 2515.75,
  "sentTo": "recipient@example.com",
  "timestamp": "2025-12-08T14:35:22.123Z"
}
```

Error response:
```json
{
  "success": false,
  "error": "Gmail authentication failed",
  "instructions": "Please check your Gmail credentials and App Password"
}
```

## Troubleshooting

### Error: "Invalid login"
- Check that your Gmail address and App Password are correct in `.env`
- Verify 2-Factor Authentication is enabled
- Make sure you're using the App Password, not your regular Gmail password

### Error: "Gmail configuration missing"
- Create `.env` file with `GMAIL_USER` and `GMAIL_APP_PASSWORD`
- Restart the server with `npm start`

### Email not received
1. Check your internet connection
2. Check the spam/junk folder
3. Verify the recipient email in `.env` is correct
4. Check server logs for detailed errors

### "Less secure app access" error
- This shouldn't happen with App Passwords, but if it does:
- Visit https://myaccount.google.com/lesssecureapps
- Toggle to "Allow less secure app access" (temporary fix)

## Security Notes

- **Never commit `.env` file to git** - it contains credentials
- `.env` is already in `.gitignore` for protection
- Use `.env.example` as a template for other developers
- Regenerate app passwords if you suspect they're compromised
- Consider using environment variables in production instead of `.env` file

## Production Deployment

For production, set environment variables through your hosting platform:
- Heroku: Use Config Vars
- AWS: Use Systems Manager Parameter Store or Secrets Manager
- Azure: Use Key Vault
- Docker: Use Docker secrets or environment files

Example for Heroku:
```bash
heroku config:set GMAIL_USER=your-email@gmail.com
heroku config:set GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
heroku config:set GMAIL_RECIPIENT=recipient@example.com
```

## Files Changed
- `server/email-config.cjs` - Gmail SMTP configuration
- `server/index.cjs` - Updated email endpoint with Gmail integration
- `.env` - Configuration file (needs your credentials)
- `.env.example` - Template for `.env`
- `package.json` - Added nodemailer and dotenv dependencies
