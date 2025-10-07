import { Router } from 'express';
import * as sessionController from '../controllers/session.controller';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

// All session routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/sessions/stats
 * @desc    Get session statistics
 * @access  Private (Admin+)
 */
router.get('/stats', requireAdmin, sessionController.getSessionStats);

/**
 * @route   GET /api/sessions/all
 * @desc    Get all sessions (admin only)
 * @access  Private (Admin+)
 */
router.get('/all', requireAdmin, sessionController.getAllSessions);

/**
 * @route   GET /api/sessions
 * @desc    Get current user's sessions
 * @access  Private
 */
router.get('/', sessionController.getUserSessions);

/**
 * @route   DELETE /api/sessions/:id
 * @desc    Revoke a specific session
 * @access  Private
 */
router.delete('/:id', sessionController.revokeSession);

/**
 * @route   POST /api/sessions/revoke-all
 * @desc    Revoke all sessions except current
 * @access  Private
 */
router.post('/revoke-all', sessionController.revokeAllSessions);

/**
 * @route   POST /api/sessions/cleanup
 * @desc    Clean up expired sessions
 * @access  Private (Admin+)
 */
router.post('/cleanup', requireAdmin, sessionController.cleanupExpiredSessions);

export default router;
