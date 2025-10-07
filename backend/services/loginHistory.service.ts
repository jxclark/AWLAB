import { LoginHistory } from '../generated/prisma';
import prisma from '../config/database';

export interface LoginHistoryQuery {
  userId?: string;
  page?: number;
  limit?: number;
  success?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface LoginHistoryResponse {
  history: LoginHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Log login attempt
 */
export const logLoginAttempt = async (
  userId: string,
  ipAddress: string | undefined,
  userAgent: string | undefined,
  success: boolean,
  failReason?: string
): Promise<void> => {
  await prisma.loginHistory.create({
    data: {
      userId,
      ipAddress,
      userAgent,
      success,
      failReason,
    },
  });

  // Update user's last login info if successful
  if (success) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });
  }
};

/**
 * Get login history for a user
 */
export const getUserLoginHistory = async (
  userId: string,
  query: LoginHistoryQuery
): Promise<LoginHistoryResponse> => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = { userId };

  if (query.success !== undefined) {
    where.success = query.success;
  }

  if (query.startDate || query.endDate) {
    where.createdAt = {};
    if (query.startDate) {
      where.createdAt.gte = query.startDate;
    }
    if (query.endDate) {
      where.createdAt.lte = query.endDate;
    }
  }

  const total = await prisma.loginHistory.count({ where });

  const history = await prisma.loginHistory.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    history,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get all login history (admin only)
 */
export const getAllLoginHistory = async (query: LoginHistoryQuery): Promise<LoginHistoryResponse> => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.userId) {
    where.userId = query.userId;
  }

  if (query.success !== undefined) {
    where.success = query.success;
  }

  if (query.startDate || query.endDate) {
    where.createdAt = {};
    if (query.startDate) {
      where.createdAt.gte = query.startDate;
    }
    if (query.endDate) {
      where.createdAt.lte = query.endDate;
    }
  }

  const total = await prisma.loginHistory.count({ where });

  const history = await prisma.loginHistory.findMany({
    where,
    skip,
    take: limit,
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

  return {
    history: history as any,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get login statistics
 */
export const getLoginStats = async (userId?: string) => {
  const where: any = {};
  if (userId) {
    where.userId = userId;
  }

  const total = await prisma.loginHistory.count({ where });
  const successful = await prisma.loginHistory.count({
    where: { ...where, success: true },
  });
  const failed = await prisma.loginHistory.count({
    where: { ...where, success: false },
  });

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentLogins = await prisma.loginHistory.count({
    where: {
      ...where,
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
  });

  return {
    total,
    successful,
    failed,
    successRate: total > 0 ? ((successful / total) * 100).toFixed(2) : '0',
    recentLogins,
  };
};

/**
 * Delete old login history (cleanup)
 */
export const cleanupOldLoginHistory = async (daysToKeep: number = 90): Promise<number> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.loginHistory.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
};
