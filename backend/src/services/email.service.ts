import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send email
 */
export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    console.log(`✅ Email sent to ${options.to}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (email: string, firstName: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Welcome to RosterPro!',
    html: `
      <h1>Welcome to RosterPro, ${firstName}!</h1>
      <p>Thank you for signing up. We're excited to have you on board!</p>
      <p>You can now start managing your team's rosters efficiently.</p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <br>
      <p>Best regards,</p>
      <p>The RosterPro Team</p>
    `,
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset Request</h1>
      <p>Hi ${firstName},</p>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <br>
      <p>Best regards,</p>
      <p>The RosterPro Team</p>
    `,
  });
};

/**
 * Send shift assignment notification
 */
export const sendShiftAssignmentEmail = async (
  email: string,
  firstName: string,
  shiftDetails: {
    title: string;
    startTime: Date;
    endTime: Date;
    location?: string;
  }
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'New Shift Assignment',
    html: `
      <h1>New Shift Assignment</h1>
      <p>Hi ${firstName},</p>
      <p>You have been assigned to a new shift:</p>
      <ul>
        <li><strong>Shift:</strong> ${shiftDetails.title}</li>
        <li><strong>Start:</strong> ${shiftDetails.startTime.toLocaleString()}</li>
        <li><strong>End:</strong> ${shiftDetails.endTime.toLocaleString()}</li>
        ${shiftDetails.location ? `<li><strong>Location:</strong> ${shiftDetails.location}</li>` : ''}
      </ul>
      <p>Please make sure you're available for this shift.</p>
      <br>
      <p>Best regards,</p>
      <p>The RosterPro Team</p>
    `,
  });
};

/**
 * Send roster published notification
 */
export const sendRosterPublishedEmail = async (
  email: string,
  firstName: string,
  rosterTitle: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'New Roster Published',
    html: `
      <h1>New Roster Published</h1>
      <p>Hi ${firstName},</p>
      <p>A new roster has been published: <strong>${rosterTitle}</strong></p>
      <p>Log in to view your assigned shifts.</p>
      <br>
      <p>Best regards,</p>
      <p>The RosterPro Team</p>
    `,
  });
};

