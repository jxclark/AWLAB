import { Device } from '../generated/prisma';
import prisma from '../config/database';
import { parseDeviceInfo } from '../utils/deviceFingerprint';

/**
 * Track or update device for user
 */
export const trackDevice = async (
  userId: string,
  userAgent: string | undefined,
  ipAddress: string | undefined
): Promise<Device> => {
  const deviceInfo = parseDeviceInfo(userAgent, ipAddress);

  // Check if device already exists
  const existingDevice = await prisma.device.findUnique({
    where: { fingerprint: deviceInfo.fingerprint },
  });

  if (existingDevice) {
    // Update last seen
    return await prisma.device.update({
      where: { id: existingDevice.id },
      data: {
        lastSeenAt: new Date(),
        ipAddress: deviceInfo.ipAddress,
      },
    });
  }

  // Create new device
  return await prisma.device.create({
    data: {
      userId,
      fingerprint: deviceInfo.fingerprint,
      deviceName: deviceInfo.deviceName,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      browserVersion: deviceInfo.browserVersion,
      os: deviceInfo.os,
      osVersion: deviceInfo.osVersion,
      ipAddress: deviceInfo.ipAddress,
    },
  });
};

/**
 * Get all devices for a user
 */
export const getUserDevices = async (userId: string): Promise<Device[]> => {
  return await prisma.device.findMany({
    where: { userId },
    orderBy: { lastSeenAt: 'desc' },
  });
};

/**
 * Get device by ID
 */
export const getDeviceById = async (deviceId: string): Promise<Device | null> => {
  return await prisma.device.findUnique({
    where: { id: deviceId },
  });
};

/**
 * Trust a device
 */
export const trustDevice = async (deviceId: string): Promise<Device> => {
  return await prisma.device.update({
    where: { id: deviceId },
    data: { isTrusted: true },
  });
};

/**
 * Untrust a device
 */
export const untrustDevice = async (deviceId: string): Promise<Device> => {
  return await prisma.device.update({
    where: { id: deviceId },
    data: { isTrusted: false },
  });
};

/**
 * Remove a device
 */
export const removeDevice = async (deviceId: string, userId: string): Promise<void> => {
  const device = await prisma.device.findFirst({
    where: {
      id: deviceId,
      userId,
    },
  });

  if (!device) {
    throw new Error('Device not found or access denied');
  }

  await prisma.device.delete({
    where: { id: deviceId },
  });
};

/**
 * Get device statistics
 */
export const getDeviceStats = async (userId?: string) => {
  const where: any = {};
  if (userId) {
    where.userId = userId;
  }

  const total = await prisma.device.count({ where });
  const trusted = await prisma.device.count({
    where: { ...where, isTrusted: true },
  });

  const byType = await prisma.device.groupBy({
    by: ['deviceType'],
    where,
    _count: true,
  });

  return {
    total,
    trusted,
    untrusted: total - trusted,
    byType: byType.map(d => ({ type: d.deviceType, count: d._count })),
  };
};

/**
 * Clean up old devices (not seen in 90 days)
 */
export const cleanupOldDevices = async (daysInactive: number = 90): Promise<number> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

  const result = await prisma.device.deleteMany({
    where: {
      lastSeenAt: {
        lt: cutoffDate,
      },
      isTrusted: false, // Don't delete trusted devices
    },
  });

  return result.count;
};
