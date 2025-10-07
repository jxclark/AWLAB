import { Request, Response, NextFunction } from 'express';
import { Role } from '../generated/prisma';

/**
 * Middleware to check if user has required role
 * Must be used after authenticateToken middleware
 */
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          error: 'Authentication required',
        });
      }

      const userRole = user.role as Role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          error: 'Access denied. Insufficient permissions.',
          required: allowedRoles,
          current: userRole,
        });
      }

      next();
    } catch (error: any) {
      return res.status(500).json({
        error: 'Authorization check failed',
      });
    }
  };
};

/**
 * Middleware to check if user is Super Admin
 */
export const requireSuperAdmin = requireRole(Role.SUPER_ADMIN);

/**
 * Middleware to check if user is Admin or Super Admin
 */
export const requireAdmin = requireRole(Role.SUPER_ADMIN, Role.ADMIN);

/**
 * Middleware to check if user is Manager, Admin, or Super Admin
 */
export const requireManager = requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER);

/**
 * Check if user has permission to access resource
 * Allows users to access their own resources, or admins to access any
 */
export const canAccessResource = (resourceUserId: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          error: 'Authentication required',
        });
      }

      const userRole = user.role as Role;
      const adminRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN];
      const isAdmin = adminRoles.includes(userRole);
      const isOwner = user.userId === resourceUserId;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          error: 'Access denied. You can only access your own resources.',
        });
      }

      next();
    } catch (error: any) {
      return res.status(500).json({
        error: 'Authorization check failed',
      });
    }
  };
};
