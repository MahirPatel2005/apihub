const getBaseStyles = () => `
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 30px; text-align: center; color: white; }
  .content { padding: 40px 30px; }
  .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
  .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  h1 { margin: 0; font-size: 24px; }
  p { margin-bottom: 20px; }
`;

const getEmailTemplate = (title, bodyContent, buttonText, buttonUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${getBaseStyles()}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${bodyContent}
      ${buttonUrl ? `<div style="text-align: center;"><a href="${buttonUrl}" class="button">${buttonText}</a></div>` : ''}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} API Hub. All rights reserved.</p>
      <p>If you did not request this email, please ignore it.</p>
    </div>
  </div>
</body>
</html>
`;

const verifyEmailTemplate = (username, url) => {
    const body = `
      <p>Hi <strong>${username}</strong>,</p>
      <p>Welcome to API Hub! We're excited to have you on board.</p>
      <p>Please verify your email address to get full access to all features, including API submission and community interactions.</p>
    `;
    return getEmailTemplate('Verify Your Email', body, 'Verify Email', url);
};

const resetPasswordTemplate = (username, url) => {
    const body = `
      <p>Hi <strong>${username}</strong>,</p>
      <p>We received a request to reset your password for your API Hub account.</p>
      <p>Click the button below to reset your password. This link will expire in 10 minutes.</p>
    `;
    return getEmailTemplate('Reset Your Password', body, 'Reset Password', url);
};

module.exports = { verifyEmailTemplate, resetPasswordTemplate };
