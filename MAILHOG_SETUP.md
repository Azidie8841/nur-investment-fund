# Email Report Setup - Mailhog Integration

## Overview
The "Send Email Report" button now sends actual emails using **Mailhog**, a local SMTP testing tool that catches all emails without actually sending them.

## Setup Instructions

### Step 1: Download Mailhog
Mailhog is a standalone executable that doesn't require installation.

1. Visit: https://github.com/mailhog/MailHog/releases
2. Download the latest release for Windows:
   - `MailHog_windows_amd64.exe` (for 64-bit Windows)
   - Save it anywhere convenient (e.g., `C:\MailHog\`)

### Step 2: Start Mailhog
Run the MailHog executable:
```
MailHog_windows_amd64.exe
```

You should see output like:
```
2025/12/08 14:30:45 Using in-memory storage
2025/12/08 14:30:45 [SMTP] Binding to address: 0.0.0.0:1025
2025/12/08 14:30:45 [HTTP] Binding to address: 0.0.0.0:8025
2025/12/08 14:30:45 Serving under http://0.0.0.0:8025/
```

Mailhog runs on two ports:
- **SMTP Server**: `localhost:1025` (where your app sends emails)
- **Web UI**: `http://localhost:8025` (where you view emails)

### Step 3: Start the Application
In a separate terminal, start your application:
```
npm start
```

The servers should be running:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Mailhog UI: `http://localhost:8025` ← View sent emails here

### Step 4: Send an Email Report
1. Open the app at `http://localhost:5173`
2. Navigate to: **Financial > Savings > Savings Records**
3. Click the **"Send Email Report"** button
4. You'll get a success alert with the email details
5. Go to `http://localhost:8025` to see the email in Mailhog

## How It Works

### Email Configuration
- Located in: `server/email-config.cjs`
- Uses Mailhog SMTP server on `localhost:1025`
- Accepts any email address (it's just for testing)

### Email Endpoint
- **Endpoint**: `POST http://localhost:5000/api/reports/savings-email`
- **Function**: Fetches all savings records, generates HTML report, sends via email
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Email report sent successfully!",
    "recordCount": 10,
    "totalSavings": 2515.75,
    "sentTo": "family@example.com"
  }
  ```

### Email Report Contents
The email includes:
- Header with fund name and date
- Summary statistics (total records, total savings)
- Detailed table of all savings records
- Footer with timestamp

## Troubleshooting

### Error: "Mailhog not running"
**Solution**: Make sure MailHog_windows_amd64.exe is running in a terminal window

### Error: "ECONNREFUSED"
**Solution**: Mailhog isn't listening on port 1025. Check if it's running and restart if needed.

### Can't access Mailhog UI
**Solution**: Open `http://localhost:1025` in your browser (the port must match Mailhog's port)

### Email not appearing in Mailhog
**Solution**: 
1. Check the backend console for error messages
2. Make sure Mailhog was started before sending the email
3. Try again - sometimes Mailhog needs a moment to process

## Files Modified
- `server/index.cjs` - Updated email endpoint to send via Mailhog
- `server/email-config.cjs` - New Mailhog configuration file
- `package.json` - Added nodemailer dependency

## Next Steps
- Test sending multiple reports
- Check email formatting in Mailhog UI
- Ready to integrate with production email service (SendGrid, AWS SES, etc.)
