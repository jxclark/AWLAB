import { Request, Response } from 'express';
import * as loginHistoryService from '../services/loginHistory.service';

/**
 * Get current user's login history
 * GET /api/login-history
 */
export const getUserLoginHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      success: req.query.success === 'true' ? true : req.query.success === 'false' ? false : undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    };

    const result = await loginHistoryService.getUserLoginHistory(userId, query);

    res.status(200).json({
      message: 'Login history retrieved successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Get user login history error:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve login history',
    });
  }
};

/**
 * Get all login history (admin only)
 * GET /api/login-history/all
 */
export const getAllLoginHistory = async (req: Request, res: Response) => {
  try {
    const query = {
      userId: req.query.userId as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      success: req.query.success === 'true' ? true : req.query.success === 'false' ? false : undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    };

    const result = await loginHistoryService.getAllLoginHistory(query);

    res.status(200).json({
      message: 'Login history retrieved successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Get all login history error:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve login history',
    });
  }
};

/**
 * Get login statistics
 * GET /api/login-history/stats
 */
export const getLoginStats = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const userRole = req.user?.role;

    // Non-admins can only see their own stats
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(userRole || '');
    const targetUserId = isAdmin ? userId : req.user?.userId;

    const stats = await loginHistoryService.getLoginStats(targetUserId);

    res.status(200).json({
      data: stats,
    });
  } catch (error: any) {
    console.error('Get login stats error:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve login statistics',
    });
  }
};

/**
 * Clean up old login history (admin only)
 * POST /api/login-history/cleanup
 */
export const cleanupOldLoginHistory = async (req: Request, res: Response) => {
  try {
    const { daysToKeep } = req.body;
    const count = await loginHistoryService.cleanupOldLoginHistory(daysToKeep || 90);

    res.status(200).json({
      message: `${count} old login record(s) cleaned up`,
      count,
    });
  } catch (error: any) {
    console.error('Cleanup login history error:', error);
    res.status(500).json({
      error: error.message || 'Failed to cleanup login history',
    });
  }
};
