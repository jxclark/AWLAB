import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as userService from '../services/user.service';
import { Role } from '../generated/prisma';

/**
 * Get all users with pagination and filters
 * GET /api/users
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const query = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      search: req.query.search as string,
      role: req.query.role as Role,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      sortBy: req.query.sortBy as 'createdAt' | 'email' | 'firstName' | 'lastName',
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await userService.getAllUsers(query);

    res.status(200).json({
      message: 'Users retrieved successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve users',
    });
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      data: user,
    });
  } catch (error: any) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve user',
    });
  }
};

/**
 * Update user
 * PUT /api/users/:id
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { firstName, lastName, email, role, isActive } = req.body;

    const user = await userService.updateUser(id, {
      firstName,
      lastName,
      email,
      role,
      isActive,
    });

    res.status(200).json({
      message: 'User updated successfully',
      data: user,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(400).json({
      error: error.message || 'Failed to update user',
    });
  }
};

/**
 * Delete user (soft delete)
 * DELETE /api/users/:id
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await userService.deleteUser(id);

    res.status(200).json({
      message: 'User deactivated successfully',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(400).json({
      error: error.message || 'Failed to delete user',
    });
  }
};

/**
 * Permanently delete user
 * DELETE /api/users/:id/permanent
 */
export const permanentlyDeleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await userService.permanentlyDeleteUser(id);

    res.status(200).json({
      message: 'User permanently deleted',
    });
  } catch (error: any) {
    console.error('Permanently delete user error:', error);
    res.status(400).json({
      error: error.message || 'Failed to permanently delete user',
    });
  }
};

/**
 * Update user role
 * PATCH /api/users/:id/role
 */
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { role } = req.body;

    const user = await userService.updateUserRole(id, role);

    res.status(200).json({
      message: 'User role updated successfully',
      data: user,
    });
  } catch (error: any) {
    console.error('Update user role error:', error);
    res.status(400).json({
      error: error.message || 'Failed to update user role',
    });
  }
};

/**
 * Toggle user status (activate/deactivate)
 * PATCH /api/users/:id/status
 */
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { isActive } = req.body;

    const user = await userService.toggleUserStatus(id, isActive);

    res.status(200).json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  } catch (error: any) {
    console.error('Toggle user status error:', error);
    res.status(400).json({
      error: error.message || 'Failed to update user status',
    });
  }
};

/**
 * Get user statistics
 * GET /api/users/stats
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const stats = await userService.getUserStats();

    res.status(200).json({
      data: stats,
    });
  } catch (error: any) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve user statistics',
    });
  }
};
