import { User, Role } from '../generated/prisma';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { logLoginAttempt } from './loginHistory.service';
import { sendAccountLockedEmail } from './email.service';
import { trackDevice } from './deviceTracking.service';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
}

export interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

/**
 * Register a new user
 */
export const registerUser = async (data: RegisterInput): Promise<AuthResponse> => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || Role.USER,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Store refresh token in database
  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

/**
 * Login user
 */
export const loginUser = async (data: LoginInput): Promise<AuthResponse> => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    // Log failed attempt (user not found)
    throw new Error('Invalid email or password');
  }

  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    await logLoginAttempt(user.id, data.ipAddress, data.userAgent, false, 'Account locked');
    throw new Error(`Account is locked. Please try again in ${remainingTime} minutes.`);
  }

  // Check if user is active
  if (!user.isActive) {
    await logLoginAttempt(user.id, data.ipAddress, data.userAgent, false, 'Account deactivated');
    throw new Error('Account is deactivated. Please contact administrator.');
  }

  // Verify password
  const isPasswordValid = await comparePassword(data.password, user.password);

  if (!isPasswordValid) {
    // Increment failed login attempts
    const failedAttempts = user.failedLoginAttempts + 1;
    
    // Lock account if max attempts reached
    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil: lockUntil,
        },
      });

      await logLoginAttempt(user.id, data.ipAddress, data.userAgent, false, 'Account locked due to max attempts');
      
      // Send account locked email
      await sendAccountLockedEmail(user.email, user.firstName, lockUntil);
      
      throw new Error('Account locked due to too many failed login attempts. Check your email for details.');
    } else {
      // Update failed attempts count
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
        },
      });

      await logLoginAttempt(user.id, data.ipAddress, data.userAgent, false, 'Invalid password');
      
      const attemptsLeft = MAX_FAILED_ATTEMPTS - failedAttempts;
      throw new Error(`Invalid email or password. ${attemptsLeft} attempt(s) remaining.`);
    }
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Store refresh token in database
  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // Reset failed login attempts on successful login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  // Log successful login
  await logLoginAttempt(user.id, data.ipAddress, data.userAgent, true);

  // Track device
  await trackDevice(user.id, data.userAgent, data.ipAddress);

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

/**
 * Logout user (invalidate refresh token)
 */
export const logoutUser = async (token: string): Promise<void> => {
  await prisma.session.delete({
    where: { token },
  });
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<Omit<User, 'password'> | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  // Verify refresh token exists in database
  const session = await prisma.session.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!session) {
    throw new Error('Invalid refresh token');
  }

  // Check if token is expired
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token: refreshToken } });
    throw new Error('Refresh token expired');
  }

  // Generate new access token
  const accessToken = generateAccessToken({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
  });

  return { accessToken };
};
