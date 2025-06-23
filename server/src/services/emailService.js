import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email
export const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email sending failed:", error);

    // In development, log the email instead of throwing
    if (process.env.NODE_ENV === "development") {
      console.log("📧 Email (Development Mode):");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${text}`);
      console.log("---");

      return {
        success: true,
        messageId: "dev-mode-" + Date.now(),
      };
    }

    throw error;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (user) => {
  const subject = "Welcome to Node-Robust-Auth!";
  const text = `
    Welcome ${user.firstName}!
    
    Your account has been created successfully. Please verify your email address to get started.
    
    If you have any questions, please don't hesitate to contact us.
    
    Best regards,
    The Node-Robust-Auth Team
  `;

  return sendEmail(user.email, subject, text);
};

// Send password reset email
export const sendPasswordResetEmail = async (user, resetUrl) => {
  const subject = "Password Reset Request";
  const text = `
    Hi ${user.firstName},
    
    You requested a password reset for your account.
    
    Click the link below to reset your password:
    ${resetUrl}
    
    This link will expire in 30 minutes.
    
    If you didn't request this reset, please ignore this email.
    
    Best regards,
    The Node-Robust-Auth Team
  `;

  return sendEmail(user.email, subject, text);
};

// Send email verification
export const sendEmailVerification = async (user, verificationUrl) => {
  const subject = "Please Verify Your Email";
  const text = `
    Hi ${user.firstName},
    
    Please verify your email address by clicking the link below:
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    Best regards,
    The Node-Robust-Auth Team
  `;

  return sendEmail(user.email, subject, text);
};

// Send security alert
export const sendSecurityAlert = async (user, alertType, details) => {
  const subject = "Security Alert - Node-Robust-Auth";

  let text = `Hi ${user.firstName},\n\n`;

  switch (alertType) {
    case "login_from_new_device":
      text += `We detected a login to your account from a new device.\n\nDetails:\n${details}\n\nIf this wasn't you, please secure your account immediately.`;
      break;
    case "password_changed":
      text += `Your password was successfully changed.\n\nIf you didn't make this change, please contact us immediately.`;
      break;
    case "2fa_enabled":
      text += `Two-factor authentication has been enabled on your account.\n\nYour account is now more secure!`;
      break;
    case "2fa_disabled":
      text += `Two-factor authentication has been disabled on your account.\n\nIf you didn't make this change, please secure your account immediately.`;
      break;
    default:
      text += `There was a security-related change to your account.\n\nDetails:\n${details}`;
  }

  text += `\n\nBest regards,\nThe Node-Robust-Auth Team`;

  return sendEmail(user.email, subject, text);
};
