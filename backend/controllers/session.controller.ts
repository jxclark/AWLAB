import { Request, Response } from 'express';
import * as sessionService from '../services/session.service';

/**
 * Get current user's sessions
 * GET /api/sessions
 */
export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sessions = await sessionService.getUserSessions(userId);

    res.status(200).json({
      message: 'Sessions retrieved successfully',
      data: sessions,
    });
  } catch (error: any) {
    console.error('Get user sessions error:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve sessions',
    });
  }
};

/**
 * Get all sessions (admin only)
 * GET /api/sessions/all
 */
export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await sessionService.getAllSessions();

    res.status(200).json({
      message: 'All sessions retrieved successfully',
      data: sessions,
    });
  } catch (error: any) {
    console.error('Get all sessions error:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve sessions',
    });
  }
};

/**
 * Revoke a specific session
 * DELETE /api/sessions/:id
 */
export const revokeSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Admins can revoke any session, users can only revoke their own
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(userRole || '');

    await sessionService.revokeSession(id, isAdmin ? undefined : userId);

    res.status(200).json({
      message: 'Session revoked successfully',
    });
  } catch (error: any) {
    console.error('Revoke session error:', error);
    res.status(400).json({
      error: error.message || 'Failed to revoke session',
    });
  }
};

/**
 * Revoke all sessions except current
 * POST /api/sessions/revoke-all
 */
export const revokeAllSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { exceptCurrent } = req.body;
    const currentToken = req.headers.authorization?.split(' ')[1];

    const count = await sessionService.revokeAllUserSessions(
      userId,
      exceptCurrent ? currentToken : undefined
    );

    res.status(200).json({
      message: `${count} session(s) revoked successfully`,
      count,
    });
  } catch (error: any) {
    console.error('Revoke all sessions error:', error);
    res.status(400).json({
      error: error.message || 'Failed to revoke sessions',
    });
  }
};

/**
 * Clean up expired sessions (admin only)
 * POST /api/sessions/cleanup
 */
export const cleanupExpiredSessions = async (req: Request, res: Response) => {
  try {
    const count = await sessionService.cleanupExpiredSessions();

    res.status(200).json({
      message: `${count} expired session(s) cleaned up`,
      count,
    });
  } catch (error: any) {
    console.error('Cleanup sessions error:', error);
    res.status(500).json({
      error: error.message || 'Failed to cleanup sessions',
    });
  }
};

/**
 * Get session statistics (admin only)
 * GET /api/sessions/stats
 */
export const getSessionStats = async (req: Request, res: Response) => {
  try {
    const stats = await sessionService.getSessionStats();

    res.status(200).json({
      data: stats,
    });
  } catch (error: any) {
    console.error('Get session stats error:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve session statistics',
    });
  }
};
