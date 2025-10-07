import crypto from 'crypto';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from './email.service';

/**
 * Generate random token
 */
const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Request password reset (forgot password)
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Don't reveal if user exists or not (security best practice)
  if (!user) {
    return;
  }

  // Generate reset token
  const resetToken = generateToken();
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Save token to database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpiry: resetExpiry,
    },
  });

  // Send reset email
  await sendPasswordResetEmail(user.email, user.firstName, resetToken);
};

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  // Find user with valid token
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpiry: {
        gt: new Date(), // Token not expired
      },
    },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  // Check password history (prevent reuse of last 5 passwords)
  const passwordHistory = await prisma.passwordHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  for (const oldPassword of passwordHistory) {
    const isSamePassword = await comparePassword(newPassword, oldPassword.password);
    if (isSamePassword) {
      throw new Error('Cannot reuse a recent password. Please choose a different password.');
    }
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Save old password to history
  await prisma.passwordHistory.create({
    data: {
      userId: user.id,
      password: user.password,
    },
  });

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null,
      failedLoginAttempts: 0, // Reset failed attempts
      lockedUntil: null, // Unlock account if locked
    },
  });
};

/**
 * Change password (when logged in)
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Check password history
  const passwordHistory = await prisma.passwordHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  for (const oldPassword of passwordHistory) {
    const isSamePassword = await comparePassword(newPassword, oldPassword.password);
    if (isSamePassword) {
      throw new Error('Cannot reuse a recent password. Please choose a different password.');
    }
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Save old password to history
  await prisma.passwordHistory.create({
    data: {
      userId: user.id,
      password: user.password,
    },
  });

  // Update password and clear mustChangePassword flag
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      mustChangePassword: false, // Clear temporary password flag
    },
  });
};

/**
 * Send email verification
 */
export const sendEmailVerification = async (userId: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.isEmailVerified) {
    throw new Error('Email is already verified');
  }

  // Generate verification token
  const verificationToken = generateToken();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Save token to database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
    },
  });

  // Send verification email
  await sendVerificationEmail(user.email, user.firstName, verificationToken);
};

/**
 * Verify email with token
 */
export const verifyEmail = async (token: string): Promise<void> => {
  // Find user with valid token
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpiry: {
        gt: new Date(), // Token not expired
      },
    },
  });

  if (!user) {
    throw new Error('Invalid or expired verification token');
  }

  // Mark email as verified and clear token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    },
  });

  // Send welcome email
  await sendWelcomeEmail(user.email, user.firstName);
};
