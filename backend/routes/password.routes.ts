import { Router } from 'express';
import { body } from 'express-validator';
import * as passwordController from '../controllers/password.controller';
import { authenticateToken } from '../middleware/auth';
import { passwordResetRateLimiter, emailVerificationRateLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  [body('email').isEmail().withMessage('Valid email is required')],
  passwordController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  passwordController.resetPassword
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (when logged in)
 * @access  Private
 */
router.post(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  passwordController.changePassword
);

/**
 * @route   POST /api/auth/send-verification
 * @desc    Send email verification
 * @access  Private
 */
router.post('/send-verification', authenticateToken, emailVerificationRateLimiter, passwordController.sendVerification);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post(
  '/verify-email',
  [body('token').notEmpty().withMessage('Verification token is required')],
  passwordController.verifyEmail
);

export default router;
