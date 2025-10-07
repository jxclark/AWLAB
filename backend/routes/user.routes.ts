import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, requireSuperAdmin } from '../middleware/rbac';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Private (Admin+)
 */
router.get('/stats', requireAdmin, userController.getUserStats);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filters
 * @access  Private (Admin+)
 */
router.get('/', requireAdmin, userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin+)
 */
router.get('/:id', requireAdmin, userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin+)
 */
router.put(
  '/:id',
  requireAdmin,
  [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  ],
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete - deactivate)
 * @access  Private (Admin+)
 */
router.delete('/:id', requireAdmin, userController.deleteUser);

/**
 * @route   DELETE /api/users/:id/permanent
 * @desc    Permanently delete user
 * @access  Private (Super Admin only)
 */
router.delete('/:id/permanent', requireSuperAdmin, userController.permanentlyDeleteUser);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Update user role
 * @access  Private (Super Admin only)
 */
router.patch(
  '/:id/role',
  requireSuperAdmin,
  [body('role').isIn(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER']).withMessage('Invalid role')],
  userController.updateUserRole
);

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Toggle user status (activate/deactivate)
 * @access  Private (Admin+)
 */
router.patch(
  '/:id/status',
  requireAdmin,
  [body('isActive').isBoolean().withMessage('isActive must be a boolean')],
  userController.toggleUserStatus
);

export default router;
