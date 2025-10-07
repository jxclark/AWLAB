import { Router } from 'express';
import * as trashController from '../controllers/trash.controller';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

// All trash routes require admin authentication
router.use(authenticateToken, requireAdmin);

/**
 * @route   GET /api/trash
 * @desc    Get all files in trash
 * @access  Private (Admin+)
 */
router.get('/', trashController.getTrashFiles);

/**
 * @route   POST /api/trash/restore
 * @desc    Restore file from trash
 * @access  Private (Admin+)
 */
router.post('/restore', trashController.restoreFile);

/**
 * @route   DELETE /api/trash/:timestamp/:originalFolder/:originalFileName
 * @desc    Permanently delete file from trash
 * @access  Private (Admin+)
 */
router.delete('/:timestamp/:originalFolder/:originalFileName', trashController.permanentlyDeleteFile);

export default router;
