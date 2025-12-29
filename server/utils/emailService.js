const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create Transporter
    // For Production: Use SendGrid, SES, or proper SMTP
    // For Dev: Use Ethereal or just standard SMTP if env vars provided

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    // If no SMTP creds, log only (Mock Mode)
    if (!process.env.SMTP_EMAIL) {
        console.log('----------------------------------------------------');
        console.log('⚠️ No SMTP Credentials found. Mocking Email Send.');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        console.log('----------------------------------------------------');
        return;
    }

    const message = {
        from: `${process.env.FROM_NAME || 'API Hub'} <${process.env.FROM_EMAIL || 'noreply@apihub.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html // Optional HTML body
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
