import { User, Role } from '../generated/prisma';
import prisma from '../config/database';
import bcrypt from 'bcrypt';
import * as emailService from './email.service';

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
  password?: string;
  role?: Role;
  isActive?: boolean;
}

/**
 * Create new user
 */
export const createUser = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: Role;
}): Promise<Omit<User, 'password'>> => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Store plain password for email (before hashing)
  const plainPassword = data.password;

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      role: data.role || Role.USER,
      isActive: true,
      isEmailVerified: true, // Admin-created users are auto-verified
      mustChangePassword: true, // Require password change on first login
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
    },
  });

  // Send welcome email with credentials (async, don't wait)
  emailService.sendNewAccountEmail(
    user.email,
    user.firstName,
    user.lastName,
    plainPassword,
    user.role
  ).catch(err => {
    console.error('Failed to send welcome email:', err);
    // Don't throw error - user creation should succeed even if email fails
  });

  return user as Omit<User, 'password'>;
};

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

  // Hash password if provided
  const updateData: any = { ...data };
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
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
