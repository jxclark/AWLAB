import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as passwordService from '../services/password.service';
import { validatePasswordStrength } from '../utils/password';

/**
 * Request password reset (forgot password)
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    await passwordService.requestPasswordReset(email);

    // Always return success (don't reveal if email exists)
    res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Failed to process password reset request',
    });
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, newPassword } = req.body;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Weak password',
        details: passwordValidation.errors,
      });
    }

    await passwordService.resetPassword(token, newPassword);

    res.status(200).json({
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(400).json({
      error: error.message || 'Failed to reset password',
    });
  }
};

/**
 * Change password (when logged in)
 * POST /api/auth/change-password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Weak password',
        details: passwordValidation.errors,
      });
    }

    await passwordService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(400).json({
      error: error.message || 'Failed to change password',
    });
  }
};

/**
 * Send email verification
 * POST /api/auth/send-verification
 */
export const sendVerification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await passwordService.sendEmailVerification(userId);

    res.status(200).json({
      message: 'Verification email sent successfully',
    });
  } catch (error: any) {
    console.error('Send verification error:', error);
    res.status(400).json({
      error: error.message || 'Failed to send verification email',
    });
  }
};

/**
 * Verify email with token
 * POST /api/auth/verify-email
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;

    await passwordService.verifyEmail(token);

    res.status(200).json({
      message: 'Email verified successfully. Welcome!',
    });
  } catch (error: any) {
    console.error('Verify email error:', error);
    res.status(400).json({
      error: error.message || 'Failed to verify email',
    });
  }
};
