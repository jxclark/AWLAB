import { Session } from '../generated/prisma';
import prisma from '../config/database';

export interface SessionWithUser {
  id: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Get all active sessions for a user
 */
export const getUserSessions = async (userId: string): Promise<Session[]> => {
  const sessions = await prisma.session.findMany({
    where: {
      userId,
      expiresAt: {
        gt: new Date(), // Only active sessions
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return sessions;
};

/**
 * Get all sessions (admin only)
 */
export const getAllSessions = async (): Promise<SessionWithUser[]> => {
  const sessions = await prisma.session.findMany({
    where: {
      expiresAt: {
        gt: new Date(), // Only active sessions
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return sessions;
};

/**
 * Revoke a specific session
 */
export const revokeSession = async (sessionId: string, userId?: string): Promise<void> => {
  const where: any = { id: sessionId };
  
  // If userId provided, ensure user can only revoke their own sessions
  if (userId) {
    where.userId = userId;
  }

  const session = await prisma.session.findFirst({ where });

  if (!session) {
    throw new Error('Session not found or access denied');
  }

  await prisma.session.delete({
    where: { id: sessionId },
  });
};

/**
 * Revoke all sessions for a user (except current)
 */
export const revokeAllUserSessions = async (userId: string, exceptToken?: string): Promise<number> => {
  const where: any = { userId };

  if (exceptToken) {
    where.NOT = { token: exceptToken };
  }

  const result = await prisma.session.deleteMany({ where });

  return result.count;
};

/**
 * Clean up expired sessions
 */
export const cleanupExpiredSessions = async (): Promise<number> => {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
};

/**
 * Get session statistics
 */
export const getSessionStats = async () => {
  const total = await prisma.session.count();
  const active = await prisma.session.count({
    where: {
      expiresAt: {
        gt: new Date(),
      },
    },
  });
  const expired = total - active;

  return {
    total,
    active,
    expired,
  };
};
