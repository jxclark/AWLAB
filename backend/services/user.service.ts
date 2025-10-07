import { User, Role } from '../generated/prisma';
import prisma from '../config/database';

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
  sortBy?: 'createdAt' | 'email' | 'firstName' | 'lastName';
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: Omit<User, 'password'>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: Role;
  isActive?: boolean;
}

/**
 * Get all users with pagination and filters
 */
export const getAllUsers = async (query: UserListQuery): Promise<UserListResponse> => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (query.search) {
    where.OR = [
      { email: { contains: query.search, mode: 'insensitive' } },
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.role) {
    where.role = query.role;
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  // Get total count
  const total = await prisma.user.count({ where });

  // Get users
  const users = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      isEmailVerified: true,
      lastLoginAt: true,
      lastLoginIp: true,
      createdAt: true,
      updatedAt: true,
      password: false,
    },
  });

  return {
    users: users as Omit<User, 'password'>[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<Omit<User, 'password'> | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      isEmailVerified: true,
      lastLoginAt: true,
      lastLoginIp: true,
      failedLoginAttempts: true,
      lockedUntil: true,
      createdAt: true,
      updatedAt: true,
      password: false,
    },
  });

  return user as Omit<User, 'password'> | null;
};

/**
 * Update user
 */
export const updateUser = async (
  userId: string,
  data: UpdateUserInput
): Promise<Omit<User, 'password'>> => {
  // Check if email is being changed and if it's already taken
  if (data.email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      throw new Error('Email is already in use');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      isEmailVerified: true,
      lastLoginAt: true,
      lastLoginIp: true,
      createdAt: true,
      updatedAt: true,
      password: false,
    },
  });

  return user as Omit<User, 'password'>;
};

/**
 * Delete user (soft delete - deactivate)
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });
};

/**
 * Permanently delete user
 */
export const permanentlyDeleteUser = async (userId: string): Promise<void> => {
  await prisma.user.delete({
    where: { id: userId },
  });
};

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, role: Role): Promise<Omit<User, 'password'>> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      isEmailVerified: true,
      lastLoginAt: true,
      lastLoginIp: true,
      createdAt: true,
      updatedAt: true,
      password: false,
    },
  });

  return user as Omit<User, 'password'>;
};

/**
 * Activate/Deactivate user
 */
export const toggleUserStatus = async (userId: string, isActive: boolean): Promise<Omit<User, 'password'>> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      isEmailVerified: true,
      lastLoginAt: true,
      lastLoginIp: true,
      createdAt: true,
      updatedAt: true,
      password: false,
    },
  });

  return user as Omit<User, 'password'>;
};

/**
 * Get user statistics
 */
export const getUserStats = async () => {
  const total = await prisma.user.count();
  const active = await prisma.user.count({ where: { isActive: true } });
  const verified = await prisma.user.count({ where: { isEmailVerified: true } });
  
  const byRole = await prisma.user.groupBy({
    by: ['role'],
    _count: true,
  });

  return {
    total,
    active,
    inactive: total - active,
    verified,
    unverified: total - verified,
    byRole: byRole.map(r => ({ role: r.role, count: r._count })),
  };
};
