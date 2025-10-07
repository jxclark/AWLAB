import { Resend } from 'resend';

// Email configuration from environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY! ;
const EMAIL_FROM = process.env.EMAIL_FROM!;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize Resend client
const resend = new Resend(RESEND_API_KEY);

/**
 * Send email verification email
 */
export const sendVerificationEmail = async (
  email: string,
  firstName: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  token: string
): Promise<void> => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #DC2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .warning { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #DC2626;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <p>This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

/**
 * Send account locked notification
 */
export const sendAccountLockedEmail = async (
  email: string,
  firstName: string,
  unlockTime: Date
): Promise<void> => {
  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Account Temporarily Locked',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Account Locked</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
            <p><strong>Unlock Time:</strong> ${unlockTime.toLocaleString()}</p>
            <p>If you didn't attempt to log in, please contact support immediately as your account may be compromised.</p>
            <p>You can reset your password to unlock your account immediately.</p>
          </div>
          <div class="footer">
            <p>This is an automated security message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

/**
 * Send welcome email after verification
 */
export const sendWelcomeEmail = async (
  email: string,
  firstName: string
): Promise<void> => {
  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Welcome to Client Files Viewer!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Your email has been verified successfully. Welcome to Client Files Viewer!</p>
            <p>You can now access all features of the platform.</p>
            <p>If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
            <p>Thank you for joining us!</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

/**
 * Send new account email with credentials (for admin-created users)
 */
export const sendNewAccountEmail = async (
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  role: string
): Promise<void> => {
  const loginUrl = `${FRONTEND_URL}/login`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Your New Account - Client Files Viewer',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .credentials { background-color: #fff; border: 2px solid #4F46E5; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .warning { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Client Files Viewer!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName} ${lastName}!</h2>
            <p>An administrator has created an account for you on Client Files Viewer.</p>
            
            <div class="credentials">
              <h3>Your Login Credentials:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-size: 14px;">${password}</code></p>
              <p><strong>Role:</strong> ${role.replace('_', ' ')}</p>
            </div>

            <div class="warning">
              <strong>🔒 Security Notice:</strong>
              <p>Please change your password after your first login for security purposes.</p>
            </div>

            <a href="${loginUrl}" class="button" style="color: white; text-decoration: none;">Login to Your Account</a>

            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${loginUrl}</p>

            <p>If you have any questions or need assistance, please contact your administrator.</p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};
