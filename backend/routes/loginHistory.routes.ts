import { Router } from 'express';
import * as loginHistoryController from '../controllers/loginHistory.controller';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

// All login history routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/login-history/stats
 * @desc    Get login statistics
 * @access  Private
 */
router.get('/stats', loginHistoryController.getLoginStats);

/**
 * @route   GET /api/login-history/all
 * @desc    Get all login history (admin only)
 * @access  Private (Admin+)
 */
router.get('/all', requireAdmin, loginHistoryController.getAllLoginHistory);

/**
 * @route   GET /api/login-history
 * @desc    Get current user's login history
 * @access  Private
 */
router.get('/', loginHistoryController.getUserLoginHistory);

/**
 * @route   POST /api/login-history/cleanup
 * @desc    Clean up old login history
 * @access  Private (Admin+)
 */
router.post('/cleanup', requireAdmin, loginHistoryController.cleanupOldLoginHistory);

export default router;
